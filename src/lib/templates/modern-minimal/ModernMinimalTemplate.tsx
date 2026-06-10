import type {
  TemplateProps,
  WorkExperienceItem,
  EducationItem,
  SkillItem,
  CertificationItem,
  AwardItem,
  ProjectItem,
  VolunteeringItem,
  PublicationItem,
} from '../types';
import { formatDate } from '@/lib/utils';

function dateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function ModernMinimalTemplate({ data }: TemplateProps) {
  const { contactInfo, targetTitle, summary, sectionOrder } = data;
  const accent = data.accentColor || '#3b82f6';

  const contactParts: string[] = [];
  if (contactInfo.email) contactParts.push(contactInfo.email);
  if (contactInfo.phone) contactParts.push(contactInfo.phone);
  if (contactInfo.location) contactParts.push(contactInfo.location);
  if (contactInfo.linkedin) contactParts.push(contactInfo.linkedin);
  if (contactInfo.github) contactParts.push(contactInfo.github);
  if (contactInfo.website) contactParts.push(contactInfo.website);

  return (
    <div
      style={{
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '10.5pt',
        lineHeight: 1.5,
        color: '#1a1a1a',
        padding: '0.5in',
        maxWidth: '8.5in',
        boxSizing: 'border-box' as const,
        WebkitBoxDecorationBreak: 'clone' as const,
        boxDecorationBreak: 'clone' as const,
      }}
    >
      {/* Name + Photo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {contactInfo.name && (
            <h1
              style={{
                fontSize: '26pt',
                fontWeight: 300,
                margin: '0 0 4pt 0',
                letterSpacing: '1pt',
                paddingBottom: '6pt',
                borderBottom: `2px solid ${accent}`,
              }}
            >
              {contactInfo.name}
            </h1>
          )}
        </div>
        {contactInfo.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contactInfo.photoUrl}
            alt=""
            style={{
              width: '70px',
              height: '70px',
              objectFit: 'cover',
              borderRadius: '50%',
              marginLeft: '12pt',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Target title */}
      {targetTitle && (
        <p style={{ fontSize: '11pt', fontWeight: 500, color: accent, margin: '4pt 0 6pt 0' }}>
          {targetTitle}
        </p>
      )}

      {/* Contact */}
      {contactParts.length > 0 && (
        <p style={{ fontSize: '9pt', color: '#666', margin: '0 0 16pt 0' }}>
          {contactParts.join('  ·  ')}
        </p>
      )}

      {/* Sections */}
      {sectionOrder.map((section) => {
        switch (section) {
          case 'summary':
            return summary ? (
              <SummarySection key={section} summary={summary} accent={accent} />
            ) : null;
          case 'workExperience':
            return data.workExperience.length > 0 ? (
              <WorkSection key={section} items={data.workExperience} accent={accent} />
            ) : null;
          case 'education':
            return data.education.length > 0 ? (
              <EducationSection key={section} items={data.education} accent={accent} />
            ) : null;
          case 'skills':
            return data.skills.length > 0 ? (
              <SkillsSection key={section} items={data.skills} accent={accent} />
            ) : null;
          case 'certifications':
            return data.certifications.length > 0 ? (
              <CertsSection key={section} items={data.certifications} accent={accent} />
            ) : null;
          case 'awards':
            return data.awards.length > 0 ? (
              <AwardsSection key={section} items={data.awards} accent={accent} />
            ) : null;
          case 'projects':
            return data.projects.length > 0 ? (
              <ProjectsSection key={section} items={data.projects} accent={accent} />
            ) : null;
          case 'volunteering':
            return data.volunteering.length > 0 ? (
              <VolunteeringSection key={section} items={data.volunteering} accent={accent} />
            ) : null;
          case 'publications':
            return data.publications.length > 0 ? (
              <PublicationsSection key={section} items={data.publications} accent={accent} />
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}

function SectionHeader({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2
      style={{
        fontSize: '10pt',
        fontWeight: 600,
        fontVariant: 'small-caps' as const,
        letterSpacing: '1.5pt',
        textTransform: 'lowercase' as const,
        color: '#333',
        borderLeft: `3px solid ${accent}`,
        paddingLeft: '8pt',
        margin: '16pt 0 8pt 0',
      }}
    >
      {children}
    </h2>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '1pt 0 1pt 10pt', textIndent: '-8pt' }}>• {children}</p>;
}

function SummarySection({ summary, accent }: { summary: string; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Summary</SectionHeader>
      <p style={{ margin: '0 0 4pt 0', color: '#444' }}>{summary}</p>
    </>
  );
}

function WorkSection({ items, accent }: { items: WorkExperienceItem[]; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Experience</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '10pt' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between' as const,
              alignItems: 'baseline' as const,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '10.5pt' }}>{item.title}</span>
            <span style={{ fontSize: '9pt', color: '#888' }}>
              {dateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: accent, fontWeight: 500 }}>
            {item.companyName}
          </div>
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ margin: '2pt 0', fontSize: '8.5pt', color: '#666' }}>
              {item.technologies.join(' · ')}
            </div>
          )}
          {item.responsibilities.map((r, j) => (
            <Bullet key={`r-${j}`}>{r}</Bullet>
          ))}
          {item.achievements.map((a, j) => (
            <Bullet key={`a-${j}`}>{a}</Bullet>
          ))}
        </div>
      ))}
    </>
  );
}

function EducationSection({ items, accent }: { items: EducationItem[]; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Education</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 600 }}>
              {item.degree && item.field
                ? `${item.degree} in ${item.field}`
                : item.degree || item.field}
            </span>
            <span style={{ fontSize: '9pt', color: '#888' }}>
              {dateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#555' }}>
            {item.institution}
            {item.location ? `, ${item.location}` : ''}
          </div>
          {(item.gpa || item.honors) && (
            <div style={{ fontSize: '9pt', color: '#666' }}>
              {item.gpa && `GPA: ${item.gpa}`}
              {item.gpa && item.honors && ' · '}
              {item.honors}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function SkillsSection({ items, accent }: { items: SkillItem[]; accent: string }) {
  const grouped = new Map<string, SkillItem[]>();
  for (const s of items) {
    const cat = s.category || 'Other';
    const list = grouped.get(cat) || [];
    list.push(s);
    grouped.set(cat, list);
  }
  return (
    <>
      <SectionHeader accent={accent}>Skills</SectionHeader>
      {Array.from(grouped.entries()).map(([cat, skills]) => (
        <div key={cat} style={{ marginBottom: '6pt' }}>
          <span style={{ fontWeight: 600, fontSize: '9.5pt', marginRight: '6pt' }}>{cat}:</span>
          {skills.map((s) => (
            <span
              key={s.name}
              style={{
                display: 'inline-block' as const,
                fontSize: '8.5pt',
                padding: '2pt 6pt',
                margin: '0 3pt 3pt 0',
                borderRadius: '3pt',
                backgroundColor: `${accent}15`,
                color: accent,
                border: `1px solid ${accent}40`,
              }}
            >
              {s.name}
            </span>
          ))}
        </div>
      ))}
    </>
  );
}

function CertsSection({ items, accent }: { items: CertificationItem[]; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Certifications</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={{ fontWeight: 600 }}>{item.name}</span>
          {item.issuer && <span style={{ color: '#666' }}> — {item.issuer}</span>}
          {item.issueDate && <span style={{ color: '#888' }}> ({formatDate(item.issueDate)})</span>}
        </div>
      ))}
    </>
  );
}

function AwardsSection({ items, accent }: { items: AwardItem[]; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Awards</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={{ fontWeight: 600 }}>{item.title}</span>
          {item.issuer && <span style={{ color: '#666' }}> — {item.issuer}</span>}
          {item.date && <span style={{ color: '#888' }}> ({formatDate(item.date)})</span>}
        </div>
      ))}
    </>
  );
}

function ProjectsSection({ items, accent }: { items: ProjectItem[]; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Projects</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '8pt' }}>
          <span style={{ fontWeight: 700 }}>{item.name}</span>
          {item.role && <span style={{ color: '#666' }}> — {item.role}</span>}
          {item.description && (
            <p style={{ margin: '2pt 0', color: '#444', fontSize: '9.5pt' }}>{item.description}</p>
          )}
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ fontSize: '8.5pt', color: '#666', margin: '1pt 0' }}>
              {item.technologies.join(' · ')}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function VolunteeringSection({ items, accent }: { items: VolunteeringItem[]; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Volunteering</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 600 }}>{item.role}</span>
            <span style={{ fontSize: '9pt', color: '#888' }}>
              {dateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: accent, fontWeight: 500 }}>
            {item.organization}
          </div>
          {item.responsibilities?.map((r, j) => (
            <Bullet key={j}>{r}</Bullet>
          ))}
        </div>
      ))}
    </>
  );
}

function PublicationsSection({ items, accent }: { items: PublicationItem[]; accent: string }) {
  return (
    <>
      <SectionHeader accent={accent}>Publications</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '4pt' }}>
          <span style={{ fontWeight: 600 }}>{item.title}</span>
          {item.authors && <span style={{ color: '#666' }}> — {item.authors}</span>}
          {(item.publisher || item.date) && (
            <span style={{ color: '#888' }}>
              {' '}
              ({[item.publisher, item.date && formatDate(item.date)].filter(Boolean).join(', ')})
            </span>
          )}
        </div>
      ))}
    </>
  );
}
