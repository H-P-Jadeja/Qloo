import { searchEntity } from '@/lib/qloo/search';
export async function GET(req) {
  const u = new URL(req.url); const q = u.searchParams.get('q'), type = u.searchParams.get('type');
  if (!q || !type) return Response.json({ error: 'q and type required' }, { status: 400 });
  try { return Response.json({ results: await searchEntity(q, type) }); }
  catch (e) { return Response.json({ error: e.message }, { status: 502 }); }
}
