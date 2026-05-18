import { describe, expect, it, vi } from 'vitest'
import { formatDate } from '../src/logics'

// Mock VueUse auto-imports
vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => ({ value: true })),
  useLocalStorage: vi.fn((key, defaultValue) => ({ value: defaultValue })),
}))

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-12-25')
    // dayjs will use local timezone, but we can test the general format
    expect(formatDate(date)).toMatch(/Dec 25/)
  })

  it('formats date with year if not current year', () => {
    const date = new Date('2020-01-01')
    expect(formatDate(date, false)).toBe('Jan 1, 2020')
  })

  it('formats date without year if onlyDate is true', () => {
    const date = new Date('2020-01-01')
    expect(formatDate(date, true)).toBe('Jan 1')
  })
})
