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

const NAVY = '#1e3a5f';
const NAVY_LIGHT = '#f0f4f8';

function dateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function ProfessionalClassicTemplate({ data }: TemplateProps) {
  const { contactInfo, targetTitle, summary, sectionOrder } = data;

  const sidebarSections = ['skills', 'certifications', 'awards'];
  const mainSections = sectionOrder.filter((s) => !sidebarSections.includes(s));

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '10pt',
        lineHeight: 1.4,
        color: '#222',
        display: 'flex',
        minHeight: '100%',
        WebkitBoxDecorationBreak: 'clone' as const,
        boxDecorationBreak: 'clone' as const,
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          width: '30%',
          backgroundColor: NAVY_LIGHT,
          padding: '0.4in 0.3in',
          boxSizing: 'border-box' as const,
        }}
      >
        {contactInfo.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contactInfo.photoUrl}
            alt=""
            style={{
              width: '80px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '4px',
              marginBottom: '8pt',
            }}
          />
        )}
        <h1 style={{ fontSize: '16pt', fontWeight: 700, color: NAVY, margin: '0 0 2pt 0' }}>
          {contactInfo.name}
        </h1>
        {targetTitle && (
          <p style={{ fontSize: '9.5pt', color: '#555', margin: '0 0 12pt 0', fontWeight: 600 }}>
            {targetTitle}
          </p>
        )}

        <ContactBlock contactInfo={contactInfo} />

        {sidebarSections.map((section) => {
          switch (section) {
            case 'skills':
              return data.skills.length > 0 ? (
                <SidebarSkills key={section} items={data.skills} />
              ) : null;
            case 'certifications':
              return data.certifications.length > 0 ? (
                <SidebarCertifications key={section} items={data.certifications} />
              ) : null;
            case 'awards':
              return data.awards.length > 0 ? (
                <SidebarAwards key={section} items={data.awards} />
              ) : null;
            default:
              return null;
          }
        })}
      </div>

      {/* Right main */}
      <div style={{ width: '70%', padding: '0.4in 0.35in', boxSizing: 'border-box' as const }}>
        {mainSections.map((section) => {
          switch (section) {
            case 'summary':
              return summary ? <SummarySection key={section} summary={summary} /> : null;
            case 'workExperience':
              return data.workExperience.length > 0 ? (
                <WorkSection key={section} items={data.workExperience} />
              ) : null;
            case 'education':
              return data.education.length > 0 ? (
                <EducationSection key={section} items={data.education} />
              ) : null;
            case 'skills':
              return data.skills.length > 0 ? (
                <MainSkills key={section} items={data.skills} />
              ) : null;
            case 'certifications':
              return data.certifications.length > 0 ? (
                <MainCerts key={section} items={data.certifications} />
              ) : null;
            case 'awards':
              return data.awards.length > 0 ? (
                <MainAwards key={section} items={data.awards} />
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
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '11pt',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5pt',
        backgroundColor: NAVY,
        color: '#fff',
        padding: '4pt 8pt',
        margin: '14pt 0 8pt 0',
      }}
    >
      {children}
    </h2>
  );
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: '10pt',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5pt',
        color: NAVY,
        borderBottom: `1.5pt solid ${NAVY}`,
        paddingBottom: '2pt',
        margin: '12pt 0 6pt 0',
      }}
    >
      {children}
    </h3>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '1pt 0 1pt 10pt', textIndent: '-8pt', fontSize: '9.5pt' }}>• {children}</p>
  );
}

function ContactBlock({ contactInfo }: { contactInfo: TemplateProps['data']['contactInfo'] }) {
  const lines: { label: string; value: string }[] = [];
  if (contactInfo.email) lines.push({ label: 'Email', value: contactInfo.email });
  if (contactInfo.phone) lines.push({ label: 'Phone', value: contactInfo.phone });
  if (contactInfo.location) lines.push({ label: 'Location', value: contactInfo.location });
  if (contactInfo.linkedin) lines.push({ label: 'LinkedIn', value: contactInfo.linkedin });
  if (contactInfo.github) lines.push({ label: 'GitHub', value: contactInfo.github });
  if (contactInfo.website) lines.push({ label: 'Web', value: contactInfo.website });

  return (
    <div style={{ fontSize: '9pt', marginBottom: '4pt' }}>
      {lines.map((l) => (
        <div key={l.label} style={{ marginBottom: '3pt' }}>
          <span style={{ fontWeight: 600, color: NAVY }}>{l.label}: </span>
          <span style={{ color: '#444' }}>{l.value}</span>
        </div>
      ))}
    </div>
  );
}

function SidebarSkills({ items }: { items: SkillItem[] }) {
  const grouped = new Map<string, SkillItem[]>();
  for (const s of items) {
    const cat = s.category || 'Other';
    const list = grouped.get(cat) || [];
    list.push(s);
    grouped.set(cat, list);
  }
  return (
    <>
      <SidebarHeader>Skills</SidebarHeader>
      {Array.from(grouped.entries()).map(([cat, skills]) => (
        <div key={cat} style={{ marginBottom: '4pt', fontSize: '9pt' }}>
          <span style={{ fontWeight: 600 }}>{cat}: </span>
          <span style={{ color: '#444' }}>{skills.map((s) => s.name).join(', ')}</span>
        </div>
      ))}
    </>
  );
}

function SidebarCertifications({ items }: { items: CertificationItem[] }) {
  return (
    <>
      <SidebarHeader>Certifications</SidebarHeader>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: '9pt', marginBottom: '3pt' }}>
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          {item.issuer && (
            <div style={{ color: '#555' }}>
              {item.issuer}
              {item.issueDate ? ` · ${formatDate(item.issueDate)}` : ''}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function SidebarAwards({ items }: { items: AwardItem[] }) {
  return (
    <>
      <SidebarHeader>Awards</SidebarHeader>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: '9pt', marginBottom: '3pt' }}>
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          {item.issuer && (
            <div style={{ color: '#555' }}>
              {item.issuer}
              {item.date ? ` · ${formatDate(item.date)}` : ''}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function SummarySection({ summary }: { summary: string }) {
  return (
    <>
      <SectionHeader>Professional Summary</SectionHeader>
      <p style={{ margin: '0 0 4pt 0', textAlign: 'justify' as const }}>{summary}</p>
    </>
  );
}

function WorkSection({ items }: { items: WorkExperienceItem[] }) {
  return (
    <>
      <SectionHeader>Work Experience</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '10pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{item.title}</span>
            <span style={{ fontSize: '9.5pt', color: '#555' }}>
              {dateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: NAVY, fontWeight: 600, marginBottom: '2pt' }}>
            {item.companyName}
          </div>
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ fontSize: '8.5pt', color: '#666', marginBottom: '2pt' }}>
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

function EducationSection({ items }: { items: EducationItem[] }) {
  return (
    <>
      <SectionHeader>Education</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 700 }}>
              {item.degree && item.field
                ? `${item.degree} in ${item.field}`
                : item.degree || item.field}
            </span>
            <span style={{ fontSize: '9.5pt', color: '#555' }}>
              {dateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#444' }}>
            {item.institution}
            {item.location ? `, ${item.location}` : ''}
          </div>
          {(item.gpa || item.honors) && (
            <div style={{ fontSize: '9pt', color: '#555' }}>
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

function MainSkills({ items }: { items: SkillItem[] }) {
  const grouped = new Map<string, SkillItem[]>();
  for (const s of items) {
    const cat = s.category || 'Other';
    const list = grouped.get(cat) || [];
    list.push(s);
    grouped.set(cat, list);
  }
  return (
    <>
      <SectionHeader>Skills</SectionHeader>
      {Array.from(grouped.entries()).map(([cat, skills]) => (
        <p key={cat} style={{ margin: '0 0 4pt 0' }}>
          <span style={{ fontWeight: 600 }}>{cat}: </span>
          {skills.map((s) => s.name).join(', ')}
        </p>
      ))}
    </>
  );
}

function MainCerts({ items }: { items: CertificationItem[] }) {
  return (
    <>
      <SectionHeader>Certifications</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={{ fontWeight: 600 }}>{item.name}</span>
          {item.issuer && <span style={{ color: '#555' }}> — {item.issuer}</span>}
          {item.issueDate && <span style={{ color: '#555' }}> ({formatDate(item.issueDate)})</span>}
        </div>
      ))}
    </>
  );
}

function MainAwards({ items }: { items: AwardItem[] }) {
  return (
    <>
      <SectionHeader>Awards</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={{ fontWeight: 600 }}>{item.title}</span>
          {item.issuer && <span style={{ color: '#555' }}> — {item.issuer}</span>}
          {item.date && <span style={{ color: '#555' }}> ({formatDate(item.date)})</span>}
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
          <span style={{ fontWeight: 700 }}>{item.name}</span>
          {item.role && <span style={{ color: '#555' }}> — {item.role}</span>}
          {item.description && (
            <p style={{ margin: '2pt 0', fontSize: '9.5pt' }}>{item.description}</p>
          )}
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ fontSize: '8.5pt', color: '#666' }}>{item.technologies.join(' · ')}</div>
          )}
        </div>
      ))}
    </>
  );
}

function VolunteeringSection({ items }: { items: VolunteeringItem[] }) {
  return (
    <>
      <SectionHeader>Volunteering</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 700 }}>{item.role}</span>
            <span style={{ fontSize: '9.5pt', color: '#555' }}>
              {dateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: NAVY, fontWeight: 600 }}>{item.organization}</div>
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
          <span style={{ fontWeight: 600 }}>{item.title}</span>
          {item.authors && <span style={{ color: '#555' }}> — {item.authors}</span>}
          {(item.publisher || item.date) && (
            <span style={{ color: '#555' }}>
              {' '}
              ({[item.publisher, item.date && formatDate(item.date)].filter(Boolean).join(', ')})
            </span>
          )}
        </div>
      ))}
    </>
  );
}
