export type TemplateId = 'ats-simple' | 'professional-classic' | 'modern-minimal' | 'international-de';

export interface ContactInfo {
	name?: string;
	email?: string;
	phone?: string;
	location?: string;
	linkedin?: string;
	github?: string;
	website?: string;
	dateOfBirth?: string;
	nationality?: string;
	maritalStatus?: string;
	photoUrl?: string;
}

export interface WorkExperienceItem {
	companyName: string;
	title: string;
	startDate?: string;
	endDate?: string;
	responsibilities: string[];
	achievements: string[];
	technologies?: string[];
}

export interface EducationItem {
	institution: string;
	degree?: string;
	field?: string;
	location?: string;
	startDate?: string;
	endDate?: string;
	gpa?: string;
	honors?: string;
}

export interface SkillItem {
	name: string;
	category?: string;
	level?: string;
}

export interface CertificationItem {
	name: string;
	issuer?: string;
	issueDate?: string;
}

export interface AwardItem {
	title: string;
	issuer?: string;
	date?: string;
}

export interface ProjectItem {
	name: string;
	description?: string;
	role?: string;
	technologies?: string[];
	url?: string;
}

export interface VolunteeringItem {
	organization: string;
	role?: string;
	startDate?: string;
	endDate?: string;
	responsibilities?: string[];
}

export interface PublicationItem {
	title: string;
	authors?: string;
	publisher?: string;
	date?: string;
	url?: string;
}

export interface ResumeData {
	contactInfo: ContactInfo;
	targetTitle?: string;
	summary?: string;
	accentColor?: string;
	workExperience: WorkExperienceItem[];
	education: EducationItem[];
	skills: SkillItem[];
	certifications: CertificationItem[];
	awards: AwardItem[];
	projects: ProjectItem[];
	volunteering: VolunteeringItem[];
	publications: PublicationItem[];
	sectionOrder: string[];
}

export interface TemplateProps {
	data: ResumeData;
	accentColor?: string;
}

export interface TemplateDefinition {
	id: TemplateId;
	name: string;
	description: string;
	component: React.ComponentType<TemplateProps>;
}

export const DEFAULT_SECTION_ORDER = [
	'summary',
	'workExperience',
	'skills',
	'education',
	'certifications',
	'awards',
	'projects',
	'volunteering',
	'publications',
];
