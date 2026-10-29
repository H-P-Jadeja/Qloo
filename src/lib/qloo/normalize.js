// Safely convert a Qloo location value to a flat {lat, lon} object or null.
// Qloo sometimes returns location as {city, metro, state, county, country, neighborhood}
// (a place-descriptor object), not as {lat, lon} coordinates. We keep lat/lon for the
// map; the human-readable fields are extracted separately below.
function parseLocation(loc) {
  if (!loc || typeof loc !== 'object') return null;
  // Has numeric coords → usable for the map
  if (typeof loc.lat === 'number' && typeof loc.lon === 'number') return { lat: loc.lat, lon: loc.lon };
  if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') return { lat: loc.latitude, lon: loc.longitude };
  // Descriptor object (city/metro/country…) — not map coords, return null for location
  return null;
}

// Build a human-readable address string from whatever Qloo gives us
function parseAddress(props, rawLoc) {
  // Explicit address string on properties
  if (props?.address && typeof props.address === 'string') return props.address;
  // Qloo sometimes puts address as an object {street, city, …}
  if (props?.address && typeof props.address === 'object') {
    const a = props.address;
    return [a.street, a.city, a.state, a.country].filter(Boolean).join(', ') || null;
  }
  // Location descriptor object has city/country fields
  if (rawLoc && typeof rawLoc === 'object' && !rawLoc.lat) {
    return [rawLoc.city, rawLoc.state, rawLoc.country].filter(Boolean).join(', ') || null;
  }
  return null;
}

function parseNeighborhood(props, rawLoc) {
  const n = props?.neighborhood || props?.locality;
  if (n && typeof n === 'string') return n;
  if (n && typeof n === 'object') return n.name || null;
  // Also check location descriptor
  if (rawLoc && typeof rawLoc === 'object' && !rawLoc.lat) {
    return rawLoc.neighborhood || rawLoc.metro || null;
  }
  return null;
}

export const norm = e => {
  const res = {
    id: e.entity_id || e.id,
    name: e.name,
    type: e.subtype || (e.types && e.types[0]) || e.type || null,
    image: e.properties?.image?.url || e.image?.url || null,
    score: e.query?.affinity ?? e.affinity ?? null,
    tags: (e.tags || []).map(t => t.name).filter(Boolean).slice(0, 6),
  };

  const rawLoc = e.location || (e.properties?.latitude ? { lat: e.properties.latitude, lon: e.properties.longitude } : null);
  const coords = parseLocation(rawLoc);
  if (coords) res.location = coords; // always {lat, lon} or absent

  const addr = parseAddress(e.properties, rawLoc);
  if (addr) res.address = addr; // always a string or absent

  const hood = parseNeighborhood(e.properties, rawLoc);
  if (hood) res.neighborhood = hood; // always a string or absent

  if (e.properties?.geocode) res.geocode = e.properties.geocode;
  return res;
};

