import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { STORAGE_KEYS, removeJson } from '@/lib/storage'

export default function PaymentResultPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const responseCode = searchParams.get('vnp_ResponseCode')

  if (responseCode === '00') {
    // Thanh toán thành công → xóa giỏ hàng rồi chuyển sang trang xác nhận,
    // giữ nguyên các tham số VNPAY trên URL.
    removeJson(STORAGE_KEYS.bookingCart)
    removeJson(STORAGE_KEYS.concessionsCart)
    return <Navigate to={`/confirmation${location.search}`} replace />
  }

  return (
    <div className="container mx-auto flex max-w-7xl items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <XCircle className="size-16 text-primary" aria-hidden />
          <h1 className="font-display text-2xl font-bold uppercase">Thanh toán thất bại</h1>
          <p className="text-sm text-muted-foreground">
            Giao dịch đã bị hủy hoặc không thành công. Mã lỗi:{' '}
            <strong className="text-foreground">{responseCode || 'Không xác định'}</strong>. Vui lòng thử lại hoặc
            chọn phương thức khác.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/payment">Thử lại</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Về trang chủ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
