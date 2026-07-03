import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Pencil, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/auth-store'
import { formatDate, formatTime } from '@/lib/format'
import { getApiErrorMessage } from '@/lib/http'
import { commentsApi } from '@/services/movies'
import type { Comment } from '@/types'

const MAX_LENGTH = 500

function formatDateTime(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return `${formatTime(d)} ${formatDate(d)}`
}

function initials(name?: string): string {
  if (!name) return 'U'
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function CommentItem({
  comment,
  onDelete,
  isDeleting,
  movieId,
}: {
  comment: Comment
  onDelete: (id: number) => void
  isDeleting: boolean
  movieId: string | number
}) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(comment.content)

  const updateMutation = useMutation({
    mutationFn: (content: string) => commentsApi.update(comment.id, content),
    onSuccess: () => {
      toast.success('Đã cập nhật bình luận.')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['comments', String(movieId)] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật bình luận.'))
    },
  })

  return (
    <div className="flex gap-3">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={comment.avatarUrl || undefined} alt={comment.fullName || 'Người dùng'} />
        <AvatarFallback>{initials(comment.fullName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{comment.fullName || 'Người dùng'}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</p>
          </div>
          {comment.myComment && !isEditing && (
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label="Sửa bình luận"
                onClick={() => {
                  setDraft(comment.content)
                  setIsEditing(true)
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-primary"
                aria-label="Xóa bình luận"
                disabled={isDeleting}
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="mt-3 space-y-2">
            <Textarea
              value={draft}
              maxLength={MAX_LENGTH}
              rows={3}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {draft.length} / {MAX_LENGTH}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={updateMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  disabled={!draft.trim() || updateMutation.isPending}
                  onClick={() => updateMutation.mutate(draft.trim())}
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground/90">{comment.content}</p>
        )}
      </div>
    </div>
  )
}

export function MovieComments({ movieId }: { movieId: string | number }) {
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const commentsQuery = useQuery({
    queryKey: ['comments', String(movieId)],
    queryFn: () => commentsApi.list(movieId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments', String(movieId)] })

  const createMutation = useMutation({
    mutationFn: (text: string) => commentsApi.create(movieId, text),
    onSuccess: () => {
      toast.success('Đã gửi bình luận.')
      setContent('')
      invalidate()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Gửi bình luận thất bại. Vui lòng thử lại.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commentsApi.remove(id),
    onSuccess: () => {
      toast.success('Đã xóa bình luận.')
      setDeleteTarget(null)
      invalidate()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể xóa bình luận này.'))
    },
  })

  const comments = commentsQuery.data ?? []

  return (
    <section className="mt-12">
      <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold uppercase">
        <MessageSquare className="size-5 text-primary" />
        Bình luận{' '}
        <span className="text-muted-foreground">({commentsQuery.isSuccess ? comments.length : '…'})</span>
      </h2>

      {isAuthenticated ? (
        <div className="mb-8 flex gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || 'Bạn'} />
            <AvatarFallback>{initials(user?.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={content}
              rows={4}
              maxLength={MAX_LENGTH}
              placeholder="Viết bình luận..."
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length} / {MAX_LENGTH}
              </span>
              <Button
                disabled={!content.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate(content.trim())}
              >
                {createMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="mb-8 border-border/60">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Vui lòng{' '}
            <Link
              to={`/login?next=${encodeURIComponent(`/movies/${movieId}`)}`}
              className="font-semibold text-primary hover:underline"
            >
              đăng nhập
            </Link>{' '}
            để tham gia bình luận.
          </CardContent>
        </Card>
      )}

      {commentsQuery.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <Skeleton className="h-24 flex-1 rounded-xl" />
            </div>
          ))}
        </div>
      ) : commentsQuery.isError ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {getApiErrorMessage(commentsQuery.error, 'Không tải được bình luận.')}
        </p>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm italic text-muted-foreground">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              movieId={movieId}
              isDeleting={deleteMutation.isPending && deleteTarget === comment.id}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      <Dialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa bình luận</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget != null && deleteMutation.mutate(deleteTarget)}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
