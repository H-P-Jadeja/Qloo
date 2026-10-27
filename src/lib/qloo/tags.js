import { qloo } from './client';
// GET /v2/tags?filter.query=jazz
export async function searchTags(query) {
  const j = await qloo('/v2/tags', { 'filter.query': query, take: 5 });
  const arr = j.results?.tags || (Array.isArray(j.results) ? j.results : []);
  return arr.map(t => ({ id: t.id || t.tag_id, name: t.name }));
}
