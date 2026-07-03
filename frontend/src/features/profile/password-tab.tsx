import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/http'
import { profileApi } from '@/services/profile'

function PasswordInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}

export function PasswordTab() {
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  const changeMutation = useMutation({
    mutationFn: () => profileApi.changePassword({ oldPassword: oldPass, newPassword: newPass }),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công.')
      setOldPass('')
      setNewPass('')
      setConfirmPass('')
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Mật khẩu hiện tại không đúng hoặc yêu cầu không hợp lệ.'),
      )
    },
  })

  const handleSubmit = () => {
    if (!oldPass || !newPass || !confirmPass) {
      toast.error('Vui lòng điền đủ thông tin!')
      return
    }
    if (newPass.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }
    if (newPass !== confirmPass) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }
    changeMutation.mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg font-bold uppercase">
          <KeyRound className="size-5 text-primary" /> Đổi mật khẩu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md space-y-4">
          <PasswordInput
            id="old-pass"
            label="Mật khẩu hiện tại"
            value={oldPass}
            onChange={setOldPass}
          />
          <PasswordInput id="new-pass" label="Mật khẩu mới" value={newPass} onChange={setNewPass} />
          <PasswordInput
            id="confirm-pass"
            label="Nhập lại mật khẩu mới"
            value={confirmPass}
            onChange={setConfirmPass}
          />
          <Button onClick={handleSubmit} disabled={changeMutation.isPending}>
            {changeMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
