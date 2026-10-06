<script setup lang="ts">
function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()

const links = [
  { to: '/papers', label: 'Papers' },
  { to: '/talks', label: 'Talks' },
  { to: '/projects', label: 'Projects' },
  { to: '/photos', label: 'Photos' },
]

const socials = [
  { href: 'https://github.com/OscarHickman', label: 'GitHub', icon: 'i-uil-github-alt' },
  { href: 'https://www.linkedin.com/in/oscarhickman', label: 'LinkedIn', icon: 'i-ri-linkedin-line' },
  { href: 'https://www.strava.com/athletes/36376289', label: 'Strava', icon: 'i-ri-run-line' },
]
</script>

<template>
  <header class="site-header">
    <RouterLink class="home-link" to="/" aria-label="Oscar Hickman, home">
      <Logo />
    </RouterLink>
    <nav class="nav" aria-label="Main navigation">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to">
        {{ link.label }}
      </RouterLink>
      <a
        v-for="s in socials"
        :key="s.href"
        :href="s.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="s.label"
        :title="s.label"
        class="social"
      >
        <div :class="s.icon" />
      </a>
      <ToggleTheme />
    </nav>
    <button
      type="button"
      aria-label="Scroll to top"
      class="to-top print:hidden"
      :class="scroll > 300 ? 'op40' : 'op0! pointer-events-none'"
      :tabindex="scroll > 300 ? 0 : -1"
      :aria-hidden="scroll > 300 ? undefined : 'true'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
  </header>
</template>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4);
  padding: var(--s-5) var(--s-5);
}

.home-link {
  display: block;
  width: var(--s-10);
  height: var(--s-10);
  flex-shrink: 0;
  color: var(--fg);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  font-family: var(--font-display);
  font-size: var(--t-base);
}

.nav a {
  color: var(--fg-muted);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease);
}

.nav a:hover,
.nav a.router-link-active {
  color: var(--fg);
}

.nav a.router-link-active {
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-underline-offset: 0.3em;
}

.nav .social {
  display: none;
}

.to-top {
  position: fixed;
  right: var(--s-3);
  bottom: var(--s-3);
  width: var(--s-10);
  height: var(--s-10);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-full);
  z-index: var(--z-sticky);
  transition: opacity var(--dur-slow) var(--ease);
}

.to-top:hover {
  opacity: 1 !important;
  background: var(--bg-raised);
}

/* Smallest phones: tighten so four labels and the toggle still fit */
@media (max-width: 374px) {
  .site-header {
    padding: var(--s-4);
  }

  .home-link {
    width: var(--s-8);
    height: var(--s-8);
  }

  .nav {
    gap: var(--s-3);
    font-size: var(--t-sm);
  }
}

@media (min-width: 768px) {
  .site-header {
    padding: var(--s-6) var(--s-8);
  }

  .nav {
    gap: var(--s-6);
  }

  .nav .social {
    display: inline-flex;
  }
}
</style>
