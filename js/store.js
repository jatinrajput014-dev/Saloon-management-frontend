/**
 * LUXE HAUS - Multi-Branch Salon Management System (India Edition)
 * Centralized Reactive State Store with LocalStorage Persistence
 */

const STORAGE_KEY = 'LUXE_SALON_STATE_V3_ROLE_IDENTIFIERS';

// Seed Initial Data with Indian Locations & INR Currency (₹)
const INITIAL_DATA = {
  // Current logged in simulation role
  currentUser: {
    id: 'headadmin-01',
    loginId: 'headadmin',
    name: 'Eleanor Sterling',
    email: 'headadmin@luxehaus.in',
    role: 'head_admin', // 'head_admin' | 'branch_admin' | 'customer'
    branchId: null,
    avatar: 'ES',
    phone: '+91 98200 11223'
  },

  // Customer Account for Customer App
  customerUser: {
    id: 'CUST-8801',
    name: 'Sophia Laurent',
    email: 'sophia.laurent@vogue.in',
    phone: '+91 98199 88776',
    avatar: 'SL',
    memberTier: 'Regular Customer',
    savedCards: [{ last4: '4242', brand: 'Visa', exp: '08/28' }],
    loyaltyPoints: 480
  },

  // Branches (AURA SALON Locations)
  branches: [
    {
      id: 'BR-01',
      name: 'Jaipur Central',
      code: 'JPR-01',
      city: 'Jaipur',
      address: 'Main Flagship, M.I. Road, Jaipur, RJ 302001',
      phone: '+91 98200 11223',
      email: 'central@aurasalon.in',
      adminId: 'ADMIN-JPR01',
      adminName: 'Ramesh Sharma',
      status: 'active', // 'active' | 'deactivated'
      openingTime: '09:00',
      closingTime: '20:30',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      chairs: 12,
      rating: 4.95,
      reviewCount: 420,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      amenities: ['Beverage Bar', 'Valet Parking', 'VIP Suite', 'Wi-Fi'],
      stylists: ['ST-01', 'ST-02', 'ST-03']
    },
    {
      id: 'BR-02',
      name: 'Malviya Nagar',
      code: 'JPR-02',
      city: 'Jaipur',
      address: 'South Zone, Calgiri Marg, Malviya Nagar, Jaipur, RJ 302017',
      phone: '+91 98800 44556',
      email: 'malviya@aurasalon.in',
      adminId: 'ADMIN-JPR02',
      adminName: 'Pooja Verma',
      status: 'active',
      openingTime: '08:30',
      closingTime: '21:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      chairs: 8,
      rating: 4.88,
      reviewCount: 380,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      amenities: ['Coffee Bar', 'Private Styling Booths', 'Spa Terrace'],
      stylists: ['ST-04', 'ST-05']
    },
    {
      id: 'BR-03',
      name: 'Vaishali Nagar',
      code: 'JPR-03',
      city: 'Jaipur',
      address: 'Queens Road, Vaishali Nagar, Jaipur, RJ 302021',
      phone: '+91 99100 77889',
      email: 'vaishali@aurasalon.in',
      adminId: 'ADMIN-JPR03',
      adminName: 'Amit Patel',
      status: 'deactivated',
      openingTime: '10:00',
      closingTime: '20:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      chairs: 10,
      rating: 4.82,
      reviewCount: 290,
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      amenities: ['Sauna', 'Aromatherapy Cabins'],
      stylists: ['ST-06']
    },
    {
      id: 'BR-04',
      name: 'C-Scheme',
      code: 'JPR-04',
      city: 'Jaipur',
      address: 'Central Hub, Ashok Marg, C-Scheme, Jaipur, RJ 302001',
      phone: '+91 97100 88990',
      email: 'cscheme@aurasalon.in',
      adminId: 'ADMIN-JPR04',
      adminName: 'Sunita Rao',
      status: 'active',
      openingTime: '09:00',
      closingTime: '21:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      chairs: 14,
      rating: 4.92,
      reviewCount: 310,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      amenities: ['Beverage Bar', 'VIP Rooms', 'Blowout Bar'],
      stylists: ['ST-07', 'ST-08']
    }
  ],

  // Service Categories
  categories: [
    {
      id: 'CAT-01',
      name: 'Hair Styling & Cuts',
      slug: 'hair-styling',
      description: 'Signature cuts, blowout styling, and luxury scalp remedies.',
      icon: '✂️',
      color: '#D4AF37',
      active: true,
      serviceCount: 3
    },
    {
      id: 'CAT-02',
      name: 'Color & Balayage',
      slug: 'color-highlights',
      description: 'French balayage, glossing, and organic grey coverage.',
      icon: '🎨',
      color: '#C5A059',
      active: true,
      serviceCount: 2
    },
    {
      id: 'CAT-03',
      name: 'Skin, Glow & Ayurveda Spa',
      slug: 'skin-spa',
      description: '24K gold facials, Kumkumadi glow, and lymphatic drainage.',
      icon: '✨',
      color: '#E0A96D',
      active: true,
      serviceCount: 3
    },
    {
      id: 'CAT-04',
      name: 'Nails & Couture Art',
      slug: 'nails-art',
      description: 'Russian manicures, gel extensions, and spa pedicures.',
      icon: '💅',
      color: '#F4A261',
      active: true,
      serviceCount: 2
    },
    {
      id: 'CAT-05',
      name: 'Bridal & Royal Makeovers',
      slug: 'bridal-vip',
      description: 'Complete royal wedding glam with private VIP suite access.',
      icon: '👑',
      color: '#E29578',
      active: true,
      serviceCount: 1
    }
  ],

  // Services Catalog (Prices in INR ₹)
  services: [
    {
      id: 'SRV-01',
      categoryId: 'CAT-01',
      name: 'Couture Haircut & Editorial Blowout',
      description: 'Personalized consultation, precision hair sculpture, hair gloss rinse, and bouncy editorial blowout.',
      duration: 60, // mins
      price: 2499, // ₹ INR
      popular: true,
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02', 'BR-03'],
      active: true
    },
    {
      id: 'SRV-02',
      categoryId: 'CAT-01',
      name: 'Keratin Diamond Smoothing Therapy',
      description: 'Zero-formaldehyde smoothing restoring silkiness and frizz-free radiance for up to 5 months.',
      duration: 120,
      price: 7999,
      popular: false,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02'],
      active: true
    },
    {
      id: 'SRV-03',
      categoryId: 'CAT-01',
      name: 'Scalp Detox & Caviar Steam Ritual',
      description: 'Scalp micro-exfoliation, royal caviar peptide mask, hot towel steam therapy, and luminous shine seal.',
      duration: 45,
      price: 1899,
      popular: false,
      image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02', 'BR-03'],
      active: true
    },
    {
      id: 'SRV-04',
      categoryId: 'CAT-02',
      name: 'Custom Parisian Balayage & Glaze',
      description: 'Hand-painted dimensional contouring, seamless sun-kissed blending, and color gloss seal.',
      duration: 150,
      price: 8499,
      popular: true,
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02'],
      active: true
    },
    {
      id: 'SRV-05',
      categoryId: 'CAT-02',
      name: 'Gloss Infusion & Root Refresh',
      description: 'Rich conditioning glaze boosting shine, toning undertones, and sealing hair cuticles.',
      duration: 50,
      price: 2999,
      popular: false,
      image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02', 'BR-03'],
      active: true
    },
    {
      id: 'SRV-06',
      categoryId: 'CAT-03',
      name: '24K Gold Cellular Radiance Facial',
      description: 'Pure 24K colloidal gold sheet mask, micro-current lifting, sonic infusion, and deep facial massage.',
      duration: 75,
      price: 4999,
      popular: true,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02', 'BR-03'],
      active: true
    },
    {
      id: 'SRV-07',
      categoryId: 'CAT-03',
      name: 'Hydra-Infusion Botanical Skincare',
      description: 'Triple vortex hydra-dermabrasion, hyaluronic serum quenching, LED light therapy, and barrier shield.',
      duration: 60,
      price: 3499,
      popular: false,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-03'],
      active: true
    },
    {
      id: 'SRV-08',
      categoryId: 'CAT-04',
      name: 'Russian Haute Manicure & Gel Glaze',
      description: 'Cuticle precision dry manicure, rubber base strengthening, and chip-free gel lacquer.',
      duration: 65,
      price: 1799,
      popular: true,
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02', 'BR-03'],
      active: true
    },
    {
      id: 'SRV-09',
      categoryId: 'CAT-04',
      name: 'Rose Quartz Spa Pedicure Ritual',
      description: 'Warm organic rose petal soak, foot scrub, volcanic hot stone massage, and luminous gel coat.',
      duration: 60,
      price: 2199,
      popular: false,
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02'],
      active: true
    },
    {
      id: 'SRV-10',
      categoryId: 'CAT-05',
      name: 'Royal Bridal Royal Makeover Package',
      description: 'Complete trial session, bespoke bridal hair updo, HD airbrush makeup, lashes, and dedicated VIP suite.',
      duration: 180,
      price: 18500,
      popular: true,
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
      branches: ['BR-01', 'BR-02'],
      active: true
    }
  ],

  // Stylists & Specialists
  stylists: [
    {
      id: 'ST-01',
      name: 'Julien Mercier',
      branchId: 'BR-01',
      role: 'Master Hair Director',
      rating: 4.98,
      avatar: 'JM',
      specialty: 'Couture Cuts & Balayage',
      experience: '12 yrs'
    },
    {
      id: 'ST-02',
      name: 'Ananya Sen',
      branchId: 'BR-01',
      role: 'Lead Esthetician',
      rating: 4.95,
      avatar: 'AS',
      specialty: '24K Gold Facials & Hydra Spa',
      experience: '9 yrs'
    },
    {
      id: 'ST-03',
      name: 'Camille Laurent',
      branchId: 'BR-01',
      role: 'Nail Artist & Sculptor',
      rating: 4.92,
      avatar: 'CL',
      specialty: 'Russian Gel Couture',
      experience: '7 yrs'
    },
    {
      id: 'ST-04',
      name: 'Vikram Malhotra',
      branchId: 'BR-02',
      role: 'Creative Director',
      rating: 4.96,
      avatar: 'VM',
      specialty: 'Precision Styling & Tone Master',
      experience: '14 yrs'
    },
    {
      id: 'ST-05',
      name: 'Seraphina Moon',
      branchId: 'BR-02',
      role: 'Senior Colorist',
      rating: 4.90,
      avatar: 'SM',
      specialty: 'French Balayage & Glazing',
      experience: '8 yrs'
    },
    {
      id: 'ST-06',
      name: 'Rohan Mehta',
      branchId: 'BR-03',
      role: 'Spa Therapy Lead',
      rating: 4.88,
      avatar: 'RM',
      specialty: 'Deep Tissue & Skincare',
      experience: '10 yrs'
    }
  ],

  // Offers & Coupons (Managed by Head Admin - Indian Rupees ₹)
  coupons: [
    {
      id: 'CPN-01',
      code: 'GLAM20',
      title: 'Festival Season Glamour',
      description: 'Get 20% off all styling and aesthetic treatments.',
      discountType: 'percentage', // 'percentage' | 'fixed'
      discountValue: 20,
      minOrderAmount: 1999, // Min order ₹1,999
      maxDiscount: 1500, // Max discount ₹1,500
      validFrom: '2026-01-01',
      validUntil: '2026-12-31',
      usageLimit: 500,
      usageCount: 142,
      applicableBranches: 'all',
      active: true
    },
    {
      id: 'CPN-02',
      code: 'LUXEVIP',
      title: 'VIP Premier Suite Pass',
      description: 'Enjoy ₹500 instant credit on orders above ₹3,000.',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 3000,
      maxDiscount: 500,
      validFrom: '2026-02-01',
      validUntil: '2026-11-30',
      usageLimit: 200,
      usageCount: 89,
      applicableBranches: 'all',
      active: true
    },
    {
      id: 'CPN-03',
      code: 'FIRST50',
      title: 'New Client Welcome Special',
      description: '50% off on your inaugural signature cut & styling (Max ₹1,000).',
      discountType: 'percentage',
      discountValue: 50,
      minOrderAmount: 1500,
      maxDiscount: 1000,
      validFrom: '2026-01-15',
      validUntil: '2026-12-31',
      usageLimit: 1000,
      usageCount: 310,
      applicableBranches: ['BR-01', 'BR-02', 'BR-03'],
      active: true
    },
    {
      id: 'CPN-04',
      code: 'SPA15',
      title: 'Ayurvedic Spa Retreat',
      description: '15% savings on all facials and therapeutic massages.',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 2000,
      maxDiscount: 800,
      validFrom: '2026-03-01',
      validUntil: '2026-10-31',
      usageLimit: 300,
      usageCount: 78,
      applicableBranches: ['BR-01', 'BR-03'],
      active: true
    }
  ],

  // Appointments (INR ₹ totals)
  appointments: [
    {
      id: 'APT-1001',
      branchId: 'BR-01',
      customerId: 'CUST-8801',
      customerName: 'Sophia Laurent',
      customerPhone: '+91 98199 88776',
      customerEmail: 'sophia.laurent@vogue.in',
      serviceIds: ['SRV-01', 'SRV-06'],
      serviceNames: ['Couture Haircut & Editorial Blowout', '24K Gold Cellular Radiance Facial'],
      stylistId: 'ST-01',
      stylistName: 'Julien Mercier',
      date: '2026-10-02',
      timeSlot: '14:00',
      duration: 135,
      chairNumber: 'Chair 02 (VIP)',
      subtotal: 7498,
      couponCode: 'GLAM20',
      discount: 1499,
      total: 5999,
      paymentMethod: 'Online',
      paymentStatus: 'paid',
      status: 'accepted',
      notes: 'Client prefers herbal green tea service upon arrival.',
      createdAt: '2026-09-28T10:15:00Z'
    },
    {
      id: 'APT-1002',
      branchId: 'BR-01',
      customerId: 'CUST-8802',
      customerName: 'Priya Nair',
      customerPhone: '+91 98201 44332',
      customerEmail: 'priya.nair@designstudio.in',
      serviceIds: ['SRV-04'],
      serviceNames: ['Custom Parisian Balayage & Glaze'],
      stylistId: 'ST-01',
      stylistName: 'Julien Mercier',
      date: '2026-10-02',
      timeSlot: '10:00',
      duration: 150,
      chairNumber: 'Chair 01',
      subtotal: 8499,
      couponCode: null,
      discount: 0,
      total: 8499,
      paymentMethod: 'Online',
      paymentStatus: 'paid',
      status: 'pending',
      notes: 'Caramel tones preferred.',
      createdAt: '2026-09-29T14:30:00Z'
    },
    {
      id: 'APT-1003',
      branchId: 'BR-01',
      customerId: 'CUST-8803',
      customerName: 'Kavita Krishnamurthy',
      customerPhone: '+91 98332 11009',
      customerEmail: 'kavita@krishnamurthy.in',
      serviceIds: ['SRV-08'],
      serviceNames: ['Russian Haute Manicure & Gel Glaze'],
      stylistId: 'ST-03',
      stylistName: 'Camille Laurent',
      date: '2026-10-02',
      timeSlot: '16:30',
      duration: 65,
      chairNumber: 'Manicure Station 1',
      subtotal: 1799,
      couponCode: null,
      discount: 0,
      total: 1799,
      paymentMethod: 'Pay at Salon',
      paymentStatus: 'pending',
      status: 'pending',
      notes: 'Glazed nude finish.',
      createdAt: '2026-09-30T09:00:00Z'
    },
    {
      id: 'APT-1004',
      branchId: 'BR-02',
      customerId: 'CUST-8804',
      customerName: 'Arjun Singhania',
      customerPhone: '+91 98801 22990',
      customerEmail: 'arjun@singhaniacapital.in',
      serviceIds: ['SRV-01', 'SRV-03'],
      serviceNames: ['Couture Haircut & Editorial Blowout', 'Scalp Detox & Caviar Steam Ritual'],
      stylistId: 'ST-04',
      stylistName: 'Vikram Malhotra',
      date: '2026-10-02',
      timeSlot: '11:30',
      duration: 105,
      chairNumber: 'Chair 04',
      subtotal: 4398,
      couponCode: 'LUXEVIP',
      discount: 500,
      total: 3898,
      paymentMethod: 'Online',
      paymentStatus: 'paid',
      status: 'completed',
      notes: 'Monthly regular booking.',
      createdAt: '2026-09-29T11:20:00Z'
    }
  ],

  // Branch Admins list
  branchAdmins: [
    {
      id: 'branchadmin-br01',
      loginId: 'branchadmin.mumbai',
      name: 'Rhea Kapoor',
      email: 'branchadmin.mumbai@luxehaus.in',
      password: 'branchadmin123',
      phone: '+91 98200 11223',
      branchId: 'BR-01',
      branchName: 'Luxe Haus - Bandra West',
      status: 'active',
      joinedDate: '2024-03-15'
    },
    {
      id: 'branchadmin-br02',
      loginId: 'branchadmin.bengaluru',
      name: 'Aarav Reddy',
      email: 'branchadmin.bengaluru@luxehaus.in',
      password: 'branchadmin123',
      phone: '+91 98800 44556',
      branchId: 'BR-02',
      branchName: 'Luxe Haus - Indiranagar Studio',
      status: 'active',
      joinedDate: '2024-06-01'
    },
    {
      id: 'branchadmin-br03',
      loginId: 'branchadmin.delhi',
      name: 'Neha Verma',
      email: 'branchadmin.delhi@luxehaus.in',
      password: 'branchadmin123',
      phone: '+91 99100 77889',
      branchId: 'BR-03',
      branchName: 'Luxe Haus - Cyber City Lounge',
      status: 'active',
      joinedDate: '2024-09-20'
    }
  ]
};

class SalonStore {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_DATA, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
    this.notify();
  }

  resetToDefault() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('LUXE_SALON')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear localStorage keys:', e);
    }
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  getState() {
    return this.state;
  }

  // Currency Helper
  formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  }

  // --- Auth & Role Switching ---
  setCurrentRole(role, branchId = null) {
    this.state.currentUser.role = role;
    if (role === 'head_admin') {
      this.state.currentUser.id = 'headadmin-01';
      this.state.currentUser.loginId = 'headadmin';
      this.state.currentUser.name = 'Eleanor Sterling';
      this.state.currentUser.email = 'headadmin@luxehaus.in';
      this.state.currentUser.branchId = null;
    } else if (role === 'branch_admin') {
      const targetBranch = this.getBranchById(branchId) || this.state.branches[0];
      const admin = this.getBranchAdmin(targetBranch.id);
      this.state.currentUser.id = admin.id || `branchadmin-${targetBranch.id.toLowerCase()}`;
      this.state.currentUser.loginId = admin.loginId || `branchadmin.${targetBranch.city.toLowerCase()}`;
      this.state.currentUser.name = `${admin.name} (${targetBranch.city} Branch Manager)`;
      this.state.currentUser.email = admin.email;
      this.state.currentUser.branchId = targetBranch.id;
    } else if (role === 'customer') {
      this.state.currentUser.id = this.state.customerUser.id;
      this.state.currentUser.name = this.state.customerUser.name;
      this.state.currentUser.email = this.state.customerUser.email;
      this.state.currentUser.branchId = null;
    }
    this.saveState();
  }

  // --- Branch Management ---
  getBranches() {
    return this.state.branches;
  }

  getActiveBranches() {
    return this.state.branches.filter(b => b.status === 'active');
  }

  getBranchById(id) {
    return this.state.branches.find(b => b.id === id);
  }

  getBranchAdmin(branchId) {
    const admin = (this.state.branchAdmins || []).find(a => a.branchId === branchId);
    if (admin) return admin;

    const branch = this.getBranchById(branchId);
    const citySlug = branch && branch.city ? branch.city.toLowerCase().replace(/\s+/g, '') : 'branch';
    const bId = branchId ? branchId.toLowerCase().replace(/[^a-z0-9]/g, '') : 'br01';
    const adminLoginId = (branch && branch.adminEmail) ? branch.adminEmail.toLowerCase() : `${citySlug}@luxehaus.in`;

    return {
      id: `branchadmin-${bId}`,
      loginId: adminLoginId.includes('@luxehaus.in') ? adminLoginId : `${citySlug}@luxehaus.in`,
      name: branch ? branch.adminName : 'Branch Manager',
      email: adminLoginId.includes('@luxehaus.in') ? adminLoginId : `${citySlug}@luxehaus.in`,
      password: (branch && branch.adminPassword) ? branch.adminPassword : 'branchadmin123',
      phone: branch ? branch.phone : '+919800000000',
      branchId: branchId || 'BR-01',
      branchName: branch ? branch.name : 'Luxe Haus',
      status: branch ? branch.status : 'active'
    };
  }

  getBranchAdmins() {
    return this.state.branches.map(b => this.getBranchAdmin(b.id));
  }

  toggleBranchStatus(branchId) {
    const branch = this.getBranchById(branchId);
    if (branch) {
      branch.status = branch.status === 'active' ? 'deactivated' : 'active';
      this.saveState();
      return branch;
    }
    return null;
  }

  addBranch(branchData) {
    const id = 'BR-' + String(this.state.branches.length + 1).padStart(2, '0');
    const citySlug = (branchData.city || 'branch').toLowerCase().replace(/\s+/g, '');
    const adminLoginId = (branchData.adminEmail || `${citySlug}@luxehaus.in`).toLowerCase();
    const finalAdminEmail = adminLoginId.includes('@luxehaus.in') ? adminLoginId : `${citySlug}@luxehaus.in`;

    const newBranch = {
      id,
      name: branchData.name,
      code: branchData.code || `BR-${Date.now().toString().slice(-4)}`,
      city: branchData.city || 'Mumbai',
      address: branchData.address,
      phone: branchData.phone || '9800000000',
      email: branchData.email || finalAdminEmail,
      adminId: 'ADMIN-' + id,
      adminName: branchData.adminName || 'Assigned Admin',
      adminEmail: finalAdminEmail,
      adminPassword: branchData.adminPassword || 'luxe123',
      status: branchData.status || 'active',
      openingTime: branchData.openingTime || '09:00 AM',
      closingTime: branchData.closingTime || '08:00 PM',
      chairs: parseInt(branchData.chairs) || 6,
      rating: 5.0,
      reviewCount: 0,
      image: branchData.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      amenities: branchData.amenities || ['Luxury Lounge', 'Beverage Bar', 'Wi-Fi'],
      stylists: []
    };

    if (!this.state.branchAdmins) this.state.branchAdmins = [];
    // Remove existing admin entry for this branch if any
    this.state.branchAdmins = this.state.branchAdmins.filter(a => a.branchId !== id);
    this.state.branchAdmins.push({
      id: `branchadmin-${id.toLowerCase()}`,
      loginId: finalAdminEmail,
      name: newBranch.adminName,
      email: finalAdminEmail,
      password: newBranch.adminPassword,
      phone: newBranch.phone,
      branchId: id,
      branchName: newBranch.name,
      status: newBranch.status,
      joinedDate: new Date().toISOString().split('T')[0]
    });

    this.state.branches.push(newBranch);
    this.saveState();
    return newBranch;
  }

  updateBranch(branchId, updates) {
    const branch = this.getBranchById(branchId);
    if (branch) {
      Object.assign(branch, updates);

      // Also update or sync branch admin credentials
      let admin = this.state.branchAdmins.find(a => a.branchId === branchId);
      if (!admin) {
        admin = {
          id: 'ADMIN-' + branchId,
          branchId,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        this.state.branchAdmins.push(admin);
      }

      admin.name = updates.adminName || branch.adminName;
      if (updates.adminEmail) admin.email = updates.adminEmail;
      if (updates.adminPassword) admin.password = updates.adminPassword;
      admin.branchName = branch.name;
      admin.phone = branch.phone;
      admin.status = branch.status;

      this.saveState();
      return branch;
    }
    return null;
  }

  deleteBranch(branchId) {
    this.state.branches = this.state.branches.filter(b => b.id !== branchId);
    this.state.branchAdmins = this.state.branchAdmins.filter(a => a.branchId !== branchId);
    this.saveState();
  }

  // --- Category Management ---
  getCategories() {
    return this.state.categories;
  }

  addCategory(categoryData) {
    const id = 'CAT-' + String(this.state.categories.length + 1).padStart(2, '0');
    const newCat = {
      id,
      name: categoryData.name,
      slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: categoryData.description || '',
      icon: categoryData.icon || '✨',
      color: categoryData.color || '#D4AF37',
      active: true,
      serviceCount: 0
    };
    this.state.categories.push(newCat);
    this.saveState();
    return newCat;
  }

  updateCategory(categoryId, updates) {
    const cat = this.state.categories.find(c => c.id === categoryId);
    if (cat) {
      Object.assign(cat, updates);
      this.saveState();
      return cat;
    }
    return null;
  }

  toggleCategory(categoryId) {
    const cat = this.state.categories.find(c => c.id === categoryId);
    if (cat) {
      cat.active = !cat.active;
      this.saveState();
      return cat;
    }
    return null;
  }

  deleteCategory(categoryId) {
    this.state.categories = this.state.categories.filter(c => c.id !== categoryId);
    this.state.services.forEach(s => {
      if (s.categoryId === categoryId) s.categoryId = null;
    });
    this.saveState();
  }

  // --- Service Management ---
  getServices() {
    return this.state.services;
  }

  getServicesByBranch(branchId) {
    // Every active service is available across all branches
    return this.state.services.filter(s => s.active);
  }

  getServicesByCategory(categoryId, branchId = null) {
    return this.state.services.filter(s => {
      if (!s.active) return false;
      if (s.categoryId !== categoryId) return false;
      return true;
    });
  }

  addService(serviceData) {
    const id = 'SRV-' + String(this.state.services.length + 1).padStart(2, '0');
    const newService = {
      id,
      categoryId: serviceData.categoryId,
      name: serviceData.name,
      description: serviceData.description,
      duration: parseInt(serviceData.duration) || 60,
      price: parseFloat(serviceData.price) || 1500,
      popular: !!serviceData.popular,
      image: serviceData.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      branches: ['all'], // Every active service is available in all branches
      active: true
    };
    this.state.services.push(newService);

    const cat = this.state.categories.find(c => c.id === newService.categoryId);
    if (cat) cat.serviceCount = (cat.serviceCount || 0) + 1;

    this.saveState();
    return newService;
  }

  updateService(serviceId, updates) {
    const service = this.state.services.find(s => s.id === serviceId);
    if (service) {
      Object.assign(service, updates);
      this.saveState();
      return service;
    }
    return null;
  }

  toggleService(serviceId) {
    const service = this.state.services.find(s => s.id === serviceId);
    if (service) {
      service.active = !service.active;
      this.saveState();
      return service;
    }
    return null;
  }

  getBranchAdmin(branchId) {
    const admin = this.state.branchAdmins.find(a => a.branchId === branchId);
    if (admin) return admin;
    const branch = this.getBranchById(branchId);
    return {
      id: 'ADMIN-' + branchId,
      name: branch ? branch.adminName : 'Assigned Admin',
      email: `${branchId.toLowerCase()}@luxehaus.in`,
      password: 'luxe123',
      phone: branch ? branch.phone : '+91 98000 00000',
      branchId,
      branchName: branch ? branch.name : 'Salon Branch',
      status: 'active'
    };
  }

  isBranchOpen(branchId, date, timeStr) {
    const branch = this.getBranchById(branchId);
    if (!branch) return { isOpen: false, reason: 'Invalid branch selection.' };
    if (branch.status === 'deactivated') {
      return { isOpen: false, reason: `Branch "${branch.name}" is deactivated by Head Admin and not accepting new appointments.` };
    }
    if (timeStr && branch.openingTime && branch.closingTime) {
      const [h, m] = timeStr.split(':').map(Number);
      const [opH, opM] = branch.openingTime.split(':').map(Number);
      const [clH, clM] = branch.closingTime.split(':').map(Number);

      const slotMins = h * 60 + m;
      const opMins = opH * 60 + opM;
      const clMins = clH * 60 + clM;

      if (slotMins < opMins || slotMins >= clMins) {
        return {
          isOpen: false,
          reason: `Selected time slot (${timeStr}) is outside branch operating hours (${branch.openingTime} - ${branch.closingTime}).`
        };
      }
    }
    return { isOpen: true };
  }

  deleteService(serviceId) {
    this.state.services = this.state.services.filter(s => s.id !== serviceId);
    this.saveState();
  }

  // --- Offers & Coupon Management ---
  getCoupons() {
    return this.state.coupons;
  }

  addCoupon(couponData) {
    const id = 'CPN-' + String(this.state.coupons.length + 1).padStart(2, '0');
    const newCoupon = {
      id,
      code: couponData.code.toUpperCase().trim(),
      title: couponData.title,
      description: couponData.description,
      discountType: couponData.discountType || 'percentage',
      discountValue: parseFloat(couponData.discountValue) || 10,
      minOrderAmount: parseFloat(couponData.minOrderAmount) || 0,
      maxDiscount: parseFloat(couponData.maxDiscount) || 1000,
      validFrom: couponData.validFrom || new Date().toISOString().split('T')[0],
      validUntil: couponData.validUntil || '2026-12-31',
      usageLimit: parseInt(couponData.usageLimit) || 100,
      usageCount: 0,
      applicableBranches: couponData.applicableBranches || 'all',
      active: true
    };
    this.state.coupons.push(newCoupon);
    this.saveState();
    return newCoupon;
  }

  updateCoupon(couponId, updates) {
    const coupon = this.state.coupons.find(c => c.id === couponId);
    if (coupon) {
      if (updates.code) updates.code = updates.code.toUpperCase().trim();
      Object.assign(coupon, updates);
      this.saveState();
      return coupon;
    }
    return null;
  }

  toggleCoupon(couponId) {
    const coupon = this.state.coupons.find(c => c.id === couponId);
    if (coupon) {
      coupon.active = !coupon.active;
      this.saveState();
      return coupon;
    }
    return null;
  }

  deleteCoupon(couponId) {
    this.state.coupons = this.state.coupons.filter(c => c.id !== couponId);
    this.saveState();
  }

  validateCoupon(code, branchId, subtotal) {
    if (!code) return { valid: false, message: 'Please enter a coupon code' };
    const normalized = code.toUpperCase().trim();
    if (!/[a-zA-Z]/.test(normalized)) {
      return { valid: false, message: 'Promo / Coupon Code must contain at least 1 letter (cannot be purely numeric).' };
    }
    const coupon = this.state.coupons.find(c => c.code === normalized);

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }
    if (!coupon.active) {
      return { valid: false, message: 'This coupon is no longer active' };
    }
    const today = new Date().toISOString().split('T')[0];
    if (coupon.validUntil < today) {
      return { valid: false, message: 'This coupon has expired' };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit has been reached' };
    }
    if (coupon.applicableBranches !== 'all') {
      if (Array.isArray(coupon.applicableBranches) && !coupon.applicableBranches.includes(branchId)) {
        return { valid: false, message: 'This coupon is not valid at this branch' };
      }
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of ${this.formatCurrency(coupon.minOrderAmount)} required for this coupon`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
      message: `Coupon '${coupon.code}' applied successfully! Saved ${this.formatCurrency(discount)}`
    };
  }

  // --- Appointments Management ---
  getAppointments(branchId = null) {
    if (!branchId) return this.state.appointments;
    return this.state.appointments.filter(a => a.branchId === branchId);
  }

  getAppointmentsByCustomer(customerId) {
    return this.state.appointments.filter(a => a.customerId === customerId);
  }

  createAppointment(bookingData) {
    const id = 'APT-' + Math.floor(1000 + Math.random() * 9000);
    const branch = this.getBranchById(bookingData.branchId);

    const services = this.state.services.filter(s => bookingData.serviceIds.includes(s.id));
    const serviceNames = services.map(s => s.name);
    const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);
    const subtotal = services.reduce((acc, s) => acc + s.price, 0);

    let stylistName = 'Any Available Specialist';
    if (bookingData.stylistId && bookingData.stylistId !== 'any') {
      const st = this.state.stylists.find(s => s.id === bookingData.stylistId);
      if (st) stylistName = st.name;
    }

    let discount = 0;
    let couponCode = null;
    if (bookingData.couponCode) {
      const val = this.validateCoupon(bookingData.couponCode, bookingData.branchId, subtotal);
      if (val.valid) {
        discount = val.discount;
        couponCode = val.coupon.code;
        val.coupon.usageCount = (val.coupon.usageCount || 0) + 1;
      }
    }

    const total = Math.max(0, subtotal - discount);

    const newAppointment = {
      id,
      branchId: bookingData.branchId,
      branchName: branch ? branch.name : 'Luxe Haus Salon',
      customerId: bookingData.customerId || this.state.customerUser.id,
      customerName: bookingData.customerName || this.state.customerUser.name,
      customerPhone: bookingData.customerPhone || this.state.customerUser.phone,
      customerEmail: bookingData.customerEmail || this.state.customerUser.email,
      serviceIds: bookingData.serviceIds,
      serviceNames,
      stylistId: bookingData.stylistId || 'any',
      stylistName,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      duration: totalDuration,
      chairNumber: `Chair ${(Math.floor(Math.random() * (branch ? branch.chairs : 6)) + 1).toString().padStart(2, '0')}`,
      subtotal,
      couponCode,
      discount,
      total,
      paymentMethod: bookingData.paymentMethod || 'Pay Online',
      paymentStatus: bookingData.paymentStatus || (bookingData.paymentMethod === 'Pay at Salon' ? 'pending' : 'paid'),
      status: bookingData.status || 'pending',
      notes: bookingData.notes || 'Booked via Luxe Mobile App',
      createdAt: new Date().toISOString()
    };

    this.state.appointments.unshift(newAppointment);

    this.addNotification(newAppointment.customerId, `🎉 Booking Confirmation: Reservation #${newAppointment.id} at ${newAppointment.branchName} received (Pending Acceptance).`, 'confirmation');

    this.saveState();
    return newAppointment;
  }

  addNotification(customerId, message, type = 'info') {
    if (!this.state.notifications) this.state.notifications = [];
    const notif = {
      id: 'NOTIF-' + Date.now(),
      customerId,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.state.notifications.unshift(notif);
    this.saveState();
    return notif;
  }

  getNotifications(customerId) {
    if (!this.state.notifications) return [];
    return this.state.notifications.filter(n => n.customerId === customerId);
  }

  collectSalonPayment(appointmentId, paymentMethod) {
    const apt = this.state.appointments.find(a => a.id === appointmentId || a._id === appointmentId);
    if (apt) {
      apt.paymentStatus = 'paid';
      apt.paymentMethod = paymentMethod;
      this.addNotification(
        apt.customerId,
        `💰 Payment of ${this.formatCurrency(apt.total)} collected at Salon via ${paymentMethod}.`,
        'completed'
      );
      this.saveState();
      return apt;
    }
    return null;
  }

  updateAppointmentStatus(appointmentId, newStatus) {
    const apt = this.state.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.status = newStatus;
      if (newStatus === 'completed') {
        apt.paymentStatus = 'paid';
      }

      const eventTitles = {
        accepted: `✓ Appointment #${apt.id} ACCEPTED by branch admin!`,
        rejected: `✕ Appointment #${apt.id} REJECTED by branch admin.`,
        completed: `✨ Appointment #${apt.id} marked COMPLETED. Thank you!`,
        cancelled: `🚫 Appointment #${apt.id} CANCELLED.`
      };

      if (eventTitles[newStatus]) {
        this.addNotification(apt.customerId, eventTitles[newStatus], newStatus);
      }

      this.saveState();
      return apt;
    }
    return null;
  }

  rescheduleAppointment(appointmentId, newDate, newTimeSlot) {
    const apt = this.state.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.date = newDate;
      apt.timeSlot = newTimeSlot;
      apt.status = 'rescheduled';
      this.addNotification(apt.customerId, `📅 Appointment #${apt.id} RESCHEDULED to ${newDate} at ${newTimeSlot}.`, 'rescheduled');
      this.saveState();
      return apt;
    }
    return null;
  }

  cancelAppointment(appointmentId, reason = 'Cancelled by user') {
    const apt = this.state.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.status = 'cancelled';
      apt.cancellationReason = reason;
      this.addNotification(apt.customerId, `🚫 Appointment #${apt.id} CANCELLED. Reason: ${reason}`, 'cancelled');
      this.saveState();
      return apt;
    }
    return null;
  }

  // --- Stylists ---
  getStylists(branchId = null) {
    if (!branchId) return this.state.stylists;
    return this.state.stylists.filter(s => s.branchId === branchId);
  }

  // --- Customer Profile Updates ---
  updateCustomerProfile(updates) {
    Object.assign(this.state.customerUser, updates);
    this.saveState();
    return this.state.customerUser;
  }

  registerCustomer(customerData) {
    const newCust = {
      id: 'CUST-' + Math.floor(1000 + Math.random() * 9000),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || '+91 98000 11111',
      avatar: customerData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      memberTier: 'Classic Member',
      savedCards: [],
      loyaltyPoints: 100
    };
    this.state.customerUser = newCust;
    this.setCurrentRole('customer');
    this.saveState();
    return newCust;
  }

  // --- Analytics & Reports Helper ---
  getPlatformStats() {
    const appointments = this.state.appointments;
    const isValidRevenue = status => status === 'completed' || status === 'accepted';

    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const validApts = appointments.filter(a => isValidRevenue(a.status));
    const totalRevenue = validApts.reduce((sum, a) => sum + (a.total || 0), 0);
    const totalBranches = this.state.branches.length;
    const activeBranches = this.getActiveBranches().length;
    const inactiveBranches = totalBranches - activeBranches;
    const totalServices = this.state.services.filter(s => s.active).length;
    const activeCoupons = this.state.coupons.filter(c => c.active).length;
    const totalCustomers = new Set(appointments.map(a => a.customerId || a.customerPhone || a.customerEmail)).size || 18;

    const branchBreakdown = this.state.branches.map(b => {
      const branchApts = appointments.filter(a => a.branchId === b.id);
      const rev = branchApts
        .filter(a => isValidRevenue(a.status))
        .reduce((sum, a) => sum + (a.total || 0), 0);
      const branchCusts = new Set(branchApts.map(a => a.customerId || a.customerPhone || a.customerEmail)).size;

      return {
        id: b.id,
        name: b.name,
        city: b.city,
        status: b.status,
        appointmentCount: branchApts.length,
        totalCustomers: branchCusts,
        revenue: rev,
        rating: b.rating
      };
    });

    return {
      totalRevenue,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalBranches,
      activeBranches,
      inactiveBranches,
      totalCustomers,
      totalServices,
      activeCoupons,
      branchBreakdown
    };
  }

  getServiceWiseRevenue(branchId = null) {
    let appointments = this.state.appointments;
    if (branchId) {
      appointments = appointments.filter(a => a.branchId === branchId);
    }

    const isValidRevenue = status => status === 'completed' || status === 'accepted';
    const validApts = appointments.filter(a => isValidRevenue(a.status));

    const serviceMap = {};

    // Seed map with all active services so every service is visible
    this.state.services.forEach(srv => {
      const cat = this.state.categories.find(c => c.id === srv.categoryId);
      serviceMap[srv.id] = {
        serviceId: srv.id,
        name: srv.name,
        categoryName: cat ? cat.name : 'General',
        unitPrice: srv.price,
        bookingCount: 0,
        totalRevenue: 0
      };
    });

    validApts.forEach(apt => {
      if (apt.serviceIds && Array.isArray(apt.serviceIds)) {
        const itemPrice = apt.serviceIds.length > 0 ? (apt.total || apt.subtotal || 0) / apt.serviceIds.length : 0;
        apt.serviceIds.forEach(srvId => {
          if (!serviceMap[srvId]) {
            const srv = this.state.services.find(s => s.id === srvId);
            const cat = srv ? this.state.categories.find(c => c.id === srv.categoryId) : null;
            serviceMap[srvId] = {
              serviceId: srvId,
              name: srv ? srv.name : srvId,
              categoryName: cat ? cat.name : 'General',
              unitPrice: srv ? srv.price : itemPrice,
              bookingCount: 0,
              totalRevenue: 0
            };
          }
          serviceMap[srvId].bookingCount += 1;
          serviceMap[srvId].totalRevenue += itemPrice;
        });
      }
    });

    const result = Object.values(serviceMap);
    result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return result;
  }

  getBranchStats(branchId) {
    const branch = this.getBranchById(branchId);
    if (!branch) return null;
    const branchApts = this.state.appointments.filter(a => a.branchId === branchId);

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.slice(0, 7);
    const isValidRevenue = status => status === 'completed' || status === 'confirmed' || status === 'accepted' || status === 'in-progress';

    const todayApts = branchApts.filter(a => a.date === todayStr);
    const upcomingApts = branchApts.filter(a => a.date >= todayStr && !['completed', 'cancelled', 'rejected'].includes(a.status));

    const uniqueCustomers = new Set(branchApts.map(a => a.customerId || a.customerPhone || a.customerEmail)).size;

    const todayRevenue = todayApts
      .filter(a => isValidRevenue(a.status))
      .reduce((sum, a) => sum + (a.total || 0), 0);

    const monthlyRevenue = branchApts
      .filter(a => (a.date && a.date.startsWith(currentMonthPrefix)) && isValidRevenue(a.status))
      .reduce((sum, a) => sum + (a.total || 0), 0);

    const totalRevenue = branchApts
      .filter(a => isValidRevenue(a.status))
      .reduce((sum, a) => sum + (a.total || 0), 0);

    return {
      branch,
      todayAppointments: todayApts.length,
      upcomingAppointments: upcomingApts.length,
      totalCustomers: uniqueCustomers,
      todayRevenue,
      monthlyRevenue,
      totalRevenue,
      totalAppointments: branchApts.length,
      chairs: branch.chairs,
      occupancyRate: Math.min(100, Math.round((todayApts.length / Math.max(1, branch.chairs * 4)) * 100))
    };
  }
}

// Global store instance
window.salonStore = new SalonStore();
