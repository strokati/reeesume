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

const STYLES = {
  page: {
    fontFamily: 'Georgia, "Times New Roman", Times, serif',
    fontSize: '10.5pt',
    lineHeight: 1.4,
    color: '#1a1a1a',
    padding: '0.5in',
    maxWidth: '8.5in',
    boxSizing: 'border-box' as const,
    WebkitBoxDecorationBreak: 'clone' as const,
    boxDecorationBreak: 'clone' as const,
  },
  name: {
    fontSize: '18pt',
    fontWeight: 700,
    textAlign: 'center' as const,
    margin: '0 0 4pt 0',
    letterSpacing: '0.5pt',
  },
  contactLine: {
    textAlign: 'center' as const,
    fontSize: '9.5pt',
    margin: '0 0 12pt 0',
    color: '#333',
  },
  targetTitle: {
    textAlign: 'center' as const,
    fontSize: '11pt',
    fontWeight: 600,
    margin: '0 0 10pt 0',
  },
  sectionHeader: {
    fontSize: '11pt',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8pt',
    borderBottom: '1.5pt solid #1a1a1a',
    margin: '12pt 0 6pt 0',
    paddingBottom: '3pt',
  },
  summary: {
    margin: '0 0 4pt 0',
    textAlign: 'justify' as const,
  },
  entryHeader: {
    margin: '0 0 2pt 0',
  },
  entryTitle: {
    fontWeight: 700,
    fontSize: '10.5pt',
  },
  entryMeta: {
    fontSize: '10pt',
    color: '#333',
  },
  entryMetaRight: {
    float: 'right' as const,
    fontSize: '10pt',
    color: '#333',
  },
  bullet: {
    margin: '1pt 0 1pt 12pt',
    paddingLeft: '0',
    textIndent: '-10pt',
  },
  skillCategory: {
    fontWeight: 600,
    fontSize: '10.5pt',
  },
  skillList: {
    margin: '0 0 4pt 0',
  },
  itemParagraph: {
    margin: '2pt 0',
  },
} as const;

function formatDataRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  const s = formatDate(start);
  const e = formatDate(end);
  return `${s} – ${e}`;
}

export function AtsSimpleTemplate({ data }: TemplateProps) {
  const { contactInfo, targetTitle, summary, sectionOrder } = data;

  const contactParts: string[] = [];
  if (contactInfo.email) contactParts.push(contactInfo.email);
  if (contactInfo.phone) contactParts.push(contactInfo.phone);
  if (contactInfo.location) contactParts.push(contactInfo.location);
  if (contactInfo.linkedin) contactParts.push(contactInfo.linkedin);
  if (contactInfo.github) contactParts.push(contactInfo.github);
  if (contactInfo.website) contactParts.push(contactInfo.website);

  return (
    <div style={STYLES.page}>
      {/* Header */}
      {contactInfo.name && <h1 style={STYLES.name}>{contactInfo.name}</h1>}
      {contactParts.length > 0 && <p style={STYLES.contactLine}>{contactParts.join(' | ')}</p>}

      {/* Target Title */}
      {targetTitle && <p style={STYLES.targetTitle}>{targetTitle}</p>}

      {/* Sections in order */}
      {sectionOrder.map((section) => {
        switch (section) {
          case 'summary':
            return summary ? <SummarySection key={section} summary={summary} /> : null;
          case 'workExperience':
            return data.workExperience.length > 0 ? (
              <WorkExperienceSection key={section} items={data.workExperience} />
            ) : null;
          case 'education':
            return data.education.length > 0 ? (
              <EducationSection key={section} items={data.education} />
            ) : null;
          case 'skills':
            return data.skills.length > 0 ? (
              <SkillsSection key={section} items={data.skills} />
            ) : null;
          case 'certifications':
            return data.certifications.length > 0 ? (
              <CertificationsSection key={section} items={data.certifications} />
            ) : null;
          case 'awards':
            return data.awards.length > 0 ? (
              <AwardsSection key={section} items={data.awards} />
            ) : null;
          case 'projects':
            return data.projects.length > 0 ? (
              <ProjectsSection key={section} items={data.projects} />
            ) : null;
          case 'volunteering':
            return data.volunteering.length > 0 ? (
              <VolunteeringSection key={section} items={data.volunteering} />
            ) : null;
          case 'publications':
            return data.publications.length > 0 ? (
              <PublicationsSection key={section} items={data.publications} />
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 style={STYLES.sectionHeader}>{children}</h2>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <p style={STYLES.bullet}>
      {'• '}
      {children}
    </p>
  );
}

function SummarySection({ summary }: { summary: string }) {
  return (
    <>
      <SectionHeader>Professional Summary</SectionHeader>
      <p style={STYLES.summary}>{summary}</p>
    </>
  );
}

function WorkExperienceSection({ items }: { items: WorkExperienceItem[] }) {
  return (
    <>
      <SectionHeader>Work Experience</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '8pt' }}>
          <div style={STYLES.entryHeader}>
            <span style={STYLES.entryTitle}>{item.title}</span>
            {item.startDate || item.endDate ? (
              <span style={STYLES.entryMetaRight}>
                {formatDataRange(item.startDate, item.endDate)}
              </span>
            ) : null}
          </div>
          <div style={STYLES.entryMeta}>
            {item.companyName}
            {item.workArrangement ? ` · ${item.workArrangement}` : ''}
          </div>
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ fontSize: '9.5pt', color: '#444', margin: '2pt 0' }}>
              Technologies: {item.technologies.join(', ')}
            </div>
          )}
          {item.responsibilities.map((r, j) => (
            <Bullet key={`resp-${j}`}>{r}</Bullet>
          ))}
          {item.achievements.map((a, j) => (
            <Bullet key={`ach-${j}`}>{a}</Bullet>
          ))}
          {item.projects && item.projects.length > 0 && (
            <div style={{ marginTop: '4pt' }}>
              {item.projects.map((proj, pi) => (
                <WorkRoleProjectEntry key={pi} project={proj} />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function WorkRoleProjectEntry({ project }: { project: WorkProjectItem }) {
  return (
    <div style={{ marginBottom: '4pt', paddingLeft: '8pt' }}>
      <div style={{ ...STYLES.entryHeader }}>
        <span style={{ fontWeight: 600, fontSize: '10pt' }}>{project.name}</span>
        {(project.startDate || project.endDate) && (
          <span style={STYLES.entryMetaRight}>
            {formatDataRange(project.startDate, project.endDate)}
          </span>
        )}
      </div>
      {project.description && (
        <p style={{ ...STYLES.itemParagraph, fontSize: '10pt', color: '#333' }}>
          {project.description}
        </p>
      )}
      {project.responsibilities?.map((r, i) => (
        <Bullet key={i}>{r}</Bullet>
      ))}
      {project.technologies && project.technologies.length > 0 && (
        <p style={{ fontSize: '9.5pt', color: '#444', margin: '1pt 0' }}>
          Technologies: {project.technologies.join(', ')}
        </p>
      )}
    </div>
  );
}

function EducationSection({ items }: { items: EducationItem[] }) {
  return (
    <>
      <SectionHeader>Education</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={STYLES.entryHeader}>
            <span style={STYLES.entryTitle}>
              {item.degree && item.field
                ? `${item.degree} in ${item.field}`
                : item.degree || item.field}
            </span>
            {item.startDate || item.endDate ? (
              <span style={STYLES.entryMetaRight}>
                {formatDataRange(item.startDate, item.endDate)}
              </span>
            ) : null}
          </div>
          <div style={STYLES.entryMeta}>
            {item.institution}
            {item.location ? `, ${item.location}` : ''}
          </div>
          {(item.gpa || item.honors) && (
            <div style={{ fontSize: '9.5pt', margin: '1pt 0' }}>
              {item.gpa && <span>GPA: {item.gpa}</span>}
              {item.gpa && item.honors && <span> | </span>}
              {item.honors && <span>{item.honors}</span>}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function SkillsSection({ items }: { items: SkillItem[] }) {
  const grouped = new Map<string, SkillItem[]>();
  for (const skill of items) {
    const cat = skill.category || 'Other';
    const list = grouped.get(cat) || [];
    list.push(skill);
    grouped.set(cat, list);
  }

  return (
    <>
      <SectionHeader>Skills</SectionHeader>
      {Array.from(grouped.entries()).map(([category, skills]) => (
        <p key={category} style={STYLES.skillList}>
          <span style={STYLES.skillCategory}>{category}: </span>
          {skills.map((s) => s.name).join(', ')}
        </p>
      ))}
    </>
  );
}

function CertificationsSection({ items }: { items: CertificationItem[] }) {
  return (
    <>
      <SectionHeader>Certifications</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={STYLES.entryTitle}>{item.name}</span>
          {item.issuer && <span style={STYLES.entryMeta}> — {item.issuer}</span>}
          {item.issueDate && <span style={STYLES.entryMeta}> ({formatDate(item.issueDate)})</span>}
        </div>
      ))}
    </>
  );
}

function AwardsSection({ items }: { items: AwardItem[] }) {
  return (
    <>
      <SectionHeader>Awards &amp; Scholarships</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={STYLES.entryTitle}>{item.title}</span>
          {item.issuer && <span style={STYLES.entryMeta}> — {item.issuer}</span>}
          {item.date && <span style={STYLES.entryMeta}> ({formatDate(item.date)})</span>}
        </div>
      ))}
    </>
  );
}

function ProjectsSection({ items }: { items: ProjectItem[] }) {
  return (
    <>
      <SectionHeader>Projects</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={STYLES.entryHeader}>
            <span style={STYLES.entryTitle}>{item.name}</span>
            {item.role && <span style={STYLES.entryMeta}> — {item.role}</span>}
          </div>
          {item.description && <p style={STYLES.itemParagraph}>{item.description}</p>}
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ fontSize: '9.5pt', color: '#444', margin: '1pt 0' }}>
              Technologies: {item.technologies.join(', ')}
            </div>
          )}
          {item.url && <div style={{ fontSize: '9.5pt', margin: '1pt 0' }}>{item.url}</div>}
        </div>
      ))}
    </>
  );
}

function VolunteeringSection({ items }: { items: VolunteeringItem[] }) {
  return (
    <>
      <SectionHeader>Volunteering &amp; Leadership</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={STYLES.entryHeader}>
            {item.role && <span style={STYLES.entryTitle}>{item.role}</span>}
            {item.startDate || item.endDate ? (
              <span style={STYLES.entryMetaRight}>
                {formatDataRange(item.startDate, item.endDate)}
              </span>
            ) : null}
          </div>
          <div style={STYLES.entryMeta}>{item.organization}</div>
          {item.responsibilities?.map((r, j) => (
            <Bullet key={j}>{r}</Bullet>
          ))}
        </div>
      ))}
    </>
  );
}

function PublicationsSection({ items }: { items: PublicationItem[] }) {
  return (
    <>
      <SectionHeader>Publications</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '4pt' }}>
          <span style={STYLES.entryTitle}>{item.title}</span>
          {item.authors && <span style={STYLES.entryMeta}> — {item.authors}</span>}
          {(item.publisher || item.date) && (
            <span style={STYLES.entryMeta}>
              {' '}
              ({[item.publisher, item.date && formatDate(item.date)].filter(Boolean).join(', ')})
            </span>
          )}
          {item.url && <div style={{ fontSize: '9.5pt', margin: '1pt 0' }}>{item.url}</div>}
        </div>
      ))}
    </>
  );
}
