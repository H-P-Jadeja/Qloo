import { searchEntity } from '@/lib/qloo/search';
import { searchTags } from '@/lib/qloo/tags';
import { getRecommendations, getTasteProfile } from '@/lib/qloo/insights';
const fn = (name, description, properties, required) => ({ type: 'function', function: { name, description, parameters: { type: 'object', properties, required } } });
const arr = { type: 'array', items: { type: 'string' } };
export const TOOLS = [
  fn('search_entity', 'Resolve a name to a Qloo entity', { query: { type: 'string' }, type: { type: 'string' } }, ['query', 'type']),
  fn('search_tags', 'Resolve a style/genre keyword to a Qloo tag', { query: { type: 'string' } }, ['query']),
  fn('get_recommendations', 'Taste-based Qloo results of one entity type in a location', { entityIds: arr, tagIds: arr, entityType: { type: 'string' }, location: { type: 'string' } }, ['entityIds', 'entityType', 'location']),
  fn('get_taste_profile', 'Tags describing the taste of an entity set', { entityIds: arr }, ['entityIds']),
];
export const EXEC = {
  search_entity: async a => ({ results: await searchEntity(a.query, a.type) }),
  search_tags: async a => ({ results: await searchTags(a.query) }),
  get_recommendations: async a => getRecommendations(a),
  get_taste_profile: async a => getTasteProfile(a.entityIds),
};
