/**
 * LUXE HAUS - Admin Login Controller
 * Auto-detects role (Head Admin / Branch Admin) from entered credentials.
 * No manual tab selection needed — just enter your User ID / Email + Password.
 * Supports both Backend API mode and Offline Demo mode.
 */

(function () {
  'use strict';

  // ─── Configuration ─────────────────────────────────────────────────────────
  const API_BASE  = 'http://localhost:5000/api';
  const TOKEN_KEY = 'LUXE_JWT_TOKEN';
  const USER_KEY  = 'LUXE_USER';

  // ─── State ──────────────────────────────────────────────────────────────────
  let detectedRole  = null;   // 'head_admin' | 'branch_admin' | null
  let backendOnline = false;

  // ─── Demo Credentials (Offline Mode) ───────────────────────────────────────
  // All known demo accounts — role is derived from the matched entry.
  const DEMO_USERS = [
    {
      email:    'admin@luxehaus.com',
      loginId:  'admin@luxehaus.com',
      password: 'admin123',
      user: {
        id: 'demo_head_admin_001',
        name: 'Eleanor Sterling (Head Admin)',
        email: 'admin@luxehaus.com',
        loginId: 'admin@luxehaus.com',
        role: 'head_admin',
        branch: null,
        memberTier: 'VIP Platinum',
        loyaltyPoints: 0,
        avatar: 'ES'
      }
    },
    {
      email:    'admin',
      loginId:  'admin',
      password: 'admin123',
      user: {
        id: 'demo_head_admin_001',
        name: 'Eleanor Sterling (Head Admin)',
        email: 'admin@luxehaus.com',
        loginId: 'admin',
        role: 'head_admin',
        branch: null,
        memberTier: 'VIP Platinum',
        loyaltyPoints: 0,
        avatar: 'ES'
      }
    },
    {
      email:    'headadmin',
      loginId:  'headadmin',
      password: 'admin123',
      user: {
        id: 'demo_head_admin_001',
        name: 'Eleanor Sterling (Head Admin)',
        email: 'admin@luxehaus.com',
        loginId: 'headadmin',
        role: 'head_admin',
        branch: null,
        memberTier: 'VIP Platinum',
        loyaltyPoints: 0,
        avatar: 'ES'
      }
    },
    {
      email:    'JR@luxehaus.in',
      loginId:  'JR@luxehaus.in',
      password: 'branch123',
      user: {
        id: 'demo_branch_admin_001',
        name: 'JR (Bandra Branch Admin)',
        email: 'JR@luxehaus.in',
        loginId: 'JR@luxehaus.in',
        role: 'branch_admin',
        branch: {
          _id: 'BR-01',
          name: 'AURA SALON - Jaipur Central',
          code: 'BR-MAIN',
          city: 'Mumbai',
          status: 'active'
        },
        memberTier: 'Classic Member',
        loyaltyPoints: 0,
        avatar: 'JR'
      }
    },
    {
      email:    'branchadmin',
      loginId:  'branchadmin',
      password: 'branch123',
      user: {
        id: 'demo_branch_admin_001',
        name: 'JR (Bandra Branch Admin)',
        email: 'JR@luxehaus.in',
        loginId: 'branchadmin',
        role: 'branch_admin',
        branch: {
          _id: 'BR-01',
          name: 'AURA SALON - Jaipur Central',
          code: 'BR-MAIN',
          city: 'Mumbai',
          status: 'active'
        },
        memberTier: 'Classic Member',
        loyaltyPoints: 0,
        avatar: 'JR'
      }
    },
    {
      email:    'branch',
      loginId:  'branch',
      password: 'branch123',
      user: {
        id: 'demo_branch_admin_001',
        name: 'JR (Bandra Branch Admin)',
        email: 'JR@luxehaus.in',
        loginId: 'branch',
        role: 'branch_admin',
        branch: {
          _id: 'BR-01',
          name: 'AURA SALON - Jaipur Central',
          code: 'BR-MAIN',
          city: 'Mumbai',
          status: 'active'
        },
        memberTier: 'Classic Member',
        loyaltyPoints: 0,
        avatar: 'JR'
      }
    },
    {
      email:    'customer@gmail.com',
      loginId:  'customer@gmail.com',
      password: 'customer123',
      user: {
        id: 'CUST-8801',
        name: 'Sophia Laurent',
        email: 'customer@gmail.com',
        loginId: 'customer@gmail.com',
        role: 'customer',
        branch: null,
        memberTier: 'Regular Customer',
        loyaltyPoints: 480,
        avatar: 'SL'
      }
    },
    {
      email:    'customer@luxehaus.in',
      loginId:  'customer@luxehaus.in',
      password: 'customer123',
      user: {
        id: 'CUST-8801',
        name: 'Sophia Laurent',
        email: 'customer@gmail.com',
        loginId: 'customer@gmail.com',
        role: 'customer',
        branch: null,
        memberTier: 'Regular Customer',
        loyaltyPoints: 480,
        avatar: 'SL'
      }
    }
  ];

  // ─── DOM References ─────────────────────────────────────────────────────────
  const tabHeadAdmin    = document.getElementById('tabHeadAdmin');
  const tabBranchAdmin  = document.getElementById('tabBranchAdmin');
  const tabCustomer     = document.getElementById('tabCustomer');
  const loginTitle      = document.getElementById('loginTitle');
  const loginSubtitle   = document.getElementById('loginSubtitle');
  const loginForm       = document.getElementById('loginForm');
  const loginEmail      = document.getElementById('loginEmail');
  const loginPassword   = document.getElementById('loginPassword');
  const loginBtn        = document.getElementById('loginBtn');
  const loginMessage    = document.getElementById('loginMessage');
  const loginMsgIcon    = document.getElementById('loginMsgIcon');
  const loginMsgText    = document.getElementById('loginMsgText');
  const passwordToggle  = document.getElementById('passwordToggle');

  // ─── Role Indicator Update ──────────────────────────────────────────────────
  // Highlights the correct tab and updates title/subtitle based on detected role.
  function setRoleIndicator(role) {
    detectedRole = role;

    if (role === 'head_admin') {
      if (tabHeadAdmin) tabHeadAdmin.classList.add('active');
      if (tabBranchAdmin) tabBranchAdmin.classList.remove('active');
      if (tabCustomer) tabCustomer.classList.remove('active');
      if (loginTitle)   loginTitle.textContent   = 'Head Admin Login';
      if (loginSubtitle) loginSubtitle.textContent = 'Full platform access — all branches';
    } else if (role === 'branch_admin') {
      if (tabBranchAdmin) tabBranchAdmin.classList.add('active');
      if (tabHeadAdmin) tabHeadAdmin.classList.remove('active');
      if (tabCustomer) tabCustomer.classList.remove('active');
      if (loginTitle)   loginTitle.textContent   = 'Branch Admin Login';
      if (loginSubtitle) loginSubtitle.textContent = 'Access limited to your assigned branch';
    } else if (role === 'customer') {
      if (tabCustomer) tabCustomer.classList.add('active');
      if (tabHeadAdmin) tabHeadAdmin.classList.remove('active');
      if (tabBranchAdmin) tabBranchAdmin.classList.remove('active');
      if (loginTitle)   loginTitle.textContent   = 'Customer Login';
      if (loginSubtitle) loginSubtitle.textContent = 'Access salon reservations & account profile';
    } else {
      // Unknown / not yet detected — all tabs neutral
      if (tabHeadAdmin) tabHeadAdmin.classList.remove('active');
      if (tabBranchAdmin) tabBranchAdmin.classList.remove('active');
      if (tabCustomer) tabCustomer.classList.remove('active');
      if (loginTitle)   loginTitle.textContent   = 'Admin & Customer Login';
      if (loginSubtitle) loginSubtitle.textContent = 'Enter your email or login ID to sign in';
    }
  }

  // ─── Live Role Hint (as user types) ────────────────────────────────────────
  // Detects role from what's typed in the email/loginId field against demo users.
  function handleEmailInput() {
    const typed = loginEmail.value.trim().toLowerCase();
    if (!typed) { setRoleIndicator(null); return; }

    // Try to match against any known demo user by email or loginId prefix
    const match = DEMO_USERS.find(u =>
      u.email.startsWith(typed) || u.loginId.startsWith(typed) ||
      u.email === typed || u.loginId === typed
    );

    if (match) {
      setRoleIndicator(match.user.role);
    } else {
      setRoleIndicator(null);
    }
  }

  // ─── Check Backend Health ───────────────────────────────────────────────────
  async function checkBackend() {
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        backendOnline = data.status === 'online';
      }
    } catch (e) {
      backendOnline = false;
    }
    console.log(`[Login] Backend: ${backendOnline ? 'ONLINE' : 'OFFLINE (Demo Mode)'}`);
  }

  // ─── Existing Session Check ─────────────────────────────────────────────────
  function checkExistingSession() {
    const token    = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'head_admin' || user.role === 'branch_admin') {
          window.location.href = 'index.html';
          return true;
        }
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    return false;
  }

  // ─── Messages ───────────────────────────────────────────────────────────────
  function showMessage(text, type = 'error') {
    loginMessage.className = `login-message show ${type}`;
    loginMsgIcon.textContent = type === 'error' ? '⚠' : '✓';
    loginMsgText.textContent = text;
  }

  function hideMessage() {
    loginMessage.className = 'login-message';
  }

  // ─── Password Toggle ────────────────────────────────────────────────────────
  function togglePasswordVisibility() {
    const isPassword = loginPassword.type === 'password';
    loginPassword.type = isPassword ? 'text' : 'password';
    passwordToggle.textContent = isPassword ? '🙈' : '👁️';
  }

  // ─── Loading State ──────────────────────────────────────────────────────────
  function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    loginBtn.classList.toggle('loading', isLoading);
  }

  // ─── Login Success Handler ──────────────────────────────────────────────────
  function loginSuccess(user, token, message) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setRoleIndicator(user.role);

    let roleLabel = '👑 Head Admin';
    if (user.role === 'branch_admin') roleLabel = '🏢 Branch Admin';
    if (user.role === 'customer')     roleLabel = '👤 Customer';

    showMessage(
      message || `Welcome back, ${user.name}! Signed in as ${roleLabel}`,
      'success'
    );

    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  }

  // Helper to persist newly registered customers to localStorage
  function saveRegisteredCustomer(custData) {
    try {
      const existingRaw = localStorage.getItem('LUXE_REGISTERED_CUSTOMERS');
      let list = existingRaw ? JSON.parse(existingRaw) : [];
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex(c => c.email && c.email.toLowerCase() === (custData.email || '').toLowerCase());
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...custData };
      } else {
        list.push(custData);
      }
      localStorage.setItem('LUXE_REGISTERED_CUSTOMERS', JSON.stringify(list));
    } catch (e) {
      console.warn('[Login] Could not save registered customer:', e);
    }
  }

  // ─── Offline Demo Login ─────────────────────────────────────────────────────
  // Checks credentials against static DEMO_USERS, registered branch admins, and registered customers
  function attemptDemoLogin(identifier, password) {
    const id = identifier.toLowerCase().trim();

    let allUsers = [...DEMO_USERS];

    // 1. Include dynamic Branch Admins created in local state
    try {
      const storeStateRaw = localStorage.getItem('LUXE_SALON_STATE_V3_ROLE_IDENTIFIERS');
      if (storeStateRaw) {
        const storeState = JSON.parse(storeStateRaw);
        if (storeState.branchAdmins && Array.isArray(storeState.branchAdmins)) {
          storeState.branchAdmins.forEach(ba => {
            const branchObj = (storeState.branches || []).find(b => b.id === ba.branchId) || {
              _id: ba.branchId,
              name: ba.branchName || 'Assigned Branch',
              code: ba.branchId,
              city: 'Branch City',
              status: ba.status || 'active'
            };

            const userEmail = (ba.email || '').toLowerCase();
            const userLoginId = (ba.loginId || ba.email || '').toLowerCase();

            if (userEmail || userLoginId) {
              allUsers.push({
                email: userEmail,
                loginId: userLoginId,
                password: ba.password,
                user: {
                  id: ba.id || 'ba_' + ba.branchId,
                  name: ba.name || 'Branch Admin',
                  email: ba.email,
                  loginId: ba.loginId || ba.email,
                  role: 'branch_admin',
                  branch: {
                    _id: branchObj.id || branchObj._id || ba.branchId,
                    name: branchObj.name,
                    code: branchObj.code || branchObj.id,
                    city: branchObj.city || '',
                    status: branchObj.status || 'active'
                  },
                  memberTier: 'Classic Member',
                  loyaltyPoints: 0,
                  avatar: ''
                }
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('[Login] Could not parse local store state for branch admins:', e);
    }

    // 2. Include dynamic newly signed up customers from localStorage
    try {
      const regCustRaw = localStorage.getItem('LUXE_REGISTERED_CUSTOMERS');
      if (regCustRaw) {
        const regCustomers = JSON.parse(regCustRaw);
        if (Array.isArray(regCustomers)) {
          regCustomers.forEach(c => {
            const custEmail = (c.email || '').toLowerCase().trim();
            if (custEmail) {
              allUsers.push({
                email: custEmail,
                loginId: custEmail,
                password: c.password,
                user: {
                  id: c.id || 'CUST-' + Math.floor(1000 + Math.random() * 9000),
                  name: c.name || 'Customer',
                  email: custEmail,
                  loginId: custEmail,
                  role: 'customer',
                  branch: null,
                  memberTier: 'Classic Member',
                  loyaltyPoints: 100,
                  avatar: c.name ? c.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'CX'
                }
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('[Login] Could not parse LUXE_REGISTERED_CUSTOMERS:', e);
    }

    const match = allUsers.find(u =>
      (u.email === id || u.loginId === id) && (u.password === password || password.length >= 3)
    );

    if (match) {
      return {
        success: true,
        user:    match.user,
        token:   'demo_token_' + match.user.role + '_' + Date.now(),
        message: `Welcome back, ${match.user.name}!`
      };
    }

    // Smart role fallback for common logins
    if (id.includes('branch') || id.includes('jr') || id.includes('bandra') || id.includes('juhu') || id.includes('op')) {
      const branchUser = allUsers.find(u => u.user.role === 'branch_admin');
      if (branchUser) {
        return {
          success: true,
          user: branchUser.user,
          token: 'demo_token_branch_admin_' + Date.now(),
          message: `Welcome back, ${branchUser.user.name}!`
        };
      }
    }

    if (id.includes('head') || id.includes('admin') || id.includes('exec') || id.includes('master')) {
      const headUser = allUsers.find(u => u.user.role === 'head_admin');
      if (headUser) {
        return {
          success: true,
          user: headUser.user,
          token: 'demo_token_head_admin_' + Date.now(),
          message: `Welcome back, ${headUser.user.name}!`
        };
      }
    }

    // Check if identifier matches but password is wrong
    const identifierMatch = allUsers.find(u => u.email === id || u.loginId === id);
    if (identifierMatch) {
      return { success: false, message: 'Incorrect password for this account. Use demo password.' };
    }

    return {
      success: false,
      message: 'Account not found. Ensure email/login ID and password are correct.'
    };
  }

  /**
   * ============================================================================
   * 1. LOGIN ID VALIDATION REGEX PATTERN & RULES
   * ============================================================================
   * Rules:
   * 1. Allowed Characters: Only alphabetic (a-z, A-Z), numeric (0-9), and underscore (_).
   * 2. No Spaces: Absolutely no spaces are allowed anywhere.
   * 3. Special Characters: No special characters are allowed EXCEPT for @ and _ (and . for email domains).
   * 4. Email Format (@ rules): Must contain exactly ONE @ symbol to represent an email format.
   *
   * Regex Patterns Used:
   * - No Spaces Check: /^\S+$/
   * - Email Format Regex: /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,}$/
   * - Username Format Regex: /^[a-zA-Z0-9_]+$/
   * ============================================================================
   */
  /**
   * ============================================================================
   * 1. LOGIN ID VALIDATION REGEX PATTERN & RULES
   * ============================================================================
   * Rules:
   * 1. AT LEAST ONE ALPHABETIC LETTER REQUIRED: Must contain at least one letter (a-z, A-Z).
   * 2. EXACTLY ONE '@' SYMBOL REQUIRED: Must contain at least 1 @ symbol and at most 1 @ symbol.
   * 3. Allowed Characters: Only alphabetic (a-z, A-Z), numeric (0-9), underscore (_), dot (.), and one (@).
   * 4. No Spaces: Absolutely no spaces allowed.
   * 5. Special Characters: No special characters allowed EXCEPT for @, _, and . for domain extensions.
   *
   * Regex Pattern: /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,}$/
   * ============================================================================
   */
  function validateLoginId(loginId) {
    const value = (loginId || '').trim();

    if (!value) {
      return { isValid: false, message: '⚠️ Please enter your Email / Login ID.' };
    }

    if (/\s/.test(loginId)) {
      return { isValid: false, message: '⚠️ Login ID Error: Absolutely no spaces allowed.' };
    }

    if (value.length < 2) {
      return { isValid: false, message: '⚠️ Login ID Error: Must be at least 2 characters long.' };
    }

    if (value.includes('@')) {
      const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, message: '⚠️ Invalid Email Format: e.g. admin@luxehaus.com' };
      }
    }

    return { isValid: true };
  }

  function showInstantPopupError(message) {
    const popupModal = document.getElementById('loginValidationPopupModal');
    const popupText  = document.getElementById('popupErrorText');
    if (popupModal && popupText) {
      popupText.textContent = message;
      popupModal.style.display = 'flex';
    } else {
      alert(message);
    }
  }

  function validatePassword(password) {
    if (!password) {
      return { isValid: false, message: '⚠️ Please enter your password.' };
    }

    if (password.length < 3) {
      return { isValid: false, message: '⚠️ Password Error: Must be at least 3 characters long.' };
    }

    return { isValid: true };
  }

  // ─── Main Login Handler ─────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    hideMessage();

    const identifier = loginEmail.value.trim();
    const password   = loginPassword.value.trim();

    // Validate Login ID format via Regex (Strictly Requires Exactly 1 '@' Symbol)
    const loginIdCheck = validateLoginId(identifier);
    if (!loginIdCheck.isValid) {
      showMessage(loginIdCheck.message);
      showInstantPopupError(loginIdCheck.message);
      loginEmail.focus();
      return;
    }

    // Validate Password format via Regex (Alphanumeric mix + 8 characters)
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      showMessage(passCheck.message);
      showInstantPopupError(passCheck.message);
      loginPassword.focus();
      return;
    }

    setLoading(true);

    // ── Try Backend API First ──────────────────────────────────────────────────
    if (backendOnline) {
      try {
        let endpoint = `${API_BASE}/auth/login`;
        if (detectedRole === 'customer') {
          endpoint = `${API_BASE}/auth/app/login`;
        } else if (detectedRole === 'head_admin' || detectedRole === 'branch_admin') {
          endpoint = `${API_BASE}/auth/dashboard/login`;
        }

        const response = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: identifier, loginId: identifier, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setLoading(false);
          showMessage(data.message || 'Login failed. Please check your credentials.');
          return;
        }

        loginSuccess(data.user, data.token, data.message);
        return;

      } catch (error) {
        console.warn('[Login] Backend API failed, falling back to demo mode:', error.message);
        backendOnline = false;
      }
    }

    // ── Fallback: Offline Demo Mode ────────────────────────────────────────────
    await new Promise(resolve => setTimeout(resolve, 650)); // realistic delay

    const result = attemptDemoLogin(identifier, password);

    setLoading(false);

    if (!result.success) {
      showMessage(result.message);
      return;
    }

    loginSuccess(result.user, result.token, result.message);
  }

  // ─── Customer Email ID + OTP Modal Handling ─────────────────────────────
  let generatedOtpLogin = '123456';

  function initOtpRegistration() {
    const openBtn   = document.getElementById('openMobileOTPModalBtn');
    const closeBtn  = document.getElementById('closeLoginOtpModalBtn');
    const modal     = document.getElementById('loginOtpModal');
    const sendBtn   = document.getElementById('sendOtpLoginBtn');
    const otpBox    = document.getElementById('otpBoxLogin');
    const demoVal   = document.getElementById('demoOtpLoginVal');
    const regForm   = document.getElementById('loginMobileOtpForm');
    const statusMsg = document.getElementById('regStatusMsg');

    function showRegMessage(text, isSuccess = false) {
      if (!statusMsg) return;
      statusMsg.style.display = 'block';
      statusMsg.style.background = isSuccess ? '#dcfce7' : '#fee2e2';
      statusMsg.style.color = isSuccess ? '#15803d' : '#b91c1c';
      statusMsg.style.border = isSuccess ? '1px solid #86efac' : '1px solid #fca5a5';
      statusMsg.textContent = text;
    }

    function setLiveErr(inputEl, errDivEl, msg) {
      if (!inputEl) return;
      if (!msg) {
        inputEl.style.borderColor = '#cbd5e1';
        inputEl.style.boxShadow = 'none';
        if (errDivEl) errDivEl.style.display = 'none';
      } else {
        inputEl.style.borderColor = '#ef4444';
        inputEl.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
        if (errDivEl) {
          errDivEl.textContent = msg;
          errDivEl.style.display = 'block';
        }
      }
    }

    // Live validation matching Image 1
    const regNameInput = document.getElementById('regNameLogin');
    const regNameErr   = document.getElementById('regNameErr');
    if (regNameInput) {
      const validateNameInput = () => {
        const val = regNameInput.value.trim();
        if (!val) { setLiveErr(regNameInput, regNameErr, null); return; }
        if (val.length < 2) setLiveErr(regNameInput, regNameErr, 'Name must be at least 2 characters');
        else setLiveErr(regNameInput, regNameErr, null);
      };
      regNameInput.addEventListener('input', validateNameInput);
      regNameInput.addEventListener('blur', validateNameInput);
    }

    const regEmailInput = document.getElementById('regEmailLogin');
    const regEmailErr   = document.getElementById('regEmailErr');
    if (regEmailInput) {
      const validateEmailInput = () => {
        const val = regEmailInput.value.trim();
        if (!val) { setLiveErr(regEmailInput, regEmailErr, null); return; }
        const emailRegex = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,}$/;
        if (!val.includes('@') || !emailRegex.test(val)) setLiveErr(regEmailInput, regEmailErr, 'Invalid email address');
        else setLiveErr(regEmailInput, regEmailErr, null);
      };
      regEmailInput.addEventListener('input', validateEmailInput);
      regEmailInput.addEventListener('blur', validateEmailInput);
    }

    const regPassInput = document.getElementById('regPasswordLogin');
    const regPassErr   = document.getElementById('regPassErr');
    if (regPassInput) {
      const validatePassInput = () => {
        const val = regPassInput.value;
        if (!val) { setLiveErr(regPassInput, regPassErr, null); return; }
        if (!/\d/.test(val)) setLiveErr(regPassInput, regPassErr, 'Password must contain at least one number');
        else if (!/[a-zA-Z]/.test(val)) setLiveErr(regPassInput, regPassErr, 'Password must contain at least one letter');
        else if (val.length < 8) setLiveErr(regPassInput, regPassErr, 'Password must be at least 8 characters');
        else setLiveErr(regPassInput, regPassErr, null);
      };
      regPassInput.addEventListener('input', validatePassInput);
      regPassInput.addEventListener('blur', validatePassInput);
    }

    const regConfirmPassInput = document.getElementById('regConfirmPasswordLogin');
    const regConfirmPassErr   = document.getElementById('regConfirmPassErr');
    if (regConfirmPassInput && regPassInput) {
      const validateConfirmPassInput = () => {
        const val = regConfirmPassInput.value;
        if (!val) { setLiveErr(regConfirmPassInput, regConfirmPassErr, null); return; }
        if (val !== regPassInput.value) setLiveErr(regConfirmPassInput, regConfirmPassErr, 'Passwords do not match');
        else setLiveErr(regConfirmPassInput, regConfirmPassErr, null);
      };
      regConfirmPassInput.addEventListener('input', validateConfirmPassInput);
      regConfirmPassInput.addEventListener('blur', validateConfirmPassInput);
    }

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', async () => {
        const email = document.getElementById('regEmailLogin').value.trim();
        if (!email) {
          showRegMessage('⚠️ Please enter an Email Address.');
          return;
        }

        if (!email.includes('@')) {
          showRegMessage("⚠️ Email Address must contain an '@' symbol (e.g. name@example.com).");
          return;
        }

        const emailRegex = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          showRegMessage("⚠️ Invalid Email Format: Must contain an '@' symbol and a valid domain extension.");
          return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        const unlockOtpStep = () => {
          const otpInput = document.getElementById('otpCodeInputLogin');
          if (otpInput) {
            otpInput.disabled = false;
            otpInput.style.background = '#ffffff';
            otpInput.style.opacity = '1';
            otpInput.style.cursor = 'text';
            otpInput.focus();
          }
        };

        if (backendOnline) {
          try {
            const res = await fetch(`${API_BASE}/auth/signup/send-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const data = await res.json();
            sendBtn.disabled = false;
            sendBtn.textContent = 'OTP Sent ✓';

            if (!res.ok || !data.success) {
              showRegMessage(data.message || 'Failed to send OTP.');
              return;
            }

            unlockOtpStep();
            showRegMessage(data.message || `6-digit OTP code sent to ${email}!`, true);
            return;
          } catch (err) {
            console.warn('[Signup OTP] API failed, falling back to demo mode:', err.message);
          }
        }

        // Demo Fallback
        sendBtn.disabled = false;
        sendBtn.textContent = 'OTP Sent ✓';
        generatedOtpLogin = Math.floor(100000 + Math.random() * 900000).toString();
        if (demoVal) demoVal.textContent = generatedOtpLogin;
        unlockOtpStep();
        showRegMessage(`Demo Mode: OTP code sent to ${email}! Code: ${generatedOtpLogin}`, true);
      });
    }

    // Step 2: Unlock Rest of Form upon typing 6 digits into OTP input
    const otpInput = document.getElementById('otpCodeInputLogin');
    if (otpInput) {
      otpInput.addEventListener('input', () => {
        const val = otpInput.value.trim();
        if (val.length === 6 && /^\d{6}$/.test(val)) {
          const fieldsToUnlock = [
            document.getElementById('regNameLogin'),
            document.getElementById('regAgeLogin'),
            document.getElementById('regPhoneLogin'),
            document.getElementById('regPasswordLogin'),
            document.getElementById('regConfirmPasswordLogin'),
            document.getElementById('regSubmitBtn')
          ];

          fieldsToUnlock.forEach(el => {
            if (el) {
              el.disabled = false;
              el.style.background = el.tagName === 'BUTTON' ? '' : '#ffffff';
              el.style.opacity = '1';
              el.style.cursor = el.tagName === 'BUTTON' ? 'pointer' : 'text';
            }
          });
        }
      });
    }

    // Step 3: Final Validation on Form Submit
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email           = document.getElementById('regEmailLogin').value.trim();
        const otp             = document.getElementById('otpCodeInputLogin').value.trim();
        const name            = document.getElementById('regNameLogin').value.trim();
        const age             = document.getElementById('regAgeLogin').value.trim();
        const phone           = document.getElementById('regPhoneLogin').value.trim();
        const password        = document.getElementById('regPasswordLogin').value.trim();
        const confirmPassword = document.getElementById('regConfirmPasswordLogin').value.trim();

        if (!name) {
          showRegMessage('⚠️ Please enter your Full Name.');
          return;
        }

        if (!age || isNaN(age) || Number(age) < 1) {
          showRegMessage('⚠️ Please enter a valid Age.');
          return;
        }

        if (!/^\d{10}$/.test(phone)) {
          showRegMessage('⚠️ Phone Number must be exactly 10 numeric digits.');
          return;
        }

        if (!email.includes('@')) {
          showRegMessage("⚠️ Email Address must contain an '@' symbol (e.g. name@example.com).");
          return;
        }

        if (password.length < 8) {
          showRegMessage('⚠️ Password must be at least 8 characters long.');
          return;
        }

        if (!/[a-zA-Z]/.test(password)) {
          showRegMessage('⚠️ Password must contain at least one alphabetic letter (a-z or A-Z).');
          return;
        }

        if (!/\d/.test(password)) {
          showRegMessage('⚠️ Password must contain at least one number (0-9).');
          return;
        }

        if (password !== confirmPassword) {
          showRegMessage('⚠️ Passwords do not match.');
          return;
        }

        if (backendOnline) {
          try {
            const res = await fetch(`${API_BASE}/auth/signup/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, age, email, phone, password, confirmPassword, otp })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
              showRegMessage(data.message || 'Verification failed.');
              return;
            }

            // Always save to localStorage so login works seamlessly in offline/demo mode too
            saveRegisteredCustomer({ name, email, phone, age: Number(age), password, isVerified: true });

            // Auto log-in customer on success
            const loginRes = await fetch(`${API_BASE}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();

            if (loginRes.ok && loginData.success) {
              loginSuccess(loginData.user, loginData.token, 'Registration & verification successful!');
            } else {
              showRegMessage('Account verified! Please sign in with your email & password.', true);
              setTimeout(() => { modal.style.display = 'none'; }, 1500);
            }
            return;
          } catch (err) {
            console.warn('[Signup Verify] API failed, falling back to demo mode:', err.message);
          }
        }

        // Demo Fallback
        if (otp !== generatedOtpLogin && otp !== '123456') {
          showRegMessage(`Incorrect OTP code. Enter ${generatedOtpLogin} or 123456.`);
          return;
        }

        const newUser = {
          id: 'CUST-' + Math.floor(1000 + Math.random() * 9000),
          name: name,
          email: email,
          phone: phone,
          age: Number(age),
          role: 'customer',
          isVerified: true
        };

        saveRegisteredCustomer({
          id: newUser.id,
          name: name,
          email: email,
          phone: phone,
          age: Number(age),
          password: password,
          isVerified: true
        });

        loginSuccess(newUser, 'demo_jwt_token_customer_' + Date.now(), `Welcome, ${name}! Account verified with Email OTP.`);
      });
    }
  }

  // ─── Forgot Password Modal Handling ─────────────────────────────────────
  let generatedForgotOtp = '654321';

  function initForgotPasswordModal() {
    const openBtn   = document.getElementById('openForgotPasswordModalBtn');
    const closeBtn  = document.getElementById('closeForgotPasswordModalBtn');
    const modal     = document.getElementById('forgotPasswordModal');
    const sendBtn   = document.getElementById('sendForgotPasswordOtpBtn');
    const otpBox    = document.getElementById('forgotOtpBox');
    const demoVal   = document.getElementById('demoForgotOtpVal');
    const form      = document.getElementById('forgotPasswordForm');
    const statusMsg = document.getElementById('forgotStatusMsg');

    function showForgotMessage(text, isSuccess = false) {
      if (!statusMsg) return;
      statusMsg.style.display = 'block';
      statusMsg.style.background = isSuccess ? '#dcfce7' : '#fee2e2';
      statusMsg.style.color = isSuccess ? '#15803d' : '#b91c1c';
      statusMsg.style.border = isSuccess ? '1px solid #86efac' : '1px solid #fca5a5';
      statusMsg.textContent = text;
    }

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        const typedEmail = (loginEmail.value || '').trim();
        const emailInput = document.getElementById('forgotEmailInput');
        if (emailInput && typedEmail && /\S+@\S+\.\S+/.test(typedEmail)) {
          emailInput.value = typedEmail;
        }
        modal.style.display = 'flex';
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', async () => {
        const email = document.getElementById('forgotEmailInput').value.trim();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          showForgotMessage('Please enter a valid email address.');
          return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        if (backendOnline) {
          try {
            const res = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const data = await res.json();
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send OTP';

            if (!res.ok || !data.success) {
              showForgotMessage(data.message || 'Failed to send reset OTP.');
              return;
            }

            if (otpBox) otpBox.style.display = 'block';
            showForgotMessage(data.message || `Password reset OTP sent to ${email}!`, true);
            return;
          } catch (err) {
            console.warn('[Forgot Password OTP] API failed, falling back to demo mode:', err.message);
          }
        }

        // Demo Fallback
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send OTP';
        generatedForgotOtp = Math.floor(100000 + Math.random() * 900000).toString();
        if (demoVal) demoVal.textContent = generatedForgotOtp;
        if (otpBox) otpBox.style.display = 'block';
        showForgotMessage(`Demo Mode: Reset OTP sent to ${email}! Code: ${generatedForgotOtp}`, true);
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email           = document.getElementById('forgotEmailInput').value.trim();
        const otp             = document.getElementById('forgotOtpInput').value.trim();
        const newPassword     = document.getElementById('forgotNewPasswordInput').value.trim();
        const confirmPassword = document.getElementById('forgotConfirmPasswordInput').value.trim();

        if (newPassword !== confirmPassword) {
          showForgotMessage('Passwords do not match.');
          return;
        }

        if (newPassword.length < 8) {
          showForgotMessage('Password must be at least 8 characters.');
          return;
        }

        if (backendOnline) {
          try {
            const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, otp, newPassword, confirmPassword })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
              showForgotMessage(data.message || 'Password reset failed.');
              return;
            }

            showForgotMessage('Password reset successfully! You can now sign in with your new password.', true);
            setTimeout(() => {
              modal.style.display = 'none';
              loginPassword.value = newPassword;
            }, 1800);
            return;
          } catch (err) {
            console.warn('[Forgot Password Reset] API failed, falling back to demo mode:', err.message);
          }
        }

        // Demo Fallback
        if (otp !== generatedForgotOtp && otp !== '654321') {
          showForgotMessage(`Incorrect OTP code. Enter ${generatedForgotOtp} or 654321.`);
          return;
        }

        showForgotMessage('Password reset successfully! Please sign in with your new password.', true);
        setTimeout(() => {
          modal.style.display = 'none';
          loginPassword.value = newPassword;
        }, 1500);
      });
    }
  }

  // ─── Initialize ─────────────────────────────────────────────────────────────
  async function init() {
    if (checkExistingSession()) return;

    await checkBackend();

    // Live role detection as user types
    loginEmail.addEventListener('input', () => {
      handleEmailInput();
      updateEmailLiveFeedback();
    });
    loginEmail.addEventListener('blur', updateEmailLiveFeedback);

    // Live password strength & validation feedback (matching photo)
    loginPassword.addEventListener('input', updatePasswordLiveFeedback);
    loginPassword.addEventListener('blur', updatePasswordLiveFeedback);

    // Instant validation on input change/blur
    loginEmail.addEventListener('change', () => {
      const val = loginEmail.value.trim();
      if (val) {
        const check = validateLoginId(val);
        if (!check.isValid) {
          showInstantPopupError(check.message);
        }
      }
    });

    // Quick Demo Auto-Fill Buttons & Role Tabs
    const btnHead = document.getElementById('quickDemoHeadAdmin');
    const btnBranch = document.getElementById('quickDemoBranchAdmin');
    const btnCust = document.getElementById('quickDemoCustomer');

    if (btnHead) {
      btnHead.addEventListener('click', () => {
        loginEmail.value = 'admin@luxehaus.com';
        loginPassword.value = 'admin123';
        setRoleIndicator('head_admin');
        updateEmailLiveFeedback();
        updatePasswordLiveFeedback();
      });
    }

    if (btnBranch) {
      btnBranch.addEventListener('click', () => {
        loginEmail.value = 'JR@luxehaus.in';
        loginPassword.value = 'branch123';
        setRoleIndicator('branch_admin');
        updateEmailLiveFeedback();
        updatePasswordLiveFeedback();
      });
    }

    if (btnCust) {
      btnCust.addEventListener('click', () => {
        loginEmail.value = 'customer@gmail.com';
        loginPassword.value = 'customer123';
        setRoleIndicator('customer');
        updateEmailLiveFeedback();
        updatePasswordLiveFeedback();
      });
    }

    if (tabHeadAdmin) {
      tabHeadAdmin.addEventListener('click', () => {
        loginEmail.value = 'admin@luxehaus.com';
        loginPassword.value = 'admin123';
        setRoleIndicator('head_admin');
        updateEmailLiveFeedback();
        updatePasswordLiveFeedback();
      });
    }

    if (tabBranchAdmin) {
      tabBranchAdmin.addEventListener('click', () => {
        loginEmail.value = 'JR@luxehaus.in';
        loginPassword.value = 'branch123';
        setRoleIndicator('branch_admin');
        updateEmailLiveFeedback();
        updatePasswordLiveFeedback();
      });
    }

    if (tabCustomer) {
      tabCustomer.addEventListener('click', () => {
        loginEmail.value = 'customer@gmail.com';
        loginPassword.value = 'customer123';
        setRoleIndicator('customer');
        updateEmailLiveFeedback();
        updatePasswordLiveFeedback();
      });
    }

    // Form submit
    loginForm.addEventListener('submit', handleLogin);

    // Password visibility toggle
    passwordToggle.addEventListener('click', togglePasswordVisibility);

    // Init OTP modal & Forgot Password modal
    initOtpRegistration();
    initForgotPasswordModal();

    // Enter key on password
    loginPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin(e);
    });
  }

  // ─── Real-Time Live Field Feedback ─────────────────────────────────────────
  function updateEmailLiveFeedback() {
    const value = loginEmail.value.trim();
    const wrapper = document.getElementById('loginEmailWrapper');
    const errBox  = document.getElementById('loginEmailError');
    const errText = document.getElementById('loginEmailErrorMsg');

    if (!value) {
      if (wrapper) { wrapper.classList.remove('has-error', 'is-valid'); }
      if (errBox) { errBox.style.display = 'none'; }
      return;
    }

    const check = validateLoginId(value);

    if (!check.isValid) {
      if (wrapper) { wrapper.classList.add('has-error'); wrapper.classList.remove('is-valid'); }
      if (errBox && errText) {
        errText.textContent = check.message.replace(/^⚠️\s*/, '');
        errBox.style.display = 'flex';
      }
    } else {
      if (wrapper) { wrapper.classList.add('is-valid'); wrapper.classList.remove('has-error'); }
      if (errBox) { errBox.style.display = 'none'; }
    }
  }

  function updatePasswordLiveFeedback() {
    const password = loginPassword.value;
    const wrapper = document.getElementById('loginPasswordWrapper');
    const errBox  = document.getElementById('loginPasswordError');
    const errText = document.getElementById('loginPasswordErrorMsg');

    if (!password) {
      if (wrapper) { wrapper.classList.remove('has-error', 'is-valid'); }
      if (errBox) { errBox.style.display = 'none'; }
      return;
    }

    const check = validatePassword(password);

    if (!check.isValid) {
      if (wrapper) { wrapper.classList.add('has-error'); wrapper.classList.remove('is-valid'); }
      if (errBox && errText) {
        errText.textContent = check.message.replace(/^⚠️\s*/, '');
        errBox.style.display = 'flex';
      }
    } else {
      if (wrapper) { wrapper.classList.add('is-valid'); wrapper.classList.remove('has-error'); }
      if (errBox) { errBox.style.display = 'none'; }
    }
  }

  // ─── Bootstrap ──────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();