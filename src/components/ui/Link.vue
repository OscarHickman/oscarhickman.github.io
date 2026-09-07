<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  href: string
  external?: boolean
}>()

const isExternal = computed(() => {
  if (typeof props.external === 'boolean')
    return props.external
  return /^https?:\/\//.test(props.href)
})
</script>

<template>
  <a
    v-if="isExternal"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="link-root"
  >
    <slot />
    <span class="external-arrow" aria-hidden="true">↗</span>
  </a>
  <RouterLink
    v-else
    :to="href"
    class="link-root"
  >
    <slot />
  </RouterLink>
</template>

<style scoped>
.link-root {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--border);
  transition: all var(--dur-fast) var(--ease);
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
}

.link-root:hover {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.external-arrow {
  font-size: 0.85em;
  opacity: 0.7;
  transition: transform var(--dur-fast) var(--ease);
}

.link-root:hover .external-arrow {
  opacity: 1;
  transform: translate(1px, -1px);
}
</style>
