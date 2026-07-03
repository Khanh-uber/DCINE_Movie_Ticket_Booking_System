import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/services/auth'
import { authStore } from '@/features/auth/auth-store'
import { getApiErrorMessage } from '@/lib/http'
import { AuthLayout } from './auth-layout'
import { FieldError, FieldHint, FormBanner, PasswordInput, SegmentedControl } from './auth-ui'
import { isValidEmail, isValidPhone, isValidUsername, normalizePhone } from './validators'

type LoginMode = 'email' | 'phone' | 'username'

const MODE_META: Record<
  LoginMode,
  { label: string; placeholder: string; inputType: string; autoComplete: string; hint: string | null }
> = {
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
  username: {
    label: 'Tên đăng nhập',
    placeholder: 'ten_dang_nhap',
    inputType: 'text',
    autoComplete: 'username',
    hint: '4–20 ký tự: chữ, số, _ hoặc .',
  },
}

function identError(mode: LoginMode, raw: string): string | null {
  const v = raw.trim()
  const name = MODE_META[mode].label
  if (!v) return `${name} không được để trống.`
  const ok = mode === 'email' ? isValidEmail(v) : mode === 'phone' ? isValidPhone(v) : isValidUsername(v)
  return ok ? null : `${name} không hợp lệ.`
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  const [mode, setMode] = useState<LoginMode>('email')
  const [ident, setIdent] = useState('')
  const [password, setPassword] = useState('')
  const [identTouched, setIdentTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [banner, setBanner] = useState('')

  const identErr = identError(mode, ident)
  const passwordErr = password ? null : 'Mật khẩu không được để trống.'
  const meta = MODE_META[mode]

  const login = useMutation({
    mutationFn: () =>
      authApi.login({
        emailOrPhone: mode === 'phone' ? normalizePhone(ident.trim()) : ident.trim(),
        password,
      }),
    onSuccess: ({ accessToken, user }) => {
      authStore.setSession(accessToken, user)
      navigate(next || '/', { replace: true })
    },
    onError: (err) => setBanner(getApiErrorMessage(err, 'Không thể kết nối máy chủ. Vui lòng thử lại.')),
  })

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode)
    setIdentTouched(false)
    setBanner('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBanner('')
    setIdentTouched(true)
    setPasswordTouched(true)
    if (identErr || passwordErr || login.isPending) return
    login.mutate()
  }

  return (
    <AuthLayout heroImage="/images/banners/tanjiro_akaza_infinity_castle.jpg">
      <h1 className="font-display text-2xl font-bold uppercase">Đăng nhập</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">Chọn cách đăng nhập và điền thông tin để tiếp tục.</p>

      <div className="mb-5">
        <SegmentedControl
          aria-label="Hình thức đăng nhập"
          options={[
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'SĐT' },
            { value: 'username', label: 'Username' },
          ]}
          value={mode}
          onChange={switchMode}
        />
      </div>

      <FormBanner variant="error">{banner}</FormBanner>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="ident" className="mb-1.5">
            {meta.label}
          </Label>
          <Input
            id="ident"
            type={meta.inputType}
            autoComplete={meta.autoComplete}
            placeholder={meta.placeholder}
            value={ident}
            onChange={(e) => setIdent(e.target.value)}
            onBlur={() => setIdentTouched(true)}
            aria-invalid={identTouched && !!identErr}
            className="h-11"
          />
          {identTouched && identErr ? <FieldError>{identErr}</FieldError> : <FieldHint>{meta.hint}</FieldHint>}
        </div>

        <div>
          <Label htmlFor="password" className="mb-1.5">
            Mật khẩu
          </Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            aria-invalid={passwordTouched && !!passwordErr}
          />
          <FieldError>{passwordTouched ? passwordErr : null}</FieldError>
        </div>

        <div className="flex items-center justify-end text-sm">
          <Link to="/forgot-password" className="text-muted-foreground transition hover:text-primary">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" disabled={login.isPending} className="h-11 w-full font-semibold">
          {login.isPending && <Loader2 className="size-4 animate-spin" />}
          Đăng nhập
        </Button>

        <Button asChild variant="outline" className="h-11 w-full">
          <Link to="/">Tiếp tục với tư cách khách</Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="font-semibold text-foreground transition hover:text-primary">
            Đăng ký
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
