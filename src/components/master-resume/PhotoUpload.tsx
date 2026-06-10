/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useCallback } from 'react';
import { User, Upload, X } from 'lucide-react';
import { resizeToDataUrl } from '@/lib/resize-image';
import { Button } from '@/components/ui/button';

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoUploadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Unsupported file type. Use JPEG, PNG, or WebP.');
        return;
      }

      if (file.size > MAX_SIZE) {
        setError('File is too large. Maximum size is 5 MB.');
        return;
      }

      setLoading(true);
      try {
        const dataUrl = await resizeToDataUrl(file);
        onChange(dataUrl);
      } catch {
        setError('Failed to process image.');
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    onChange(undefined);
    setError(null);
  }, [onChange]);

  return (
    <div className="flex items-start gap-4">
      <div
        className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {value ? (
          <img src={value} alt="Photo preview" className="h-full w-full object-cover" />
        ) : (
          <User className="h-8 w-8 text-muted-foreground/50" />
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Browse
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Drop an image or click to browse. JPEG, PNG, or WebP · max 5 MB
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Drop an image or click to browse"
      />
    </div>
  );
}
