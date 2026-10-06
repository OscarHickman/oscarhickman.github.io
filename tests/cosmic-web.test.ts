import { describe, expect, it } from 'vitest'
import { fft2, generateCosmicWeb, mulberry32 } from '../src/logics/cosmic-web'

function std(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length)
}

describe('mulberry32', () => {
  it('is deterministic for a given seed and stays in [0, 1)', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const value = a()
      expect(value).toBe(b())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('fft2', () => {
  it('recovers the input after a forward and inverse transform', () => {
    const n = 8
    const rand = mulberry32(7)
    const original = Float64Array.from({ length: n * n }, () => rand() - 0.5)
    const re = Float64Array.from(original)
    const im = new Float64Array(n * n)

    fft2(re, im, n, false)
    fft2(re, im, n, true)

    for (let i = 0; i < n * n; i++) {
      expect(re[i]).toBeCloseTo(original[i], 10)
      expect(im[i]).toBeCloseTo(0, 10)
    }
  })

  it('puts the sum of the input in the zero-frequency bin', () => {
    const n = 4
    const re = Float64Array.from({ length: n * n }, (_, i) => i)
    const im = new Float64Array(n * n)

    fft2(re, im, n, false)

    expect(re[0]).toBeCloseTo((n * n * (n * n - 1)) / 2, 10)
  })
})

describe('generateCosmicWeb', () => {
  const size = 32
  // Smooth on the grid scale, as on the site, so interpolated samples are faithful
  const smoothing = 0.08
  const web = generateCosmicWeb({ size, seed: 3, smoothing })

  it('returns one lattice position, displacement and deformation tensor per particle', () => {
    expect(web.size).toBe(size)
    expect(web.count).toBe(size * size)
    expect(web.positions).toHaveLength(2 * size * size)
    expect(web.displacements).toHaveLength(2 * size * size)
    expect(web.deformations).toHaveLength(3 * size * size)
  })

  it('places every particle inside its own lattice cell', () => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x
        expect(Math.floor(web.positions[2 * i])).toBe(x)
        expect(Math.floor(web.positions[2 * i + 1])).toBe(y)
      }
    }
  })

  it('is reproducible for the same seed and differs between seeds', () => {
    const again = generateCosmicWeb({ size, seed: 3, smoothing })
    const other = generateCosmicWeb({ size, seed: 4, smoothing })

    expect(Array.from(again.displacements)).toEqual(Array.from(web.displacements))
    expect(Array.from(other.displacements)).not.toEqual(Array.from(web.displacements))
  })

  it('normalises the linear density field to unit variance and zero mean', () => {
    // In the Zel'dovich approximation the linear overdensity is minus the trace of the deformation tensor
    const delta: number[] = []
    for (let i = 0; i < size * size; i++)
      delta.push(-(web.deformations[3 * i] + web.deformations[3 * i + 2]))

    expect(std(delta)).toBeGreaterThan(0.95)
    expect(std(delta)).toBeLessThan(1.05)
    expect(Math.abs(delta.reduce((a, b) => a + b, 0) / delta.length)).toBeLessThan(0.05)
  })

  it('has no net displacement, so the box does not drift as structure grows', () => {
    let sumX = 0
    let sumY = 0
    for (let i = 0; i < size * size; i++) {
      sumX += web.displacements[2 * i]
      sumY += web.displacements[2 * i + 1]
    }

    const scale = std(Array.from(web.displacements))
    expect(Math.abs(sumX / (size * size))).toBeLessThan(0.05 * scale)
    expect(Math.abs(sumY / (size * size))).toBeLessThan(0.05 * scale)
  })

  it('oversamples particles by interpolating the displacement field', () => {
    const dense = generateCosmicWeb({ size, seed: 3, smoothing, oversample: 2 })
    const count = 4 * size * size

    expect(dense.size).toBe(size)
    expect(dense.count).toBe(count)
    expect(dense.positions).toHaveLength(2 * count)
    expect(dense.deformations).toHaveLength(3 * count)

    // Sampling the same field more densely keeps its statistics
    const sparseStd = std(Array.from(web.displacements))
    const denseStd = std(Array.from(dense.displacements))
    expect(Math.abs(denseStd - sparseStd) / sparseStd).toBeLessThan(0.05)

    for (let i = 0; i < 2 * count; i++) {
      expect(dense.positions[i]).toBeGreaterThanOrEqual(0)
      expect(dense.positions[i]).toBeLessThan(size)
    }
  })

  it('rejects sizes that are not a power of two', () => {
    expect(() => generateCosmicWeb({ size: 30, seed: 1 })).toThrow(/power of two/)
  })
})
