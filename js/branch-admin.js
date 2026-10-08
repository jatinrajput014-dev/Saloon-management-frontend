/**
 * LUXE HAUS - Branch Admin Portal Controller
 * Manages Branch-Specific Operations, Appointments, Stylists, and Settings
 */

class BranchAdminController {
  constructor() {
    this.currentBranchId = 'BR-01'; // Default to Beverly Hills
    this.currentStatusFilter = 'all';
  }

  init() {
    this.bindEvents();
    this.render();
  }

  setBranch(branchId) {
    this.currentBranchId = branchId;
    this.render();
  }

  bindEvents() {
    // Appointment Status Filters
    document.querySelectorAll('.apt-filter-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.apt-filter-tab').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentStatusFilter = e.currentTarget.dataset.filter;
        this.renderAppointments();
      });
    });

    // Walk-in Appointment Modal Trigger
    const addWalkInBtn = document.getElementById('openWalkInModalBtn');
    if (addWalkInBtn) {
      addWalkInBtn.addEventListener('click', () => {
        this.populateWalkInForm();
        this.openModal('walkInModal');
      });
    }

    // Walk-in Form Submit
    const walkInForm = document.getElementById('walkInForm');
    if (walkInForm) {
      walkInForm.addEventListener('submit', (e) => this.handleCreateWalkIn(e));
    }

    // Branch Settings Form Submit
    const branchSettingsForm = document.getElementById('branchSettingsForm');
    if (branchSettingsForm) {
      branchSettingsForm.addEventListener('submit', (e) => this.handleSaveSettings(e));
    }

    // Reschedule Form Submit
    const rescheduleForm = document.getElementById('rescheduleModalForm');
    if (rescheduleForm) {
      rescheduleForm.addEventListener('submit', (e) => this.handleRescheduleSubmit(e));
    }

    // Interactive Stat Cards Event Delegation
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.stat-card');
      if (!card) return;

      if (card.querySelector('#branchTodayAppointments')) {
        this.filterByPeriod('today');
      } else if (card.querySelector('#branchUpcomingAppointments')) {
        this.filterByPeriod('upcoming');
      } else if (card.querySelector('#branchTotalCustomers')) {
        this.openCustomerDirectoryModal();
      } else if (card.querySelector('#branchTodayRevenue')) {
        this.openTodayRevenueModal();
      } else if (card.querySelector('#branchMonthlyRevenue')) {
        this.scrollToServiceRevenue();
      }
    });
  }

  render() {
    const branch = window.salonStore.getBranchById(this.currentBranchId);
    if (!branch) return;

    this.renderBranchBanner(branch);
    this.renderBranchDashboard(branch);
    this.renderAppointments();
    this.renderSettingsForm(branch);
    this.renderBranchReport();
  }

  renderBranchBanner(branch) {
    const banner = document.getElementById('branchAdminBanner');
    if (!banner) return;

    const stats = window.salonStore.getBranchStats(branch.id);
    const isDeactivated = branch.status === 'deactivated';

    banner.innerHTML = `
      <div class="branch-banner-info">
        <div class="branch-banner-icon">🏢</div>
        <div class="branch-banner-title">
          <h2>${branch.name}</h2>
          <p>
            <span>📍 ${branch.address}</span>
            <span>📞 ${branch.phone}</span>
            <span>⏰ ${branch.openingTime} - ${branch.closingTime}</span>
          </p>
        </div>
      </div>
      <div class="branch-banner-meta" style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
        <span class="badge ${isDeactivated ? 'badge-deactivated' : 'badge-active'}" style="font-size: 13px; padding: 6px 14px;">
          ● ${isDeactivated ? 'Branch Deactivated' : 'Active & Operational'}
        </span>
      </div>
    `;
  }

  renderBranchDashboard(branch) {
    const stats = window.salonStore.getBranchStats(branch.id);
    if (!stats) return;

    const todayAptEl = document.getElementById('branchTodayAppointments');
    if (todayAptEl) todayAptEl.textContent = stats.todayAppointments;

    const upcomingAptEl = document.getElementById('branchUpcomingAppointments');
    if (upcomingAptEl) upcomingAptEl.textContent = stats.upcomingAppointments;

    const customersEl = document.getElementById('branchTotalCustomers');
    if (customersEl) customersEl.textContent = stats.totalCustomers;

    const todayRevEl = document.getElementById('branchTodayRevenue');
    if (todayRevEl) todayRevEl.textContent = window.salonStore.formatCurrency(stats.todayRevenue);

    const monthlyRevEl = document.getElementById('branchMonthlyRevenue');
    if (monthlyRevEl) monthlyRevEl.textContent = window.salonStore.formatCurrency(stats.monthlyRevenue);

    this.renderServiceRevenueBreakdown(branch.id);
  }

  renderServiceRevenueBreakdown(branchId) {
    const container = document.getElementById('branchServiceRevenueTableContainer');
    if (!container) return;

    const srvRevenue = window.salonStore.getServiceWiseRevenue(branchId);
    const totalBranchRev = srvRevenue.reduce((sum, s) => sum + s.totalRevenue, 0);

    if (srvRevenue.length === 0) {
      container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted);">No service bookings recorded for this branch yet.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="admin-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>Service Title</th>
              <th>Category</th>
              <th>Unit Price (₹)</th>
              <th>Total Bookings</th>
              <th>Total Revenue Collected (₹)</th>
              <th>Revenue Share</th>
            </tr>
          </thead>
          <tbody>
            ${srvRevenue.map(s => {
      const share = totalBranchRev > 0 ? ((s.totalRevenue / totalBranchRev) * 100).toFixed(1) : '0.0';
      return `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td><span class="badge badge-gold" style="font-size: 10px;">${s.categoryName}</span></td>
                  <td>${window.salonStore.formatCurrency(s.unitPrice)}</td>
                  <td><strong>${s.bookingCount}</strong></td>
                  <td><strong style="color: var(--text-gold); font-size: 13px;">${window.salonStore.formatCurrency(s.totalRevenue)}</strong></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 700; min-width: 40px;">${share}%</span>
                      <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; width: 60px;">
                        <div style="width: ${share}%; height: 100%; background: var(--accent-gold);"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderAppointments() {
    const container = document.getElementById('branchAppointmentsGrid');
    if (!container) return;

    let appointments = window.salonStore.getAppointments(this.currentBranchId);
    const todayStr = new Date().toISOString().split('T')[0];

    if (this.currentStatusFilter === 'today') {
      appointments = appointments.filter(a => a.date === todayStr || a.date === '2026-10-02');
    } else if (this.currentStatusFilter === 'upcoming') {
      const validUpcoming = ['accepted', 'rescheduled', 'pending'];
      appointments = appointments.filter(a => validUpcoming.includes(a.status) && a.date >= todayStr);
    } else if (this.currentStatusFilter !== 'all') {
      appointments = appointments.filter(a => a.status === this.currentStatusFilter);
    }

    if (appointments.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📅</div>
          <p>No appointments found for "${this.currentStatusFilter}" filter.</p>
        </div>
      `;
      return;
    }

    const branch = window.salonStore.getBranchById(this.currentBranchId);

    container.innerHTML = appointments.map(apt => {
      const statusConfig = {
        pending:     { cls: 'badge-pending',     label: '⏳ Pending',     color: '#f59e0b' },
        accepted:    { cls: 'badge-active',      label: '✓ Accepted',     color: '#10b981' },
        rejected:    { cls: 'badge-deactivated', label: '✕ Rejected',     color: '#ef4444' },
        completed:   { cls: 'badge-completed',   label: '✨ Completed',    color: '#10b981' },
        cancelled:   { cls: 'badge-cancelled',   label: '🚫 Cancelled',    color: '#dc2626' },
        rescheduled: { cls: 'badge-rescheduled', label: '📅 Rescheduled',  color: '#3b82f6' },
        'in-progress': { cls: 'badge-in-progress', label: '🔄 In Progress', color: '#0f172a' },
      };
      const sc = statusConfig[apt.status] || { cls: 'badge-gold', label: apt.status, color: 'var(--accent-gold)' };
      const payBadge = apt.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending';
      const payBadgeCls = apt.paymentStatus === 'paid' ? 'badge-completed' : 'badge-pending';

      return `
        <div class="appointment-card status-${apt.status}">
          <!-- Header: Appointment ID + Status -->
          <div class="apt-card-header" style="margin-bottom: 12px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.8px;">Appointment ID</span>
              <span style="font-size: 14px; font-weight: 800; color: var(--gold-light); font-family: var(--font-heading);">#${apt.id}</span>
            </div>
            <span class="badge ${sc.cls}" style="font-size: 11px;">${sc.label}</span>
          </div>

          <!-- Date, Time, Duration -->
          <div style="display: flex; gap: 10px; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <div style="text-align: center;">
              <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase;">Date</div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">${apt.date}</div>
            </div>
            <div style="width: 1px; height: 28px; background: var(--border-subtle);"></div>
            <div style="text-align: center;">
              <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase;">Time</div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">${apt.timeSlot}</div>
            </div>
            <div style="width: 1px; height: 28px; background: var(--border-subtle);"></div>
            <div style="text-align: center;">
              <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase;">Duration</div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">${apt.duration} min</div>
            </div>
            <div style="width: 1px; height: 28px; background: var(--border-subtle);"></div>
            <div style="text-align: center;">
              <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase;">Station</div>
              <div style="font-size: 11px; font-weight: 700; color: var(--text-gold);">${apt.chairNumber || 'TBD'}</div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="apt-customer-block" style="margin-bottom: 12px;">
            <div class="customer-avatar-circle">
              ${apt.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div class="customer-details">
              <h4 style="font-size: 14px; font-weight: 700;">${apt.customerName}</h4>
              <p style="font-size: 12px;">📞 ${apt.customerPhone}</p>
              ${apt.customerEmail ? `<p style="font-size: 11px; color: var(--text-dim);">✉️ ${apt.customerEmail}</p>` : ''}
            </div>
          </div>

          <!-- Branch -->
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">
            🏢 <strong>${branch ? branch.name : apt.branchId}</strong> — ${branch ? branch.city : ''}
          </div>

          <!-- Services Booked -->
          <div class="apt-services-list" style="margin-bottom: 12px;">
            <div style="font-size: 10px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 4px; font-weight: 700;">Services Booked:</div>
            ${apt.serviceNames.map(name => `<div class="apt-service-item"><span>✦ ${name}</span></div>`).join('')}
          </div>

          <!-- Pricing & Coupon -->
          <div style="background: rgba(212,175,55,0.06); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(212,175,55,0.15); margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
              <span>Subtotal</span><span>${window.salonStore.formatCurrency(apt.subtotal || apt.total)}</span>
            </div>
            ${apt.couponCode ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--accent-emerald); margin-bottom: 4px;">
                <span>🎟️ Coupon <strong>${apt.couponCode}</strong></span>
                <span>-${window.salonStore.formatCurrency(apt.discount || 0)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: var(--text-gold); border-top: 1px solid rgba(212,175,55,0.2); padding-top: 6px; margin-top: 4px;">
              <span>Total Bill</span><span>${window.salonStore.formatCurrency(apt.total)}</span>
            </div>
          </div>

          <!-- Payment Info -->
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
            <span style="font-size: 12px; color: var(--text-muted);">💳 ${apt.paymentMethod || 'N/A'}</span>
            <span class="badge ${payBadgeCls}" style="font-size: 11px;">${payBadge}</span>
          </div>

          ${apt.notes ? `
            <div style="font-size: 11px; color: var(--gold-light); background: rgba(212,175,55,0.08); padding: 6px 10px; border-radius: 6px; margin-bottom: 12px;">
              📝 <em>${apt.notes}</em>
            </div>
          ` : ''}

          <!-- Actions -->
          <div class="apt-card-actions" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${apt.paymentStatus !== 'paid' || apt.paymentMethod === 'Pay at Salon' ? `
              <button class="btn btn-sm btn-outline-gold" onclick="window.branchAdminController.openPaymentModal('${apt.id}')" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.4); font-weight: 700;">
                💰 Pay at Salon (Collect Payment)
              </button>
            ` : ''}

            ${apt.status === 'pending' ? `
              <button class="btn btn-sm btn-primary" onclick="window.branchAdminController.updateStatus('${apt.id}', 'accepted')">
                ✓ Accept
              </button>
              <button class="btn btn-sm btn-danger" onclick="window.branchAdminController.updateStatus('${apt.id}', 'rejected')">
                ✕ Reject
              </button>
            ` : ''}

            ${['accepted', 'rescheduled', 'in-progress'].includes(apt.status) ? `
              <button class="btn btn-sm btn-primary" onclick="window.branchAdminController.updateStatus('${apt.id}', 'completed')">
                ✨ Mark Completed
              </button>
            ` : ''}

            ${!['completed', 'cancelled', 'rejected'].includes(apt.status) ? `
              <button class="btn btn-sm btn-secondary" onclick="window.branchAdminController.openRescheduleModal('${apt.id}')">
                📅 Reschedule
              </button>
              <button class="btn btn-sm btn-danger" onclick="window.branchAdminController.cancelAppointment('${apt.id}')">
                🚫 Cancel
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  updateStatus(appointmentId, status) {
    const updated = window.salonStore.updateAppointmentStatus(appointmentId, status);
    if (updated) {
      window.app.showToast(`Appointment #${updated.id} marked as ${status}!`, 'success');
      this.render();
    }
  }

  cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const updated = window.salonStore.cancelAppointment(appointmentId, 'Cancelled by Branch Admin');
      if (updated) {
        window.app.showToast(`Appointment #${updated.id} has been cancelled.`, 'info');
        this.render();
      }
    }
  }

  openRescheduleModal(appointmentId) {
    const apt = window.salonStore.getState().appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    document.getElementById('rescheduleAptId').value = apt.id;
    document.getElementById('rescheduleDate').value = apt.date;
    document.getElementById('rescheduleTime').value = apt.timeSlot;

    this.openModal('rescheduleModal');
  }

  handleRescheduleSubmit(e) {
    e.preventDefault();
    const aptId = document.getElementById('rescheduleAptId').value;
    const newDate = document.getElementById('rescheduleDate').value;
    const newTime = document.getElementById('rescheduleTime').value;

    const updated = window.salonStore.rescheduleAppointment(aptId, newDate, newTime);
    this.closeModal('rescheduleModal');
    if (updated) {
      window.app.showToast(`Appointment #${updated.id} rescheduled to ${newDate} at ${newTime}`, 'success');
      this.render();
    }
  }

  openPaymentModal(appointmentId) {
    const apts = window.salonStore.getState().appointments;
    const apt = apts.find(a => a.id === appointmentId || a._id === appointmentId);
    if (!apt) return;

    let modal = document.getElementById('collectPaymentModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'collectPaymentModal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">💰 Pay at Salon — Collect Payment</h3>
          <button class="modal-close-btn" onclick="window.branchAdminController.closeModal('collectPaymentModal')">✕</button>
        </div>
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div style="background: rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:8px;">
            <div style="font-size:12px; color:var(--text-muted);">Customer: <strong style="color:var(--text-main);">${apt.customerName} (${apt.customerPhone})</strong></div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Booking Code: <strong>#${apt.id}</strong> — Date: <strong>${apt.date} ${apt.timeSlot}</strong></div>
            <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:8px; display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px;">
              <span>Amount Due:</span>
              <span>${window.salonStore.formatCurrency(apt.total)}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight:700; color:var(--text-gold);">Select Payment Mode (Branch Manager Selection):</label>
            <select id="salonPaymentModeSelect" class="form-control" style="font-weight:700; font-size:14px; padding:10px;">
              <option value="Cash">💵 Cash</option>
              <option value="UPI">📱 UPI (Google Pay / PhonePe / Paytm / QR Code)</option>
              <option value="Credit Card">💳 Credit Card / Debit Card (POS Terminal)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Payment / Receipt Reference (Optional):</label>
            <input type="text" id="salonPaymentRefInput" class="form-control" placeholder="e.g. Receipt #1042 / TxnRef" />
          </div>
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" onclick="window.branchAdminController.closeModal('collectPaymentModal')">Cancel</button>
          <button type="button" class="btn btn-success" style="background:#10b981; border-color:#059669; font-weight:700;" onclick="window.branchAdminController.processSalonPayment('${apt.id}')">✓ Collect & Confirm Payment</button>
        </div>
      </div>
    `;

    this.openModal('collectPaymentModal');
  }

  async processSalonPayment(appointmentId) {
    const modeSelect = document.getElementById('salonPaymentModeSelect');
    if (!modeSelect) return;
    const selectedMode = modeSelect.value;
    const refInput = document.getElementById('salonPaymentRefInput');
    const refText = refInput ? refInput.value.trim() : '';

    const formattedMode = `Pay at Salon (${selectedMode})${refText ? ' - Ref: ' + refText : ''}`;

    // 1. Update in reactive store
    const updated = window.salonStore.collectSalonPayment(appointmentId, formattedMode);

    // 2. Sync with REST API if online
    if (window.apiService && window.apiService.isBackendOnline) {
      await window.apiService.collectSalonPayment(appointmentId, formattedMode, 'paid');
    }

    this.closeModal('collectPaymentModal');

    if (updated) {
      window.app.showToast(`💰 Payment of ${window.salonStore.formatCurrency(updated.total)} collected via ${selectedMode} successfully!`, 'success');
      this.render();
    }
  }

  renderStylists(branch) {
    const container = document.getElementById('branchStylistsGrid');
    if (!container) return;

    const stylists = window.salonStore.getStylists(branch.id);
    container.innerHTML = stylists.map(s => `
      <div class="stylist-card">
        <div class="stylist-avatar">${s.avatar}</div>
        <div>
          <h4 style="font-size: 14px; font-weight: 700; color: var(--text-main);">${s.name}</h4>
          <p style="font-size: 12px; color: var(--gold-light);">${s.specialty}</p>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">
            ★ ${s.rating} • ${s.experience} experience
          </div>
        </div>
      </div>
    `).join('');
  }

  renderSettingsForm(branch) {
    const form = document.getElementById('branchSettingsForm');
    if (!form) return;

    form.branchName.value = branch.name;
    form.branchPhone.value = branch.phone;
    form.branchOpening.value = branch.openingTime;
    form.branchClosing.value = branch.closingTime;
    form.branchChairs.value = branch.chairs;
    form.branchAddress.value = branch.address;

    // Working Days
    const workingDays = branch.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const checkboxes = form.querySelectorAll('input[name="workingDays"]');
    checkboxes.forEach(cb => {
      cb.checked = workingDays.includes(cb.value);
    });

    // Branch Status Banner (read-only)
    const banner = document.getElementById('branchStatusDisplayBanner');
    if (banner) {
      const isActive = branch.status !== 'deactivated';
      banner.style.background = isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';
      banner.style.borderColor = isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      banner.innerHTML = `
        <span style="font-size: 18px;">${isActive ? '🟢' : '🔴'}</span>
        <div>
          <div style="font-weight: 700; color: ${isActive ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-size: 13px;">
            Branch Status: ${isActive ? 'Active & Operational' : 'Deactivated'}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${isActive
              ? 'Branch is accepting new appointments from customers.'
              : '⚠️ New customer appointments are currently blocked.'}
          </div>
        </div>
      `;
    }
  }

  handleSaveSettings(e) {
    e.preventDefault();
    const form = e.target;
    const workingDayCheckboxes = form.querySelectorAll('input[name="workingDays"]:checked');
    const workingDays = Array.from(workingDayCheckboxes).map(cb => cb.value);
    const updates = {
      name: form.branchName.value,
      phone: form.branchPhone.value,
      openingTime: form.branchOpening.value,
      closingTime: form.branchClosing.value,
      chairs: parseInt(form.branchChairs.value) || 6,
      address: form.branchAddress.value,
      workingDays: workingDays.length > 0 ? workingDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };

    if (window.salonValidator) {
      const bErr = window.salonValidator.validateBranchName(updates.name);
      if (bErr) { window.app.showToast(`⚠️ ${bErr}`, 'error'); return; }

      const pErr = window.salonValidator.validateMobile(updates.phone);
      if (pErr) { window.app.showToast(`⚠️ ${pErr}`, 'error'); return; }

      const addrErr = window.salonValidator.validateAddress(updates.address);
      if (addrErr) { window.app.showToast(`⚠️ ${addrErr}`, 'error'); return; }

      const openErr = window.salonValidator.validateIndianTime(updates.openingTime, 'Opening Time');
      if (openErr) { window.app.showToast(`⚠️ ${openErr}`, 'error'); return; }

      const closeErr = window.salonValidator.validateIndianTime(updates.closingTime, 'Closing Time');
      if (closeErr) { window.app.showToast(`⚠️ ${closeErr}`, 'error'); return; }
    }

    window.salonStore.updateBranch(this.currentBranchId, updates);
    window.app.showToast(`Settings for ${updates.name} saved! Working days: ${updates.workingDays.join(', ')}.`, 'success');
    this.render();
  }

  renderBranchReport() {
    const container = document.getElementById('branchReportContainer');
    if (!container) return;

    const typeSelect = document.getElementById('branchReportTypeSelect');
    const reportType = typeSelect ? typeSelect.value : 'appointments';

    const dateFromEl = document.getElementById('branchReportDateFrom');
    const dateToEl = document.getElementById('branchReportDateTo');
    const dateFrom = dateFromEl ? dateFromEl.value : '';
    const dateTo = dateToEl ? dateToEl.value : '';

    let appointments = window.salonStore.getAppointmentsByBranch(this.currentBranchId);
    if (dateFrom) appointments = appointments.filter(a => a.date >= dateFrom);
    if (dateTo) appointments = appointments.filter(a => a.date <= dateTo);

    const branch = window.salonStore.getBranchById(this.currentBranchId);
    const branchServices = window.salonStore.getServicesByBranch(this.currentBranchId);

    let html = '';

    if (reportType === 'appointments') {
      const totalCount = appointments.length;
      const acceptedCount = appointments.filter(a => a.status === 'accepted' || a.status === 'completed').length;
      const pendingCount = appointments.filter(a => a.status === 'pending').length;
      const totalVal = appointments.reduce((acc, a) => acc + (a.total || 0), 0);

      html = `
        <div class="report-summary-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Total Bookings</span>
            <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${totalCount}</div>
          </div>
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Confirmed / Done</span>
            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${acceptedCount}</div>
          </div>
          <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Pending Approvals</span>
            <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${pendingCount}</div>
          </div>
          <div style="background: var(--duo-lime-soft); border: 1.5px solid var(--duo-black-stroke); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #475569; text-transform: uppercase; font-weight: 800;">Total Volume Value</span>
            <div style="font-size: 20px; font-weight: 800; color: #000000;">${window.salonStore.formatCurrency(totalVal)}</div>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.04); text-align: left; border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 10px;">ID</th>
                <th style="padding: 10px;">Customer</th>
                <th style="padding: 10px;">Services</th>
                <th style="padding: 10px;">Date & Time</th>
                <th style="padding: 10px;">Stylist</th>
                <th style="padding: 10px;">Status</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${appointments.length === 0 ? '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">No appointments found for the selected period.</td></tr>' : 
                appointments.map(a => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px; font-weight: 700; color: var(--text-gold);">${a.id}</td>
                  <td style="padding: 10px;">
                    <div style="font-weight: 600;">${a.customerName}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${a.customerPhone}</div>
                  </td>
                  <td style="padding: 10px;">${(a.serviceNames || []).join(', ')}</td>
                  <td style="padding: 10px;">${a.date} @ ${a.timeSlot}</td>
                  <td style="padding: 10px;">${a.stylistName || 'Any Specialist'}</td>
                  <td style="padding: 10px;"><span class="status-badge ${a.status}">${a.status}</span></td>
                  <td style="padding: 10px; text-align: right; font-weight: 700;">${window.salonStore.formatCurrency(a.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (reportType === 'customers') {
      const customerMap = {};
      appointments.forEach(a => {
        const key = a.customerPhone || a.customerName;
        if (!customerMap[key]) {
          customerMap[key] = {
            name: a.customerName,
            phone: a.customerPhone,
            email: a.customerEmail || 'N/A',
            visits: 0,
            spent: 0,
            lastVisit: a.date
          };
        }
        customerMap[key].visits += 1;
        customerMap[key].spent += (a.total || 0);
        if (a.date > customerMap[key].lastVisit) customerMap[key].lastVisit = a.date;
      });

      const customerList = Object.values(customerMap);
      const uniqueCount = customerList.length;
      const repeatCount = customerList.filter(c => c.visits > 1).length;
      const totalSpend = customerList.reduce((acc, c) => acc + c.spent, 0);
      const avgSpend = uniqueCount ? Math.round(totalSpend / uniqueCount) : 0;

      html = `
        <div class="report-summary-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Unique Clients</span>
            <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${uniqueCount}</div>
          </div>
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Repeat Clients</span>
            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${repeatCount}</div>
          </div>
          <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Avg Spend / Client</span>
            <div style="font-size: 20px; font-weight: 700; color: var(--text-gold);">${window.salonStore.formatCurrency(avgSpend)}</div>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.04); text-align: left; border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 10px;">Client Name</th>
                <th style="padding: 10px;">Phone & Email</th>
                <th style="padding: 10px;">Total Visits</th>
                <th style="padding: 10px;">Last Visit</th>
                <th style="padding: 10px; text-align: right;">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              ${customerList.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No client activity found for the selected period.</td></tr>' :
                customerList.map(c => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px; font-weight: 600;">${c.name}</td>
                  <td style="padding: 10px;">
                    <div>${c.phone}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${c.email}</div>
                  </td>
                  <td style="padding: 10px;"><span class="badge badge-active">${c.visits} Bookings</span></td>
                  <td style="padding: 10px;">${c.lastVisit}</td>
                  <td style="padding: 10px; text-align: right; font-weight: 700; color: var(--text-gold);">${window.salonStore.formatCurrency(c.spent)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (reportType === 'services') {
      const serviceStats = branchServices.map(s => {
        let count = 0;
        let revenue = 0;
        appointments.forEach(a => {
          if (a.serviceIds && a.serviceIds.includes(s.id)) {
            count += 1;
            revenue += s.price;
          }
        });
        return { ...s, count, revenue };
      });

      const totalBookedServices = serviceStats.reduce((acc, s) => acc + s.count, 0);
      const topService = [...serviceStats].sort((a, b) => b.count - a.count)[0];
      const topRevenueService = [...serviceStats].sort((a, b) => b.revenue - a.revenue)[0];

      html = `
        <div class="report-summary-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Total Services Offered</span>
            <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${branchServices.length}</div>
          </div>
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Most Popular Service</span>
            <div style="font-size: 16px; font-weight: 700; color: #10b981;">${topService ? topService.name : 'N/A'}</div>
          </div>
          <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Top Grossing Service</span>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-gold);">${topRevenueService ? topRevenueService.name : 'N/A'}</div>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.04); text-align: left; border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 10px;">Service Name</th>
                <th style="padding: 10px;">Price & Duration</th>
                <th style="padding: 10px;">Times Booked</th>
                <th style="padding: 10px;">Popularity Share</th>
                <th style="padding: 10px; text-align: right;">Total Service Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${serviceStats.map(s => {
                const share = totalBookedServices ? Math.round((s.count / totalBookedServices) * 100) : 0;
                return `
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 10px; font-weight: 600;">✂️ ${s.name}</td>
                    <td style="padding: 10px;">${window.salonStore.formatCurrency(s.price)} (${s.duration} mins)</td>
                    <td style="padding: 10px;">${s.count} times</td>
                    <td style="padding: 10px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                          <div style="width: ${share}%; height: 100%; background: var(--gold-gradient);"></div>
                        </div>
                        <span style="font-size: 11px; font-weight: 600;">${share}%</span>
                      </div>
                    </td>
                    <td style="padding: 10px; text-align: right; font-weight: 700; color: var(--text-gold);">${window.salonStore.formatCurrency(s.revenue)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (reportType === 'revenue' || reportType === 'daily') {
      const dailyMap = {};
      appointments.forEach(a => {
        const dateKey = a.date || 'Unknown Date';
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = { date: dateKey, count: 0, cash: 0, upi: 0, card: 0, total: 0 };
        }
        dailyMap[dateKey].count += 1;
        const amt = a.total || 0;
        dailyMap[dateKey].total += amt;
        const pm = (a.paymentMethod || '').toLowerCase();
        if (pm.includes('cash')) dailyMap[dateKey].cash += amt;
        else if (pm.includes('upi') || pm.includes('online')) dailyMap[dateKey].upi += amt;
        else if (pm.includes('card') || pm.includes('pos')) dailyMap[dateKey].card += amt;
        else dailyMap[dateKey].cash += amt;
      });

      const dailyList = Object.values(dailyMap).sort((a,b) => b.date.localeCompare(a.date));
      const grandTotal = dailyList.reduce((acc, d) => acc + d.total, 0);

      html = `
        <div class="report-summary-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Total Period Collections</span>
            <div style="font-size: 20px; font-weight: 700; color: var(--text-gold);">${window.salonStore.formatCurrency(grandTotal)}</div>
          </div>
          <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Active Days Recorded</span>
            <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${dailyList.length} Days</div>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.04); text-align: left; border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 10px;">Date</th>
                <th style="padding: 10px;">Bookings</th>
                <th style="padding: 10px;">Cash Collections</th>
                <th style="padding: 10px;">UPI / Online</th>
                <th style="padding: 10px;">Card / POS</th>
                <th style="padding: 10px; text-align: right;">Total Day Collection</th>
              </tr>
            </thead>
            <tbody>
              ${dailyList.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">No revenue recorded for the selected period.</td></tr>' :
                dailyList.map(d => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px; font-weight: 700;">📅 ${d.date}</td>
                  <td style="padding: 10px;">${d.count} appointments</td>
                  <td style="padding: 10px; color: #10b981;">${window.salonStore.formatCurrency(d.cash)}</td>
                  <td style="padding: 10px; color: #3b82f6;">${window.salonStore.formatCurrency(d.upi)}</td>
                  <td style="padding: 10px; color: #000000; font-weight: 700;">${window.salonStore.formatCurrency(d.card)}</td>
                  <td style="padding: 10px; text-align: right; font-weight: 700; color: var(--text-gold);">${window.salonStore.formatCurrency(d.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (reportType === 'monthly') {
      const monthMap = {};
      appointments.forEach(a => {
        const monthKey = (a.date || '').slice(0, 7) || '2026-10';
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = { month: monthKey, count: 0, subtotal: 0, discount: 0, total: 0 };
        }
        monthMap[monthKey].count += 1;
        monthMap[monthKey].subtotal += (a.subtotal || a.total || 0);
        monthMap[monthKey].discount += (a.discount || 0);
        monthMap[monthKey].total += (a.total || 0);
      });

      const monthList = Object.values(monthMap).sort((a,b) => b.month.localeCompare(a.month));
      const grandTotal = monthList.reduce((acc, m) => acc + m.total, 0);

      html = `
        <div class="report-summary-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Total Cumulative Revenue</span>
            <div style="font-size: 20px; font-weight: 700; color: var(--text-gold);">${window.salonStore.formatCurrency(grandTotal)}</div>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.04); text-align: left; border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 10px;">Month</th>
                <th style="padding: 10px;">Total Appointments</th>
                <th style="padding: 10px;">Gross Volume</th>
                <th style="padding: 10px;">Promotional Savings</th>
                <th style="padding: 10px; text-align: right;">Net Collected Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${monthList.map(m => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px; font-weight: 700;">📈 Month (${m.month})</td>
                  <td style="padding: 10px;">${m.count} Bookings</td>
                  <td style="padding: 10px;">${window.salonStore.formatCurrency(m.subtotal)}</td>
                  <td style="padding: 10px; color: #f43f5e;">-${window.salonStore.formatCurrency(m.discount)}</td>
                  <td style="padding: 10px; text-align: right; font-weight: 700; color: var(--text-gold);">${window.salonStore.formatCurrency(m.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (reportType === 'payment') {
      const paidApts = appointments.filter(a => a.paymentStatus === 'paid');
      const pendingApts = appointments.filter(a => a.paymentStatus === 'pending');
      const paidTotal = paidApts.reduce((acc, a) => acc + (a.total || 0), 0);
      const pendingTotal = pendingApts.reduce((acc, a) => acc + (a.total || 0), 0);

      html = `
        <div class="report-summary-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Collected / Paid</span>
            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${window.salonStore.formatCurrency(paidTotal)} (${paidApts.length})</div>
          </div>
          <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); padding: 12px 16px; border-radius: 12px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">Pending Collections</span>
            <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${window.salonStore.formatCurrency(pendingTotal)} (${pendingApts.length})</div>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.04); text-align: left; border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 10px;">ID</th>
                <th style="padding: 10px;">Customer</th>
                <th style="padding: 10px;">Payment Method</th>
                <th style="padding: 10px;">Payment Status</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${appointments.map(a => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px; font-weight: 700; color: var(--text-gold);">${a.id}</td>
                  <td style="padding: 10px;">${a.customerName}</td>
                  <td style="padding: 10px;">💳 ${a.paymentMethod || 'Pay at Salon'}</td>
                  <td style="padding: 10px;"><span class="badge ${a.paymentStatus === 'paid' ? 'badge-active' : 'badge-deactivated'}">${(a.paymentStatus || 'pending').toUpperCase()}</span></td>
                  <td style="padding: 10px; text-align: right; font-weight: 700;">${window.salonStore.formatCurrency(a.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  populateWalkInForm() {
    const servicesSelect = document.getElementById('walkInServicesSelect');
    const stylistSelect = document.getElementById('walkInStylistSelect');
    const dateInput = document.querySelector('[name="walkInDate"]');

    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    if (servicesSelect) {
      const services = window.salonStore.getServicesByBranch(this.currentBranchId);
      servicesSelect.innerHTML = services.map((s, idx) => `
        <option value="${s.id}" ${idx === 0 ? 'selected' : ''}>${s.name} - ${window.salonStore.formatCurrency(s.price)} (${s.duration}m)</option>
      `).join('');
    }

    if (stylistSelect) {
      const stylists = window.salonStore.getStylists(this.currentBranchId);
      stylistSelect.innerHTML = `
        <option value="any">Any Available Stylist</option>
        ${stylists.map(s => `<option value="${s.id}">${s.name} - ${s.specialty}</option>`).join('')}
      `;
    }
  }

  handleCreateWalkIn(e) {
    e.preventDefault();
    const form = e.target;
    const selectedOptions = form.walkInServices ? Array.from(form.walkInServices.selectedOptions) : [];
    const selectedServiceIds = selectedOptions.map(o => o.value);

    if (selectedServiceIds.length === 0) {
      window.app.showToast('⚠️ Please select at least one service.', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const bookingData = {
      branchId: this.currentBranchId,
      customerName: form.walkInCustomerName.value,
      customerPhone: form.walkInCustomerPhone.value,
      customerEmail: form.walkInCustomerEmail.value || 'walkin@luxehaus.com',
      serviceIds: selectedServiceIds,
      stylistId: form.walkInStylist ? form.walkInStylist.value : 'any',
      date: form.walkInDate ? (form.walkInDate.value || todayStr) : todayStr,
      timeSlot: form.walkInTime ? (form.walkInTime.value || '14:00') : '14:00',
      paymentMethod: form.walkInPayment ? form.walkInPayment.value : 'Pay at Salon (Cash)',
      paymentStatus: form.walkInPayment && form.walkInPayment.value.includes('Pending') ? 'pending' : 'paid',
      status: 'accepted',
      notes: form.walkInNotes ? (form.walkInNotes.value || 'Walk-in registration') : 'Walk-in registration'
    };

    if (window.salonValidator) {
      const nameErr = window.salonValidator.validateWordsOnly(bookingData.customerName, 'Customer Name');
      if (nameErr) { window.app.showToast(`⚠️ ${nameErr}`, 'error'); return; }

      const pErr = window.salonValidator.validateMobile(bookingData.customerPhone);
      if (pErr) { window.app.showToast(`⚠️ ${pErr}`, 'error'); return; }
    }

    const newApt = window.salonStore.createAppointment(bookingData);
    this.closeModal('walkInModal');
    form.reset();
    window.app.showToast(`✨ Walk-in client ${newApt.customerName} registered successfully (#${newApt.id})!`, 'success');
    this.render();
  }

  filterByPeriod(period) {
    this.currentStatusFilter = period;
    document.querySelectorAll('.apt-filter-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === period);
    });
    this.renderAppointments();
    const section = document.getElementById('branchAppointmentsGrid');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const label = period === 'today' ? "Today's Schedule" : "Upcoming Bookings";
    window.app.showToast(`Showing ${label} details below`, 'info');
  }

  scrollToServiceRevenue() {
    const el = document.getElementById('branchServiceRevenueTableContainer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'box-shadow 0.3s ease';
      el.style.boxShadow = '0 0 20px rgba(212,175,55,0.4)';
      setTimeout(() => { el.style.boxShadow = 'none'; }, 2000);
    }
    window.app.showToast('Navigated to Service-wise Revenue Collection Breakdown', 'info');
  }

  openTodayRevenueModal() {
    let modal = document.getElementById('branchTodayRevenueModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'branchTodayRevenueModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 650px;">
          <div class="modal-header">
            <h3 class="modal-title">💰 Today's Revenue & Collections Audit</h3>
            <button class="modal-close-btn" onclick="window.branchAdminController.closeModal('branchTodayRevenueModal')">✕</button>
          </div>
          <div class="modal-body" id="branchTodayRevenueModalBody"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.branchAdminController.closeModal('branchTodayRevenueModal')">Close Audit</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const container = document.getElementById('branchTodayRevenueModalBody');
    if (!container) return;

    const appointments = window.salonStore.getAppointments(this.currentBranchId);
    const validApts = appointments.filter(a => a.status === 'completed' || a.status === 'confirmed' || a.status === 'accepted');
    const totalRev = validApts.reduce((sum, a) => sum + (a.total || 0), 0);

    let html = `
      <div style="background: rgba(212,175,55,0.08); padding: 16px; border-radius: 10px; border: 1px solid var(--border-gold); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 12px; color: var(--text-gold); font-weight: 700; text-transform: uppercase;">Total Today's Collected Revenue</div>
          <div style="font-size: 28px; font-weight: 800; color: var(--text-gold); font-family: var(--font-heading);">${window.salonStore.formatCurrency(totalRev)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: var(--text-muted);">Receipt Transactions</div>
          <div style="font-size: 20px; font-weight: 700;">${validApts.length} Bookings</div>
        </div>
      </div>

      <h5 style="font-size: 13px; font-weight: 700; color: var(--text-gold); margin-bottom: 10px; text-transform: uppercase;">Receipts Audit Log</h5>
    `;

    if (validApts.length === 0) {
      html += `<p style="font-size: 12px; color: var(--text-muted);">No revenue receipts collected yet today for this branch.</p>`;
    } else {
      html += `
        <div class="table-responsive" style="max-height: 240px; overflow-y: auto;">
          <table class="admin-table" style="font-size: 12px;">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Client Name</th>
                <th>Services</th>
                <th>Payment Method</th>
                <th>Amount Collected</th>
              </tr>
            </thead>
            <tbody>
              ${validApts.map(a => `
                <tr>
                  <td><strong>#${a.id}</strong></td>
                  <td>${a.customerName}</td>
                  <td><span style="font-size: 11px; color: var(--text-muted);">${(a.serviceNames || []).join(', ')}</span></td>
                  <td><span class="badge badge-gold">${a.paymentMethod || 'Online'}</span></td>
                  <td><strong style="color: var(--text-gold);">${window.salonStore.formatCurrency(a.total || 0)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;
    this.openModal('branchTodayRevenueModal');
  }

  openCustomerDirectoryModal() {
    let modal = document.getElementById('branchCustomerDirectoryModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'branchCustomerDirectoryModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
          <div class="modal-header">
            <h3 class="modal-title">👥 Branch Client Directory & Booking History</h3>
            <button class="modal-close-btn" onclick="window.branchAdminController.closeModal('branchCustomerDirectoryModal')">✕</button>
          </div>
          <div class="modal-body" id="branchCustomerDirectoryModalBody"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.branchAdminController.closeModal('branchCustomerDirectoryModal')">Close Directory</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const container = document.getElementById('branchCustomerDirectoryModalBody');
    if (!container) return;

    const appointments = window.salonStore.getAppointments(this.currentBranchId);

    // Aggregate customer stats
    const customerMap = {};
    appointments.forEach(a => {
      const key = a.customerEmail || a.customerPhone || a.customerName;
      if (!customerMap[key]) {
        customerMap[key] = {
          name: a.customerName,
          email: a.customerEmail,
          phone: a.customerPhone,
          bookingCount: 0,
          totalSpent: 0,
          lastVisit: a.date
        };
      }
      customerMap[key].bookingCount += 1;
      if (a.status === 'completed' || a.status === 'confirmed' || a.status === 'accepted') {
        customerMap[key].totalSpent += (a.total || 0);
      }
      if (a.date > customerMap[key].lastVisit) {
        customerMap[key].lastVisit = a.date;
      }
    });

    const customers = Object.values(customerMap);

    let html = `
      <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
        Registered clients who have booked appointments at this salon branch.
      </div>
      <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
        <table class="admin-table" style="font-size: 12px;">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Contact Phone</th>
              <th>Email Address</th>
              <th>Total Bookings</th>
              <th>Total Spend (₹)</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone}</td>
                <td>${c.email}</td>
                <td><strong>${c.bookingCount}</strong></td>
                <td><strong style="color: var(--text-gold);">${window.salonStore.formatCurrency(c.totalSpent)}</strong></td>
                <td>${c.lastVisit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
    this.openModal('branchCustomerDirectoryModal');
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }
}

window.branchAdminController = new BranchAdminController();

// Global Window Helpers for Branch Admin Stat Card Buttons
window.handleBranchTodayAppointments = function () {
  if (window.branchAdminController) window.branchAdminController.filterByPeriod('today');
};

window.handleBranchUpcomingAppointments = function () {
  if (window.branchAdminController) window.branchAdminController.filterByPeriod('upcoming');
};

window.handleBranchTotalCustomers = function () {
  if (window.branchAdminController) window.branchAdminController.openCustomerDirectoryModal();
};

window.handleBranchTodayRevenue = function () {
  if (window.branchAdminController) window.branchAdminController.openTodayRevenueModal();
};

window.handleBranchMonthlyRevenue = function () {
  if (window.branchAdminController) window.branchAdminController.scrollToServiceRevenue();
};
