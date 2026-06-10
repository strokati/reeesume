import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ContactInfoForm } from '@/components/master-resume/ContactInfoForm';

vi.mock('@/server/actions/master-resume', () => ({
  updateContactInfo: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/resize-image', () => ({
  resizeToDataUrl: vi.fn().mockResolvedValue('data:image/jpeg;base64,test'),
}));

describe('ContactInfoForm — photo integration', () => {
  it('renders the photo upload area', () => {
    render(<ContactInfoForm resumeId="resume-1" />);
    expect(screen.getByText(/drop an image or click to browse/i)).toBeInTheDocument();
  });

  it('passes existing photoUrl as default value to PhotoUpload', () => {
    render(
      <ContactInfoForm
        resumeId="resume-1"
        defaultValues={{
          name: 'Jane',
          photoUrl: 'data:image/jpeg;base64,existing',
        }}
      />
    );
    const preview = screen.getByRole('img', { name: /photo preview/i });
    expect(preview).toHaveAttribute('src', 'data:image/jpeg;base64,existing');
  });

  it('includes photoUrl in the form data when submitting', async () => {
    const { updateContactInfo } = await import('@/server/actions/master-resume');
    render(
      <ContactInfoForm
        resumeId="resume-1"
        defaultValues={{
          name: 'Jane',
          photoUrl: 'data:image/jpeg;base64,existing',
        }}
      />
    );

    const form = document.getElementById('contact-info-form') as HTMLFormElement;
    form.requestSubmit();
    await waitFor(() => {
      expect(updateContactInfo).toHaveBeenCalledWith(
        'resume-1',
        expect.objectContaining({
          photoUrl: 'data:image/jpeg;base64,existing',
        })
      );
    });
  });
});
