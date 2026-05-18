export interface TalkPresentation {
  date: string
  endDate?: string
  time?: string
  location?: string
  conference: string
  conferenceUrl?: string
  room?: string
  abstract?: string
  pdf?: string
  recording?: string
  description?: string
}

export interface Talk {
  title: string
  description?: string
  presentations: TalkPresentation[]
}

export interface TalkCategory {
  name: string
  talks: Talk[]
}

export const talkCategories: TalkCategory[] = [
  {
    name: 'External',
    talks: [],
  },
  {
    name: 'Internal',
    talks: [
      {
        title: 'Galaxy Clustering With Fewer Galaxies',
        description: 'How to recover galaxy clustering statistics from sparsely sampled catalogues, enabling efficient parameter calibration for galaxy formation models.',
        presentations: [
          {
            date: '2026-05-08',
            time: '13:00',
            conference: 'FLAT Talk',
            location: 'Durham University',
            room: 'OCW017 | The Ogden Center for Fundamental Physics (West) | Department of Physics | South Road | Durham | DH1 3LE | United Kingdom',
            abstract: `Galaxy clustering encodes rich information about the physical processes that govern the occupation of dark matter haloes - yet despite its sensitivity to these processes, clustering is rarely used as a direct constraint on physical models of galaxy formation. A key reason for this is computational: measuring clustering statistics for the large, simulated catalogues produced by semi-analytical and empirical models is expensive, making it impractical to include clustering in parameter calibration pipelines that must explore large parameter spaces.

We present a general method with which clustering can be recovered accurately from a sparsely sampled galaxy catalogue, provided a suitable correction is applied to account for the reduced sampling rate. We demonstrate this by applying this method to GALFORM, run on the P-Millennium N-body simulation.

The reduction in computational cost is sufficient to make galaxy clustering a viable statistic for use in the calibration of semi-analytical model parameters for the first time. Finally, we discuss the dependence of the required sampling rate on scale and galaxy population and outline the regime in which the sparse-sampling approximation is reliable.`,
            pdf: '/talks/FLAT.pdf',
            recording: '/talks/Oscar_FLAT.mp4',
          },
        ],
      },
    ],
  },
  {
    name: 'Conferences and Fieldwork',
    talks: [
      {
        title: 'BUGS2026: Building Galaxies from Scratch II',
        presentations: [
          {
            date: '2026-09-07',
            endDate: '2026-09-11',
            conference: 'Building Galaxies',
            conferenceUrl: 'https://wwwmpa.mpa-garching.mpg.de/conf/bugs2026/',
            location: 'Heidelberg, Germany',
          },
        ],
      },
      {
        title: 'DESI Summer 2026 Collaboration Meeting',
        presentations: [
          {
            date: '2026-07-12',
            endDate: '2026-07-16',
            conference: 'DESI Durham 2026',
            conferenceUrl: 'https://pay.durham.ac.uk/event-durham/desi-summer-2026-collaboration-meeting',
            location: 'Durham University, Durham, UK',
          },
        ],
      },
      {
        title: 'Simulation Based Inference for Galaxy Evolution 2026',
        presentations: [
          {
            date: '2026-06-23',
            endDate: '2026-06-26',
            conference: 'SBI GALEV 2026',
            conferenceUrl: 'https://sbi-galev.github.io/2026/#dates',
            location: 'Kavli Institute for Cosmology, Cambridge, UK',
          },
        ],
      },
      {
        title: 'DESI Support Observing',
        presentations: [
          {
            date: '2026-02-23',
            endDate: '2026-02-27',
            conference: 'Kitt Peak National Observatory',
            location: 'Arizona, USA',
          },
        ],
      },
      {
        title: 'DEX-XXII: 22nd Durham-Edinburgh eXtragalactic Workshop',
        presentations: [
          {
            date: '2026-01-08',
            endDate: '2026-01-09',
            conference: 'DEX 2026',
            conferenceUrl: 'https://indico.ph.ed.ac.uk/event/389/',
            location: 'University of Edinburgh, Edinburgh, UK',
          },
        ],
      },
    ],
  },
]
