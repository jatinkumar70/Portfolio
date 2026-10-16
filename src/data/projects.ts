import type { Project } from '@/types/content'

/**
 * Selected work. Highlights come from the resume or from details Jatin supplied.
 * Screenshots live in /public/work — replace a file (or point `image.src` at a .gif)
 * to update a project's visual.
 */
export const projects: Project[] = [
  {
    slug: 'banquet-crm',
    index: '01',
    title: 'Banquet CRM',
    kicker: 'Event operations platform',
    context: 'EdgeNRoots',
    period: 'Business system',
    role: 'Frontend engineer',
    summary:
      'A CRM for banquet and event teams that connects the full lead lifecycle with bookings, quotations, payments and real-time reports.',
    highlights: [
      'Managed the complete lead lifecycle — from enquiry to booking',
      'Worked across bookings, quotations and payments',
      'Real-time reports and dashboards for the operations team',
    ],
    stack: [],
    url: 'banquet-crm / dashboard',
    image: {
      src: '/work/banquet-crm.webp',
      alt: 'Banquet CRM dashboard: lead counts, an events-by-category bar chart, cancellation reasons and venue performance cards.',
      width: 1904,
      height: 908,
    },
  },
  {
    slug: 'bnbme-homes',
    index: '02',
    title: 'BnBme Homes',
    kicker: 'Property rental platform',
    context: 'EdgeNRoots',
    period: 'January 2024',
    role: 'Frontend — consumer site & backoffice',
    summary:
      'A consumer rental platform with search, booking and authentication, plus a backoffice for revenue dashboards, KPIs, approvals and report exports.',
    highlights: [
      'Consumer platform with booking, auth and search',
      'Backoffice with revenue dashboards, KPIs, approval workflows and exports',
      'Responsive design built for scalability and performance',
    ],
    stack: ['React', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS'],
    url: 'bnbme homes / trending destinations',
    image: {
      src: '/work/bnbme-homes.webp',
      alt: 'BnBme Homes website: a Trending Destinations section with photo cards for Dubai Marina, Bluewaters, Downtown, Palm Jumeirah and Business Bay.',
      width: 400,
      height: 224,
    },
  },
  {
    slug: 'crossroads-helpline',
    index: '03',
    title: 'Crossroads Helpline',
    kicker: 'Roadside assistance platform',
    context: 'EdgeNRoots',
    period: 'November 2024',
    role: 'Frontend — auth, roles, typing & tests',
    summary:
      'A roadside-assistance platform where users and clients work through authenticated, role-aware interfaces — leads, complaints, RSA requests and vehicles.',
    highlights: [
      'User authentication and role-based access for users and clients',
      'Enabled TypeScript strict mode across the codebase',
      'Jest unit testing — the resume reports 30% fewer regression defects',
    ],
    stack: ['React', 'TypeScript', 'Redux', 'MUI', 'Jest'],
    url: 'crossroads / leads / all leads',
    image: {
      src: '/work/crossroads-helpline.png',
      alt: 'Crossroads admin panel: a leads table with status badges and campaign names, next to a sidebar with leads, complaints, RSA and vehicle sections.',
      width: 1902,
      height: 908,
      note: 'Customer names and contact details blurred.',
    },
  },
  {
    slug: 'school-management',
    index: '04',
    title: 'School Management',
    kicker: 'Education administration app',
    context: 'MadRocket — internship',
    period: 'Sep – Dec 2023',
    role: 'Frontend & application logic',
    summary: 'A school web app for students, teachers, admissions, assignments and homework, built on React and Firebase.',
    highlights: [
      'Student and teacher management, admissions, assignments and homework',
      'Firebase Authentication and Firestore-backed data',
      'Handled both the frontend and the backend logic',
    ],
    stack: ['React', 'Firebase Auth', 'Firestore'],
    url: 'school-app / admissions',
  },
]
