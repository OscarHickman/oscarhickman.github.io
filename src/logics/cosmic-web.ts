/**
 * A 2D cosmic web built the way cosmological simulations set up their initial
 * conditions: draw a Gaussian random density field with a power-law spectrum,
 * then move particles off a lattice with the Zel'dovich approximation,
 *
 *   x(q, D) = q + D ψ(q),   ψ = -∇φ,   ∇²φ = δ,
 *
 * where D is the linear growth factor. Increasing D empties the voids and
 * collapses matter into walls, filaments and nodes. The box is periodic, so it
 * tiles seamlessly.
 */

export interface CosmicWebOptions {
  /** Grid cells per side. Must be a power of two (FFT grid). */
  size: number
  seed: number
  /** Power spectrum slope n in P(k) ∝ kⁿ. */
  spectralIndex?: number
  /** Gaussian smoothing length as a fraction of the box. */
  smoothing?: number
  /** Particles per grid cell along each axis, sampled from the smooth fields. */
  oversample?: number
}

export interface CosmicWebField {
  /** Box size in grid cells. */
  size: number
  /** Number of particles. */
  count: number
  /** Initial positions q in cell units, jittered within each cell, interleaved (x, y). */
  positions: Float32Array
  /** Displacement ψ per unit growth, in cell units, interleaved (x, y). */
  displacements: Float32Array
  /** Deformation tensor ∂ψᵢ/∂qⱼ, interleaved (xx, xy, yy). */
  deformations: Float32Array
}

const DEFAULT_SPECTRAL_INDEX = -2
const DEFAULT_SMOOTHING = 0.012

/** Small, fast seeded PRNG so the web looks the same on every visit. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rand: () => number): number {
  const u = Math.max(rand(), Number.EPSILON)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0
}

/** In-place iterative radix-2 FFT of one complex sequence. */
function fft1d(re: Float64Array, im: Float64Array, inverse: boolean): void {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1)
      j ^= bit
    j ^= bit
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = ((inverse ? 2 : -2) * Math.PI) / len
    const wRe = Math.cos(angle)
    const wIm = Math.sin(angle)
    const half = len >> 1
    for (let start = 0; start < n; start += len) {
      let cRe = 1
      let cIm = 0
      for (let k = 0; k < half; k++) {
        const a = start + k
        const b = a + half
        const tRe = re[b] * cRe - im[b] * cIm
        const tIm = re[b] * cIm + im[b] * cRe
        re[b] = re[a] - tRe
        im[b] = im[a] - tIm
        re[a] += tRe
        im[a] += tIm
        const nextRe = cRe * wRe - cIm * wIm
        cIm = cRe * wIm + cIm * wRe
        cRe = nextRe
      }
    }
  }
}

/** In-place 2D FFT of an n×n row-major grid. The inverse is normalised. */
export function fft2(re: Float64Array, im: Float64Array, n: number, inverse: boolean): void {
  const lineRe = new Float64Array(n)
  const lineIm = new Float64Array(n)

  for (let y = 0; y < n; y++) {
    const row = y * n
    lineRe.set(re.subarray(row, row + n))
    lineIm.set(im.subarray(row, row + n))
    fft1d(lineRe, lineIm, inverse)
    re.set(lineRe, row)
    im.set(lineIm, row)
  }

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      lineRe[y] = re[y * n + x]
      lineIm[y] = im[y * n + x]
    }
    fft1d(lineRe, lineIm, inverse)
    for (let y = 0; y < n; y++) {
      re[y * n + x] = lineRe[y]
      im[y * n + x] = lineIm[y]
    }
  }

  if (inverse) {
    const scale = 1 / (n * n)
    for (let i = 0; i < n * n; i++) {
      re[i] *= scale
      im[i] *= scale
    }
  }
}

/** Bilinear interpolation of a periodic n×n grid at a point in cell units. */
function samplePeriodic(field: Float64Array, n: number, qx: number, qy: number): number {
  const x0 = Math.floor(qx)
  const y0 = Math.floor(qy)
  const tx = qx - x0
  const ty = qy - y0
  const x1 = (x0 + 1) % n
  const y1 = (y0 + 1) % n
  const top = field[y0 * n + x0] * (1 - tx) + field[y0 * n + x1] * tx
  const bottom = field[y1 * n + x0] * (1 - tx) + field[y1 * n + x1] * tx
  return top * (1 - ty) + bottom * ty
}

/** Wavenumber in radians per cell for FFT index i on an n-point grid. */
function wavenumber(i: number, n: number): number {
  return (2 * Math.PI * (i < n / 2 ? i : i - n)) / n
}

export function generateCosmicWeb(options: CosmicWebOptions): CosmicWebField {
  const {
    size: n,
    seed,
    spectralIndex = DEFAULT_SPECTRAL_INDEX,
    smoothing = DEFAULT_SMOOTHING,
    oversample = 1,
  } = options

  if (!isPowerOfTwo(n))
    throw new Error(`Cosmic web size must be a power of two, got ${n}`)

  const cells = n * n
  const rand = mulberry32(seed)

  // White noise in real space has a Hermitian transform, so every field
  // derived from it with a real or odd-imaginary filter comes back real.
  const noiseRe = Float64Array.from({ length: cells }, () => gaussian(rand))
  const noiseIm = new Float64Array(cells)
  fft2(noiseRe, noiseIm, n, false)

  const smoothingCells = smoothing * n
  const fields = Array.from({ length: 5 }, () => ({
    re: new Float64Array(cells),
    im: new Float64Array(cells),
  }))
  const [psiX, psiY, jXX, jXY, jYY] = fields

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      // Drop the mean and the Nyquist modes, which i·k cannot keep real
      if ((x === 0 && y === 0) || x === n / 2 || y === n / 2)
        continue

      const i = y * n + x
      const kx = wavenumber(x, n)
      const ky = wavenumber(y, n)
      const k2 = kx * kx + ky * ky
      const amplitude = k2 ** (spectralIndex / 4) * Math.exp(-0.5 * k2 * smoothingCells * smoothingCells)
      const dRe = noiseRe[i] * amplitude
      const dIm = noiseIm[i] * amplitude

      // ψ_k = i k δ_k / k²
      psiX.re[i] = (-kx * dIm) / k2
      psiX.im[i] = (kx * dRe) / k2
      psiY.re[i] = (-ky * dIm) / k2
      psiY.im[i] = (ky * dRe) / k2

      // ∂ψᵢ/∂qⱼ ↔ -kᵢkⱼ δ_k / k²
      jXX.re[i] = (-kx * kx * dRe) / k2
      jXX.im[i] = (-kx * kx * dIm) / k2
      jXY.re[i] = (-kx * ky * dRe) / k2
      jXY.im[i] = (-kx * ky * dIm) / k2
      jYY.re[i] = (-ky * ky * dRe) / k2
      jYY.im[i] = (-ky * ky * dIm) / k2
    }
  }

  for (const field of fields)
    fft2(field.re, field.im, n, true)

  // Normalise so the linear overdensity δ = -tr(∂ψ/∂q) has unit variance
  let variance = 0
  for (let i = 0; i < cells; i++) {
    const delta = jXX.re[i] + jYY.re[i]
    variance += delta * delta
  }
  const norm = 1 / Math.sqrt(variance / cells)

  // The fields are smooth on the grid scale, so extra particles can be sampled
  // from them by interpolation instead of a larger FFT. Each particle is
  // jittered inside its sub-cell so no regular lattice shows.
  const perSide = n * oversample
  const count = perSide * perSide
  const jitter = mulberry32(seed ^ 0x9E3779B9)
  const positions = new Float32Array(2 * count)
  const displacements = new Float32Array(2 * count)
  const deformations = new Float32Array(3 * count)

  for (let y = 0; y < perSide; y++) {
    for (let x = 0; x < perSide; x++) {
      const i = y * perSide + x
      const qx = (x + jitter()) / oversample
      const qy = (y + jitter()) / oversample
      positions[2 * i] = qx
      positions[2 * i + 1] = qy
      displacements[2 * i] = samplePeriodic(psiX.re, n, qx, qy) * norm
      displacements[2 * i + 1] = samplePeriodic(psiY.re, n, qx, qy) * norm
      deformations[3 * i] = samplePeriodic(jXX.re, n, qx, qy) * norm
      deformations[3 * i + 1] = samplePeriodic(jXY.re, n, qx, qy) * norm
      deformations[3 * i + 2] = samplePeriodic(jYY.re, n, qx, qy) * norm
    }
  }

  return { size: n, count, positions, displacements, deformations }
}
