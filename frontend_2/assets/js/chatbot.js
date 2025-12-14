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

    function addMessage(text, sender, isHTML = false) {
      const div = document.createElement('div');
      div.className = `msg ${sender}`;
      
      const content = isHTML ? text : text.replace(/\n/g, '<br>');
      div.innerHTML = `<div class="bubble">${content}</div>`;
      
      body.appendChild(div);
      scrollToBottom();
    }

    // 3. Cuộn xuống dưới cùng
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

        const data = await res.json();
        document.getElementById(loadingId).remove();
        addMessage(data.reply || "Xin lỗi, hệ thống đang bận.", 'bot', true); 

      } catch (err) {
        document.getElementById(loadingId).remove();
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

      // Nếu là link chuyển trang (có href)
      if (btn.hasAttribute('href')) {
        return; // Để trình duyệt tự xử lý chuyển trang
      }
      const actionPayload = btn.dataset.payload; // Lấy dữ liệu ẩn
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