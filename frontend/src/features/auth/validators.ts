/** Client-side validators for the auth pages (ported from frontend_2 auth.*.js). */

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

export const isValidPhone = (v: string) => /^(0\d{9,10}|\+84\d{9,10})$/.test(v.replace(/\s|-/g, ''))

export const isValidUsername = (v: string) => /^[a-zA-Z0-9_.]{4,20}$/.test(v)

/** Chuẩn hoá SĐT về dạng 0xxxxxxxxx trước khi gửi backend. */
export const normalizePhone = (v: string) => v.replace(/\s|-/g, '').replace(/^\+84/, '0')

/** Mật khẩu hợp lệ: tối thiểu 8 ký tự, gồm chữ và số. */
export const isValidPassword = (v: string) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)

/** Title-Case họ tên: cắt khoảng trắng thừa, viết hoa chữ cái đầu mỗi từ. */
export function toTitleCase(v: string): string {
  return v
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/** Trả về thông báo lỗi tiếng Việt cho họ tên, hoặc null nếu hợp lệ. */
export function fullNameError(raw: string): string | null {
  const v = raw.trim()
  if (/^[\p{L}\s]{2,50}$/u.test(v)) return null
  if (!v) return 'Vui lòng nhập họ tên.'
  if (v.length < 2 || v.length > 50) return 'Họ và tên phải có độ dài từ 2-50 ký tự.'
  if (/[0-9]/.test(v)) return 'Họ và tên không được chứa chữ số.'
  return 'Họ và tên không được chứa ký tự đặc biệt.'
}
