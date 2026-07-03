import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/format'
import { getApiErrorMessage } from '@/lib/http'
import { profileApi } from '@/services/profile'
import { authStore } from '@/features/auth/auth-store'
import type { UserProfile } from '@/types'

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
}

interface EditableFields {
  fullName: string
  phone: string
  dob: string
  gender: string
  address: string
}

function toEditable(profile: UserProfile): EditableFields {
  return {
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    dob: (profile.dob ?? '').slice(0, 10),
    gender: profile.gender || 'OTHER',
    address: profile.address ?? '',
  }
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="flex min-h-9 items-center rounded-md border border-border bg-background/50 px-3 py-1 text-sm">
        {value || <span className="text-muted-foreground">Chưa cập nhật</span>}
      </div>
    </div>
  )
}

export function InfoTab({ profile }: { profile: UserProfile }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditableFields>(() => toEditable(profile))

  const setField = <K extends keyof EditableFields>(key: K, value: EditableFields[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const saveMutation = useMutation({
    mutationFn: (payload: EditableFields) => profileApi.update(payload),
    onSuccess: () => {
      toast.success('Cập nhật hồ sơ thành công.')
      if (form.fullName) authStore.updateUser({ fullName: form.fullName })
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'))
    },
  })

  const startEdit = () => {
    setForm(toEditable(profile))
    setEditing(true)
  }

  const cancelEdit = () => {
    setForm(toEditable(profile))
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg font-bold uppercase">
          Thông tin chi tiết
        </CardTitle>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil /> Chỉnh sửa
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {editing ? (
            <div className="space-y-1.5">
              <Label htmlFor="inp-fullname">Họ và tên</Label>
              <Input
                id="inp-fullname"
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                placeholder="Họ và tên"
              />
            </div>
          ) : (
            <ReadOnlyField label="Họ và tên" value={profile.fullName} />
          )}

          <ReadOnlyField label="Username" value={profile.username} />
          <ReadOnlyField label="Email" value={profile.email} />

          {editing ? (
            <div className="space-y-1.5">
              <Label htmlFor="inp-phone">Số điện thoại</Label>
              <Input
                id="inp-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Số điện thoại"
              />
            </div>
          ) : (
            <ReadOnlyField label="Số điện thoại" value={profile.phone} />
          )}

          {editing ? (
            <div className="space-y-1.5">
              <Label htmlFor="inp-dob">Ngày sinh</Label>
              <Input
                id="inp-dob"
                type="date"
                value={form.dob}
                onChange={(e) => setField('dob', e.target.value)}
              />
            </div>
          ) : (
            <ReadOnlyField label="Ngày sinh" value={profile.dob ? formatDate(profile.dob) : ''} />
          )}

          {editing ? (
            <div className="space-y-1.5">
              <Label>Giới tính</Label>
              <Select value={form.gender} onValueChange={(v) => setField('gender', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <ReadOnlyField
              label="Giới tính"
              value={profile.gender ? (GENDER_LABELS[profile.gender.toUpperCase()] ?? profile.gender) : ''}
            />
          )}

          {editing ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="inp-address">Địa chỉ</Label>
              <Input
                id="inp-address"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Địa chỉ"
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <ReadOnlyField label="Địa chỉ" value={profile.address} />
            </div>
          )}

          <div className="sm:col-span-2">
            <ReadOnlyField
              label="Ngày tham gia"
              value={profile.joinedAt ? formatDate(profile.joinedAt) : ''}
            />
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex gap-3">
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button variant="ghost" onClick={cancelEdit} disabled={saveMutation.isPending}>
              Hủy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
