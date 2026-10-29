import { chat, llmEnabled } from '@/lib/llm';
import { TOOLS, EXEC } from './tools';
import { SYSTEM, LLM_ONLY } from './prompts';
import { PlanSchema } from './schema';
import { SECTIONS } from '@/lib/qloo/types';

export const parse = s => {
  const str = String(s).replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(str);
  } catch (e) {
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(str.slice(firstBrace, lastBrace + 1));
    }
    const firstBracket = str.indexOf('[');
    const lastBracket = str.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return JSON.parse(str.slice(firstBracket, lastBracket + 1));
    }
    throw e;
  }
};

// Formats a tool call into a meaningful, human-readable question being asked to Qloo
function formatQlooQuestion(toolName, args, entities, destination) {
  const sampleNames = (entities || []).slice(0, 2).map(e => e.name).join(' & ');
  const entityDesc = sampleNames ? `your affinity for ${sampleNames}` : 'your cultural profile';

  switch (toolName) {
    case 'get_recommendations': {
      const type = (args.entityType || '').toLowerCase();
      if (type.includes('place') || type.includes('eat')) {
        return `🍽️ Asking Qloo: "Which dining spots, cafes & bars in ${destination} resonate with ${entityDesc}?"`;
      }
      if (type.includes('locality') || type.includes('hood')) {
        return `🏘️ Asking Qloo: "Which neighborhoods in ${destination} share the cultural atmosphere of ${entityDesc}?"`;
      }
      if (type.includes('artist') || type.includes('listen')) {
        return `🎵 Asking Qloo: "Which local musicians, soundscapes & live venues in ${destination} fit ${entityDesc}?"`;
      }
      if (type.includes('brand') || type.includes('shop')) {
        return `🛍️ Asking Qloo: "Where can you find independent boutiques, books & design spaces in ${destination}?"`;
      }
      if (type.includes('movie') || type.includes('watch')) {
        return `🎬 Asking Qloo: "Which indie cinemas, art hubs & film spaces in ${destination} align with ${entityDesc}?"`;
      }
      return `✨ Asking Qloo: "Finding cultural recommendations in ${destination} matched with ${entityDesc}..."`;
    }
    case 'get_taste_profile':
      return `🧬 Asking Qloo: "Extracting multidimensional taste DNA and correlations from ${sampleNames || 'your profile'}..."`;
    case 'search_tags':
      return `🏷️ Asking Qloo: "Querying taste graph taxonomy for '${args.query || 'atmosphere'}' tags..."`;
    case 'search_entity':
      return `🔍 Asking Qloo: "Locating verified cultural coordinates for '${args.query || 'entity'}'..."`;
    default:
      return `✨ Asking Qloo: "Querying taste graph intelligence for ${destination}..."`;
  }
}

// Every pick is rebuilt from a Qloo result; anything the LLM invents is dropped.
function finalize(plan, seen, destination) {
  const p = PlanSchema.parse(plan);
  const destNorm = (destination || '').trim().toLowerCase();
  p.sections = p.sections.map(s => ({
    ...s,
    picks: s.picks
      .filter(k => seen.has(k.qlooId))
      .filter(k => s.key !== 'hood' || (k.name || '').trim().toLowerCase() !== destNorm)
      .map(k => ({ ...seen.get(k.qlooId), reason: k.reason }))
  }));
  return p;
}

export async function runAgent({ entities, destination, onStep = () => { } }) {
  const evidence = [], seen = new Map();
  const ids = entities.map(e => e.qlooId);
  const record = (tool, args, out) => {
    const id = `e${evidence.length + 1}`;
    evidence.push({ id, tool, args, request: out.request, count: out.results?.length });
    (out.results || []).forEach(r => r.id && !seen.has(r.id) && seen.set(r.id, {
      qlooId: r.id,
      name: r.name,
      image: r.image,
      tags: r.tags,
      evidenceId: id,
      location: r.location,
      address: r.address,
      neighborhood: r.neighborhood
    }));
    return id;
  };

  // Pre-fetch user's Taste DNA tags in parallel
  let tasteDna = [];
  try {
    const tp = await EXEC.get_taste_profile({ entityIds: ids });
    tasteDna = (tp.results || []).map(t => t.name).filter(Boolean);
  } catch (e) {
    console.warn('[Taste DNA pre-fetch]', e.message);
  }

  if (llmEnabled()) {
    try {
      const msgs = [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: JSON.stringify({ destination, entities: entities.map(e => ({ id: e.qlooId, name: e.name, type: e.type })) }) }
      ];
      const deadline = Date.now() + 25000;
      for (let i = 0; i < 6 && Date.now() < deadline; i++) {
        const m = await chat(msgs, TOOLS);
        msgs.push(m);
        if (!m.tool_calls?.length) {
          const plan = finalize(parse(m.content), seen, destination);
          if (tasteDna.length) plan.tasteDna = tasteDna;
          return { plan, evidence };
        }
        const outs = await Promise.all(m.tool_calls.map(async tc => {
          const args = JSON.parse(tc.function.arguments || '{}');
          let out;
          onStep(formatQlooQuestion(tc.function.name, args, entities, destination));
          try {
            out = await EXEC[tc.function.name](args);
            out.evidenceId = record(tc.function.name, args, out);
          } catch (e) {
            out = { error: e.message };
          }
          const slim = out.results ? { evidenceId: out.evidenceId, results: out.results.slice(0, 8).map(r => ({ id: r.id, name: r.name, tags: (r.tags || []).slice(0, 3) })) } : out;
          return { role: 'tool', tool_call_id: tc.id, content: JSON.stringify(slim).slice(0, 4000) };
        }));
        msgs.push(...outs);
      }
    } catch (e) {
      console.error('LLM path failed, using parallel Qloo-only plan:', e.message);
    }
  }

  // Fast Fallback: pure Qloo executed in parallel with Promise.all
  const sampleNames = entities.slice(0, 2).map(e => e.name).join(' & ');
  const entityDesc = sampleNames ? `your affinity for ${sampleNames}` : 'your taste profile';
  onStep(`Asking Qloo for 5 cultural dimensions in ${destination} in parallel...`);

  const rawSections = await Promise.all(
    SECTIONS.map(async s => {
      const args = { entityIds: ids, entityType: s.type, location: destination, sectionKey: s.key };
      try {
        const out = await EXEC.get_recommendations(args);
        const evId = record('get_recommendations', args, out);
        let picks = (out.results || []).map(r => ({
          qlooId: r.id,
          name: r.name,
          image: r.image,
          tags: r.tags,
          evidenceId: evId,
          location: r.location,
          address: r.address,
          neighborhood: r.neighborhood,
          reason: r.tags && r.tags.length
            ? `Matches your taste via shared Qloo tags: ${r.tags.slice(0, 3).join(', ')}`
            : `High affinity cultural match in ${destination} verified by Qloo.`
        }));
        // Neighborhoods: drop any result whose name equals the destination city
        if (s.key === 'hood') {
          const destNorm = destination.trim().toLowerCase();
          picks = picks.filter(p => (p.name || '').trim().toLowerCase() !== destNorm);
        }
        // Listen: add subtitle hint
        const extra = s.key === 'listen' ? { subtitle: `What ${destination} listeners with your taste play` } : {};
        return { key: s.key, title: s.title, picks, ...extra };
      } catch (e) {
        console.warn(`[Qloo fallback] Skipped ${s.title}:`, e.message);
        return null;
      }
    })
  );

  const sections = rawSections.filter(Boolean);
  return {
    plan: {
      summary: `Taste-matched cultural guide for ${destination}, grounded in Qloo’s taste graph.`,
      sections,
      tasteDna: tasteDna.length ? tasteDna : undefined,
    },
    evidence,
  };
}

export async function llmOnly({ entities, destination }) {
  if (!llmEnabled()) {
    console.warn('[llmOnly] LLM is disabled (no LLM_API_KEY)');
    return null;
  }
  try {
    const msgs = [
      { role: 'system', content: LLM_ONLY },
      { role: 'user', content: JSON.stringify({ destination, entities: entities.map(e => e.name) }) }
    ];
    const m = await chat(msgs);
    return parse(m.content);
  } catch (e) {
    console.error('LLM-only fallback failed:', e.message);
    return null;
  }
}
