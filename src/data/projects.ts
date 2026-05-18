export interface ProjectItem {
  name: string
  link: string
  desc: string
  icon: string
  tags?: string[]
}

export interface ProjectCategory {
  name: string
  projects: ProjectItem[]
}

export const projectCategories: ProjectCategory[] = [
  {
    name: 'ML for Cosmology & Physics',
    projects: [
      {
        name: 'GALFORM Analysis',
        link: 'https://github.com/OscarHickman/galform_analysis',
        desc: 'Python library for analyzing GALFORM galaxy formation simulations with mass function computation and convergence testing',
        icon: 'i-carbon-chart-scatter',
        tags: ['Python'],
      },
      {
        name: 'GALFORM Execution',
        link: 'https://github.com/OscarHickman/galform_execution',
        desc: 'Pipeline for executing GALFORM simulations with parameter sweeps and analysis',
        icon: 'i-carbon-run',
        tags: ['Python'],
      },
      {
        name: 'CMB Cosmology with Advanced Sampling',
        link: 'https://github.com/OscarHickman/CMB_Advanced_Sampling',
        desc: 'Accurate CMB power spectrum sampling using TensorFlow Probability and advanced MCMC techniques (HMC & NUTS). Masters project.',
        icon: 'i-carbon-wave-direction',
        tags: ['Python', 'Rust', 'TensorFlow Probability'],
      },
      {
        name: 'Photon BEC Phase Characterisation',
        link: 'https://github.com/OscarHickman/characterisation-of-photon-bec-phase-diagram-using-machine-learning',
        desc: 'Machine learning methods for characterizing photon Bose-Einstein condensate phase diagrams. BSc project.',
        icon: 'i-carbon-machine-learning-model',
        tags: ['Python'],
      },
      {
        name: 'SCOPE',
        link: 'https://github.com/OscarHickman/SCOPE',
        desc: 'Research project on cosmological parameter estimation and inference',
        icon: 'i-carbon-telescope',
        tags: ['Rust', 'Python'],
      },
      {
        name: 'Academic Physics Learning',
        link: 'https://github.com/OscarHickman/academic-physics-learning',
        desc: 'Collection of Jupyter notebooks for learning advanced physics topics and techniques',
        icon: 'i-carbon-notebook',
        tags: ['Python', 'Jupyter'],
      },
    ],
  },
  {
    name: 'Software & Applications',
    projects: [
      {
        name: 'Mail Client',
        link: 'https://github.com/OscarHickman/mail',
        desc: '.NET 10 desktop email client built with Avalonia, supporting IMAP/SMTP, Microsoft Graph, and EWS',
        icon: 'i-carbon-mail',
        tags: ['C#', 'XAML'],
      },
      {
        name: 'Finance Dashboard',
        link: 'https://github.com/OscarHickman/finance',
        desc: 'Personal finance tracking and analysis dashboard',
        icon: 'i-carbon-currency-dollar',
        tags: ['TypeScript', 'Vue'],
      },
      {
        name: 'Coding Agent',
        link: 'https://github.com/OscarHickman/coding-agent',
        desc: 'Autonomous coding agent built with Go for code generation and analysis',
        icon: 'i-carbon-bot',
        tags: ['Go'],
      },
      {
        name: 'Health Tracking',
        link: 'https://github.com/OscarHickman/health',
        desc: 'Personal health data analysis and tracking system',
        icon: 'i-carbon-chart-area',
        tags: ['Python'],
      },
      {
        name: 'FPL Analytics',
        link: 'https://github.com/OscarHickman/fpl',
        desc: 'Fantasy Premier League data analysis and optimization using Jupyter notebooks',
        icon: 'i-carbon-analytics',
        tags: ['Python', 'Jupyter'],
      },
    ],
  },
  {
    name: 'Hardware & Assembly',
    projects: [
      {
        name: 'Connect 4 GLCD',
        link: 'https://github.com/OscarHickman/connect4_glcd',
        desc: 'Assembly implementation of Connect 4 game for graphical LCD displays',
        icon: 'i-carbon-chip',
        tags: ['Assembly'],
      },
      {
        name: 'NASA Pick of the Day',
        link: 'https://github.com/OscarHickman/NPOD',
        desc: 'C application for fetching and displaying NASA Astronomy Picture of the Day',
        icon: 'i-carbon-satellite',
        tags: ['C'],
      },
    ],
  },
  {
    name: 'Academic & Publications',
    projects: [
      {
        name: 'Papers',
        link: 'https://github.com/OscarHickman/papers',
        desc: 'LaTeX documents for academic papers and research publications',
        icon: 'i-carbon-document-export',
        tags: ['LaTeX'],
      },
      {
        name: 'Unbiased Estimator',
        link: 'https://github.com/OscarHickman/Unbiased-Estimator',
        desc: 'LaTeX project on unbiased statistical estimation techniques',
        icon: 'i-carbon-formula',
        tags: ['LaTeX'],
      },
      {
        name: 'AI Papers Database',
        link: 'https://github.com/OscarHickman/ai_papers',
        desc: 'Collection and analysis of AI/ML research papers',
        icon: 'i-carbon-document-add',
        tags: ['Python'],
      },
    ],
  },
  {
    name: 'Web & Personal',
    projects: [
      {
        name: 'Personal Website',
        link: 'https://github.com/OscarHickman/oscarhickman.github.io',
        desc: 'This website! Built with Vue 3, Vite, TypeScript, and Vite-SSG for static site generation',
        icon: 'i-carbon-globe',
        tags: ['TypeScript', 'Vue', 'CSS'],
      },
      {
        name: 'GitHub Profile',
        link: 'https://github.com/OscarHickman/oscarhickman',
        desc: 'GitHub profile README with bio and links',
        icon: 'i-uil-github-alt',
        tags: ['Markdown'],
      },
    ],
  },
]
