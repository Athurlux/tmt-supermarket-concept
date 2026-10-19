import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  children: ReactNode
}

const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined

function FieldShell({ id, label, error, hint, optional, children }: FieldShellProps) {
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label} {optional && <span className="field__optional">(optional)</span>}
      </label>
      {hint && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {children}
      {error && <p className="field__error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

type Common = { id: string; label: string; error?: string; hint?: ReactNode; optional?: boolean }

export function TextField({ id, label, error, hint, optional, ...input }: Common & InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <input id={id} name={id} className="input" aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy(id, error, hint)} {...input} />
    </FieldShell>
  )
}

export function TextArea({ id, label, error, hint, optional, ...input }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <textarea id={id} name={id} className="input input--textarea" aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy(id, error, hint)} {...input} />
    </FieldShell>
  )
}

export function SelectField({ id, label, error, hint, optional, children, ...select }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <select id={id} name={id} className="input input--select" aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy(id, error, hint)} {...select}>
        {children}
      </select>
    </FieldShell>
  )
}

interface ChoiceOption<T extends string> {
  value: T
  label: string
  description?: string
}

/** Large radio cards in a fieldset; the legend names the group for assistive tech. */
export function ChoiceGroup<T extends string>({
  name, legend, options, value, onChange, error, hint,
}: {
  name: string
  legend: string
  options: ChoiceOption<T>[]
  value: T | null | ''
  onChange: (value: T) => void
  error?: string
  hint?: ReactNode
}) {
  return (
    <fieldset className={`choice-group ${error ? 'field--invalid' : ''}`} id={name} tabIndex={-1} aria-describedby={describedBy(name, error, hint)}>
      <legend className="field__label">{legend}</legend>
      {hint && <p className="field__hint" id={`${name}-hint`}>{hint}</p>}
      <div className="choice-group__options">
        {options.map(option => (
          <label key={option.value} className={`choice ${value === option.value ? 'is-selected' : ''}`}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span className="choice__text">
              <span className="choice__label">{option.label}</span>
              {option.description && <span className="choice__description">{option.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="field__error" id={`${name}-error`}>{error}</p>}
    </fieldset>
  )
}

/** Summarises errors after a failed submit; receives focus so the problem is announced. */
export function ErrorSummary({ errors, labels, id = 'error-summary' }: { errors: Record<string, string | undefined>; labels: Record<string, string>; id?: string }) {
  const entries = Object.entries(errors).filter((entry): entry is [string, string] => Boolean(entry[1]))
  if (!entries.length) return null
  return (
    <div className="error-summary" id={id} tabIndex={-1} role="alert">
      <h2 className="error-summary__title">Please check {entries.length === 1 ? 'one detail' : `${entries.length} details`}</h2>
      <ul>
        {entries.map(([field, message]) => (
          <li key={field}><a href={`#${field}`} onClick={event => { event.preventDefault(); focusField(field) }}>{labels[field] ? `${labels[field]}: ` : ''}{message}</a></li>
        ))}
      </ul>
    </div>
  )
}

export function focusField(field: string) {
  const target = document.getElementById(field)
  if (!target) return
  const focusable = target.matches('fieldset') ? target.querySelector<HTMLElement>('input:checked, input') ?? target : target
  focusable.focus({ preventScroll: true })
  target.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
