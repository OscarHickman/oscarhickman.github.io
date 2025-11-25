export interface Publication {
  title: string
  authors: string
  year: number
  venue?: string
  arxiv?: string // supply only identifier e.g. 2501.01234
  doi?: string // supply as 10.xxxx/xxxxx
  highlight?: boolean
}

export const publications: Publication[] = []
