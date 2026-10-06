<script setup lang="ts">
import type { FlightOptions, FlightPose, Vec3 } from '~/logics/cosmic-flight'
import type { CosmicWebField, CosmicWebRequest } from '~/logics/cosmic-web'
import type { CosmicWebRenderer, CosmicWebTheme, Rgb } from '~/logics/cosmic-web-renderer'
import { isDark } from '~/logics'
import { flightPose } from '~/logics/cosmic-flight'
import { buildCosmicWeb } from '~/logics/cosmic-web'
import { createCosmicWebRenderer } from '~/logics/cosmic-web-renderer'
import { createFrameBudget } from '~/logics/frame-budget'

defineProps<{
  /** Full strength on the home page, quieter behind everything else. */
  hero: boolean
}>()

// Fixed seed so every visitor flies through the same patch of universe
const SEED = 20260508
const MOBILE_BREAKPOINT = 768
// Same particle count on both; phones trade small-scale detail for a cheaper field
const DESKTOP_FIELD = { size: 64, oversample: 1 }
const MOBILE_FIELD = { size: 32, oversample: 2 }
// Close to the slope of the matter power spectrum on the scales of the web
const SPECTRAL_INDEX = -1.5
const SMOOTHING = 0.02
// Particles below three times the mean density end up in voids: three
// quarters of them, carrying about 0.5% of the light, so they are dropped
const MIN_DENSITY = 3

// Linear growth factor: start just after the initial conditions, end once
// filaments have formed but before walls fold into multistream regions
const GROWTH_START = 0.15
const GROWTH_END = 0.85
const FORMATION_SECONDS = 5
const FADE_IN_SECONDS = 1.6
const MAX_FRAME_SECONDS = 0.1
const IDLE_TIMEOUT_MS = 500

// Distances are in box lengths
const FLIGHT: FlightOptions = { speed: 0.012, heading: [0.35, 0.22, 1], sway: 0.3, period: 45 }
const HEADING_LENGTH = Math.hypot(...FLIGHT.heading)
const HEADING = FLIGHT.heading.map(c => c / HEADING_LENGTH) as Vec3
const SCROLL_TRAVEL_PER_PIXEL = 0.00004
const SCROLL_EASE_SECONDS = 0.6
const DARK_STRENGTH = 0.85
const LIGHT_STRENGTH = 0.7
// Light buffer resolution steps for devices that cannot hold ~40 fps
const QUALITY_LEVELS = [1, 0.75, 0.5]
const SLOW_FRAME_SECONDS = 1 / 40
const QUALITY_SETTLE_SECONDS = 2

function readColor(token: string): Rgb | null {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  const match = value.match(/^#([0-9a-f]{6})$/i)
  if (!match)
    return null
  const int = Number.parseInt(match[1], 16)
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255]
}

/** Thin filaments take the accent, dense nodes the text colour. */
function currentTheme(): CosmicWebTheme {
  const fg = readColor('--fg') ?? [1, 1, 1]
  return {
    thin: readColor('--accent') ?? fg,
    dense: fg,
    strength: isDark.value ? DARK_STRENGTH : LIGHT_STRENGTH,
  }
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')
const reducedMotion = usePreferredReducedMotion()
const isStill = computed(() => reducedMotion.value === 'reduce')

let renderer: CosmicWebRenderer | null = null
let web: CosmicWebField | null = null
let worker: Worker | null = null
let idleHandle = 0
let frameId = 0
let elapsed = 0
let lastFrame = 0
let scrollTravel = 0
let isDisposed = false
const frameBudget = createFrameBudget({
  slowFrameSeconds: SLOW_FRAME_SECONDS,
  settleSeconds: QUALITY_SETTLE_SECONDS,
  levels: QUALITY_LEVELS.length,
})

/** Camera pose at the current time, pushed further along the heading by scrolling. */
function currentPose(): FlightPose {
  const pose = flightPose(elapsed, FLIGHT)
  return {
    ...pose,
    position: pose.position.map((c, i) => c + HEADING[i] * scrollTravel) as Vec3,
  }
}

function render() {
  if (!renderer)
    return
  if (isStill.value) {
    renderer.draw({ growth: GROWTH_END, pose: flightPose(0, FLIGHT), fade: 1 })
    return
  }
  const formation = easeOutCubic(Math.min(elapsed / FORMATION_SECONDS, 1))
  renderer.draw({
    growth: GROWTH_START + (GROWTH_END - GROWTH_START) * formation,
    pose: currentPose(),
    fade: Math.min(elapsed / FADE_IN_SECONDS, 1),
  })
}

function loop(now: number) {
  const dt = Math.min(Math.max((now - lastFrame) / 1000, 0), MAX_FRAME_SECONDS)
  elapsed += dt
  lastFrame = now
  // Ease towards the scroll position so wheel steps glide instead of jumping
  const target = window.scrollY * SCROLL_TRAVEL_PER_PIXEL
  scrollTravel += (target - scrollTravel) * (1 - Math.exp(-dt / SCROLL_EASE_SECONDS))
  const level = frameBudget.record(dt)
  if (level !== null)
    renderer?.setQuality(QUALITY_LEVELS[level])
  render()
  frameId = requestAnimationFrame(loop)
}

function start() {
  if (frameId || !renderer || isStill.value || document.hidden)
    return
  lastFrame = performance.now()
  frameId = requestAnimationFrame(loop)
}

function stop() {
  cancelAnimationFrame(frameId)
  frameId = 0
}

function onResize() {
  renderer?.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
  // The running loop redraws on its next frame anyway
  if (!frameId)
    render()
}

function onVisibilityChange() {
  if (document.hidden)
    stop()
  else
    start()
}

watch(isDark, () => nextTick(() => {
  renderer?.setTheme(currentTheme())
  render()
}))

watch(isStill, (still) => {
  if (still) {
    stop()
    render()
  }
  else {
    start()
  }
})

function initRenderer() {
  const canvas = canvasRef.value
  if (!canvas || !web)
    return
  renderer = createCosmicWebRenderer(canvas, web)
  // Without WebGL the page simply keeps its plain background
  if (!renderer)
    return
  scrollTravel = window.scrollY * SCROLL_TRAVEL_PER_PIXEL
  renderer.setQuality(QUALITY_LEVELS[frameBudget.level])
  renderer.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
  renderer.setTheme(currentTheme())
  render()
  start()
}

function onContextLost(event: Event) {
  // Ask the browser to restore the context instead of giving up on it
  event.preventDefault()
  stop()
  renderer = null
}

function request(field: typeof DESKTOP_FIELD): CosmicWebRequest {
  return {
    field: { ...field, seed: SEED, spectralIndex: SPECTRAL_INDEX, smoothing: SMOOTHING },
    growth: GROWTH_END,
    minDensity: MIN_DENSITY,
  }
}

function onField(field: CosmicWebField) {
  if (isDisposed)
    return
  web = field
  initRenderer()
}

/**
 * Fallback when workers are unavailable: generate on the main thread when
 * idle, using the cheaper phone field to keep the pause short.
 */
function generateWhenIdle() {
  const options = request(MOBILE_FIELD)
  const run = () => {
    idleHandle = 0
    onField(buildCosmicWeb(options))
  }
  idleHandle = 'requestIdleCallback' in window
    ? window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS })
    : window.setTimeout(run, 0)
}

function generate() {
  if (typeof Worker === 'undefined') {
    generateWhenIdle()
    return
  }
  try {
    worker = new Worker(new URL('../logics/cosmic-web.worker.ts', import.meta.url), { type: 'module' })
  }
  catch (error) {
    console.warn('Cosmic web worker unavailable, generating on the main thread:', error)
    generateWhenIdle()
    return
  }
  worker.onmessage = (event: MessageEvent<CosmicWebField>) => {
    worker?.terminate()
    worker = null
    onField(event.data)
  }
  worker.onerror = (event) => {
    console.warn('Cosmic web worker failed, generating on the main thread:', event.message)
    worker?.terminate()
    worker = null
    generateWhenIdle()
  }
  worker.postMessage(request(window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_FIELD : DESKTOP_FIELD))
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas)
    return
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', initRenderer)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibilityChange)
  generate()
})

onBeforeUnmount(() => {
  isDisposed = true
  worker?.terminate()
  worker = null
  if (idleHandle) {
    if ('cancelIdleCallback' in window)
      window.cancelIdleCallback(idleHandle)
    else
      window.clearTimeout(idleHandle)
  }
  stop()
  canvasRef.value?.removeEventListener('webglcontextlost', onContextLost)
  canvasRef.value?.removeEventListener('webglcontextrestored', initRenderer)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  renderer?.dispose()
  renderer = null
  web = null
})
</script>

<template>
  <div class="cosmic-web print:hidden" :class="{ 'is-hero': hero }" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.cosmic-web {
  position: fixed;
  inset: 0;
  z-index: var(--z-sunken);
  pointer-events: none;
  opacity: 0.4;
  transition: opacity var(--dur-slow) var(--ease);
  /* Keep the reading column calm; let the structure live at the edges */
  -webkit-mask-image: linear-gradient(to right, black, rgb(0 0 0 / 0.12) 30%, rgb(0 0 0 / 0.12) 70%, black);
  mask-image: linear-gradient(to right, black, rgb(0 0 0 / 0.12) 30%, rgb(0 0 0 / 0.12) 70%, black);
}

.cosmic-web.is-hero {
  opacity: 1;
}

/* The reading column spans the whole screen on phones, so dim evenly */
@media (max-width: 767px) {
  .cosmic-web {
    opacity: 0.25;
    -webkit-mask-image: none;
    mask-image: none;
  }

  .cosmic-web.is-hero {
    opacity: 0.45;
  }
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
