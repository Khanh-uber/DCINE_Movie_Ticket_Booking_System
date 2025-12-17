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
            const walk = (x - startX) * 2; 
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
                <img src="${m.posterUrl}" draggable="false" loading="lazy" onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
                <div class="chat-card-body">
                    <div class="chat-card-title" title="${m.title}">${m.title}</div>
                    <div class="chat-card-desc">
                        ⭐ ${m.rating} | ${m.rated || 'T13'} | ${m.durationMin}p
                    </div>
                    <div class="chat-actions">
                        <a href="movie-details.html?id=${m.id}" class="btn-chat-action">
                            Đặt vé
                        </a>
                        ${m.trailerUrl ? `
                            <a href="${m.trailerUrl}" target="_blank" class="btn-chat-action outline">
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
    function scrollToBottom() {
      body.scrollTop = body.scrollHeight;
    }

    async function handleSend(text) {
      if (!text.trim()) return;
      addMessage(text, 'user');
      input.value = '';

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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ 
            message: text,
            context: { userName: userName, page: window.location.pathname } 
          })
        });

        const resData = await res.json(); 
        document.getElementById(loadingId).remove();

        if (resData.reply) {
            addMessage(resData.reply, 'bot', true); 
        }
        if (resData.data && Array.isArray(resData.data) && resData.data.length > 0) {
            addMovieCarousel(resData.data);
        }
        if (!resData.reply && (!resData.data || resData.data.length === 0)) {
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
      handleSend(input.value);
    });

    window.sendQuickReply = (text) => {
      handleSend(text);
    };
    body.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-chat-action');
      if (!btn) return;
      if (btn.tagName === 'A') return;

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