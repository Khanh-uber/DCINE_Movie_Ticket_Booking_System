(() => {
    'use strict';

    // =========================================================
    // 1. CODE DEBUG: IN LỖI RA MÀN HÌNH ĐIỆN THOẠI (BẮT BUỘC)
    // =========================================================
    function logToScreen(msg, isError = false) {
        let debugBox = document.getElementById('debug-box');
        if (!debugBox) {
            debugBox = document.createElement('div');
            debugBox.id = 'debug-box';
            debugBox.style.cssText = "position:fixed; top:0; left:0; width:100%; z-index:9999; background: #fff; color: #000; padding: 10px; font-size: 14px; border-bottom: 2px solid red; max-height: 300px; overflow: auto;";
            document.body.prepend(debugBox);
        }
        const p = document.createElement('div');
        p.textContent = (isError ? "❌ " : "ℹ️ ") + msg;
        p.style.color = isError ? 'red' : 'blue';
        p.style.borderBottom = '1px solid #eee';
        p.style.padding = '5px 0';
        debugBox.appendChild(p);
    }

    // Bắt mọi lỗi JS ngầm
    window.onerror = function(message, source, lineno, colno, error) {
        logToScreen(`Lỗi JS: ${message} (Dòng ${lineno})`, true);
    };
    // =========================================================

    const toVND = (n) => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
    const $ = document.querySelector.bind(document);

    // Lấy transactionId
    const urlParams = new URLSearchParams(window.location.search);
    const transId = urlParams.get('trans');

    // 2. IP MÁY TÍNH CỦA BẠN (Thay đúng số này vào)
    // Nếu bạn không biết, hãy gõ ipconfig trên máy tính để xem
    const SERVER_IP = "192.168.1.11"; 
    const SERVER_PORT = "8080";
    const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

    async function loadOrderInfo() {
        logToScreen("Đang tải trang...");
        
        if (!transId) {
            logToScreen("Lỗi: Không có mã trans trên URL", true);
            return;
        }

        try {
            // Dùng đường dẫn tuyệt đối để chắc chắn điện thoại tìm thấy máy tính
            const API_URL = `${BASE_URL}/api/checkout/order?trans=${transId}`;
            logToScreen("Gọi API: " + API_URL);

            const res = await fetch(API_URL).catch(e => {
                throw new Error("Không thể kết nối tới " + SERVER_IP + ". Hãy kiểm tra Wifi/Tường lửa.");
            });

            logToScreen("Server phản hồi: " + res.status);

            if (!res.ok) throw new Error("Lỗi API: " + res.status);

            const data = await res.json();
            logToScreen("Đã nhận dữ liệu OK!");
            renderOrder(data);
        } catch (err) {
            logToScreen(err.message, true);
            $('#movieName').textContent = "Lỗi kết nối!";
        }
    }

    function renderOrder(data) {
        try {
            $('#orderId').textContent = data.orderId || '...';
            const ticket = data.ticket || {};
            $('#movieName').textContent = ticket.movieTitle || '...';
            $('#theaterName').textContent = ticket.theaterName || '...';
            $('#showDate').textContent = ticket.date || '--';
            $('#showTime').textContent = ticket.time || '--';
            
            const seats = ticket.seats || [];
            $('#seats').textContent = seats.length > 0 ? seats.join(', ') : 'Chưa chọn';

            const totals = data.totals || {};
            $('#ticketPrice').textContent = toVND(totals.ticketAmount);
            $('#comboPrice').textContent = toVND(totals.combosAmount);
            $('#totalPrice').textContent = toVND(totals.grandTotal);
        } catch (e) {
            logToScreen("Lỗi hiển thị: " + e.message, true);
        }
    }

    async function handlePayment() {
        const btn = $('#btnPay');
        btn.disabled = true;
        btn.textContent = "Đang xử lý...";
        logToScreen("Đang gửi yêu cầu thanh toán...");

        try {
            const API_URL = `${BASE_URL}/api/checkout/mark-paid?trans=${transId}`;
            const res = await fetch(API_URL, { method: 'POST' });

            if (res.ok) {
                logToScreen("Thanh toán thành công!");
                alert("✅ Thanh toán thành công!");
                document.body.innerHTML = `
                    <div style="text-align:center; padding: 50px; color: #fff;">
                        <h1>Đã thanh toán!</h1>
                        <p>Kiểm tra màn hình máy tính của bạn.</p>
                    </div>
                `;
            } else {
                throw new Error("Lỗi xác nhận: " + res.status);
            }
        } catch (err) {
            logToScreen("Lỗi: " + err.message, true);
            alert("❌ " + err.message);
            btn.disabled = false;
            btn.textContent = "XÁC NHẬN THANH TOÁN";
        }
    }

    function init() {
        const btnPay = $('#btnPay');
        if (btnPay) {
            btnPay.addEventListener('click', handlePayment);
        } else {
            logToScreen("Lỗi HTML: Không tìm thấy nút #btnPay", true);
        }
        loadOrderInfo();
    }

    document.addEventListener('DOMContentLoaded', init);
})();