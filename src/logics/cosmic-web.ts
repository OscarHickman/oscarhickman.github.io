/**
 * A 3D cosmic web built the way cosmological simulations set up their initial
 * conditions: draw a Gaussian random density field with a power-law spectrum,
 * then move particles off a lattice with the Zel'dovich approximation,
 *
 *   x(q, D) = q + D ψ(q),   ψ = -∇φ,   ∇²φ = δ,
 *
 * where D is the linear growth factor. Increasing D empties the voids and
 * collapses matter into walls, filaments and nodes. The box is periodic, so it
 * tiles seamlessly in every direction.
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
  /** Initial positions q in cell units, jittered within each cell, interleaved (x, y, z). */
  positions: Float32Array
  /** Displacement ψ per unit growth, in cell units, interleaved (x, y, z). */
  displacements: Float32Array
  /**
   * Invariants (I₁, I₂, I₃) of the deformation tensor ∂ψᵢ/∂qⱼ: its trace, the
   * sum of its principal 2×2 minors, and its determinant. The volume element
   * is then det(I + D ∂ψ/∂q) = 1 + D I₁ + D² I₂ + D³ I₃, so the density at
   * any growth needs three numbers per particle instead of six.
   */
  invariants: Float32Array
}

const DEFAULT_SPECTRAL_INDEX = -2
const DEFAULT_SMOOTHING = 0.02

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

/** Transform every line of an n³ grid that runs along the axis with the given index stride. */
function fftAxis(re: Float64Array, im: Float64Array, n: number, stride: number, inverse: boolean): void {
  const lineRe = new Float64Array(n)
  const lineIm = new Float64Array(n)
  // The two other axes have strides drawn from {1, n, n²} minus this one
  const [outer, inner] = [1, n, n * n].filter(s => s !== stride)
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const base = a * outer + b * inner
      for (let k = 0; k < n; k++) {
        lineRe[k] = re[base + k * stride]
        lineIm[k] = im[base + k * stride]
      }
      fft1d(lineRe, lineIm, inverse)
      for (let k = 0; k < n; k++) {
        re[base + k * stride] = lineRe[k]
        im[base + k * stride] = lineIm[k]
      }
    }
  }
}

/** In-place 3D FFT of an n×n×n grid indexed (z·n + y)·n + x. The inverse is normalised. */
export function fft3(re: Float64Array, im: Float64Array, n: number, inverse: boolean): void {
  for (const stride of [1, n, n * n])
    fftAxis(re, im, n, stride, inverse)

  if (inverse) {
    const scale = 1 / n ** 3
    for (let i = 0; i < re.length; i++) {
      re[i] *= scale
      im[i] *= scale
    }
  }
}

/**
 * Write the invariants (trace, sum of principal 2×2 minors, determinant) of
 * the symmetric tensor [[xx, xy, xz], [xy, yy, yz], [xz, yz, zz]] to `out`.
 */
export function writeInvariants(
  out: Float32Array,
  offset: number,
  xx: number,
  yy: number,
  zz: number,
  xy: number,
  xz: number,
  yz: number,
): void {
  out[offset] = xx + yy + zz
  out[offset + 1] = xx * yy + xx * zz + yy * zz - xy * xy - xz * xz - yz * yz
  out[offset + 2] = xx * (yy * zz - yz * yz) - xy * (xy * zz - yz * xz) + xz * (xy * yz - yy * xz)
}

/** Wavenumber in radians per cell for FFT index i on an n-point grid. */
function wavenumber(i: number, n: number): number {
  return (2 * Math.PI * (i < n / 2 ? i : i - n)) / n
}

/**
 * Trilinear interpolation of two periodic n³ grids at the same point, in cell
 * units. Both fields share the corner lookups, which dominate the cost.
 */
function samplePair(a: Float64Array, b: Float64Array, n: number, qx: number, qy: number, qz: number, out: [number, number]): void {
  const fx = Math.floor(qx)
  const fy = Math.floor(qy)
  const fz = Math.floor(qz)
  const tx = qx - fx
  const ty = qy - fy
  const tz = qz - fz
  // Wrap so a coordinate that rounds up to exactly n still reads cell 0
  const x0 = fx % n
  const y0 = fy % n
  const z0 = fz % n
  const x1 = (x0 + 1) % n
  const y1 = (y0 + 1) % n
  const z1 = (z0 + 1) % n
  let sumA = 0
  let sumB = 0
  for (let k = 0; k < 2; k++) {
    const z = k ? z1 : z0
    const wz = k ? tz : 1 - tz
    for (let j = 0; j < 2; j++) {
      const row = (z * n + (j ? y1 : y0)) * n
      const wzy = wz * (j ? ty : 1 - ty)
      sumA += wzy * ((1 - tx) * a[row + x0] + tx * a[row + x1])
      sumB += wzy * ((1 - tx) * b[row + x0] + tx * b[row + x1])
    }
  }
  out[0] = sumA
  out[1] = sumB
}

// The nine real fields, as multipliers of δ_k in Fourier space:
// ψᵢ = i kᵢ δ / k² and ∂ψᵢ/∂qⱼ = -kᵢ kⱼ δ / k²
const DISPLACEMENT_AXES = [0, 1, 2] as const
const TENSOR_PAIRS = [[0, 0], [1, 1], [2, 2], [0, 1], [0, 2], [1, 2]] as const

interface FieldSpec {
  /** Real multiplier of δ_k. */
  scale: (k: number[], k2: number) => number
  /** Whether the multiplier is imaginary (i × scale). */
  imaginary: boolean
}

const FIELD_SPECS: FieldSpec[] = [
  ...DISPLACEMENT_AXES.map(axis => ({
    scale: (k: number[], k2: number) => k[axis] / k2,
    imaginary: true,
  })),
  ...TENSOR_PAIRS.map(([a, b]) => ({
    scale: (k: number[], k2: number) => (-k[a] * k[b]) / k2,
    imaginary: false,
  })),
]

/**
 * Build the spectra of two real fields into one complex grid, F_a + i F_b, so
 * a single inverse FFT returns field a in the real part and field b in the
 * imaginary part. Both are transforms of real fields, so they stay separate.
 */
function packPair(
  noiseRe: Float64Array,
  noiseIm: Float64Array,
  amplitude: Float64Array,
  n: number,
  a: FieldSpec,
  b: FieldSpec | undefined,
): { re: Float64Array, im: Float64Array } {
  const cells = n ** 3
  const re = new Float64Array(cells)
  const im = new Float64Array(cells)
  const k = [0, 0, 0]
  for (let z = 0; z < n; z++) {
    k[2] = wavenumber(z, n)
    for (let y = 0; y < n; y++) {
      k[1] = wavenumber(y, n)
      for (let x = 0; x < n; x++) {
        const i = (z * n + y) * n + x
        if (amplitude[i] === 0)
          continue
        k[0] = wavenumber(x, n)
        const k2 = k[0] * k[0] + k[1] * k[1] + k[2] * k[2]
        const dRe = noiseRe[i] * amplitude[i]
        const dIm = noiseIm[i] * amplitude[i]

        // Field spectrum F = s·δ, or i·s·δ when imaginary
        const sa = a.scale(k, k2)
        re[i] = a.imaginary ? -sa * dIm : sa * dRe
        im[i] = a.imaginary ? sa * dRe : sa * dIm
        if (b) {
          // The second field rides on the imaginary axis: add i·F_b
          const sb = b.scale(k, k2)
          re[i] -= b.imaginary ? sb * dRe : sb * dIm
          im[i] += b.imaginary ? -sb * dIm : sb * dRe
        }
      }
    }
  }
  return { re, im }
}

/** Gaussian-smoothed power-law amplitude per mode, zero for modes we drop. */
function spectrumAmplitude(n: number, spectralIndex: number, smoothingCells: number): Float64Array {
  const amplitude = new Float64Array(n ** 3)
  for (let z = 0; z < n; z++) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        // Drop the mean and the Nyquist modes, which i·k cannot keep real
        if ((x === 0 && y === 0 && z === 0) || x === n / 2 || y === n / 2 || z === n / 2)
          continue
        const kx = wavenumber(x, n)
        const ky = wavenumber(y, n)
        const kz = wavenumber(z, n)
        const k2 = kx * kx + ky * ky + kz * kz
        amplitude[(z * n + y) * n + x] = k2 ** (spectralIndex / 4) * Math.exp(-0.5 * k2 * smoothingCells * smoothingCells)
      }
    }
  }
  return amplitude
}

/** Jittered lattice positions, one particle per sub-cell. */
function latticePositions(n: number, oversample: number, seed: number): Float32Array {
  const perSide = n * oversample
  const jitter = mulberry32(seed ^ 0x9E3779B9)
  // Float32 storage can round a coordinate just below n up to n itself
  const inside = (v: number) => Math.min(v, n - 1e-3)
  const positions = new Float32Array(3 * perSide ** 3)
  let i = 0
  for (let z = 0; z < perSide; z++) {
    for (let y = 0; y < perSide; y++) {
      for (let x = 0; x < perSide; x++) {
        positions[i++] = inside((x + jitter()) / oversample)
        positions[i++] = inside((y + jitter()) / oversample)
        positions[i++] = inside((z + jitter()) / oversample)
      }
    }
  }
  return positions
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

  // White noise in real space has a Hermitian transform, so every field
  // derived from it with a real or odd-imaginary filter comes back real
  const rand = mulberry32(seed)
  const noiseRe = Float64Array.from({ length: n ** 3 }, () => gaussian(rand))
  const noiseIm = new Float64Array(n ** 3)
  fft3(noiseRe, noiseIm, n, false)
  const amplitude = spectrumAmplitude(n, spectralIndex, smoothing * n)

  // The fields are smooth on the grid scale, so extra particles can be sampled
  // from them by interpolation instead of a larger FFT. Each particle is
  // jittered inside its sub-cell so no regular lattice shows.
  const positions = latticePositions(n, oversample, seed)
  const count = positions.length / 3

  // Two real fields per inverse FFT; nine fields in all
  const samples = FIELD_SPECS.map(() => new Float32Array(count))
  const pair: [number, number] = [0, 0]
  for (let f = 0; f < FIELD_SPECS.length; f += 2) {
    const { re, im } = packPair(noiseRe, noiseIm, amplitude, n, FIELD_SPECS[f], FIELD_SPECS[f + 1])
    fft3(re, im, n, true)
    const second = samples[f + 1]
    for (let p = 0; p < count; p++) {
      samplePair(re, im, n, positions[3 * p], positions[3 * p + 1], positions[3 * p + 2], pair)
      samples[f][p] = pair[0]
      if (second)
        second[p] = pair[1]
    }
  }

  const [psiX, psiY, psiZ, jXX, jYY, jZZ, jXY, jXZ, jYZ] = samples

  // Normalise so the linear overdensity δ = -tr(∂ψ/∂q) has unit variance
  let variance = 0
  for (let p = 0; p < count; p++)
    variance += (jXX[p] + jYY[p] + jZZ[p]) ** 2
  const norm = 1 / Math.sqrt(variance / count)

  const displacements = new Float32Array(3 * count)
  const invariants = new Float32Array(3 * count)
  for (let p = 0; p < count; p++) {
    displacements[3 * p] = psiX[p] * norm
    displacements[3 * p + 1] = psiY[p] * norm
    displacements[3 * p + 2] = psiZ[p] * norm

    writeInvariants(
      invariants,
      3 * p,
      jXX[p] * norm,
      jYY[p] * norm,
      jZZ[p] * norm,
      jXY[p] * norm,
      jXZ[p] * norm,
      jYZ[p] * norm,
    )
  }

  return { size: n, count, positions, displacements, invariants }
}

/** Zel'dovich density contrast 1 / |det(I + D ∂ψ/∂q)| of particle i, as the renderer computes it. */
function densityAt(invariants: Float32Array, i: number, growth: number): number {
  const volume = 1 + growth * invariants[3 * i] + growth ** 2 * invariants[3 * i + 1] + growth ** 3 * invariants[3 * i + 2]
  return 1 / Math.max(Math.abs(volume), 0.03)
}

/**
 * A copy of the field holding only particles whose density at `growth` is at
 * least `minDensity`. Particles in voids carry almost none of the rendered
 * light, so dropping them once saves the GPU from processing them every frame.
 */
export function keepDense(web: CosmicWebField, growth: number, minDensity: number): CosmicWebField {
  const kept: number[] = []
  for (let i = 0; i < web.count; i++) {
    if (densityAt(web.invariants, i, growth) >= minDensity)
      kept.push(i)
  }
  const pick = (source: Float32Array) => {
    const out = new Float32Array(3 * kept.length)
    kept.forEach((from, to) => out.set(source.subarray(3 * from, 3 * from + 3), 3 * to))
    return out
  }
  return {
    size: web.size,
    count: kept.length,
    positions: pick(web.positions),
    displacements: pick(web.displacements),
    invariants: pick(web.invariants),
  }
}

export interface CosmicWebRequest {
  field: CosmicWebOptions
  /** Growth at which to judge density when dropping void particles. */
  growth: number
  minDensity: number
}

/** Generate a field and keep the particles that will be visible. */
export function buildCosmicWeb(request: CosmicWebRequest): CosmicWebField {
  return keepDense(generateCosmicWeb(request.field), request.growth, request.minDensity)
}
