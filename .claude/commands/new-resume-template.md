# New Resume Template

Add a new built-in resume template component for PDF/DOCX export.

## Arguments

$ARGUMENTS — template name and description, e.g. `executive-two-column - Bold two-column layout for senior roles`

## Steps to follow

### 1. Choose a template ID

Use kebab-case, e.g. `executive-two-column`. This ID is stored in the database and used for export.

### 2. Create the template component

Create `src/components/resume-templates/[TemplateId].tsx`:

```tsx
import type { ResumeData } from '@/types/resume';

interface ResumeTemplateProps {
  data: ResumeData;
}

export function ExecutiveTwoColumn({ data }: ResumeTemplateProps) {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black p-8 font-serif text-[10pt] leading-tight">
      {/* Header: name + contact */}
      {/* Two-column layout */}
      {/* Left: experience, education */}
      {/* Right: skills, certifications, awards */}
    </div>
  );
}
```

### 3. Register the template

Add to the template registry (wherever templates are mapped by ID). Include:

- `id`: the kebab-case ID
- `name`: display name
- `description`: one-line description
- `component`: the React component

### 4. Design rules

- **Dimensions**: Render at A4 size (`210mm × 297mm`). Use `mm` units or the Puppeteer viewport equivalent.
- **Typography**: Serif for traditional templates, sans-serif for modern ones. Keep base font at 10pt.
- **ATS compatibility**: Avoid tables, graphics, columns, or absolutely positioned elements unless the template explicitly trades design for ATS score.
- **Color**: Use only black/dark grey text. Accent colors are fine for lines/dividers.
- **Sections**: The template receives a `ResumeData` prop with all sections. Render what's available, skip empty sections.

### 5. Test with Puppeteer

```bash
# Create a test draft, select the template, export as PDF
# Verify: layout, pagination, no text cutoff, correct font rendering
```

### 6. Constraints (v1)

- No custom template creation by users in v1 — all templates are built-in.
- Templates are React components rendered as HTML → Puppeteer captures to PDF.
- The `data` prop is the single source of truth — no fetching inside templates.
