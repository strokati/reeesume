import { ContactInfoSchema } from '@/lib/validations/master-resume';

describe('ContactInfoSchema — photoUrl', () => {
  it('accepts contact info with a valid base64 data URL', () => {
    const result = ContactInfoSchema.safeParse({
      name: 'Jane Doe',
      photoUrl: 'data:image/jpeg;base64,/9j/4AAQ',
    });
    expect(result.success).toBe(true);
  });

  it('accepts contact info without photoUrl', () => {
    const result = ContactInfoSchema.safeParse({ name: 'Jane Doe' });
    expect(result.success).toBe(true);
  });

  it('accepts undefined photoUrl', () => {
    const result = ContactInfoSchema.safeParse({
      name: 'Jane Doe',
      photoUrl: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string photoUrl', () => {
    const result = ContactInfoSchema.safeParse({
      name: 'Jane Doe',
      photoUrl: '',
    });
    expect(result.success).toBe(true);
  });

  it('preserves all other contact fields alongside photoUrl', () => {
    const result = ContactInfoSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
      location: 'Berlin, DE',
      linkedin: 'https://linkedin.com/in/jane',
      github: 'https://github.com/jane',
      website: 'https://jane.dev',
      photoUrl: 'data:image/jpeg;base64,/9j/4AAQ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.photoUrl).toBe('data:image/jpeg;base64,/9j/4AAQ');
    }
  });
});
