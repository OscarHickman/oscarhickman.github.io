<script setup lang="ts">
import type { ProjectItem } from '~/data/projects'

defineProps<{ projects: ProjectItem[] }>()
</script>

<template>
  <p v-if="!projects.length" class="empty-state">
    Coming soon.
  </p>
  <ul v-else class="project-list">
    <li v-for="item in projects" :key="item.link">
      <Link :href="item.link">
        {{ item.name }}
      </Link>
      <span class="project-desc">{{ item.desc }}</span>
    </li>
  </ul>
</template>

<style scoped>
.empty-state {
  color: var(--fg-muted);
}

.project-desc {
  display: block;
  color: var(--fg-muted);
  font-size: var(--t-sm);
}
</style>
