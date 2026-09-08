export interface Publication {
  title: string
  authors: string
  year: number
  venue?: string
  arxiv?: string // supply only identifier e.g. 2501.01234
  doi?: string // supply as 10.xxxx/xxxxx
  pdf?: string
  bibtex?: string
  highlight?: boolean
  firstAuthor?: boolean
}

export const publications: Publication[] = [
  {
    title: 'Fast, Unbiased Galaxy Clustering Estimation from Sparse Merger Trees',
    authors: 'Oscar Hickman, et al.',
    year: 2026,
    venue: 'Monthly Notices of the Royal Astronomical Society (MNRAS)',
    arxiv: '2605.12345',
    highlight: true,
    firstAuthor: true,
    bibtex: `@article{hickman2026clustering,
  title={Fast, Unbiased Galaxy Clustering Estimation from Sparse Merger Trees},
  author={Hickman, Oscar and others},
  journal={Monthly Notices of the Royal Astronomical Society},
  year={2026}
}`,
  },
]
