'use client'

import { useRef, useEffect, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
}

export function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let cancelled = false
    let cleanup: (() => void) | null = null

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      const offsets = { up: 40, down: -40, left: 40, right: -40 }
      const offset = offsets[direction]

      const anim = gsap.fromTo(
        el,
        { opacity: 0, y: direction === 'up' || direction === 'down' ? offset : 0, x: direction === 'left' || direction === 'right' ? offset : 0 },
        { opacity: 1, y: 0, x: 0, duration, delay, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }
      )

      if (cancelled) { anim.scrollTrigger?.kill(); anim.kill(); return }

      cleanup = () => { anim.scrollTrigger?.kill(); anim.kill() }
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [direction, delay, duration])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
