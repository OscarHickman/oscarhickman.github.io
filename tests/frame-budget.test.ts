import { describe, expect, it } from 'vitest'
import { createFrameBudget } from '../src/logics/frame-budget'

const options = { slowFrameSeconds: 1 / 40, settleSeconds: 2, levels: 3 }

function run(budget: ReturnType<typeof createFrameBudget>, dt: number, seconds: number): number[] {
  const changes: number[] = []
  for (let t = 0; t < seconds; t += dt) {
    const level = budget.record(dt)
    if (level !== null)
      changes.push(level)
  }
  return changes
}

describe('createFrameBudget', () => {
  it('keeps full quality while frames are fast', () => {
    const budget = createFrameBudget(options)

    expect(run(budget, 1 / 60, 30)).toEqual([])
    expect(budget.level).toBe(0)
  })

  it('steps down one level at a time while frames stay slow', () => {
    const budget = createFrameBudget(options)
    const changes = run(budget, 1 / 20, 30)

    expect(changes).toEqual([1, 2])
    expect(budget.level).toBe(2)
  })

  it('waits for frames to settle before judging, and between steps', () => {
    const budget = createFrameBudget(options)

    expect(run(budget, 1 / 20, 1.5)).toEqual([])
    expect(run(budget, 1 / 20, 1)).toEqual([1])
    // The next step needs another settle period after the first
    expect(run(budget, 1 / 20, 1.4)).toEqual([])
  })

  it('ignores a brief stutter', () => {
    const budget = createFrameBudget(options)
    run(budget, 1 / 60, 3)

    expect(run(budget, 0.1, 0.2)).toEqual([])
    expect(run(budget, 1 / 60, 10)).toEqual([])
  })

  it('never steps back up', () => {
    const budget = createFrameBudget(options)
    run(budget, 1 / 20, 3)
    const level = budget.level

    run(budget, 1 / 60, 30)
    expect(budget.level).toBe(level)
  })
})
