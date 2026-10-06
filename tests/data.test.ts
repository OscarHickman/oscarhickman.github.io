import { describe, expect, it } from 'vitest'
import photos from '../photos/data'
import { projects } from '../src/data/projects'
import { publications } from '../src/data/publications'

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
