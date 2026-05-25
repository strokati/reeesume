import { AtsSimpleTemplate } from './ats-simple/AtsSimpleTemplate';
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
		component: AtsSimpleTemplate,
	},
	'modern-minimal': {
		id: 'modern-minimal',
		name: 'Modern Minimal',
		description: 'Contemporary design with accent color.',
		component: AtsSimpleTemplate,
	},
	'international-de': {
		id: 'international-de',
		name: 'International / German-style',
		description: 'Includes photo slot, follows DE/AT/CH conventions.',
		component: AtsSimpleTemplate,
	},
};

export function getTemplate(id: string): TemplateDefinition {
	return TEMPLATES[id as TemplateId] ?? TEMPLATES['ats-simple'];
}
