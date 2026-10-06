<template>
  <span class="tag-root">
    <slot />
  </span>
</template>

<style scoped>
.tag-root {
  display: inline-block;
  padding: 0.15rem var(--s-2);
  border-radius: var(--r-sm);
  border: 1px solid var(--border-strong);
  color: var(--fg-muted);
  font-size: var(--t-xs);
  font-family: var(--font-mono);
  letter-spacing: var(--ls-wide);
  line-height: 1.2;
  vertical-align: middle;
}
</style>
