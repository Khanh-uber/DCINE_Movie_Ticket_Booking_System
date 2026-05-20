
(() => {
  const API_CHAT = window.API_BASE + '/chatbot/ask';

  function initChatLogic() {
    const $ = (s) => document.querySelector(s);
    const widget = $('#dcine-chatbot');
    const toggleBtn = $('#chat-toggle');
    const windowEl = $('.chat-window');
    const closeBtn = $('#chat-close');
    const form = $('#chat-form');
    const input = $('#chat-input');
    const body = $('#chat-messages');
    let chatHistory = [];
    let summaryContext = "";

    console.log("input value:", input?.value);
    
    toggleBtn.addEventListener('click', () => {
      windowEl.classList.remove('hidden');
      setTimeout(() => input.focus(), 100); 
    });
    
    closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));

    function enableDragScroll(el) {
        if (!el) return;
        
        let isDown = false;
        let startX;
        let scrollLeft;
        let isDragging = false;

        el.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            el.classList.add('dragging'); 
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        });

        el.addEventListener('mouseleave', () => {
            isDown = false;
            el.classList.remove('dragging');
        });

        el.addEventListener('mouseup', (e) => {
            isDown = false;
            el.classList.remove('dragging');

            if (isDragging) {
                const captureClick = (ev) => {
                    ev.stopPropagation(); 
                    ev.preventDefault(); 
                    window.removeEventListener('click', captureClick, true);
                };
                window.addEventListener('click', captureClick, true);
            }
        });

        el.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault(); 
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.2; 
            el.scrollLeft = scrollLeft - walk;

            if (Math.abs(walk) > 5) {
                isDragging = true;
            }
        });
    }

    const initialQuickReplies = $('.quick-replies');
    if (initialQuickReplies) {
        enableDragScroll(initialQuickReplies);
    }

    function addMessage(text, sender, isHTML = false) {
      const div = document.createElement('div');
      div.className = `msg ${sender}`;
      let content = text;
      if (!isHTML && typeof text === 'string') {
          content = text.replace(/\n/g, '<br>');
      } else if (isHTML && typeof text === 'string') {
          content = text.replace(/\n/g, '<br>');
      }

      div.innerHTML = `<div class="bubble">${content}</div>`;
      const newQuickReplies = div.querySelector('.quick-replies');
      if (newQuickReplies) enableDragScroll(newQuickReplies);
      body.appendChild(div);
      scrollToBottom();
    }
    function addMovieCarousel(movies) {
        if (!Array.isArray(movies) || movies.length === 0) return;

        const div = document.createElement('div');
        div.className = 'msg bot'; 
        const cardsHtml = movies.map(m => `
            <div class="chat-card">
                <img src="${m.poster_url}" draggable="false" loading="lazy" onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
                <div class="chat-card-body">
                    <div class="chat-card-title" title="${m.title}">${m.title}</div>
                    <div class="chat-card-desc">
                        ⭐ ${m.rating} | ${m.age_limit || 'T13'} | ${m.duration_min}p
                    </div>
                    <div class="chat-actions">
                        <a href="showtime.html?movie=${m.movie_id}" class="btn-chat-action">
                            Đặt vé
                        </a>
                        
                        ${m.trailer_url ? `
                            <a href="#" 
                               class="btn-chat-action outline js-watch-trailer" 
                               data-trailer="${m.trailer_url}">
                                Trailer
                            </a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        div.innerHTML = `<div class="chat-carousel">${cardsHtml}</div>`;
        const carouselEl = div.querySelector('.chat-carousel');
        enableDragScroll(carouselEl);
        body.appendChild(div);
        scrollToBottom();
    }
    //HÀM VẼ SƠ ĐỒ GHẾ TĨNH CỐ ĐỊNH CỦA THỨC 
    function renderReadOnlyGridWithFixedStructure(bookedSeats, showtimeId, containerDiv) {
        console.log("CALL RENDER FUNCTION");
        console.log("bookedSeats:", bookedSeats);
        console.log("containerDiv:", containerDiv);
        containerDiv.innerHTML = ""; // Xóa chữ loading

        // 1. MA TRẬN PHÒNG CHIẾU HOÀN CHỈNH THEO ẢNH THỰC TẾ CỦA THỨC
        const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']; // Thêm hàng I, J
        const COLS = 16;
        const AISLES_AFTER = [4, 12]; // 🔥 ĐỔI: Lối đi nằm sau cột số 4 và cột số 12

        // Giả lập vòm màn hình chiếu rạp phim
        const header = document.createElement("div");
        header.className = "seat-chat-header";
        header.innerHTML = `<span style="font-size:11px; color:#64748b; font-weight:bold; letter-spacing:1px;">SƠ ĐỒ HIỆN TRẠNG SUẤT CHIẾU #${showtimeId}</span>
                            <div class="seat-chat-screen">S C R E E N</div>`;
        containerDiv.appendChild(header);

        const gridDiv = document.createElement("div");
        gridDiv.className = "seat-chat-grid";

        // 2. VÒNG LẶP DỰNG HÌNH MA TRẬN GHẾ TĨNH
        ROWS.forEach(rowName => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "seat-chat-row";

            // Nhãn chữ cái hàng ghế ở BIÊN TRÁI (A, B, C...)
            const leftLabel = document.createElement("span");
            leftLabel.style.cssText = "font-size:10px; width:16px; font-weight:bold; color:#475569; text-align:center;";
            leftLabel.innerText = rowName;
            rowDiv.appendChild(leftLabel);

            // 🔥 ĐỔI LOGIC PHÂN VÙNG (ZONE) THEO ĐÚNG HÌNH MẪU
            let zone = "standard";
            if (['A', 'B', 'C'].includes(rowName)) zone = "standard"; // Hàng A->C: Standard
            if (['D', 'E', 'F', 'G', 'H'].includes(rowName)) zone = "vip";     // Hàng D->H: VIP
            if (['I', 'J'].includes(rowName)) zone = "couple";                // Hàng I->J: Couple

            for (let c = 1; c <= COLS; c++) {
                const seatName = `${rowName}${c}`;

                // Logic xử lý gom dãn ô ghế đôi hàng I và J
                if (zone === "couple" && c % 2 === 0) {
                    // Nếu dính cổng Aisle nằm giữa cặp ghế chẵn, vẫn phải chèn vách ngăn lối đi
                    if (AISLES_AFTER.includes(c)) {
                        const aisle = document.createElement("div");
                        aisle.className = "seat-chat-aisle";
                        rowDiv.appendChild(aisle);
                    }
                    continue; 
                }

                // Tạo ô ghế DIV tĩnh
                const seatDiv = document.createElement("div");
                seatDiv.className = "seat-view-only";
                seatDiv.setAttribute("data-zone", zone);
                
                // Gán nhãn text hiển thị lên mặt ghế
                if (zone === "couple") {
                    seatDiv.innerText = `${c}-${c+1}`; // Hiển thị kiểu: 1-2, 3-4 giống ảnh mẫu
                } else {
                    seatDiv.innerText = c;
                }

                // KHỚP DỮ LIỆU ĐỘNG: Nếu mã ghế nằm trong danh sách booked từ DB -> Ép trạng thái 'booked' màu xám đen
                if (bookedSeats.includes(seatName)) {
                    seatDiv.setAttribute("data-state", "booked");
                } else {
                    seatDiv.setAttribute("data-state", "available");
                }

                rowDiv.appendChild(seatDiv);

                // Chèn hành lang lối đi trống dựa theo mảng tọa độ cố định
                if (AISLES_AFTER.includes(c)) {
                    const aisle = document.createElement("div");
                    aisle.className = "seat-chat-aisle";
                    rowDiv.appendChild(aisle);
                }
            }

            // Nhãn chữ cái hàng ghế ở BIÊN PHẢI cho cân xứng y hệt ảnh mẫu
            const rightLabel = document.createElement("span");
            rightLabel.style.cssText = "font-size:10px; width:16px; font-weight:bold; color:#475569; text-align:center; margin-left: 4px;";
            rightLabel.innerText = rowName;
            rowDiv.appendChild(rightLabel);

            gridDiv.appendChild(rowDiv);
        });

        containerDiv.appendChild(gridDiv);
        
        // 3. Thanh Chú Thích Màu Sắc Nhỏ Gọn Dưới Đáy Block Chat
        const legendHint = document.createElement("div");
        legendHint.className = "seat-chat-legend-hint";
        legendHint.innerHTML = `
            <div><span class="legend-dot" style="background: #272d37; border: 1px solid #3f4756;"></span>Đã đặt</div>
            <div><span class="legend-dot" style="background: linear-gradient(to bottom, #bae6fd, #7dd3fc); border: 1px solid #38bdf8;"></span>Standard</div>
            <div><span class="legend-dot" style="background: linear-gradient(to bottom, #fef08a, #fde047); border: 1px solid #facc15;"></span>VIP</div>
            <div><span class="legend-dot" style="background: linear-gradient(to bottom, #fbcfe8, #f472b6); border: 1px solid #ec4899;"></span>Couple</div>
        `;
        containerDiv.appendChild(legendHint);
        
        scrollToBottom();
    }
  
    function scrollToBottom() {
      body.scrollTop = body.scrollHeight;
    }
    function scrollToBottom() {
      body.scrollTop = body.scrollHeight;
    }
    
    async function handleSend(text) {
      // 1. LẤY DATA AN TOÀN: Ưu tiên tham số 'text', nếu không có thì bốc từ input.value
      let messageToSend = "";
      if (text && typeof text === 'string' && text.trim() !== "") {
          messageToSend = text.trim();
      } else if (input && input.value) {
          messageToSend = input.value.trim();
      }

      // 2. Chặn đứng ngay từ vòng gửi xe nếu thực sự không có chữ nào
      if (!messageToSend) {
          console.warn("⚠️ Hàm handleSend bị gọi nhưng không có nội dung chữ.");
          return;
      }

      // 3. In tin nhắn của User lên màn hình chat UI trước
      addMessage(messageToSend, 'user');
      
      // 4. Xóa chữ trong ô input vật lý (Lúc này biến messageToSend đã giữ chữ an toàn)
      if (input) {
          input.value = '';
      }

      const loadingId = 'typing-' + Date.now();
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'msg bot';
      loadingDiv.id = loadingId;
      loadingDiv.innerHTML = `
        <div class="bubble" style="color:#aaa; font-style:italic;">
          <span class="typing-dot">●</span> <span class="typing-dot">●</span> <span class="typing-dot">●</span>
        </div>`; 
      body.appendChild(loadingDiv);
      scrollToBottom();

      try {
        const token = localStorage.getItem('accessToken');
        const userName = localStorage.getItem('fullName') || 'Khách';

        
        const res = await fetch(API_CHAT, {
          method: 'POST',
          credentials: 'include', // BẮT BUỘC
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ 
            user_message: messageToSend,
            chat_history: chatHistory,
            summary_context: summaryContext
          })
        });

        const resData = await res.json(); 
        document.getElementById(loadingId).remove();
        
        chatHistory = resData.updated_history || [];
        summaryContext = resData.summary_context || "";
        const activeBotReply = resData.bot_message || resData.reply;
        if (activeBotReply) {
            addMessage(activeBotReply, 'bot', true);
        }
        // ======================================================================
        // Thức: thêm hàm vẽ ghế 
        // ======================================================================
        if (resData.action === "OPEN_SEAT_MAP" && resData.frontend_data) {
            const seatBlockDiv = document.createElement('div');
            seatBlockDiv.className = 'msg bot seat-chat-block';
            seatBlockDiv.innerHTML = `<p style="text-align:center; font-size:12px; color:#888;">🔄 Đang dựng sơ đồ ghế thực tế...</p>`;
            body.appendChild(seatBlockDiv);
            scrollToBottom();

            // Gọi hàm render lưới ghế tĩnh, mảng booked_seats được bốc từ đường ống frontend_data riêng
            renderReadOnlyGridWithFixedStructure(
                resData.frontend_data.booked_seats, 
                resData.showtime_id, 
                seatBlockDiv
            );
        }
        // ======================================================================
        if (resData.data && Array.isArray(resData.data) && resData.data.length > 0) {
            addMovieCarousel(resData.data);
        }
        if (!activeBotReply && (!resData.data || resData.data.length === 0)) {
            addMessage("Xin lỗi, mình không hiểu ý bạn.", 'bot');
        }

      } catch (err) {
        if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        console.error(err);
        addMessage("⚠️ Lỗi kết nối. Vui lòng thử lại sau.", 'bot');
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("FORM SUBMIT");
      const text = input.value;
      console.log("text trước handleSend:", text);
      handleSend(input.value);
    });

    window.sendQuickReply = (text) => {
      handleSend(text);
    };

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-chat-action');
      if (!btn) return;
      if (btn.classList.contains('js-watch-trailer')) {
        e.preventDefault(); 
        const trailerUrl = btn.dataset.trailer;
        if (window.openTrailerModal) {
            window.openTrailerModal(trailerUrl);
        } else {
            window.open(trailerUrl, '_blank');
        }
        return;
      }

      if (btn.tagName === 'A' && !btn.dataset.payload) {
        return;
      }

      const actionPayload = btn.dataset.payload;
      const actionText = btn.textContent;
      if (actionPayload || actionText) {
        handleSend(actionPayload || actionText);
      }
    });
  }

  async function loadChatbotHTML() {
    try {
      const path = 'components/chatbot.html'; 
      const res = await fetch(path);
      if (res.ok) {
        const html = await res.text();
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
        initChatLogic();
      }
    } catch (e) {
      console.warn('Chatbot UI load failed:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadChatbotHTML);
  } else {
    loadChatbotHTML();
  }
})();