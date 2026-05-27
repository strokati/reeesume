import type { ResumeData } from './types';
import { DEFAULT_SECTION_ORDER } from './types';

export const SAMPLE_RESUME_DATA: ResumeData = {
  contactInfo: {
    name: 'Alexandra Chen',
    email: 'alex.chen@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    website: 'alexchen.dev',
  },
  targetTitle: 'Senior Software Engineer',
  summary:
    'Results-driven software engineer with 8+ years of experience building scalable web applications and leading cross-functional teams. Passionate about clean architecture, developer experience, and mentoring junior engineers. Proven track record of delivering high-impact features that drive user growth and revenue.',
  workExperience: [
    {
      companyName: 'TechCorp Inc.',
      title: 'Senior Software Engineer',
      startDate: '2021-03',
      endDate: '',
      responsibilities: [
        'Led architecture and implementation of a real-time collaboration platform serving 50K+ daily active users',
        'Designed and built microservices infrastructure reducing deployment time by 70%',
        'Mentored a team of 4 junior engineers through structured code reviews and pair programming sessions',
      ],
      achievements: [
        'Reduced API response time by 45% through query optimization and caching strategies',
        'Spearheaded migration from monolith to event-driven architecture, improving system reliability to 99.9% uptime',
      ],
      technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    },
    {
      companyName: 'StartupXYZ',
      title: 'Software Engineer',
      startDate: '2018-06',
      endDate: '2021-02',
      responsibilities: [
        'Built and maintained customer-facing dashboard used by 10K+ enterprise clients',
        'Implemented CI/CD pipelines and automated testing, achieving 90% code coverage',
        'Collaborated with product and design teams to ship features on tight deadlines',
      ],
      achievements: [],
      technologies: ['JavaScript', 'Vue.js', 'Python', 'Docker', 'MongoDB'],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2014-09',
      endDate: '2018-05',
      gpa: '3.8',
      honors: 'Magna Cum Laude',
    },
  ],
  skills: [
    { name: 'TypeScript', category: 'Languages' },
    { name: 'Python', category: 'Languages' },
    { name: 'Go', category: 'Languages' },
    { name: 'React', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Vue.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Backend' },
    { name: 'Redis', category: 'Backend' },
    { name: 'AWS', category: 'DevOps' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
  ],
  certifications: [
    {
      name: 'AWS Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2022-08',
    },
    { name: 'Google Cloud Professional Developer', issuer: 'Google', issueDate: '2021-11' },
  ],
  awards: [
    { title: 'Best Innovation Award', issuer: 'TechCorp Inc.', date: '2023-12' },
    { title: 'Outstanding Contributor', issuer: 'Open Source Project X', date: '2022-06' },
  ],
  projects: [
    {
      name: 'OpenCLI',
      description:
        'A developer-friendly CLI framework for building modern command-line tools with auto-generated help and shell completions.',
      role: 'Creator & Maintainer',
      technologies: ['TypeScript', 'Node.js'],
      url: 'github.com/alexchen/opencli',
    },
    {
      name: 'DataViz Dashboard',
      description:
        'Interactive data visualization dashboard for real-time analytics with customizable widgets.',
      role: 'Lead Developer',
      technologies: ['React', 'D3.js', 'WebSocket'],
    },
  ],
  volunteering: [
    {
      organization: 'Code for Good',
      role: 'Volunteer Instructor',
      startDate: '2020-01',
      endDate: '',
      responsibilities: [
        'Teach web development fundamentals to underrepresented youth',
        'Develop curriculum for HTML, CSS, and JavaScript workshops',
      ],
    },
  ],
  publications: [
    {
      title: 'Scaling Real-Time Collaboration in the Cloud',
      authors: 'A. Chen, B. Smith',
      publisher: 'IEEE Cloud Computing',
      date: '2023-09',
    },
  ],
  sectionOrder: DEFAULT_SECTION_ORDER,
};
