import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ListProjects from '../src/components/ListProjects.vue'
import Link from '../src/components/ui/Link.vue'

describe('listProjects.vue', () => {
  it('shows a coming soon message when there are no projects', () => {
    const wrapper = mount(ListProjects, {
      props: { projects: [] },
    })

    expect(wrapper.text()).toBe('Coming soon.')
    expect(wrapper.findAll('a')).toHaveLength(0)
  })

  it('renders each project as a link with its description', () => {
    const wrapper = mount(ListProjects, {
      props: {
        projects: [
          { name: 'Project 1', link: 'https://example.com', desc: 'Description 1' },
        ],
      },
      global: {
        components: { Link },
        stubs: { RouterLink: true },
      },
    })

    expect(wrapper.text()).toContain('Project 1')
    expect(wrapper.text()).toContain('Description 1')

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('href')).toBe('https://example.com')
  })
})
