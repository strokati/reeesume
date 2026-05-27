'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import { useTransition, useRef } from 'react';
import { toast } from 'sonner';
import { updateProfessionalSummary } from '@/server/actions/master-resume';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ToolbarButton({
  label,
  command,
  active,
  disabled,
}: {
  label: string;
  command: () => void;
  active: boolean;
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={command}
      className={cn(active && 'bg-muted')}
      disabled={disabled}
    >
      <span className="text-xs font-bold">{label}</span>
    </Button>
  );
}

export function SummaryEditor({
  resumeId,
  defaultValue,
}: {
  resumeId: string;
  defaultValue?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const editor = useEditor({
    extensions: [StarterKit, Bold, BulletList],
    content: defaultValue ?? '',
    editorProps: {
      attributes: { class: 'min-h-[120px] prose prose-sm max-w-none focus:outline-none' },
    },
    onUpdate: ({ editor: ed }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const html = ed.isEmpty ? '' : ed.getHTML();
        startTransition(async () => {
          try {
            await updateProfessionalSummary(resumeId, html);
            toast.success('Summary saved');
          } catch {
            toast.error('Failed to save summary');
          }
        });
      }, 1000);
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 rounded-md border p-1">
        <ToolbarButton
          label="B"
          command={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={isPending}
        />
        <ToolbarButton
          label="I"
          command={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={isPending}
        />
        <ToolbarButton
          label="•"
          command={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          disabled={isPending}
        />
      </div>
      <div className="rounded-md border p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
