import { authHeaders } from '../shared/api-client';

let apiBase = '';
let apiToken = '';

export function initApi(base: string, token: string): void {
  apiBase = base;
  apiToken = token;
}

export function api(method: string, params: Record<string, unknown>): Promise<unknown> {
  let url = apiBase + '/api/comments';
  const hdrs = authHeaders(apiToken);
  const opts: RequestInit = { method, headers: hdrs };
  if (method === 'GET') {
    url += '?slug=' + encodeURIComponent(params.slug as string);
  } else if (method === 'DELETE') {
    url += '?id=' + encodeURIComponent(params.id as string);
  } else {
    opts.body = JSON.stringify(params);
  }
  return fetch(url, opts).then((r) => r.json());
}
