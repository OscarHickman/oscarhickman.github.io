<script setup lang="ts">
defineProps<{
  title?: string
  id?: string
  first?: boolean
}>()
</script>

<template>
  <section :id="id" :class="first ? 'mt-0' : 'mt-14'">
    <h2 v-if="title" class="section-title">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

<style scoped>
.section-title {
  font-family: var(--font-display);
  font-size: var(--t-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-muted);
  margin: 0 0 var(--s-5);
  padding-bottom: var(--s-2);
  border-bottom: 1px solid var(--border);
}
</style>
