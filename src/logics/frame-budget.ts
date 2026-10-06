/**
 * Watches frame times and steps quality down when a device cannot keep up.
 * It only ever steps down, so quality never oscillates, and it judges a
 * smoothed frame time held over a sustained period, so a single stutter
 * (a tab switch, a garbage collection) never costs quality.
 */

export interface FrameBudgetOptions {
  /** Smoothed frame time above which the device counts as struggling. */
  slowFrameSeconds: number
  /** Time to wait after starting or stepping down before judging again. */
  settleSeconds: number
  /** Number of quality levels, from 0 (full) to levels - 1 (lowest). */
  levels: number
  /** Time constant of the exponential frame-time average. */
  smoothingSeconds?: number
  /** How long the average must stay slow before stepping down. */
  sustainSeconds?: number
}

export interface FrameBudget {
  readonly level: number
  /** Record one frame; returns the new level when it changes, otherwise null. */
  record: (dt: number) => number | null
}

const DEFAULT_SMOOTHING_SECONDS = 0.5
const DEFAULT_SUSTAIN_SECONDS = 1.5

export function createFrameBudget(options: FrameBudgetOptions): FrameBudget {
  const {
    slowFrameSeconds,
    settleSeconds,
    levels,
    smoothingSeconds = DEFAULT_SMOOTHING_SECONDS,
    sustainSeconds = DEFAULT_SUSTAIN_SECONDS,
  } = options
  let level = 0
  let average: number | null = null
  let sinceChange = 0
  let slowFor = 0

  return {
    get level() {
      return level
    },
    record(dt) {
      sinceChange += dt
      average = average === null ? dt : average + (dt - average) * (1 - Math.exp(-dt / smoothingSeconds))
      slowFor = average > slowFrameSeconds ? slowFor + dt : 0
      if (level >= levels - 1 || sinceChange < settleSeconds || slowFor < sustainSeconds)
        return null
      level++
      sinceChange = 0
      slowFor = 0
      return level
    },
  }
}
