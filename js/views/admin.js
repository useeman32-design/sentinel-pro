/* ============================================================
   SENTINEL AI — SUPER ADMIN PANEL
   Full platform control: users, detection signatures,
   blocklist, threat intel, AI settings, broadcasts.
   ============================================================ */

const AdminView = {
  tab: 'overview',

  render() {
    if (!State.user || State.user.role !== 'admin')
      return `<div class="empty">${Icons.lock}<div style="font-weight:700;color:var(--text)">Admin access required</div>
        <div class="hint" style="margin-top:6px">Sign in with a super-admin account to manage the platform.</div></div>`;
    const tabs = [
      ['overview', 'Overview'], ['users', 'Users'], ['signatures', 'Signatures'],
      ['blocklist', 'Blocklist'], ['intel', 'Threat Intel'], ['academy', 'Academy'],
      ['community', 'Community'], ['announce', 'Announcements'], ['settings', 'Settings'],
    ];
    return `
      <div class="tabs" style="margin-bottom:16px" id="admin-tabs">
        ${tabs.map(([id, l]) => `<button class="tab ${AdminView.tab === id ? 'active' : ''}" data-t="${id}">${l}</button>`).join('')}
      </div>
      <div id="admin-body"><div class="skel" style="height:200px"></div></div>`;
  },

  bind() {
    if (!State.user || State.user.role !== 'admin') return;
    document.getElementById('admin-tabs').addEventListener('click', e => {
      const t = e.target.closest('.tab'); if (!t) return;
      AdminView.tab = t.dataset.t;
      document.querySelectorAll('#admin-tabs .tab').forEach(x => x.classList.toggle('active', x === t));
      AdminView.loadTab();
    });
    AdminView.loadTab();
  },

  async loadTab() {
    const body = document.getElementById('admin-body');
    body.innerHTML = '<div class="skel" style="height:200px"></div>';
    try {
      await AdminView['tab_' + AdminView.tab](body);
    } catch (e) { body.innerHTML = `<div class="empty">${Icons.alert}<div style="color:var(--text);font-weight:600">${esc(e.message)}</div></div>`; }
  },

  /* ---------------- OVERVIEW ---------------- */
  async tab_overview(body) {
    const s = await API.admin.stats();
    body.innerHTML = `
      <div class="grid grid-4">
        ${[['Users', s.users, 'var(--green)', Icons.user], ['Total Scans', s.scans, 'var(--blue)', Icons.scan],
           ['Threats Caught', s.threats, 'var(--red)', Icons.alert], ['Active Signatures', s.signatures, 'var(--amber)', Icons.radar]]
          .map(([l, v, c, ic]) => `<div class="card stat-card"><div class="stat-label">${ic} ${l.toUpperCase()}</div>
            <div class="stat-value" style="color:${c}">${v}</div></div>`).join('')}
      </div>
      <div class="section-gap card">
        <div class="card-title">${Icons.activity} Live Scan Feed (all users)<span class="spacer"></span>
          <span class="tag">DB: ${esc(s.db_driver)}</span></div>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>User</th><th>Type</th><th>Subject</th><th>Verdict</th><th>Risk</th><th>Time</th></tr></thead>
          <tbody>${s.recent_scans.map(r => `<tr>
            <td>${esc(r.email)}</td><td><span class="tag">${r.type}</span></td>
            <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.subject)}</td>
            <td><span class="pill ${r.verdict === 'danger' ? 'danger' : r.verdict === 'warn' ? 'warn' : 'safe'}">${r.verdict}</span></td>
            <td><b>${r.risk}</b></td><td class="hint">${(r.created_at || '').slice(5, 16)}</td></tr>`).join('') ||
            '<tr><td colspan="6" class="hint" style="text-align:center;padding:20px">No scans yet</td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="section-gap card">
        <div class="card-title">${Icons.bell} Broadcast Notification</div>
        <div class="grid grid-2" style="gap:10px">
          <input class="input" id="bc-title" placeholder="Title — e.g. New phishing wave alert">
          <select class="input" id="bc-type"><option value="info">Info</option><option value="warn">Warning</option><option value="danger">Danger</option></select>
        </div>
        <textarea class="input section-gap" id="bc-body" placeholder="Message body sent to every user…" style="min-height:70px"></textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="bc-send">${Icons.send} Send to All Users</button>
        </div>
      </div>`;
    document.getElementById('bc-send').addEventListener('click', async () => {
      const title = document.getElementById('bc-title').value.trim();
      if (!title) return toast('Enter a title.', 'err');
      const r = await API.admin.broadcast({ title, body: document.getElementById('bc-body').value.trim(), type: document.getElementById('bc-type').value });
      toast(`Broadcast sent to ${r.sent} users.`, 'ok');
    });
  },

  /* ---------------- USERS ---------------- */
  async tab_users(body) {
    const { items } = await API.admin.users();
    body.innerHTML = `<div class="card">
      <div class="card-title">${Icons.user} User Management<span class="spacer"></span><span class="tag">${items.length} accounts</span></div>
      <div class="table-wrap"><table class="tbl">
        <thead><tr><th>User</th><th>Role</th><th>Plan</th><th>Status</th><th>Verified</th><th>Joined</th></tr></thead>
        <tbody>${items.map(u => `<tr>
          <td><b>${esc(u.name)}</b><div class="hint">${esc(u.email)}</div></td>
          <td><select class="input" style="padding:6px 8px;width:auto" data-uf="role" data-id="${u.id}">
            ${['member','analyst','admin'].map(r => `<option ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></td>
          <td><select class="input" style="padding:6px 8px;width:auto" data-uf="plan" data-id="${u.id}">
            ${['free','pro','enterprise'].map(p => `<option ${u.plan === p ? 'selected' : ''}>${p}</option>`).join('')}</select></td>
          <td><select class="input" style="padding:6px 8px;width:auto" data-uf="status" data-id="${u.id}">
            ${['active','suspended'].map(st => `<option ${u.status === st ? 'selected' : ''}>${st}</option>`).join('')}</select></td>
          <td>${u.verified ? '<span class="pill safe">✓</span>' : '<span class="pill warn">—</span>'}</td>
          <td class="hint">${(u.created_at || '').slice(0, 10)}</td></tr>`).join('')}</tbody>
      </table></div></div>`;
    body.querySelectorAll('[data-uf]').forEach(sel => sel.addEventListener('change', async () => {
      try { await API.admin.updateUser(sel.dataset.id, { [sel.dataset.uf]: sel.value }); toast('User updated.', 'ok'); }
      catch (e) { toast(e.message, 'err'); AdminView.loadTab(); }
    }));
  },

  /* ---------------- SIGNATURES ---------------- */
  async tab_signatures(body) {
    const { items } = await API.admin.signatures();
    body.innerHTML = `
      <div class="card">
        <div class="card-title">${Icons.radar} Detection Signatures<span class="spacer"></span><span class="tag">${items.length} rules</span></div>
        <p class="hint" style="margin-bottom:12px">These regex rules power the email/SMS/URL scanners in real time. Changes take effect instantly for all users.</p>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>Channel</th><th>Category</th><th>Pattern (regex)</th><th>Weight</th><th>On</th><th></th></tr></thead>
          <tbody>${items.map(g => `<tr style="${g.enabled ? '' : 'opacity:.45'}">
            <td><span class="tag">${g.channel}</span></td><td>${esc(g.category)}</td>
            <td style="font-family:monospace;font-size:11px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.pattern)}</td>
            <td><b>${g.weight}</b></td>
            <td><label class="toggle" style="transform:scale(.85)"><input type="checkbox" data-sig-toggle="${g.id}" ${g.enabled ? 'checked' : ''}><span class="tk"></span></label></td>
            <td><button class="btn btn-danger btn-sm" data-sig-del="${g.id}" style="padding:5px 9px">${Icons.x}</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="section-gap card">
        <div class="card-title">＋ Add Signature</div>
        <div class="grid grid-4" style="gap:10px">
          <select class="input" id="sig-channel"><option>sms</option><option>email</option><option>url</option></select>
          <input class="input" id="sig-cat" placeholder="Category — e.g. Job Scam">
          <input class="input" id="sig-pattern" placeholder="/(pattern|regex)/i" style="font-family:monospace">
          <input class="input" id="sig-weight" type="number" value="20" min="1" max="60">
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="sig-add">Add Rule</button>
        </div>
      </div>`;
    body.querySelectorAll('[data-sig-toggle]').forEach(t => t.addEventListener('change', async () => {
      await API.admin.toggleSignature(t.dataset.sigToggle, t.checked); toast('Signature ' + (t.checked ? 'enabled' : 'disabled') + '.', 'ok');
    }));
    body.querySelectorAll('[data-sig-del]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.deleteSignature(b.dataset.sigDel); toast('Signature deleted.', 'ok'); AdminView.loadTab();
    }));
    document.getElementById('sig-add').addEventListener('click', async () => {
      try {
        await API.admin.addSignature({
          channel: document.getElementById('sig-channel').value, category: document.getElementById('sig-cat').value.trim(),
          pattern: document.getElementById('sig-pattern').value.trim(), weight: +document.getElementById('sig-weight').value });
        toast('Signature added — live immediately.', 'ok'); AdminView.loadTab();
      } catch (e) { toast(e.message, 'err'); }
    });
  },

  /* ---------------- BLOCKLIST ---------------- */
  async tab_blocklist(body) {
    const { items } = await API.admin.blocklist();
    body.innerHTML = `
      <div class="card">
        <div class="card-title">${Icons.x} Domain Blocklist<span class="spacer"></span><span class="tag">${items.length} entries</span></div>
        <p class="hint" style="margin-bottom:12px">Any URL or QR resolving to these domains is instantly flagged 97/100 DANGEROUS for every user.</p>
        ${items.map(b => `<div class="list-item">
          <div class="list-icon red">${Icons.globe}</div>
          <div class="list-body"><div class="list-title" style="font-family:monospace">${esc(b.pattern)}</div>
            <div class="list-sub">${esc(b.note || 'No note')} · added ${(b.created_at || '').slice(0, 10)}</div></div>
          <button class="btn btn-danger btn-sm" data-bl-del="${b.id}" style="padding:5px 9px">${Icons.x}</button>
        </div>`).join('') || '<div class="hint">Blocklist empty.</div>'}
      </div>
      <div class="section-gap card">
        <div class="card-title">＋ Block Domain</div>
        <div class="grid grid-2" style="gap:10px">
          <input class="input" id="bl-pattern" placeholder="evil-domain.tk" style="font-family:monospace">
          <input class="input" id="bl-note" placeholder="Note — e.g. Active phishing kit">
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="bl-add">Block Domain</button>
        </div>
      </div>`;
    body.querySelectorAll('[data-bl-del]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.deleteBlock(b.dataset.blDel); toast('Removed from blocklist.', 'ok'); AdminView.loadTab();
    }));
    document.getElementById('bl-add').addEventListener('click', async () => {
      const p = document.getElementById('bl-pattern').value.trim();
      if (!p) return toast('Enter a domain.', 'err');
      await API.admin.addBlock({ pattern: p, note: document.getElementById('bl-note').value.trim() });
      toast(p + ' blocked platform-wide.', 'ok'); AdminView.loadTab();
    });
  },

  /* ---------------- THREAT INTEL ---------------- */
  async tab_intel(body) {
    const { alerts } = await API.getThreatIntel();
    body.innerHTML = `
      <div class="card">
        <div class="card-title">${Icons.globe} Published Alerts</div>
        ${alerts.map(a => `<div class="list-item">
          <div class="list-icon ${a.level === 'danger' ? 'red' : a.level === 'warn' ? 'amber' : 'blue'}">${a.level === 'danger' ? Icons.alert : a.level === 'warn' ? Icons.zap : Icons.info}</div>
          <div class="list-body"><div class="list-title" style="white-space:normal">${esc(a.title)}</div>
            <div class="list-sub" style="white-space:normal">${esc(a.descr || '')}</div></div>
          <button class="btn btn-ghost btn-sm" data-ti-off="${a.id}">Unpublish</button>
        </div>`).join('') || '<div class="hint">No active alerts.</div>'}
      </div>
      <div class="section-gap card">
        <div class="card-title">＋ Publish New Alert</div>
        <div class="grid grid-2" style="gap:10px">
          <input class="input" id="ti-title" placeholder="Alert title">
          <div class="grid grid-2" style="gap:10px">
            <select class="input" id="ti-level"><option value="info">Info</option><option value="warn">Warning</option><option value="danger">Danger</option></select>
            <input class="input" id="ti-cat" placeholder="Category — e.g. Phishing">
          </div>
        </div>
        <textarea class="input section-gap" id="ti-descr" placeholder="Describe the threat…" style="min-height:70px"></textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="ti-add">${Icons.send} Publish to All Users</button>
        </div>
      </div>`;
    body.querySelectorAll('[data-ti-off]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.toggleIntel(b.dataset.tiOff, false); toast('Alert unpublished.', 'ok'); AdminView.loadTab();
    }));
    document.getElementById('ti-add').addEventListener('click', async () => {
      const title = document.getElementById('ti-title').value.trim();
      if (!title) return toast('Enter a title.', 'err');
      await API.admin.addIntel({ title, level: document.getElementById('ti-level').value,
        category: document.getElementById('ti-cat').value.trim() || 'General', descr: document.getElementById('ti-descr').value.trim() });
      toast('Alert published — visible to all users now.', 'ok'); AdminView.loadTab();
    });
  },

  /* ---------------- SETTINGS ---------------- */
  async tab_settings(body) {
    const s = await API.admin.settings();
    body.innerHTML = `
      <div class="card">
        <div class="card-title">${Icons.bot} AI Engine (platform-wide)</div>
        <p class="hint" style="margin-bottom:12px">Keys are stored server-side, never exposed to users. The LLM gives a second opinion on email/SMS scans and powers the Assistant. Rules always run first; the higher risk wins.</p>
        <div class="set-row"><div class="set-body"><div class="set-title">Primary provider</div><div class="set-sub">Falls back to the other automatically if the primary fails</div></div>
          <div class="tabs" style="flex:none;padding:4px">
            <button class="tab ${s.llm_provider !== 'grok' ? 'active' : ''}" data-llm="gemini">Gemini</button>
            <button class="tab ${s.llm_provider === 'grok' ? 'active' : ''}" data-llm="grok">Grok</button>
          </div></div>
        <div class="grid grid-2" style="gap:12px;margin-top:12px">
          <div><label class="hint" style="display:block;margin-bottom:5px">Gemini API key ${s.gemini_key_set ? '· <b style="color:var(--green)">set</b> (' + s.gemini_key_masked + ')' : ''}</label>
            <input class="input" type="password" id="ad-gemini" placeholder="AIza…"></div>
          <div><label class="hint" style="display:block;margin-bottom:5px">Grok (x.ai) API key ${s.grok_key_set ? '· <b style="color:var(--green)">set</b> (' + s.grok_key_masked + ')' : ''}</label>
            <input class="input" type="password" id="ad-grok" placeholder="xai-…"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" style="width:auto" id="ad-save-key">Save Keys</button>
          <button class="btn btn-ghost btn-sm" id="ad-test-llm">🧪 Test LLM (credit-card phrase)</button>
        </div>
        <div id="llm-test-out" style="margin-top:10px"></div>
      </div>
      <div class="section-gap card">
        <div class="card-title">${Icons.settings} Platform</div>
        <div class="set-row"><div class="set-body"><div class="set-title">Developer mode</div>
          <div class="set-sub">Shows verify codes in API responses & error details. TURN OFF in production.</div></div>
          <label class="toggle"><input type="checkbox" id="ad-dev" ${s.dev_mode === '1' ? 'checked' : ''}><span class="tk"></span></label></div>
      </div>
      <div class="section-gap card">
        <div class="card-title">${Icons.info} Production Checklist</div>
        ${['Create MySQL DB "sentinel_ai" in phpMyAdmin — tables auto-migrate on first request',
           'Update api/bootstrap.php CFG mysql credentials for your XAMPP',
           'Change the default admin password (admin@sentinel.ai / Admin@1234)',
           'Turn OFF developer mode above',
           'Configure SMTP for verification & reset emails (marked TODO in api/index.php)',
           'Point Apache DocumentRoot at the project folder — .htaccess handles routing'].map(t =>
          `<div class="list-item" style="padding:8px 0"><div class="list-icon blue" style="width:26px;height:26px;border-radius:7px">${Icons.check}</div>
            <div class="list-sub" style="white-space:normal;color:var(--text)">${t}</div></div>`).join('')}
      </div>`;
    document.querySelectorAll('[data-llm]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.saveSettings({ llm_provider: b.dataset.llm });
      toast('Primary LLM: ' + b.dataset.llm.toUpperCase(), 'ok'); AdminView.loadTab();
    }));
    document.getElementById('ad-save-key').addEventListener('click', async () => {
      const g = document.getElementById('ad-gemini').value.trim();
      const x = document.getElementById('ad-grok').value.trim();
      if (!g && !x) return toast('Paste at least one key.', 'err');
      const payload = {};
      if (g) payload.gemini_api_key = g;
      if (x) payload.grok_api_key = x;
      await API.admin.saveSettings(payload);
      toast('AI keys saved — scanners now get LLM second opinions. 🔥', 'ok'); AdminView.loadTab();
    });
    document.getElementById('ad-test-llm').addEventListener('click', async () => {
      const out = document.getElementById('llm-test-out');
      out.innerHTML = '<div class="skel" style="height:60px"></div>';
      try {
        const r = await API.admin.testLLM();
        out.innerHTML = `<div class="card" style="padding:12px;background:var(--surface-2)">
          <div class="hint">Provider used: <b style="color:var(--green)">${esc(r.llm_used)}</b></div>
          <div style="font-size:13px;margin-top:6px">Verdict: <span class="pill ${r.result.verdict === 'danger' ? 'danger' : r.result.verdict === 'warn' ? 'warn' : 'safe'}">${r.result.verdict}</span> · Risk ${r.result.risk}/100</div>
          <div class="hint" style="margin-top:6px">${esc(r.result.explanation || '')}</div></div>`;
      } catch (e) { out.innerHTML = '<div class="hint" style="color:var(--red)">' + esc(e.message) + '</div>'; }
    });
    document.getElementById('ad-dev').addEventListener('change', async e => {
      await API.admin.saveSettings({ dev_mode: e.target.checked });
      toast('Developer mode ' + (e.target.checked ? 'ON' : 'OFF') + '.', 'ok');
    });
  },

  /* ---------------- ACADEMY ---------------- */
  async tab_academy(body) {
    const { items } = await API.getCourses();
    body.innerHTML = `
      <div class="card">
        <div class="card-title">${Icons.grad} Courses<span class="spacer"></span><span class="tag">${items.length}</span></div>
        ${items.map(c => `<div class="list-item">
          <div class="list-icon green">${Icons.grad}</div>
          <div class="list-body"><div class="list-title">${esc(c.title)}</div>
            <div class="list-sub">${c.level} · ${c.lesson_count} lessons · ${c.minutes} min</div></div>
          <button class="btn btn-ghost btn-sm" data-manage="${c.id}">Manage Content</button>
        </div>`).join('') || '<div class="hint">No courses yet.</div>'}
      </div>
      <div class="section-gap card">
        <div class="card-title">＋ New Course</div>
        <div class="grid grid-2" style="gap:10px">
          <input class="input" id="ac-title" placeholder="Course title">
          <div class="grid grid-2" style="gap:10px">
            <select class="input" id="ac-level"><option>beginner</option><option>intermediate</option><option>advanced</option></select>
            <input class="input" id="ac-min" type="number" value="45" min="5" placeholder="Minutes"></div>
        </div>
        <textarea class="input section-gap" id="ac-desc" placeholder="Short description…" style="min-height:60px"></textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="ac-add">Create Course</button></div>
      </div>
      <div id="ac-manage"></div>`;
    document.getElementById('ac-add').addEventListener('click', async () => {
      const t = document.getElementById('ac-title').value.trim();
      if (t.length < 4) return toast('Enter a course title.', 'err');
      await API.admin.addCourse({ title: t, level: document.getElementById('ac-level').value,
        minutes: +document.getElementById('ac-min').value, description: document.getElementById('ac-desc').value.trim(),
        cover: ['green','blue','red'][Math.floor(Math.random() * 3)] });
      toast('Course created — now add lessons via Manage Content.', 'ok'); AdminView.loadTab();
    });
    body.querySelectorAll('[data-manage]').forEach(b => b.addEventListener('click', () => AdminView.manageCourse(+b.dataset.manage)));
  },

  async manageCourse(cid) {
    const c = await API.getCourse(cid);
    const el = document.getElementById('ac-manage');
    el.innerHTML = `
      <div class="section-gap card">
        <div class="card-title">✏️ ${esc(c.title)} — Lessons</div>
        ${c.lessons.map(l => `<div class="list-item">
          <div class="list-icon blue" style="width:28px;height:28px;border-radius:8px"><span style="font-size:11px;font-weight:700">${l.position}</span></div>
          <div class="list-body"><div class="list-sub" style="color:var(--text)">${esc(l.title)}</div></div>
          <button class="btn btn-danger btn-sm" data-del-lesson="${l.id}" style="padding:4px 8px">${Icons.x}</button>
        </div>`).join('') || '<div class="hint">No lessons yet.</div>'}
        <div class="divider"></div>
        <input class="input" id="al-title" placeholder="Lesson title">
        <textarea class="input section-gap" id="al-body" placeholder="Lesson content (HTML allowed: <p>, <ul>, <b>…)" style="min-height:90px"></textarea>
        <input class="input section-gap" id="al-video" placeholder="Video embed URL (optional, e.g. https://www.youtube.com/embed/…)">
        <div style="display:flex;justify-content:flex-end;margin-top:10px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="al-add">Add Lesson</button></div>
      </div>
      <div class="section-gap card">
        <div class="card-title">📝 Quiz Questions (${c.quiz.length})</div>
        ${c.quiz.map(q => `<div class="list-item">
          <div class="list-body"><div class="list-sub" style="color:var(--text)">${esc(q.question)}</div></div>
          <button class="btn btn-danger btn-sm" data-del-quiz="${q.id}" style="padding:4px 8px">${Icons.x}</button>
        </div>`).join('') || '<div class="hint">No questions yet.</div>'}
        <div class="divider"></div>
        <input class="input" id="aq-q" placeholder="Question text">
        <div class="grid grid-2" style="gap:8px;margin-top:8px">
          ${[0,1,2,3].map(i => `<input class="input" id="aq-o${i}" placeholder="Option ${i + 1}">`).join('')}
        </div>
        <div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
          <select class="input" id="aq-correct" style="width:auto">${[0,1,2,3].map(i => `<option value="${i}">Correct: Option ${i + 1}</option>`).join('')}</select>
          <button class="btn btn-primary btn-sm" style="width:auto" id="aq-add">Add Question</button>
        </div>
      </div>`;
    el.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('al-add').addEventListener('click', async () => {
      const t = document.getElementById('al-title').value.trim();
      if (!t) return toast('Lesson title required.', 'err');
      await API.admin.addLesson(cid, { title: t, body_html: document.getElementById('al-body').value, video_url: document.getElementById('al-video').value.trim() });
      toast('Lesson added.', 'ok'); AdminView.manageCourse(cid);
    });
    el.querySelectorAll('[data-del-lesson]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.deleteLesson(b.dataset.delLesson); toast('Lesson removed.', 'ok'); AdminView.manageCourse(cid);
    }));
    document.getElementById('aq-add').addEventListener('click', async () => {
      const q = document.getElementById('aq-q').value.trim();
      const opts = [0,1,2,3].map(i => document.getElementById('aq-o' + i).value.trim()).filter(Boolean);
      if (!q || opts.length < 2) return toast('Question + at least 2 options required.', 'err');
      await API.admin.addQuiz(cid, { question: q, options: opts, correct_index: +document.getElementById('aq-correct').value });
      toast('Question added.', 'ok'); AdminView.manageCourse(cid);
    });
    el.querySelectorAll('[data-del-quiz]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.deleteQuiz(b.dataset.delQuiz); toast('Question removed.', 'ok'); AdminView.manageCourse(cid);
    }));
  },

  /* ---------------- COMMUNITY MODERATION ---------------- */
  async tab_community(body) {
    const d = await API.admin.community();
    body.innerHTML = `
      ${d.reports.length ? `<div class="card" style="border-color:rgba(255,77,109,.4)">
        <div class="card-title">⚑ Open Reports<span class="spacer"></span><span class="pill danger">${d.reports.length}</span></div>
        ${d.reports.map(r => `<div class="list-item">
          <div class="list-icon red">${Icons.alert}</div>
          <div class="list-body"><div class="list-sub" style="color:var(--text)">${r.post_id ? 'Post #' + r.post_id : 'Comment #' + r.comment_id} reported by ${esc(r.reporter)}</div>
            <div class="list-sub">Reason: ${esc(r.reason || 'not given')}</div></div>
          <div style="display:flex;gap:6px">
            ${r.post_id ? `<button class="btn btn-danger btn-sm" data-hide-post="${r.post_id}" data-resolve="${r.id}">Hide Post</button>` : ''}
            ${r.comment_id ? `<button class="btn btn-danger btn-sm" data-hide-comment="${r.comment_id}" data-resolve="${r.id}">Hide Comment</button>` : ''}
            <button class="btn btn-ghost btn-sm" data-dismiss="${r.id}">Dismiss</button>
          </div>
        </div>`).join('')}
      </div><div class="section-gap"></div>` : ''}
      <div class="card">
        <div class="card-title">${Icons.sms} All Posts<span class="spacer"></span><span class="tag">${d.posts.length}</span></div>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>Post</th><th>Author</th><th>💚</th><th>👁</th><th>Status</th><th></th></tr></thead>
          <tbody>${d.posts.map(p => `<tr style="${p.status !== 'active' ? 'opacity:.45' : ''}">
            <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b>${esc(p.title)}</b></td>
            <td>${esc(p.author)}</td><td>${p.likes}</td><td>${p.views}</td>
            <td><span class="pill ${p.status === 'active' ? 'safe' : 'danger'}">${p.status}</span></td>
            <td>${p.status === 'active'
              ? `<button class="btn btn-danger btn-sm" data-post-status="hidden" data-pid="${p.id}">Hide</button>`
              : `<button class="btn btn-ghost btn-sm" data-post-status="active" data-pid="${p.id}">Restore</button>`}</td>
          </tr>`).join('')}</tbody></table></div>
      </div>`;
    body.querySelectorAll('[data-post-status]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.setPostStatus(b.dataset.pid, b.dataset.postStatus); toast('Post updated.', 'ok'); AdminView.loadTab();
    }));
    body.querySelectorAll('[data-hide-post]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.setPostStatus(b.dataset.hidePost, 'hidden');
      await API.admin.resolveReport(b.dataset.resolve);
      toast('Post hidden & report resolved.', 'ok'); AdminView.loadTab();
    }));
    body.querySelectorAll('[data-hide-comment]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.setCommentStatus(b.dataset.hideComment, 'hidden');
      await API.admin.resolveReport(b.dataset.resolve);
      toast('Comment hidden & report resolved.', 'ok'); AdminView.loadTab();
    }));
    body.querySelectorAll('[data-dismiss]').forEach(b => b.addEventListener('click', async () => {
      await API.admin.resolveReport(b.dataset.dismiss); toast('Report dismissed.', 'ok'); AdminView.loadTab();
    }));
  },

  /* ---------------- ANNOUNCEMENTS ---------------- */
  async tab_announce(body) {
    const { items } = await API.admin.announcements();
    const freqLabel = { once: 'Once per user', daily: 'Once a day', twice_daily: 'Twice a day', every_open: 'Every app open' };
    body.innerHTML = `
      <div class="card">
        <div class="card-title">📣 Announcements</div>
        ${items.map(a => `<div class="list-item" style="${a.active ? '' : 'opacity:.45'}">
          <div class="list-icon ${a.level === 'danger' ? 'red' : a.level === 'warn' ? 'amber' : 'blue'}">${Icons.bell}</div>
          <div class="list-body"><div class="list-title">${esc(a.title)}</div>
            <div class="list-sub">${esc(a.category)} · ${freqLabel[a.frequency] || a.frequency}${a.start_at ? ' · from ' + a.start_at : ''}${a.end_at ? ' · until ' + a.end_at : ''}${a.media_url ? ' · 📎 ' + a.media_type : ''}</div></div>
          <label class="toggle" style="transform:scale(.85)"><input type="checkbox" data-an-toggle="${a.id}" ${a.active ? 'checked' : ''}><span class="tk"></span></label>
        </div>`).join('') || '<div class="hint">No announcements yet.</div>'}
      </div>
      <div class="section-gap card">
        <div class="card-title">＋ New Announcement</div>
        <div class="grid grid-2" style="gap:10px">
          <input class="input" id="an-title" placeholder="Title">
          <div class="grid grid-2" style="gap:10px">
            <input class="input" id="an-cat" placeholder="Category (e.g. Update)">
            <select class="input" id="an-level"><option value="info">Info</option><option value="warn">Warning</option><option value="danger">Critical</option></select>
          </div>
        </div>
        <textarea class="input section-gap" id="an-body" placeholder="Message…" style="min-height:80px"></textarea>
        <div class="grid grid-2" style="gap:10px;margin-top:10px">
          <input class="input" id="an-media" placeholder="Media URL (image/video link, optional)">
          <select class="input" id="an-mtype"><option value="">No media</option><option value="image">Image</option><option value="video">Video</option></select>
        </div>
        <div class="grid grid-3" style="gap:10px;margin-top:10px">
          <div><label class="hint" style="display:block;margin-bottom:4px">Show frequency</label>
            <select class="input" id="an-freq"><option value="once">Once per user</option><option value="daily">Once a day</option>
              <option value="twice_daily">Twice a day</option><option value="every_open">Every app open</option></select></div>
          <div><label class="hint" style="display:block;margin-bottom:4px">Start (optional)</label>
            <input class="input" type="datetime-local" id="an-start"></div>
          <div><label class="hint" style="display:block;margin-bottom:4px">End (optional)</label>
            <input class="input" type="datetime-local" id="an-end"></div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="an-add">📣 Publish Announcement</button></div>
      </div>`;
    body.querySelectorAll('[data-an-toggle]').forEach(t => t.addEventListener('change', async () => {
      await API.admin.toggleAnnouncement(t.dataset.anToggle, t.checked);
      toast('Announcement ' + (t.checked ? 'activated' : 'deactivated') + '.', 'ok');
    }));
    document.getElementById('an-add').addEventListener('click', async () => {
      const title = document.getElementById('an-title').value.trim();
      if (!title) return toast('Enter a title.', 'err');
      await API.admin.addAnnouncement({
        title, body: document.getElementById('an-body').value.trim(),
        category: document.getElementById('an-cat').value.trim() || 'General',
        level: document.getElementById('an-level').value,
        media_url: document.getElementById('an-media').value.trim(),
        media_type: document.getElementById('an-mtype').value,
        frequency: document.getElementById('an-freq').value,
        start_at: (document.getElementById('an-start').value || '').replace('T', ' '),
        end_at: (document.getElementById('an-end').value || '').replace('T', ' '),
      });
      toast('Announcement published.', 'ok'); AdminView.loadTab();
    });
  },
};