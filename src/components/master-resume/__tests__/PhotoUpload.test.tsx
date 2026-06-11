import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoUpload } from '@/components/master-resume/PhotoUpload';

vi.mock('@/lib/resize-image', () => ({
  resizeToDataUrl: vi.fn().mockResolvedValue('data:image/jpeg;base64,test'),
}));

describe('PhotoUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a drop zone with instructions', () => {
    render(<PhotoUpload onChange={vi.fn()} />);
    expect(screen.getByText(/drop an image or click to browse/i)).toBeInTheDocument();
  });

  it('renders a circular preview when value is provided', () => {
    render(<PhotoUpload value="data:image/jpeg;base64,/9j/4AAQ" onChange={vi.fn()} />);
    const img = screen.getByRole('img', { name: /photo preview/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,/9j/4AAQ');
  });

  it('does not render a preview when value is undefined', () => {
    render(<PhotoUpload onChange={vi.fn()} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('calls onChange with undefined when remove button is clicked', async () => {
    const onChange = vi.fn();
    render(<PhotoUpload value="data:image/jpeg;base64,/9j/4AAQ" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('renders a hidden file input that accepts image types', () => {
    render(<PhotoUpload onChange={vi.fn()} />);
    const input = screen.getByLabelText(/drop an image or click to browse/i);
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  it('shows an error when file exceeds 5 MB', async () => {
    const onChange = vi.fn();
    render(<PhotoUpload onChange={onChange} />);
    const input = screen.getByLabelText(/drop an image or click to browse/i);

    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });
    Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });

    await userEvent.upload(input, bigFile);
    expect(screen.getByText(/file is too large|must be smaller than 5 mb/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows an error for non-image file types', async () => {
    const onChange = vi.fn();
    render(<PhotoUpload onChange={onChange} />);
    const input = screen.getByLabelText(/drop an image or click to browse/i);

    const textFile = new File(['hello'], 'notes.txt', { type: 'text/plain' });

    // userEvent.upload respects the accept attribute and may skip non-matching files,
    // so we fire the change event manually to test our validation logic
    Object.defineProperty(input, 'files', {
      value: [textFile],
      configurable: true,
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with a data URL after processing a valid image', async () => {
    const onChange = vi.fn();
    render(<PhotoUpload onChange={onChange} />);

    const input = screen.getByLabelText(/drop an image or click to browse/i);
    const imageFile = new File(['fake-image'], 'photo.jpg', {
      type: 'image/jpeg',
    });

    await userEvent.upload(input, imageFile);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('data:image/jpeg;base64,test');
    });
  });
});
