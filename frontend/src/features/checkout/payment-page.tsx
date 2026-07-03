import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, Loader2, Ticket, TicketPercent, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatVnd } from '@/lib/format'
import { getApiErrorMessage } from '@/lib/http'
import { checkoutApi } from '@/services/booking'
import { moviesApi } from '@/services/movies'
import {
  buildLocalOrder,
  computeLocalDiscount,
  computeTotals,
  mergeSummary,
  toOrderSummary,
  type CheckoutOrder,
} from './order-utils'

interface VoucherMessage {
  ok: boolean
  text: string
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="text-right text-sm font-semibold">{value || '--'}</strong>
    </div>
  )
}

function PaymentSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  )
}

export default function PaymentPage() {
  const navigate = useNavigate()

  const localOrder = useMemo(() => buildLocalOrder(), [])
  const [order, setOrder] = useState<CheckoutOrder | null>(null)

  const summaryQuery = useQuery({
    queryKey: ['checkout', 'summary'],
    queryFn: checkoutApi.summary,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const promotionsQuery = useQuery({
    queryKey: ['promotions'],
    queryFn: moviesApi.promotions,
    retry: false,
  })

  useEffect(() => {
    if (summaryQuery.isPending) return
    setOrder(mergeSummary(localOrder, summaryQuery.data ?? null))
  }, [summaryQuery.isPending, summaryQuery.data, localOrder])

  const [voucherInput, setVoucherInput] = useState('')
  const [voucherSelect, setVoucherSelect] = useState('')
  const [voucherMessage, setVoucherMessage] = useState<VoucherMessage | null>(null)
  const [applying, setApplying] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const promotions = useMemo(
    () => (promotionsQuery.data ?? []).filter((promo) => (promo.code ?? '').trim().length > 0),
    [promotionsQuery.data],
  )

  function applyLocalVoucher(current: CheckoutOrder, code: string) {
    if (!code) {
      setOrder({ ...current, discountAmount: 0, discountCode: '' })
      setVoucherMessage({ ok: true, text: 'Đã xóa mã ưu đãi.' })
      return
    }

    const promo = promotions.find((item) => (item.code ?? '').trim().toUpperCase() === code)
    if (!promo) {
      setOrder({ ...current, discountAmount: 0, discountCode: '' })
      setVoucherMessage({ ok: false, text: 'Mã không hợp lệ hoặc đã hết hạn.' })
      return
    }

    const { subTotal } = computeTotals(current)
    const discountAmount = computeLocalDiscount(promo, subTotal)
    setOrder({ ...current, discountAmount, discountCode: promo.code ?? code })
    setVoucherMessage({ ok: true, text: `Đã áp dụng mã ${promo.code ?? code}.` })
  }

  async function handleApplyVoucher(rawCode: string) {
    if (!order || applying) return
    const code = rawCode.trim().toUpperCase()
    setVoucherMessage(null)
    setApplying(true)
    try {
      const updated = await checkoutApi.applyVoucher(code, toOrderSummary(order))
      setOrder(mergeSummary({ ...order, discountCode: code }, updated))
      setVoucherMessage({ ok: true, text: code ? `Đã áp dụng mã ${code}.` : 'Đã xóa mã ưu đãi.' })
    } catch {
      // Backend voucher endpoint unavailable → compute the discount locally.
      applyLocalVoucher(order, code)
    } finally {
      setApplying(false)
    }
  }

  async function handleConfirmPayment() {
    if (!order?.bookingId) {
      toast.error('Không tìm thấy bookingId hợp lệ để tạo link thanh toán.')
      return
    }
    const totals = computeTotals(order)
    if (totals.grandTotal <= 0) {
      toast.error('Tổng thanh toán không hợp lệ. Vui lòng kiểm tra lại phiên đặt vé.')
      return
    }

    setRedirecting(true)
    try {
      const url = await checkoutApi.createPaymentUrl(order.bookingId)
      if (!url) throw new Error('Backend không trả về đường dẫn VNPAY hợp lệ.')
      window.location.href = url
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể chuyển đến cổng thanh toán VNPAY.'))
      setRedirecting(false)
    }
  }

  const totals = order ? computeTotals(order) : null
  const showtimeText = order ? [order.showDate, order.showTime].filter(Boolean).join(' • ') : ''

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-primary">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-foreground">Thanh toán</span>
      </nav>

      <h1 className="mb-6 font-display text-2xl font-bold uppercase md:text-3xl">
        <span className="mr-2 inline-block h-6 w-1.5 translate-y-0.5 rounded bg-primary" aria-hidden />
        Thanh toán qua cổng VNPAY
      </h1>

      {!order ? (
        <PaymentSkeleton />
      ) : !order.bookingId ? (
        <Card className="mx-auto max-w-xl border-warning/40">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <TriangleAlert className="size-12 text-warning" aria-hidden />
            <div>
              <h2 className="font-display text-xl font-bold">Không tìm thấy đơn đặt vé</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Phiên đặt vé đã hết hạn hoặc chưa được khởi tạo. Vui lòng chọn phim và đặt ghế lại từ đầu.
              </p>
            </div>
            <Button asChild>
              <Link to="/movies">Quay lại chọn phim</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display uppercase">
                  <Ticket className="size-5 text-primary" aria-hidden />
                  Thông tin đặt vé
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <OverviewRow label="Phim" value={order.movieTitle} />
                <OverviewRow label="Rạp" value={order.theaterName || 'D-cine Quận 1'} />
                <OverviewRow label="Suất chiếu" value={showtimeText} />
                <OverviewRow label="Ghế" value={order.seats.length ? order.seats.join(', ') : 'Chưa có ghế'} />
                <OverviewRow label="Mã đặt vé" value={`#${order.bookingId}`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display uppercase">
                  <CreditCard className="size-5 text-primary" aria-hidden />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 rounded-xl border border-primary/60 bg-primary/5 p-4">
                  <span
                    className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-primary"
                    aria-hidden
                  >
                    <span className="size-2 rounded-full bg-primary" />
                  </span>
                  <div>
                    <p className="font-semibold">Cổng thanh toán VNPAY (Sandbox)</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bạn sẽ được chuyển đến cổng VNPAY để hoàn tất giao dịch một cách an toàn.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display uppercase">
                  <TicketPercent className="size-5 text-primary" aria-hidden />
                  Mã ưu đãi / Voucher
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={voucherSelect}
                  onValueChange={(value) => {
                    setVoucherSelect(value)
                    setVoucherInput(value)
                    void handleApplyVoucher(value)
                  }}
                >
                  <SelectTrigger className="w-full" aria-label="Chọn voucher từ danh sách">
                    <SelectValue
                      placeholder={promotionsQuery.isLoading ? 'Đang tải ưu đãi...' : 'Chọn từ danh sách ưu đãi'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {promotions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Chưa có ưu đãi khả dụng</div>
                    ) : (
                      promotions.map((promo) => (
                        <SelectItem key={String(promo.id)} value={promo.code as string}>
                          {promo.code} — {promo.title || promo.description || 'Ưu đãi D-cine'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    value={voucherInput}
                    onChange={(event) => setVoucherInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void handleApplyVoucher(voucherInput)
                    }}
                    placeholder="Nhập mã ưu đãi..."
                    aria-label="Mã ưu đãi"
                  />
                  <Button
                    variant="secondary"
                    disabled={applying}
                    onClick={() => void handleApplyVoucher(voucherInput)}
                  >
                    {applying ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                    Áp dụng
                  </Button>
                </div>

                {voucherMessage ? (
                  <p className={`text-sm ${voucherMessage.ok ? 'text-success' : 'text-destructive'}`} role="status">
                    {voucherMessage.text}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Right column — sticky order summary */}
          <div className="h-fit lg:sticky lg:top-24">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="font-display uppercase">Chi tiết thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tiền vé</span>
                  <strong>{formatVnd(totals?.ticketAmount)}</strong>
                </div>

                {order.combos.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Bắp nước</p>
                    {order.combos.map((combo, index) => (
                      <div key={`${combo.title}-${index}`} className="flex items-center justify-between pl-3 text-sm">
                        <span className="text-muted-foreground">
                          {combo.qty > 1 ? `${combo.title} × ${combo.qty}` : combo.title}
                        </span>
                        <strong>{formatVnd(combo.amount)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bắp nước</span>
                    <strong>{formatVnd(0)}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Giảm giá{totals && totals.discountAmount > 0 && order.discountCode ? ` (${order.discountCode})` : ''}
                  </span>
                  <strong className="text-success">
                    {totals && totals.discountAmount > 0 ? `-${formatVnd(totals.discountAmount)}` : '-0đ'}
                  </strong>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-display font-bold uppercase">Tổng cộng</span>
                  <strong className="text-xl font-bold text-primary">{formatVnd(totals?.grandTotal)}</strong>
                </div>

                <Button
                  className="w-full font-display font-bold uppercase"
                  size="lg"
                  disabled={redirecting}
                  onClick={() => void handleConfirmPayment()}
                >
                  {redirecting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Đang tạo liên kết VNPAY...
                    </>
                  ) : (
                    'Xác nhận thanh toán'
                  )}
                </Button>

                <Button variant="outline" className="w-full" onClick={() => navigate('/concessions')}>
                  <ArrowLeft className="size-4" aria-hidden />
                  Quay lại bắp nước
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
