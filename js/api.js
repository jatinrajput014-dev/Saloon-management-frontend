/**
 * LUXE HAUS - Frontend API Integration Service
 * Connects Frontend UI to Express/MongoDB REST API Backend (http://localhost:5000/api)
 * Automatically provides fallback to Reactive LocalStore if Backend is offline.
 */

class ApiService {
  constructor() {
    this.baseUrl = window.API_BASE_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('LUXE_JWT_TOKEN') || null;
    this.isBackendOnline = false;
    this.checkHealth();
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
        const data = await res.json();
        this.isBackendOnline = data.status === 'online' && data.dbConnected === true;
        if (this.isBackendOnline) {
          console.log('[API Service] Connected to backend REST API:', this.baseUrl);
        } else {
          console.log('[API Service] Backend online but DB disconnected. Using standalone LocalStore mode.');
        }
        this.isBackendOnline = false;
      }
    } catch (e) {
      this.isBackendOnline = false;
      console.log('[API Service] Backend offline or unreachable. Operating in standalone reactive store mode.');
    }
    return this.isBackendOnline;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('LUXE_JWT_TOKEN', token);
    else localStorage.removeItem('LUXE_JWT_TOKEN');
  }

  // --- Auth Methods ---
  async login(email, password) {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        this.setToken(data.token);
        return data;
      }
    } catch (err) {
      console.warn('API login failed:', err);
    }
    return null;
  }

  async registerCustomer(customerData) {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(customerData)
      });
      const data = await res.json();
      if (data.success) {
        this.setToken(data.token);
        return data;
      }
    } catch (err) {
      console.warn('API customer register failed:', err);
    }
    return null;
  }

  // --- Branch Methods ---
  async getBranches() {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/branches?all=true`, { headers: this.getHeaders() });
      const data = await res.json();
      if (data.success) return data.branches;
    } catch (err) {
      console.warn('API getBranches failed:', err);
    }
    return null;
  }

  async toggleBranchStatus(branchId) {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/branches/${branchId}/toggle-status`, {
        method: 'PATCH',
        headers: this.getHeaders()
      });
      const data = await res.json();
      if (data.success) return data.branch;
    } catch (err) {
      console.warn('API toggleBranchStatus failed:', err);
    }
    return null;
  }

  // --- Appointments Methods ---
  async createAppointment(bookingData) {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/appointments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (data.success) return data.appointment;
    } catch (err) {
      console.warn('API createAppointment failed:', err);
    }
    return null;
  }

  async collectSalonPayment(appointmentId, paymentMethod, paymentStatus = 'paid') {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/appointments/${appointmentId}/payment`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ paymentMethod, paymentStatus })
      });
      const data = await res.json();
      if (data.success) return data.appointment;
    } catch (err) {
      console.warn('API collectSalonPayment failed:', err);
    }
    return null;
  }

  async validateCoupon(code, branchId, subtotal) {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/coupons/validate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ code, branchId, subtotal })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('API validateCoupon failed:', err);
    }
    return null;
  }

  // --- Attendance API Methods (Matching Guidelines Format) ---
  /**
   * Check-In Endpoint: POST /api/v1/attendance/checkin
   * Returns exact format: { success, message, isCheckedIn, data: { _id, user, date, checkInTime, checkOutTime, totalMinutes, status, isCheckedIn } }
   */
  async checkIn(userId) {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/v1/attendance/checkin`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ user: userId })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('API attendance checkIn failed:', err);
    }
    return null;
  }

  /**
   * Check-Out Endpoint: POST /api/v1/attendance/checkout
   * Returns format: { success, message, isCheckedIn: false, data: { ... } }
   */
  async checkOut(userId) {
    if (!this.isBackendOnline) return null;
    try {
      const res = await fetch(`${this.baseUrl}/v1/attendance/checkout`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ user: userId })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('API attendance checkOut failed:', err);
    }
    return null;
  }

  /**
   * Attendance Status Endpoint: GET /api/v1/attendance/status
   */
  async getAttendanceStatus(userId) {
    if (!this.isBackendOnline) return null;
    try {
      const url = userId ? `${this.baseUrl}/v1/attendance/status?user=${userId}` : `${this.baseUrl}/v1/attendance/status`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('API attendance getStatus failed:', err);
    }
    return null;
  }
}

window.apiService = new ApiService();


