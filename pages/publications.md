---
title: Publications - Oscar Hickman
description: Research outputs and preprints
---

## Publications & Preprints

No publications yet — building foundations. This page will list preprints and papers on machine learning approaches to cosmology (e.g. simulation-based inference, graph neural networks for the cosmic web, generative models for survey augmentation).

### How to add entries

Edit (or create) a data file `data/publications.ts` (you can make it) exporting an array like:

```ts
export interface Publication {
  title: string
  authors: string
  year: number
  venue?: string
  arxiv?: string
  doi?: string
  highlight?: boolean
}

export const publications: Publication[] = [
  {
    title: 'Graph Neural Networks for Classifying Large-Scale Structure',
    authors: 'Hickman, O. et al.',
    year: 2026,
    venue: 'MNRAS (submitted)',
    arxiv: 'arXiv:2601.01234',
    highlight: true,
  },
]
```

Then create a simple component or Markdown list rendering them. If you want help wiring a component later, just ask.

Future improvements: add filters for year, highlight, and direct ADS links.
