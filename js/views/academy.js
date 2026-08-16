/* ============================================================
   SENTINEL AI — Cyber Academy (real courses) + Community
   + Announcement popups
   ============================================================ */

const Academy = {
  /* ---------------- COURSE LIST ---------------- */
  list() { return `<div id="academy-root">${'<div class="skel" style="height:150px;margin-bottom:12px"></div>'.repeat(2)}</div>`; },

  async bindList() {
    let data;
    try { data = await API.getCourses(); } catch (e) { toast(e.message, 'err'); return; }
    const root = document.getElementById('academy-root');
    if (!root) return;
    const covers = { green: 'linear-gradient(135deg,#059669,#00C8FF)', blue: 'linear-gradient(135deg,#2563EB,#7C3AED)', red: 'linear-gradient(135deg,#DC2626,#F59E0B)' };
    root.innerHTML = data.items.length ? `<div class="grid grid-3">
      ${data.items.map((c, i) => `<div class="card course-card" style="animation-delay:${i * 70}ms">
        <div class="course-banner" style="background:${covers[c.cover] || covers.green}">${Icons.grad}</div>
        <div class="course-body">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="pill ${c.level === 'beginner' ? 'safe' : c.level === 'intermediate' ? 'info' : 'danger'}">${esc(c.level)}</span>
            <span class="hint">${c.minutes} min</span></div>
          <div class="course-title">${esc(c.title)}</div>
          <p class="hint" style="font-size:12.5px">${esc(c.description || '')}</p>
          <div class="course-meta"><span>📚 ${c.lesson_count} lessons</span><span>📝 Quiz</span>${c.certificate_ref ? '<span>🏆 Certified</span>' : ''}</div>
          <div class="meter-row" style="margin:4px 0 2px"><div class="m-head"><b>Progress</b><span>${c.progress}%</span></div>
            <div class="meter-track"><div class="meter-fill" style="width:${c.progress}%"></div></div></div>
          <a class="btn ${c.progress > 0 ? 'btn-ghost' : 'btn-primary'} btn-sm" href="#/course?id=${c.id}">${c.progress >= 100 ? '🏆 Review & Certificate' : c.progress > 0 ? '▶ Continue Course' : '▶ Start Course'}</a>
        </div></div>`).join('')}
    </div>` : `<div class="empty">${Icons.grad}<div style="font-weight:600;color:var(--text)">No courses published yet</div><div class="hint" style="margin-top:4px">The admin can add courses from the Admin Panel.</div></div>`;
  },

  /* ---------------- COURSE DETAIL ---------------- */
  course: null,
  lessonIdx: 0,
  mode: 'lesson', // lesson | quiz | done

  detail() { return `<div id="course-root"><div class="skel" style="height:300px"></div></div>`; },

  async bindDetail() {
    const id = new URLSearchParams((location.hash.split('?')[1] || '')).get('id');
    let c;
    try { c = await API.getCourse(id); } catch (e) { toast(e.message, 'err'); location.hash = '#/training'; return; }
    Academy.course = c;
    const doneSet = new Set(c.my.lessons_done);
    Academy.lessonIdx = Math.max(0, c.lessons.findIndex(l => !doneSet.has(l.id)));
    if (Academy.lessonIdx === -1) Academy.lessonIdx = 0;
    Academy.mode = c.my.completed_at ? 'done' : 'lesson';
    Academy.renderCourse();
  },

  renderCourse() {
    const c = Academy.course;
    const root = document.getElementById('course-root');
    if (!root || !c) return;
    const doneSet = new Set(c.my.lessons_done);
    const allDone = c.lessons.every(l => doneSet.has(l.id));

    root.innerHTML = `
      <div class="grid grid-main" style="align-items:start">
        <div class="card" id="course-main"></div>
        <div class="card">
          <div class="card-title">${Icons.grad} ${esc(c.title)}</div>
          ${c.lessons.map((l, i) => `
            <div class="list-item" style="cursor:pointer;${i === Academy.lessonIdx && Academy.mode === 'lesson' ? 'background:var(--surface-2);border-radius:10px;padding-left:8px' : ''}" data-lesson="${i}">
              <div class="list-icon ${doneSet.has(l.id) ? 'green' : 'blue'}" style="width:30px;height:30px;border-radius:9px">${doneSet.has(l.id) ? Icons.check : `<span style="font-size:12px;font-weight:700">${i + 1}</span>`}</div>
              <div class="list-body"><div class="list-sub" style="color:var(--text)">${esc(l.title)}</div></div>
            </div>`).join('')}
          <div class="list-item" style="cursor:pointer;${Academy.mode !== 'lesson' ? 'background:var(--surface-2);border-radius:10px;padding-left:8px' : ''}" id="goto-quiz">
            <div class="list-icon ${c.my.completed_at ? 'green' : 'amber'}" style="width:30px;height:30px;border-radius:9px">${c.my.completed_at ? Icons.check : Icons.report}</div>
            <div class="list-body"><div class="list-sub" style="color:var(--text)">Final Quiz ${c.my.quiz_score !== null ? `(best: ${c.my.quiz_score}%)` : ''}</div></div>
          </div>
        </div>
      </div>`;

    const main = document.getElementById('course-main');
    if (Academy.mode === 'done') {
      main.innerHTML = Academy.certificateHTML(c);
      document.getElementById('cert-print')?.addEventListener('click', () => Academy.printCertificate(c));
    } else if (Academy.mode === 'quiz') {
      main.innerHTML = `
        <div class="card-title">${Icons.report} Final Quiz<span class="spacer"></span><span class="tag">Pass: 70%+</span></div>
        ${!allDone ? `<p class="hint" style="margin-bottom:12px">⚠️ Tip: complete all lessons first for the best shot.</p>` : ''}
        <form id="quiz-form">
          ${c.quiz.map((q, qi) => `<div style="margin-bottom:18px">
            <div style="font-weight:600;font-size:14px;margin-bottom:9px">${qi + 1}. ${esc(q.question)}</div>
            ${q.options.map((o, oi) => `<label class="check" style="display:flex;padding:7px 4px">
              <input type="radio" name="q${qi}" value="${oi}" required> <span style="font-size:13.5px">${esc(o)}</span></label>`).join('')}
          </div>`).join('')}
          <button class="btn btn-primary" type="submit">Submit Quiz</button>
        </form>`;
      document.getElementById('quiz-form').addEventListener('submit', async e => {
        e.preventDefault();
        const answers = c.quiz.map((_, qi) => +new FormData(e.target).get('q' + qi));
        try {
          const r = await API.submitQuiz(c.id, answers);
          if (r.passed) {
            toast(`🏆 Passed with ${r.score}%! Certificate ${r.certificate_ref} earned.`, 'ok', 5000);
            c.my.completed_at = new Date().toISOString();
            c.my.quiz_score = r.score;
            c.my.certificate_ref = r.certificate_ref;
            Academy.mode = 'done';
          } else {
            toast(`You scored ${r.score}% (${r.correct}/${r.total}). Need 70% — review the lessons and retry!`, 'err', 5000);
            c.my.quiz_score = r.score;
          }
          Academy.renderCourse();
        } catch (e2) { toast(e2.message, 'err'); }
      });
    } else {
      const l = c.lessons[Academy.lessonIdx];
      const isDone = doneSet.has(l.id);
      main.innerHTML = `
        <div class="card-title"><span class="tag">Lesson ${Academy.lessonIdx + 1}/${c.lessons.length}</span><span class="spacer"></span>${isDone ? '<span class="pill safe">✓ Completed</span>' : ''}</div>
        <h2 style="font-family:var(--font-display);font-size:19px;margin-bottom:12px">${esc(l.title)}</h2>
        ${l.video_url ? `<div style="margin-bottom:14px;border-radius:12px;overflow:hidden"><iframe src="${esc(l.video_url)}" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe></div>` : ''}
        <div class="lesson-body" style="font-size:14px;line-height:1.7;color:var(--text-dim)">${l.body_html || ''}</div>
        <div class="divider"></div>
        <div style="display:flex;gap:10px;justify-content:space-between">
          <button class="btn btn-ghost btn-sm" id="prev-lesson" ${Academy.lessonIdx === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="btn btn-primary btn-sm" style="width:auto" id="next-lesson">${isDone ? (Academy.lessonIdx < c.lessons.length - 1 ? 'Next →' : 'Go to Quiz →') : 'Mark Complete & Continue →'}</button>
        </div>`;
      document.getElementById('prev-lesson').addEventListener('click', () => { Academy.lessonIdx--; Academy.renderCourse(); });
      document.getElementById('next-lesson').addEventListener('click', async () => {
        if (!doneSet.has(l.id)) {
          try { await API.lessonDone(c.id, l.id); c.my.lessons_done.push(l.id); } catch (e) { return toast(e.message, 'err'); }
        }
        if (Academy.lessonIdx < c.lessons.length - 1) Academy.lessonIdx++;
        else Academy.mode = 'quiz';
        Academy.renderCourse();
      });
    }
    root.querySelectorAll('[data-lesson]').forEach(el => el.addEventListener('click', () => {
      Academy.lessonIdx = +el.dataset.lesson; Academy.mode = 'lesson'; Academy.renderCourse();
    }));
    document.getElementById('goto-quiz').addEventListener('click', () => {
      Academy.mode = Academy.course.my.completed_at ? 'done' : 'quiz'; Academy.renderCourse();
    });
  },

  certificateHTML(c) {
    return `
      <div style="text-align:center;padding:20px 8px">
        <div style="font-size:44px;margin-bottom:8px">🏆</div>
        <h2 style="font-family:var(--font-display);font-size:20px">Course Complete!</h2>
        <p class="hint" style="margin:8px 0 4px">You passed <b style="color:var(--text)">${esc(c.title)}</b> with ${c.my.quiz_score}%.</p>
        <div class="tag" style="font-size:13px;padding:6px 14px;margin:10px 0;display:inline-block">Certificate: <b style="color:var(--green)">${esc(c.my.certificate_ref || '')}</b></div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" style="width:auto" id="cert-print">${Icons.download} Download Certificate</button>
          <a class="btn btn-ghost btn-sm" href="#/training">← All Courses</a>
        </div>
      </div>`;
  },

  printCertificate(c) {
    const u = State.user || { name: 'Student' };
    const w = window.open('', '_blank');
    if (!w) return toast('Allow popups to download the certificate.', 'err');
    w.document.write(`<!DOCTYPE html><html><head><title>Certificate — ${esc(c.my.certificate_ref)}</title><style>
      body{font-family:Georgia,serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0B1220}
      .cert{width:820px;padding:60px;background:#fffef8;border:3px double #b08d2e;text-align:center;position:relative}
      .brand{font-family:Arial;font-weight:800;letter-spacing:3px;color:#0B1220;font-size:14px}
      .brand span{color:#00A857}
      h1{font-size:34px;margin:24px 0 6px;color:#1a2332}
      .name{font-size:30px;color:#b08d2e;margin:18px 0;font-style:italic}
      .course{font-size:18px;color:#333}
      .score{margin-top:10px;color:#555;font-size:14px}
      .ref{margin-top:28px;font-family:monospace;font-size:12px;color:#888}
      .line{width:200px;border-top:1px solid #999;margin:40px auto 6px}
      .sig{font-size:12px;color:#666}
      @media print{body{background:#fff}}
    </style></head><body><div class="cert">
      <div class="brand">🛡️ SENTINEL <span>AI</span> — CYBER ACADEMY</div>
      <h1>Certificate of Completion</h1>
      <div>This certifies that</div>
      <div class="name">${esc(u.name)}</div>
      <div>has successfully completed</div>
      <div class="course"><b>${esc(c.title)}</b></div>
      <div class="score">Final score: ${c.my.quiz_score}% · ${new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="line"></div><div class="sig">Sentinel AI — Detect. Protect. Prevent.</div>
      <div class="ref">Verification: ${esc(c.my.certificate_ref || '')}</div>
    </div><script>window.print()<\/script></body></html>`);
    w.document.close();
  },
};

/* ============================================================
   COMMUNITY
   ============================================================ */
const Community = {
  list() {
    return `
      <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
        <div class="search-bar" style="flex:1;min-width:200px">${Icons.search}<input class="input" id="cm-search" placeholder="Search community…"></div>
        <select class="input" id="cm-cat" style="width:auto"><option value="">All Topics</option>
          <option>Scam Alert</option><option>Question</option><option>News</option><option>Tip</option><option>General</option></select>
        <button class="btn btn-primary btn-sm" style="width:auto" id="cm-new">＋ New Post</button>
      </div>
      <div id="cm-list">${'<div class="skel" style="height:90px;margin-bottom:10px"></div>'.repeat(3)}</div>`;
  },

  async bindList() {
    const load = async () => {
      const listEl = document.getElementById('cm-list');
      if (!listEl) return;
      try {
        const { items } = await API.getPosts({ q: document.getElementById('cm-search').value.trim(), category: document.getElementById('cm-cat').value });
        listEl.innerHTML = items.length ? items.map((p, i) => `
          <div class="card" style="margin-bottom:10px;animation-delay:${i * 50}ms;cursor:pointer" data-post="${p.id}">
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
              <div class="avatar" style="width:32px;height:32px;font-size:12px">${esc((p.author || 'U')[0].toUpperCase())}</div>
              <div style="flex:1;min-width:0"><b style="font-size:13px">${esc(p.author)}</b>
                <span class="hint"> · ${(p.created_at || '').slice(0, 16).replace('T', ' ')}</span></div>
              <span class="tag">${esc(p.category)}</span>
            </div>
            <div style="font-weight:700;font-size:15px;margin-bottom:5px">${esc(p.title)}</div>
            <div class="hint" style="font-size:13px;max-height:40px;overflow:hidden">${esc((p.body || '').slice(0, 160))}</div>
            <div style="display:flex;gap:16px;margin-top:10px;font-size:12.5px;color:var(--text-dim)">
              <span>${p.liked ? '💚' : '🤍'} ${p.likes}</span><span>💬 ${p.comment_count}</span><span>👁 ${p.views}</span>
            </div>
          </div>`).join('')
          : `<div class="empty">${Icons.sms}<div style="font-weight:600;color:var(--text)">No posts yet</div><div class="hint" style="margin-top:4px">Be the first to share a scam alert or security tip!</div></div>`;
        listEl.querySelectorAll('[data-post]').forEach(el => el.addEventListener('click', () => { location.hash = '#/post?id=' + el.dataset.post; }));
      } catch (e) { toast(e.message, 'err'); }
    };
    load();
    document.getElementById('cm-search').addEventListener('input', () => { clearTimeout(Community._t); Community._t = setTimeout(load, 350); });
    document.getElementById('cm-cat').addEventListener('change', load);
    document.getElementById('cm-new').addEventListener('click', () => Community.newPostModal(load));
  },

  newPostModal(onDone) {
    const scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    scrim.innerHTML = `<div class="modal" style="max-width:480px">
      <div class="modal-head"><div class="list-icon green" style="flex:none">${Icons.sms}</div><h3>Share with the Community</h3>
        <button class="modal-close">${Icons.x}</button></div>
      <div class="modal-body">
        <div class="field"><label>Title</label><input class="input" id="np-title" placeholder="e.g. New WhatsApp scam targeting students" maxlength="200"></div>
        <div class="field"><label>Category</label><select class="input" id="np-cat">
          <option>Scam Alert</option><option>Question</option><option>News</option><option>Tip</option><option>General</option></select></div>
        <div class="field"><label>Details</label><textarea class="input" id="np-body" placeholder="Describe what happened, what to watch out for…" style="min-height:110px" maxlength="5000"></textarea></div>
        <button class="btn btn-primary btn-block" id="np-save">Post to Community</button>
      </div></div>`;
    const close = () => scrim.remove();
    scrim.addEventListener('click', e => { if (e.target === scrim) close(); });
    scrim.querySelector('.modal-close').addEventListener('click', close);
    document.body.appendChild(scrim);
    scrim.querySelector('#np-save').addEventListener('click', async () => {
      try {
        await API.createPost({ title: scrim.querySelector('#np-title').value.trim(), body: scrim.querySelector('#np-body').value.trim(), category: scrim.querySelector('#np-cat').value });
        toast('Posted! Thanks for keeping the community safe. 🛡️', 'ok');
        close(); onDone && onDone();
      } catch (e) { toast(e.message, 'err'); }
    });
  },

  /* ---------------- POST DETAIL ---------------- */
  detail() { return `<div id="post-root"><div class="skel" style="height:260px"></div></div>`; },

  async bindDetail() {
    const id = new URLSearchParams((location.hash.split('?')[1] || '')).get('id');
    const root = document.getElementById('post-root');
    let p;
    try { p = await API.getPost(id); } catch (e) { toast(e.message, 'err'); location.hash = '#/community'; return; }
    root.innerHTML = `
      <a class="card-link" href="#/community" style="display:inline-block;margin-bottom:10px">← Community</a>
      <div class="card">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
          <div class="avatar" style="width:38px;height:38px;font-size:14px">${esc((p.author || 'U')[0].toUpperCase())}</div>
          <div style="flex:1;min-width:0"><b>${esc(p.author)}</b><div class="hint">${(p.created_at || '').slice(0, 16).replace('T', ' ')} · ${esc(p.category)}</div></div>
          <button class="btn btn-ghost btn-sm" id="p-report" title="Report">⚑</button>
        </div>
        <h2 style="font-family:var(--font-display);font-size:18px;margin-bottom:8px">${esc(p.title)}</h2>
        <p style="font-size:14px;line-height:1.65;color:var(--text-dim);white-space:pre-wrap">${esc(p.body || '')}</p>
        <div style="display:flex;gap:12px;margin-top:14px">
          <button class="btn btn-ghost btn-sm" id="p-like">${p.liked ? '💚 Liked' : '🤍 Like'} (${p.likes})</button>
          <span class="btn btn-ghost btn-sm" style="cursor:default">👁 ${p.views}</span>
        </div>
      </div>
      <div class="section-gap card">
        <div class="card-title">💬 Comments (${p.comments.length})</div>
        <div id="comments-list">
          ${p.comments.map(cm => `
            <div class="list-item">
              <div class="avatar" style="width:30px;height:30px;font-size:11px;flex:none">${esc((cm.author || 'U')[0].toUpperCase())}</div>
              <div class="list-body">
                <div style="font-size:12.5px"><b>${esc(cm.author)}</b>${cm.role === 'admin' ? ' <span class="pill info" style="font-size:9px;padding:2px 7px">ADMIN</span>' : ''} <span class="hint">· ${(cm.created_at || '').slice(5, 16).replace('T', ' ')}</span></div>
                <div style="font-size:13.5px;margin-top:3px;white-space:pre-wrap">${esc(cm.body)}</div>
              </div>
              <button class="icon-btn" style="width:28px;height:28px;flex:none" data-report-comment="${cm.id}" title="Report">⚑</button>
            </div>`).join('') || '<div class="hint" style="padding:8px 0">No comments yet — start the conversation.</div>'}
        </div>
        <div class="chat-input-bar" style="padding-top:14px">
          <input class="input" id="cm-input" placeholder="Add a comment…" maxlength="2000">
          <button class="send-btn" id="cm-send">${Icons.send}</button>
        </div>
      </div>`;
    document.getElementById('p-like').addEventListener('click', async () => {
      try { await API.likePost(p.id); Community.bindDetail(); } catch (e) { toast(e.message, 'err'); }
    });
    document.getElementById('p-report').addEventListener('click', async () => {
      const reason = prompt('Why are you reporting this post?');
      if (reason === null) return;
      try { await API.reportPost(p.id, reason); toast('Reported — moderators will review it.', 'ok'); } catch (e) { toast(e.message, 'err'); }
    });
    root.querySelectorAll('[data-report-comment]').forEach(b => b.addEventListener('click', async () => {
      const reason = prompt('Why are you reporting this comment?');
      if (reason === null) return;
      try { await API.reportComment(b.dataset.reportComment, reason); toast('Comment reported.', 'ok'); } catch (e) { toast(e.message, 'err'); }
    }));
    const send = async () => {
      const v = document.getElementById('cm-input').value.trim();
      if (!v) return;
      try { await API.addComment(p.id, v); Community.bindDetail(); } catch (e) { toast(e.message, 'err'); }
    };
    document.getElementById('cm-send').addEventListener('click', send);
    document.getElementById('cm-input').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  },
};

/* ============================================================
   ANNOUNCEMENTS — popup on app open
   ============================================================ */
const Announcements = {
  shown: false,
  async check() {
    if (Announcements.shown || !State.user) return;
    Announcements.shown = true;
    try {
      const { items } = await API.pendingAnnouncements();
      if (items.length) Announcements.show(items[0]);
    } catch (e) { /* silent */ }
  },
  show(a) {
    const scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    const levelPill = a.level === 'danger' ? 'danger' : a.level === 'warn' ? 'warn' : 'info';
    scrim.innerHTML = `<div class="modal" style="max-width:440px">
      <div class="modal-head">
        <div style="width:38px;height:38px;flex:none">${logoSVG(38)}</div>
        <h3>${esc(a.title)}<div style="margin-top:5px;display:flex;gap:7px"><span class="pill ${levelPill}"><span class="pdot"></span>${esc(a.category || 'Announcement')}</span><span class="tag">Official — Sentinel AI</span></div></h3>
        <button class="modal-close">${Icons.x}</button>
      </div>
      <div class="modal-body">
        ${a.media_url && a.media_type === 'image' ? `<img src="${esc(a.media_url)}" style="width:100%;border-radius:12px;margin-bottom:12px" alt="">` : ''}
        ${a.media_url && a.media_type === 'video' ? `<video src="${esc(a.media_url)}" style="width:100%;border-radius:12px;margin-bottom:12px" controls></video>` : ''}
        <p style="white-space:pre-wrap">${esc(a.body || '')}</p>
        <div class="modal-actions" style="margin-top:16px">
          <button class="btn btn-primary" id="an-ok">Got it</button>
          <button class="btn btn-ghost" id="an-dismiss">Don't show again</button>
        </div>
      </div></div>`;
    const close = async (dismiss) => { scrim.remove(); try { await API.announcementSeen(a.id, dismiss); } catch (e) {} };
    scrim.querySelector('.modal-close').addEventListener('click', () => close(false));
    scrim.querySelector('#an-ok').addEventListener('click', () => close(false));
    scrim.querySelector('#an-dismiss').addEventListener('click', () => close(true));
    document.body.appendChild(scrim);
  },
};
