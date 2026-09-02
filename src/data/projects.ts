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
        name: 'SaUCE',
        link: 'https://github.com/OscarHickman/SaUCE',
        desc: 'High-performance Rust-backed library for fast, unbiased galaxy clustering and correlation function estimation from sparse merger trees',
        icon: 'i-carbon-network-4',
        tags: ['Rust', 'Python', 'Clustering'],
      },
      {
        name: 'ANVIL',
        link: 'https://github.com/OscarHickman/ANVIL',
        desc: 'Simulation-based inference (SBI) framework and diagnostic suites for neural posterior validation',
        icon: 'i-carbon-machine-learning-model',
        tags: ['Python', 'PyTorch', 'SBI'],
      },
      {
        name: 'KARMA',
        link: 'https://github.com/OscarHickman/karma',
        desc: 'Field-level simulation-based inference framework for cosmological observations',
        icon: 'i-carbon-chart-multitype',
        tags: ['Python', 'PyTorch', 'SBI'],
      },
      {
        name: 'DiffCMB',
        link: 'https://github.com/OscarHickman/diffcmb',
        desc: 'Differentiable full-sky CMB inference and joint Gibbs sampling framework',
        icon: 'i-carbon-wave-direction',
        tags: ['Python', 'JAX', 'MCMC'],
      },
      {
        name: 'HOD',
        link: 'https://github.com/OscarHickman/HOD',
        desc: 'Halo Occupation Distribution modeling and galaxy clustering analysis tools',
        icon: 'i-carbon-chart-cluster-bar',
        tags: ['Python', 'Cosmology'],
      },
      {
        name: 'Dynamical Friction',
        link: 'https://github.com/OscarHickman/dynamical_friction',
        desc: 'Modeling merger timescales and satellite orbital dynamics in semi-analytic galaxy formation models',
        icon: 'i-carbon-orbit',
        tags: ['Python', 'Fortran', 'Cosmology'],
      },
      {
        name: 'DESI Analysis',
        link: 'https://github.com/OscarHickman/desi',
        desc: 'Physical modeling of target selection and emission line galaxy occupations for DESI surveys',
        icon: 'i-carbon-telescope',
        tags: ['Python', 'DESI', 'Cosmology'],
      },
      {
        name: 'Screening',
        link: 'https://github.com/OscarHickman/screening',
        desc: 'Modified gravity and fifth-force screening mechanism modeling with simulated galaxy mocks',
        icon: 'i-carbon-filter',
        tags: ['Python', 'Cosmology'],
      },
      {
        name: 'Assembly Bias',
        link: 'https://github.com/OscarHickman/assembly_bias',
        desc: 'Investigating physical drivers and environmental properties of galaxy assembly bias',
        icon: 'i-carbon-diagram',
        tags: ['Python', 'Astrophysics'],
      },
      {
        name: 'IMF Calibration',
        link: 'https://github.com/OscarHickman/imf',
        desc: 'Parameter calibration and modeling of stellar initial mass functions in galaxy evolution',
        icon: 'i-carbon-chart-line',
        tags: ['Python', 'Bayesian Inference'],
      },
      {
        name: 'GALFORM Clustering Calibration',
        link: 'https://github.com/OscarHickman/galform_clustering_calibration',
        desc: 'Direct simulation-based inference calibration pipelines for semi-analytic models',
        icon: 'i-carbon-calibrate',
        tags: ['Python', 'SBI', 'SLURM'],
      },
      {
        name: 'GALFORM Analysis',
        link: 'https://github.com/OscarHickman/galform_analysis',
        desc: 'High-performance Python analysis tools for GALFORM semi-analytic galaxy formation models',
        icon: 'i-carbon-chart-scatter',
        tags: ['Python', 'HDF5', 'Polars'],
      },
      {
        name: 'GALFORM Execution',
        link: 'https://github.com/OscarHickman/galform_execution',
        desc: 'HPC execution and parameter sweep orchestration for GALFORM simulations',
        icon: 'i-carbon-run',
        tags: ['Python', 'SLURM', 'HPC'],
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
        icon: 'i-carbon-chemistry',
        tags: ['Python'],
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
