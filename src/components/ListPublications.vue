<script setup lang="ts">
import { publications } from '~/data/publications'
</script>

<template>
  <div class="prose m-auto">
    <div v-if="!publications.length" class="op50">
      No publications yet.
    </div>
    <ul v-else>
      <li v-for="p in publications" :key="p.title">
        <strong>{{ p.title }}</strong>
        <div text-sm op70>
          <span>{{ p.authors }}</span>
          <span v-if="p.venue"> · {{ p.venue }}</span>
          <span> ({{ p.year }})</span>
          <span v-if="p.arxiv"> · <a :href="`https://arxiv.org/abs/${p.arxiv}`" target="_blank">arXiv</a></span>
          <span v-if="p.doi"> · <a :href="`https://doi.org/${p.doi}`" target="_blank">DOI</a></span>
        </div>
      </li>
    </ul>
  </div>
</template>
