// Single swap point: any OpenAI-compatible chat API with function calling.
export const llmEnabled = () => !!process.env.LLM_API_KEY;

const isGroq = () => (process.env.LLM_BASE_URL || '').includes('groq.com');

const getDefaultModel = () => {
  if (process.env.LLM_MODEL) return process.env.LLM_MODEL;
  return isGroq() ? 'openai/gpt-oss-120b' : 'gpt-4o-mini';
};

export async function chat(messages, tools, overrideModel = null) {
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const url = `${baseUrl}/chat/completions`;
  const modelToUse = overrideModel || getDefaultModel();
  const body = JSON.stringify({
    model: modelToUse,
    messages,
    ...(tools ? { tools, tool_choice: 'auto' } : {})
  });

  let last = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(url, {
      method: 'POST',
      signal: AbortSignal.timeout(45000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LLM_API_KEY}`
      },
      body,
    });

    if (r.status === 503 || r.status === 429) {
      last = `LLM ${r.status} (busy)`;
      await new Promise(s => setTimeout(s, 1500 * 2 ** attempt));
      continue;
    }

    if (!r.ok) {
      const errText = await r.text();
      // If the model was not found and we are on Groq, attempt fallback to a known supported model
      if (r.status === 404 && errText.includes('model_not_found') && isGroq() && modelToUse !== 'openai/gpt-oss-120b') {
        console.warn(`[LLM] Model '${modelToUse}' not found on Groq. Falling back to 'openai/gpt-oss-120b'...`);
        return chat(messages, tools, 'openai/gpt-oss-120b');
      }
      throw new Error(`LLM ${r.status}: ${errText.slice(0, 200)}`);
    }

    const data = await r.json();
    return data.choices[0].message;
  }
  throw new Error(last || 'LLM unavailable');
}