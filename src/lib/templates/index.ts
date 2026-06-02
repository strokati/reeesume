import { AtsSimpleTemplate } from './ats-simple/AtsSimpleTemplate';
import { ProfessionalClassicTemplate } from './professional-classic/ProfessionalClassicTemplate';
import { ModernMinimalTemplate } from './modern-minimal/ModernMinimalTemplate';
import { InternationalDeTemplate } from './international-de/InternationalDeTemplate';
import { BlueProfessionalTemplate } from './blue-professional/BlueProfessionalTemplate';
import type { TemplateId, TemplateDefinition } from './types';

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  'ats-simple': {
    id: 'ats-simple',
    name: 'ATS Simple',
    description: 'Single-column, no tables or graphics. Maximum ATS compatibility.',
    component: AtsSimpleTemplate,
  },
  'professional-classic': {
    id: 'professional-classic',
    name: 'Professional Classic',
    description: 'Two-column layout with subtle formatting.',
    component: ProfessionalClassicTemplate,
  },
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Contemporary design with accent color.',
    component: ModernMinimalTemplate,
  },
  'international-de': {
    id: 'international-de',
    name: 'International / German-style',
    description: 'Includes photo slot, follows DE/AT/CH conventions.',
    component: InternationalDeTemplate,
  },
  'blue-professional': {
    id: 'blue-professional',
    name: 'Blue Professional',
    description:
      'Clean single-column with blue accents, project sub-entries, and inline stack lines.',
    component: BlueProfessionalTemplate,
  },
};

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES[id as TemplateId] ?? TEMPLATES['ats-simple'];
}
