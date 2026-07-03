import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/services/auth'
import { getApiErrorMessage } from '@/lib/http'
import { AuthLayout } from './auth-layout'
import { FieldError, FieldHint, FormBanner, PasswordInput, PasswordStrengthMeter, SegmentedControl } from './auth-ui'
import {
  fullNameError,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUsername,
  normalizePhone,
  toTitleCase,
} from './validators'

type SignupMode = 'email' | 'phone'
type FieldKey = 'fullName' | 'username' | 'ident' | 'password' | 'confirm'

const IDENT_META: Record<SignupMode, { label: string; placeholder: string; inputType: string; autoComplete: string; hint: string | null }> = {
  email: {
    label: 'Email',
    placeholder: 'yourname@example.com',
    inputType: 'email',
    autoComplete: 'email',
    hint: null,
  },
  phone: {
    label: 'Số điện thoại',
    placeholder: '0xxxxxxxxx hoặc +84xxxxxxxxx',
    inputType: 'tel',
    autoComplete: 'tel-national',
    hint: 'Bắt đầu bằng 0 hoặc +84, tổng 10–11 chữ số.',
  },
}

export default function SignupPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState<SignupMode>('email')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [ident, setIdent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    fullName: false,
    username: false,
    ident: false,
    password: false,
    confirm: false,
  })
  const [serverErrors, setServerErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [banner, setBanner] = useState('')
  const [agreeError, setAgreeError] = useState('')

  const meta = IDENT_META[mode]

  // Lỗi phía client cho từng trường
  const errors: Record<FieldKey, string | null> = {
    fullName: fullNameError(fullName),
    username: !username.trim()
      ? 'Không được để trống.'
      : isValidUsername(username.trim())
        ? null
        : 'Tên đăng nhập không hợp lệ (4–20 ký tự: chữ, số, _ hoặc .).',
    ident: !ident.trim()
      ? `${meta.label} không được để trống.`
      : (mode === 'email' ? isValidEmail(ident.trim()) : isValidPhone(ident.trim()))
        ? null
        : `${meta.label} không hợp lệ.`,
    password: isValidPassword(password) ? null : 'Tối thiểu 8 ký tự, gồm chữ và số.',
    confirm: confirm === password ? null : 'Mật khẩu nhập lại chưa khớp.',
  }

  function fieldError(key: FieldKey): string | null {
    if (serverErrors[key]) return serverErrors[key] ?? null
    return touched[key] ? errors[key] : null
  }

  function markTouched(key: FieldKey) {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function clearServerError(key: FieldKey) {
    setServerErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const register = useMutation({
    mutationFn: () => {
      const idRaw = ident.trim()
      return authApi.register({
        fullName: toTitleCase(fullName),
        username: username.trim(),
        email: mode === 'email' ? idRaw : undefined,
        phone: mode === 'phone' ? normalizePhone(idRaw) : undefined,
        password,
        confirmPassword: confirm,
      })
    },
    onSuccess: () => {
      toast.success('Tạo tài khoản thành công. Vui lòng đăng nhập.')
      navigate('/login')
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Không thể kết nối máy chủ. Vui lòng thử lại.')
      const m = msg.toLowerCase()
      const mapped: Partial<Record<FieldKey, string>> = {}

      if (m.includes('fullname') || m.includes('họ tên') || m.includes('họ và tên')) mapped.fullName = msg
      if (m.includes('username') || m.includes('tên đăng nhập')) mapped.username = msg
      if (m.includes('password') || m.includes('mật khẩu')) mapped.password = msg
      if (m.includes('confirm') || m.includes('nhập lại')) mapped.confirm = msg
      if (m.includes('email')) {
        mapped.ident = msg
        if (mode !== 'email') setMode('email')
      } else if (
        (m.includes('phone') || m.includes('số điện thoại') || m.includes('sdt') || m.includes('so dien thoai')) &&
        !(m.includes('password') || m.includes('mật khẩu'))
      ) {
        mapped.ident = msg
        if (mode !== 'phone') setMode('phone')
      }

      if (Object.keys(mapped).length > 0) {
        setServerErrors(mapped)
      } else {
        setBanner(msg)
      }
    },
  })

  function switchMode(nextMode: SignupMode) {
    setMode(nextMode)
    setTouched((prev) => ({ ...prev, ident: false }))
    clearServerError('ident')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBanner('')
    setServerErrors({})
    setTouched({ fullName: true, username: true, ident: true, password: true, confirm: true })

    if (!agree) {
      setAgreeError('Bạn cần đồng ý với điều khoản sử dụng để tiếp tục.')
      return
    }
    setAgreeError('')

    const hasError = Object.values(errors).some((err) => err !== null)
    if (hasError || register.isPending) return
    register.mutate()
  }

  return (
    <AuthLayout heroImage="/images/banners/tanjiro_akaza_infinity_castle.jpg">
      <h1 className="font-display text-2xl font-bold uppercase">Đăng ký</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">Tạo tài khoản D-CINE để đặt vé nhanh và nhận ưu đãi.</p>

      <FormBanner variant="error">{banner}</FormBanner>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="fullname" className="mb-1.5">
            Họ và tên
          </Label>
          <Input
            id="fullname"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              clearServerError('fullName')
            }}
            onBlur={() => {
              setFullName((v) => (v.trim() ? toTitleCase(v) : v))
              markTouched('fullName')
            }}
            aria-invalid={!!fieldError('fullName')}
            className="h-11"
          />
          <FieldError>{fieldError('fullName')}</FieldError>
        </div>

        <div>
          <Label htmlFor="username" className="mb-1.5">
            Tên đăng nhập
          </Label>
          <Input
            id="username"
            autoComplete="username"
            placeholder="ten_dang_nhap"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              clearServerError('username')
            }}
            onBlur={() => markTouched('username')}
            aria-invalid={!!fieldError('username')}
            className="h-11"
          />
          {fieldError('username') ? (
            <FieldError>{fieldError('username')}</FieldError>
          ) : (
            <FieldHint>4–20 ký tự: chữ, số, _ hoặc .</FieldHint>
          )}
        </div>

        <div>
          <div className="mb-2">
            <SegmentedControl
              aria-label="Đăng ký bằng"
              options={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'SĐT' },
              ]}
              value={mode}
              onChange={switchMode}
            />
          </div>
          <Label htmlFor="ident" className="mb-1.5">
            {meta.label}
          </Label>
          <Input
            id="ident"
            type={meta.inputType}
            autoComplete={meta.autoComplete}
            placeholder={meta.placeholder}
            value={ident}
            onChange={(e) => {
              setIdent(e.target.value)
              clearServerError('ident')
            }}
            onBlur={() => markTouched('ident')}
            aria-invalid={!!fieldError('ident')}
            className="h-11"
          />
          {fieldError('ident') ? <FieldError>{fieldError('ident')}</FieldError> : <FieldHint>{meta.hint}</FieldHint>}
        </div>

        <div>
          <Label htmlFor="password" className="mb-1.5">
            Mật khẩu
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearServerError('password')
            }}
            onBlur={() => markTouched('password')}
            aria-invalid={!!fieldError('password')}
          />
          <PasswordStrengthMeter password={password} />
          <FieldError>{fieldError('password')}</FieldError>
        </div>

        <div>
          <Label htmlFor="confirm" className="mb-1.5">
            Nhập lại mật khẩu
          </Label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              clearServerError('confirm')
            }}
            onBlur={() => markTouched('confirm')}
            aria-invalid={!!fieldError('confirm')}
          />
          <FieldError>{fieldError('confirm')}</FieldError>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked)
                if (e.target.checked) setAgreeError('')
              }}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>
              Tôi đồng ý với <span className="font-medium text-foreground">Điều khoản sử dụng</span> và{' '}
              <span className="font-medium text-foreground">Chính sách bảo mật</span> của D-CINE.
            </span>
          </label>
          <FieldError>{agreeError}</FieldError>
        </div>

        <Button type="submit" disabled={register.isPending} className="h-11 w-full font-semibold">
          {register.isPending && <Loader2 className="size-4 animate-spin" />}
          Tạo tài khoản
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-foreground transition hover:text-primary">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
