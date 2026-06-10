import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resizeToDataUrl } from '@/lib/resize-image';

class MockCanvas {
  width = 0;
  height = 0;
  private ctx = { drawImage: vi.fn() };
  getContext() {
    return this.ctx;
  }
  toDataURL() {
    return 'data:image/jpeg;base64,mocked-jpeg-data';
  }
}

describe('resizeToDataUrl', () => {
  const origCreateElement = document.createElement.bind(document);
  const origCreateObjectURL = URL.createObjectURL;
  const origRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    document.createElement = ((tag: string) => {
      if (tag === 'canvas') return new MockCanvas() as unknown as HTMLCanvasElement;
      return origCreateElement(tag);
    }) as typeof document.createElement;

    URL.createObjectURL = (() => 'blob:mock-url') as typeof URL.createObjectURL;
    URL.revokeObjectURL = (() => {}) as typeof URL.revokeObjectURL;
  });

  afterEach(() => {
    document.createElement = origCreateElement;
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
  });

  it('returns a JPEG data URL for a valid image file', async () => {
    const OrigImage = globalThis.Image;
    // @ts-expect-error — mock Image for test
    globalThis.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      width = 800;
      height = 600;
      constructor() {
        setTimeout(() => this.onload?.(), 0);
      }
    };

    const file = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await resizeToDataUrl(file);
    expect(result).toMatch(/^data:image\/jpeg;base64,/);

    globalThis.Image = OrigImage;
  });

  it('rejects with an error when image fails to load', async () => {
    const OrigImage = globalThis.Image;
    // @ts-expect-error — mock Image for test
    globalThis.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      constructor() {
        setTimeout(() => this.onerror?.(), 0);
      }
    };

    const file = new File(['bad'], 'photo.jpg', { type: 'image/jpeg' });
    await expect(resizeToDataUrl(file)).rejects.toThrow('Failed to load image');

    globalThis.Image = OrigImage;
  });

  it('sets canvas dimensions to 200×250', async () => {
    const mockCanvas = new MockCanvas();
    document.createElement = ((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return origCreateElement(tag);
    }) as typeof document.createElement;

    const OrigImage = globalThis.Image;
    // @ts-expect-error — mock Image for test
    globalThis.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      width = 1000;
      height = 1000;
      constructor() {
        setTimeout(() => this.onload?.(), 0);
      }
    };

    const file = new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
    await resizeToDataUrl(file);
    expect(mockCanvas.width).toBe(200);
    expect(mockCanvas.height).toBe(250);

    globalThis.Image = OrigImage;
  });
});
