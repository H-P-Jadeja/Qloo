export const GET = () => Response.json({ ok: true, qloo: !!process.env.QLOO_API_KEY, llm: !!process.env.LLM_API_KEY, db: !!process.env.DATABASE_URL });
