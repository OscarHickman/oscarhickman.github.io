<script setup lang="ts">
defineProps<{
  as?: string
  href?: string
  target?: string
  rel?: string
}>()
</script>

<template>
  <component
    :is="href ? 'a' : (as || 'div')"
    :href="href"
    :target="target || (href?.startsWith('http') ? '_blank' : undefined)"
    :rel="rel || (href?.startsWith('http') ? 'noopener noreferrer' : undefined)"
    class="card-root"
  >
    <slot />
  </component>
</template>

<style scoped>
.card-root {
  display: flex;
  flex-direction: column;
  padding: var(--s-5);
  border-radius: var(--r-md);
  border: 1px solid var(--border);
  background: var(--bg);
  transition: border-color var(--dur-fast) var(--ease);
  text-decoration: none;
  color: inherit;
}

.card-root:hover {
  border-color: var(--border-strong);
}
</style>
