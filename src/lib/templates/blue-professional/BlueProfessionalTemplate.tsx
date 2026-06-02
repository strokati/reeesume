import type {
  TemplateProps,
  WorkExperienceItem,
  WorkProjectItem,
  EducationItem,
  SkillItem,
  CertificationItem,
  AwardItem,
  ProjectItem,
  VolunteeringItem,
  PublicationItem,
} from '../types';
import { formatDate } from '@/lib/utils';

const DEFAULT_ACCENT = '#2871B8';

function makeStyles(accent: string) {
  return {
    page: {
      fontFamily: 'Calibri, Arial, "Helvetica Neue", sans-serif',
      fontSize: '10pt',
      lineHeight: 1.35,
      color: '#1a1a1a',
      padding: '0.45in 0.5in',
      maxWidth: '8.5in',
      boxSizing: 'border-box' as const,
    },
    // ── Header ──
    header: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      marginBottom: '10pt',
    },
    headerLeft: {
      flex: '1 1 auto' as const,
    },
    name: {
      fontSize: '26pt',
      fontWeight: 700,
      color: '#111111',
      margin: '0 0 2pt 0',
      lineHeight: 1.1,
      letterSpacing: '-0.3pt',
    },
    targetTitle: {
      fontSize: '12pt',
      fontWeight: 600,
      color: accent,
      margin: '0 0 5pt 0',
    },
    contactLine: {
      fontSize: '9pt',
      color: '#333',
      margin: 0,
      lineHeight: 1.6,
    },
    contactLink: {
      color: accent,
      textDecoration: 'none' as const,
    },
    contactSep: {
      color: '#888',
      margin: '0 4pt',
    },
    photo: {
      width: '72pt',
      height: '88pt',
      objectFit: 'cover' as const,
      borderRadius: '3pt',
      flexShrink: 0,
      marginLeft: '16pt',
      border: '0.5pt solid #ddd',
    },
    // ── Section header ──
    sectionHeader: {
      fontSize: '10.5pt',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.8pt',
      color: accent,
      borderBottom: `1.5pt solid ${accent}`,
      margin: '11pt 0 5pt 0',
      paddingBottom: '2pt',
    },
    // ── Summary ──
    summary: {
      margin: '0 0 2pt 0',
      textAlign: 'justify' as const,
      fontSize: '10pt',
      lineHeight: 1.45,
    },
    // ── Work experience ──
    workEntryTitle: {
      fontWeight: 700,
      fontSize: '10.5pt',
      color: '#111',
    },
    workPipe: {
      margin: '0 5pt',
      color: '#555',
      fontWeight: 400,
    },
    workCompany: {
      fontWeight: 600,
      color: accent,
      fontSize: '10.5pt',
    },
    workDates: {
      float: 'right' as const,
      fontWeight: 400,
      fontSize: '10pt',
      color: '#333',
    },
    workLocation: {
      fontStyle: 'italic' as const,
      fontSize: '9.5pt',
      color: '#555',
      margin: '0 0 3pt 0',
    },
    projectRow: {
      margin: '5pt 0 1pt 0',
    },
    projectLabel: {
      fontWeight: 700,
      color: accent,
      fontSize: '10pt',
    },
    projectName: {
      fontWeight: 700,
      fontSize: '10pt',
      color: '#111',
    },
    projectType: {
      fontStyle: 'italic' as const,
      fontSize: '9.5pt',
      color: '#555',
    },
    projectDesc: {
      margin: '1pt 0 2pt 0',
      fontSize: '10pt',
    },
    bullet: {
      margin: '1pt 0 1pt 0',
      paddingLeft: '12pt',
      textIndent: '-12pt',
      fontSize: '10pt',
    },
    stackLine: {
      fontWeight: 700,
      fontSize: '9.5pt',
      margin: '3pt 0 0 0',
      color: '#222',
    },
    stackValues: {
      fontWeight: 400,
      fontStyle: 'italic' as const,
      color: '#444',
    },
    // ── Skills ──
    skillLine: {
      margin: '1pt 0',
      fontSize: '10pt',
    },
    skillCategory: {
      fontWeight: 700,
    },
    // ── Education ──
    eduTitle: {
      fontWeight: 700,
      fontSize: '10.5pt',
      color: '#111',
    },
    eduInstitution: {
      color: accent,
      fontWeight: 600,
    },
    eduMeta: {
      fontStyle: 'italic' as const,
      fontSize: '9.5pt',
      color: '#555',
      margin: '1pt 0 0 0',
    },
    // ── Certifications / Awards ──
    certBullet: {
      margin: '2pt 0 2pt 0',
      paddingLeft: '12pt',
      textIndent: '-12pt',
      fontSize: '10pt',
    },
    // ── Projects (open-source / portfolio) ──
    projEntryTitle: {
      fontWeight: 700,
      fontSize: '10.5pt',
      color: '#111',
    },
    projSep: {
      margin: '0 5pt',
      color: '#999',
    },
    projSubtitle: {
      fontSize: '10pt',
      color: '#333',
    },
    projUrl: {
      color: accent,
      fontWeight: 600,
      fontSize: '10pt',
      textDecoration: 'none' as const,
    },
  } as const;
}

function formatRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  const s = formatDate(start);
  const e = formatDate(end) || 'Present';
  if (!s) return e;
  return `${s} – ${e}`;
}

export function BlueProfessionalTemplate({ data, accentColor }: TemplateProps) {
  const accent = accentColor || data.accentColor || DEFAULT_ACCENT;
  const S = makeStyles(accent);
  const { contactInfo, targetTitle, summary, sectionOrder } = data;

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          {contactInfo.name && <h1 style={S.name}>{contactInfo.name}</h1>}
          {targetTitle && <p style={S.targetTitle}>{targetTitle}</p>}
          <ContactLine info={contactInfo} S={S} />
        </div>
        {contactInfo.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={contactInfo.photoUrl} alt="Photo" style={S.photo} />
        )}
      </div>

      {/* ── Sections ── */}
      {sectionOrder.map((section) => {
        switch (section) {
          case 'summary':
            return summary ? <SummarySection key={section} summary={summary} S={S} /> : null;
          case 'workExperience':
            return data.workExperience.length > 0 ? (
              <WorkExperienceSection key={section} items={data.workExperience} S={S} />
            ) : null;
          case 'education':
            return data.education.length > 0 ? (
              <EducationSection key={section} items={data.education} S={S} />
            ) : null;
          case 'skills':
            return data.skills.length > 0 ? (
              <SkillsSection key={section} items={data.skills} S={S} />
            ) : null;
          case 'certifications':
            return data.certifications.length > 0 ? (
              <CertificationsSection key={section} items={data.certifications} S={S} />
            ) : null;
          case 'awards':
            return data.awards.length > 0 ? (
              <AwardsSection key={section} items={data.awards} S={S} />
            ) : null;
          case 'projects':
            return data.projects.length > 0 ? (
              <ProjectsSection key={section} items={data.projects} S={S} />
            ) : null;
          case 'volunteering':
            return data.volunteering.length > 0 ? (
              <VolunteeringSection key={section} items={data.volunteering} S={S} />
            ) : null;
          case 'publications':
            return data.publications.length > 0 ? (
              <PublicationsSection key={section} items={data.publications} S={S} />
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}

// ── Shared helpers ──────────────────────────────────────────────

type Styles = ReturnType<typeof makeStyles>;

function SectionHeader({ children, S }: { children: React.ReactNode; S: Styles }) {
  return <h2 style={S.sectionHeader}>{children}</h2>;
}

function Bullet({ children, S }: { children: React.ReactNode; S: Styles }) {
  return (
    <p style={S.bullet}>
      {'● '}
      {children}
    </p>
  );
}

function ContactLine({ info, S }: { info: TemplateProps['data']['contactInfo']; S: Styles }) {
  const parts: React.ReactNode[] = [];

  function addText(val: string | undefined) {
    if (!val) return;
    if (parts.length > 0)
      parts.push(
        <span key={`sep-${parts.length}`} style={S.contactSep}>
          •
        </span>
      );
    parts.push(<span key={val}>{val}</span>);
  }

  function addLink(val: string | undefined, display?: string) {
    if (!val) return;
    if (parts.length > 0)
      parts.push(
        <span key={`sep-${parts.length}`} style={S.contactSep}>
          •
        </span>
      );
    const href = val.startsWith('http') ? val : undefined;
    parts.push(
      href ? (
        <a key={val} href={href} style={S.contactLink}>
          {display ?? val}
        </a>
      ) : (
        <span key={val} style={S.contactLink}>
          {display ?? val}
        </span>
      )
    );
  }

  addText(info.email);
  addText(info.phone);
  if (info.linkedin) addLink(info.linkedin, 'linkedin');
  if (info.github) addLink(info.github, 'github');
  if (info.website) addLink(info.website);
  addText(info.location);

  return <p style={S.contactLine}>{parts}</p>;
}

// ── Section components ──────────────────────────────────────────

function SummarySection({ summary, S }: { summary: string; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Professional Summary</SectionHeader>
      <p style={S.summary}>{summary}</p>
    </>
  );
}

function WorkExperienceSection({ items, S }: { items: WorkExperienceItem[]; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Work Experience</SectionHeader>
      {items.map((item, i) => (
        <WorkEntry key={i} item={item} S={S} />
      ))}
    </>
  );
}

function WorkEntry({ item, S }: { item: WorkExperienceItem; S: Styles }) {
  const dateRange = formatRange(item.startDate, item.endDate);
  const allBullets = [...(item.responsibilities ?? []), ...(item.achievements ?? [])];
  const hasProjects = item.projects && item.projects.length > 0;

  return (
    <div style={{ marginBottom: '8pt', overflow: 'hidden' }}>
      {/* Role | Company  Date */}
      <div>
        {dateRange && <span style={S.workDates}>{dateRange}</span>}
        <span style={S.workEntryTitle}>{item.title}</span>
        <span style={S.workPipe}>|</span>
        <span style={S.workCompany}>{item.companyName}</span>
      </div>

      {/* Location */}
      {item.workArrangement && <p style={S.workLocation}>{item.workArrangement}</p>}

      {/* If projects exist, show project sub-entries; otherwise show bullets at role level */}
      {hasProjects ? (
        item.projects!.map((proj, pi) => <WorkProjectEntry key={pi} proj={proj} S={S} />)
      ) : (
        <>
          {allBullets.map((b, bi) => (
            <Bullet key={bi} S={S}>
              {b}
            </Bullet>
          ))}
          {item.technologies && item.technologies.length > 0 && (
            <StackLine label="Stack" items={item.technologies} S={S} />
          )}
        </>
      )}
    </div>
  );
}

function WorkProjectEntry({ proj, S }: { proj: WorkProjectItem; S: Styles }) {
  const allBullets = proj.responsibilities ?? [];
  return (
    <div style={{ marginTop: '5pt' }}>
      {/* Project: Name  (Type) */}
      <p style={S.projectRow}>
        <span style={S.projectLabel}>Project: </span>
        <span style={S.projectName}>{proj.name}</span>
        {proj.startDate || proj.endDate ? (
          <span style={S.projectType}> ({formatRange(proj.startDate, proj.endDate)})</span>
        ) : null}
      </p>

      {proj.description && <p style={S.projectDesc}>{proj.description}</p>}

      {allBullets.map((b, i) => (
        <Bullet key={i} S={S}>
          {b}
        </Bullet>
      ))}

      {proj.technologies && proj.technologies.length > 0 && (
        <StackLine label="Stack" items={proj.technologies} S={S} />
      )}
    </div>
  );
}

function StackLine({ label, items, S }: { label: string; items: string[]; S: Styles }) {
  return (
    <p style={S.stackLine}>
      {label}: <span style={S.stackValues}>{items.join(', ')}</span>
    </p>
  );
}

function EducationSection({ items, S }: { items: EducationItem[]; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Education</SectionHeader>
      {items.map((item, i) => {
        const degreeField = [item.degree, item.field].filter(Boolean).join(', ');
        return (
          <div key={i} style={{ marginBottom: '5pt', overflow: 'hidden' }}>
            <div>
              {(item.startDate || item.endDate) && (
                <span style={S.workDates}>{formatRange(item.startDate, item.endDate)}</span>
              )}
              {degreeField && <span style={S.eduTitle}>{degreeField}</span>}
              {item.institution && (
                <>
                  <span style={{ color: '#555', margin: '0 5pt' }}>—</span>
                  <span style={S.eduInstitution}>{item.institution}</span>
                </>
              )}
            </div>
            <p style={S.eduMeta}>{[item.location, item.honors].filter(Boolean).join(' • ')}</p>
          </div>
        );
      })}
    </>
  );
}

function SkillsSection({ items, S }: { items: SkillItem[]; S: Styles }) {
  const grouped = new Map<string, SkillItem[]>();
  for (const s of items) {
    const cat = s.category || 'Skills';
    const existing = grouped.get(cat) ?? [];
    existing.push(s);
    grouped.set(cat, existing);
  }
  return (
    <>
      <SectionHeader S={S}>Technical Skills</SectionHeader>
      {Array.from(grouped.entries()).map(([cat, skills]) => (
        <p key={cat} style={S.skillLine}>
          <span style={S.skillCategory}>{cat}: </span>
          {skills.map((s) => s.name).join(', ')}
        </p>
      ))}
    </>
  );
}

function CertificationsSection({ items, S }: { items: CertificationItem[]; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Awards &amp; Certifications</SectionHeader>
      {items.map((item, i) => (
        <p key={i} style={S.certBullet}>
          {'● '}
          <strong>{item.name}</strong>
          {item.issuer && <span style={{ color: '#444' }}> — {item.issuer}</span>}
          {item.issueDate && <span style={{ color: '#666' }}> ({formatDate(item.issueDate)})</span>}
        </p>
      ))}
    </>
  );
}

function AwardsSection({ items, S }: { items: AwardItem[]; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Awards &amp; Scholarships</SectionHeader>
      {items.map((item, i) => (
        <p key={i} style={S.certBullet}>
          {'● '}
          <strong>{item.title}</strong>
          {item.issuer && <span style={{ color: '#444' }}> — {item.issuer}</span>}
          {item.date && <span style={{ color: '#666' }}> ({formatDate(item.date)})</span>}
        </p>
      ))}
    </>
  );
}

function ProjectsSection({ items, S }: { items: ProjectItem[]; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Open Source Projects</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div>
            <span style={S.projEntryTitle}>{item.name}</span>
            {item.role && (
              <>
                <span style={S.projSep}>|</span>
                <span style={S.projSubtitle}>{item.role}</span>
              </>
            )}
            {item.url && (
              <>
                <span style={S.projSep}>|</span>
                <a href={item.url} style={S.projUrl}>
                  {item.url}
                </a>
              </>
            )}
          </div>
          {item.description && (
            <p style={{ margin: '1pt 0', fontSize: '10pt' }}>{item.description}</p>
          )}
          {item.technologies && item.technologies.length > 0 && (
            <StackLine label="Stack" items={item.technologies} S={S} />
          )}
        </div>
      ))}
    </>
  );
}

function VolunteeringSection({ items, S }: { items: VolunteeringItem[]; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Volunteering &amp; Leadership</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '5pt', overflow: 'hidden' }}>
          <div>
            {(item.startDate || item.endDate) && (
              <span style={S.workDates}>{formatRange(item.startDate, item.endDate)}</span>
            )}
            {item.role && <span style={S.workEntryTitle}>{item.role}</span>}
            {item.organization && (
              <>
                <span style={S.workPipe}>|</span>
                <span style={S.workCompany}>{item.organization}</span>
              </>
            )}
          </div>
          {item.responsibilities?.map((r, ri) => (
            <Bullet key={ri} S={S}>
              {r}
            </Bullet>
          ))}
        </div>
      ))}
    </>
  );
}

function PublicationsSection({ items, S }: { items: PublicationItem[]; S: Styles }) {
  return (
    <>
      <SectionHeader S={S}>Publications</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '4pt' }}>
          <span style={S.projEntryTitle}>{item.title}</span>
          {item.authors && (
            <span style={{ color: '#444', fontSize: '10pt' }}> — {item.authors}</span>
          )}
          {(item.publisher || item.date) && (
            <span style={{ color: '#666', fontSize: '9.5pt' }}>
              {' '}
              ({[item.publisher, item.date && formatDate(item.date)].filter(Boolean).join(', ')})
            </span>
          )}
          {item.url && (
            <div style={{ fontSize: '9.5pt' }}>
              <a href={item.url} style={S.projUrl}>
                {item.url}
              </a>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
