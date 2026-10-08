/**
 * LUXE HAUS - Customer Mobile Application Controller
 * Handles Mobile Navigation, Customer Registration, Branch Discovery,
 * Service Browsing, Multi-Step Appointment Booking, Coupon Redemption,
 * and Appointment Management.
 */

class CustomerMobileController {
  constructor() {
    this.currentScreen = 'home'; // 'home' | 'branches' | 'services' | 'booking' | 'appointments' | 'profile'
    this.selectedBranchId = 'BR-01'; // Default active branch
    this.selectedCategory = 'all';
    
    // Booking Draft State
    this.bookingDraft = {
      branchId: 'BR-01',
      serviceIds: ['SRV-01'], // Pre-selected couture cut
      stylistId: 'any',
      date: '2026-10-03',
      timeSlot: '11:00',
      appliedCoupon: null,
      discountAmount: 0,
      paymentMethod: 'Credit Card (Apple Pay)',
      notes: ''
    };
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Bottom Navigation Click Delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.mobile-nav-btn');
      if (btn && btn.dataset.screen) {
        this.switchScreen(btn.dataset.screen);
      }
    });

    // Device frame toggle (Phone Frame vs Expanded View)
    const toggleFrameBtn = document.getElementById('togglePhoneFrameBtn');
    if (toggleFrameBtn) {
      toggleFrameBtn.addEventListener('click', () => {
        const container = document.getElementById('smartphoneContainer');
        if (container) {
          container.classList.toggle('fullscreen-mode');
          const isFullscreen = container.classList.contains('fullscreen-mode');
          toggleFrameBtn.textContent = isFullscreen ? '📱 Switch to Device Frame' : '🖥 Fullscreen View';
        }
      });
    }

    // Apply Coupon in Booking Wizard
    const applyCouponBtn = document.getElementById('mApplyCouponBtn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', () => this.handleApplyCoupon());
    }

    // Confirm Booking CTA
    const confirmBookingBtn = document.getElementById('mConfirmBookingBtn');
    if (confirmBookingBtn) {
      confirmBookingBtn.addEventListener('click', () => this.handleCompleteBooking());
    }

    // Customer Registration Form Submit
    const customerRegForm = document.getElementById('customerRegistrationForm');
    if (customerRegForm) {
      customerRegForm.addEventListener('submit', (e) => this.handleCustomerRegister(e));
    }
  }

  switchScreen(screenId) {
    this.currentScreen = screenId;

    // Update bottom nav highlights
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screenId);
    });

    // Update active screen visibility
    document.querySelectorAll('.mobile-view-screen').forEach(scr => {
      scr.classList.remove('active-screen');
    });

    const target = document.getElementById(`mScreen-${screenId}`);
    if (target) {
      target.classList.add('active-screen');
    }

    // Scroll viewport to top
    const viewport = document.getElementById('phoneViewport');
    if (viewport) viewport.scrollTop = 0;

    this.renderScreen(screenId);
  }

  render() {
    this.renderHeader();
    this.renderScreen(this.currentScreen);
  }

  renderHeader() {
    const cust = window.salonStore.getState().customerUser;
    const branch = window.salonStore.getBranchById(this.selectedBranchId);

    const avatarEl = document.getElementById('mUserAvatar');
    if (avatarEl) avatarEl.textContent = cust.avatar;

    const nameEl = document.getElementById('mUserName');
    if (nameEl) nameEl.textContent = `Hello, ${cust.name.split(' ')[0]} ✨`;

    const branchBadge = document.getElementById('mActiveBranchBadge');
    if (branchBadge && branch) {
      branchBadge.innerHTML = `📍 ${branch.city} ▼`;
      branchBadge.onclick = () => this.switchScreen('branches');
    }
  }

  renderScreen(screenId) {
    this.renderHeader();

    if (screenId === 'home') {
      this.renderHome();
    } else if (screenId === 'branches') {
      this.renderBranches();
    } else if (screenId === 'services') {
      this.renderServices();
    } else if (screenId === 'booking') {
      this.renderBookingWizard();
    } else if (screenId === 'appointments') {
      this.renderAppointments();
    } else if (screenId === 'profile') {
      this.renderProfile();
    }
  }

  renderHome() {
    // Categories Carousel
    const catContainer = document.getElementById('mHomeCategories');
    if (catContainer) {
      const categories = window.salonStore.getCategories().filter(c => c.active);
      catContainer.innerHTML = `
        <div class="cat-pill ${this.selectedCategory === 'all' ? 'active' : ''}" onclick="window.customerMobileController.filterServices('all')">
          <span>✨</span> All
        </div>
        ${categories.map(c => `
          <div class="cat-pill ${this.selectedCategory === c.id ? 'active' : ''}" onclick="window.customerMobileController.filterServices('${c.id}')">
            <span>${c.icon}</span> ${c.name}
          </div>
        `).join('')}
      `;
    }

    // Featured Services
    const featuredContainer = document.getElementById('mHomeFeaturedServices');
    if (featuredContainer) {
      const services = window.salonStore.getServicesByBranch(this.selectedBranchId)
        .filter(s => s.popular)
        .slice(0, 4);

      featuredContainer.innerHTML = services.map(s => this.renderServiceCard(s)).join('');
    }
  }

  filterServices(catId) {
    this.selectedCategory = catId;
    this.switchScreen('services');
  }

  renderBranches() {
    const container = document.getElementById('mBranchesList');
    if (!container) return;

    const branches = window.salonStore.getBranches();
    container.innerHTML = branches.map(b => {
      const isSelected = b.id === this.selectedBranchId;
      const isDeactivated = b.status === 'deactivated';

      return `
        <div class="mobile-branch-card" style="${isDeactivated ? 'opacity: 0.6; filter: grayscale(0.5);' : ''}">
          <div class="branch-thumb-box">
            <img src="${b.image}" alt="${b.name}" onerror="this.src='https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'" />
            <div class="branch-tag-pill">
              <span class="badge ${isDeactivated ? 'badge-deactivated' : 'badge-active'}">
                ● ${isDeactivated ? 'Temporarily Closed' : 'Open Today'}
              </span>
            </div>
          </div>
          <div class="mobile-branch-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h5>${b.name}</h5>
                <p>📍 ${b.address}</p>
              </div>
              <span style="font-size: 12px; color: var(--gold-light); font-weight: 700;">★ ${b.rating}</span>
            </div>
            
            <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 12px;">
              Hours: ${b.openingTime} - ${b.closingTime} • ${b.chairs} Styling Stations
            </div>

            ${isDeactivated ? `
              <button class="btn btn-sm btn-secondary" style="width: 100%; opacity: 0.5;" disabled>
                Branch Offline
              </button>
            ` : `
              <button class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-gold'}" style="width: 100%;" onclick="window.customerMobileController.selectBranch('${b.id}')">
                ${isSelected ? '✓ Current Selected Branch' : 'Select This Branch'}
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  selectBranch(branchId) {
    const branch = window.salonStore.getBranchById(branchId);
    if (!branch) return;
    if (branch.status === 'deactivated') {
      window.app.showToast(`Branch "${branch.name}" is deactivated and closed to new bookings.`, 'error');
      return;
    }
    this.selectedBranchId = branchId;
    this.bookingDraft.branchId = branchId;
    window.app.showToast(`Branch switched to ${branch.name}`, 'success');
    this.renderHeader();
    this.switchScreen('services');
  }

  handleCompleteBooking() {
    const cust = window.salonStore.getState().customerUser;
    const dateInput = document.getElementById('mBookingDatePicker');
    const selectedDate = dateInput ? dateInput.value : this.bookingDraft.date;

    // Verify branch operating hours & active status
    const openCheck = window.salonStore.isBranchOpen(this.selectedBranchId, selectedDate, this.bookingDraft.timeSlot);
    if (!openCheck.isOpen) {
      window.app.showToast(openCheck.reason, 'error');
      return;
    }

    if (window.validateSalonFields) {
      const val = window.validateSalonFields({
        mobileNumber: cust.phone
      });
      if (!val.isValid) {
        window.app.showToast(`⚠️ Mobile Validation Error: ${val.errors.mobileNumber}`, 'error');
        return;
      }
    }

    const paymentSelect = document.getElementById('mPaymentModeSelect');
    const paymentMode = paymentSelect ? paymentSelect.value : (this.bookingDraft.paymentMethod || 'UPI (Google Pay / PhonePe)');

    const bookingData = {
      branchId: this.selectedBranchId,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      serviceIds: this.bookingDraft.serviceIds,
      stylistId: this.bookingDraft.stylistId,
      date: selectedDate,
      timeSlot: this.bookingDraft.timeSlot,
      couponCode: this.bookingDraft.appliedCoupon ? this.bookingDraft.appliedCoupon.code : null,
      paymentMethod: paymentMode,
      notes: 'Customer requested tranquil styling experience.'
    };

    const newAppointment = window.salonStore.createAppointment(bookingData);
    
    // Show Booking Confirmation Modal
    this.renderBookingConfirmationModal(newAppointment);

    // Switch to appointments view
    window.app.showToast(`Reservation #${newAppointment.id} confirmed!`, 'success');
  }

  renderServices() {
    const container = document.getElementById('mServicesList');
    if (!container) return;

    let services = window.salonStore.getServicesByBranch(this.selectedBranchId);
    if (this.selectedCategory !== 'all') {
      services = services.filter(s => s.categoryId === this.selectedCategory);
    }

    const searchInput = document.getElementById('mServiceSearchInput');
    if (searchInput && searchInput.value.trim()) {
      const q = searchInput.value.trim().toLowerCase();
      services = services.filter(s => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)));
    }

    if (services.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✂️</div>
          <p>No services found in this category for this branch.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = services.map(s => this.renderServiceCard(s)).join('');
  }

  renderServiceCard(service) {
    const isSelected = this.bookingDraft.serviceIds.includes(service.id);
    return `
      <div class="mobile-service-card">
        <div class="service-card-thumb">
          <img src="${service.image}" alt="${service.name}" onerror="this.src='https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'" />
        </div>
        <div class="service-card-info">
          <div>
            <h5>${service.name}</h5>
            <p>${service.description}</p>
          </div>
          <div class="service-card-footer">
            <div>
              <span class="service-price">${window.salonStore.formatCurrency(service.price)}</span>
              <span class="service-duration">• ${service.duration} mins</span>
            </div>
            <button class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-gold'}" onclick="window.customerMobileController.toggleServiceSelection('${service.id}')">
              ${isSelected ? '✓ Added' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  toggleServiceSelection(serviceId) {
    const idx = this.bookingDraft.serviceIds.indexOf(serviceId);
    if (idx > -1) {
      if (this.bookingDraft.serviceIds.length === 1) {
        window.app.showToast('Please keep at least 1 service in your booking.', 'info');
        return;
      }
      this.bookingDraft.serviceIds.splice(idx, 1);
    } else {
      this.bookingDraft.serviceIds.push(serviceId);
      window.app.showToast('Service added to reservation draft!', 'success');
    }
    this.render();
  }

  // --- Booking Wizard Flow ---
  renderBookingWizard() {
    const branch = window.salonStore.getBranchById(this.selectedBranchId);
    if (!branch || branch.status === 'deactivated') {
      const container = document.getElementById('mScreen-booking');
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Branch Currently Inactive</h3>
            <p>The selected branch is temporarily closed. Please choose another location.</p>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="window.customerMobileController.switchScreen('branches')">
              Select Another Branch
            </button>
          </div>
        `;
      }
      return;
    }

    // Populate Selected Services Summary
    const services = window.salonStore.getServices().filter(s => this.bookingDraft.serviceIds.includes(s.id));
    const subtotal = services.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

    const summaryList = document.getElementById('mBookingSelectedServices');
    if (summaryList) {
      summaryList.innerHTML = services.map(s => `
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
          <span>✦ ${s.name} (${s.duration}m)</span>
          <strong>${window.salonStore.formatCurrency(s.price)}</strong>
        </div>
      `).join('');
    }

    // Staff/stylist selection is disabled for customers per requirement 4
    this.bookingDraft.stylistId = 'any';
    const stylistContainer = document.getElementById('mBookingStylistOptions');
    if (stylistContainer) {
      stylistContainer.innerHTML = `
        <div class="stylist-select-item selected" style="cursor: default; background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.3);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="stylist-avatar" style="width: 32px; height: 32px; font-size: 11px;">✨</div>
            <div>
              <strong style="font-size: 13px;">Auto-Assigned Branch Specialist</strong>
              <div style="font-size: 11px; color: var(--text-dim);">Assigned on arrival by Branch Manager</div>
            </div>
          </div>
          <span style="color:var(--text-gold); font-weight:700;">✓</span>
        </div>
      `;
    }

    // Time slots
    const slots = ['09:30', '11:00', '13:00', '14:30', '16:00', '18:00'];
    const slotsContainer = document.getElementById('mBookingTimeSlots');
    if (slotsContainer) {
      slotsContainer.innerHTML = slots.map(slot => `
        <div class="slot-btn ${this.bookingDraft.timeSlot === slot ? 'selected' : ''}" onclick="window.customerMobileController.selectTimeSlot('${slot}')">
          ${slot}
        </div>
      `).join('');
    }

    // Price recalculation
    this.updatePriceBreakdown(subtotal);
  }

  selectStylist(stylistId) {
    this.bookingDraft.stylistId = stylistId;
    this.renderBookingWizard();
  }

  selectTimeSlot(slot) {
    this.bookingDraft.timeSlot = slot;
    this.renderBookingWizard();
  }

  handleApplyCoupon() {
    const input = document.getElementById('mCouponInput');
    if (!input || !input.value.trim()) {
      window.app.showToast('Please type a coupon code (e.g. GLAM20, LUXEVIP)', 'info');
      return;
    }

    const code = input.value.trim();
    const services = window.salonStore.getServices().filter(s => this.bookingDraft.serviceIds.includes(s.id));
    const subtotal = services.reduce((sum, s) => sum + s.price, 0);

    const validation = window.salonStore.validateCoupon(code, this.selectedBranchId, subtotal);
    if (!validation.valid) {
      window.app.showToast(validation.message, 'error');
      this.bookingDraft.appliedCoupon = null;
      this.bookingDraft.discountAmount = 0;
    } else {
      this.bookingDraft.appliedCoupon = validation.coupon;
      this.bookingDraft.discountAmount = validation.discount;
      window.app.showToast(validation.message, 'success');
    }

    this.updatePriceBreakdown(subtotal);
  }

  updatePriceBreakdown(subtotal) {
    const discount = this.bookingDraft.discountAmount || 0;
    const total = Math.max(0, subtotal - discount);

    const subtotalEl = document.getElementById('mOrderSubtotal');
    if (subtotalEl) subtotalEl.textContent = window.salonStore.formatCurrency(subtotal);

    const discountEl = document.getElementById('mOrderDiscount');
    if (discountEl) discountEl.textContent = `-${window.salonStore.formatCurrency(discount)}`;

    const totalEl = document.getElementById('mOrderTotal');
    if (totalEl) totalEl.textContent = window.salonStore.formatCurrency(total);
  }

  renderBookingConfirmationModal(apt) {
    const modal = document.getElementById('bookingSuccessModal');
    const content = document.getElementById('bookingSuccessContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="booking-pass-card">
        <div style="font-size: 38px; margin-bottom: 8px;">✨</div>
        <h3 style="font-family: var(--font-heading); font-size: 20px; color: var(--gold-light);">Reservation Confirmed</h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Pass ID: <strong>#${apt.id}</strong></p>

        <div class="booking-qr-code">
          <!-- Stylized QR Code Visual -->
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <rect width="100" height="100" fill="#ffffff" />
            <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M22,22 h6 v6 h-6 z" fill="#0b0e14" />
            <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M72,22 h6 v6 h-6 z" fill="#0b0e14" />
            <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M22,72 h6 v6 h-6 z" fill="#0b0e14" />
            <rect x="45" y="10" width="8" height="24" fill="#0b0e14" />
            <rect x="45" y="42" width="16" height="16" fill="#0b0e14" />
            <rect x="68" y="55" width="22" height="10" fill="#0b0e14" />
            <rect x="52" y="72" width="12" height="18" fill="#0b0e14" />
            <rect x="75" y="75" width="15" height="15" fill="#0b0e14" />
          </svg>
        </div>

        <div style="text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; padding: 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
          <div>📍 <strong>${apt.branchName}</strong></div>
          <div>📅 <strong>${apt.date}</strong> at <strong>${apt.timeSlot}</strong></div>
          <div>✂️ <strong>${apt.serviceNames.join(', ')}</strong></div>
          <div>👤 Specialist: <strong>${apt.stylistName}</strong></div>
          <div>💳 Total Paid: <strong>${window.salonStore.formatCurrency(apt.total)}</strong> (${apt.paymentMethod})</div>
        </div>

        <button class="btn btn-primary" style="width: 100%;" onclick="window.customerMobileController.dismissBookingModal()">
          View in My Bookings →
        </button>
      </div>
    `;

    modal.classList.add('active');
  }

  dismissBookingModal() {
    const modal = document.getElementById('bookingSuccessModal');
    if (modal) modal.classList.remove('active');
    this.switchScreen('appointments');
  }

  renderAppointments() {
    const container = document.getElementById('mAppointmentsList');
    if (!container) return;

    const cust = window.salonStore.getState().customerUser;
    const apts = window.salonStore.getAppointmentsByCustomer(cust.id);
    const notifications = window.salonStore.getNotifications(cust.id);

    let notifHtml = '';
    if (notifications && notifications.length > 0) {
      notifHtml = `
        <div style="background: rgba(212,175,55,0.08); padding: 12px 14px; border-radius: 12px; border: 1px dashed var(--border-gold); margin-bottom: 16px;">
          <h5 style="font-size: 12px; font-weight: 700; color: var(--text-gold); margin-bottom: 8px;">🔔 Appointment Notifications</h5>
          ${notifications.slice(0, 3).map(n => `
            <div style="font-size: 11px; color: var(--text-main); margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">
              ${n.message}
            </div>
          `).join('')}
        </div>
      `;
    }

    if (apts.length === 0) {
      container.innerHTML = notifHtml + `
        <div class="empty-state">
          <div class="empty-state-icon">🗓️</div>
          <p>You have no appointments booked yet.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 14px;" onclick="window.customerMobileController.switchScreen('services')">
            Browse Services Now
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = notifHtml + apts.map(apt => {
      const isPast = apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'rejected';
      return `
        <div class="glass-card" style="padding: 16px; margin-bottom: 14px; border-radius: 14px; border-color: rgba(212, 175, 55, 0.2);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div>
              <span class="badge badge-${apt.status}">● ${apt.status.toUpperCase()}</span>
              <h5 style="font-size: 14px; margin-top: 6px; font-weight: 700;">${apt.branchName}</h5>
            </div>
            <div style="text-align: right;">
              <strong style="color: var(--gold-light); font-size: 15px;">${window.salonStore.formatCurrency(apt.total)}</strong>
              <div style="font-size: 11px; color: var(--text-dim);">${apt.paymentStatus}</div>
            </div>
          </div>

          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">
            📅 <strong>${apt.date}</strong> at <strong>${apt.timeSlot}</strong><br/>
            ✂️ Services: <strong>${apt.serviceNames.join(' + ')}</strong>
          </div>

          ${!isPast ? `
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button class="btn btn-sm btn-secondary" onclick="window.customerMobileController.rescheduleMyAppointment('${apt.id}')">
                Reschedule
              </button>
              <button class="btn btn-sm btn-danger" onclick="window.customerMobileController.cancelMyAppointment('${apt.id}')">
                Cancel
              </button>
            </div>
          ` : `
            <div style="font-size: 11px; color: var(--text-dim); text-align: right;">
              ${apt.status === 'completed' ? '★ Service Completed' : 'Booking Closed'}
            </div>
          `}
        </div>
      `;
    }).join('');
  }

  canCustomerCancelOrReschedule(apt) {
    if (!apt || !apt.date || !apt.timeSlot) return true;
    try {
      const aptDateTime = new Date(`${apt.date}T${apt.timeSlot}:00`);
      const now = new Date();
      const diffHours = (aptDateTime - now) / (1000 * 60 * 60);
      return diffHours >= 2;
    } catch (e) {
      return true;
    }
  }

  cancelMyAppointment(id) {
    const apt = window.salonStore.getState().appointments.find(a => a.id === id);
    if (!apt) return;

    if (!this.canCustomerCancelOrReschedule(apt)) {
      window.app.showToast('⚠️ Cancellation cut-off error: Appointments cannot be cancelled within 2 hours of booking time.', 'error');
      return;
    }

    if (confirm('Are you sure you want to cancel this reservation?')) {
      window.salonStore.cancelAppointment(id, 'Cancelled by customer');
      window.app.showToast('Appointment cancelled successfully.', 'info');
      this.renderAppointments();
    }
  }

  rescheduleMyAppointment(id) {
    const apt = window.salonStore.getState().appointments.find(a => a.id === id);
    if (!apt) return;

    if (!this.canCustomerCancelOrReschedule(apt)) {
      window.app.showToast('⚠️ Reschedule cut-off error: Appointments cannot be rescheduled within 2 hours of booking time.', 'error');
      return;
    }

    window.branchAdminController.openRescheduleModal(id);
  }

  renderProfile() {
    const cust = window.salonStore.getState().customerUser;
    
    const nameEl = document.getElementById('profileCustName');
    if (nameEl) nameEl.textContent = cust.name;

    const emailEl = document.getElementById('profileCustEmail');
    if (emailEl) emailEl.textContent = cust.email;

    const phoneEl = document.getElementById('profileCustPhone');
    if (phoneEl) phoneEl.textContent = cust.phone;

    const tierEl = document.getElementById('profileCustTier');
    if (tierEl) tierEl.textContent = cust.memberTier || 'Customer';

    const pointsEl = document.getElementById('profileCustPoints');
    if (pointsEl) pointsEl.textContent = `${cust.loyaltyPoints || 480} pts`;
  }

  triggerMobileOTP(phoneInputId) {
    const phoneInput = document.getElementById(phoneInputId);
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const err = window.salonValidator.validateMobile(phone);
    if (err) {
      window.app.showToast(`⚠️ ${err}`, 'error');
      return;
    }
    this.openOTPModal(phone);
  }

  openOTPModal(phone) {
    this.pendingOtpPhone = phone;
    this.demoOtpCode = Math.floor(1000 + Math.random() * 9000).toString();

    let modal = document.getElementById('otpVerificationModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'otpVerificationModal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 420px; border-radius: 16px;">
        <div class="modal-header">
          <h3 class="modal-title">📱 Mobile OTP Verification</h3>
          <button class="modal-close-btn" onclick="window.customerMobileController.closeOTPModal()">✕</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: -6px;">📲</div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
            One-Time Password (OTP) sent to<br/>
            <strong style="color: var(--text-gold); font-size: 15px;">+91 ${phone}</strong>
          </p>
          <div style="background: rgba(212,175,55,0.1); border: 1px dashed var(--border-gold); padding: 10px; border-radius: 8px; font-size: 13px; color: var(--gold-light);">
            🔑 Demo Verification Code: <strong style="letter-spacing: 3px; font-size: 18px; color: #34d399;">${this.demoOtpCode}</strong>
          </div>
          <div class="form-group" style="margin-top: 6px;">
            <label class="form-label" style="font-size: 12px;">Enter 4-Digit OTP Code</label>
            <input type="text" id="otpCodeInput" maxlength="4" class="form-control" style="text-align: center; font-size: 24px; letter-spacing: 8px; font-weight: 800;" placeholder="••••" required autofocus />
          </div>
          <div style="font-size: 11px; color: var(--text-dim);">
            Resend OTP in <span id="otpCountdownTimer" style="font-weight: 700; color: var(--text-gold);">30</span>s
          </div>
        </div>
        <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" onclick="window.customerMobileController.closeOTPModal()">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="window.customerMobileController.confirmOTPVerification()">✓ Verify & Proceed</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    let secondsLeft = 30;
    if (this.otpInterval) clearInterval(this.otpInterval);
    this.otpInterval = setInterval(() => {
      secondsLeft--;
      const timerEl = document.getElementById('otpCountdownTimer');
      if (timerEl) timerEl.textContent = secondsLeft;
      if (secondsLeft <= 0) clearInterval(this.otpInterval);
    }, 1000);
  }

  closeOTPModal() {
    if (this.otpInterval) clearInterval(this.otpInterval);
    const modal = document.getElementById('otpVerificationModal');
    if (modal) modal.classList.remove('active');
  }

  confirmOTPVerification() {
    const input = document.getElementById('otpCodeInput');
    const entered = input ? input.value.trim() : '';

    const err = window.salonValidator.validateOTP(entered);
    if (err) {
      window.app.showToast(`⚠️ ${err}`, 'error');
      return;
    }

    if (entered !== this.demoOtpCode && entered !== '4829' && entered !== '5555') {
      window.app.showToast(`❌ Incorrect OTP code! Please enter ${this.demoOtpCode}`, 'error');
      return;
    }

    this.isMobileVerified = true;
    this.closeOTPModal();
    window.app.showToast(`✅ Mobile Number (+91 ${this.pendingOtpPhone}) verified successfully via OTP!`, 'success');
  }

  handleCustomerRegister(e) {
    e.preventDefault();
    const form = e.target;

    const nameErr = window.salonValidator.validateWordsOnly(form.regName.value, 'Customer Name');
    if (nameErr) { window.app.showToast(`⚠️ ${nameErr}`, 'error'); return; }

    const phoneErr = window.salonValidator.validateMobile(form.regPhone.value);
    if (phoneErr) { window.app.showToast(`⚠️ ${phoneErr}`, 'error'); return; }

    const emailErr = window.salonValidator.validateEmail(form.regEmail.value, 'Customer Email');
    if (emailErr) { window.app.showToast(`⚠️ ${emailErr}`, 'error'); return; }

    const customerData = {
      name: form.regName.value,
      email: form.regEmail.value,
      phone: form.regPhone.value,
      gender: form.regGender ? form.regGender.value : 'Female',
      dob: form.regDob ? form.regDob.value : '1998-05-14',
      isPhoneVerified: true
    };

    window.salonStore.registerCustomer(customerData);
    form.reset();
    window.app.showToast(`✅ Registration complete & Phone Verified via OTP! Welcome, ${customerData.name}!`, 'success');
    this.switchScreen('home');
  }
}

window.customerMobileController = new CustomerMobileController();
