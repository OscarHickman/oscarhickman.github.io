import type { Vec3 } from '../src/logics/cosmic-flight'
import { describe, expect, it } from 'vitest'
import { flightPose, visibleCopies } from '../src/logics/cosmic-flight'

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const length = (a: Vec3) => Math.sqrt(dot(a, a))

const options = { speed: 0.02, heading: [0.4, 0.25, 1] as Vec3, sway: 0.25, period: 40 }
const times = [0, 3.7, 12, 55.5, 600]

describe('flightPose', () => {
  it('gives an orthonormal camera basis', () => {
    for (const t of times) {
      const { right, up, forward } = flightPose(t, options)
      for (const axis of [right, up, forward])
        expect(length(axis)).toBeCloseTo(1, 10)
      expect(dot(right, up)).toBeCloseTo(0, 10)
      expect(dot(right, forward)).toBeCloseTo(0, 10)
      expect(dot(up, forward)).toBeCloseTo(0, 10)
    }
  })

  it('looks where it is flying', () => {
    const dt = 1e-4
    for (const t of times) {
      const velocity = sub(flightPose(t + dt, options).position, flightPose(t - dt, options).position)
      const direction = velocity.map(v => v / length(velocity)) as Vec3
      expect(dot(direction, flightPose(t, options).forward)).toBeCloseTo(1, 6)
    }
  })

  it('advances along its heading at the requested average speed', () => {
    const heading = options.heading.map(v => v / length(options.heading)) as Vec3
    const start = flightPose(0, options).position
    // Whole sway periods, so the weave cancels out
    const end = flightPose(10 * options.period, options).position

    expect(dot(sub(end, start), heading)).toBeCloseTo(options.speed * 10 * options.period, 8)
  })

  it('turns gently, never sharply between frames', () => {
    const frame = 1 / 60
    for (let t = 0; t < options.period; t += 0.5) {
      const turn = Math.acos(Math.min(1, dot(flightPose(t, options).forward, flightPose(t + frame, options).forward)))
      expect(turn).toBeLessThan(0.002)
    }
  })

  it('weaves within the sway angle around its heading', () => {
    const heading = options.heading.map(v => v / length(options.heading)) as Vec3
    let widest = 0
    for (let t = 0; t < options.period; t += 0.25)
      widest = Math.max(widest, Math.acos(Math.min(1, dot(flightPose(t, options).forward, heading))))

    expect(widest).toBeGreaterThan(0.5 * options.sway)
    expect(widest).toBeLessThanOrEqual(options.sway + 1e-9)
  })
})

describe('visibleCopies', () => {
  // Looking straight down +z with a 90° field of view (right × up = -forward, as flightPose builds it)
  const pose = { position: [0.3, 0.6, 0.1] as Vec3, right: [-1, 0, 0] as Vec3, up: [0, 1, 0] as Vec3, forward: [0, 0, 1] as Vec3 }
  const scale: [number, number] = [1, 1]
  const key = (o: Vec3) => o.join(',')

  it('always includes the copy the camera is inside', () => {
    expect(visibleCopies(pose, scale, 1.5).map(key)).toContain('0,0,0')
  })

  it('includes copies ahead within reach and drops those beyond it', () => {
    const keys = visibleCopies(pose, scale, 1.5).map(key)

    expect(keys).toContain('0,0,1')
    expect(keys).toContain('0,0,2')
    expect(keys).not.toContain('0,0,3')
    expect(visibleCopies(pose, scale, 0.9).map(key)).not.toContain('0,0,2')
  })

  it('drops copies entirely behind the camera or outside the field of view', () => {
    const keys = visibleCopies(pose, scale, 3).map(key)

    expect(keys).not.toContain('0,0,-1')
    expect(keys).not.toContain('0,0,-2')
    // Within reach, but every corner is further to the side than it is ahead
    expect(keys).not.toContain('2,0,0')
    expect(keys).not.toContain('0,-2,0')
  })

  it('follows the camera as it turns', () => {
    const turned = { ...pose, right: [0, 0, 1] as Vec3, forward: [1, 0, 0] as Vec3 }
    const keys = visibleCopies(turned, scale, 1.5).map(key)

    expect(keys).toContain('2,0,0')
    expect(keys).not.toContain('0,0,2')
  })

  it('returns each copy once', () => {
    const keys = visibleCopies(pose, scale, 1.5).map(key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
