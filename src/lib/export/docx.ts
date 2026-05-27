import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { ResumeData } from '@/lib/templates/types';
import { formatDate } from '@/lib/utils';

export async function renderToDocx(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Name
  if (data.contactInfo.name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.contactInfo.name, bold: true, size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Contact line
  const contactParts: string[] = [];
  if (data.contactInfo.email) contactParts.push(data.contactInfo.email);
  if (data.contactInfo.phone) contactParts.push(data.contactInfo.phone);
  if (data.contactInfo.location) contactParts.push(data.contactInfo.location);
  if (data.contactInfo.linkedin) contactParts.push(data.contactInfo.linkedin);
  if (data.contactInfo.github) contactParts.push(data.contactInfo.github);
  if (data.contactInfo.website) contactParts.push(data.contactInfo.website);
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(' | '), size: 20, color: '333333' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Target title
  if (data.targetTitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.targetTitle, bold: true, size: 22 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Sections in order
  for (const section of data.sectionOrder) {
    switch (section) {
      case 'summary':
        if (data.summary) {
          children.push(sectionHeader('Professional Summary'));
          children.push(
            new Paragraph({
              children: [new TextRun({ text: data.summary, size: 21 })],
              spacing: { after: 150 },
            })
          );
        }
        break;

      case 'workExperience':
        if (data.workExperience.length > 0) {
          children.push(sectionHeader('Work Experience'));
          for (const item of data.workExperience) {
            const titleChildren: TextRun[] = [
              new TextRun({ text: item.title, bold: true, size: 21 }),
            ];
            const dateRange = formatDataRange(item.startDate, item.endDate);
            if (dateRange) titleChildren.push(new TextRun({ text: `\t${dateRange}`, size: 21 }));
            children.push(new Paragraph({ children: titleChildren, spacing: { before: 120 } }));
            children.push(
              new Paragraph({
                children: [new TextRun({ text: item.companyName, size: 21, color: '333333' })],
              })
            );
            if (item.technologies?.length) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Technologies: ${item.technologies.join(', ')}`,
                      size: 19,
                      color: '444444',
                    }),
                  ],
                  spacing: { after: 40 },
                })
              );
            }
            for (const r of item.responsibilities) {
              children.push(bulletParagraph(r));
            }
            for (const a of item.achievements) {
              children.push(bulletParagraph(a));
            }
          }
        }
        break;

      case 'education':
        if (data.education.length > 0) {
          children.push(sectionHeader('Education'));
          for (const item of data.education) {
            const degreeText =
              item.degree && item.field
                ? `${item.degree} in ${item.field}`
                : item.degree || item.field || '';
            const eduChildren: TextRun[] = [
              new TextRun({ text: degreeText, bold: true, size: 21 }),
            ];
            const dateRange = formatDataRange(item.startDate, item.endDate);
            if (dateRange) eduChildren.push(new TextRun({ text: `\t${dateRange}`, size: 21 }));
            children.push(new Paragraph({ children: eduChildren, spacing: { before: 100 } }));
            const institution = item.location
              ? `${item.institution}, ${item.location}`
              : item.institution;
            children.push(
              new Paragraph({
                children: [new TextRun({ text: institution, size: 21, color: '333333' })],
              })
            );
            const extra: string[] = [];
            if (item.gpa) extra.push(`GPA: ${item.gpa}`);
            if (item.honors) extra.push(item.honors);
            if (extra.length) {
              children.push(
                new Paragraph({ children: [new TextRun({ text: extra.join(' | '), size: 19 })] })
              );
            }
          }
        }
        break;

      case 'skills':
        if (data.skills.length > 0) {
          children.push(sectionHeader('Skills'));
          const grouped = new Map<string, string[]>();
          for (const s of data.skills) {
            const cat = s.category || 'Other';
            const list = grouped.get(cat) || [];
            list.push(s.name);
            grouped.set(cat, list);
          }
          for (const [category, names] of grouped) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${category}: `, bold: true, size: 21 }),
                  new TextRun({ text: names.join(', '), size: 21 }),
                ],
                spacing: { after: 60 },
              })
            );
          }
        }
        break;

      case 'certifications':
        if (data.certifications.length > 0) {
          children.push(sectionHeader('Certifications'));
          for (const item of data.certifications) {
            const parts: string[] = [item.name];
            if (item.issuer) parts.push(item.issuer);
            if (item.issueDate) parts.push(formatDate(item.issueDate));
            children.push(
              new Paragraph({
                children: [new TextRun({ text: parts.join(' — '), size: 21 })],
                spacing: { after: 40 },
              })
            );
          }
        }
        break;

      case 'awards':
        if (data.awards.length > 0) {
          children.push(sectionHeader('Awards & Scholarships'));
          for (const item of data.awards) {
            const parts: string[] = [item.title];
            if (item.issuer) parts.push(item.issuer);
            if (item.date) parts.push(formatDate(item.date));
            children.push(
              new Paragraph({
                children: [new TextRun({ text: parts.join(' — '), size: 21 })],
                spacing: { after: 40 },
              })
            );
          }
        }
        break;

      case 'projects':
        if (data.projects.length > 0) {
          children.push(sectionHeader('Projects'));
          for (const item of data.projects) {
            const projChildren: TextRun[] = [
              new TextRun({ text: item.name, bold: true, size: 21 }),
            ];
            if (item.role)
              projChildren.push(
                new TextRun({ text: ` — ${item.role}`, size: 21, color: '333333' })
              );
            children.push(new Paragraph({ children: projChildren, spacing: { before: 100 } }));
            if (item.description) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: item.description, size: 21 })],
                  spacing: { after: 40 },
                })
              );
            }
            if (item.technologies?.length) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Technologies: ${item.technologies.join(', ')}`,
                      size: 19,
                      color: '444444',
                    }),
                  ],
                })
              );
            }
          }
        }
        break;

      case 'volunteering':
        if (data.volunteering.length > 0) {
          children.push(sectionHeader('Volunteering & Leadership'));
          for (const item of data.volunteering) {
            const volChildren: TextRun[] = [];
            if (item.role) volChildren.push(new TextRun({ text: item.role, bold: true, size: 21 }));
            const dateRange = formatDataRange(item.startDate, item.endDate);
            if (dateRange) volChildren.push(new TextRun({ text: `\t${dateRange}`, size: 21 }));
            children.push(new Paragraph({ children: volChildren, spacing: { before: 100 } }));
            children.push(
              new Paragraph({
                children: [new TextRun({ text: item.organization, size: 21, color: '333333' })],
              })
            );
            if (item.responsibilities) {
              for (const r of item.responsibilities) {
                children.push(bulletParagraph(r));
              }
            }
          }
        }
        break;

      case 'publications':
        if (data.publications.length > 0) {
          children.push(sectionHeader('Publications'));
          for (const item of data.publications) {
            const parts: string[] = [item.title];
            if (item.authors) parts.push(item.authors);
            const meta: string[] = [];
            if (item.publisher) meta.push(item.publisher);
            if (item.date) meta.push(formatDate(item.date));
            if (meta.length) parts.push(`(${meta.join(', ')})`);
            children.push(
              new Paragraph({
                children: [new TextRun({ text: parts.join(' — '), size: 21 })],
                spacing: { after: 60 },
              })
            );
          }
        }
        break;
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc) as Promise<Buffer>;
}

function sectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22 })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    border: { bottom: { style: 'single' as const, size: 6, color: '1a1a1a' } },
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 21 })],
    spacing: { after: 20 },
    indent: { left: 360 },
  });
}

function formatDataRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  return `${formatDate(start)} – ${formatDate(end)}`;
}
