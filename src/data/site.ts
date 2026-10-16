/**
 * Site-wide identity and configuration.
 * Contact links were taken from the hyperlinks embedded in the supplied resume PDF.
 * Edit this file to update anything personal — components read from here only.
 */
export const site = {
  name: 'Jatin Kumar',
  initials: 'JK',
  role: 'Senior Frontend Engineer',
  studioMark: 'JK / Digital Engineering',
  statement: 'I build digital experiences where thoughtful design meets complex engineering.',
  supporting:
    'From immersive consumer-facing interfaces to real-time business systems, I turn complicated workflows into intuitive, scalable digital products.',
  tagline: 'Interfaces with intent. Systems with depth.',
  summary:
    'Frontend engineer with 2+ years building scalable React and TypeScript applications — from consumer-facing platforms to complex backoffice systems with finance modules, real-time data tables and dynamic reporting.',

  /** Manually configured availability label shown in the hero and contact page. */
  availability: {
    show: true,
    label: 'Open to new conversations',
  },

  /**
   * Location metadata. Region inferred from the resume (Indian phone prefix, university in UP).
   * The clock is computed in the visitor's browser for this time zone — it is not live data from Jatin.
   */
  location: {
    label: 'India — working remotely',
    timeZone: 'Asia/Kolkata',
    tzLabel: 'IST',
  },

  contact: {
    email: 'bhanurawal.30@gmail.com',
    linkedin: 'https://www.linkedin.com/in/jatin-kumar-84612112b/',
    github: 'https://github.com/jatinkumar30',
  },

  resume: {
    href: '/resume/Jatin-Kumar-Resume.pdf',
    fileName: 'Jatin-Kumar-Resume.pdf',
  },

  /**
   * Production URL — leave null until a domain is known.
   * Set VITE_SITE_URL at build time; canonical + og:url are then generated per route.
   */
  siteUrl: ((import.meta.env.VITE_SITE_URL as string | undefined) || null) as string | null,

  /**
   * Optional form endpoint (e.g. a Formspree / Web3Forms / own API URL).
   * When null the contact form composes an email in the visitor's mail app instead.
   * Never commit secret keys here — only public form endpoints.
   */
  formEndpoint: (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) || null,
} as const

export type Site = typeof site
