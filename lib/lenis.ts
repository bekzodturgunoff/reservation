'use client'

import { useEffect } from 'react'
import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export const useLenis = () => {
  useEffect(() => {
    const init = async () => {
      const Lenis = (await import('lenis')).default
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')

      gsap.registerPlugin(ScrollTrigger)

      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })

      lenisInstance.on('scroll', ScrollTrigger.update)
      gsap.ticker.add((time: number) => lenisInstance?.raf(time * 1000))
      gsap.ticker.lagSmoothing(0)
    }

    init()

    return () => {
      if (lenisInstance) lenisInstance.destroy()
    }
  }, [])
}
