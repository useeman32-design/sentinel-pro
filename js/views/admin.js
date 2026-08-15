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
      ['blocklist', 'Blocklist'], ['intel', 'Threat Intel'], ['settings', 'Settings'],
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
        <div class="card-title">${Icons.bot} Gemini AI (platform-wide)</div>
        <p class="hint" style="margin-bottom:12px">The key is stored server-side and never exposed to users. It powers the AI Assistant for everyone.</p>
        <div class="input-row" style="max-width:460px">
          <input class="input" type="password" id="ad-gemini" placeholder="${s.gemini_key_set ? s.gemini_key_masked + ' (set — enter new to replace)' : 'AIza… paste Gemini API key'}">
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary btn-sm" style="width:auto" id="ad-save-key">Save Key</button>
          ${s.gemini_key_set ? '<button class="btn btn-danger btn-sm" id="ad-clear-key">Remove Key</button>' : ''}
        </div>
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
    document.getElementById('ad-save-key').addEventListener('click', async () => {
      const v = document.getElementById('ad-gemini').value.trim();
      if (!v) return toast('Paste a key first.', 'err');
      await API.admin.saveSettings({ gemini_api_key: v });
      toast('Gemini key saved — AI Assistant is now live for all users. 🔥', 'ok'); AdminView.loadTab();
    });
    document.getElementById('ad-clear-key')?.addEventListener('click', async () => {
      await API.admin.saveSettings({ gemini_api_key: '' }); toast('Key removed.', 'info'); AdminView.loadTab();
    });
    document.getElementById('ad-dev').addEventListener('change', async e => {
      await API.admin.saveSettings({ dev_mode: e.target.checked });
      toast('Developer mode ' + (e.target.checked ? 'ON' : 'OFF') + '.', 'ok');
    });
  },
};
