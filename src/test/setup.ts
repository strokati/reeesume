import '@testing-library/jest-dom';

// Provide a valid NEXTAUTH_SECRET so the boot guard in src/lib/auth/config.ts
// doesn't throw when a test imports the module directly.
process.env.NEXTAUTH_SECRET = 'test-secret-32-chars-or-longer-for-vitest-setup-only';
