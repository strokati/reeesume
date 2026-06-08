import { describe, it, expect } from 'vitest';
import { TEMPLATES, getTemplate } from '@/lib/templates/index';

describe('TEMPLATES registry', () => {
  it('contains all expected template IDs', () => {
    const ids = Object.keys(TEMPLATES);
    expect(ids).toContain('ats-simple');
    expect(ids).toContain('professional-classic');
    expect(ids).toContain('modern-minimal');
    expect(ids).toContain('international-de');
  });

  it('each template has id, name, and component', () => {
    Object.values(TEMPLATES).forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.component).toBeDefined();
    });
  });
});

describe('getTemplate', () => {
  it('returns the template for a valid ID', () => {
    const t = getTemplate('ats-simple');
    expect(t.id).toBe('ats-simple');
  });

  it('returns ats-simple fallback for unknown template ID', () => {
    const result = getTemplate('nonexistent');
    expect(result.id).toBe('ats-simple');
  });
});
