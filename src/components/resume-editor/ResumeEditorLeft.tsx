'use client';

import { useState, useCallback, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RephrasePopover } from './RephrasePopover';
import { updateResumeDraftContent } from '@/server/actions/resume-drafts';
import type { ResumeDraft } from '@/generated/prisma/client';
import type {
  ResumeDraftContent,
  DraftWorkRole,
  DraftWorkProject,
  DraftBullet,
  ContentSource,
} from '@/types/resume-draft';

function SourceBadge({ source }: { source: ContentSource }) {
  const styles: Record<ContentSource, string> = {
    master:
      'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-900/20',
    ai: 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-900/20',
    manual:
      'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-900/20',
  };
  const labels: Record<ContentSource, string> = { master: 'Master', ai: 'AI', manual: 'Edited' };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[0.55rem] font-medium ${styles[source]}`}
    >
      {labels[source]}
    </span>
  );
}

export function ResumeEditorLeft({ draft }: { draft: ResumeDraft }) {
  const content = (draft.content as unknown as ResumeDraftContent) ?? {
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    awards: [],
    projects: [],
    volunteering: [],
    publications: [],
  };
  const [localContent, setLocalContent] = useState<ResumeDraftContent>(content);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (updated: ResumeDraftContent) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        updateResumeDraftContent(draft.id, updated);
      }, 1000);
    },
    [draft.id]
  );

  function updateContent(updater: (prev: ResumeDraftContent) => ResumeDraftContent) {
    setLocalContent((prev) => {
      const next = updater(prev);
      debouncedSave(next);
      return next;
    });
  }

  const defaultProvider = ''; // Will be passed from parent in future wiring

  return (
    <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
      {/* Target Title */}
      <Card>
        <CardContent className="p-4">
          <Input
            value={localContent.targetTitle ?? ''}
            onChange={(e) => updateContent((c) => ({ ...c, targetTitle: e.target.value }))}
            placeholder="Target Title"
            className="text-lg font-semibold border-0 rounded-xl p-4 h-auto focus-visible:ring-0"
          />
        </CardContent>
      </Card>

      {/* Summary */}
      {(localContent.summary || localContent.summary === '') && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Summary
              </h3>
            </div>
            <Textarea
              value={localContent.summary ?? ''}
              onChange={(e) => updateContent((c) => ({ ...c, summary: e.target.value }))}
              placeholder="Professional summary..."
              className="min-h-[80px] text-sm border-0 p-4 focus-visible:ring-0 resize-none"
            />
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      {localContent.workExperience.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Work Experience
            </h3>
            {localContent.workExperience.map((role, ri) => (
              <DraftWorkRoleCard
                key={ri}
                role={role}
                providerId={defaultProvider}
                onChange={(updated) => {
                  updateContent((c) => {
                    const next = [...c.workExperience];
                    next[ri] = updated;
                    return { ...c, workExperience: next };
                  });
                }}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {localContent.skills.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {localContent.skills.map((skill, si) => (
                <div key={si} className="flex items-center gap-1">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
                    {skill.name}
                  </span>
                  <SourceBadge source={skill.source} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {localContent.education.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Education
            </h3>
            {localContent.education.map((edu, ei) => (
              <div key={ei} className="flex items-start justify-between text-sm">
                <div>
                  <p className="font-medium">{edu.institution}</p>
                  <p className="text-muted-foreground">
                    {edu.degree} {edu.field}
                  </p>
                </div>
                <SourceBadge source={edu.source} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {localContent.projects.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Projects
            </h3>
            {localContent.projects.map((proj, pi) => (
              <div key={pi} className="flex items-start justify-between text-sm">
                <div>
                  <p className="font-medium">{proj.name}</p>
                  {proj.description && <p className="text-muted-foreground">{proj.description}</p>}
                  {proj.technologies?.length && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {proj.technologies.join(', ')}
                    </p>
                  )}
                </div>
                <SourceBadge source={proj.source} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Other sections — simplified display */}
      {localContent.certifications.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Certifications
            </h3>
            {localContent.certifications.map((cert, i) => (
              <div key={i} className="flex items-start justify-between text-sm">
                <span>
                  {cert.name}
                  {cert.issuer ? ` — ${cert.issuer}` : ''}
                </span>
                <SourceBadge source={cert.source} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {localContent.awards.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Awards
            </h3>
            {localContent.awards.map((award, i) => (
              <div key={i} className="flex items-start justify-between text-sm">
                <span>
                  {award.title}
                  {award.issuer ? ` — ${award.issuer}` : ''}
                </span>
                <SourceBadge source={award.source} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {localContent.volunteering.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Volunteering
            </h3>
            {localContent.volunteering.map((v, i) => (
              <div key={i} className="flex items-start justify-between text-sm">
                <span>
                  {v.role ?? 'Volunteer'} at {v.organization}
                </span>
                <SourceBadge source={v.source} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {localContent.publications.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Publications
            </h3>
            {localContent.publications.map((pub, i) => (
              <div key={i} className="flex items-start justify-between text-sm">
                <span>
                  {pub.title}
                  {pub.publisher ? ` — ${pub.publisher}` : ''}
                </span>
                <SourceBadge source={pub.source} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DraftWorkRoleCard({
  role,
  providerId,
  onChange,
}: {
  role: DraftWorkRole;
  providerId: string;
  onChange: (updated: DraftWorkRole) => void;
}) {
  function updateBullet(index: number, text: string, field: 'responsibilities' | 'achievements') {
    const updated = [...role[field]];
    updated[index] = { ...updated[index], text, source: 'manual' as const };
    onChange({ ...role, [field]: updated });
  }

  function handleRephrase(
    index: number,
    rephrased: string,
    field: 'responsibilities' | 'achievements'
  ) {
    const updated = [...role[field]];
    updated[index] = { ...updated[index], text: rephrased, source: 'ai' as const };
    onChange({ ...role, [field]: updated });
  }

  return (
    <div className="space-y-2 rounded-xl border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{role.title}</p>
          <p className="text-xs text-muted-foreground">{role.companyName}</p>
          {role.workArrangement && (
            <span className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[0.55rem] font-medium mt-0.5 border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:bg-slate-900/20">
              {role.workArrangement}
            </span>
          )}
        </div>
        <SourceBadge source={role.source} />
      </div>

      {role.responsibilities.length > 0 && (
        <div className="space-y-1">
          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground font-medium">
            Responsibilities
          </p>
          {role.responsibilities.map((bullet, bi) => (
            <DraftBulletRow
              key={bi}
              bullet={bullet}
              context={role.title}
              providerId={providerId}
              onUpdate={(text) => updateBullet(bi, text, 'responsibilities')}
              onRephrase={(text) => handleRephrase(bi, text, 'responsibilities')}
            />
          ))}
        </div>
      )}

      {role.achievements.length > 0 && (
        <div className="space-y-1">
          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground font-medium">
            Achievements
          </p>
          {role.achievements.map((bullet, bi) => (
            <DraftBulletRow
              key={bi}
              bullet={bullet}
              context={role.title}
              providerId={providerId}
              onUpdate={(text) => updateBullet(bi, text, 'achievements')}
              onRephrase={(text) => handleRephrase(bi, text, 'achievements')}
            />
          ))}
        </div>
      )}

      {role.projects && role.projects.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground font-medium">
            Projects
          </p>
          {role.projects.map((proj, pi) => (
            <DraftWorkProjectRow
              key={pi}
              project={proj}
              roleTitle={role.title}
              providerId={providerId}
              onChange={(updated) => {
                const updatedProjects = [...(role.projects ?? [])];
                updatedProjects[pi] = updated;
                onChange({ ...role, projects: updatedProjects });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftWorkProjectRow({
  project,
  roleTitle,
  providerId,
  onChange,
}: {
  project: DraftWorkProject;
  roleTitle: string;
  providerId: string;
  onChange: (updated: DraftWorkProject) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed px-3 py-2 space-y-1">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium">{project.name}</p>
        <SourceBadge source={project.source} />
      </div>
      {project.responsibilities && project.responsibilities.length > 0 && (
        <div className="space-y-1">
          {project.responsibilities.map((bullet, bi) => (
            <DraftBulletRow
              key={bi}
              bullet={bullet}
              context={`${roleTitle} — ${project.name}`}
              providerId={providerId}
              onUpdate={(text) => {
                const updated = [...project.responsibilities!];
                updated[bi] = { ...updated[bi], text, source: 'manual' as const };
                onChange({ ...project, responsibilities: updated });
              }}
              onRephrase={(text) => {
                const updated = [...project.responsibilities!];
                updated[bi] = { ...updated[bi], text, source: 'ai' as const };
                onChange({ ...project, responsibilities: updated });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftBulletRow({
  bullet,
  context,
  providerId,
  onUpdate,
  onRephrase,
}: {
  bullet: DraftBullet;
  context: string;
  providerId: string;
  onUpdate: (text: string) => void;
  onRephrase: (text: string) => void;
}) {
  return (
    <div className="flex items-start gap-1.5 group">
      <span className="text-muted-foreground mt-0.5 text-xs">•</span>
      <input
        type="text"
        value={bullet.text}
        onChange={(e) => onUpdate(e.target.value)}
        className="flex-1 text-sm bg-transparent border-0 p-0 focus:outline-none focus:border-b focus:border-primary"
      />
      <SourceBadge source={bullet.source} />
      {providerId && (
        <RephrasePopover
          original={bullet.text}
          context={context}
          providerId={providerId}
          onApply={onRephrase}
        >
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </RephrasePopover>
      )}
    </div>
  );
}
