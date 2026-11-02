import { X } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export const Button = ({ className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) => (
  <button className={`button button-${variant} ${className}`} {...props} />
)

export const IconButton = ({ label, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) => (
  <button className="icon-button" aria-label={label} title={label} {...props} />
)

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input className="field" {...props} />
export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select className="field" {...props} />

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="field-group"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

const toneFor = (status: string) => {
  if (['Active', 'Confirmed', 'Completed', 'Returned', 'Valid', 'Paid', 'Converted', 'Documents Complete', 'Ready for Travel'].includes(status)) return 'success'
  if (['New', 'Travelling', 'Abroad', 'Contacted'].includes(status)) return 'info'
  if (['Follow-up Required', 'Pending Confirmation', 'In Preparation', 'Partially Paid', 'Documents Pending', 'Needs Review', 'Pending', 'Unpaid'].includes(status)) return 'warning'
  if (['Cancelled', 'Failed', 'Overdue', 'Lost', 'Reversed'].includes(status)) return 'danger'
  return 'neutral'
}

export const Badge = ({ children }: { children: string }) => <span className={`badge badge-${toneFor(children)}`}>{children}</span>

export const PageHeader = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => (
  <div className="page-header"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>
)

export const EmptyState = ({ title, text }: { title: string; text: string }) => <div className="empty"><strong>{title}</strong><p>{text}</p></div>

export function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-header"><div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><IconButton label="Close dialog" onClick={onClose}><X size={18} /></IconButton></div>
      {children}
    </section>
  </div>
}

export function TableShell({ children }: { children: ReactNode }) {
  return <div className="table-shell"><div className="table-scroll">{children}</div></div>
}
