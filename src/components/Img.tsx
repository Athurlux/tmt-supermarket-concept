import type { ImgHTMLAttributes } from 'react'

interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> {
  /** Base name in /images, e.g. "dept-bakery" → /images/dept-bakery-<w>.webp */
  name: string
  widths: number[]
  /** Intrinsic aspect, used to reserve space and avoid layout shift. */
  ratio: [number, number]
  sizes: string
  alt: string
  priority?: boolean
}

export function Img({ name, widths, ratio, sizes, alt, priority = false, ...rest }: ImgProps) {
  const largest = widths[widths.length - 1]
  return (
    <img
      src={`/images/${name}-${widths[0]}.webp`}
      srcSet={widths.map(width => `/images/${name}-${width}.webp ${width}w`).join(', ')}
      sizes={sizes}
      width={largest}
      height={Math.round((largest * ratio[1]) / ratio[0])}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      {...rest}
    />
  )
}
