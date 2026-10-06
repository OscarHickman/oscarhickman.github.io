<template>
  <footer class="site-footer print:hidden">
    <a href="https://github.com/OscarHickman" target="_blank" rel="noopener noreferrer">GitHub</a>
    <a href="https://www.linkedin.com/in/oscarhickman" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    <a href="https://www.strava.com/athletes/36376289" target="_blank" rel="noopener noreferrer">Strava</a>
  </footer>
</template>

<style scoped>
/* Social links live in the navbar on wider screens */
.site-footer {
  display: flex;
  justify-content: center;
  gap: var(--s-5);
  margin-top: var(--s-12);
  padding: var(--s-6) 0 var(--s-4);
  font-family: var(--font-mono);
  font-size: var(--t-xs);
}

.site-footer a {
  color: var(--fg-muted);
  text-decoration: none;
}

.site-footer a:hover {
  color: var(--fg);
}

@media (min-width: 768px) {
  .site-footer {
    display: none;
  }
}
</style>
