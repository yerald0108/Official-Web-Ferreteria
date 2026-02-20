// src/hooks/useConfetti.ts
// Confetti engine puro — sin dependencias externas

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  shape: 'rect' | 'circle' | 'triangle'
  size: number
  opacity: number
  life: number
  maxLife: number
}

const COLORS = [
  '#f97316', // orange-500
  '#fb923c', // orange-400
  '#fdba74', // orange-300
  '#fcd34d', // amber-300
  '#fbbf24', // amber-400
  '#22c55e', // green-500
  '#4ade80', // green-400
  '#60a5fa', // blue-400
  '#f472b6', // pink-400
  '#a78bfa', // violet-400
  '#ffffff',
]

function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = 4 + Math.random() * 10
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: (['rect', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
    size: 6 + Math.random() * 8,
    opacity: 1,
    life: 0,
    maxLife: 90 + Math.random() * 60,
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save()
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = p.color
  ctx.translate(p.x, p.y)
  ctx.rotate((p.rotation * Math.PI) / 180)

  if (p.shape === 'rect') {
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
  } else if (p.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(0, -p.size / 2)
    ctx.lineTo(p.size / 2, p.size / 2)
    ctx.lineTo(-p.size / 2, p.size / 2)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export function launchConfetti(duration = 3000) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none;
    z-index: 9999;
  `
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx        = canvas.getContext('2d')!
  const particles: Particle[] = []
  let   animId:    number
  let   startTime: number | null = null
  let   lastBurst  = 0

  function burst(count = 40) {
    const cx = window.innerWidth / 2
    for (let i = 0; i < count; i++) {
      // Originate from top-center, spread across
      const x = cx + (Math.random() - 0.5) * window.innerWidth * 0.5
      const y = -10 + Math.random() * 60
      particles.push(createParticle(x, y))
    }
    // Side cannons
    for (let i = 0; i < 15; i++) {
      particles.push(createParticle(0, window.innerHeight * 0.3))
      particles.push(createParticle(window.innerWidth, window.innerHeight * 0.3))
    }
  }

  function tick(ts: number) {
    if (!startTime) startTime = ts
    const elapsed = ts - startTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Burst every 400ms for first 1.5s
    if (elapsed - lastBurst > 400 && elapsed < 1500) {
      burst(elapsed < 200 ? 80 : 30)
      lastBurst = elapsed
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x  += p.vx
      p.y  += p.vy
      p.vy += 0.25 // gravity
      p.vx *= 0.99 // air drag
      p.rotation += p.rotationSpeed
      p.life++
      p.opacity = Math.max(0, 1 - p.life / p.maxLife)

      if (p.opacity <= 0 || p.y > canvas.height + 50) {
        particles.splice(i, 1)
        continue
      }
      drawParticle(ctx, p)
    }

    if (elapsed < duration || particles.length > 0) {
      animId = requestAnimationFrame(tick)
    } else {
      canvas.remove()
    }
  }

  burst(80) // initial big burst
  animId = requestAnimationFrame(tick)

  setTimeout(() => {
    cancelAnimationFrame(animId)
    canvas.remove()
  }, duration + 2000)
}