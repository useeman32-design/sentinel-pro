/* ============================================================
   SENTINEL AI — Auth views: login, register, forgot, verify, reset
   ============================================================ */

const AuthViews = {
  _wrap(inner) {
    return `<div class="auth-wrap"><div class="auth-card">
      <div class="auth-logo">${logoSVG(42)}<span class="brand">SENTINEL <em>AI</em></span></div>
      ${inner}
    </div></div>`;
  },

  login() {
    return AuthViews._wrap(`
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-sub">Detect. Protect. Prevent. — Sign in to your security command center.</p>
      <form id="login-form">
        <div class="field"><label>Email address</label>
          <input class="input" type="email" name="email" placeholder="you@company.com" required autocomplete="email"></div>
        <div class="field"><label>Password</label>
          <div class="input-row">
            <input class="input" type="password" name="password" placeholder="••••••••••" required autocomplete="current-password">
            <button type="button" class="input-eye" data-eye>${Icons.eye}</button>
          </div></div>
        <div class="auth-links">
          <label class="check"><input type="checkbox" name="remember" checked> Remember me</label>
          <a href="#/forgot">Forgot password?</a>
        </div>
        <button class="btn btn-primary" type="submit" id="login-btn">Sign In</button>
      </form>
      <div class="auth-alt">OR CONTINUE WITH</div>
      <button class="btn btn-ghost btn-block" id="google-btn"><span style="width:18px;height:18px;display:inline-flex">${Icons.google}</span> Sign in with Google</button>
      <p class="auth-foot">New to Sentinel AI? <a href="#/register">Create an account</a></p>
    `);
  },

  register() {
    return AuthViews._wrap(`
      <h1 class="auth-title">Create your account</h1>
      <p class="auth-sub">Join thousands protecting Nigeria's digital economy.</p>
      <form id="register-form">
        <div class="field"><label>Full name</label>
          <input class="input" type="text" name="name" placeholder="Adaeze Okafor" required autocomplete="name"></div>
        <div class="field"><label>Email address</label>
          <input class="input" type="email" name="email" placeholder="you@company.com" required autocomplete="email"></div>
        <div class="field"><label>Password</label>
          <div class="input-row">
            <input class="input" type="password" name="password" placeholder="Min. 8 characters" required minlength="8" autocomplete="new-password">
            <button type="button" class="input-eye" data-eye>${Icons.eye}</button>
          </div>
          <div class="meter-track" style="margin-top:8px"><div class="meter-fill" id="reg-pw-meter" style="width:0%"></div></div>
          <div class="hint" id="reg-pw-hint" style="margin-top:5px"></div>
        </div>
        <div class="field"><label class="check"><input type="checkbox" required> I agree to the <a href="#" onclick="toast('Terms of Service — coming soon','info');return false">Terms</a> &amp; <a href="#" onclick="toast('Privacy Policy — coming soon','info');return false">Privacy Policy</a></label></div>
        <button class="btn btn-primary" type="submit" id="register-btn">Create Account</button>
      </form>
      <div class="auth-alt">OR CONTINUE WITH</div>
      <button class="btn btn-ghost btn-block" id="google-btn"><span style="width:18px;height:18px;display:inline-flex">${Icons.google}</span> Sign up with Google</button>
      <p class="auth-foot">Already have an account? <a href="#/login">Sign in</a></p>
    `);
  },

  forgot() {
    return AuthViews._wrap(`
      <h1 class="auth-title">Reset your password</h1>
      <p class="auth-sub">Enter the email linked to your account and we'll send a reset link.</p>
      <form id="forgot-form">
        <div class="field"><label>Email address</label>
          <input class="input" type="email" name="email" placeholder="you@company.com" required></div>
        <button class="btn btn-primary" type="submit" id="forgot-btn">Send Reset Link</button>
      </form>
      <p class="auth-foot"><a href="#/login">← Back to sign in</a></p>
    `);
  },

  verify() {
    return AuthViews._wrap(`
      <h1 class="auth-title">Verify your email</h1>
      <p class="auth-sub">We sent a 6-digit code to <b>${esc(State.pendingEmail || 'your email')}</b>.<br>Enter it below to activate your account.${State.devCode ? '<br><span class="tag" style="margin-top:6px;display:inline-block">DEV MODE — your code: ' + State.devCode + '</span>' : ''}</p>
      <form id="verify-form">
        <div class="otp-row">
          ${Array.from({ length: 6 }, (_, i) => `<input class="otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]" data-otp="${i}">`).join('')}
        </div>
        <button class="btn btn-primary" type="submit" id="verify-btn">Verify Email</button>
      </form>
      <p class="auth-foot">Didn't receive it? <a href="#" id="resend-link">Resend code</a></p>
    `);
  },

  reset() {
    return AuthViews._wrap(`
      <h1 class="auth-title">Choose a new password</h1>
      <p class="auth-sub">Make it long, unique, and yours alone.</p>
      <form id="reset-form">
        <div class="field"><label>New password</label>
          <div class="input-row">
            <input class="input" type="password" name="password" placeholder="Min. 8 characters" required minlength="8">
            <button type="button" class="input-eye" data-eye>${Icons.eye}</button>
          </div></div>
        <div class="field"><label>Confirm new password</label>
          <input class="input" type="password" name="confirm" placeholder="Repeat password" required></div>
        <button class="btn btn-primary" type="submit" id="reset-btn">Update Password</button>
      </form>
      <p class="auth-foot"><a href="#/login">← Back to sign in</a></p>
    `);
  },

  bind(route) {
    document.querySelectorAll('[data-eye]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? Icons.eyeOff : Icons.eye;
      });
    });

    const google = document.getElementById('google-btn');
    if (google) google.addEventListener('click', () => {
      toast('Google OAuth will be wired to the PHP backend (/api/auth/google).', 'info');
    });

    if (route === 'login') {
      document.getElementById('login-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const btn = document.getElementById('login-btn');
        btn.disabled = true; btn.textContent = 'Signing in…';
        try {
          const res = await API.login(f.get('email'), f.get('password'));
          App.setSession(res.user, res.token);
          toast('Welcome back, ' + res.user.name.split(' ')[0] + '!', 'ok');
          location.hash = res.user.role === 'admin' ? '#/admin' : '#/dashboard';
        } catch (e) { toast(e.message, 'err'); }
        btn.disabled = false; btn.textContent = 'Sign In';
      });
    }

    if (route === 'register') {
      const pwInput = document.querySelector('#register-form [name=password]');
      pwInput.addEventListener('input', () => {
        const r = Sim.passwordCheck(pwInput.value);
        const m = document.getElementById('reg-pw-meter');
        m.style.width = r.score + '%';
        m.style.background = r.score >= 60 ? 'linear-gradient(90deg,var(--green),var(--blue))' : r.score >= 30 ? 'var(--amber)' : 'var(--red)';
        document.getElementById('reg-pw-hint').textContent = pwInput.value ? `Strength: ${r.label} · crack time ≈ ${r.crackTime}` : '';
      });
      document.getElementById('register-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = new FormData(e.target);
        const btn = document.getElementById('register-btn');
        btn.disabled = true; btn.textContent = 'Creating account…';
        try {
          const res = await API.register(f.get('name'), f.get('email'), f.get('password'));
          App.setSession(res.user, res.token);
          State.pendingEmail = f.get('email');
          if (res.dev_verify_code) State.devCode = res.dev_verify_code;
          toast('Account created! Enter the verification code.', 'ok');
          location.hash = '#/verify';
        } catch (e) { toast(e.message, 'err'); }
        btn.disabled = false; btn.textContent = 'Create Account';
      });
    }

    if (route === 'forgot') {
      document.getElementById('forgot-form').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('forgot-btn');
        btn.disabled = true; btn.textContent = 'Sending…';
        await API.forgotPassword(new FormData(e.target).get('email'));
        btn.disabled = false; btn.textContent = 'Send Reset Link';
        toast('If that email exists, a reset link is on its way. (Demo: continuing to reset page)', 'ok');
        setTimeout(() => location.hash = '#/reset', 1200);
      });
    }

    if (route === 'verify') {
      const boxes = [...document.querySelectorAll('[data-otp]')];
      boxes[0]?.focus();
      boxes.forEach((b, i) => {
        b.addEventListener('input', () => {
          b.value = b.value.replace(/\D/g, '');
          if (b.value && i < 5) boxes[i + 1].focus();
        });
        b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus(); });
        b.addEventListener('paste', e => {
          const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
          if (digits.length) { e.preventDefault(); digits.split('').forEach((d, j) => { if (boxes[j]) boxes[j].value = d; }); boxes[Math.min(digits.length, 5)].focus(); }
        });
      });
      document.getElementById('resend-link').addEventListener('click', e => { e.preventDefault(); toast('New code sent to ' + (State.pendingEmail || 'your email'), 'ok'); });
      document.getElementById('verify-form').addEventListener('submit', async e => {
        e.preventDefault();
        const code = boxes.map(b => b.value).join('');
        if (code.length < 6) return toast('Please enter the full 6-digit code.', 'err');
        const btn = document.getElementById('verify-btn');
        btn.disabled = true; btn.textContent = 'Verifying…';
        try {
          await API.verifyEmail(code);
          if (State.user) { State.user.verified = 1; localStorage.setItem('sentinel_user', JSON.stringify(State.user)); }
          toast('Email verified. Welcome to Sentinel AI! 🛡️', 'ok');
          location.hash = '#/dashboard';
        } catch (e) { toast(e.message, 'err'); }
        btn.disabled = false; btn.textContent = 'Verify Email';
      });
    }

    if (route === 'reset') {
      document.getElementById('reset-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = new FormData(e.target);
        if (f.get('password') !== f.get('confirm')) return toast('Passwords do not match.', 'err');
        const btn = document.getElementById('reset-btn');
        btn.disabled = true; btn.textContent = 'Updating…';
        await API.resetPassword('demo-token', f.get('password'));
        toast('Password updated. Sign in with your new password.', 'ok');
        location.hash = '#/login';
      });
    }
  },
};
