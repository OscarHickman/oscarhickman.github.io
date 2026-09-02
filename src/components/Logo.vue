<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Oscar Hickman - Logo">
    <title>Oscar Hickman</title>
    <!-- Faint outer celestial diffraction ring -->
    <circle cx="32" cy="50" r="30.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.35" class="orbital-ring" />
    <!-- Uppercase OH Monogram -->
    <!-- The 'O' (Left side) -->
    <circle cx="32" cy="50" r="27" fill="none" stroke="currentColor" stroke-width="8.5" />
    <!-- Center focal point / stellar nucleus -->
    <circle cx="32" cy="50" r="2" fill="currentColor" opacity="0.6" />
    <!-- The 'H' (Right side, crisp geometry) -->
    <path d="M68 23 L68 77 M92 23 L92 77 M68 50 L92 50" stroke="currentColor" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
svg {
  display: block;
  animation: logo-pop 2s ease-out forwards;
}

.orbital-ring {
  transform-origin: 32px 50px;
  animation: orbit-spin 40s linear infinite;
}

@keyframes orbit-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  svg {
    transform: scale(0.85);
  }
}

@keyframes logo-pop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  @keyframes logo-pop {
    from {
      opacity: 0;
      transform: scale(0.75);
    }
    to {
      opacity: 1;
      transform: scale(0.85);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  svg {
    animation: none;
  }
}
</style>
