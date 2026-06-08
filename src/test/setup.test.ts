import { describe, it, expect } from 'vitest';

describe('test infrastructure', () => {
  it('resolves @/* path alias', async () => {
    const { db } = await import('@/test/mocks/db');
    expect(db).toBeDefined();
    expect(db.application.findMany).toBeDefined();
  });

  it('resolves @testing-library/jest-dom matchers', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
  });
});
