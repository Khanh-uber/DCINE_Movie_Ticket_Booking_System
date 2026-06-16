

(() => {
    'use strict';
    let stompClient = null;

    function getSocketBaseUrl() {
        const apiBase = window.API_BASE || '/api';

        try {
            return new URL(apiBase, window.location.href).origin;
        } catch (err) {
            console.warn('Không xác định được origin từ API_BASE, dùng location.origin', err);
            return window.location.origin;
        }
    }

    window.DCINE_JOIN_PAYMENT_ROOM = function (transactionId) {
        if (!transactionId) {
            console.error("Thiếu transactionId để join phòng socket");
            return;
        }

        console.log("Đang kết nối Socket cho giao dịch:", transactionId);
        const socket = new SockJS(`${getSocketBaseUrl()}/ws-payment`);
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('✅ Đã kết nối Socket thành công!');
            stompClient.subscribe('/topic/payment/' + transactionId, function (message) {
                console.log("🔔 NHẬN TÍN HIỆU THANH TOÁN:", message.body);
                
                try {
                    const payload = JSON.parse(message.body);
                    if (window.DCINE_MARK_PAYMENT_PAID) {
                        window.DCINE_MARK_PAYMENT_PAID(payload);
                    }
                } catch (e) {
                    console.error("Lỗi parse JSON socket:", e);
                }
            });
        }, function(error) {
            console.error("❌ Lỗi kết nối Socket:", error);
        });
    };

})();