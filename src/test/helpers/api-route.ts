import { NextRequest } from 'next/server';

function sameOriginHeaders(url: string): Record<string, string> {
  const { host, origin } = new URL(url);
  return { Origin: origin, Host: host };
}

export function createPostRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sameOriginHeaders(url) },
    body: JSON.stringify(body),
  });
}

export function createPostFormDataRequest(url: string, formData: FormData): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: sameOriginHeaders(url),
    body: formData,
  });
}

/** Build a POST request whose Origin header does not match its Host. */
export function createCrossOriginPostRequest(url: string, body: unknown): NextRequest {
  const { host } = new URL(url);
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://evil.example',
      Host: host,
    },
    body: JSON.stringify(body),
  });
}
