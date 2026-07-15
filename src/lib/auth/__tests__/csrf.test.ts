import { describe, it, expect } from 'vitest';
import { assertSameOrigin } from '../csrf';

function makeReq(headers: Record<string, string>): Request {
  return new Request('https://example.test/api/x', { headers });
}

describe('assertSameOrigin', () => {
  it('passes when Origin and Host match', () => {
    expect(() =>
      assertSameOrigin(makeReq({ origin: 'https://example.test', host: 'example.test' }))
    ).not.toThrow();
  });

  it('throws when Origin host differs from Host', () => {
    expect(() =>
      assertSameOrigin(makeReq({ origin: 'https://evil.example', host: 'example.test' }))
    ).toThrow('Origin does not match Host');
  });

  it('throws when Origin is missing', () => {
    expect(() => assertSameOrigin(makeReq({ host: 'example.test' }))).toThrow(
      'Missing Origin or Host header'
    );
  });

  it('throws when Host is missing', () => {
    expect(() => assertSameOrigin(makeReq({ origin: 'https://example.test' }))).toThrow(
      'Missing Origin or Host header'
    );
  });

  it('throws on a malformed Origin', () => {
    expect(() => assertSameOrigin(makeReq({ origin: 'not-a-url', host: 'example.test' }))).toThrow(
      'Invalid Origin header'
    );
  });

  it('handles Origin with port and path correctly', () => {
    expect(() =>
      assertSameOrigin(
        makeReq({ origin: 'http://localhost:3000/some/path', host: 'localhost:3000' })
      )
    ).not.toThrow();
  });

  it('rejects when ports differ', () => {
    expect(() =>
      assertSameOrigin(makeReq({ origin: 'http://localhost:3000', host: 'localhost:4000' }))
    ).toThrow('Origin does not match Host');
  });
});
