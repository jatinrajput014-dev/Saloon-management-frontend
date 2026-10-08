/**
 * LUXE HAUS - Head Admin Portal Controller
 * Manages Platform Overview, Branches, Categories, Services, Coupons, and Reports
 */

class HeadAdminController {
  constructor() {
    this.currentSection = 'overview';
    this.couponStatusFilter = 'all';
    this.serviceSearchQuery = '';
    this.serviceCategoryFilterVal = 'all';
    this.serviceStatusFilterVal = 'all';
  }

  init() {
    this.bindEvents();
    this.bindSidebarToggle();
    this.bindScrollPositionSync();
    this.render();
    setTimeout(() => this.updateNavIndicator(), 100);
  }

  updateNavIndicator() {
    const navContainer = document.querySelector('.sidebar-nav');
    const activeItem   = document.querySelector('.admin-nav-item.active');
    let indicator      = document.getElementById('navActiveIndicator');

    if (!navContainer) return;

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'navActiveIndicator';
      indicator.className = 'nav-active-indicator';
      navContainer.insertBefore(indicator, navContainer.firstChild);
    }

    if (activeItem) {
      const navTop = navContainer.getBoundingClientRect().top;
      const itemTop = activeItem.getBoundingClientRect().top;
      const itemHeight = activeItem.offsetHeight;
      const offset = itemTop - navTop;

      indicator.style.transform = `translateY(${offset}px)`;
      indicator.style.height = `${itemHeight}px`;
      indicator.style.opacity = '1';
    } else {
      indicator.style.opacity = '0';
    }
  }

  bindScrollPositionSync() {
    const mainContent  = document.querySelector('.admin-main');
    const sidebar      = document.getElementById('adminSidebar');
    const selectionBar = document.getElementById('overviewBranchSelectionBar');
    let lastScrollTop  = 0;

    const handleScroll = () => {
      if (!mainContent) return;
      const st = mainContent.scrollTop || window.pageYOffset || document.documentElement.scrollTop;

      if (st > lastScrollTop && st > 50) {
        if (sidebar) sidebar.style.top = '58px';
      } else {
        if (sidebar) sidebar.style.top = '65px';
      }

      if (selectionBar) {
        selectionBar.classList.toggle('is-stuck', st > 20);
      }

      // Indicator pill stays stationary on active section
      this.updateNavIndicator();

      lastScrollTop = st <= 0 ? 0 : st;
    };

    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => this.updateNavIndicator());
  }

  updateNavIndicatorOnScroll(scrollPercent) {
    const navContainer = document.querySelector('.sidebar-nav');
    const navItems     = Array.from(document.querySelectorAll('.admin-nav-item'));
    let indicator      = document.getElementById('navActiveIndicator');

    if (!navContainer || navItems.length === 0) return;

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'navActiveIndicator';
      indicator.className = 'nav-active-indicator';
      navContainer.insertBefore(indicator, navContainer.firstChild);
    }

    const targetIndex = Math.min(
      Math.floor(scrollPercent * navItems.length),
      navItems.length - 1
    );

    const targetItem = navItems[targetIndex] || navItems[0];

    navItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === targetIndex);
    });

    if (targetItem) {
      const navTop = navContainer.getBoundingClientRect().top;
      const itemTop = targetItem.getBoundingClientRect().top;
      const itemHeight = targetItem.offsetHeight;
      const offset = itemTop - navTop;

      indicator.style.transform = `translateY(${offset}px)`;
      indicator.style.height = `${itemHeight}px`;
      indicator.style.opacity = '1';
    }
  }

  bindSidebarToggle() {
    const toggleBtn        = document.getElementById('sidebarSlideToggleBtn');
    const topToggleBtn     = document.getElementById('topHamburgerBtn');
    const sidebarToggleBtn = document.getElementById('sidebarHamburgerBtn');
    const brandLogo        = document.getElementById('sidebarBrandLogo');
    const headingRow       = document.getElementById('sidebarHeadingRow');
    const sidebar          = document.getElementById('adminSidebar');
    const layout           = document.querySelector('.admin-layout');

    if (!sidebar || !layout) return;

    // Restore collapsed state if previously set
    const savedState = localStorage.getItem('LUXE_SIDEBAR_COLLAPSED');
    if (savedState === 'true') {
      sidebar.classList.add('collapsed');
      layout.classList.add('collapsed-sidebar');
      document.body.classList.add('collapsed-layout');
    }

    const toggleSidebar = (collapse) => {
      const isNowCollapsed = collapse !== undefined ? collapse : !sidebar.classList.contains('collapsed');
      sidebar.classList.toggle('collapsed', isNowCollapsed);
      layout.classList.toggle('collapsed-sidebar', isNowCollapsed);
      document.body.classList.toggle('collapsed-layout', isNowCollapsed);
      localStorage.setItem('LUXE_SIDEBAR_COLLAPSED', isNowCollapsed);
      window.dispatchEvent(new Event('resize'));
    };

    [toggleBtn, topToggleBtn, sidebarToggleBtn, brandLogo, headingRow].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSidebar();
        });
      }
    });

    // Swipe left / right gesture support
    let touchStartX = 0;
    sidebar.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    sidebar.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      if (deltaX < -40) {
        toggleSidebar(true);
      } else if (deltaX > 40) {
        toggleSidebar(false);
      }
    }, { passive: true });
  }

  bindEvents() {
    // Navigation items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        if (section) this.switchSection(section);
      });
    });

    // Add Branch Modal Trigger
    const addBranchBtn = document.getElementById('openAddBranchModalBtn');
    if (addBranchBtn) {
      addBranchBtn.addEventListener('click', () => {
        this.openModal('addBranchModal');
      });
    }

    // Add Category Modal Trigger
    const addCategoryBtn = document.getElementById('openAddCategoryModalBtn');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => {
        this.openModal('addCategoryModal');
      });
    }

    // Add Service Modal Trigger
    const addServiceBtn = document.getElementById('openAddServiceModalBtn');
    if (addServiceBtn) {
      addServiceBtn.addEventListener('click', () => {
        this.populateCategorySelect('serviceCategorySelect');
        this.openModal('addServiceModal');
      });
    }

    // Add Coupon Modal Trigger
    const addCouponBtn = document.getElementById('openAddCouponModalBtn');
    if (addCouponBtn) {
      addCouponBtn.addEventListener('click', () => {
        this.populateCouponServicesSelect();
        this.openModal('addCouponModal');
      });
    }

    // Form Submissions
    const addBranchForm = document.getElementById('addBranchForm');
    if (addBranchForm) {
      addBranchForm.addEventListener('submit', (e) => this.handleAddBranch(e));
    }

    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
      addCategoryForm.addEventListener('submit', (e) => this.handleAddCategory(e));
    }

    const addServiceForm = document.getElementById('addServiceForm');
    if (addServiceForm) {
      addServiceForm.addEventListener('submit', (e) => this.handleAddService(e));
    }

    const addCouponForm = document.getElementById('addCouponForm');
    if (addCouponForm) {
      addCouponForm.addEventListener('submit', (e) => this.handleAddCoupon(e));
    }

    const editBranchForm = document.getElementById('editBranchForm');
    if (editBranchForm) {
      editBranchForm.addEventListener('submit', (e) => this.handleEditBranch(e));
    }

    const editServiceForm = document.getElementById('editServiceForm');
    if (editServiceForm) {
      editServiceForm.addEventListener('submit', (e) => this.handleEditService(e));
    }

    const branchOpsSelect = document.getElementById('headAdminBranchOpsSelect');
    if (branchOpsSelect) {
      branchOpsSelect.addEventListener('change', (e) => this.renderBranchOps(e.target.value));
    }
  }

  switchSection(sectionId) {
    this.currentSection = sectionId;

    // Update nav classes
    document.querySelectorAll('.admin-nav-item').forEach(el => {
      const activeSection = (sectionId === 'add-branch') ? 'branches' : sectionId;
      el.classList.toggle('active', el.dataset.section === activeSection);
    });

    // Update breadcrumb text
    const breadcrumbTitle = document.getElementById('headerBreadcrumbTitle');
    if (breadcrumbTitle) {
      if (sectionId === 'branches') breadcrumbTitle.textContent = 'Branches';
      else if (sectionId === 'add-branch') breadcrumbTitle.textContent = 'Add New Branch';
      else if (sectionId === 'categories') breadcrumbTitle.textContent = 'Categories';
      else if (sectionId === 'services') breadcrumbTitle.textContent = 'Service Catalog';
      else if (sectionId === 'coupons') breadcrumbTitle.textContent = 'Offers & Coupons';
      else if (sectionId === 'reports') breadcrumbTitle.textContent = 'Reports';
      else if (sectionId === 'profile') breadcrumbTitle.textContent = 'Profile';
      else breadcrumbTitle.textContent = 'Salon Overview';
    }

    // Update section visibility
    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
      target.classList.add('active');
    }

    this.updateNavIndicator();
    this.render();

    const mainContent = document.querySelector('.luxe-main-container') || document.querySelector('.admin-main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  render() {
    this.renderStats();
    this.renderBranches();
    this.renderCategories();
    this.setupCategoryFilterListeners();
    this.renderServices();
    this.renderCoupons();
    this.renderReports();
    this.renderAdmins();
    this.populateServiceCategoryFilterDropdown();
  }

  renderStats() {
    const stats = window.salonStore.getPlatformStats();
    
    const revEl = document.getElementById('platformTotalRevenue');
    if (revEl) revEl.textContent = window.salonStore.formatCurrency(stats.totalRevenue);

    const aptsEl = document.getElementById('platformTotalAppointments');
    if (aptsEl) aptsEl.textContent = stats.totalAppointments;

    const totalBranchesEl = document.getElementById('platformTotalBranches');
    if (totalBranchesEl) totalBranchesEl.textContent = stats.totalBranches;

    const activeEl = document.getElementById('platformActiveBranches');
    if (activeEl) activeEl.textContent = stats.activeBranches;

    const inactiveEl = document.getElementById('platformInactiveBranches');
    if (inactiveEl) inactiveEl.textContent = stats.inactiveBranches;

    const customersEl = document.getElementById('platformTotalCustomers');
    if (customersEl) customersEl.textContent = stats.totalCustomers || 18;

    const activeTrend = document.getElementById('platformActiveBranchesTrend');
    if (activeTrend) activeTrend.textContent = `${stats.activeBranches} of ${stats.totalBranches} operational`;

    const inactiveTrend = document.getElementById('platformInactiveBranchesTrend');
    if (inactiveTrend) inactiveTrend.textContent = `${stats.inactiveBranches} suspended / closed`;

    const couponEl = document.getElementById('platformActiveCoupons');
    if (couponEl) couponEl.textContent = stats.activeCoupons;
  }

  filterBranchesByStatus(status) {
    this.branchStatusFilter = status;
    this.switchSection('branches');
    
    document.querySelectorAll('.branch-status-tab').forEach(b => b.classList.remove('active'));
    if (status === 'all') document.getElementById('btnBranchFilterAll')?.classList.add('active');
    if (status === 'active') document.getElementById('btnBranchFilterActive')?.classList.add('active');
    if (status === 'deactivated') document.getElementById('btnBranchFilterDeactivated')?.classList.add('active');

    this.renderBranches();

    let label = 'All Registered Branches';
    if (status === 'active') label = 'Active & Operational Branches';
    if (status === 'deactivated') label = 'Inactive / Deactivated Branches';

    window.app.showToast(`Filtered: Showing ${label}`, 'info');
  }

  renderBranchCardHtml(b) {
    const isDeactivated = b.status === 'deactivated';
    const branchApts = window.salonStore.getAppointments(b.id);
    const isValidRevenue = status => status === 'completed' || status === 'confirmed' || status === 'accepted' || status === 'in-progress';
    const branchRev = branchApts
      .filter(a => isValidRevenue(a.status))
      .reduce((sum, a) => sum + (a.total || 0), 0);

    const adminInfo = window.salonStore.getBranchAdmin(b.id);

    return `
      <div class="glass-card branch-card duo-card ${isDeactivated ? 'is-deactivated' : ''}" data-branch-id="${b.id}" style="padding: 10px; border: 2px solid var(--duo-black-stroke); box-shadow: 2px 2px 0px var(--duo-black-stroke); border-radius: 12px;">
        <div class="branch-card-media" style="cursor: pointer; position: relative; margin-bottom: 5px; height: 80px; overflow: hidden; border-radius: 8px; border: 1.5px solid var(--duo-black-stroke);" onclick="window.headAdminController.openViewBranchModal('${b.id}')">
          <img src="${b.image}" alt="${b.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'" />
          <div class="branch-status-tag" style="position: absolute; top: 4px; left: 4px;">
            <span class="badge ${isDeactivated ? 'badge-deactivated' : 'badge-active'}" style="font-weight: 800; font-size: 9px; padding: 1px 6px;">
              ${isDeactivated ? '● Off' : '🟢 Active'}
            </span>
          </div>
          <div class="duo-badge" style="position: absolute; top: 4px; right: 4px; font-size: 9px; padding: 1px 6px;">
            ★ ${b.rating} (${b.reviewCount})
          </div>
        </div>

        <div class="branch-card-body">
          <h3 style="cursor: pointer; font-family: var(--font-heading); font-size: 14.5px; font-weight: 800; color: #000000; margin-bottom: 1px; line-height: 1.2;" onclick="window.headAdminController.openViewBranchModal('${b.id}')">${b.name}</h3>
          <div class="branch-location" style="font-size: 10.5px; color: #475569; display: flex; align-items: center; gap: 4px; margin-bottom: 4px; line-height: 1.1;">
            <svg class="duo-svg" viewBox="0 0 24 24" width="11" height="11" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#b2f347" stroke="#111827" stroke-width="2"/><circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#111827" stroke-width="2"/></svg>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.address}</span>
          </div>

          <!-- Compact Metrics Strip -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; background: var(--duo-lime-soft); padding: 4px 6px; border-radius: 6px; border: 1.5px solid var(--duo-black-stroke); text-align: center; margin-bottom: 4px;">
            <div>
              <div style="font-size: 12px; font-weight: 900; color: #000000; line-height: 1.1;">${window.salonStore.formatCurrency(branchRev)}</div>
              <div style="font-size: 8.5px; font-weight: 800; color: #475569; text-transform: uppercase;">Revenue</div>
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 900; color: #000000; line-height: 1.1;">${branchApts.length}</div>
              <div style="font-size: 8.5px; font-weight: 800; color: #475569; text-transform: uppercase;">Bookings</div>
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 900; color: #000000; line-height: 1.1;">${b.chairs}</div>
              <div style="font-size: 8.5px; font-weight: 800; color: #475569; text-transform: uppercase;">Chairs</div>
            </div>
          </div>

          <div style="font-size: 10px; color: #475569; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; gap: 4px;">
            <div><strong style="color: #000000;">Hours:</strong> ${b.openingTime} - ${b.closingTime}</div>
            <div style="display: flex; align-items: center; gap: 3px;">
              <svg class="duo-svg" viewBox="0 0 24 24" width="10" height="10"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#b2f347" stroke="#111827" stroke-width="2"/></svg>
              <strong style="color: #000000;">${b.phone}</strong>
            </div>
          </div>

          <!-- Ultra Compact Credentials Box -->
          <div style="background: #ffffff; padding: 4px 6px; border-radius: 6px; font-size: 10px; margin-bottom: 4px; border: 1.5px solid var(--duo-black-stroke); box-shadow: 1px 1px 0px var(--duo-black-stroke);">
            <div style="font-weight: 800; color: #000000; margin-bottom: 2px; display: flex; align-items: center; gap: 3px; font-size: 10px; line-height: 1.1;">
              <svg class="duo-svg" viewBox="0 0 24 24" width="11" height="11"><rect x="3" y="11" width="18" height="11" rx="2" fill="#b2f347" stroke="#111827" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#111827" stroke-width="2.5" fill="none"/></svg>
              <span>Branch Admin Credentials:</span>
            </div>
            <div style="display: grid; grid-template-columns: 48px 1fr; gap: 0px 4px; font-size: 10px; line-height: 1.2;">
              <span style="color: #475569; font-weight: 500;">Admin:</span>
              <span style="color: #000000; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.adminName}</span>
              <span style="color: #475569; font-weight: 500;">Login ID:</span>
              <span style="color: #000000; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${adminInfo.loginId || adminInfo.id}</span>
              <span style="color: #475569; font-weight: 500;">Email:</span>
              <span style="color: #000000; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${adminInfo.email}</span>
              <span style="color: #475569; font-weight: 500;">Pass:</span>
              <span style="color: #000000; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${adminInfo.password || 'branchadmin123'}</span>
            </div>
          </div>

          <!-- Compact 1-Line Flex Action Buttons -->
          <div class="branch-card-actions" style="display: flex; gap: 3px; margin-top: 2px;">
            <button type="button" class="duo-btn-primary" style="flex: 1.2; padding: 3px 6px; font-size: 10px; border-radius: 5px !important; display: inline-flex; align-items: center; justify-content: center; gap: 3px;" onclick="window.headAdminController.openViewBranchModal('${b.id}')">
              <svg class="duo-svg" viewBox="0 0 24 24" width="10" height="10"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="#111827" stroke="#111827" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#b2f347" stroke="#b2f347" stroke-width="2"/></svg>
              <span>View Data</span>
            </button>
            <button type="button" class="duo-btn-secondary" style="flex: 0.9; padding: 3px 6px; font-size: 10px; border-radius: 5px !important;" onclick="window.headAdminController.openEditBranchModal('${b.id}')">
              <span>Edit</span>
            </button>
            <button type="button" class="btn btn-sm ${isDeactivated ? 'duo-btn-primary' : 'btn-danger'}" style="flex: 1; padding: 3px 6px; font-size: 10px; border-radius: 5px !important;" onclick="window.headAdminController.toggleBranchStatus('${b.id}')">
              ${isDeactivated ? 'Activate' : 'Deactivate'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderBranches() {
    const container = document.getElementById('headAdminBranchesGrid');
    const overviewContainer = document.getElementById('headAdminOverviewBranchesGrid');
    if (!container && !overviewContainer) return;

    const allBranches = window.salonStore.getBranches();

    if (overviewContainer) {
      if (allBranches.length === 0) {
        overviewContainer.innerHTML = `<div class="empty-state"><p>No branches registered yet.</p></div>`;
      } else {
        overviewContainer.innerHTML = allBranches.map(b => this.renderBranchCardHtml(b)).join('');
      }
    }

    if (!container) return;

    let branches = allBranches;
    if (this.branchStatusFilter === 'active') {
      branches = branches.filter(b => b.status === 'active');
    } else if (this.branchStatusFilter === 'deactivated') {
      branches = branches.filter(b => b.status === 'deactivated');
    }

    if (branches.length === 0) {
      const statusLabel = this.branchStatusFilter === 'deactivated' ? 'inactive / deactivated' : this.branchStatusFilter;
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; background: rgba(255,255,255,0.02); border-radius: 14px; border: 1px dashed var(--border-subtle);">
          <div style="font-size: 32px; margin-bottom: 10px;">🏢</div>
          <h4 style="color: var(--text-gold); margin-bottom: 6px;">No ${statusLabel} branches found</h4>
          <p style="font-size: 13px; color: var(--text-muted);">All branches are currently in another operational status.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = branches.map(b => this.renderBranchCardHtml(b)).join('');
  }

  toggleBranchStatus(branchId) {
    const updated = window.salonStore.toggleBranchStatus(branchId);
    if (updated) {
      const msg = updated.status === 'active' 
        ? `Branch "${updated.name}" is now ACTIVE and visible to customers.`
        : `Branch "${updated.name}" has been DEACTIVATED. Bookings paused.`;
      window.app.showToast(msg, updated.status === 'active' ? 'success' : 'info');
      this.renderBranches();
      this.renderStats();
    }
  }

  renderCategories() {
    const container = document.getElementById('headAdminCategoriesGrid');
    const tableBody = document.getElementById('luxeCategoriesTbody');
    const categories = window.salonStore.getCategories();

    if (container) {
      container.innerHTML = categories.map(c => {
        const count = window.salonStore.getServices().filter(s => s.categoryId === c.id).length;
        return `
          <div class="glass-card category-card">
            <div>
              <div class="category-card-top">
                <div class="category-icon-box" style="border-color: ${c.color}">
                  <span>${c.icon}</span>
                </div>
                <span class="badge ${c.active ? 'badge-active' : 'badge-deactivated'}">
                  ${c.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <h4 class="category-title">${c.name}</h4>
              <p class="category-desc">${c.description || 'Master salon care services.'}</p>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
              <span style="font-size: 12px; color: var(--gold-light); font-weight: 600;">${count} Services</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-secondary" onclick="window.headAdminController.toggleCategory('${c.id}')">
                  ${c.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (tableBody) {
      const searchVal = (document.getElementById('luxeCategorySearch')?.value || '').toLowerCase().trim();
      const statusVal = document.getElementById('luxeCategoryStatusFilter')?.value || 'all';

      let filtered = categories.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchVal) || (c.description || '').toLowerCase().includes(searchVal);
        const matchesStatus = statusVal === 'all' || (statusVal === 'active' ? c.active : !c.active);
        return matchesSearch && matchesStatus;
      });

      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 40px; color: #6B7280; font-weight: 500;">
              No categories found matching criteria.
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = filtered.map(c => `
          <tr>
            <td style="padding-left: 32px; font-weight: 700; color: #111827;">${c.name}</td>
            <td style="color: #6B7280; font-weight: 500;">${c.description || 'Salon service category'}</td>
            <td>
              <span class="${c.active ? 'luxe-pill-active' : 'luxe-pill-inactive'}">
                <span class="luxe-dot" style="background:${c.active ? '#10B981' : '#6B7280'};"></span> ${c.active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td style="text-align: right; padding-right: 32px;">
              <button class="luxe-action-dot-btn" onclick="window.headAdminController.toggleCategory('${c.id}')" title="Toggle Category Status">•••</button>
            </td>
          </tr>
        `).join('');
      }

      const pagText = document.getElementById('luxeCategoriesPaginationText');
      if (pagText) {
        pagText.innerHTML = `Showing <strong style="color:#111827;">1–${filtered.length}</strong> of <strong style="color:#111827;">${categories.length}</strong> categories`;
      }
    }
  }

  setupCategoryFilterListeners() {
    const searchInput = document.getElementById('luxeCategorySearch');
    const filterSelect = document.getElementById('luxeCategoryStatusFilter');

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', () => this.renderCategories());
    }

    if (filterSelect && !filterSelect.dataset.bound) {
      filterSelect.dataset.bound = 'true';
      filterSelect.addEventListener('change', () => this.renderCategories());
    }
  }

  toggleCategory(id) {
    const updated = window.salonStore.toggleCategory(id);
    if (updated) {
      window.app.showToast(`Category "${updated.name}" status updated.`, 'info');
      this.renderCategories();
    }
  }

  populateServiceCategoryFilterDropdown() {
    const sel = document.getElementById('serviceCategoryFilter');
    if (!sel) return;
    const cats = window.salonStore.getCategories();
    // preserve current selection
    const current = sel.value;
    // rebuild
    sel.innerHTML = `<option value="all">🗂️ All Categories</option>` +
      cats.map(c => `<option value="${c.id}" ${current === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  }

  filterServices() {
    const searchInput = document.getElementById('serviceSearchInput');
    const categoryFilter = document.getElementById('serviceCategoryFilter');
    const statusFilter = document.getElementById('serviceStatusFilter');

    this.serviceSearchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    this.serviceCategoryFilterVal = categoryFilter ? categoryFilter.value : 'all';
    this.serviceStatusFilterVal = statusFilter ? statusFilter.value : 'all';

    this.renderServices();
  }

  clearServiceFilters() {
    const searchInput = document.getElementById('serviceSearchInput');
    const categoryFilter = document.getElementById('serviceCategoryFilter');
    const statusFilter = document.getElementById('serviceStatusFilter');
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    if (statusFilter) statusFilter.value = 'all';
    this.serviceSearchQuery = '';
    this.serviceCategoryFilterVal = 'all';
    this.serviceStatusFilterVal = 'all';
    this.renderServices();
    window.app.showToast('Service filters cleared.', 'info');
  }

  filterCoupons(status) {
    this.couponStatusFilter = status;
    document.querySelectorAll('.coupon-filter-tab').forEach(b => b.classList.remove('active'));
    if (status === 'all') document.getElementById('btnCouponFilterAll')?.classList.add('active');
    if (status === 'active') document.getElementById('btnCouponFilterActive')?.classList.add('active');
    if (status === 'inactive') document.getElementById('btnCouponFilterInactive')?.classList.add('active');
    this.renderCoupons();
  }

  presetCategory(name, icon, description, color) {
    const nameEl = document.getElementById('catNameInput');
    const iconEl = document.getElementById('catIconInput');
    const descEl = document.getElementById('catDescInput');
    const colorEl = document.getElementById('catColorInput');
    if (nameEl) nameEl.value = name;
    if (iconEl) iconEl.value = icon;
    if (descEl) descEl.value = description;
    if (colorEl) colorEl.value = color;
    window.app.showToast(`Preset "${name}" loaded — review and click Create Category.`, 'info');
  }

  populateCouponServicesSelect() {
    const sel = document.getElementById('couponApplicableServicesSelect');
    if (!sel) return;
    const services = window.salonStore.getServices().filter(s => s.active);
    sel.innerHTML = services.map(s => `<option value="${s.id}">${s.name} (₹${s.price})</option>`).join('');
  }

  renderServices() {
    const tbody = document.getElementById('headAdminServicesTableBody');
    const emptyState = document.getElementById('serviceFilterEmptyState');
    if (!tbody) return;

    let services = window.salonStore.getServices();
    const categories = window.salonStore.getCategories();

    // Apply search filter
    if (this.serviceSearchQuery) {
      services = services.filter(s =>
        s.name.toLowerCase().includes(this.serviceSearchQuery) ||
        (s.description || '').toLowerCase().includes(this.serviceSearchQuery)
      );
    }
    // Apply category filter
    if (this.serviceCategoryFilterVal && this.serviceCategoryFilterVal !== 'all') {
      services = services.filter(s => s.categoryId === this.serviceCategoryFilterVal);
    }
    // Apply status filter
    if (this.serviceStatusFilterVal && this.serviceStatusFilterVal !== 'all') {
      const isActive = this.serviceStatusFilterVal === 'active';
      services = services.filter(s => s.active === isActive);
    }

    if (services.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = services.map(s => {
      const cat = categories.find(c => c.id === s.categoryId);
      const branchNames = !s.branches || s.branches.includes('all') || s.branches.length === 0
        ? 'All Branches'
        : s.branches.map(bId => {
            const br = window.salonStore.getBranchById(bId);
            return br ? br.city : bId;
          }).join(', ');

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${s.image}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'" />
              <div>
                <strong>${s.name}</strong>
                ${s.popular ? '<span class="badge badge-gold" style="margin-left: 6px; font-size: 9px;">VIP Pick</span>' : ''}
                <div style="font-size: 11px; color: var(--text-muted);">${cat ? `${cat.icon || ''} ${cat.name}` : 'General'}</div>
              </div>
            </div>
          </td>
          <td><strong style="color: var(--text-gold); font-size: 14px;">${window.salonStore.formatCurrency(s.price)}</strong></td>
          <td>${s.duration} mins</td>
          <td><span style="font-size: 12px; color: var(--text-gold);">${branchNames}</span></td>
          <td>
            <span class="badge ${s.active ? 'badge-active' : 'badge-deactivated'}">
              ${s.active ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-outline-gold" onclick="window.headAdminController.openEditServiceModal('${s.id}')">
                ✏️ Edit
              </button>
              <button class="btn btn-sm ${s.active ? 'btn-danger' : 'btn-primary'}" onclick="window.headAdminController.toggleService('${s.id}')">
                ${s.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openEditServiceModal(serviceId) {
    const service = window.salonStore.getServices().find(s => s.id === serviceId);
    if (!service) return;

    this.populateCategorySelect('editServiceCategorySelect');

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('editServiceId', service.id);
    setVal('editServiceName', service.name);
    setVal('editServiceCategorySelect', service.categoryId);
    setVal('editServicePrice', service.price);
    setVal('editServiceDuration', service.duration);
    setVal('editServiceStatusSelect', service.active !== false ? 'active' : 'inactive');
    setVal('editServiceDescription', service.description);
    setVal('editServiceImage', service.image);

    const popCb = document.getElementById('editServicePopular');
    if (popCb) popCb.checked = !!service.popular;

    this.openModal('editServiceModal');
  }

  handleEditService(e) {
    e.preventDefault();
    const serviceId = document.getElementById('editServiceId').value;
    if (!serviceId) return;

    const statusVal = document.getElementById('editServiceStatusSelect')?.value;

    const updates = {
      name: document.getElementById('editServiceName').value,
      categoryId: document.getElementById('editServiceCategorySelect').value,
      price: parseFloat(document.getElementById('editServicePrice').value) || 1500,
      duration: parseInt(document.getElementById('editServiceDuration').value) || 60,
      active: statusVal === 'active',
      popular: document.getElementById('editServicePopular').checked,
      description: document.getElementById('editServiceDescription').value,
      image: document.getElementById('editServiceImage').value
    };

    if (window.salonValidator) {
      const sErr = window.salonValidator.validateServiceTitle(updates.name);
      if (sErr) { window.app.showToast(`⚠️ ${sErr}`, 'error'); return; }

      const pErr = window.salonValidator.validateNumeric(updates.price, 'Price', 1);
      if (pErr) { window.app.showToast(`⚠️ ${pErr}`, 'error'); return; }

      const dErr = window.salonValidator.validateNumeric(updates.duration, 'Duration', 1);
      if (dErr) { window.app.showToast(`⚠️ ${dErr}`, 'error'); return; }
    }

    const updated = window.salonStore.updateService(serviceId, updates);
    this.closeModal('editServiceModal');
    if (updated) {
      window.app.showToast(`Service "${updated.name}" updated! Price set to ${window.salonStore.formatCurrency(updated.price)}.`, 'success');
      this.render();
    }
  }

  toggleService(id) {
    const updated = window.salonStore.toggleService(id);
    if (updated) {
      window.app.showToast(`Service "${updated.name}" toggled.`, 'info');
      this.renderServices();
    }
  }

  renderCoupons() {
    const container = document.getElementById('headAdminCouponsGrid');
    if (!container) return;

    let coupons = window.salonStore.getCoupons();

    // Apply status filter
    if (this.couponStatusFilter === 'active') {
      coupons = coupons.filter(c => c.active);
    } else if (this.couponStatusFilter === 'inactive') {
      coupons = coupons.filter(c => !c.active);
    }

    if (coupons.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted); font-size:13px;"><div style="font-size:28px; margin-bottom:8px;">🎟️</div><p>No coupons found for this filter.</p></div>`;
      return;
    }

    container.innerHTML = coupons.map(c => {
      const discountDisplay = c.discountType === 'percentage'
        ? `${c.discountValue}% OFF`
        : `₹${c.discountValue} OFF`;
      const usagePct = c.usageLimit > 0 ? Math.min(100, Math.round((c.usageCount / c.usageLimit) * 100)) : 0;
      const applicableServicesText = !c.applicableServices || c.applicableServices.length === 0
        ? 'All Services'
        : `${c.applicableServices.length} Selected Service(s)`;

      return `
        <div class="coupon-card" style="${!c.active ? 'opacity: 0.65;' : ''}">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span class="coupon-badge-code">${c.code}</span>
            <span class="badge ${c.active ? 'badge-active' : 'badge-deactivated'}">
              ${c.active ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
          <div class="coupon-discount-tag">${discountDisplay}</div>
          <h4 style="font-size: 15px; margin-bottom: 4px;">${c.title}</h4>
          <p class="coupon-meta">${c.description || 'Promotional offer'}</p>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.8; margin-bottom: 10px;">
            <div>Min Order: <strong>${window.salonStore.formatCurrency(c.minOrderAmount || 0)}</strong> | Max Discount: <strong>${window.salonStore.formatCurrency(c.maxDiscount || 0)}</strong></div>
            <div>Valid Until: <strong>${c.validUntil}</strong></div>
            <div>Applicable: <strong style="color: var(--gold-light);">${applicableServicesText}</strong></div>
          </div>
          <!-- Usage Progress Bar -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim); margin-bottom: 4px;">
              <span>Usage</span>
              <span><strong>${c.usageCount}</strong> / ${c.usageLimit} uses (${usagePct}%)</span>
            </div>
            <div style="height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: ${usagePct}%; height: 100%; background: ${usagePct >= 90 ? 'var(--accent-rose)' : 'var(--accent-gold)'}; transition: width 0.4s ease;"></div>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-sm btn-secondary" onclick="window.headAdminController.toggleCoupon('${c.id}')">
              ${c.active ? '🔴 Deactivate' : '🟢 Activate'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.headAdminController.deleteCoupon('${c.id}')">
              🗑️ Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  toggleCoupon(id) {
    const updated = window.salonStore.toggleCoupon(id);
    if (updated) {
      window.app.showToast(`Coupon ${updated.code} status updated.`, 'info');
      this.renderCoupons();
    }
  }

  deleteCoupon(id) {
    if (confirm('Delete this coupon permanently?')) {
      window.salonStore.deleteCoupon(id);
      window.app.showToast('Coupon removed.', 'info');
      this.renderCoupons();
    }
  }

  renderReports(selectedBranchId = 'all') {
    const container = document.getElementById('headAdminReportsContainer');
    if (!container) return;

    const stats = window.salonStore.getPlatformStats();
    const branches = window.salonStore.getBranches();
    const coupons = window.salonStore.getCoupons();
    const allAppointments = window.salonStore.getAppointments();
    const maxRev = Math.max(...stats.branchBreakdown.map(b => b.revenue), 100);

    const targetBranchId = selectedBranchId === 'all' ? null : selectedBranchId;
    const srvRevenue = window.salonStore.getServiceWiseRevenue(targetBranchId);
    const totalSrvRev = srvRevenue.reduce((sum, s) => sum + s.totalRevenue, 0);

    // --- Payment Summary ---
    const filteredApts = targetBranchId
      ? allAppointments.filter(a => a.branchId === targetBranchId)
      : allAppointments;
    const onlineApts = filteredApts.filter(a => a.paymentMethod === 'Online');
    const salonApts  = filteredApts.filter(a => a.paymentMethod === 'Pay at Salon');
    const paidApts   = filteredApts.filter(a => a.paymentStatus === 'paid');
    const pendingApts = filteredApts.filter(a => a.paymentStatus === 'pending');
    const totalCollected = paidApts.reduce((s, a) => s + (a.total || 0), 0);

    // --- Coupon Usage ---
    const couponUsage = coupons.map(c => {
      const ca = allAppointments.filter(a => a.couponCode === c.code);
      const savings = ca.reduce((s, a) => s + (a.discount || 0), 0);
      return { ...c, timesUsed: ca.length, totalSavings: savings };
    }).filter(c => c.timesUsed > 0 || c.active);

    // --- Appointment Status Breakdown ---
    const statusCounts = {
      pending:     filteredApts.filter(a => a.status === 'pending').length,
      accepted:    filteredApts.filter(a => a.status === 'accepted').length,
      completed:   filteredApts.filter(a => a.status === 'completed').length,
      rejected:    filteredApts.filter(a => a.status === 'rejected').length,
      cancelled:   filteredApts.filter(a => a.status === 'cancelled').length,
      rescheduled: filteredApts.filter(a => a.status === 'rescheduled').length,
    };

    container.innerHTML = `
      <!-- KPI Summary Row - Interactive Symbol Buttons -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 24px;">
        ${[
          { label: 'Total Revenue 🔍', value: window.salonStore.formatCurrency(stats.totalRevenue), icon: '💵', cls: 'gold', action: "window.headAdminController.openBranchRevenueBreakdownModal()", hint: "Click symbol or card to inspect per-branch revenue breakdown" },
          { label: 'Total Bookings 🔍', value: stats.totalAppointments, icon: '📅', cls: '', action: "window.headAdminController.openPlatformAppointmentsModal('all')", hint: "Click symbol or card to inspect platform-wide appointment log" },
          { label: 'Completed Bookings 🔍', value: statusCounts.completed, icon: '✨', cls: 'emerald', action: "window.headAdminController.openPlatformAppointmentsModal('status', 'completed')", hint: "Click symbol or card to view completed appointments" },
          { label: 'Pending Bookings 🔍', value: statusCounts.pending, icon: '⏳', cls: 'purple', action: "window.headAdminController.openPlatformAppointmentsModal('status', 'pending')", hint: "Click symbol or card to view pending appointments" },
          { label: 'Cancelled Bookings 🔍', value: statusCounts.cancelled, icon: '🚫', cls: 'rose', action: "window.headAdminController.openPlatformAppointmentsModal('status', 'cancelled')", hint: "Click symbol or card to view cancelled appointments" },
          { label: 'Active Coupons 🔍', value: stats.activeCoupons, icon: '🎟️', cls: '', action: "window.headAdminController.switchSection('coupons')", hint: "Click symbol or card to manage promotional coupons" },
        ].map(k => `
          <div class="glass-card stat-card ${k.cls} interactive-report-kpi" 
               style="padding: 16px; cursor: pointer; border: 1px solid var(--border-subtle); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative;" 
               onclick="${k.action}" 
               title="${k.hint}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <button type="button" class="stat-icon-badge" style="cursor: pointer; border: none; font-size: 20px;" onclick="event.stopPropagation(); ${k.action};" title="${k.hint}">
                ${k.icon}
              </button>
              <span style="font-size: 10px; color: var(--text-gold); background: rgba(212,175,55,0.12); padding: 3px 8px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(212,175,55,0.25);">
                Access Data →
              </span>
            </div>
            <div style="font-size: 20px; font-weight: 800; color: var(--text-gold); margin-bottom: 2px;">${k.value}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">${k.label}</div>
          </div>
        `).join('')}
      </div>

      <!-- Multi-Branch Revenue Chart -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <h3 style="font-family: var(--font-heading); font-size: 18px; margin-bottom: 6px; color: var(--text-gold);">🏢 Multi-Branch Revenue Comparison</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Aggregated revenue across all registered salon locations. Click any branch to view full operational details.</p>
        <div class="chart-bar-container">
          ${stats.branchBreakdown.map(b => {
            const pct = Math.round((b.revenue / maxRev) * 100);
            return `
              <div class="chart-bar-row" style="cursor: pointer;" onclick="window.headAdminController.openViewBranchModal('${b.id}')" title="Click to view details for ${b.name}">
                <div class="chart-bar-label">
                  <span>${b.name} (${b.city}) <span class="badge ${b.status === 'active' ? 'badge-active' : 'badge-deactivated'}" style="font-size:9px; margin-left:4px;">${b.status}</span> 🔍</span>
                  <span><strong>${window.salonStore.formatCurrency(b.revenue)}</strong> (${b.appointmentCount} bookings)</span>
                </div>
                <div class="chart-bar-track">
                  <div class="chart-bar-fill" style="width: ${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Branch-wise Appointments, Customers & Revenue Summary Table -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <h3 style="font-family: var(--font-heading); font-size: 18px; color: var(--text-gold); margin-bottom: 4px;">📍 Branch-wise Appointments, Customers & Revenue Summary</h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Consolidated performance metrics broken down by individual salon branch location.</p>
        <div class="table-responsive">
          <table class="admin-table" style="font-size: 12px;">
            <thead>
              <tr>
                <th>Branch Location</th>
                <th>Status</th>
                <th>Branch Appointments</th>
                <th>Unique Customers</th>
                <th>Branch Revenue</th>
                <th>Avg Spend / Client</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${stats.branchBreakdown.map(b => {
                const avgSpend = b.totalCustomers > 0 ? Math.round(b.revenue / b.totalCustomers) : 0;
                return `
                  <tr>
                    <td><strong>🏢 ${b.name} (${b.city})</strong></td>
                    <td><span class="badge ${b.status === 'active' ? 'badge-active' : 'badge-deactivated'}">${b.status}</span></td>
                    <td><strong>${b.appointmentCount}</strong> bookings</td>
                    <td><strong style="color:var(--accent-purple);">${b.totalCustomers}</strong> clients</td>
                    <td><strong style="color:var(--text-gold);">${window.salonStore.formatCurrency(b.revenue)}</strong></td>
                    <td>${window.salonStore.formatCurrency(avgSpend)}</td>
                    <td>
                      <button type="button" class="btn btn-sm btn-outline-gold" onclick="window.headAdminController.openViewBranchModal('${b.id}')">
                        Inspect Branch →
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Service-wise Revenue with Branch Filter -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; color: var(--text-gold); margin-bottom: 4px;">✂️ Service-wise Bookings & Revenue</h3>
            <p style="font-size: 12px; color: var(--text-muted);">Filter by branch to inspect service-level performance.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <label style="font-size: 12px; font-weight: 700; color: var(--text-gold);">Branch:</label>
            <select id="reportsBranchSelector" class="form-control" style="width: 220px; font-size: 12px;" onchange="window.headAdminController.renderReports(this.value)">
              <option value="all" ${selectedBranchId === 'all' ? 'selected' : ''}>🌐 All Branches</option>
              ${branches.map(b => `<option value="${b.id}" ${selectedBranchId === b.id ? 'selected' : ''}>📍 ${b.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="table-responsive">
          <table class="admin-table" style="font-size: 12px;">
            <thead><tr><th>Service</th><th>Category</th><th>Unit Price</th><th>Bookings</th><th>Revenue</th><th>Share</th></tr></thead>
            <tbody>
              ${srvRevenue.map(s => {
                const share = totalSrvRev > 0 ? ((s.totalRevenue / totalSrvRev) * 100).toFixed(1) : '0.0';
                return `<tr>
                  <td><strong>${s.name}</strong></td>
                  <td><span class="badge badge-gold" style="font-size:10px;">${s.categoryName}</span></td>
                  <td>${window.salonStore.formatCurrency(s.unitPrice)}</td>
                  <td><strong>${s.bookingCount}</strong></td>
                  <td><strong style="color: var(--text-gold);">${window.salonStore.formatCurrency(s.totalRevenue)}</strong></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="font-weight:700; min-width:38px;">${share}%</span>
                      <div style="width:60px; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                        <div style="width:${share}%; height:100%; background:var(--accent-gold);"></div>
                      </div>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Summary - Interactive Cards -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <h3 style="font-family: var(--font-heading); font-size: 18px; color: var(--text-gold); margin-bottom: 16px;">💳 Payment Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--border-subtle); cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" 
               onclick="window.headAdminController.openPlatformAppointmentsModal('paymentMethod', 'Online')" 
               title="Click to view Online Payment appointments">
            <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px; display:flex; justify-content:space-between;">
              <span>Online Payments 🔍</span>
              <span>💳</span>
            </div>
            <div style="font-size:20px; font-weight:800; color:var(--accent-emerald);">${onlineApts.length}</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Revenue: ${window.salonStore.formatCurrency(onlineApts.filter(a=>a.paymentStatus==='paid').reduce((s,a)=>s+(a.total||0),0))}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--border-subtle); cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" 
               onclick="window.headAdminController.openPlatformAppointmentsModal('paymentMethod', 'Pay at Salon')" 
               title="Click to view Pay at Salon appointments">
            <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px; display:flex; justify-content:space-between;">
              <span>Pay at Salon 🔍</span>
              <span>💵</span>
            </div>
            <div style="font-size:20px; font-weight:800; color:var(--accent-purple);">${salonApts.length}</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Revenue: ${window.salonStore.formatCurrency(salonApts.filter(a=>a.paymentStatus==='paid').reduce((s,a)=>s+(a.total||0),0))}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--border-subtle); cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" 
               onclick="window.headAdminController.openPlatformAppointmentsModal('paymentStatus', 'paid')" 
               title="Click to view Paid appointments">
            <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px; display:flex; justify-content:space-between;">
              <span>Paid 🔍</span>
              <span>✓</span>
            </div>
            <div style="font-size:20px; font-weight:800; color:var(--accent-gold);">${paidApts.length}</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Total: ${window.salonStore.formatCurrency(totalCollected)}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--border-subtle); cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" 
               onclick="window.headAdminController.openPlatformAppointmentsModal('paymentStatus', 'pending')" 
               title="Click to view Pending Payment appointments">
            <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px; display:flex; justify-content:space-between;">
              <span>Pending Payment 🔍</span>
              <span>⏳</span>
            </div>
            <div style="font-size:20px; font-weight:800; color:var(--accent-rose);">${pendingApts.length}</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Awaiting collection</div>
          </div>
        </div>
      </div>

      <!-- Coupon / Discount Usage -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <h3 style="font-family: var(--font-heading); font-size: 18px; color: var(--text-gold); margin-bottom: 16px;">🎟️ Coupon & Discount Usage Report</h3>
        <div class="table-responsive">
          <table class="admin-table" style="font-size: 12px;">
            <thead><tr><th>Code</th><th>Title</th><th>Discount</th><th>Status</th><th>Times Used</th><th>Usage Limit</th><th>Total Savings Given</th></tr></thead>
            <tbody>
              ${couponUsage.map(c => `
                <tr>
                  <td><strong style="color:var(--text-gold);">${c.code}</strong></td>
                  <td>${c.title}</td>
                  <td>${c.discountType === 'percentage' ? `${c.discountValue}%` : window.salonStore.formatCurrency(c.discountValue)}</td>
                  <td><span class="badge ${c.active ? 'badge-active' : 'badge-deactivated'}">${c.active ? 'Active' : 'Inactive'}</span></td>
                  <td><strong>${c.timesUsed}</strong></td>
                  <td>${c.usageLimit || '∞'}</td>
                  <td><strong style="color:var(--accent-rose);">${window.salonStore.formatCurrency(c.totalSavings)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderAdmins() {
    const tbody = document.getElementById('headAdminAdminsTableBody');
    if (!tbody) return;

    const admins = window.salonStore.getBranchAdmins();
    tbody.innerHTML = admins.map(a => {
      const targetBranchId = a.branchId || 'BR-01';
      return `
        <tr style="cursor: pointer; transition: background 0.2s ease;" onclick="window.headAdminController.openViewBranchModal('${targetBranchId}')" title="Click row to view ${a.branchName} Details">
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="admin-avatar" style="width: 34px; height: 34px; font-size: 11px;">
                ${(a.name || 'Admin').split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <strong>${a.name}</strong>
                <div style="font-size: 10px; color: var(--text-gold); font-weight: 600;">ID: ${a.loginId || a.id}</div>
                <div style="font-size: 10px; color: var(--text-muted);">Pass: ${a.password || 'branchadmin123'}</div>
              </div>
            </div>
          </td>
          <td><strong style="color: var(--text-main);">${a.email}</strong></td>
          <td>${a.phone}</td>
          <td><span class="badge badge-gold" style="font-size: 11px;">🏢 ${a.branchName}</span></td>
          <td><span class="badge badge-${a.status === 'deactivated' ? 'deactivated' : 'active'}">● ${a.status || 'active'}</span></td>
          <td onclick="event.stopPropagation();">
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-sm btn-outline-gold" style="cursor: pointer;" onclick="window.headAdminController.openViewBranchModal('${targetBranchId}')">
                🔍 Details & Data
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- Handlers ---
  handleAddBranch(e) {
    e.preventDefault();
    const form = e.target;
    const branchData = {
      name: form.branchName.value,
      city: form.branchCity.value,
      address: form.branchAddress.value,
      phone: form.branchPhone.value,
      email: form.branchEmail.value,
      adminName: form.branchAdminName.value,
      adminEmail: form.branchAdminEmail.value,
      adminPassword: form.branchAdminPassword.value || 'luxe123',
      openingTime: form.branchOpening.value,
      closingTime: form.branchClosing.value,
      chairs: form.branchChairs.value,
      image: form.branchImage.value || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'
    };

    if (window.salonValidator) {
      const bErr = window.salonValidator.validateBranchName(branchData.name);
      if (bErr) { window.app.showToast(`⚠️ ${bErr}`, 'error'); return; }

      const aErr = window.salonValidator.validateBranchAdminId(branchData.adminEmail);
      if (aErr) { window.app.showToast(`⚠️ ${aErr}`, 'error'); return; }

      const pErr = window.salonValidator.validateMobile(branchData.phone);
      if (pErr) { window.app.showToast(`⚠️ ${pErr}`, 'error'); return; }

      const addrErr = window.salonValidator.validateAddress(branchData.address);
      if (addrErr) { window.app.showToast(`⚠️ ${addrErr}`, 'error'); return; }

      const openErr = window.salonValidator.validateIndianTime(branchData.openingTime, 'Opening Time');
      if (openErr) { window.app.showToast(`⚠️ ${openErr}`, 'error'); return; }

      const closeErr = window.salonValidator.validateIndianTime(branchData.closingTime, 'Closing Time');
      if (closeErr) { window.app.showToast(`⚠️ ${closeErr}`, 'error'); return; }
    }

    const newBranch = window.salonStore.addBranch(branchData);
    this.closeModal('addBranchModal');
    form.reset();
    window.app.showToast(`Branch "${newBranch.name}" created with Admin Credentials!`, 'success');
    this.render();
  }

  openEditBranchModal(branchId) {
    const branch = window.salonStore.getBranchById(branchId);
    if (!branch) return;

    const admin = window.salonStore.getBranchAdmin(branchId);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('editBranchId', branch.id);
    setVal('editBranchName', branch.name);
    setVal('editBranchCity', branch.city);
    setVal('editBranchChairs', branch.chairs);
    setVal('editBranchAddress', branch.address);
    setVal('editBranchPhone', branch.phone);
    setVal('editBranchEmail', branch.email);
    setVal('editBranchOpening', branch.openingTime);
    setVal('editBranchClosing', branch.closingTime);
    setVal('editBranchStatus', branch.status);
    setVal('editBranchAdminName', branch.adminName || admin.name);
    setVal('editBranchAdminEmail', admin.email);
    setVal('editBranchAdminPassword', admin.password || 'luxe123');
    setVal('editBranchImage', branch.image);

    this.openModal('editBranchModal');
  }

  handleEditBranch(e) {
    e.preventDefault();
    const branchId = document.getElementById('editBranchId').value;
    if (!branchId) return;

    const updates = {
      name: document.getElementById('editBranchName').value,
      city: document.getElementById('editBranchCity').value,
      chairs: parseInt(document.getElementById('editBranchChairs').value) || 6,
      address: document.getElementById('editBranchAddress').value,
      phone: document.getElementById('editBranchPhone').value,
      email: document.getElementById('editBranchEmail').value,
      openingTime: document.getElementById('editBranchOpening').value,
      closingTime: document.getElementById('editBranchClosing').value,
      status: document.getElementById('editBranchStatus').value,
      adminName: document.getElementById('editBranchAdminName').value,
      adminEmail: document.getElementById('editBranchAdminEmail').value,
      adminPassword: document.getElementById('editBranchAdminPassword').value,
      image: document.getElementById('editBranchImage').value
    };

    if (window.salonValidator) {
      const bErr = window.salonValidator.validateBranchName(updates.name);
      if (bErr) { window.app.showToast(`⚠️ ${bErr}`, 'error'); return; }

      const aErr = window.salonValidator.validateBranchAdminId(updates.adminEmail);
      if (aErr) { window.app.showToast(`⚠️ ${aErr}`, 'error'); return; }

      const pErr = window.salonValidator.validateMobile(updates.phone);
      if (pErr) { window.app.showToast(`⚠️ ${pErr}`, 'error'); return; }

      const addrErr = window.salonValidator.validateAddress(updates.address);
      if (addrErr) { window.app.showToast(`⚠️ ${addrErr}`, 'error'); return; }

      const openErr = window.salonValidator.validateIndianTime(updates.openingTime, 'Opening Time');
      if (openErr) { window.app.showToast(`⚠️ ${openErr}`, 'error'); return; }

      const closeErr = window.salonValidator.validateIndianTime(updates.closingTime, 'Closing Time');
      if (closeErr) { window.app.showToast(`⚠️ ${closeErr}`, 'error'); return; }
    }

    const updated = window.salonStore.updateBranch(branchId, updates);
    this.closeModal('editBranchModal');
    if (updated) {
      window.app.showToast(`Branch "${updated.name}" & Admin Credentials updated successfully!`, 'success');
      this.render();
    }
  }

  openViewBranchModal(branchId) {
    const branch = window.salonStore.getBranchById(branchId);
    if (!branch) return;

    const admin = window.salonStore.getBranchAdmin(branchId);
    const branchApts = window.salonStore.getAppointments(branchId);
    const stats = window.salonStore.getBranchStats(branchId);
    const isDeactivated = branch.status === 'deactivated';

    const modalBody = document.getElementById('viewBranchModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="background: var(--duo-lime-soft); padding: 12px 14px; border-radius: 12px; border: 2px solid var(--duo-black-stroke); margin-bottom: 12px; box-shadow: 2px 2px 0px var(--duo-black-stroke);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-family: var(--font-heading); font-size: 18px; color: #000000; font-weight: 800; margin: 0;">${branch.name}</h3>
              <span class="badge ${isDeactivated ? 'badge-deactivated' : 'badge-active'}" style="font-weight: 800; font-size: 10px; padding: 2px 8px;">
                ● ${isDeactivated ? 'Deactivated Branch' : 'Active & Operational'}
              </span>
            </div>
            <p style="font-size: 11.5px; color: #334155; margin-top: 4px; font-weight: 500;">
              📍 ${branch.address} • 📞 ${branch.phone} • ✉️ ${branch.email}
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 800;">Branch Rating</div>
            <div style="font-size: 15px; font-weight: 900; color: #000000;">★ ${branch.rating} (${branch.reviewCount} reviews)</div>
          </div>
        </div>
      </div>

      <!-- Compact Metrics Grid -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 12px;">
        <div class="glass-card duo-card" style="padding: 10px; border: 1.5px solid var(--duo-black-stroke); background: #ffffff; border-radius: 8px; box-shadow: 1.5px 1.5px 0px var(--duo-black-stroke);">
          <div style="font-size: 10px; color: #475569; font-weight: 700;">Total Revenue</div>
          <div style="font-size: 16px; font-weight: 900; color: #000000; margin-top: 2px;">${window.salonStore.formatCurrency(stats ? stats.todayRevenue : 0)}</div>
          <div style="font-size: 9px; color: #64748b;">Today's sales</div>
        </div>
        <div class="glass-card duo-card" style="padding: 10px; border: 1.5px solid var(--duo-black-stroke); background: #ffffff; border-radius: 8px; box-shadow: 1.5px 1.5px 0px var(--duo-black-stroke);">
          <div style="font-size: 10px; color: #475569; font-weight: 700;">Total Bookings</div>
          <div style="font-size: 16px; font-weight: 900; color: #000000; margin-top: 2px;">${branchApts.length}</div>
          <div style="font-size: 9px; color: #64748b;">Lifetime appointments</div>
        </div>
        <div class="glass-card duo-card" style="padding: 10px; border: 1.5px solid var(--duo-black-stroke); background: #ffffff; border-radius: 8px; box-shadow: 1.5px 1.5px 0px var(--duo-black-stroke);">
          <div style="font-size: 10px; color: #475569; font-weight: 700;">Station Capacity</div>
          <div style="font-size: 16px; font-weight: 900; color: #000000; margin-top: 2px;">${branch.chairs} Chairs</div>
          <div style="font-size: 9px; color: #64748b;">Active styling seats</div>
        </div>
        <div class="glass-card duo-card" style="padding: 10px; border: 1.5px solid var(--duo-black-stroke); background: #ffffff; border-radius: 8px; box-shadow: 1.5px 1.5px 0px var(--duo-black-stroke);">
          <div style="font-size: 10px; color: #475569; font-weight: 700;">Working Hours</div>
          <div style="font-size: 13.5px; font-weight: 900; color: #000000; margin-top: 4px;">${branch.openingTime} - ${branch.closingTime}</div>
          <div style="font-size: 9px; color: #64748b;">Daily operational schedule</div>
        </div>
      </div>

      <!-- Branch Admin Credentials Box -->
      <div style="background: #ffffff; padding: 10px 12px; border-radius: 10px; border: 1.5px solid var(--duo-black-stroke); margin-bottom: 12px; box-shadow: 2px 2px 0px var(--duo-black-stroke);">
        <h5 style="color: #000000; font-size: 12px; margin-bottom: 6px; font-weight: 800; display: flex; align-items: center; gap: 4px;">
          <svg class="duo-svg" viewBox="0 0 24 24" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2" fill="#b2f347" stroke="#111827" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#111827" stroke-width="2.5" fill="none"/></svg>
          <span>Branch Admin Credentials</span>
        </h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 4px 10px; font-size: 11px;">
          <div><span style="color:#475569; font-weight:500;">Admin Name:</span> <strong style="color: #000000;">${branch.adminName || admin.name}</strong></div>
          <div><span style="color:#475569; font-weight:500;">Login ID:</span> <strong style="color: #000000;">${admin.loginId || admin.id}</strong></div>
          <div><span style="color:#475569; font-weight:500;">Login Email:</span> <strong style="color: #000000;">${admin.email}</strong></div>
          <div><span style="color:#475569; font-weight:500;">Login Password:</span> <strong style="color: #000000;">${admin.password || 'branchadmin123'}</strong></div>
          <div><span style="color:#475569; font-weight:500;">Contact Phone:</span> <strong style="color: #000000;">${branch.phone}</strong></div>
        </div>
      </div>

      <!-- Service-wise Revenue Collection Table for this Branch -->
      <div style="margin-bottom: 12px;">
        <h5 style="font-size: 12px; color: #000000; font-weight: 800; margin-bottom: 6px;">✂️ Service-wise Revenue Collection Breakdown</h5>
        <div class="table-responsive" style="max-height: 160px; overflow-y: auto;">
          <table class="admin-table" style="font-size: 11px;">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Bookings</th>
                <th>Total Revenue Collected</th>
              </tr>
            </thead>
            <tbody>
              ${window.salonStore.getServiceWiseRevenue(branch.id).map(s => `
                <tr>
                  <td><strong style="color: #000000;">${s.name}</strong></td>
                  <td><span class="duo-badge" style="font-size: 9px; padding: 1px 6px;">${s.categoryName}</span></td>
                  <td>${window.salonStore.formatCurrency(s.unitPrice)}</td>
                  <td><strong style="color: #000000;">${s.bookingCount}</strong></td>
                  <td><strong style="color: #000000;">${window.salonStore.formatCurrency(s.totalRevenue)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Branch Appointments Table -->
      <div style="margin-bottom: 8px;">
        <h5 style="font-size: 12px; color: #000000; font-weight: 800; margin-bottom: 6px;">📅 Branch Appointments Log (${branchApts.length})</h5>
        ${branchApts.length === 0 ? '<p style="font-size: 11px; color: #64748b;">No appointments booked for this branch yet.</p>' : `
          <div class="table-responsive" style="max-height: 180px; overflow-y: auto;">
            <table class="admin-table" style="font-size: 11px;">
              <thead>
                <tr>
                  <th>Apt ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${branchApts.map(a => `
                  <tr>
                    <td><strong style="color: #000000;">#${a.id}</strong></td>
                    <td><span style="color: #000000; font-weight: 600;">${a.customerName}</span><br/><span style="font-size: 9.5px; color: #64748b;">${a.customerPhone}</span></td>
                    <td>${a.serviceNames.join(', ')}</td>
                    <td>${a.date} @ ${a.timeSlot}</td>
                    <td><strong style="color: #000000;">${window.salonStore.formatCurrency(a.total)}</strong></td>
                    <td><span class="badge badge-${a.status}" style="font-size: 9.5px;">● ${a.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Action Footer -->
      <div style="display: flex; gap: 6px; justify-content: flex-end; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
        <button class="duo-btn-secondary" style="padding: 5px 10px; font-size: 11px; border-radius: 6px !important;" onclick="window.headAdminController.closeModal('viewBranchModal'); window.headAdminController.openEditBranchModal('${branch.id}');">
          Edit Branch & Credentials
        </button>
        <button class="btn btn-sm ${isDeactivated ? 'duo-btn-primary' : 'btn-danger'}" style="padding: 5px 10px; font-size: 11px; border-radius: 6px !important;" onclick="window.headAdminController.closeModal('viewBranchModal'); window.headAdminController.toggleBranchStatus('${branch.id}');">
          ${isDeactivated ? 'Activate Branch' : 'Deactivate Branch'}
        </button>
      </div>
    `;

    this.openModal('viewBranchModal');
  }

  openBranchRevenueBreakdownModal() {
    const stats = window.salonStore.getPlatformStats();
    const totalRev = stats.totalRevenue || 0;
    const branches = stats.branchBreakdown || [];

    const modalBody = document.getElementById('branchRevenueBreakdownModalBody');
    if (!modalBody) return;

    const colors = ['var(--accent-gold)', 'var(--accent-emerald)', 'var(--accent-purple)', 'var(--accent-rose)', '#3B82F6', '#10B981'];

    modalBody.innerHTML = `
      <!-- Top Overview Banner -->
      <div style="background: linear-gradient(135deg, rgba(32,38,55,0.95) 0%, rgba(20,24,35,0.95) 100%); padding: 20px; border-radius: 16px; border: 1px solid var(--border-gold); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Platform Total Revenue</div>
            <div style="font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: var(--gold-light); margin-top: 4px;">
              ${window.salonStore.formatCurrency(totalRev)}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Aggregated across ${stats.totalBranches} total branches (${stats.activeBranches} active, ${stats.inactiveBranches} inactive)
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Total Bookings</div>
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-purple);">${stats.totalAppointments} Bookings</div>
          </div>
        </div>

        <!-- Revenue Distribution Progress Bar -->
        <div style="margin-top: 18px;">
          <div style="font-size: 11px; color: var(--text-gold); font-weight: 700; margin-bottom: 8px;">📊 Revenue Contribution Distribution by Branch</div>
          <div style="display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.06);">
            ${branches.map((b, i) => {
              const pct = totalRev > 0 ? ((b.revenue / totalRev) * 100).toFixed(1) : (100 / branches.length).toFixed(1);
              return `<div style="width: ${pct}%; background: ${colors[i % colors.length]};" title="${b.name}: ${window.salonStore.formatCurrency(b.revenue)} (${pct}%)"></div>`;
            }).join('')}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; font-size: 11px; color: var(--text-muted);">
            ${branches.map((b, i) => {
              const pct = totalRev > 0 ? ((b.revenue / totalRev) * 100).toFixed(1) : '0.0';
              return `
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: ${colors[i % colors.length]}; display: inline-block;"></span>
                  <strong>${b.city}:</strong> ${pct}% (${window.salonStore.formatCurrency(b.revenue)})
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Per-Branch Revenue Table -->
      <h5 style="font-size: 14px; color: var(--text-gold); font-weight: 700; margin-bottom: 12px;">🏢 Individual Branch Revenue Breakdown Table</h5>
      <div class="table-responsive">
        <table class="admin-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>Branch Location</th>
              <th>Status</th>
              <th>Total Revenue (₹)</th>
              <th>Bookings Count</th>
              <th>Average Ticket</th>
              <th>% Share</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${branches.map((b, i) => {
              const pct = totalRev > 0 ? ((b.revenue / totalRev) * 100).toFixed(1) : '0.0';
              const avgTicket = b.appointmentCount > 0 ? Math.round(b.revenue / b.appointmentCount) : 0;
              const isDeactivated = b.status === 'deactivated';

              return `
                <tr>
                  <td>
                    <strong>${b.name}</strong>
                    <div style="font-size: 10px; color: var(--text-muted);">${b.city}</div>
                  </td>
                  <td>
                    <span class="badge ${isDeactivated ? 'badge-deactivated' : 'badge-active'}">
                      ● ${isDeactivated ? 'Deactivated' : 'Active'}
                    </span>
                  </td>
                  <td><strong style="color: var(--text-gold); font-size: 14px;">${window.salonStore.formatCurrency(b.revenue)}</strong></td>
                  <td><strong>${b.appointmentCount}</strong></td>
                  <td>${window.salonStore.formatCurrency(avgTicket)}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 700; min-width: 42px;">${pct}%</span>
                      <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; width: 60px;">
                        <div style="width: ${pct}%; height: 100%; background: ${colors[i % colors.length]};"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-gold" onclick="window.headAdminController.closeModal('branchRevenueBreakdownModal'); window.headAdminController.openViewBranchModal('${b.id}');">
                      🔍 Inspect Branch Info
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.openModal('branchRevenueBreakdownModal');
  }

  handleAddCategory(e) {
    e.preventDefault();
    const form = e.target;
    const catData = {
      name: form.catName.value,
      icon: form.catIcon.value || '✨',
      description: form.catDesc.value,
      color: form.catColor.value || '#D4AF37',
      active: (form.catStatus?.value || 'active') === 'active'
    };

    window.salonStore.addCategory(catData);
    this.closeModal('addCategoryModal');
    form.reset();
    window.app.showToast(`Category "${catData.name}" created!`, 'success');
    this.render();
  }

  handleAddService(e) {
    e.preventDefault();
    const form = e.target;
    const serviceData = {
      name: form.serviceName.value,
      categoryId: form.serviceCategory.value,
      price: form.servicePrice.value,
      duration: form.serviceDuration.value,
      description: form.serviceDescription.value,
      popular: form.servicePopular.checked,
      image: form.serviceImage.value || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    };

    if (window.salonValidator) {
      const sErr = window.salonValidator.validateServiceTitle(serviceData.name);
      if (sErr) { window.app.showToast(`⚠️ ${sErr}`, 'error'); return; }

      const pErr = window.salonValidator.validateNumeric(serviceData.price, 'Price', 1);
      if (pErr) { window.app.showToast(`⚠️ ${pErr}`, 'error'); return; }

      const dErr = window.salonValidator.validateNumeric(serviceData.duration, 'Duration', 1);
      if (dErr) { window.app.showToast(`⚠️ ${dErr}`, 'error'); return; }
    }

    window.salonStore.addService(serviceData);
    this.closeModal('addServiceModal');
    form.reset();
    window.app.showToast(`Service "${serviceData.name}" added to catalog!`, 'success');
    this.render();
  }

  handleAddCoupon(e) {
    e.preventDefault();
    const form = e.target;
    const applicableServicesSelect = document.getElementById('couponApplicableServicesSelect');
    const selectedServices = applicableServicesSelect
      ? Array.from(applicableServicesSelect.selectedOptions).map(o => o.value)
      : [];
    const couponData = {
      code: (form.couponCode.value || '').toUpperCase().trim(),
      title: form.couponTitle.value,
      description: form.couponDesc ? form.couponDesc.value : '',
      discountType: form.couponType.value,
      discountValue: parseFloat(form.couponValue.value) || 0,
      minOrderAmount: parseFloat(form.couponMinOrder.value) || 0,
      maxDiscount: parseFloat(form.couponMaxDiscount.value) || 0,
      validUntil: form.couponExpiry.value,
      usageLimit: parseInt(form.couponUsageLimit?.value) || 500,
      applicableServices: selectedServices,
      active: (form.couponStatus?.value || 'active') === 'active'
    };

    const codeErr = window.salonValidator.validatePromoCode(couponData.code, 'Promo Code');
    if (codeErr) { window.app.showToast(`⚠️ ${codeErr}`, 'error'); return; }

    const titleErr = window.salonValidator.validateCampaignTitle(couponData.title);
    if (titleErr) { window.app.showToast(`⚠️ ${titleErr}`, 'error'); return; }

    const valErr = window.salonValidator.validateNumeric(couponData.discountValue, 'Discount Value', 1);
    if (valErr) { window.app.showToast(`⚠️ ${valErr}`, 'error'); return; }

    const limitErr = window.salonValidator.validateNumeric(couponData.usageLimit, 'Usage Limit', 1);
    if (limitErr) { window.app.showToast(`⚠️ ${limitErr}`, 'error'); return; }

    const expiryErr = window.salonValidator.validateDate(couponData.validUntil, 'Valid Until Date');
    if (expiryErr) { window.app.showToast(`⚠️ ${expiryErr}`, 'error'); return; }

    window.salonStore.addCoupon(couponData);
    this.closeModal('addCouponModal');
    form.reset();
    window.app.showToast(`Coupon "${couponData.code}" created${couponData.active ? ' and is Active!' : ' (Inactive).'}`, 'success');
    this.render();
  }

  populateCategorySelect(elementId) {
    const select = document.getElementById(elementId);
    if (!select) return;
    const cats = window.salonStore.getCategories();
    select.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  }

  openPlatformCustomersModal() {
    let modal = document.getElementById('headAdminCustomersModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'headAdminCustomersModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 750px;">
          <div class="modal-header">
            <h3 class="modal-title">👥 Ecosystem Customer Directory (All Branches)</h3>
            <button class="modal-close-btn" onclick="window.headAdminController.closeModal('headAdminCustomersModal')">✕</button>
          </div>
          <div class="modal-body" id="headAdminCustomersModalBody"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.headAdminController.closeModal('headAdminCustomersModal')">Close Directory</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const container = document.getElementById('headAdminCustomersModalBody');
    const appointments = window.salonStore.getAppointments();
    const customerMap = {};

    appointments.forEach(a => {
      const key = a.customerEmail || a.customerPhone || a.customerName;
      const branch = window.salonStore.getBranchById(a.branchId);
      if (!customerMap[key]) {
        customerMap[key] = {
          name: a.customerName,
          email: a.customerEmail,
          phone: a.customerPhone,
          branchName: branch ? branch.name : 'Main',
          bookingCount: 0,
          totalSpent: 0
        };
      }
      customerMap[key].bookingCount += 1;
      if (a.status === 'completed' || a.status === 'confirmed' || a.status === 'accepted') {
        customerMap[key].totalSpent += (a.total || 0);
      }
    });

    const customers = Object.values(customerMap);

    container.innerHTML = `
      <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
        Registered clients across all active salon locations in the Haute ecosystem.
      </div>
      <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
        <table class="admin-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Home Branch</th>
              <th>Bookings</th>
              <th>Total Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone}</td>
                <td>${c.email}</td>
                <td><span class="badge badge-gold">${c.branchName}</span></td>
                <td><strong>${c.bookingCount}</strong></td>
                <td><strong style="color: var(--text-gold);">${window.salonStore.formatCurrency(c.totalSpent)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.openModal('headAdminCustomersModal');
  }

  openPlatformAppointmentsModal(filterType = 'all', filterValue = null) {
    let modal = document.getElementById('headAdminAppointmentsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'headAdminAppointmentsModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
          <div class="modal-header">
            <h3 class="modal-title" id="headAdminAppointmentsModalTitle">📅 Platform-Wide Appointments Log</h3>
            <button class="modal-close-btn" onclick="window.headAdminController.closeModal('headAdminAppointmentsModal')">✕</button>
          </div>
          <div class="modal-body" id="headAdminAppointmentsModalBody"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.headAdminController.closeModal('headAdminAppointmentsModal')">Close Log</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = document.getElementById('headAdminAppointmentsModalTitle');
    const container = document.getElementById('headAdminAppointmentsModalBody');
    let appointments = window.salonStore.getAppointments();

    let filterLabel = 'Real-time audit log of all appointments across all salon branches.';
    if (filterType === 'status' && filterValue) {
      appointments = appointments.filter(a => a.status === filterValue);
      filterLabel = `Filtered appointments with status: <strong style="color:var(--text-gold); text-transform: capitalize;">${filterValue}</strong> (${appointments.length} records found).`;
      if (titleEl) titleEl.innerHTML = `📅 Platform Appointments Log (${filterValue.toUpperCase()})`;
    } else if (filterType === 'paymentMethod' && filterValue) {
      appointments = appointments.filter(a => a.paymentMethod === filterValue);
      filterLabel = `Filtered appointments paid via: <strong style="color:var(--text-gold);">${filterValue}</strong> (${appointments.length} records found).`;
      if (titleEl) titleEl.innerHTML = `💳 Payment Summary: ${filterValue}`;
    } else if (filterType === 'paymentStatus' && filterValue) {
      appointments = appointments.filter(a => a.paymentStatus === filterValue);
      filterLabel = `Filtered appointments with payment status: <strong style="color:var(--text-gold); text-transform: capitalize;">${filterValue}</strong> (${appointments.length} records found).`;
      if (titleEl) titleEl.innerHTML = `💰 Payment Status: ${filterValue.toUpperCase()}`;
    } else {
      if (titleEl) titleEl.innerHTML = `📅 Platform-Wide Appointments Log`;
    }

    container.innerHTML = `
      <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
        ${filterLabel}
      </div>
      <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
        <table class="admin-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>Apt ID</th>
              <th>Branch</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Services</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${appointments.length === 0 ? `
              <tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">No appointment records match this criteria.</td></tr>
            ` : appointments.map(a => {
              const b = window.salonStore.getBranchById(a.branchId);
              return `
                <tr>
                  <td><strong>#${a.id}</strong></td>
                  <td><span class="badge badge-gold">${b ? b.name : a.branchId}</span></td>
                  <td><strong>${a.customerName}</strong><br><span style="font-size: 10px; color: var(--text-muted);">${a.customerPhone}</span></td>
                  <td>${a.date} @ ${a.timeSlot}</td>
                  <td><span style="font-size: 11px; color: var(--text-muted);">${(a.serviceNames || []).join(', ')}</span></td>
                  <td><span style="font-size: 10px;" class="badge badge-${a.paymentStatus === 'paid' ? 'active' : 'deactivated'}">${a.paymentMethod || 'Online'} (${a.paymentStatus || 'pending'})</span></td>
                  <td><span class="badge badge-${a.status}">${a.status}</span></td>
                  <td><strong style="color: var(--text-gold);">${window.salonStore.formatCurrency(a.total || 0)}</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.openModal('headAdminAppointmentsModal');
  }

  openModal(modalId) {
    if (modalId === 'addBranchModal') {
      this.switchSection('add-branch');
      return;
    }
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }
}

window.headAdminController = new HeadAdminController();
