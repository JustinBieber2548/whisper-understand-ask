(function () {
  if (window.__pkChatLoaded) return;
  window.__pkChatLoaded = true;

  // ── state ──────────────────────────────────────────────────────────────
  var API_KEY = '';          // filled at runtime from meta tag or left blank for server-side
  var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
  var MODEL = 'gemini-3.5-flash';
  var history = [
    { role: 'assistant', content: "Hi! I'm PK's assistant. Ask me anything about our supply chain services — or leave your details and we'll follow up." }
  ];
  var SYSTEM = "You are PK Supply Chain's friendly assistant chatbot on their website.\n\nYour goals:\n1. Answer questions about PK Supply Chain's services (conveyor systems, assembly lines, maintenance, spare parts).\n2. Collect leads naturally: when a visitor shows interest, politely ask for their name, email, and what they need.\n3. Once you have name + email + inquiry, confirm someone will follow up at pongchai@pksupplychain.com.\n4. Be concise, warm, and professional. Reply in the same language the user writes (Thai or English).\n\nIf you don't know a specific answer, say so and offer to forward the question.";

  // ── styles ─────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#pk-chat-btn{position:fixed;bottom:24px;right:24px;z-index:2147483646;width:56px;height:56px;border-radius:50%;background:#1a56db;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;transition:transform .2s}',
    '#pk-chat-btn:hover{transform:scale(1.08)}',
    '#pk-chat-btn svg{width:26px;height:26px;fill:white}',
    '#pk-chat-box{position:fixed;bottom:90px;right:24px;z-index:2147483647;width:370px;max-width:95vw;height:520px;max-height:85vh;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;font-family:system-ui,sans-serif;font-size:14px}',
    '#pk-chat-box.open{display:flex}',
    '#pk-chat-header{background:#1a56db;color:#fff;padding:12px 16px;display:flex;align-items:center;gap:10px}',
    '#pk-chat-header img{width:32px;height:32px;border-radius:50%;background:#fff;object-fit:contain;padding:2px}',
    '#pk-chat-header-info{flex:1}',
    '#pk-chat-header-info b{display:block;font-size:14px}',
    '#pk-chat-header-info span{font-size:11px;opacity:.85}',
    '#pk-chat-close{background:none;border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1;padding:4px;opacity:.8}',
    '#pk-chat-close:hover{opacity:1}',
    '#pk-chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8f9fa}',
    '.pk-msg{max-width:82%;padding:9px 13px;border-radius:16px;line-height:1.5;word-break:break-word}',
    '.pk-msg.bot{background:#fff;border:1px solid #e5e7eb;border-bottom-left-radius:4px;align-self:flex-start}',
    '.pk-msg.user{background:#1a56db;color:#fff;border-bottom-right-radius:4px;align-self:flex-end}',
    '.pk-typing{display:flex;gap:4px;padding:10px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;border-bottom-left-radius:4px;align-self:flex-start}',
    '.pk-typing span{width:7px;height:7px;border-radius:50%;background:#999;animation:pkbounce 1s infinite}',
    '.pk-typing span:nth-child(2){animation-delay:.15s}',
    '.pk-typing span:nth-child(3){animation-delay:.3s}',
    '@keyframes pkbounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',
    '#pk-chat-footer{padding:10px 12px;border-top:1px solid #e5e7eb;background:#fff;display:flex;gap:8px;align-items:center}',
    '#pk-chat-input{flex:1;border:1px solid #d1d5db;border-radius:999px;padding:8px 16px;font-size:13px;outline:none;background:#f8f9fa}',
    '#pk-chat-input:focus{border-color:#1a56db;background:#fff}',
    '#pk-chat-send{width:36px;height:36px;border-radius:50%;background:#1a56db;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '#pk-chat-send:disabled{opacity:.4;cursor:default}',
    '#pk-chat-send svg{width:16px;height:16px;fill:white}'
  ].join('');
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────────────────
  var btn = document.createElement('button');
  btn.id = 'pk-chat-btn';
  btn.setAttribute('aria-label', 'Open chat');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>';

  var box = document.createElement('div');
  box.id = 'pk-chat-box';
  box.innerHTML = [
    '<div id="pk-chat-header">',
    '  <div id="pk-chat-header-info"><b>PK Supply Chain</b><span>🟢 Online — replies instantly</span></div>',
    '  <button id="pk-chat-close" aria-label="Close">×</button>',
    '</div>',
    '<div id="pk-chat-messages"></div>',
    '<div id="pk-chat-footer">',
    '  <input id="pk-chat-input" placeholder="Type a message…" autocomplete="off"/>',
    '  <button id="pk-chat-send" aria-label="Send">',
    '    <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
    '  </button>',
    '</div>'
  ].join('');

  document.body.appendChild(btn);
  document.body.appendChild(box);

  var messagesEl = document.getElementById('pk-chat-messages');
  var input = document.getElementById('pk-chat-input');
  var sendBtn = document.getElementById('pk-chat-send');

  // ── render history ─────────────────────────────────────────────────────
  function renderMessages() {
    messagesEl.innerHTML = '';
    history.forEach(function(m) {
      var div = document.createElement('div');
      div.className = 'pk-msg ' + (m.role === 'user' ? 'user' : 'bot');
      div.textContent = m.content;
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addTyping() {
    var div = document.createElement('div');
    div.className = 'pk-typing';
    div.id = 'pk-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    var t = document.getElementById('pk-typing');
    if (t) t.remove();
  }

  renderMessages();

  // ── send message ───────────────────────────────────────────────────────
  async function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;

    history.push({ role: 'user', content: text });
    renderMessages();
    addTyping();

    try {
      var messages = [{ role: 'system', content: SYSTEM }].concat(history);
      var res = await fetch(GEMINI_URL + '?key=' + window.PK_GEMINI_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages: messages })
      });
      var data = await res.json();
      var reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
        ? data.choices[0].message.content
        : 'Sorry, something went wrong. Please try again.';
      removeTyping();
      history.push({ role: 'assistant', content: reply });
      renderMessages();
    } catch(e) {
      removeTyping();
      history.push({ role: 'assistant', content: 'Sorry, I could not connect. Please try again.' });
      renderMessages();
    }

    sendBtn.disabled = false;
    input.focus();
  }

  // ── events ─────────────────────────────────────────────────────────────
  btn.addEventListener('click', function() { box.classList.add('open'); input.focus(); });
  document.getElementById('pk-chat-close').addEventListener('click', function() { box.classList.remove('open'); });
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });
})();
