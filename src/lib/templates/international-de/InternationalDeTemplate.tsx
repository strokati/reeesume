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

function formatDeDate(date: string | Date | null | undefined): string {
  if (!date) return 'heute';
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function deDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  return `${formatDeDate(start)} – ${formatDeDate(end)}`;
}

export function InternationalDeTemplate({ data }: TemplateProps) {
  const { contactInfo, targetTitle, summary } = data;
  const deSectionOrder = [
    'workExperience',
    'education',
    'skills',
    'certifications',
    'awards',
    'projects',
    'volunteering',
    'publications',
  ];

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '10pt',
        lineHeight: 1.45,
        color: '#222',
        padding: '0.5in',
        maxWidth: '8.5in',
        boxSizing: 'border-box' as const,
      }}
    >
      {/* Header with photo */}
      <div style={{ display: 'flex', marginBottom: '12pt' }}>
        <div style={{ flex: 1 }}>
          {contactInfo.name && (
            <h1
              style={{ fontSize: '18pt', fontWeight: 700, margin: '0 0 4pt 0', color: '#1a1a1a' }}
            >
              {contactInfo.name}
            </h1>
          )}
          {targetTitle && (
            <p style={{ fontSize: '11pt', color: '#444', margin: '0 0 8pt 0', fontWeight: 500 }}>
              {targetTitle}
            </p>
          )}
        </div>
        <div
          style={{
            width: '100px',
            height: '125px',
            border: '1.5pt solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '8pt',
            textAlign: 'center' as const,
            flexShrink: 0,
            overflow: 'hidden' as const,
          }}
        >
          {contactInfo.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={contactInfo.photoUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
            />
          ) : (
            'Photo'
          )}
        </div>
      </div>

      {/* Personal data */}
      <SectionHeader>Persönliche Daten</SectionHeader>
      <table
        style={{ fontSize: '9.5pt', borderCollapse: 'collapse' as const, marginBottom: '4pt' }}
      >
        <tbody>
          <ContactRow label="Adresse" value={contactInfo.location} />
          <ContactRow label="Telefon" value={contactInfo.phone} />
          <ContactRow label="E-Mail" value={contactInfo.email} />
          {contactInfo.dateOfBirth && (
            <ContactRow label="Geburtsdatum" value={formatDeDate(contactInfo.dateOfBirth)} />
          )}
          {contactInfo.nationality && (
            <ContactRow label="Staatsangehörigkeit" value={contactInfo.nationality} />
          )}
          {contactInfo.maritalStatus && (
            <ContactRow label="Familienstand" value={contactInfo.maritalStatus} />
          )}
          <ContactRow label="LinkedIn" value={contactInfo.linkedin} />
          <ContactRow label="GitHub" value={contactInfo.github} />
          <ContactRow label="Web" value={contactInfo.website} />
        </tbody>
      </table>

      {/* Summary */}
      {summary && (
        <>
          <SectionHeader>Profil</SectionHeader>
          <p style={{ margin: '0 0 4pt 0', textAlign: 'justify' as const }}>{summary}</p>
        </>
      )}

      {/* Sections in DE order */}
      {deSectionOrder.map((section) => {
        if (!data.sectionOrder.includes(section)) return null;
        switch (section) {
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
              <SkillsSection key={section} items={data.skills} />
            ) : null;
          case 'certifications':
            return data.certifications.length > 0 ? (
              <CertsSection key={section} items={data.certifications} />
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
  return (
    <h2
      style={{
        fontSize: '11pt',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5pt',
        borderBottom: '1pt solid #333',
        margin: '12pt 0 6pt 0',
        paddingBottom: '2pt',
      }}
    >
      {children}
    </h2>
  );
}

function ContactRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <tr>
      <td
        style={{
          padding: '1pt 8pt 1pt 0',
          fontWeight: 600,
          color: '#555',
          verticalAlign: 'top' as const,
          whiteSpace: 'nowrap' as const,
        }}
      >
        {label}
      </td>
      <td style={{ padding: '1pt 0' }}>{value}</td>
    </tr>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '1pt 0 1pt 10pt', textIndent: '-8pt' }}>• {children}</p>;
}

function WorkSection({ items }: { items: WorkExperienceItem[] }) {
  return (
    <>
      <SectionHeader>Berufserfahrung</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '8pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 700 }}>{item.title}</span>
            <span style={{ fontSize: '9.5pt', color: '#555' }}>
              {deDateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#444', fontWeight: 500, marginBottom: '2pt' }}>
            {item.companyName}
          </div>
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ fontSize: '8.5pt', color: '#666', margin: '1pt 0' }}>
              {item.technologies.join(', ')}
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
      <SectionHeader>Bildung</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 700 }}>
              {item.degree && item.field
                ? `${item.degree} in ${item.field}`
                : item.degree || item.field}
            </span>
            <span style={{ fontSize: '9.5pt', color: '#555' }}>
              {deDateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#444' }}>
            {item.institution}
            {item.location ? `, ${item.location}` : ''}
          </div>
          {(item.gpa || item.honors) && (
            <div style={{ fontSize: '9pt', color: '#666' }}>
              {item.gpa && `Note: ${item.gpa}`}
              {item.gpa && item.honors && ' · '}
              {item.honors}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function SkillsSection({ items }: { items: SkillItem[] }) {
  const grouped = new Map<string, SkillItem[]>();
  for (const s of items) {
    const cat = s.category || 'Other';
    const list = grouped.get(cat) || [];
    list.push(s);
    grouped.set(cat, list);
  }
  return (
    <>
      <SectionHeader>Kenntnisse</SectionHeader>
      {Array.from(grouped.entries()).map(([cat, skills]) => (
        <p key={cat} style={{ margin: '0 0 4pt 0' }}>
          <span style={{ fontWeight: 600 }}>{cat}: </span>
          {skills.map((s) => s.name).join(', ')}
        </p>
      ))}
    </>
  );
}

function CertsSection({ items }: { items: CertificationItem[] }) {
  return (
    <>
      <SectionHeader>Zertifikate</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={{ fontWeight: 600 }}>{item.name}</span>
          {item.issuer && <span style={{ color: '#555' }}> — {item.issuer}</span>}
          {item.issueDate && (
            <span style={{ color: '#555' }}> ({formatDeDate(item.issueDate)})</span>
          )}
        </div>
      ))}
    </>
  );
}

function AwardsSection({ items }: { items: AwardItem[] }) {
  return (
    <>
      <SectionHeader>Auszeichnungen</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '3pt' }}>
          <span style={{ fontWeight: 600 }}>{item.title}</span>
          {item.issuer && <span style={{ color: '#555' }}> — {item.issuer}</span>}
          {item.date && <span style={{ color: '#555' }}> ({formatDeDate(item.date)})</span>}
        </div>
      ))}
    </>
  );
}

function ProjectsSection({ items }: { items: ProjectItem[] }) {
  return (
    <>
      <SectionHeader>Projekte</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <span style={{ fontWeight: 700 }}>{item.name}</span>
          {item.role && <span style={{ color: '#555' }}> — {item.role}</span>}
          {item.description && (
            <p style={{ margin: '2pt 0', fontSize: '9.5pt' }}>{item.description}</p>
          )}
          {item.technologies && item.technologies.length > 0 && (
            <div style={{ fontSize: '8.5pt', color: '#666' }}>{item.technologies.join(', ')}</div>
          )}
        </div>
      ))}
    </>
  );
}

function VolunteeringSection({ items }: { items: VolunteeringItem[] }) {
  return (
    <>
      <SectionHeader>Ehrenamt</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' as const }}>
            <span style={{ fontWeight: 600 }}>{item.role}</span>
            <span style={{ fontSize: '9.5pt', color: '#555' }}>
              {deDateRange(item.startDate, item.endDate)}
            </span>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#444' }}>{item.organization}</div>
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
      <SectionHeader>Publikationen</SectionHeader>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: '4pt' }}>
          <span style={{ fontWeight: 600 }}>{item.title}</span>
          {item.authors && <span style={{ color: '#555' }}> — {item.authors}</span>}
          {(item.publisher || item.date) && (
            <span style={{ color: '#555' }}>
              {' '}
              ({[item.publisher, item.date && formatDeDate(item.date)].filter(Boolean).join(', ')})
            </span>
          )}
        </div>
      ))}
    </>
  );
}
