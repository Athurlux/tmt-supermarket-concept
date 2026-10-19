import { Link } from 'react-router'
import { Icon } from './Icon'

/** Placed beside final form actions, where expectations matter most. */
export function ConceptNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="concept-note">
      <Icon name="info" size={18} />
      <span>{children} <Link to="/about#concept">About this concept</Link></span>
    </p>
  )
}
