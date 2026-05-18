import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ListProjects from '../src/components/ListProjects.vue'

describe('listProjects.vue', () => {
  const mockProjects = {
    'Category 1': [
      {
        name: 'Project 1',
        link: 'https://example.com',
        desc: 'Description 1',
        icon: 'i-carbon-star',
        tags: ['Vue'],
      },
    ],
  }

  it('renders projects correctly', () => {
    const wrapper = mount(ListProjects, {
      props: {
        projects: mockProjects,
      },
    })

    expect(wrapper.text()).toContain('Category 1')
    expect(wrapper.text()).toContain('Project 1')
    expect(wrapper.text()).toContain('Description 1')
    expect(wrapper.text()).toContain('Vue')

    const links = wrapper.findAll('a')
    expect(links.length).toBe(1)
    expect(links[0].attributes('href')).toBe('https://example.com')
  })

  it('slugifies category names for IDs', () => {
    const wrapper = mount(ListProjects, {
      props: {
        projects: { 'My Category': [] },
      },
    })

    expect(wrapper.find('#my-category').exists()).toBe(true)
  })
})
