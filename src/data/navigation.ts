export interface NavItem {
  label: string
  to: string
  index: string
  description: string
}

export const primaryNav: NavItem[] = [
  { label: 'Work', to: '/#work', index: '01', description: 'Selected projects' },
  { label: 'About', to: '/about', index: '02', description: 'Story, timeline, philosophy' },
  { label: 'Contact', to: '/contact', index: '03', description: 'Start a conversation' },
]
