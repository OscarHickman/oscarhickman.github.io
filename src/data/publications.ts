export interface Publication {
  title: string
  authors: string
  year: number
  venue?: string // journal name only, e.g. MNRAS
  status?: 'submitted' | 'accepted' // omit once published
  arxiv?: string // supply only identifier e.g. 2501.01234
  doi?: string // supply as 10.xxxx/xxxxx
  pdf?: string
  bibtex?: string
  highlight?: boolean
  firstAuthor?: boolean
}

const STATUS_PREFIX: Record<NonNullable<Publication['status']>, string> = {
  submitted: 'Submitted to',
  accepted: 'Accepted by',
}

/** Venue line as shown on the site, e.g. "Submitted to MNRAS". */
export function venueLabel(pub: Publication): string | undefined {
  if (!pub.venue)
    return undefined
  return pub.status ? `${STATUS_PREFIX[pub.status]} ${pub.venue}` : pub.venue
}

export const publications: Publication[] = [
  {
    title: 'Less is More: Unbiased Galaxy Clustering from Fewer Merger Trees',
    authors: 'Oscar J. Hickman, Sownak Bose, Kai Wang, Carlton M. Baugh, Baojiu Li',
    year: 2026,
    venue: 'MNRAS',
    status: 'submitted',
    arxiv: '2611.13083',
    firstAuthor: true,
    bibtex: `@article{Hickman2026,
  author        = {Hickman, Oscar J. and Bose, Sownak and Wang, Kai and Baugh, Carlton M. and Li, Baojiu},
  title         = {Less is More: Unbiased Galaxy Clustering from Fewer Merger Trees},
  year          = {2026},
  eprint        = {2611.13083},
  archivePrefix = {arXiv},
  primaryClass  = {astro-ph.CO},
  note          = {Submitted to MNRAS}
}`,
  },
]
