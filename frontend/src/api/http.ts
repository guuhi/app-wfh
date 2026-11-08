import { clearSession, getSession } from '../auth/session';

export const AUTH_API =
  import.meta.env.VITE_AUTH_API_URL ?? 'http://localhost:3001';
export const ATTENDANCE_API =
  import.meta.env.VITE_ATTENDANCE_API_URL ?? 'http://localhost:3002';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface Options {
  method?: string;
  body?: unknown; // object => JSON, FormData => multipart
  auth?: boolean; // send the Bearer token (default true)
}

// NestJS errors look like { message: "text" } or { message: ["a", "b"] }
async function readMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (Array.isArray(data.message)) return data.message.join('. ');
    if (typeof data.message === 'string') return data.message;
  } catch {
    /* not JSON */
  }
  return `Request failed (${res.status})`;
}

async function send(
  baseUrl: string,
  path: string,
  opts: Options,
): Promise<Response> {
  const { method = 'GET', body, auth = true } = opts;
  const headers: Record<string, string> = {};

  if (auth) {
    const session = getSession();
    if (session) headers.Authorization = `Bearer ${session.token}`;
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body; // the browser sets the multipart Content-Type itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(baseUrl + path, { method, headers, body: payload });
  } catch {
    throw new ApiError(
      0,
      'Cannot reach the server. Check that the backend is running.',
    );
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      // Token expired or employee deactivated: back to login.
      clearSession();
      window.location.assign('/login');
    }
    throw new ApiError(res.status, await readMessage(res));
  }
  return res;
}

export async function request<T>(
  baseUrl: string,
  path: string,
  opts: Options = {},
): Promise<T> {
  const res = await send(baseUrl, path, opts);
  return (await res.json()) as T;
}

export async function requestBlob(
  baseUrl: string,
  path: string,
): Promise<Blob> {
  const res = await send(baseUrl, path, {});
  return res.blob();
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong';
}
