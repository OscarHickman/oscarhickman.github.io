import { describe, expect, it } from 'vitest'
import { fft3, generateCosmicWeb, keepDense, mulberry32, writeInvariants } from '../src/logics/cosmic-web'

function std(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length)
}

function component(values: Float32Array, stride: number, offset: number): number[] {
  const out: number[] = []
  for (let i = offset; i < values.length; i += stride)
    out.push(values[i])
  return out
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

describe('fft3', () => {
  it('recovers the input after a forward and inverse transform', () => {
    const n = 8
    const cells = n ** 3
    const rand = mulberry32(7)
    const original = Float64Array.from({ length: cells }, () => rand() - 0.5)
    const re = Float64Array.from(original)
    const im = new Float64Array(cells)

    fft3(re, im, n, false)
    fft3(re, im, n, true)

    for (let i = 0; i < cells; i++) {
      expect(re[i]).toBeCloseTo(original[i], 10)
      expect(im[i]).toBeCloseTo(0, 10)
    }
  })

  it('puts the sum of the input in the zero-frequency bin', () => {
    const n = 4
    const cells = n ** 3
    const re = Float64Array.from({ length: cells }, (_, i) => i)
    const im = new Float64Array(cells)

    fft3(re, im, n, false)

    expect(re[0]).toBeCloseTo((cells * (cells - 1)) / 2, 8)
  })

  it('transforms a plane wave along each axis into a single pair of bins', () => {
    const n = 8
    for (const axis of [0, 1, 2]) {
      const re = new Float64Array(n ** 3)
      const im = new Float64Array(n ** 3)
      for (let z = 0; z < n; z++) {
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++)
            re[(z * n + y) * n + x] = Math.cos((2 * Math.PI * [x, y, z][axis]) / n)
        }
      }

      fft3(re, im, n, false)

      const bin = [1, n, n * n][axis]
      const mirror = [n - 1, (n - 1) * n, (n - 1) * n * n][axis]
      for (let i = 0; i < n ** 3; i++) {
        const expected = i === bin || i === mirror ? n ** 3 / 2 : 0
        expect(re[i]).toBeCloseTo(expected, 8)
      }
    }
  })
})

describe('writeInvariants', () => {
  it('writes the trace, sum of principal minors and determinant of a symmetric tensor', () => {
    // [[2, 1, 0], [1, 3, 1], [0, 1, 4]]
    const out = new Float32Array(5)
    writeInvariants(out, 2, 2, 3, 4, 1, 0, 1)

    expect(Array.from(out)).toEqual([0, 0, 9, 24, 18])
  })

  it('makes det(I + D·T) the product of (1 + D·λ) over the eigenvalues', () => {
    // A rotated diagonal tensor: eigenvalues 0.5, -1 and 2 in a tilted frame
    const [c, s] = [Math.cos(0.7), Math.sin(0.7)]
    const [l1, l2, l3] = [0.5, -1, 2]
    const out = new Float32Array(3)
    // Rotation by 0.7 rad about z mixes x and y
    writeInvariants(out, 0, c * c * l1 + s * s * l2, s * s * l1 + c * c * l2, l3, c * s * (l1 - l2), 0, 0)

    for (const growth of [0.25, 0.8, 1.5]) {
      const det = 1 + growth * out[0] + growth ** 2 * out[1] + growth ** 3 * out[2]
      expect(det).toBeCloseTo((1 + growth * l1) * (1 + growth * l2) * (1 + growth * l3), 5)
    }
  })

  it('accounts for every off-diagonal term in the determinant', () => {
    // [[1, 2, 3], [2, 4, 5], [3, 5, 6]] has determinant -1
    const out = new Float32Array(3)
    writeInvariants(out, 0, 1, 4, 6, 2, 3, 5)

    expect(out[2]).toBeCloseTo(-1, 10)
  })
})

describe('generateCosmicWeb', () => {
  const size = 16
  // Smooth on the grid scale, as on the site, so interpolated samples are faithful
  const smoothing = 0.1
  const web = generateCosmicWeb({ size, seed: 3, smoothing })
  const count = size ** 3

  it('returns a lattice position, displacement and deformation invariants per particle', () => {
    expect(web.size).toBe(size)
    expect(web.count).toBe(count)
    expect(web.positions).toHaveLength(3 * count)
    expect(web.displacements).toHaveLength(3 * count)
    expect(web.invariants).toHaveLength(3 * count)
  })

  it('places every particle inside its own lattice cell', () => {
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (z * size + y) * size + x
          expect(Math.floor(web.positions[3 * i])).toBe(x)
          expect(Math.floor(web.positions[3 * i + 1])).toBe(y)
          expect(Math.floor(web.positions[3 * i + 2])).toBe(z)
        }
      }
    }
  })

  it('is reproducible for the same seed and differs between seeds', () => {
    const again = generateCosmicWeb({ size, seed: 3, smoothing })
    const other = generateCosmicWeb({ size, seed: 4, smoothing })

    expect(Array.from(again.displacements)).toEqual(Array.from(web.displacements))
    expect(Array.from(again.invariants)).toEqual(Array.from(web.invariants))
    expect(Array.from(other.displacements)).not.toEqual(Array.from(web.displacements))
  })

  it('normalises the linear density field to unit variance and zero mean', () => {
    // In the Zel'dovich approximation the linear overdensity is minus the trace of the deformation tensor
    const delta = component(web.invariants, 3, 0).map(trace => -trace)

    expect(std(delta)).toBeGreaterThan(0.95)
    expect(std(delta)).toBeLessThan(1.05)
    expect(Math.abs(delta.reduce((a, b) => a + b, 0) / delta.length)).toBeLessThan(0.05)
  })

  it('has no net displacement, so the box does not drift as structure grows', () => {
    const scale = std(Array.from(web.displacements))
    for (const axis of [0, 1, 2]) {
      const mean = component(web.displacements, 3, axis).reduce((a, b) => a + b, 0) / count
      expect(Math.abs(mean)).toBeLessThan(0.05 * scale)
    }
  })

  it('derives the deformation tensor from the displacement field', () => {
    // Estimate tr(∂ψ/∂q) with central differences between neighbouring
    // particles and check it tracks the first invariant
    const wrap = (v: number) => ((v % size) + size) % size
    const estimate: number[] = []
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const at = [x, y, z]
          let divergence = 0
          for (const axis of [0, 1, 2]) {
            const ahead = [...at]
            const behind = [...at]
            ahead[axis] = wrap(at[axis] + 1)
            behind[axis] = wrap(at[axis] - 1)
            const a = (ahead[2] * size + ahead[1]) * size + ahead[0]
            const b = (behind[2] * size + behind[1]) * size + behind[0]
            const spacing = wrap(web.positions[3 * a + axis] - web.positions[3 * b + axis])
            divergence += (web.displacements[3 * a + axis] - web.displacements[3 * b + axis]) / spacing
          }
          estimate.push(divergence)
        }
      }
    }
    const trace = component(web.invariants, 3, 0)
    const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length
    const [me, mt] = [mean(estimate), mean(trace)]
    const covariance = mean(estimate.map((e, i) => (e - me) * (trace[i] - mt)))

    expect(covariance / (std(estimate) * std(trace))).toBeGreaterThan(0.9)
  })

  it('conserves mass: the volume element det(I + D ∂ψ/∂q) averages to one at any growth', () => {
    // A periodic map with no net displacement covers the box exactly once, so
    // its signed Jacobian integrates to the box volume. This only holds when
    // the second and third invariants are consistent with the first.
    for (const growth of [0.3, 0.7, 1.2]) {
      let sum = 0
      let sumSq = 0
      for (let i = 0; i < count; i++) {
        const [i1, i2, i3] = web.invariants.subarray(3 * i, 3 * i + 3)
        const det = 1 + growth * i1 + growth ** 2 * i2 + growth ** 3 * i3
        sum += det
        sumSq += det * det
      }
      const mean = sum / count
      const spread = Math.sqrt(sumSq / count - mean * mean)

      expect(spread).toBeGreaterThan(0.1 * growth)
      expect(Math.abs(mean - 1)).toBeLessThan(0.05 * spread)
    }
  })

  it('oversamples particles by interpolating the smooth fields', () => {
    const dense = generateCosmicWeb({ size, seed: 3, smoothing, oversample: 2 })
    const denseCount = 8 * count

    expect(dense.size).toBe(size)
    expect(dense.count).toBe(denseCount)
    expect(dense.positions).toHaveLength(3 * denseCount)
    expect(dense.invariants).toHaveLength(3 * denseCount)

    // Sampling the same field more densely keeps its statistics
    const sparseStd = std(Array.from(web.displacements))
    const denseStd = std(Array.from(dense.displacements))
    expect(Math.abs(denseStd - sparseStd) / sparseStd).toBeLessThan(0.05)

    for (let i = 0; i < 3 * denseCount; i++) {
      expect(dense.positions[i]).toBeGreaterThanOrEqual(0)
      expect(dense.positions[i]).toBeLessThan(size)
    }
  })

  it('rejects sizes that are not a power of two', () => {
    expect(() => generateCosmicWeb({ size: 30, seed: 1 })).toThrow(/power of two/)
  })
})

describe('keepDense', () => {
  const web = generateCosmicWeb({ size: 16, seed: 5, smoothing: 0.1 })
  const growth = 0.9
  const densityOf = (field: typeof web, i: number) => {
    const [i1, i2, i3] = field.invariants.subarray(3 * i, 3 * i + 3)
    return 1 / Math.max(Math.abs(1 + growth * i1 + growth ** 2 * i2 + growth ** 3 * i3), 0.03)
  }

  it('keeps exactly the particles at or above the density threshold, in order', () => {
    const dense = keepDense(web, growth, 2)
    const expected = Array.from({ length: web.count }, (_, i) => i).filter(i => densityOf(web, i) >= 2)

    expect(dense.count).toBe(expected.length)
    expect(dense.count).toBeGreaterThan(0)
    expect(dense.count).toBeLessThan(web.count)
    expected.forEach((source, i) => {
      for (const key of ['positions', 'displacements', 'invariants'] as const)
        expect(Array.from(dense[key].subarray(3 * i, 3 * i + 3))).toEqual(Array.from(web[key].subarray(3 * source, 3 * source + 3)))
    })
  })

  it('keeps the box size and leaves the input untouched', () => {
    const before = Array.from(web.positions)
    const dense = keepDense(web, growth, 2)

    expect(dense.size).toBe(web.size)
    expect(Array.from(web.positions)).toEqual(before)
  })

  it('keeps every particle when the threshold is zero', () => {
    expect(keepDense(web, growth, 0).count).toBe(web.count)
  })
})
