import type { Product } from '../data/catalog'
import { Img } from './Img'

export function ProductImage({ product, sizes, priority = false, className = '' }: { product: Product; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={`product-image product-image--${product.imageKind} ${className}`}>
      <Img name={`product-${product.image}`} widths={[320, 640]} ratio={[1, 1]} sizes={sizes} alt={product.imageAlt} priority={priority} />
    </div>
  )
}
