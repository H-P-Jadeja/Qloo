import { qloo, norm } from './client';
// GET /search?query=..&types=urn:entity:artist
export async function searchEntity(query, type) {
  const j = await qloo('/search', { query, types: type, take: 5 });
  const arr = Array.isArray(j.results) ? j.results : (j.results?.entities || j.entities || []);
  return arr.map(norm);
}
