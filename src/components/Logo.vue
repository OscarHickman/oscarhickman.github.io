<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Oscar Hickman - Logo">
    <title>Oscar Hickman</title>
    <!-- Uppercase OH Monogram -->
    <!-- The 'O' (Left side) -->
    <circle cx="32" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="10" />
    <!-- The 'H' (Right side, sharing the right edge of O) -->
    <path d="M68 22 L68 78 M92 22 L92 78 M68 50 L92 50" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
svg {
  display: block;
  animation: logo-pop 2s ease-out forwards;
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
