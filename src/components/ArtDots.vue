<script setup lang="ts">
import { createNoise2D } from 'simplex-noise'

const el = useTemplateRef<HTMLCanvasElement>('el')
const prefersReducedMotion = usePreferredReducedMotion()

interface Node {
  x: number
  y: number
  radius: number
  baseAlpha: number
  color: string
  vx: number
  vy: number
  intensity: number
}

let animId: number | null = null
const nodes: Node[] = []
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let dpr = 1
const noise2D = createNoise2D()

// Realistic stellar spectral colours (hot O/B blue-white, A/F white, G/K warm white)
const SPECTRAL_COLORS = [
  '#93c5fd', // O/B blue-white (--spec-o)
  '#bae6fd', // B blue (--spec-b)
  '#f8fafc', // A white (--spec-a)
  '#fde047', // G warm white (--spec-g)
  '#fbbf24', // K light orange (--spec-k)
]

function initCosmicWeb(w: number, h: number) {
  nodes.length = 0
  // Scale density conservatively: fewer nodes on mobile to respect low-DPI frame budget
  const isMobile = w < 768
  const density = isMobile ? 12000 : 7000
  const count = Math.min(Math.floor((w * h) / density), isMobile ? 60 : 150)

  for (let i = 0; i < count; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const rSample = Math.random()
    let radius = 0.65
    let baseAlpha = 0.35 + Math.random() * 0.4

    if (rSample > 0.92) {
      radius = 1.4 + Math.random() * 0.5
      baseAlpha = 0.7 + Math.random() * 0.3
    }
    else if (rSample > 0.7) {
      radius = 0.95 + Math.random() * 0.35
      baseAlpha = 0.5 + Math.random() * 0.3
    }

    nodes.push({
      x,
      y,
      radius,
      baseAlpha,
      color: SPECTRAL_COLORS[Math.floor(Math.random() * SPECTRAL_COLORS.length)],
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      intensity: 0.5 + Math.random() * 0.5,
    })
  }
}

function renderStaticFrame() {
  if (!ctx)
    return
  ctx.clearRect(0, 0, width, height)

  // Draw delicate filaments between proximate nodes
  const maxDist = 95
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy)

      if (dist < maxDist) {
        const filamentAlpha = (1 - dist / maxDist) * 0.12
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = '#38bdf8'
        ctx.globalAlpha = filamentAlpha
        ctx.lineWidth = 0.65
        ctx.stroke()
      }
    }
  }

  // Draw nodes
  for (const node of nodes) {
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
    ctx.fillStyle = node.color
    ctx.globalAlpha = node.baseAlpha
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

onMounted(() => {
  const canvas = el.value
  if (!canvas)
    return

  ctx = canvas.getContext('2d')
  if (!ctx)
    return

  width = window.innerWidth
  height = window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    if (!canvas || !ctx)
      return
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    initCosmicWeb(width, height)
    if (prefersReducedMotion.value === 'reduce')
      renderStaticFrame()
  }

  resize()
  window.addEventListener('resize', resize)

  // If user prefers reduced motion, draw a single static cosmic web frame and exit loop
  if (prefersReducedMotion.value === 'reduce') {
    renderStaticFrame()
    return
  }

  let lastTime = performance.now()
  let isPaused = false

  function handleVisibilityChange() {
    if (document.hidden) {
      isPaused = true
      if (animId) {
        cancelAnimationFrame(animId)
        animId = null
      }
    }
    else {
      isPaused = false
      lastTime = performance.now()
      if (!animId)
        animId = requestAnimationFrame(draw)
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  const maxDist = width < 768 ? 75 : 105

  function draw(now: number) {
    if (isPaused || !ctx)
      return

    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    ctx.clearRect(0, 0, width, height)

    const scrollY = window.scrollY || 0
    const parallaxOffset = (scrollY * 0.04) % height
    const timeSec = now * 0.0002

    // Update positions with subtle simplex flow field
    for (const node of nodes) {
      const angle = noise2D(node.x * 0.0015, (node.y + scrollY * 0.1) * 0.0015 + timeSec) * Math.PI * 2
      const flowX = Math.cos(angle) * 0.05
      const flowY = Math.sin(angle) * 0.05

      node.x = (node.x + (node.vx + flowX) * dt * 60 + width) % width
      node.y = (node.y + (node.vy + flowY) * dt * 60 + height) % height
    }

    // Render filament network
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      const ay = (a.y - parallaxOffset + height) % height

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        const by = (b.y - parallaxOffset + height) % height

        const dx = b.x - a.x
        const dy = by - ay
        const dist = Math.hypot(dx, dy)

        if (dist < maxDist) {
          const filamentAlpha = (1 - dist / maxDist) * 0.12 * a.intensity
          ctx.beginPath()
          ctx.moveTo(a.x, ay)
          ctx.lineTo(b.x, by)
          ctx.strokeStyle = '#38bdf8'
          ctx.globalAlpha = filamentAlpha
          ctx.lineWidth = 0.65
          ctx.stroke()
        }
      }
    }

    // Render nodes
    for (const node of nodes) {
      const renderY = (node.y - parallaxOffset + height) % height
      const pulse = Math.sin(now * 0.002 + node.x) * 0.15
      const currentAlpha = Math.max(0.1, Math.min(0.9, node.baseAlpha + pulse))

      ctx.beginPath()
      ctx.arc(node.x, renderY, node.radius, 0, Math.PI * 2)
      ctx.fillStyle = node.color
      ctx.globalAlpha = currentAlpha
      ctx.fill()

      if (node.radius > 1.2) {
        ctx.beginPath()
        ctx.arc(node.x, renderY, node.radius * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = currentAlpha * 0.15
        ctx.fill()
      }
    }

    ctx.globalAlpha = 1
    animId = requestAnimationFrame(draw)
  }

  animId = requestAnimationFrame(draw)

  onUnmounted(() => {
    if (animId)
      cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
})
</script>

<template>
  <div class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none z--1 overflow-hidden" aria-hidden="true">
    <canvas ref="el" class="block w-full h-full dark:opacity-85 opacity-35 transition-opacity duration-400" />
  </div>
</template>
