<script setup lang='ts'>
import { isDark, toggleDark } from '~/logics'

// The server can't know the visitor's theme, and hydration won't patch a
// mismatched label, so only name the target theme once mounted
const mounted = useMounted()
const label = computed(() => {
  if (!mounted.value)
    return 'Toggle colour theme'
  return isDark.value ? 'Switch to light theme' : 'Switch to dark theme'
})
</script>

<template>
  <button
    type="button"
    class="theme-toggle select-none"
    :aria-label="label"
    :title="label"
    @click="toggleDark"
  >
    <div i-ri-sun-line dark:i-ri-moon-line />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  color: var(--fg-muted);
  transition: color var(--dur-fast) var(--ease);
}

.theme-toggle:hover {
  color: var(--fg);
}
</style>
