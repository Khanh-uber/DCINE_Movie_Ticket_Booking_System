import { useState, type ComponentProps, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/* ---------------------------------- Segmented control ---------------------------------- */

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  'aria-label'?: string
}

export function SegmentedControl<T extends string>({ options, value, onChange, ...rest }: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={rest['aria-label']}
      className="grid gap-1 rounded-lg border border-border bg-secondary/40 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-2 py-1.5 text-sm font-medium transition',
            value === option.value
              ? 'bg-primary text-primary-foreground shadow-red'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------- Password input ---------------------------------- */

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('h-11 pr-10', className)} {...props} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

/* ---------------------------------- Password strength ---------------------------------- */

/** Điểm 0–5: độ dài ≥ 8, chữ thường, chữ hoa, chữ số, ký tự đặc biệt. */
export function scorePassword(v: string): number {
  let score = 0
  if (v.length >= 8) score++
  if (/[a-z]/.test(v)) score++
  if (/[A-Z]/.test(v)) score++
  if (/\d/.test(v)) score++
  if (/[^\w\s]/.test(v)) score++
  return score
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const score = scorePassword(password)
  const level = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
  const label = level === 'weak' ? 'Yếu' : level === 'medium' ? 'Trung bình' : 'Mạnh'
  const barClass =
    level === 'weak'
      ? '[&_[data-slot=progress-indicator]]:bg-destructive'
      : level === 'medium'
        ? '[&_[data-slot=progress-indicator]]:bg-warning'
        : '[&_[data-slot=progress-indicator]]:bg-success'
  const textClass = level === 'weak' ? 'text-destructive' : level === 'medium' ? 'text-warning' : 'text-success'

  return (
    <div className="mt-2 flex items-center gap-3">
      <Progress value={(score / 5) * 100} className={cn('h-1.5 flex-1 bg-secondary', barClass)} />
      <span className={cn('w-20 text-right text-xs font-medium', textClass)}>{label}</span>
    </div>
  )
}

/* ---------------------------------- Messages ---------------------------------- */

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p className="mt-1.5 text-xs text-destructive" role="alert">
      {children}
    </p>
  )
}

export function FieldHint({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>
}

export function FormBanner({ variant, children }: { variant: 'error' | 'success'; children?: ReactNode }) {
  if (!children) return null
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'mb-4 rounded-lg border px-3 py-2.5 text-sm',
        variant === 'error'
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-success/40 bg-success/10 text-success',
      )}
    >
      {children}
    </div>
  )
}
