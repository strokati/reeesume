import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const signInMock = vi.fn();
const pushMock = vi.fn();

vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import LoginPage from '../page';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts on the email step', () => {
    render(<LoginPage />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  it('moves to the OTP step after the email submits successfully', async () => {
    signInMock.mockResolvedValueOnce({ error: null, status: 200 });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'me@x.com');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
    expect(signInMock).toHaveBeenCalledWith(
      'nodemailer',
      expect.objectContaining({ email: 'me@x.com', redirect: false })
    );
  });

  it('surfaces an error when the email step fails', async () => {
    signInMock.mockResolvedValueOnce({ error: 'ProviderError', status: 400 });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'me@x.com');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not send verification code/i)).toBeInTheDocument();
    });
  });

  it('calls signIn("otp", { email, code, redirect: false }) on verify', async () => {
    signInMock
      .mockResolvedValueOnce({ error: null, status: 200 }) // email step
      .mockResolvedValueOnce({ error: null, status: 200 }); // verify step

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'me@x.com');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText(/123456/i);
    await userEvent.type(codeInput, '123456');
    await userEvent.click(screen.getByRole('button', { name: /^verify$/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        'otp',
        expect.objectContaining({ email: 'me@x.com', code: '123456', redirect: false })
      );
    });
  });

  it('redirects to "/" after a successful verify', async () => {
    signInMock
      .mockResolvedValueOnce({ error: null, status: 200 })
      .mockResolvedValueOnce({ error: null, status: 200 });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'me@x.com');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/123456/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /^verify$/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error and stays on the OTP step when verify fails', async () => {
    signInMock
      .mockResolvedValueOnce({ error: null, status: 200 })
      .mockResolvedValueOnce({ error: 'CredentialsSignin', status: 401 });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'me@x.com');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/123456/i), '999999');
    await userEvent.click(screen.getByRole('button', { name: /^verify$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired code/i)).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
