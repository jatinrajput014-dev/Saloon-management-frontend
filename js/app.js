/**
 * LUXE HAUS - Multi-Branch Hair Salon Management System
 * Master Application Coordinator & Role-Based Access Control (RBAC)
 *
 * ROLES:
 *  - head_admin  → Full platform access: all branches, all data, all controls
 *  - branch_admin → Restricted: only their assigned branch data & operations
 */

class SalonApp {
  constructor() {
    this.currentPortal = 'head_admin';
    this.loggedInUser = null;
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  // ─── Init ─────────────────────────────────────────────────────────────────
  init() {
    this.loadUserSession();

    // Sync logged in customer user into store state if role === 'customer'
    if (this.loggedInUser && window.salonStore) {
      if (this.loggedInUser.role === 'customer') {
        window.salonStore.state.customerUser = {
          ...window.salonStore.state.customerUser,
          ...this.loggedInUser
        };
      }
    }

    // ── Step 1: Apply RBAC restrictions FIRST (before any rendering) ──────────
    if (this.loggedInUser) {
      if (this.loggedInUser.role === 'branch_admin') {
        this.applyBranchAdminAccess();
      } else if (this.loggedInUser.role === 'head_admin') {
        this.applyHeadAdminAccess();
      } else if (this.loggedInUser.role === 'customer') {
        this.applyCustomerAccess();
      }
    }

    // ── Step 2: Remove the inline RBAC guard style (JS takes over from here) ──
    const guardStyle = document.getElementById('__rbac_guard__');
    if (guardStyle) guardStyle.remove();

    // ── Step 3: Bind UI interactions ──────────────────────────────────────────
    this.bindTopNav();
    this.bindGlobalModals();
    this.setupReactiveSync();
    this.setupLogout();
    this.displayUserInfo();
    this.bindInstagramProfile();

    // ── Step 4: Init relevant controllers ─────────────────────────────────────
    if (window.headAdminController) window.headAdminController.init();
    if (window.branchAdminController) window.branchAdminController.init();
    if (window.customerMobileController) window.customerMobileController.init();

    if (this.loggedInUser?.role === 'branch_admin') {
      this.switchPortal('branch_admin');
    } else if (this.loggedInUser?.role === 'customer') {
      this.focusCustomerView();
    } else {
      this.switchPortal('head_admin');
    }
  }

  focusCustomerView() {
    setTimeout(() => {
      const container = document.getElementById('smartphoneContainer') || document.getElementById('customerMobileSection');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  }

  // ─── Session ──────────────────────────────────────────────────────────────
  loadUserSession() {
    try {
      const userData = localStorage.getItem('LUXE_USER');
      if (userData) this.loggedInUser = JSON.parse(userData);
    } catch (e) {
      console.warn('[App] Could not load user session', e);
    }
  }

  // ─── User Info Display ────────────────────────────────────────────────────
  // ─── User Info Display ────────────────────────────────────────────────────
  displayUserInfo() {
    if (!this.loggedInUser) {
      this.loadUserSession();
    }

    const user = this.loggedInUser || (this.currentPortal === 'branch_admin'
      ? { role: 'branch_admin', name: 'JR (Bandra Branch Admin)', email: 'JR@luxehaus.in' }
      : { role: 'head_admin', name: 'Eleanor Sterling', email: 'admin@luxehaus.com' });

    const activeRole = user.role || (this.currentPortal === 'branch_admin' ? 'branch_admin' : 'head_admin');

    let displayName = user.name || (activeRole === 'branch_admin' ? 'JR (Bandra Branch Admin)' : 'Eleanor Sterling');

    const initials = user.avatar || (displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || (activeRole === 'branch_admin' ? 'JR' : 'ES'));

    let avatarGradient = '#b2f347';
    let roleLabel = '👑 Head Admin';
    let roleFullLabel = 'Head Platform Administrator';
    let roleBadgeStyle = 'background: #f4fce3; color: #111827; border: 2px solid #111827;';

    if (activeRole === 'branch_admin') {
      avatarGradient = '#b2f347';
      roleLabel = '🏢 Branch Admin';
      roleFullLabel = 'Branch Operations Administrator';
      roleBadgeStyle = 'background: #f4fce3; color: #111827; border: 2px solid #111827;';
    } else if (activeRole === 'customer') {
      avatarGradient = '#b2f347';
      roleLabel = '👤 Customer';
      roleFullLabel = 'Customer Account';
      roleBadgeStyle = 'background: #f4fce3; color: #111827; border: 2px solid #111827;';
    }

    // Set initials & backgrounds across top bar avatar, menu avatar, profile modal avatar, and sidebar avatar
    ['loggedInAvatar', 'menuHeaderAvatar', 'modalProfileAvatar', 'sidebarAdminAvatar', 'branchAdminProfileAvatar', 'sectionProfileAvatar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = initials;
        el.style.background = '#b2f347';
        el.style.color = '#111827';
        el.style.border = '2px solid #111827';
        el.style.fontWeight = '900';
      }
    });

    // Set names
    ['loggedInName', 'modalProfileName', 'sidebarAdminName', 'branchAdminProfileName', 'sectionProfileName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = displayName;
    });

    const sidebarRoleEl = document.getElementById('sidebarAdminRole');
    if (sidebarRoleEl) sidebarRoleEl.textContent = user.title || (activeRole === 'head_admin' ? 'Head Executive Admin' : 'Branch Operations Admin');

    const sectionRoleEl = document.getElementById('sectionProfileRole');
    if (sectionRoleEl) sectionRoleEl.textContent = roleLabel;

    // Populate profile form edit fields
    ['editProfileName', 'sectionEditName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = displayName;
    });

    const emailValue = user.email || (activeRole === 'head_admin' ? 'admin@luxehaus.com' : 'JR@luxehaus.in');
    ['editProfileEmail', 'sectionEditEmail'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = emailValue;
    });
    const sectionEmailSpan = document.getElementById('sectionProfileEmail');
    if (sectionEmailSpan) sectionEmailSpan.textContent = emailValue;

    const phoneValue = user.phone || '9820011223';
    ['editProfilePhone', 'sectionEditPhone'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = phoneValue;
    });
    const sectionPhoneSpan = document.getElementById('sectionProfilePhone');
    if (sectionPhoneSpan) sectionPhoneSpan.textContent = phoneValue;

    const titleValue = user.title || (activeRole === 'head_admin' ? 'Head Executive Admin' : 'Branch Admin');
    ['editProfileTitle', 'sectionEditTitle'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = titleValue;
    });

    // Set roles in header menu & modal
    const roleEl = document.getElementById('loggedInRole');
    if (roleEl) roleEl.textContent = roleLabel;

    const modalRoleBadge = document.getElementById('modalProfileRoleBadge');
    if (modalRoleBadge) {
      modalRoleBadge.textContent = roleLabel;
      modalRoleBadge.style.cssText = `padding: 4px 14px; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase; border: 1px solid; ${roleBadgeStyle}`;
    }

    const modalRoleFull = document.getElementById('modalProfileRoleFull');
    if (modalRoleFull) modalRoleFull.textContent = roleFullLabel;

    // Email
    const modalEmail = document.getElementById('modalProfileEmail');
    if (modalEmail) modalEmail.textContent = user.email || user.username || (activeRole === 'head_admin' ? 'admin@luxehaus.com' : 'JR@luxehaus.in');

    // Branch Details
    const modalBranch = document.getElementById('modalProfileBranch');
    if (modalBranch) {
      if (activeRole === 'head_admin') {
        modalBranch.textContent = 'All Branches (Global Access)';
      } else if (user.branch) {
        const branchObj = typeof user.branch === 'object' ? user.branch : (window.salonStore ? window.salonStore.getBranchById(user.branch) : null);
        modalBranch.textContent = branchObj ? (branchObj.name || branchObj.code || 'Assigned Branch') : `Branch ${user.branch}`;
      } else {
        modalBranch.textContent = 'Bandra West Branch';
      }
    }

    if (activeRole === 'branch_admin') {
      const badge = document.getElementById('branchAdminBadge');
      const branchNameEl = document.getElementById('branchAdminBranchName');
      if (badge && branchNameEl) {
        badge.style.display = 'flex';
        const branchObj = user.branch;
        if (branchObj && typeof branchObj === 'object') {
          branchNameEl.textContent = branchObj.name || branchObj.code || 'Bandra West';
        } else if (branchObj) {
          const b = window.salonStore ? window.salonStore.getBranchById(branchObj) : null;
          branchNameEl.textContent = b ? b.name : branchObj;
        } else {
          branchNameEl.textContent = 'Luxe Haus - Bandra West';
        }
      }
    }
  }

  // ─── Profile Modal Tab Switching & Form Handlers ─────────────────────────
  switchProfileTab(tabName) {
    const personalForm = document.getElementById('editPersonalDetailsForm');
    const passwordForm = document.getElementById('changePasswordForm');
    const personalTab  = document.getElementById('tabBtnPersonalDetails');
    const passwordTab  = document.getElementById('tabBtnChangePassword');

    if (tabName === 'personal') {
      if (personalForm) personalForm.style.display = 'block';
      if (passwordForm) passwordForm.style.display = 'none';
      if (personalTab) {
        personalTab.classList.add('active');
        personalTab.style.fontWeight = '700';
        personalTab.style.color = 'var(--purple-royal)';
        personalTab.style.borderBottom = '2px solid var(--purple-royal)';
      }
      if (passwordTab) {
        passwordTab.classList.remove('active');
        passwordTab.style.fontWeight = '600';
        passwordTab.style.color = 'var(--text-muted)';
        passwordTab.style.borderBottom = 'none';
      }
    } else {
      if (personalForm) personalForm.style.display = 'none';
      if (passwordForm) passwordForm.style.display = 'block';
      if (passwordTab) {
        passwordTab.classList.add('active');
        passwordTab.style.fontWeight = '700';
        passwordTab.style.color = 'var(--purple-royal)';
        passwordTab.style.borderBottom = '2px solid var(--purple-royal)';
      }
      if (personalTab) {
        personalTab.classList.remove('active');
        personalTab.style.fontWeight = '600';
        personalTab.style.color = 'var(--text-muted)';
        personalTab.style.borderBottom = 'none';
      }
    }
  }

  bindProfileForms() {
    const personalForm = document.getElementById('editPersonalDetailsForm');
    const passwordForm = document.getElementById('changePasswordForm');

    if (personalForm && !personalForm.dataset.bound) {
      personalForm.dataset.bound = 'true';
      personalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName  = document.getElementById('editProfileName')?.value.trim();
        const newEmail = document.getElementById('editProfileEmail')?.value.trim();
        const newPhone = document.getElementById('editProfilePhone')?.value.trim();
        const newTitle = document.getElementById('editProfileTitle')?.value.trim();

        if (!newName || !newEmail || !newPhone) {
          this.showToast('⚠️ Please fill out all required personal details fields.', 'error');
          return;
        }

        if (this.loggedInUser) {
          this.loggedInUser.name  = newName;
          this.loggedInUser.email = newEmail;
          this.loggedInUser.phone = newPhone;
          this.loggedInUser.title = newTitle;
          localStorage.setItem('LUXE_USER', JSON.stringify(this.loggedInUser));
        }

        this.displayUserInfo();
        this.showToast('✨ Personal details updated successfully!', 'success');
        document.getElementById('userProfileModal')?.classList.remove('active');
      });
    }

    if (passwordForm && !passwordForm.dataset.bound) {
      passwordForm.dataset.bound = 'true';
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const curPass  = document.getElementById('editCurrentPass')?.value.trim();
        const newPass  = document.getElementById('editNewPass')?.value.trim();
        const confPass = document.getElementById('editConfirmPass')?.value.trim();

        if (!newPass || newPass.length < 6) {
          this.showToast('⚠️ New password must be at least 6 characters long.', 'error');
          return;
        }

        if (newPass !== confPass) {
          this.showToast('⚠️ New password and confirmation password do not match!', 'error');
          return;
        }

        if (this.loggedInUser) {
          this.loggedInUser.password = newPass;
          localStorage.setItem('LUXE_USER', JSON.stringify(this.loggedInUser));
        }

        passwordForm.reset();
        this.showToast('🔑 Account password updated successfully!', 'success');
        document.getElementById('userProfileModal')?.classList.remove('active');
      });
    }
  }

  // ─── Instagram Profile Menu & Modals ───────────────────────────────────────
  toggleInstagramProfileMenu(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const menu = document.getElementById('igProfileMenu');
    const symbolBtn = document.getElementById('igProfileSymbolBtn');
    if (menu) {
      this.displayUserInfo();
      const isOpen = menu.classList.contains('show');
      menu.classList.toggle('show', !isOpen);
      if (symbolBtn) symbolBtn.setAttribute('aria-expanded', !isOpen);
    }
  }

  openProfileModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const menu = document.getElementById('igProfileMenu');
    if (menu) menu.classList.remove('show');
    this.displayUserInfo();
    this.switchProfileTab('personal');
    const modal = document.getElementById('userProfileModal');
    if (modal) modal.classList.add('active');
  }

  triggerLogout(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const menu = document.getElementById('igProfileMenu');
    if (menu) menu.classList.remove('show');
    this.logout(false);
  }

  bindInstagramProfile() {
    const symbolBtn  = document.getElementById('igProfileSymbolBtn');
    const menu       = document.getElementById('igProfileMenu');
    const profileBtn = document.getElementById('igProfileOptionBtn');
    const logoutBtn  = document.getElementById('igLogoutOptionBtn');
    const confirmBtn = document.getElementById('confirmLogoutBtn');

    this.bindProfileForms();

    if (profileBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (menu) menu.classList.remove('show');
        this.displayUserInfo();
        if (window.headAdminController) {
          window.headAdminController.switchSection('profile');
        }
      });
    }

    if (symbolBtn && menu) {
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !symbolBtn.contains(e.target)) {
          menu.classList.remove('show');
          symbolBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const confirmModal = document.getElementById('logoutConfirmModal');
        if (confirmModal) confirmModal.classList.remove('active');
        this.logout(true);
      });
    }

    // Attach handler for sidebar profile card in Head Admin sidebar
    const sidebarProfileCard = document.querySelector('.admin-sidebar-profile');
    if (sidebarProfileCard) {
      sidebarProfileCard.addEventListener('click', (e) => {
        this.openProfileModal(e);
      });
    }
  }

  // ─── CUSTOMER ACCESS ──────────────────────────────────────────────────────
  applyCustomerAccess() {
    if (window.salonStore && this.loggedInUser) {
      window.salonStore.state.customerUser = {
        ...window.salonStore.state.customerUser,
        ...this.loggedInUser
      };
    }
  }

  // ─── HEAD ADMIN: Full access ──────────────────────────────────────────────
  applyHeadAdminAccess() {
    // Hide top role tab switcher (Head Admin manages all branch operations via Platform Control)
    const roleSwitcher = document.querySelector('.role-switcher-container');
    if (roleSwitcher) roleSwitcher.style.display = 'none';

    // Branch selector — all branches, fully enabled
    const branchSelector = document.getElementById('globalBranchSelector');
    if (branchSelector) {
      branchSelector.disabled = false;
      branchSelector.style.opacity = '1';
      branchSelector.style.cursor  = 'pointer';
      branchSelector.title = 'Switch active branch context';
    }

    // Hide "My Branch" badge — not relevant for head admin
    const badge = document.getElementById('branchAdminBadge');
    if (badge) badge.style.display = 'none';

    window._isBranchAdminLocked = false;
  }

  // ─── BRANCH ADMIN: Scoped access ─────────────────────────────────────────
  applyBranchAdminAccess() {
    const user = this.loggedInUser;
    if (!user) return;

    // 1. Hide Head Admin portal tab completely from top bar
    const headAdminBtn = document.getElementById('roleBtnHeadAdmin');
    if (headAdminBtn) {
      headAdminBtn.style.display = 'none';
    }
    const roleSwitcher = document.querySelector('.role-switcher-container');
    if (roleSwitcher) {
      roleSwitcher.style.display = 'none';
    }

    // 2. Determine assigned branch ID
    const assignedBranchId = (user.branch && typeof user.branch === 'object')
      ? (user.branch._id || user.branch.id)
      : user.branch;

    // 3. Rebuild branch selector to show ONLY their branch
    const branchSelector = document.getElementById('globalBranchSelector');
    if (branchSelector && assignedBranchId) {
      const branch      = window.salonStore ? window.salonStore.getBranchById(assignedBranchId) : null;
      const branchLabel = branch
        ? `🏢 ${branch.name} (${branch.city})`
        : `🏢 Branch ${assignedBranchId}`;

      branchSelector.innerHTML = `<option value="${assignedBranchId}">${branchLabel}</option>`;
      branchSelector.value     = assignedBranchId;
      branchSelector.disabled  = true;
      branchSelector.title     = 'Your assigned operational branch';
      branchSelector.style.opacity = '0.75';
      branchSelector.style.cursor  = 'not-allowed';
    }

    // 4. Set branch admin controller to their branch
    if (assignedBranchId) {
      window.branchAdminController.setBranch(assignedBranchId);
      if (window.salonStore) window.salonStore.setCurrentRole('branch_admin', assignedBranchId);
    }

    // 5. Hide head-admin-only top-bar tools
    ['resetDemoDataBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // 6. Signal branch-admin.js to hide "Return to Head Admin" button in banner
    window._isBranchAdminLocked = true;
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  logout(skipConfirm = false) {
    if (skipConfirm) {
      try {
        localStorage.removeItem('LUXE_JWT_TOKEN');
        localStorage.removeItem('LUXE_USER');
        sessionStorage.clear();
        window._isBranchAdminLocked = false;
        window.location.replace('login.html');
      } catch (e) {
        console.error('[Logout Error]', e);
        localStorage.removeItem('LUXE_JWT_TOKEN');
        localStorage.removeItem('LUXE_USER');
        window.location.href = 'login.html';
      }
    } else {
      const confirmModal = document.getElementById('logoutConfirmModal');
      if (confirmModal) {
        confirmModal.classList.add('active');
      } else if (confirm('Are you sure you want to sign out of Luxe Haus Admin?')) {
        this.logout(true);
      }
    }
  }

  setupLogout() {
    window.logout = (skipConfirm) => this.logout(skipConfirm);

    document.querySelectorAll('#logoutBtn, .btn-logout, [data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const menu = document.getElementById('igProfileMenu');
        if (menu) menu.classList.remove('show');
        this.logout(false);
      });
    });
  }

  // ─── Top Nav ──────────────────────────────────────────────────────────────
  bindTopNav() {
    // Portal tab switcher
    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const portal = e.currentTarget.dataset.portal;
        // Guard: branch admin cannot access head admin portal
        if (portal === 'head_admin' && this.loggedInUser?.role === 'branch_admin') {
          this.showToast('⛔ Access denied. You can only manage your assigned branch.', 'error');
          return;
        }
        if (portal) this.switchPortal(portal);
      });
    });

    // Branch selector
    const branchSelector = document.getElementById('globalBranchSelector');
    if (branchSelector) {
      this.populateBranchSelector(branchSelector);
      branchSelector.addEventListener('change', (e) => {
        if (this.loggedInUser?.role === 'branch_admin') return; // Guard
        const branchId = e.target.value;
        window.branchAdminController.setBranch(branchId);
        window.salonStore.setCurrentRole('branch_admin', branchId);
        this.showToast(`Active Branch switched to: ${e.target.selectedOptions[0].text}`, 'info');
      });
    }

    // Reset Demo Data button
    const resetBtn = document.getElementById('resetDemoDataBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset system to default seed data? (All branches, services, coupons, and appointments will restore)')) {
          window.salonStore.resetToDefault();
          this.showToast('Demo environment reset to initial luxury seed data.', 'success');
          location.reload();
        }
      });
    }
  }

  // ─── Branch Selector Population ───────────────────────────────────────────
  populateBranchSelector(selectEl) {
    // Branch admin selector is managed by applyBranchAdminAccess — skip here
    if (this.loggedInUser?.role === 'branch_admin') return;

    const branches = window.salonStore.getBranches();
    selectEl.innerHTML = branches.map((b, i) => `
      <option value="${b.id}" ${i === 0 ? 'selected' : ''}>
        🏢 ${b.name} (${b.city})
      </option>
    `).join('');
  }

  // ─── Portal Switching ──────────────────────────────────────────────────────
  switchPortal(portalId) {
    this.currentPortal = portalId;

    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.portal === portalId);
    });

    document.querySelectorAll('.portal-container').forEach(p => {
      p.classList.remove('active-portal');
    });

    const targetPortal = document.getElementById(`portal-${portalId}`);
    if (targetPortal) targetPortal.classList.add('active-portal');

    const globalBranch = document.getElementById('globalBranchSelector')?.value || 'BR-01';
    window.salonStore.setCurrentRole(portalId, globalBranch);

    if (portalId === 'head_admin') {
      this.applyHeadAdminAccess();
      this.displayUserInfo();
      if (window.headAdminController) window.headAdminController.render();
    } else if (portalId === 'branch_admin') {
      this.applyBranchAdminAccess();
      this.displayUserInfo();
      if (window.branchAdminController) window.branchAdminController.render();
    }
  }

  // ─── Switch to Branch Admin (Head Admin clicking a branch card) ───────────
  switchToBranchAdmin(branchId) {
    if (!branchId || branchId === 'undefined' || branchId === 'null') branchId = 'BR-01';
    const branchSelector = document.getElementById('globalBranchSelector');
    if (branchSelector) branchSelector.value = branchId;

    if (window.branchAdminController) window.branchAdminController.setBranch(branchId);
    this.applyBranchAdminAccess();
    this.displayUserInfo();
    this.switchPortal('branch_admin');
    const branch = window.salonStore ? window.salonStore.getBranchById(branchId) : null;
    this.showToast(`Switched to Branch Admin Dashboard: ${branch ? branch.name : branchId}`, 'success');
  }

  // ─── Reactive Sync ────────────────────────────────────────────────────────
  setupReactiveSync() {
    window.salonStore.subscribe(() => {
      const branchSelector = document.getElementById('globalBranchSelector');
      if (branchSelector && this.loggedInUser?.role !== 'branch_admin') {
        const curVal = branchSelector.value;
        this.populateBranchSelector(branchSelector);
        branchSelector.value = curVal;
      }

      if (this.currentPortal === 'head_admin') {
        window.headAdminController.render();
      } else if (this.currentPortal === 'branch_admin') {
        window.branchAdminController.render();
      }
    });
  }

  bindGlobalModals() {
    document.addEventListener('click', (e) => {
      // Backdrop click closes overlay
      if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        return;
      }

      // Any close button, x button symbol, or data-dismiss element closes modal
      const dismissBtn = e.target.closest('.modal-close-btn, [data-dismiss="modal"]');
      if (dismissBtn) {
        const overlay = dismissBtn.closest('.modal-overlay');
        if (overlay) {
          overlay.classList.remove('active');
        }
      }
    });
  }

  // ─── Toast Notifications ──────────────────────────────────────────────────
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✦';
    if (type === 'success') icon = '✓';
    if (type === 'error')   icon = '✕';
    if (type === 'info')    icon = 'ℹ';

    toast.innerHTML = `
      <span style="font-size: 16px; font-weight: bold;">${icon}</span>
      <span style="flex: 1;">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────
window._isBranchAdminLocked = false;

/**
 * Master Form Validation Suite for Luxe Haus Salon Management System
 * Enforces strict validation for Alphanumeric Text, Numeric, Email/Password, Mobile+OTP, Date/Time, and Selections.
 */
window.salonValidator = {
  // 1. Text & Text Area (Alphanumeric)
  validateText(value, fieldName = 'Field', minLen = 2, maxLen = 250) {
    const val = String(value || '').trim();
    if (!val) return `${fieldName} is required.`;
    if (val.length < minLen) return `${fieldName} must be at least ${minLen} characters long.`;
    if (val.length > maxLen) return `${fieldName} cannot exceed ${maxLen} characters.`;
    return null;
  },

  // 2. Words Only Validator (Alphabet letters & spaces only)
  validateWordsOnly(value, fieldName = 'Field') {
    const val = String(value || '').trim();
    if (!val) return `${fieldName} is required.`;
    if (!/^[a-zA-Z\s]+$/.test(val)) return `${fieldName} must contain letters and spaces only.`;
    return null;
  },

  // 3. Branch Name (Must be ONLY words and spaces)
  validateBranchName(name) {
    const val = String(name || '').trim();
    if (!val) return 'Branch Name is required.';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Branch Name must contain letters and spaces only.';
    return null;
  },

  // 4. Service Title (Must be ONLY words and spaces)
  validateServiceTitle(title) {
    const val = String(title || '').trim();
    if (!val) return 'Service Title is required.';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Service Title must contain letters and spaces only.';
    return null;
  },

  // 5. Campaign Title / Coupon Name (Must be ONLY words and spaces)
  validateCampaignTitle(title) {
    const val = String(title || '').trim();
    if (!val) return 'Campaign Title is required.';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Campaign Title must contain letters and spaces only.';
    return null;
  },

  // 6. Branch Admin ID (Must follow @luxehaus.in domain format e.g. JR@luxehaus.in)
  validateBranchAdminId(id) {
    const val = String(id || '').trim();
    if (!val) return 'Branch Admin ID is required.';
    if (!/^[a-zA-Z0-9._%+-]+@luxehaus\.in$/i.test(val)) {
      return 'Branch Admin ID must follow the domain format user@luxehaus.in (e.g., JR@luxehaus.in).';
    }
    return null;
  },

  // 7. Address (Alphanumeric + basic punctuation, must contain at least 1 letter)
  validateAddress(addr) {
    const val = String(addr || '').trim();
    if (!val) return 'Address is required.';
    if (val.length < 3) return 'Address must be at least 3 characters long.';
    if (!/[a-zA-Z]/.test(val)) return 'Address cannot be purely numeric and must contain at least one alphabet letter.';
    if (!/^[a-zA-Z0-9\s,.\-#/]{3,200}$/.test(val)) return 'Address contains invalid characters. Only letters, numbers, spaces, and basic punctuation (, . - # /) are allowed.';
    return null;
  },

  // 7b. Promo / Coupon Code (Must contain at least 1 letter)
  validatePromoCode(code, fieldName = 'Promo Code') {
    const val = String(code || '').trim();
    if (!val) return `${fieldName} is required.`;
    if (!/[a-zA-Z]/.test(val)) return `${fieldName} must contain at least 1 letter (cannot be purely numeric).`;
    if (!/^[a-zA-Z0-9_-]{2,30}$/.test(val)) return `${fieldName} can only contain alphanumeric characters, hyphens, or underscores.`;
    return null;
  },
  validateCouponCode(code, fieldName = 'Coupon Code') {
    return this.validatePromoCode(code, fieldName);
  },

  // 8. Mobile Number (Strictly positive numeric, max 10 digits, 0-9 only)
  validateMobile(mobile) {
    const val = String(mobile || '').trim();
    if (!val) return 'Phone number is required.';
    if (val.includes('-')) return 'Phone number cannot be a negative number.';
    if (!/^[0-9]{10}$/.test(val)) return 'Phone number must be a positive 10-digit numeric value (0-9 only).';
    return null;
  },

  // 9. Numeric Fields (Price, Discount, Usage Limit, Duration)
  validateNumeric(value, fieldName = 'Value', min = 0) {
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a positive numeric value.`;
    if (num < min) return `${fieldName} cannot be less than ${min}.`;
    return null;
  },

  // 10. Email
  validateEmail(email, fieldName = 'Email') {
    const val = String(email || '').trim();
    if (!val) return `${fieldName} is required.`;
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return `Please enter a valid email address (e.g. name@example.com).`;
    return null;
  },

  // 11. Password
  validatePassword(password, minLen = 6) {
    const val = String(password || '').trim();
    if (!val) return 'Password is required.';
    if (val.length < minLen) return `Password must be at least ${minLen} characters long.`;
    return null;
  },

  // 12. OTP Code
  validateOTP(otpCode) {
    const val = String(otpCode || '').trim();
    if (!val) return 'OTP verification code is required.';
    if (!/^[0-9]{4,6}$/.test(val)) return 'OTP code must be 4 to 6 numeric digits.';
    return null;
  },

  // 13. Date (YYYY-MM-DD)
  validateDate(dateStr, fieldName = 'Date') {
    const val = String(dateStr || '').trim();
    if (!val) return `${fieldName} is required.`;
    if (isNaN(Date.parse(val))) return `${fieldName} must be a valid date.`;
    return null;
  },

  // 14. Indian Time Format (12-hour AM/PM format e.g. 09:00 AM or 08:00 PM, or 24-hour HH:MM)
  validateIndianTime(timeStr, fieldName = 'Time') {
    const val = String(timeStr || '').trim();
    if (!val) return `${fieldName} is required.`;
    // Accepts "09:00 AM", "9:00AM", "08:00 PM", "20:00"
    const is12Hr = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(val);
    const is24Hr = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
    if (!is12Hr && !is24Hr) {
      return `${fieldName} must follow Indian time format (e.g., 09:00 AM or 08:00 PM).`;
    }
    return null;
  },
  validateTime(timeStr, fieldName = 'Time') {
    return this.validateIndianTime(timeStr, fieldName);
  },

  // 15. Dropdown & Selections
  validateSelection(value, allowedValues = [], fieldName = 'Selection') {
    if (!value) return `Please select a valid option for ${fieldName}.`;
    if (allowedValues.length > 0 && !allowedValues.includes(value)) {
      return `Invalid ${fieldName} selected. Must be one of: ${allowedValues.join(', ')}.`;
    }
    return null;
  },

  // 16. Multi-Select Working Days
  validateWorkingDays(daysArray) {
    if (!Array.isArray(daysArray) || daysArray.length === 0) {
      return 'Please select at least one working day for the branch.';
    }
    return null;
  }
};

window.validateSalonFields = function ({ mobileNumber, address, branchName }) {
  const errors = {};
  if (mobileNumber !== undefined && mobileNumber !== null) {
    const err = window.salonValidator.validateMobile(mobileNumber);
    if (err) errors.mobileNumber = err;
  }
  if (address !== undefined && address !== null) {
    const err = window.salonValidator.validateAddress(address);
    if (err) errors.address = err;
  }
  if (branchName !== undefined && branchName !== null) {
    const err = window.salonValidator.validateBranchName(branchName);
    if (err) errors.branchName = err;
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
window.app = new SalonApp();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();

  // Global Real-Time Physical Address Guard: Rejects purely numeric inputs
  document.addEventListener('change', (e) => {
    if (e.target && (e.target.name === 'branchAddress' || e.target.id === 'editBranchAddress' || e.target.classList.contains('address-input'))) {
      const val = String(e.target.value || '').trim();
      if (val && !/[a-zA-Z]/.test(val)) {
        if (window.app) {
          window.app.showToast('⚠️ Physical Address CANNOT be purely numeric! Must contain at least one alphabet letter (e.g., 101 Main Street).', 'error');
        }
        e.target.value = '';
        setTimeout(() => e.target.focus(), 100);
      }
    }
  });
});

window.toggleIgMenu = function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (window.app) {
    window.app.toggleInstagramProfileMenu(e);
  } else {
    var menu = document.getElementById('igProfileMenu');
    if (menu) menu.classList.toggle('show');
  }
};

window.openProfileModal = function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (window.app) {
    window.app.openProfileModal(e);
  } else {
    var menu = document.getElementById('igProfileMenu');
    if (menu) menu.classList.remove('show');
    var modal = document.getElementById('userProfileModal');
    if (modal) modal.classList.add('active');
  }
};

window.triggerLogout = function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (window.app) {
    window.app.triggerLogout(e);
  } else {
    var menu = document.getElementById('igProfileMenu');
    if (menu) menu.classList.remove('show');
    var confirmModal = document.getElementById('logoutConfirmModal');
    if (confirmModal) confirmModal.classList.add('active');
  }
};


