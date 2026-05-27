import { env as priv } from '$env/dynamic/private';

export const apiServer = async (query: { query: string; variables?: Record<string, unknown> }) => {
  const res = await fetch(priv.INTERNAL_API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(query)
  });
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('application/json')) {
    throw new Error('Bad upstream response');
  }
  return res.json();
};
