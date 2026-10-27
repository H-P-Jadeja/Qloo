export const norm = e => ({
  id: e.entity_id || e.id, name: e.name,
  type: e.subtype || (e.types && e.types[0]) || e.type || null,
  image: e.properties?.image?.url || e.image?.url || null,
  score: e.query?.affinity ?? e.affinity ?? null,
  tags: (e.tags || []).map(t => t.name).filter(Boolean).slice(0, 6),
});
