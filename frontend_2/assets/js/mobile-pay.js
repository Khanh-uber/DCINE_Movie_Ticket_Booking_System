// ============================================
// CONFIG
// ============================================
const API = "http://10.213.166.10:8080/api"; // đổi đúng IP backend của bạn

// Lấy transactionId từ URL
const urlParams = new URLSearchParams(window.location.search);
const transactionId = urlParams.get("trans");

if (!transactionId) {
  alert("QR không hợp lệ (thiếu transactionId).");
}

// Format tiền
function toVND(x) {
  return Number(x).toLocaleString("vi-VN") + "đ";
}

// Hiển thị UI
function fillUI(order) {
  if (!order) return;

  document.getElementById("orderId").textContent = order.orderId || "...";
  document.getElementById("movieTitle").textContent = order.ticket?.movieTitle || "...";
  document.getElementById("theaterName").textContent = order.ticket?.theaterName || "...";
  document.getElementById("showDate").textContent = order.ticket?.date || "...";
  document.getElementById("showTime").textContent = order.ticket?.time || "...";

  document.getElementById("seatList").textContent =
    order.ticket?.seats?.join(", ") || "...";

  const t = order.totals || {};
  document.getElementById("ticketAmount").textContent = toVND(t.ticketAmount || 0);
  document.getElementById("comboAmount").textContent = toVND(t.combosAmount || 0);
  document.getElementById("vat").textContent = toVND(t.vat || 0);
  document.getElementById("discount").textContent = "-" + toVND(t.discountAmount || 0);
  document.getElementById("grandTotal").textContent = toVND(t.grandTotal || t.grand || 0);
}

// Lấy data từ backend
async function loadOrderInfo() {
  try {
    const res = await fetch(`${API}/checkout/order?trans=${transactionId}`);
    if (!res.ok) return;
    const data = await res.json();
    fillUI(data);
  } catch (e) {
    console.log("Không lấy được đơn hàng:", e);
  }
}

// Bấm nút thanh toán -> gọi mark-paid
document.getElementById("btnPay").addEventListener("click", async () => {
  try {
    const res = await fetch(`${API}/checkout/mark-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId })
    });

    if (res.ok) {
      document.getElementById("successMsg").style.display = "block";

      // Callback về FE desktop
      if (window.opener && window.opener.DCINE_MARK_PAYMENT_PAID) {
        const data = await res.json();
        window.opener.DCINE_MARK_PAYMENT_PAID(data);
      }

    } else {
      alert("Thanh toán thất bại!");
    }
  } catch (err) {
    alert("Không thể gửi yêu cầu thanh toán.");
  }
});

// Init
loadOrderInfo();
