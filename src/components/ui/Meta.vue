<script setup lang="ts">
defineProps<{
  date?: string
  venue?: string
  id?: string
}>()
</script>

<template>
  <div class="meta-root">
    <span v-if="date" class="meta-item meta-date">
      {{ date }}
    </span>
    <span v-if="date && (venue || id)" class="meta-dot">·</span>
    <span v-if="venue" class="meta-item meta-venue">
      {{ venue }}
    </span>
    <span v-if="venue && id" class="meta-dot">·</span>
    <span v-if="id" class="meta-item meta-id">
      {{ id }}
    </span>
    <slot />
  </div>
</template>

<style scoped>
.meta-root {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  font-family: var(--font-mono);
  font-size: var(--t-xs);
  color: var(--fg-muted);
  letter-spacing: var(--ls-wide);
}

.meta-date {
  color: var(--spec-k);
}

.meta-dot {
  opacity: 0.5;
}
</style>
