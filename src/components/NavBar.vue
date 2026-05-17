<script setup lang="ts">
function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()
</script>

<template>
  <header class="header z-40">
    <div class="home-button absolute xl:fixed m-5 flex items-center gap-3">
      <RouterLink
        class="w-12 h-12 select-none outline-none"
        to="/"
        focusable="false"
        title="Home"
      >
        <Logo />
      </RouterLink>
      <RouterLink
        to="/"
        class="hidden sm:block select-none text-sm font-medium op70 hover:op100 transition-opacity"
        title="Go home"
      >
        Home
      </RouterLink>
      <a
        href="https://www.strava.com/athletes/36376289"
        target="_blank"
        rel="noopener noreferrer"
        class="hidden sm:flex items-center justify-center w-8 h-8 op70 hover:op100 transition-opacity"
        title="Strava"
      >
        <div i-ri-run-line class="text-lg" />
      </a>
    </div>
    <button
      title="Scroll to top"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
    <nav class="nav">
      <div class="spacer" />
      <div class="right" print:op0>
        <RouterLink to="/papers" class="lt-md:hidden" title="Papers">
          Papers
        </RouterLink>
        <RouterLink to="/talks" class="lt-md:hidden" title="Talks">
          Talks
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span class="lt-md:hidden">Projects</span>
          <div i-ri-lightbulb-line class="md:hidden" />
        </RouterLink>
        <!-- Removed legacy sponsor/media/demo/chat/podcast links; simplified social navigation -->
        <RouterLink to="/photos" title="Photos">
          <div i-ri-camera-3-line />
        </RouterLink>
        <a href="https://github.com/OscarHickman" target="_blank" title="GitHub" class="lt-md:hidden">
          <div i-uil-github-alt />
        </a>
        <a href="https://www.linkedin.com/in/oscarhickman" target="_blank" title="LinkedIn" class="lt-md:hidden">
          <div i-ri-linkedin-line />
        </a>
        <ToggleTheme />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
}

.nav > * {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}
</style>
