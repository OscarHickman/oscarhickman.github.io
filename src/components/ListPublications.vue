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
        class="publication-item border-b border-[var(--border)] pb-5 last:border-none"
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
          <span v-if="p.highlight" class="ml-2 inline-block">
            <Tag spectral="k">Featured</Tag>
          </span>
        </div>
        <div class="text-sm op75 mt-1 font-sans">
          <span>{{ p.authors }}</span>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <Meta
            :date="p.year ? `(${p.year})` : undefined"
            :venue="p.venue"
          />
          <Link
            v-if="p.arxiv"
            :href="`https://arxiv.org/abs/${p.arxiv}`"
            external
          >
            <Tag spectral="b">
              arXiv:{{ p.arxiv }}
            </Tag>
          </Link>
          <Link
            v-if="p.doi"
            :href="`https://doi.org/${p.doi}`"
            external
          >
            <Tag spectral="o">
              DOI:{{ p.doi }}
            </Tag>
          </Link>
        </div>
      </div>
    </div>
  </div>
</template>
