(() => {
    'use strict';
    console.log('[payment-result] Script initialized');

    document.addEventListener('DOMContentLoaded', () => {
        const queryParams = new URLSearchParams(window.location.search);
        const responseCode = queryParams.get('vnp_ResponseCode');
        console.log('[payment-result] vnp_ResponseCode found:', responseCode);
        
        const titleEl = document.getElementById('statusTitle');
        const descEl = document.getElementById('statusDesc');

        if (!titleEl || !descEl) {
            console.error('[payment-result] Không tìm thấy phần tử statusTitle hoặc statusDesc trong HTML!');
            return;
        }

        if (responseCode === '00') {
            // Xóa sạch giỏ hàng dùng chung (Storage Helper) sau khi thanh toán thành công
            if (window.DCineStorage) {
                window.DCineStorage.removeJson('booking_cart');
                window.DCineStorage.removeJson('concessions_cart');
            }

            // Tự động chuyển hướng sang trang confirmation và giữ lại các tham số trên URL
            window.location.href = `confirmation.html${window.location.search}`;
        } else {
            titleEl.textContent = 'Thanh Toán Thất Bại ❌';
            titleEl.classList.add('error');
            descEl.textContent = `Giao dịch đã bị hủy hoặc không thành công. Mã lỗi: ${responseCode || 'Unknown'}. Vui lòng thử lại hoặc chọn phương thức khác.`;
        }
    });
})();