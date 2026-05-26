(() => {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const queryParams = new URLSearchParams(window.location.search);
        const responseCode = queryParams.get('vnp_ResponseCode');
        
        const titleEl = document.getElementById('statusTitle');
        const descEl = document.getElementById('statusDesc');

        if (responseCode === '00') {
            titleEl.textContent = 'Thanh Toán Thành Công! 🎉';
            titleEl.className = 'success';
            descEl.textContent = 'Cảm ơn bạn đã đặt vé. Đơn hàng của bạn đã được hệ thống ghi nhận thành công. Chúc bạn xem phim vui vẻ!';
            
            // Xóa sạch giỏ hàng dùng chung (Storage Helper) sau khi thanh toán thành công
            if (window.DCineStorage) {
                window.DCineStorage.removeJson('booking_cart');
                window.DCineStorage.removeJson('concessions_cart');
            }
        } else {
            titleEl.textContent = 'Thanh Toán Thất Bại ❌';
            titleEl.className = 'error';
            descEl.textContent = `Giao dịch đã bị hủy hoặc không thành công. Mã lỗi: ${responseCode || 'Unknown'}. Vui lòng thử lại hoặc chọn phương thức khác.`;
        }
    });
})();