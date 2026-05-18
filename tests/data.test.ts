import { describe, expect, it } from 'vitest'
import photos from '../photos/data'
import { projectCategories } from '../src/data/projects'

describe('projects data', () => {
  it('has valid structure', () => {
    expect(Array.isArray(projectCategories)).toBe(true)
    expect(projectCategories.length).toBeGreaterThan(0)

    for (const category of projectCategories) {
      expect(category.name).toBeDefined()
      expect(Array.isArray(category.projects)).toBe(true)

      for (const project of category.projects) {
        expect(project.name).toBeDefined()
        expect(project.link).toBeDefined()
        expect(project.desc).toBeDefined()
        expect(project.icon).toBeDefined()

        // Ensure links are valid URLs
        expect(project.link).toMatch(/^https?:\/\//)
      }
    }
  })

  it('contains the updated CMB project', () => {
    const mlCategory = projectCategories.find(c => c.name === 'ML for Cosmology & Physics')
    expect(mlCategory).toBeDefined()

    const cmbProject = mlCategory!.projects.find(p => p.name === 'CMB Cosmology with Advanced Sampling')
    expect(cmbProject).toBeDefined()
    expect(cmbProject!.link).toBe('https://github.com/OscarHickman/CMB_Advanced_Sampling')
    expect(cmbProject!.tags).toContain('Rust')
    expect(cmbProject!.tags).toContain('TensorFlow Probability')
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
