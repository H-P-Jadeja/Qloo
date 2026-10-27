import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
const BASE = process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com';

export async function qloo(path, params = {}) {
  const key = process.env.QLOO_API_KEY; // server-side only, never logged
  if (!key) throw new Error('QLOO_API_KEY is not set');
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
  const url = `${BASE}${path}?${qs}`;
  const ck = crypto.createHash('sha1').update(url).digest('hex');
  try { const hit = await prisma.qlooCache.findUnique({ where: { key: ck } }); if (hit) return hit.response; } catch { }
  for (let a = 0; a < 3; a++) {
    const r = await fetch(url, { headers: { 'X-Api-Key': key }, signal: AbortSignal.timeout(20000) });
    if (r.status === 429 || r.status >= 500) { await new Promise(s => setTimeout(s, 500 * 2 ** a)); continue; }
    if (!r.ok) throw new Error(`Qloo ${r.status} on ${path}: ${(await r.text()).slice(0, 200)}`);
    const json = await r.json();
    try { await prisma.qlooCache.upsert({ where: { key: ck }, update: { response: json }, create: { key: ck, response: json } }); } catch { }
    return json;
  }
  throw new Error('Qloo unavailable after retries');
}

export { norm } from './normalize';
