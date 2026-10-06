/**
 * A slow, weaving flight path through a periodic box. The camera advances
 * along a fixed heading while its velocity sways from side to side and up and
 * down, so it drifts through structure instead of along a rail. The path is
 * analytic, so the camera always faces exactly where it is going.
 */

export type Vec3 = [number, number, number]

export interface FlightOptions {
  /** Average speed along the heading, in box lengths per second. */
  speed: number
  /** Overall direction of travel; need not be normalised. */
  heading: Vec3
  /** Largest angle, in radians, between the view and the heading. */
  sway: number
  /** Seconds for one side-to-side sway. */
  period: number
}

export interface FlightPose {
  position: Vec3
  right: Vec3
  up: Vec3
  forward: Vec3
}

// Up-and-down sway runs on a period that never lines up with the side-to-side one
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2
const WORLD_UP: Vec3 = [0, 1, 0]

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function normalize(a: Vec3): Vec3 {
  const length = Math.hypot(a[0], a[1], a[2])
  return [a[0] / length, a[1] / length, a[2] / length]
}

function combine(terms: [number, Vec3][]): Vec3 {
  const out: Vec3 = [0, 0, 0]
  for (const [scale, v] of terms) {
    out[0] += scale * v[0]
    out[1] += scale * v[1]
    out[2] += scale * v[2]
  }
  return out
}

export function flightPose(time: number, options: FlightOptions): FlightPose {
  const { speed, sway, period } = options
  const heading = normalize(options.heading)
  // Sway axes perpendicular to the heading: one sideways, one roughly vertical
  const side = normalize(cross(heading, WORLD_UP))
  const lift = cross(side, heading)

  // Each sway axis gets half the lateral speed budget, so the combined angle
  // from the heading never exceeds `sway`
  const lateral = (speed * Math.tan(sway)) / Math.SQRT2
  const sideRate = (2 * Math.PI) / period
  const liftRate = sideRate / GOLDEN_RATIO

  const position = combine([
    [speed * time, heading],
    [(lateral / sideRate) * Math.sin(sideRate * time), side],
    [(lateral / liftRate) * Math.sin(liftRate * time), lift],
  ])
  const forward = normalize(combine([
    [speed, heading],
    [lateral * Math.cos(sideRate * time), side],
    [lateral * Math.cos(liftRate * time), lift],
  ]))
  const right = normalize(cross(forward, lift))
  const up = cross(right, forward)

  return { position, right, up, forward }
}

/**
 * Integer offsets of the periodic box copies that can contribute to the view.
 * Particles are wrapped into the unit cube centred on the camera, so the copy
 * at offset o fills the cube o ± 0.5. A copy is kept when part of it lies
 * within `reach` of the camera and it is not wholly outside one side of the
 * view frustum, whose half-widths are 1 / scale in view space.
 */
export function visibleCopies(pose: FlightPose, scale: [number, number], reach: number, margin = 0.05): Vec3[] {
  const { right, up, forward } = pose
  const span = Math.ceil(reach + 0.5)
  const copies: Vec3[] = []
  for (let x = -span; x <= span; x++) {
    for (let y = -span; y <= span; y++) {
      for (let z = -span; z <= span; z++) {
        const offset: Vec3 = [x, y, z]
        const nearest = Math.hypot(...offset.map(c => Math.max(Math.abs(c) - 0.5, 0)))
        if (nearest <= reach && touchesFrustum(offset, right, up, forward, scale, margin))
          copies.push(offset)
      }
    }
  }
  return copies
}

function touchesFrustum(offset: Vec3, right: Vec3, up: Vec3, forward: Vec3, scale: [number, number], margin: number): boolean {
  // One flag per frustum plane: does every corner of the cube lie outside it?
  const outside = [true, true, true, true, true]
  for (let corner = 0; corner < 8; corner++) {
    const p: Vec3 = [
      offset[0] + ((corner & 1) ? 0.5 : -0.5),
      offset[1] + ((corner & 2) ? 0.5 : -0.5),
      offset[2] + ((corner & 4) ? 0.5 : -0.5),
    ]
    const vx = (p[0] * right[0] + p[1] * right[1] + p[2] * right[2]) * scale[0]
    const vy = (p[0] * up[0] + p[1] * up[1] + p[2] * up[2]) * scale[1]
    const vz = p[0] * forward[0] + p[1] * forward[1] + p[2] * forward[2]
    const limit = vz * (1 + margin)
    outside[0] &&= vz <= 0
    outside[1] &&= vx > limit
    outside[2] &&= -vx > limit
    outside[3] &&= vy > limit
    outside[4] &&= -vy > limit
  }
  return !outside.includes(true)
}
