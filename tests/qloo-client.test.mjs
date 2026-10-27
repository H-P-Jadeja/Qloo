import test from 'node:test'; import assert from 'node:assert';
import { norm } from '../src/lib/qloo/normalize.js';
test('norm maps a Qloo entity', () => {
  const n = norm({ entity_id: 'X1', name: 'Cafe', types: ['urn:entity:place'], properties: { image: { url: 'u' } }, query: { affinity: 0.9 }, tags: [{ name: 'quiet' }] });
  assert.deepStrictEqual(n, { id: 'X1', name: 'Cafe', type: 'urn:entity:place', image: 'u', score: 0.9, tags: ['quiet'] });
});
