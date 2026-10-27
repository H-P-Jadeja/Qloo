import test from 'node:test'; import assert from 'node:assert';
import { PlanSchema } from '../src/lib/agent/schema.js';
test('valid plan parses', () => assert.ok(PlanSchema.parse({ summary: 's', sections: [{ key: 'eat', title: 'Eat', picks: [{ qlooId: 'A', reason: 'r' }] }] })));
test('pick without qlooId is rejected', () => assert.throws(() => PlanSchema.parse({ summary: 's', sections: [{ key: 'eat', title: 'Eat', picks: [{ reason: 'r' }] }] })));
