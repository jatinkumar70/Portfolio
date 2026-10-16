export type ProjectSlug = 'banquet-crm' | 'bnbme-homes' | 'crossroads-helpline' | 'school-management'

export interface ProjectImage {
  /** Path under /public — a .gif, .webp, .png or .jpg all work. */
  src: string
  alt: string
  width: number
  height: number
  /** Optional small caption, e.g. a note that personal data was blurred. */
  note?: string
}

export interface Project {
  slug: ProjectSlug
  index: string
  title: string
  kicker: string
  /** Professional context the work happened in. */
  context: string
  period: string
  role: string
  summary: string
  /** What Jatin did — taken from the resume or supplied by Jatin. */
  highlights: string[]
  /** Technologies confirmed by the resume. Empty when not stated. */
  stack: string[]
  /** Address shown in the browser-frame mockup. */
  url: string
  image?: ProjectImage
}
