import type { CSSProperties } from 'react'

type SkeletonVariant = 'text' | 'circle' | 'rect'

interface SkeletonProps {
  variant?: SkeletonVariant
  className?: string
  width?: string | number
  height?: string | number
}

function Skeleton({
  variant = 'text',
  className = '',
  width,
  height,
}: SkeletonProps) {
  const style: CSSProperties = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  }

  const base = 'animate-pulse bg-surface-subtle rounded-xl'

  if (variant === 'circle') {
    return (
      <div
        aria-hidden="true"
        style={{ ...style, ...(width ? {} : { width: '2.5rem' }), ...(height ? {} : { height: '2.5rem' }) }}
        className={`${base} rounded-full shrink-0 ${className}`}
      />
    )
  }

  if (variant === 'rect') {
    return (
      <div
        aria-hidden="true"
        style={style}
        className={`${base} ${className}`}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      style={{ ...style, ...(height ? {} : { height: '1rem' }) }}
      className={`${base} w-full ${className}`}
    />
  )
}

export { Skeleton, type SkeletonProps, type SkeletonVariant }
