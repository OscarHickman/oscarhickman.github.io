<script setup lang="ts">
const props = defineProps<{
  title?: string
  id?: string
  first?: boolean
  spectral?: 'o' | 'b' | 'a' | 'f' | 'g' | 'k' | 'm'
}>()

const spectralColor = computed(() => {
  return props.spectral ? `var(--spec-${props.spectral})` : 'var(--border)'
})
</script>

<template>
  <section :id="id" :class="first ? 'mt-0' : 'mt-16'">
    <div v-if="title" class="section-header mb-8">
      <h2 class="section-title">
        {{ title }}
      </h2>
      <div class="section-line" :style="{ background: spectral ? `linear-gradient(to right, ${spectralColor}, var(--border))` : 'var(--border)' }" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: var(--s-4);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--t-2xl);
  font-weight: 600;
  letter-spacing: var(--ls-snug);
  margin: 0;
  white-space: nowrap;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}
</style>
