/* ============================================================
   SENTINEL AI — AI Security Assistant (chat UI)
   ============================================================ */

const AssistantView = {
  history: [],

  render() {
    return `<div class="chat-shell">
      <div class="chat-scroll" id="chat-scroll">
        <div class="msg ai">
          <div class="m-avatar">${Icons.bot}</div>
          <div class="m-bubble">Hello${State.user ? ' ' + esc(State.user.name.split(' ')[0]) : ''} 👋 I'm your Sentinel AI security assistant.\n\nAsk me anything about staying safe online — phishing, scams, passwords, WhatsApp security, or what to do if you've been targeted.</div>
        </div>
        ${AssistantView.history.map(m => AssistantView.msgHTML(m.role, m.text)).join('')}
      </div>
      <div class="chat-suggest" id="chat-suggest">
        ${['Is this website safe?', 'How do I secure my WhatsApp?', 'How do hackers steal bank accounts?', 'What is ransomware?', 'How do I avoid phishing?'].map(s =>
          `<button class="chip" data-q="${esc(s)}">${esc(s)}</button>`).join('')}
      </div>
      <div class="chat-input-bar">
        <input class="input" id="chat-input" placeholder="Ask a security question…" autocomplete="off">
        <button class="send-btn" id="chat-send">${Icons.send}</button>
      </div>
    </div>`;
  },

  msgHTML(role, text) {
    return role === 'user'
      ? `<div class="msg user"><div class="avatar m-avatar">${esc((State.user?.name || 'U')[0].toUpperCase())}</div><div class="m-bubble">${esc(text)}</div></div>`
      : `<div class="msg ai"><div class="m-avatar">${Icons.bot}</div><div class="m-bubble">${esc(text)}</div></div>`;
  },

  bind() {
    const input = document.getElementById('chat-input');
    const scroll = document.getElementById('chat-scroll');
    const send = async (q) => {
      const text = (q || input.value).trim();
      if (!text) return;
      input.value = '';
      AssistantView.history.push({ role: 'user', text });
      scroll.insertAdjacentHTML('beforeend', AssistantView.msgHTML('user', text));
      scroll.insertAdjacentHTML('beforeend', `<div class="msg ai" id="typing-msg"><div class="m-avatar">${Icons.bot}</div><div class="m-bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>`);
      scroll.scrollTop = scroll.scrollHeight;
      const res = await API.chat(text, AssistantView.history);
      await new Promise(r => setTimeout(r, 350 + Math.random() * 500));
      document.getElementById('typing-msg')?.remove();
      AssistantView.history.push({ role: 'ai', text: res.reply });
      scroll.insertAdjacentHTML('beforeend', AssistantView.msgHTML('ai', res.reply));
      scroll.scrollTop = scroll.scrollHeight;
    };
    document.getElementById('chat-send').addEventListener('click', () => send());
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    document.getElementById('chat-suggest').addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (chip) send(chip.dataset.q);
    });
    scroll.scrollTop = scroll.scrollHeight;
  },
};
