// Day-1 check: node --env-file=.env scripts/qloo-test.mjs
const B = process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com', H = { 'X-Api-Key': process.env.QLOO_API_KEY };
const show = async (p) => { const r = await fetch(B + p, { headers: H }); console.log(p, r.status); console.log((await r.text()).slice(0, 600), '\n'); };
await show('/search?query=Coldplay&types=urn:entity:artist&take=2');
await show('/v2/tags?filter.query=jazz&take=2');
await show('/v2/insights?filter.type=urn:entity:place&filter.location.query=London&take=2');
