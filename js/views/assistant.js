/* ============================================================
   SENTINEL AI — AI Security Assistant
   Chat UI with persistent history (sessions in localStorage)
   ============================================================ */

const AssistantView = {
  sessions: JSON.parse(localStorage.getItem('sentinel_chats') || '[]'),
  currentId: null,

  save() { localStorage.setItem('sentinel_chats', JSON.stringify(AssistantView.sessions.slice(0, 30))); },

  current() { return AssistantView.sessions.find(s => s.id === AssistantView.currentId) || null; },

  newSession() {
    const s = { id: 'c' + Date.now(), title: 'New chat', time: Date.now(), messages: [] };
    AssistantView.sessions.unshift(s);
    AssistantView.currentId = s.id;
    AssistantView.save();
    return s;
  },

  render() {
    // resume most recent session, or start fresh
    if (!AssistantView.currentId && AssistantView.sessions.length) AssistantView.currentId = AssistantView.sessions[0].id;
    const cur = AssistantView.current();
    const msgs = cur ? cur.messages : [];
    return `<div class="chat-shell">
      <div class="chat-topbar">
        <span class="pill safe"><span class="pdot"></span>${AI.apiKey() ? 'Gemini Connected' : 'Built-in AI'}</span>
        <span class="spacer"></span>
        <button class="btn btn-ghost btn-sm" id="chat-new">＋ New Chat</button>
        <button class="btn btn-ghost btn-sm" id="chat-history-btn">${Icons.clock} History</button>
      </div>
      <div class="chat-scroll" id="chat-scroll">
        <div class="msg ai">
          <div class="m-avatar">${Icons.bot}</div>
          <div class="m-bubble">Hello${State.user ? ' ' + esc(State.user.name.split(' ')[0]) : ''} 👋 I'm your Sentinel AI security assistant.\n\nAsk me anything about staying safe online — phishing, scams, passwords, WhatsApp security, or what to do if you've been targeted.</div>
        </div>
        ${msgs.map(m => AssistantView.msgHTML(m.role, m.text)).join('')}
      </div>
      <div class="chat-suggest ${msgs.length ? 'gone' : ''}" id="chat-suggest">
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

  openHistory() {
    const scrim = document.createElement('div');
    scrim.className = 'chat-history-scrim';
    const panel = document.createElement('div');
    panel.className = 'chat-history';
    const renderList = () => {
      panel.innerHTML = `
        <div class="chat-history-head"><h3>Chat History</h3>
          <button class="modal-close" id="ch-close">${Icons.x}</button></div>
        <div class="chat-history-list">
          ${AssistantView.sessions.length ? AssistantView.sessions.map(s => `
            <div class="chat-session ${s.id === AssistantView.currentId ? 'active' : ''}" data-id="${s.id}">
              <button class="cs-del" data-del="${s.id}" title="Delete">${Icons.x}</button>
              <div class="cs-title">${esc(s.title)}</div>
              <div class="cs-meta"><span>${s.messages.length} messages</span><span>${timeAgo(s.time)}</span></div>
            </div>`).join('')
          : `<div class="empty">${Icons.sms}<div style="font-weight:600;color:var(--text)">No chats yet</div><div class="hint" style="margin-top:4px">Your conversations will appear here.</div></div>`}
        </div>`;
      panel.querySelector('#ch-close').addEventListener('click', close);
      panel.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation();
        AssistantView.sessions = AssistantView.sessions.filter(s => s.id !== b.dataset.del);
        if (AssistantView.currentId === b.dataset.del) AssistantView.currentId = AssistantView.sessions[0]?.id || null;
        AssistantView.save();
        renderList();
      }));
      panel.querySelectorAll('.chat-session').forEach(row => row.addEventListener('click', () => {
        AssistantView.currentId = row.dataset.id;
        close();
        App.renderPage();
      }));
    };
    const close = () => { scrim.remove(); panel.remove(); };
    scrim.addEventListener('click', close);
    renderList();
    document.body.append(scrim, panel);
  },

  bind() {
    const input = document.getElementById('chat-input');
    const scroll = document.getElementById('chat-scroll');

    document.getElementById('chat-new').addEventListener('click', () => {
      AssistantView.newSession();
      App.renderPage();
    });
    document.getElementById('chat-history-btn').addEventListener('click', () => AssistantView.openHistory());

    const send = async (q) => {
      const text = (q || input.value).trim();
      if (!text) return;
      input.value = '';
      let cur = AssistantView.current();
      if (!cur) cur = AssistantView.newSession();
      // first message titles the session
      if (!cur.messages.length) { cur.title = text.length > 42 ? text.slice(0, 42) + '…' : text; cur.time = Date.now(); }
      document.getElementById('chat-suggest')?.classList.add('gone');

      cur.messages.push({ role: 'user', text });
      AssistantView.save();
      scroll.insertAdjacentHTML('beforeend', AssistantView.msgHTML('user', text));
      scroll.insertAdjacentHTML('beforeend', `<div class="msg ai" id="typing-msg"><div class="m-avatar">${Icons.bot}</div><div class="m-bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>`);
      scroll.scrollTop = scroll.scrollHeight;

      const res = await API.chat(text, cur.messages);
      await new Promise(r => setTimeout(r, 350 + Math.random() * 500));
      document.getElementById('typing-msg')?.remove();
      cur.messages.push({ role: 'ai', text: res.reply });
      cur.time = Date.now();
      AssistantView.save();
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
