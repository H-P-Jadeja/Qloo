// Single swap point: any OpenAI-compatible chat API with function calling.
export const llmEnabled = () => !!process.env.LLM_API_KEY;

export async function chat(messages, tools) {
  const url = `${process.env.LLM_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`;
  const body = JSON.stringify({ model: process.env.LLM_MODEL || 'gpt-4o-mini', messages, ...(tools ? { tools, tool_choice: 'auto' } : {}) });
  let last = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(url, {
      method: 'POST',
      signal: AbortSignal.timeout(45000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LLM_API_KEY}` },
      body,
    });
    if (r.status === 503 || r.status === 429) {
      last = `LLM ${r.status} (busy)`;
      await new Promise(s => setTimeout(s, 1500 * 2 ** attempt));
      continue;
    }
    if (!r.ok) throw new Error(`LLM ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return (await r.json()).choices[0].message;
  }
  throw new Error(last || 'LLM unavailable');
}