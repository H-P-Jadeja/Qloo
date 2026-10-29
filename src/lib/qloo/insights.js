import { qloo, norm } from './client';

// Tags/names that indicate a place is NOT a dining/hang-out spot
const JUNK_REGEX = /hotel|hostel|apartment|lodging|inn\b|suites?\b|resort|motel|airbnb/i;

// Tags/names that positively confirm a place IS food/drink/nightlife
const EAT_ALLOW_REGEX = /restaurant|cafe|café|bar|bakery|brewery|coffee|bistro|street.?food|club|venue|pub|tavern|eatery|diner|brasserie|gastropub|food|kitchen|cantina|pizzeria|sushi|ramen|tapas|lounge/i;

// Tags that are noisy / meaningless to show users
const DISPLAY_JUNK_TAGS = /^(restroom|urination|morning|midday|standard|borough|religious|paid.?breakfast|room.?service|mild.?cool|mild cool|cool weather|weather|rating|overall|generic|average|basic|ordinary)$/i;

// For the shop section: positive signals that indicate a browsable shop
const SHOP_ALLOW_REGEX = /boutique|shop|store|market|vintage|record|concept.?store|gallery|bookshop|bookstore|design|fashion|craft|flea|art.?space|antique|clothing|apparel|retail/i;

// GET /v2/insights  (signals + entity type + location filter)
export async function getRecommendations({ entityIds = [], tagIds = [], entityType, location, take = 6, sectionKey = '' }) {
  const isPlace = entityType === 'urn:entity:place';
  const isShop = sectionKey === 'shop';
  // Fetch 30 for eat so we can filter aggressively and still get 6 good ones
  const fetchTake = isPlace ? Math.max(take, 30) : take;
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
      const name = r.name || '';
      const tags = (r.tags || []).map(t => (typeof t === 'string' ? t : t?.name || ''));
      const combined = [name, ...tags].join(' ');
      // Drop hotels / lodging
      if (JUNK_REGEX.test(combined)) return false;
      // For eat section: only keep clear food/drink/venue places
      if (!isShop && EAT_ALLOW_REGEX.test(combined)) return true;
      // For shop section: only keep clear retail/browsable spots
      if (isShop && SHOP_ALLOW_REGEX.test(combined)) return true;
      // If no positive match but also not junk, still allow (Qloo knows best)
      return !isShop;
    });
    results = results.slice(0, take);
  }

  return { request, results };
}

// Filter tags before display
export function cleanTags(tags = []) {
  return (tags || []).filter(t => {
    const s = typeof t === 'string' ? t : (t?.name || '');
    return s && !DISPLAY_JUNK_TAGS.test(s.trim());
  });
}

export async function getTasteProfile(entityIds) {
  const request = { 'filter.type': 'urn:tag', 'signal.interests.entities': entityIds.join(','), take: 10 };
  const j = await qloo('/v2/insights', request);
  return { request, results: (j.results?.tags || j.results?.entities || []).map(t => ({ id: t.tag_id || t.entity_id || t.id, name: t.name })) };
}
