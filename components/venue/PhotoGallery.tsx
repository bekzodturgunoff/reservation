'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronLeft, ChevronRight, Image } from 'lucide-react'
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

interface PhotoGalleryProps {
  photos: string[]
  name: string
}

export function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const { t } = useTranslation()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const images = photos.length > 0 ? photos : [PLACEHOLDER_IMAGE]

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }, [])

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }, [images.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, closeLightbox, prev, next])

  return (
    <>
      <div className="grid lg:grid-cols-4 gap-2 h-[300px] sm:h-[400px] lg:h-[460px] rounded-card overflow-hidden">
        <div
          className="lg:col-span-2 h-full relative group cursor-pointer overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0]}
            alt={`${name} — rasm 1`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="hidden lg:grid grid-rows-2 gap-2 h-full">
          {images.slice(1, 3).map((img, i) => (
            <div
              key={i}
              className="relative group cursor-pointer overflow-hidden"
              onClick={() => openLightbox(i + 1)}
            >
              <img
                src={img}
                alt={`${name} — rasm ${i + 2}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
        {images.length > 3 && (
          <button
            onClick={() => openLightbox(3)}
            className="hidden lg:flex items-center justify-center gap-2 bg-surface-bg hover:bg-surface-subtle transition-colors rounded-card cursor-pointer"
          >
            <Image className="w-5 h-5 text-ink-muted" />
            <span className="text-sm font-medium text-ink-secondary">
              +{images.length - 3} {t('common.photos')}
            </span>
          </button>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
            aria-label={t('common.previousPhoto')}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
            aria-label={t('common.nextPhoto')}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <img
            src={images[lightboxIndex]}
            alt={`${name} — rasm ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg select-none pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === lightboxIndex ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`${t('common.photo')} ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
