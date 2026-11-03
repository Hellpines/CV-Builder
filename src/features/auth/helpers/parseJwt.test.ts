import { describe, expect, it } from 'vitest';
import { parseJwt } from './parseJwt';

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createToken(payload: unknown): string {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const rawPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return `${header}.${toBase64Url(rawPayload)}.signature`;
}

describe('parseJwt', () => {
  it('parses a valid JWT payload', () => {
    const token = createToken({ sub: 'user-1', email: 'user@example.com', exp: 1_704_067_200 });

    expect(parseJwt(token)).toEqual({
      sub: 'user-1',
      email: 'user@example.com',
      exp: 1_704_067_200,
    });
  });

  it('decodes URL-safe base64 characters', () => {
    const payload = { e: '4D?UPi S' };
    const urlSafePayload = toBase64Url(JSON.stringify(payload));
    const token = `${toBase64Url('{"alg":"none"}')}.${urlSafePayload}.sig`;

    expect(urlSafePayload).toContain('_');
    expect(parseJwt(token)).toEqual(payload);
  });

  it('returns null for empty or malformed tokens', () => {
    expect(parseJwt('')).toBeNull();
    expect(parseJwt('not-a-jwt')).toBeNull();
    expect(parseJwt('only.one')).toBeNull();
    expect(parseJwt('header..sig')).toBeNull();
  });

  it('returns null when payload is not valid JSON', () => {
    expect(parseJwt(createToken('{not-json'))).toBeNull();
  });

  it('returns null when payload is not valid base64', () => {
    expect(parseJwt('header.!!!invalid!!!.sig')).toBeNull();
  });
});
