import { qloo, norm } from './client';

const JUNK_REGEX = /hotel|hostel|apartment|lodging|inn\b|suites\b/i;

// GET /v2/insights  (signals + entity type + location filter)
export async function getRecommendations({ entityIds = [], tagIds = [], entityType, location, take = 6 }) {
  const isPlace = entityType === 'urn:entity:place';
  // Fetch up to 15 if place/eat so filtering hotel/hostel/lodging leaves 6 good picks
  const fetchTake = isPlace ? Math.max(take, 15) : take;
  const request = {
    'filter.type': entityType,
    'signal.interests.entities': entityIds.join(','),
    'signal.interests.tags': tagIds.join(','),
    'filter.location.query': location,
    take: fetchTake,
  };
  const j = await qloo('/v2/insights', request);
  let results = (j.results?.entities || []).map(norm);

  if (isPlace) {
    results = results.filter(r => {
      const nameMatch = JUNK_REGEX.test(r.name || '');
      const tagMatch = (r.tags || []).some(t => JUNK_REGEX.test(typeof t === 'string' ? t : t?.name || ''));
      return !nameMatch && !tagMatch;
    });
    results = results.slice(0, take);
  }

  return { request, results };
}

export async function getTasteProfile(entityIds) {
  const request = { 'filter.type': 'urn:tag', 'signal.interests.entities': entityIds.join(','), take: 10 };
  const j = await qloo('/v2/insights', request);
  return { request, results: (j.results?.tags || j.results?.entities || []).map(t => ({ id: t.tag_id || t.entity_id || t.id, name: t.name })) };
}
