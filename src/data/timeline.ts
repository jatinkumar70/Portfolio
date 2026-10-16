export interface TimelineEntry {
  id: string
  period: string
  title: string
  org: string
  place?: string
  body: string
  kind: 'education' | 'internship' | 'role' | 'milestone'
}

/** Career story — every entry is from the supplied resume. */
export const timeline: TimelineEntry[] = [
  {
    id: 'btech',
    period: 'Sep 2019 — May 2023',
    title: 'B.Tech, Computer Science & Information Technology',
    org: 'Mahatma Jyotiba Phule Rohilkhand University',
    place: 'Bareilly, UP',
    body: 'Computer-science foundations. Alongside: GirlScript Summer of Code — leading features, code reviews and documentation with open-source contributors.',
    kind: 'education',
  },
  {
    id: 'madrocket',
    period: 'Sep — Dec 2023',
    title: 'React Developer Intern',
    org: 'MadRocket',
    body: 'Built a school management app with React and Firebase — students, teachers, admissions, assignments and homework — handling both frontend and backend logic.',
    kind: 'internship',
  },
  {
    id: 'edgenroots',
    period: 'Jan 2024 — Present',
    title: 'Software Engineer',
    org: 'EdgeNRoots',
    place: 'Remote',
    body: 'End-to-end frontend for client-facing platforms including BnBme Homes and Crossroads Helpline — consumer websites through full backoffice systems, dashboards, finance modules and exportable reports.',
    kind: 'role',
  },
  {
    id: 'promotions',
    period: 'Within two years',
    title: 'Promoted twice',
    org: 'EdgeNRoots',
    body: 'Two promotions in under two years, for consistent technical ownership and delivery quality.',
    kind: 'milestone',
  },
]
