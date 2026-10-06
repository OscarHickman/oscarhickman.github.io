<script setup lang="ts">
import type { CosmicWebField } from '~/logics/cosmic-web'
import { isDark } from '~/logics'
import { generateCosmicWeb } from '~/logics/cosmic-web'

defineProps<{
  /** Full strength on the home page, quieter behind everything else. */
  hero: boolean
}>()

// Fixed seed so every visitor sees the same patch of universe
const SEED = 20260508
const DESKTOP_SIZE = 256
const MOBILE_SIZE = 128
const MOBILE_BREAKPOINT = 768
// Particles per grid cell per axis, interpolated from the smooth fields
const OVERSAMPLE = 2
// Bluer than CDM so the screen shows a network of filaments, not a few huge sheets
const SPECTRAL_INDEX = -1.2
const SMOOTHING = 0.009

// Linear growth factor: start just after the initial conditions, end once
// filaments have formed but before sheets fold into multistream ribbons
const GROWTH_START = 0.15
const GROWTH_END = 1.05
const FORMATION_SECONDS = 5
const FADE_IN_SECONDS = 1.6
const DRIFT_CELLS_PER_SECOND = 0.35
const PARALLAX_CELLS_PER_PIXEL = 0.012
const MAX_FRAME_SECONDS = 0.1
const IDLE_TIMEOUT_MS = 500
const MAX_PIXEL_RATIO = 2
const POINT_SIZE = 2.4
const DARK_ALPHA = 0.045
const LIGHT_ALPHA = 0.038

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_displacement;
attribute vec3 a_deformation;
uniform float u_growth;
uniform vec2 u_offset;
uniform float u_size;
uniform vec2 u_scale;
uniform float u_pointSize;
uniform float u_alpha;
varying float v_alpha;
varying float v_density;

void main() {
  vec2 x = a_position + u_growth * a_displacement + u_offset;
  vec2 p = fract(x / u_size) * 2.0 - 1.0;
  gl_Position = vec4(p * u_scale, 0.0, 1.0);

  // Zel'dovich density contrast: 1 / |det(I + D ∂ψ/∂q)|
  float a = 1.0 + u_growth * a_deformation.x;
  float d = 1.0 + u_growth * a_deformation.z;
  float b = u_growth * a_deformation.y;
  float density = 1.0 / max(abs(a * d - b * b), 0.04);

  v_density = density;
  v_alpha = u_alpha * clamp(pow(density, 0.6), 0.08, 4.0);
  gl_PointSize = u_pointSize;
}
`

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_colorThin;
uniform vec3 u_colorDense;
varying float v_alpha;
varying float v_density;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = v_alpha * (1.0 - smoothstep(0.0, 0.25, dot(c, c)));
  vec3 color = mix(u_colorThin, u_colorDense, smoothstep(1.5, 8.0, v_density));
  gl_FragColor = vec4(color * a, a);
}
`

type Rgb = [number, number, number]

interface Renderer {
  draw: (growth: number, offset: [number, number], fade: number) => void
  resize: () => void
  applyTheme: () => void
  dispose: () => void
}

function readColor(token: string): Rgb | null {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  const match = value.match(/^#([0-9a-f]{6})$/i)
  if (!match)
    return null
  const int = Number.parseInt(match[1], 16)
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255]
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader)
    return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Cosmic web shader failed to compile:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program)
    return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Cosmic web program failed to link:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

function createRenderer(canvas: HTMLCanvasElement, web: CosmicWebField): Renderer | null {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true })
  if (!gl)
    return null
  const program = createProgram(gl)
  if (!program)
    return null

  // Interleave per-particle data: q (2), ψ (2), ∂ψ/∂q (3)
  const count = web.count
  const stride = 7
  const data = new Float32Array(count * stride)
  for (let i = 0; i < count; i++) {
    const o = i * stride
    data[o] = web.positions[2 * i]
    data[o + 1] = web.positions[2 * i + 1]
    data[o + 2] = web.displacements[2 * i]
    data[o + 3] = web.displacements[2 * i + 1]
    data[o + 4] = web.deformations[3 * i]
    data[o + 5] = web.deformations[3 * i + 1]
    data[o + 6] = web.deformations[3 * i + 2]
  }

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  gl.useProgram(program)

  const bytes = Float32Array.BYTES_PER_ELEMENT
  const attributes: [string, number, number][] = [
    ['a_position', 2, 0],
    ['a_displacement', 2, 2],
    ['a_deformation', 3, 4],
  ]
  for (const [name, size, offset] of attributes) {
    const location = gl.getAttribLocation(program, name)
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride * bytes, offset * bytes)
  }

  const uniform = (name: string) => gl.getUniformLocation(program, name)
  const uGrowth = uniform('u_growth')
  const uOffset = uniform('u_offset')
  const uScale = uniform('u_scale')
  const uPointSize = uniform('u_pointSize')
  const uAlpha = uniform('u_alpha')
  const uColorThin = uniform('u_colorThin')
  const uColorDense = uniform('u_colorDense')
  gl.uniform1f(uniform('u_size'), web.size)
  gl.enable(gl.BLEND)

  let baseAlpha = DARK_ALPHA

  return {
    draw(growth, offset, fade) {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uGrowth, growth)
      gl.uniform2f(uOffset, offset[0], offset[1])
      gl.uniform1f(uAlpha, baseAlpha * fade)
      gl.drawArrays(gl.POINTS, 0, count)
    },
    resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      gl.viewport(0, 0, canvas.width, canvas.height)
      // Cover the viewport with the square box, cropping the shorter side
      if (width >= height)
        gl.uniform2f(uScale, 1, width / height)
      else
        gl.uniform2f(uScale, height / width, 1)
      gl.uniform1f(uPointSize, POINT_SIZE * ratio)
    },
    applyTheme() {
      // Thin filaments take the accent, dense nodes the text colour
      const fg = readColor('--fg') ?? [1, 1, 1]
      const accent = readColor('--accent') ?? fg
      gl.uniform3fv(uColorThin, accent)
      gl.uniform3fv(uColorDense, fg)
      if (isDark.value) {
        // Additive light: dense filaments glow, voids stay dark
        gl.blendFunc(gl.ONE, gl.ONE)
        baseAlpha = DARK_ALPHA
      }
      else {
        // Ink on paper: dense filaments darken
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        baseAlpha = LIGHT_ALPHA
      }
    },
    dispose() {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')
const reducedMotion = usePreferredReducedMotion()
const isStill = computed(() => reducedMotion.value === 'reduce')

let renderer: Renderer | null = null
let web: CosmicWebField | null = null
let idleHandle = 0
let frameId = 0
let elapsed = 0
let lastFrame = 0

function render() {
  if (!renderer)
    return
  if (isStill.value) {
    renderer.draw(GROWTH_END, [0, 0], 1)
    return
  }
  const formation = easeOutCubic(Math.min(elapsed / FORMATION_SECONDS, 1))
  const growth = GROWTH_START + (GROWTH_END - GROWTH_START) * formation
  const fade = Math.min(elapsed / FADE_IN_SECONDS, 1)
  const drift = elapsed * DRIFT_CELLS_PER_SECOND
  const parallax = window.scrollY * PARALLAX_CELLS_PER_PIXEL
  renderer.draw(growth, [drift, 0.6 * drift + parallax], fade)
}

function loop(now: number) {
  elapsed += Math.min(Math.max((now - lastFrame) / 1000, 0), MAX_FRAME_SECONDS)
  lastFrame = now
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
  renderer?.resize()
  render()
}

function onVisibilityChange() {
  if (document.hidden)
    stop()
  else
    start()
}

watch(isDark, () => nextTick(() => {
  renderer?.applyTheme()
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
  renderer = createRenderer(canvas, web)
  // Without WebGL the page simply keeps its plain background
  if (!renderer)
    return
  renderer.resize()
  renderer.applyTheme()
  render()
  start()
}

function onContextLost(event: Event) {
  // Ask the browser to restore the context instead of giving up on it
  event.preventDefault()
  stop()
  renderer = null
}

function setup() {
  idleHandle = 0
  const size = window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_SIZE : DESKTOP_SIZE
  web = generateCosmicWeb({
    size,
    seed: SEED,
    spectralIndex: SPECTRAL_INDEX,
    smoothing: SMOOTHING,
    oversample: OVERSAMPLE,
  })
  initRenderer()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas)
    return
  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', initRenderer)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibilityChange)
  // Generating the field takes tens of milliseconds, so keep it off the
  // critical path of hydration and first interaction
  idleHandle = 'requestIdleCallback' in window
    ? window.requestIdleCallback(setup, { timeout: IDLE_TIMEOUT_MS })
    : window.setTimeout(setup, 0)
})

onBeforeUnmount(() => {
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
