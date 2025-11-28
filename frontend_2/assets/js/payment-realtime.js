// =============================
// PAYMENT REALTIME LISTENER
// =============================

// Nhúng socket.io client CDN:
// <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
// Sau đó nhúng file này

(() => {
    'use strict';

    // 1. Kết nối Socket.io server
    // ------------------------------------
    const socket = io("http://localhost:3001"); 
    // Nếu deploy thật: đổi sang domain socket server


    // 2. Hàm join phòng giao dịch
    // ------------------------------------
    // FE/payment.js sẽ gọi hàm này ngay sau khi nhận transactionId từ BE
    window.DCINE_JOIN_PAYMENT_ROOM = function (transactionId) {
        if (!transactionId) return;
        console.log("[socket] join_room:", transactionId);
        socket.emit("join_room", { transactionId });
    };


    // 3. Lắng nghe sự kiện thanh toán thành công từ BE
    // ------------------------------------
    socket.on("payment_success", (payload) => {
        console.log("[socket] PAYMENT SUCCESS:", payload);

        // FE/payment.js đã có sẵn hàm này
        if (window.DCINE_MARK_PAYMENT_PAID) {
            window.DCINE_MARK_PAYMENT_PAID(payload);
        }
    });

})();
