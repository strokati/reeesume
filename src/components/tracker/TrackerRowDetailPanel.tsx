'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Mail, MapPin, Globe, DollarSign, Trash2, Send } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { createApplicationNote, deleteApplicationNote } from '@/server/actions/applications';
import type { TrackerRow } from '@/server/queries/tracker';

const statusColors: Record<string, string> = {
  saved: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  applied: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  screening: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  interview: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const statusLabels: Record<string, string> = {
  saved: 'Saved',
  planned: 'Planned',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  on_hold: 'On Hold',
};

const docStatusStyles: Record<string, string> = {
  ready: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  none: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const toneLabels: Record<string, string> = {
  professional: 'Professional',
  confident: 'Confident & Direct',
  warm: 'Warm & Narrative',
};

export function TrackerRowDetailPanel({
  row,
  onClose,
}: {
  row: TrackerRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState('documents');
  const [noteText, setNoteText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [localNotes, setLocalNotes] = useState(row?.notes ?? []);

  // Sync local notes when row changes
  if (row && localNotes !== row.notes) {
    setLocalNotes(row.notes);
  }

  const open = row !== null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {row && (
          <>
            <SheetHeader>
              <SheetTitle>{row.jobTitle}</SheetTitle>
              <SheetDescription>{row.companyName}</SheetDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={cn(
                    'text-[0.65rem] border-0',
                    statusColors[row.status] ?? statusColors.saved
                  )}
                >
                  {statusLabels[row.status] ?? row.status}
                </Badge>
              </div>
            </SheetHeader>

            <Tabs value={tab} onValueChange={setTab} className="flex-1 px-4">
              <TabsList className="w-full">
                <TabsTrigger value="documents" className="flex-1">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="vacancy" className="flex-1">
                  Vacancy
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-3 mt-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Resume</span>
                      </div>
                      <Badge
                        className={cn('text-[0.6rem] border-0', docStatusStyles[row.resumeStatus])}
                      >
                        {row.resumeStatus === 'ready'
                          ? 'Ready'
                          : row.resumeStatus === 'draft'
                            ? 'Draft'
                            : 'None'}
                      </Badge>
                    </div>
                    {row.resumeAtsScore != null && (
                      <div className="text-sm text-muted-foreground">
                        ATS Score: <span className="font-medium">{row.resumeAtsScore}/100</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/applications/${row.id}/resume`)}
                      >
                        Open Editor
                      </Button>
                      {row.resumeStatus !== 'none' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/api/export?draftId=${row.id}&format=pdf`)}
                        >
                          Export
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Cover Letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {row.coverLetterTone && (
                          <Badge variant="outline" className="text-[0.6rem]">
                            {toneLabels[row.coverLetterTone] ?? row.coverLetterTone}
                          </Badge>
                        )}
                        <Badge
                          className={cn(
                            'text-[0.6rem] border-0',
                            docStatusStyles[row.coverLetterStatus]
                          )}
                        >
                          {row.coverLetterStatus === 'ready'
                            ? 'Ready'
                            : row.coverLetterStatus === 'draft'
                              ? 'Draft'
                              : 'None'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/applications/${row.id}/cover-letter`)}
                    >
                      Open Editor
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vacancy" className="space-y-3 mt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{row.location || 'No location specified'}</span>
                  </div>
                  {(row.salaryMin != null || row.salaryMax != null) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {row.salaryMin != null && `$${row.salaryMin.toLocaleString()}`}
                        {row.salaryMin != null && row.salaryMax != null && ' – '}
                        {row.salaryMax != null && `$${row.salaryMax.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  {row.sourceUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Source URL
                      </a>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-3 mt-4">
                {localNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No notes yet.</p>
                ) : (
                  localNotes.map((note) => (
                    <div key={note.id} className="flex items-start gap-2 p-3 rounded-md border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await deleteApplicationNote(note.id);
                            setLocalNotes((prev) => prev.filter((n) => n.id !== note.id));
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && noteText.trim()) {
                        startTransition(async () => {
                          await createApplicationNote(row.id, noteText.trim());
                          const newNote = {
                            id: `temp-${Date.now()}`,
                            content: noteText.trim(),
                            createdAt: new Date(),
                          };
                          setLocalNotes((prev) => [newNote, ...prev]);
                          setNoteText('');
                        });
                      }
                    }}
                    disabled={isPending}
                  />
                  <Button
                    size="sm"
                    disabled={!noteText.trim() || isPending}
                    onClick={() => {
                      if (!noteText.trim()) return;
                      startTransition(async () => {
                        await createApplicationNote(row.id, noteText.trim());
                        const newNote = {
                          id: `temp-${Date.now()}`,
                          content: noteText.trim(),
                          createdAt: new Date(),
                        };
                        setLocalNotes((prev) => [newNote, ...prev]);
                        setNoteText('');
                      });
                    }}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
