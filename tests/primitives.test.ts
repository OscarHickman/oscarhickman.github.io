import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Card from '../src/components/ui/Card.vue'
import Link from '../src/components/ui/Link.vue'
import Meta from '../src/components/ui/Meta.vue'
import Section from '../src/components/ui/Section.vue'
import Tag from '../src/components/ui/Tag.vue'

describe('uI Primitives', () => {
  it('renders Card.vue correctly with link and title', () => {
    const wrapper = mount(Card, {
      props: {
        href: 'https://example.com',
        title: 'Example Project',
      },
      slots: {
        default: 'Card body content',
      },
    })
    expect(wrapper.classes()).toContain('card-root')
    expect(wrapper.attributes('href')).toBe('https://example.com')
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.text()).toContain('Card body content')
  })

  it('renders Tag.vue with its label', () => {
    const wrapper = mount(Tag, {
      slots: {
        default: 'Cosmology',
      },
    })
    expect(wrapper.classes()).toContain('tag-root')
    expect(wrapper.text()).toBe('Cosmology')
  })

  it('renders Link.vue with external attributes and arrow icon', () => {
    const wrapper = mount(Link, {
      props: {
        href: 'https://arxiv.org',
        external: true,
      },
      slots: {
        default: 'arXiv',
      },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toContain('noopener')
    expect(wrapper.find('.external-arrow').exists()).toBe(true)
  })

  it('treats absolute URLs as external when external is not set', () => {
    const wrapper = mount(Link, {
      props: {
        href: 'https://github.com',
      },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('target')).toBe('_blank')
  })

  it('renders Meta.vue with date and venue', () => {
    const wrapper = mount(Meta, {
      props: {
        date: '2026-05-08',
        venue: 'Durham University',
      },
    })
    expect(wrapper.classes()).toContain('meta-root')
    expect(wrapper.text()).toContain('2026-05-08')
    expect(wrapper.text()).toContain('Durham University')
  })

  it('renders Section.vue with a heading and its content', () => {
    const wrapper = mount(Section, {
      props: {
        title: 'Machine Learning',
        id: 'ml',
      },
      slots: {
        default: 'Section content',
      },
    })
    expect(wrapper.find('h2.section-title').text()).toBe('Machine Learning')
    expect(wrapper.attributes('id')).toBe('ml')
    expect(wrapper.text()).toContain('Section content')
  })
})
