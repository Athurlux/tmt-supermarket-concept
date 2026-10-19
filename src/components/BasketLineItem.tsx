import { Link } from 'react-router'
import { maxQuantity } from '../data/catalog'
import type { PricedLine } from '../lib/basket'
import { formatUgx } from '../lib/money'
import { useBasket } from '../state/BasketContext'
import { useToast } from '../state/ToastContext'
import { Icon } from './Icon'
import { ProductImage } from './ProductImage'
import { QuantityStepper } from './QuantityStepper'

export function BasketLineItem({ line, compact = false, onNavigate }: { line: PricedLine; compact?: boolean; onNavigate?: () => void }) {
  const { setQuantity, remove } = useBasket()
  const { notify } = useToast()
  const name = line.optionLabel ? `${line.product.name} (${line.optionLabel})` : line.product.name

  return (
    <li className={`basket-line ${compact ? 'basket-line--compact' : ''}`}>
      <Link to={`/product/${line.product.slug}`} className="basket-line__media" tabIndex={-1} aria-hidden="true" onClick={onNavigate}>
        <ProductImage product={line.product} sizes="96px" />
      </Link>
      <div className="basket-line__info">
        <h3 className="basket-line__name">
          <Link to={`/product/${line.product.slug}`} onClick={onNavigate}>{line.product.name}</Link>
        </h3>
        <p className="basket-line__meta">
          {line.product.unit}{line.optionLabel && <> · {line.optionLabel}</>} · {formatUgx(line.unitPriceUgx)} each
        </p>
        <div className="basket-line__controls">
          <QuantityStepper
            size="compact"
            value={line.line.quantity}
            max={maxQuantity(line.product)}
            label={`Quantity of ${name}`}
            onChange={quantity => setQuantity(line.key, quantity)}
          />
          <button
            type="button"
            className="text-button basket-line__remove"
            onClick={() => { remove(line.key); notify(`Removed ${name} from your basket.`) }}
            aria-label={`Remove ${name} from basket`}
          >
            <Icon name="trash" size={16} /> <span aria-hidden="true">Remove</span>
          </button>
        </div>
      </div>
      <p className="basket-line__total"><span className="visually-hidden">Line total </span>{formatUgx(line.lineTotalUgx)}</p>
    </li>
  )
}
