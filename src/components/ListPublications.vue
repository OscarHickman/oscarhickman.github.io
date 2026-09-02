<script setup lang="ts">
import { publications } from '~/data/publications'
</script>

<template>
  <div class="prose m-auto">
    <div v-if="!publications.length" class="py-8 text-center op50">
      <p class="font-mono text-sm tracking-wide">
        Publications & preprints coming soon.
      </p>
    </div>
    <div v-else class="space-y-6">
      <div
        v-for="p in publications"
        :key="p.title"
        class="publication-item border-b border-[var(--c-border)] pb-5 last:border-none"
      >
        <div class="text-lg font-medium leading-snug">
          <a
            v-if="p.arxiv || p.doi"
            :href="p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : `https://doi.org/${p.doi}`"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline transition-colors duration-200"
          >
            {{ p.title }}
          </a>
          <span v-else>{{ p.title }}</span>
          <span
            v-if="p.highlight"
            class="ml-2 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[var(--c-accent-glow)] text-[var(--c-accent)] border border-[var(--c-border)] rounded"
          >
            Featured
          </span>
        </div>
        <div class="text-sm op75 mt-1 font-sans">
          <span>{{ p.authors }}</span>
        </div>
        <div class="text-xs op70 mt-1 flex flex-wrap items-center gap-2 font-mono">
          <span v-if="p.venue" class="font-medium text-[var(--c-accent-warm)]">{{ p.venue }}</span>
          <span>({{ p.year }})</span>
          <a
            v-if="p.arxiv"
            :href="`https://arxiv.org/abs/${p.arxiv}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-1.5 py-0.5 rounded bg-[var(--c-accent-glow)] text-[var(--c-accent)] border border-[var(--c-border)] hover:brightness-125 text-xs font-mono"
          >
            arXiv:{{ p.arxiv }}
          </a>
          <a
            v-if="p.doi"
            :href="`https://doi.org/${p.doi}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-1.5 py-0.5 rounded bg-[var(--c-accent-glow)] text-[var(--c-accent)] border border-[var(--c-border)] hover:brightness-125 text-xs font-mono"
          >
            DOI:{{ p.doi }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
