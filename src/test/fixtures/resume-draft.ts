import type { ResumeDraftContent } from '@/types/resume-draft';

export const sampleResumeDraftContent: ResumeDraftContent = {
  contactInfo: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1-555-0123',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/janedoe',
  },
  targetTitle: 'Senior Frontend Engineer',
  summary: 'Experienced frontend engineer with 8 years building scalable web applications.',
  workExperience: [
    {
      roleId: 'role-1',
      title: 'Senior Frontend Engineer',
      companyName: 'Acme Corp',
      startDate: '2020-01',
      endDate: '2024-01',
      responsibilities: [
        { text: 'Built component library used by 12 teams', source: 'master' },
        { text: 'Led migration from class components to hooks', source: 'master' },
      ],
      achievements: [{ text: 'Reduced bundle size by 40%', source: 'master' }],
      technologies: ['React', 'TypeScript', 'GraphQL'],
      projects: [],
      source: 'master',
    },
  ],
  education: [
    {
      educationId: 'edu-1',
      institution: 'UC Berkeley',
      degree: 'B.S.',
      field: 'Computer Science',
      startDate: '2012-09',
      endDate: '2016-05',
      gpa: '3.8',
      source: 'master',
    },
  ],
  skills: [
    {
      skillId: 'skill-1',
      name: 'TypeScript',
      category: 'Languages',
      level: 'expert',
      source: 'master',
    },
    {
      skillId: 'skill-2',
      name: 'React',
      category: 'Frameworks',
      level: 'expert',
      source: 'master',
    },
    {
      skillId: 'skill-3',
      name: 'Node.js',
      category: 'Backend',
      level: 'advanced',
      source: 'master',
    },
  ],
  certifications: [],
  awards: [],
  projects: [],
  volunteering: [],
  publications: [],
};
