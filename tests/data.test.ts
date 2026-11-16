import { describe, expect, it } from 'vitest'
import photos from '../photos/data'
import { projects } from '../src/data/projects'
import { publications, venueLabel } from '../src/data/publications'

describe('projects data', () => {
  it('only lists public https links', () => {
    expect(Array.isArray(projects)).toBe(true)

    for (const project of projects) {
      expect(project.name).toBeTruthy()
      expect(project.desc).toBeTruthy()
      expect(project.link).toMatch(/^https:\/\//)
    }
  })
})

describe('publications data', () => {
  it('uses well-formed arXiv identifiers', () => {
    for (const pub of publications) {
      if (pub.arxiv)
        expect(pub.arxiv).toMatch(/^\d{4}\.\d{4,5}$/)
    }
  })

  it('prefixes the venue with the submission status until published', () => {
    const base = { title: 't', authors: 'a', year: 2026, venue: 'MNRAS' }

    expect(venueLabel({ ...base, status: 'submitted' })).toBe('Submitted to MNRAS')
    expect(venueLabel({ ...base, status: 'accepted' })).toBe('Accepted by MNRAS')
    expect(venueLabel(base)).toBe('MNRAS')
    expect(venueLabel({ ...base, venue: undefined, status: 'submitted' })).toBeUndefined()
  })
})

describe('photos data', () => {
  it('has valid structure', () => {
    expect(Array.isArray(photos)).toBe(true)
    expect(photos.length).toBeGreaterThan(0)

    for (const photo of photos) {
      expect(photo.name).toBeDefined()
      expect(photo.url).toBeDefined()
      // Ensure name follows the expected pattern (e.g., p-2023-12-25)
      expect(photo.name).toMatch(/^p-\d{4}-\d{2}-\d{2}/)
    }
  })
})
