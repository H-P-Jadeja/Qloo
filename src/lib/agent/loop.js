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

// Every pick is rebuilt from a Qloo result; anything the LLM invents is dropped.
function finalize(plan, seen) {
  const p = PlanSchema.parse(plan);
  p.sections = p.sections.map(s => ({ ...s, picks: s.picks.filter(k => seen.has(k.qlooId)).map(k => ({ ...seen.get(k.qlooId), reason: k.reason })) }));
  return p;
}

export async function runAgent({ entities, destination, onStep = () => { } }) {
  const evidence = [], seen = new Map();
  const ids = entities.map(e => e.qlooId);
  const record = (tool, args, out) => {
    const id = `e${evidence.length + 1}`;
    evidence.push({ id, tool, args, request: out.request, count: out.results?.length });
    (out.results || []).forEach(r => r.id && !seen.has(r.id) && seen.set(r.id, { qlooId: r.id, name: r.name, image: r.image, tags: r.tags, evidenceId: id }));
    return id;
  };

  if (llmEnabled()) {
    try {
      const msgs = [{ role: 'system', content: SYSTEM }, { role: 'user', content: JSON.stringify({ destination, entities: entities.map(e => ({ id: e.qlooId, name: e.name, type: e.type })) }) }];
      const deadline = Date.now() + 35000;
      for (let i = 0; i < 8 && Date.now() < deadline; i++) {
        const m = await chat(msgs, TOOLS); msgs.push(m);
        if (!m.tool_calls?.length) return { plan: finalize(parse(m.content), seen), evidence };
        const outs = await Promise.all(m.tool_calls.map(async tc => {
          const args = JSON.parse(tc.function.arguments || '{}'); let out; onStep(`Agent calls ${tc.function.name}`);
          try { out = await EXEC[tc.function.name](args); out.evidenceId = record(tc.function.name, args, out); } catch (e) { out = { error: e.message }; }
          const slim = out.results ? { evidenceId: out.evidenceId, results: out.results.slice(0, 8).map(r => ({ id: r.id, name: r.name, tags: (r.tags || []).slice(0, 3) })) } : out;
          return { role: 'tool', tool_call_id: tc.id, content: JSON.stringify(slim).slice(0, 4000) };
        }));
        msgs.push(...outs);
      }
    } catch (e) { console.error('LLM path failed, using Qloo-only plan:', e.message); }
  }
  // Fallback: pure Qloo, no LLM
  const sections = [];
  for (const s of SECTIONS) {
    const args = { entityIds: ids, entityType: s.type, location: destination };
    onStep(`Asking Qloo for ${s.title} in ${destination}`);
    let out; try { out = await EXEC.get_recommendations(args); } catch (e) { onStep(`Skipped ${s.title}: ${e.message.slice(0, 60)}`); continue; }
    const evId = record('get_recommendations', args, out);
    sections.push({ key: s.key, title: s.title, picks: out.results.map(r => ({ qlooId: r.id, name: r.name, image: r.image, tags: r.tags, evidenceId: evId, reason: r.tags.length ? `Matches your taste via: ${r.tags.slice(0, 3).join(', ')}` : 'High taste affinity in this city (Qloo).' })) });
  }
  return { plan: { summary: `Taste-matched picks for ${destination}, straight from the Qloo taste graph.`, sections }, evidence };
}

export async function llmOnly({ entities, destination }) {
  if (!llmEnabled()) {
    console.warn('[llmOnly] LLM is disabled (no LLM_API_KEY)');
    return null;
  }
  try {
    const m = await chat([
      { role: 'system', content: LLM_ONLY },
      { role: 'user', content: JSON.stringify({ destination, loves: (entities || []).map(e => e.name) }) }
    ]);
    const parsed = parse(m.content);
    if (Array.isArray(parsed)) {
      return { items: parsed };
    }
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object') {
      const firstArr = Object.values(parsed).find(v => Array.isArray(v));
      if (firstArr) return { items: firstArr };
    }
    return parsed;
  } catch (e) {
    console.error('[llmOnly] Error generating plain LLM answer:', e.message);
    return null;
  }
}

