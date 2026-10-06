<script setup lang="ts">
defineProps<{
  date?: string
  venue?: string
  id?: string
}>()
</script>

<template>
  <div class="meta-root">
    <span v-if="date" class="meta-item">{{ date }}</span>
    <span v-if="venue" class="meta-item">{{ venue }}</span>
    <span v-if="id" class="meta-item">{{ id }}</span>
    <slot />
  </div>
</template>

<style scoped>
.meta-root {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: var(--s-3);
  row-gap: var(--s-1);
  font-family: var(--font-mono);
  font-size: var(--t-xs);
  color: var(--fg-muted);
  letter-spacing: var(--ls-wide);
}

.meta-root > :first-child {
  white-space: nowrap;
}

.meta-root > * + *::before {
  content: '·';
  margin-right: var(--s-3);
  opacity: 0.5;
}
</style>
