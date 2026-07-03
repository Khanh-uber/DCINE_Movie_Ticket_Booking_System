import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/services/auth'
import { getApiErrorMessage } from '@/lib/http'
import { AuthLayout } from './auth-layout'
import { FieldError, FieldHint, FormBanner, PasswordInput, PasswordStrengthMeter } from './auth-ui'
import { isValidEmail, isValidPassword, isValidPhone, normalizePhone } from './validators'

const OTP_LENGTH = 6

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  // ----- Bước 1: định danh + OTP -----
  const [step, setStep] = useState<1 | 2>(1)
  const [ident, setIdent] = useState('')
  const [identTouched, setIdentTouched] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [otpError, setOtpError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [infoMsg, setInfoMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  // Tự nhận diện email / SĐT theo nội dung nhập
  const mode: 'email' | 'phone' = /^\+?\d/.test(ident.trim()) ? 'phone' : 'email'
  const identErr = (() => {
    const v = ident.trim()
    if (!v) return 'Không được để trống.'
    const ok = mode === 'email' ? isValidEmail(v) : isValidPhone(v)
    return ok ? null : `${mode === 'email' ? 'Email' : 'Số điện thoại'} không hợp lệ.`
  })()

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const sendOtp = useMutation({
    mutationFn: () => {
      const identifier = mode === 'phone' ? normalizePhone(ident.trim()) : ident.trim()
      // Backend nhận channelType viết hoa (EMAIL/PHONE) như app cũ; ép kiểu cho khớp chữ ký service.
      const channelType = mode.toUpperCase() as 'email' | 'phone'
      return authApi.sendOtp({ channelType, identifier })
    },
    onSuccess: (id) => {
      if (id) setRequestId(id)
      setInfoMsg('Đã gửi OTP. Vui lòng kiểm tra tin nhắn/email.')
      setErrorMsg('')
      setOtp(Array(OTP_LENGTH).fill(''))
      setOtpError('')
      setCooldown(60)
      otpRefs.current[0]?.focus()
    },
    onError: (err) => {
      setInfoMsg('')
      setErrorMsg(getApiErrorMessage(err, 'Không thể gửi OTP lúc này.'))
    },
  })

  const verifyOtp = useMutation({
    mutationFn: (code: string) => authApi.verifyOtp({ requestId, code }),
    onSuccess: () => {
      setInfoMsg('')
      setErrorMsg('')
      setStep(2)
    },
    onError: (err) => setOtpError(getApiErrorMessage(err, 'OTP không đúng hoặc đã hết hạn.')),
  })

  function handleSendOtp() {
    setIdentTouched(true)
    setErrorMsg('')
    if (identErr || cooldown > 0 || sendOtp.isPending) return
    sendOtp.mutate()
  }

  // ----- Ô nhập OTP -----
  function setOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const nextOtp = [...prev]
      nextOtp[index] = digit
      return nextOtp
    })
    setOtpError('')
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus()
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleVerify()
    }
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!digits) return
    const nextOtp = Array(OTP_LENGTH).fill('') as string[]
    digits.split('').forEach((d, i) => {
      nextOtp[i] = d
    })
    setOtp(nextOtp)
    setOtpError('')
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus()
  }

  function handleVerify() {
    if (!requestId) {
      setOtpError('Bạn cần gửi mã OTP trước.')
      return
    }
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      setOtpError('Mã OTP chưa đủ 6 số.')
      return
    }
    if (!verifyOtp.isPending) verifyOtp.mutate(code)
  }

  // ----- Bước 2: mật khẩu mới -----
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [newTouched, setNewTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [resetError, setResetError] = useState('')

  const newPasswordErr = !newPassword
    ? 'Không được để trống.'
    : isValidPassword(newPassword)
      ? null
      : 'Tối thiểu 8 ký tự, gồm chữ và số.'
  const confirmErr = confirm === newPassword ? null : 'Chưa khớp mật khẩu.'

  const resetPassword = useMutation({
    mutationFn: () => authApi.resetPassword({ requestId, newPassword, confirmPassword: confirm }),
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.')
      navigate('/login')
    },
    onError: (err) => setResetError(getApiErrorMessage(err, 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')),
  })

  function onResetSubmit(e: FormEvent) {
    e.preventDefault()
    setResetError('')
    setNewTouched(true)
    setConfirmTouched(true)
    if (newPasswordErr || confirmErr || resetPassword.isPending) return
    resetPassword.mutate()
  }

  return (
    <AuthLayout heroImage="/images/banners/fire_force.jpeg">
      {step === 1 ? (
        <>
          <h1 className="font-display text-2xl font-bold uppercase">Quên mật khẩu</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Nhập email hoặc số điện thoại đã đăng ký để nhận mã OTP.
          </p>

          <FormBanner variant="error">{errorMsg}</FormBanner>
          <FormBanner variant="success">{infoMsg}</FormBanner>

          <div className="space-y-4">
            <div>
              <Label htmlFor="ident" className="mb-1.5">
                Email hoặc số điện thoại
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                  {mode === 'phone' ? <Phone className="size-4" /> : <Mail className="size-4" />}
                </span>
                <Input
                  id="ident"
                  type={mode === 'phone' ? 'tel' : 'email'}
                  autoComplete={mode === 'phone' ? 'tel-national' : 'email'}
                  placeholder="yourname@example.com hoặc 0xxxxxxxxx"
                  value={ident}
                  onChange={(e) => setIdent(e.target.value)}
                  onBlur={() => setIdentTouched(true)}
                  aria-invalid={identTouched && !!identErr}
                  className="h-11 pl-9"
                />
              </div>
              <FieldError>{identTouched ? identErr : null}</FieldError>
            </div>

            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={sendOtp.isPending || cooldown > 0}
              className="h-11 w-full font-semibold"
            >
              {sendOtp.isPending && <Loader2 className="size-4 animate-spin" />}
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : requestId ? 'Gửi lại mã OTP' : 'Gửi mã OTP'}
            </Button>
            <FieldHint>
              {cooldown > 0
                ? `Có thể gửi lại sau ${cooldown}s.`
                : requestId
                  ? 'Bạn có thể gửi lại OTP.'
                  : 'Chưa nhận được mã? Bấm Gửi mã OTP.'}
            </FieldHint>

            <div>
              <Label className="mb-1.5">Mã OTP (6 số)</Label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => setOtpDigit(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    aria-label={`Số OTP thứ ${index + 1}`}
                    className="size-11 p-0 text-center text-lg font-semibold"
                  />
                ))}
              </div>
              <FieldError>{otpError}</FieldError>
            </div>

            <Button
              type="button"
              onClick={handleVerify}
              disabled={verifyOtp.isPending}
              variant="outline"
              className="h-11 w-full font-semibold"
            >
              {verifyOtp.isPending && <Loader2 className="size-4 animate-spin" />}
              Xác nhận
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold uppercase">Đặt mật khẩu mới</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">OTP hợp lệ. Hãy đặt mật khẩu mới cho tài khoản.</p>

          <FormBanner variant="error">{resetError}</FormBanner>

          <form onSubmit={onResetSubmit} noValidate className="space-y-4">
            <div>
              <Label htmlFor="newpass" className="mb-1.5">
                Mật khẩu mới
              </Label>
              <PasswordInput
                id="newpass"
                autoComplete="new-password"
                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => setNewTouched(true)}
                aria-invalid={newTouched && !!newPasswordErr}
              />
              <PasswordStrengthMeter password={newPassword} />
              <FieldError>{newTouched ? newPasswordErr : null}</FieldError>
            </div>

            <div>
              <Label htmlFor="confirm" className="mb-1.5">
                Nhập lại mật khẩu mới
              </Label>
              <PasswordInput
                id="confirm"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setConfirmTouched(true)}
                aria-invalid={confirmTouched && !!confirmErr}
              />
              <FieldError>{confirmTouched ? confirmErr : null}</FieldError>
            </div>

            <Button type="submit" disabled={resetPassword.isPending} className="h-11 w-full font-semibold">
              {resetPassword.isPending && <Loader2 className="size-4 animate-spin" />}
              Đặt lại mật khẩu
            </Button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Nhớ ra mật khẩu?{' '}
        <Link to="/login" className="font-semibold text-foreground transition hover:text-primary">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  )
}
