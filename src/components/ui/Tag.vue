<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    spectral?: 'o' | 'b' | 'a' | 'f' | 'g' | 'k' | 'm'
  }>(),
  {
    spectral: 'b',
  },
)

const colorMap = {
  o: 'var(--spec-o)',
  b: 'var(--spec-b)',
  a: 'var(--spec-a)',
  f: 'var(--spec-f)',
  g: 'var(--spec-g)',
  k: 'var(--spec-k)',
  m: 'var(--spec-m)',
}
</script>

<template>
  <span
    class="tag-root"
    :style="{
      '--tag-color': colorMap[props.spectral] || 'var(--accent)',
    }"
  >
    <slot />
  </span>
</template>

<style scoped>
.tag-root {
  display: inline-block;
  padding: 0.2rem var(--s-2);
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--tag-color) 12%, transparent);
  color: var(--tag-color);
  border: 1px solid color-mix(in srgb, var(--tag-color) 25%, transparent);
  font-size: var(--t-xs);
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: var(--ls-wide);
  line-height: 1.2;
}
</style>
