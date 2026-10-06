<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { publications } from '~/data/publications'

const copiedTitle = ref<string | null>(null)
const expandedBibtex = ref<string | null>(null)

// Group publications by year
const groupedPublications = computed(() => {
  const groups: Record<number, typeof publications> = {}
  for (const pub of publications) {
    if (!groups[pub.year])
      groups[pub.year] = []
    groups[pub.year].push(pub)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({
      year: Number(year),
      items,
    }))
})

async function copyBibtex(pub: typeof publications[0]) {
  if (!pub.bibtex)
    return
  try {
    await navigator.clipboard.writeText(pub.bibtex)
    copiedTitle.value = pub.title
    setTimeout(() => {
      if (copiedTitle.value === pub.title)
        copiedTitle.value = null
    }, 2000)
  }
  catch (e) {
    console.error('Failed to copy BibTeX', e)
  }
}

function toggleBibtex(title: string) {
  expandedBibtex.value = expandedBibtex.value === title ? null : title
}

// Structured data for search engines & academic indexing
if (publications.length) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': publications.map(p => ({
            '@type': 'ScholarlyArticle',
            'headline': p.title,
            'name': p.title,
            'author': p.authors.split(',').map(a => ({
              '@type': 'Person',
              'name': a.trim(),
            })),
            'datePublished': String(p.year),
            ...(p.venue ? { publication: { '@type': 'Periodical', 'name': p.venue } } : {}),
            ...(p.arxiv ? { sameAs: `https://arxiv.org/abs/${p.arxiv}` } : {}),
            ...(p.doi ? { identifier: p.doi } : {}),
          })),
        }),
      },
    ],
  })
}
</script>

<template>
  <div class="prose m-auto">
    <p v-if="!publications.length" class="text-[var(--fg-muted)]">
      Coming soon.
    </p>
    <div v-else class="space-y-12">
      <Section
        v-for="group, gIdx in groupedPublications"
        :key="group.year"
        :title="String(group.year)"
        :first="gIdx === 0"
      >
        <div class="space-y-6">
          <div
            v-for="p in group.items"
            :key="p.title"
            class="publication-item border-b border-[var(--border)] pb-6 last:border-none"
          >
            <div class="text-lg font-medium leading-snug">
              <Link
                v-if="p.arxiv || p.doi"
                :href="p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : `https://doi.org/${p.doi}`"
                external
              >
                {{ p.title }}
              </Link>
              <span v-else>{{ p.title }}</span>

              <span v-if="p.firstAuthor" class="ml-2 inline-block">
                <Tag>First author</Tag>
              </span>
            </div>

            <div class="text-sm text-[var(--fg-muted)] mt-1.5 leading-relaxed">
              <span>{{ p.authors }}</span>
            </div>

            <div class="mt-2.5 flex flex-wrap items-center gap-2">
              <Meta
                :venue="p.venue"
              />
              <Link
                v-if="p.arxiv"
                :href="`https://arxiv.org/abs/${p.arxiv}`"
                external
              >
                <Tag>arXiv:{{ p.arxiv }}</Tag>
              </Link>
              <Link
                v-if="p.doi"
                :href="`https://doi.org/${p.doi}`"
                external
              >
                <Tag>DOI:{{ p.doi }}</Tag>
              </Link>
              <button
                v-if="p.bibtex"
                type="button"
                class="bibtex-button font-mono text-xs px-2 py-0.5 rounded border border-[var(--border-strong)] text-[var(--fg-muted)] hover:text-[var(--fg)] inline-flex items-center gap-1"
                :title="copiedTitle === p.title ? 'Copied!' : 'Copy BibTeX to clipboard'"
                @click="copyBibtex(p)"
              >
                <div :class="copiedTitle === p.title ? 'i-ri-check-line' : 'i-ri-file-copy-line'" />
                <span>{{ copiedTitle === p.title ? 'Copied' : 'BibTeX' }}</span>
              </button>
              <button
                v-if="p.bibtex"
                type="button"
                class="bibtex-toggle font-mono text-xs px-1.5 py-0.5 rounded op60 hover:op100 text-[var(--fg-muted)]"
                title="View BibTeX entry"
                @click="toggleBibtex(p.title)"
              >
                {{ expandedBibtex === p.title ? 'Hide' : 'View' }}
              </button>
            </div>

            <!-- Expandable BibTeX snippet -->
            <div
              v-if="p.bibtex && expandedBibtex === p.title"
              class="mt-3 p-3 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border)] overflow-x-auto"
            >
              <pre class="font-mono text-xs leading-relaxed m-0 text-[var(--fg-muted)]"><code>{{ p.bibtex }}</code></pre>
            </div>
          </div>
        </div>
      </Section>
    </div>
  </div>
</template>
