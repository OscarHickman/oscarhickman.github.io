<script setup lang="ts">
const el = useTemplateRef<HTMLCanvasElement>('el')

interface Star {
  x: number
  y: number
  radius: number
  baseAlpha: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
  driftX: number
  driftY: number
}

let animId: number | null = null
const stars: Star[] = []

// Realistic stellar spectral colours (hot O/B blue-white, A/F white, G/K warm white, rare amber)
const STAR_COLORS = [
  '#e2ecff', // O/B blue-white
  '#f8faff', // A white
  '#ffffff', // Pure white
  '#fff6e8', // F/G warm white
  '#ffdca8', // K light orange
]

function initStars(width: number, height: number) {
  stars.length = 0
  const count = Math.floor((width * height) / 5800)

  for (let i = 0; i < count; i++) {
    const rSample = Math.random()
    let radius = 0.55
    let baseAlpha = 0.35 + Math.random() * 0.45

    if (rSample > 0.94) {
      radius = 1.35 + Math.random() * 0.55
      baseAlpha = 0.75 + Math.random() * 0.25
    }
    else if (rSample > 0.75) {
      radius = 0.9 + Math.random() * 0.35
      baseAlpha = 0.5 + Math.random() * 0.35
    }

    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius,
      baseAlpha,
      twinkleSpeed: 0.8 + Math.random() * 2.2,
      twinklePhase: Math.random() * Math.PI * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      driftX: (Math.random() - 0.5) * 0.04,
      driftY: (Math.random() - 0.5) * 0.04,
    })
  }
}

onMounted(() => {
  const canvas = el.value
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  let width = window.innerWidth
  let height = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    if (!canvas)
      return
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    initStars(width, height)
  }

  resize()
  window.addEventListener('resize', resize)

  let lastTime = performance.now()

  function draw(now: number) {
    const dt = (now - lastTime) / 1000
    lastTime = now

    ctx!.clearRect(0, 0, width, height)

    const scrollY = window.scrollY || 0
    const parallaxOffset = (scrollY * 0.05) % height

    for (const star of stars) {
      star.twinklePhase += star.twinkleSpeed * dt
      const twinkle = Math.sin(star.twinklePhase) * 0.25
      const currentAlpha = Math.max(0.08, Math.min(1, star.baseAlpha + twinkle))

      star.x = (star.x + star.driftX * dt * 60 + width) % width
      const renderY = (star.y - parallaxOffset + height) % height

      ctx!.beginPath()
      ctx!.arc(star.x, renderY, star.radius, 0, Math.PI * 2)
      ctx!.fillStyle = star.color
      ctx!.globalAlpha = currentAlpha
      ctx!.fill()

      if (star.radius > 1.2) {
        ctx!.beginPath()
        ctx!.arc(star.x, renderY, star.radius * 2.8, 0, Math.PI * 2)
        ctx!.fillStyle = star.color
        ctx!.globalAlpha = currentAlpha * 0.18
        ctx!.fill()
      }
    }

    ctx!.globalAlpha = 1
    animId = requestAnimationFrame(draw)
  }

  animId = requestAnimationFrame(draw)

  onUnmounted(() => {
    if (animId)
      cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<template>
  <div class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none z--1 overflow-hidden" aria-hidden="true">
    <canvas ref="el" class="block w-full h-full dark:opacity-85 opacity-30 transition-opacity duration-700" />
  </div>
</template>
