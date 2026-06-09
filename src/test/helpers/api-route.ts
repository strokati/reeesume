import { NextRequest } from 'next/server';

export function createPostRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function createPostFormDataRequest(url: string, formData: FormData): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: formData,
  });
}
