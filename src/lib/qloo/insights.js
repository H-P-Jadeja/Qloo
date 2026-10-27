import { qloo, norm } from './client';
// GET /v2/insights  (signals + entity type + location filter)
export async function getRecommendations({ entityIds = [], tagIds = [], entityType, location, take = 6 }) {
  const request = {
    'filter.type': entityType,
    'signal.interests.entities': entityIds.join(','),
    'signal.interests.tags': tagIds.join(','),
    'filter.location.query': location,
    take,
  };
  const j = await qloo('/v2/insights', request);
  return { request, results: (j.results?.entities || []).map(norm) };
}
export async function getTasteProfile(entityIds) {
  const request = { 'filter.type': 'urn:tag', 'signal.interests.entities': entityIds.join(','), take: 8 };
  const j = await qloo('/v2/insights', request);
  return { request, results: (j.results?.tags || j.results?.entities || []).map(t => ({ id: t.tag_id || t.entity_id || t.id, name: t.name })) };
}

// Optional: age/gender affinity of an entity set (verify param name in docs)
export async function getDemographics(entityIds) {
  const request = { 'signal.interests.entities': entityIds.join(','), 'filter.type': 'urn:demographics' };
  const j = await qloo('/v2/insights', request);
  return { request, results: j.results?.demographics || j.results || [] };
}
