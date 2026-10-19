import { useEffect, useId, useState } from 'react'
import { Icon } from './Icon'

interface QuantityStepperProps {
  value: number
  max: number
  onChange: (quantity: number) => void
  /** Accessible name, e.g. "Quantity of Sweet oranges". */
  label: string
  size?: 'regular' | 'compact'
}

/** Whole-number quantity with buttons and validated direct entry (min 1). */
export function QuantityStepper({ value, max, onChange, label, size = 'regular' }: QuantityStepperProps) {
  const [text, setText] = useState(String(value))
  const [message, setMessage] = useState<string | null>(null)
  const messageId = useId()

  useEffect(() => setText(String(value)), [value])

  const commit = () => {
    const parsed = Number(text)
    if (!text.trim() || !Number.isInteger(parsed) || parsed < 1) {
      setMessage(`Enter a whole number from 1 to ${max}.`)
      setText(String(value))
      return
    }
    if (parsed > max) {
      setMessage(`Up to ${max} per order in this demo.`)
      setText(String(max))
      if (max !== value) onChange(max)
      return
    }
    setMessage(null)
    if (parsed !== value) onChange(parsed)
  }

  const step = (delta: number) => {
    const next = Math.min(Math.max(value + delta, 1), max)
    setMessage(value + delta > max ? `Up to ${max} per order in this demo.` : null)
    if (next !== value) onChange(next)
  }

  return (
    <div className={`stepper stepper--${size}`}>
      <div className="stepper__controls" role="group" aria-label={label}>
        <button type="button" className="stepper__button" onClick={() => step(-1)} disabled={value <= 1} aria-label="Decrease quantity">
          <Icon name="minus" size={16} />
        </button>
        <input
          className="stepper__input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="Quantity"
          aria-describedby={message ? messageId : undefined}
          aria-invalid={message?.startsWith('Enter') || undefined}
          value={text}
          onChange={event => setText(event.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          onBlur={commit}
          onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); commit() } }}
        />
        <button type="button" className="stepper__button" onClick={() => step(1)} disabled={value >= max} aria-label="Increase quantity">
          <Icon name="plus" size={16} />
        </button>
      </div>
      {message && <p className="stepper__message" id={messageId}>{message}</p>}
    </div>
  )
}
