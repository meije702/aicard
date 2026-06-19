// ToastContainer — renders the sous chef's notification toasts.

import type { Toast } from '../hooks/use-toast-manager.ts'
import styles from '../SousChef.module.css'

function toastClass(toast: Toast): string {
  const classes = [styles.toast]
  if (toast.type === 'info') classes.push(styles.toastInfo)
  if (toast.type === 'warning') classes.push(styles.toastWarning)
  if (toast.type === 'error') classes.push(styles.toastError)
  if (toast.exiting) classes.push(styles.toastExiting)
  return classes.join(' ')
}

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
}) {
  return (
    <div className={styles.toastContainer} aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={toastClass(toast)}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span>{toast.message}</span>
          {toast.persistent && (
            <button type="button"
              className={styles.toastDismiss}
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
