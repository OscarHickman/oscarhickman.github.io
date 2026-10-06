export interface ProjectItem {
  name: string
  link: string
  desc: string
}

// Only list projects whose code is public. Private research code stays off the site.
export const projects: ProjectItem[] = []
