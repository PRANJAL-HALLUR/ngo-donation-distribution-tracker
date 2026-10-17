import { NGO } from '@/context/NGOContext';
import { Donation, Distribution } from '@/context/DonationContext';

export interface Campaign {
  id: string;
  ngoId: string;
  title: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  beneficiariesTarget: number;
  beneficiariesReached: number;
  endDate: string;
  status: 'active' | 'completed';
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  category: 'verification' | 'financial' | 'security' | 'distribution';
  status: 'success' | 'warning' | 'alert';
  details: string;
}

export const SEED_NGOS_EXTENDED: NGO[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'seed-1',
    name: 'Care & Hope Foundation',
    description: 'Providing nutritional meals, healthcare kits, and shelter support to underprivileged children and families across urban communities.',
    mission: 'Eliminating hunger and empowering the next generation through health and education.',
    registration_id: 'REG-100234',
    contact_email: 'contact@careandhope.org',
    phone_number: '+91 9876543210',
    category: 'Food & Healthcare',
    address: '12 Marine Drive, Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.9256,
    longitude: 72.8242,
    verification_document_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60',
    status: 'approved',
    total_received: 65500,
    image: '🍲'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: 'seed-2',
    name: 'BrightFuture Literacy Initiative',
    description: 'Distributing textbooks, setting up solar-powered computer labs, and sponsoring tuition for rural primary schools.',
    mission: 'Bridging the digital and educational divide for rural children.',
    registration_id: 'REG-200543',
    contact_email: 'info@brightfuture.org',
    phone_number: '+91 9876543211',
    category: 'Education',
    address: '45 Tech Park, Electronic City Phase 1',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.8452,
    longitude: 77.6602,
    verification_document_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=60',
    status: 'approved',
    total_received: 92000,
    image: '📚'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: 'seed-3',
    name: 'GreenEarth Disaster Relief',
    description: 'Rapid response units providing clean drinking water filtration systems, emergency blankets, and medical aid during emergencies.',
    mission: 'Delivering swift, verified humanitarian relief where disaster strikes.',
    registration_id: 'REG-300876',
    contact_email: 'relief@greenearth.org',
    phone_number: '+91 9876543212',
    category: 'Disaster Relief',
    address: '8 Coastal Way, Fort Kochi',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    latitude: 9.9658,
    longitude: 76.2427,
    verification_document_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=60',
    status: 'approved',
    total_received: 135000,
    image: '🌍'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    user_id: 'seed-4',
    name: 'Pratham Child Education Mission',
    description: 'Providing foundational literacy programs, school libraries, and digital tablets for marginalized youth in Delhi NCR.',
    mission: 'Every child in school and learning well through community-driven pedagogy.',
    registration_id: 'REG-400192',
    contact_email: 'delhi@prathammis.org',
    phone_number: '+91 9876543213',
    category: 'Education',
    address: 'B-14 Barakhamba Road, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6292,
    longitude: 77.2274,
    verification_document_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=60',
    status: 'approved',
    total_received: 48500,
    image: '🎒'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    user_id: 'seed-5',
    name: 'Swasthya Care & Rural Health',
    description: 'Mobile medical vans, free diabetic screening camps, and essential medicine distribution across rural Telangana.',
    mission: 'Ensuring accessible quality healthcare reaches the last mile.',
    registration_id: 'REG-500331',
    contact_email: 'support@swasthyacare.org',
    phone_number: '+91 9876543214',
    category: 'Healthcare',
    address: 'Plot 22, HITEC City Main Rd, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.4474,
    longitude: 78.3762,
    verification_document_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
    status: 'approved',
    total_received: 72000,
    image: '🏥'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    user_id: 'seed-6',
    name: 'Sundarbans Forest & Wildlife Shield',
    description: 'Mangrove reforestation, solar fencing against tiger conflicts, and clean energy cookstoves for forest communities.',
    mission: 'Protecting endangered coastal biospheres while empowering local villagers.',
    registration_id: 'REG-600745',
    contact_email: 'eco@sundarbanshield.org',
    phone_number: '+91 9876543215',
    category: 'Environment',
    address: '15 Park Street, Near Queen Mansion',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    latitude: 22.5535,
    longitude: 88.3518,
    verification_document_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
    status: 'approved',
    total_received: 39000,
    image: '🌱'
  },
  // Pending NGOs for Verification Queue Demo
  {
    id: '77777777-7777-7777-7777-777777777777',
    user_id: 'seed-7',
    name: 'Aarogya Seva Mobile Clinics',
    description: 'Providing door-to-door diagnostic care, maternal health kits, and emergency oxygen concentrators across rural tribal settlements.',
    mission: 'Decentralized rural healthcare access with GPS-verified clinical dispatches.',
    registration_id: 'REG-789012',
    contact_email: 'applications@aarogyaseva.org',
    phone_number: '+91 9876543216',
    category: 'Healthcare',
    address: 'Near Old Bus Stand, Gadchiroli',
    city: 'Gadchiroli',
    state: 'Maharashtra',
    country: 'India',
    latitude: 20.1809,
    longitude: 79.9982,
    verification_document_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60',
    status: 'pending',
    total_received: 0,
    image: '🚑'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    user_id: 'seed-8',
    name: 'Kalyan Deep Elder Care Trust',
    description: 'Holistic residential shelter, daily warm meals, and geriatric physiotherapy for abandoned senior citizens in Pune.',
    mission: 'Dignity and compassionate care for vulnerable senior citizens.',
    registration_id: 'REG-890123',
    contact_email: 'care@kalyandeep.org',
    phone_number: '+91 9876543217',
    category: 'Elderly Support',
    address: 'Plot 18, Deccan Gymkhana',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.5167,
    longitude: 73.8415,
    verification_document_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=60',
    status: 'pending',
    total_received: 0,
    image: '👴'
  }
];

export const SEED_DONATIONS: (Donation & { donor_name?: string; ngo_name?: string; is_flagged?: boolean; flag_reason?: string })[] = [
  {
    id: 'don_101',
    donor_id: 'usr_donor_1',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donor_name: 'Ananya Sharma',
    ngo_name: 'Care & Hope Foundation',
    amount: 25000,
    currency: 'INR',
    status: 'completed', // Ready for NGO to distribute!
    type: 'Healthcare Kits',
    created_at: '2026-10-15T09:30:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_102',
    donor_id: 'usr_donor_2',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donor_name: 'Vikram Mehta',
    ngo_name: 'Care & Hope Foundation',
    amount: 15000,
    currency: 'INR',
    status: 'distributed', // Distributed with proof
    type: 'Nutrition & Midday Meals',
    created_at: '2026-10-12T14:20:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_103',
    donor_id: 'usr_donor_3',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donor_name: 'Dr. Ramesh Gupta',
    ngo_name: 'Care & Hope Foundation',
    amount: 8500,
    currency: 'INR',
    status: 'verified', // 100% verified by platform admin!
    type: 'Dry Ration Packs',
    created_at: '2026-10-08T11:15:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_104',
    donor_id: 'usr_donor_4',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donor_name: 'Pooja Venkatesh',
    ngo_name: 'Care & Hope Foundation',
    amount: 5000,
    currency: 'INR',
    status: 'completed', // Available for NGO distribution
    type: 'Winter Warm Clothing',
    created_at: '2026-10-16T16:45:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_105',
    donor_id: 'usr_donor_5',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donor_name: 'Apex Global Foundation',
    ngo_name: 'Care & Hope Foundation',
    amount: 75000,
    currency: 'INR',
    status: 'completed',
    type: 'Emergency Medical Supply',
    created_at: '2026-10-14T18:10:00.000Z',
    is_flagged: true,
    flag_reason: 'High-value single transfer (> ₹50,000 threshold) awaiting compliance sign-off'
  },
  {
    id: 'don_106',
    donor_id: 'usr_donor_6',
    ngo_id: '22222222-2222-2222-2222-222222222222',
    donor_name: 'Kavita Chawla',
    ngo_name: 'BrightFuture Literacy Initiative',
    amount: 35000,
    currency: 'INR',
    status: 'verified',
    type: 'Digital Classrooms',
    created_at: '2026-10-05T10:00:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_107',
    donor_id: 'usr_donor_7',
    ngo_id: '33333333-3333-3333-3333-333333333333',
    donor_name: 'Sunil Nair',
    ngo_name: 'GreenEarth Disaster Relief',
    amount: 48000,
    currency: 'INR',
    status: 'verified',
    type: 'Clean Drinking Water',
    created_at: '2026-09-28T12:30:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_108',
    donor_id: 'usr_donor_8',
    ngo_id: '55555555-5555-5555-5555-555555555555',
    donor_name: 'Meenakshi Sundaram',
    ngo_name: 'Swasthya Care & Rural Health',
    amount: 22000,
    currency: 'INR',
    status: 'distributed',
    type: 'Mobile Diagnostics',
    created_at: '2026-10-11T08:45:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_109',
    donor_id: 'usr_donor_9',
    ngo_id: '44444444-4444-4444-4444-444444444444',
    donor_name: 'Rajesh Malhotra',
    ngo_name: 'Pratham Child Education Mission',
    amount: 18000,
    currency: 'INR',
    status: 'verified',
    type: 'Primary School Libraries',
    created_at: '2026-09-19T14:10:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_110',
    donor_id: 'usr_donor_10',
    ngo_id: '66666666-6666-6666-6666-666666666666',
    donor_name: 'Arjun Sen',
    ngo_name: 'Sundarbans Forest & Wildlife Shield',
    amount: 16500,
    currency: 'INR',
    status: 'verified',
    type: 'Mangrove Restoration',
    created_at: '2026-09-14T11:00:00.000Z',
    is_flagged: false
  },
  {
    id: 'don_111',
    donor_id: 'usr_donor_11',
    ngo_id: '33333333-3333-3333-3333-333333333333',
    donor_name: 'Anonymous Donor',
    ngo_name: 'GreenEarth Disaster Relief',
    amount: 60000,
    currency: 'INR',
    status: 'completed',
    type: 'Emergency Tents & Blankets',
    created_at: '2026-10-13T19:22:00.000Z',
    is_flagged: true,
    flag_reason: 'High-value transfer with unverified offshore card origin'
  },
  {
    id: 'don_112',
    donor_id: 'usr_donor_1',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donor_name: 'Ananya Sharma',
    ngo_name: 'Care & Hope Foundation',
    amount: 12000,
    currency: 'INR',
    status: 'distributed', // Ready for Admin Proof verification!
    type: 'Elderly Medicine Subsidies',
    created_at: '2026-10-10T15:30:00.000Z',
    is_flagged: false
  }
];

export const SEED_DISTRIBUTIONS: (Distribution & {
  ngo_name?: string;
  location?: string;
  beneficiary_count?: number;
  latitude?: number;
  longitude?: number;
  proof_type?: string;
})[] = [
  {
    id: 'dist_201',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donation_id: 'don_102',
    ngo_name: 'Care & Hope Foundation',
    beneficiary_name: 'Sneha Sadan Orphanage & Child Care, Andheri East',
    amount_spent: 15000,
    proof_image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60',
    notes: 'Distributed 120 fortified protein meal kits and fresh fruit supplies for residing children. Receipts attached.',
    status: 'verified',
    distributed_at: '2026-10-13T11:00:00.000Z',
    location: 'Mumbai, Maharashtra',
    beneficiary_count: 120,
    latitude: 19.1136,
    longitude: 72.8697,
    proof_type: 'On-site Photo & Signed Store Invoice'
  },
  {
    id: 'dist_202',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donation_id: 'don_103',
    ngo_name: 'Care & Hope Foundation',
    beneficiary_name: 'Dharavi Slum Community Ward 7 Families',
    amount_spent: 8500,
    proof_image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60',
    notes: 'Provided dry ration packets (wheat flour, lentils, cooking oil, salt) to 85 families impacted by monsoon inundation.',
    status: 'verified',
    distributed_at: '2026-10-09T16:30:00.000Z',
    location: 'Mumbai, Maharashtra',
    beneficiary_count: 340,
    latitude: 19.0402,
    longitude: 72.8509,
    proof_type: 'Geotagged Field Photo & Roster'
  },
  {
    id: 'dist_203',
    ngo_id: '11111111-1111-1111-1111-111111111111',
    donation_id: 'don_112',
    ngo_name: 'Care & Hope Foundation',
    beneficiary_name: 'Kasturba Municipal Hospital Geriatric Ward',
    amount_spent: 12000,
    proof_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    notes: 'Supplied essential cardiac and hypertension medications for 45 destitute senior patients undergoing outpatient treatment.',
    status: 'distributed', // Pending admin verification!
    distributed_at: '2026-10-11T13:45:00.000Z',
    location: 'Mumbai, Maharashtra',
    beneficiary_count: 45,
    latitude: 18.9863,
    longitude: 72.8315,
    proof_type: 'Hospital Pharmacist Receipt & Voucher'
  },
  {
    id: 'dist_204',
    ngo_id: '22222222-2222-2222-2222-222222222222',
    donation_id: 'don_106',
    ngo_name: 'BrightFuture Literacy Initiative',
    beneficiary_name: 'Govt Higher Primary School, Nelamangala',
    amount_spent: 35000,
    proof_image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60',
    notes: 'Installed 12 interactive learning tablets and solar battery backups in Grade 4-7 classroom.',
    status: 'verified',
    distributed_at: '2026-10-07T10:15:00.000Z',
    location: 'Bangalore Rural, Karnataka',
    beneficiary_count: 180,
    latitude: 13.0988,
    longitude: 77.3888,
    proof_type: 'Headmaster Handover Letter & Photo'
  },
  {
    id: 'dist_205',
    ngo_id: '33333333-3333-3333-3333-333333333333',
    donation_id: 'don_107',
    ngo_name: 'GreenEarth Disaster Relief',
    beneficiary_name: 'Wayanad Landslide Relief Camp #4',
    amount_spent: 48000,
    proof_image_url: 'https://images.unsplash.com/photo-1541976590-713941681591?w=800&auto=format&fit=crop&q=60',
    notes: 'Dispatched 4 portable ultra-filtration water tanks delivering 2,000L clean drinking water daily to 500 displaced residents.',
    status: 'verified',
    distributed_at: '2026-09-30T14:00:00.000Z',
    location: 'Wayanad, Kerala',
    beneficiary_count: 500,
    latitude: 11.6854,
    longitude: 76.1320,
    proof_type: 'Disaster Cell Receipt & GPS Timestamp'
  },
  {
    id: 'dist_206',
    ngo_id: '55555555-5555-5555-5555-555555555555',
    donation_id: 'don_108',
    ngo_name: 'Swasthya Care & Rural Health',
    beneficiary_name: 'Mahabubnagar Tribal Community Health Center',
    amount_spent: 22000,
    proof_image_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=60',
    notes: 'Conducted comprehensive diabetic and anemia screening for 320 rural women and distributed 3 months supply of iron-folate.',
    status: 'distributed', // Pending admin verification!
    distributed_at: '2026-10-12T09:30:00.000Z',
    location: 'Mahabubnagar, Telangana',
    beneficiary_count: 320,
    latitude: 16.7488,
    longitude: 78.0035,
    proof_type: 'Village Sarpanch Attested Report'
  }
];

export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_1',
    ngoId: '11111111-1111-1111-1111-111111111111',
    title: 'Mission Poshan: 1,000 Child Hot Meals',
    category: 'Food & Nutrition',
    targetAmount: 50000,
    raisedAmount: 42500,
    beneficiariesTarget: 1000,
    beneficiariesReached: 850,
    endDate: '2026-11-15',
    status: 'active',
    description: 'Providing freshly cooked, balanced lunch trays packed with pulses, vegetables, and milk for slum school children.'
  },
  {
    id: 'camp_2',
    ngoId: '11111111-1111-1111-1111-111111111111',
    title: 'Winter Warmth & Hygiene Shield',
    category: 'Healthcare & Welfare',
    targetAmount: 35000,
    raisedAmount: 23000,
    beneficiariesTarget: 500,
    beneficiariesReached: 320,
    endDate: '2026-12-01',
    status: 'active',
    description: 'Thermal blankets, woolen caps, antiseptic wash, and respiratory supplements for pavement dwellers ahead of winter.'
  },
  {
    id: 'camp_3',
    ngoId: '11111111-1111-1111-1111-111111111111',
    title: 'Emergency Flood Relief Kitchen',
    category: 'Emergency Aid',
    targetAmount: 60000,
    raisedAmount: 60000,
    beneficiariesTarget: 1200,
    beneficiariesReached: 1200,
    endDate: '2026-09-30',
    status: 'completed',
    description: 'Round-the-clock hot khichdi and bottled mineral water distribution during seasonal Mumbai low-lying inundation.'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-10-16 15:42',
    actor: 'admin@fundhub.com',
    role: 'App Admin',
    action: 'Approved NGO Credential',
    category: 'verification',
    status: 'success',
    details: 'Verified 80G tax exemption and DARPAN registration for Sundarbans Shield.'
  },
  {
    id: 'log_2',
    timestamp: '2026-10-15 11:20',
    actor: 'System Sentinel',
    role: 'Automated Fraud Engine',
    action: 'Flagged High-Value Transaction',
    category: 'security',
    status: 'alert',
    details: 'Donation #don_105 (₹75,000) flagged for mandatory compliance review.'
  },
  {
    id: 'log_3',
    timestamp: '2026-10-14 17:05',
    actor: 'admin@fundhub.com',
    role: 'App Admin',
    action: 'Verified Distribution Proof',
    category: 'distribution',
    status: 'success',
    details: 'Validated geo-tagged proof for 120 child meal kits by Care & Hope Foundation.'
  },
  {
    id: 'log_4',
    timestamp: '2026-10-13 14:15',
    actor: 'ngo@careandhope.org',
    role: 'NGO Admin',
    action: 'Submitted Distribution Proof',
    category: 'distribution',
    status: 'warning',
    details: 'Submitted proof for Kasturba Municipal Hospital geriatric medicines (₹12,000).'
  },
  {
    id: 'log_5',
    timestamp: '2026-10-12 09:30',
    actor: 'Razorpay Gateway',
    role: 'Payment Webhook',
    action: 'Settlement Completed',
    category: 'financial',
    status: 'success',
    details: 'Batched payout settlement for ₹92,000 to BrightFuture Literacy escrow.'
  }
];

export const MONTHLY_ANALYTICS_DATA = [
  { month: 'May', donations: 145000, distributions: 120000, beneficiaries: 850, activeNgos: 4 },
  { month: 'Jun', donations: 190000, distributions: 165000, beneficiaries: 1200, activeNgos: 4 },
  { month: 'Jul', donations: 240000, distributions: 210000, beneficiaries: 1750, activeNgos: 5 },
  { month: 'Aug', donations: 310000, distributions: 275000, beneficiaries: 2400, activeNgos: 5 },
  { month: 'Sep', donations: 385000, distributions: 340000, beneficiaries: 3200, activeNgos: 6 },
  { month: 'Oct', donations: 465000, distributions: 410000, beneficiaries: 4150, activeNgos: 6 }
];
