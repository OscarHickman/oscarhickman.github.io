export interface TalkPresentation {
  date: string
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
    name: 'Durham University',
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
    name: 'Invited Talks',
    talks: [],
  },
]
