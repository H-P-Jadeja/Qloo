'use client';
export default function Error({ error, reset }) { return <main><h1>Something went wrong</h1><p className="err">{error.message}</p><button onClick={reset}>Try again</button></main>; }
