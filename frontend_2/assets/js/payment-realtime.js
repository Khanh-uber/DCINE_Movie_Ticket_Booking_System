

(() => {
    'use strict';
    let stompClient = null;
    window.DCINE_JOIN_PAYMENT_ROOM = function (transactionId) {
        if (!transactionId) {
            console.error("Thiếu transactionId để join phòng socket");
            return;
        }

        console.log("Đang kết nối Socket cho giao dịch:", transactionId);
        const socket = new SockJS('http://localhost:8080/ws-payment');
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