export type PackageType = 'domestic' | 'international';
export type PackageStatus = 'active' | 'inactive' | 'sold_out';

export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  meals: string;
  hotel: string;
}

export interface FlightDetails {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  baggage: string;
  seatsTotal: number;
  seatsAvailable: number;
}

export interface HolidayPackage {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  stateOrCountry: string;
  type: PackageType;
  duration: string;
  nights: number;
  days: number;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery?: string[];
  isFixedDeparture: boolean;
  departureDates: string[];
  departureCity: string;
  flightDetails?: FlightDetails;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: DayItinerary[];
  remainingSeats: number;
  status?: PackageStatus;
  badge?: string;
  featured?: boolean;
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  passportNumber?: string;
}

export interface BookingRecord {
  id: string;
  bookingRef: string;
  packageId: string;
  packageTitle: string;
  packageType: PackageType;
  destination: string;
  departureCity: string;
  departureDate: string;
  duration: string;
  passengers: Passenger[];
  passengerCount: {
    adults: number;
    children: number;
    infants: number;
  };
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  totalAmount: number;
  discountAmount: number;
  referralRewardUsed: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'EMI' | 'Wallet';
  paymentStatus: 'Success' | 'Pending' | 'Refunded';
  bookingStatus: 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';
  bookingDate: string;
  pnrNumber: string;
  hotelName: string;
  paymentType?: 'Full' | 'TokenDeposit';
  amountPaid?: number;
  balanceDue?: number;
  balanceDueDate?: string;
  selectedAddOns?: { id: string; title: string; price: number }[];
  gstInvoiceNumber?: string;
}

export interface ReferralRecord {
  id: string;
  friendName: string;
  friendPhone?: string;
  friendEmail?: string;
  date: string;
  packageBooked?: string;
  amountEarned: number;
  status: 'Credited' | 'Pending' | 'Hold' | 'Processing';
  hasFirstBooking: boolean;
  holdReason?: string;
  isIndirect?: boolean;
  referredLevel?: number; // 1 = Direct, 2 = Downline
  validityDays?: number; // Configured validity period (in days, 0 = Lifetime)
  expiryDate?: string;   // Formatted calculated expiry date
  daysRemaining?: number; // Days remaining for pending bonuses
  extendedDays?: number; // Any bonus grace period extensions granted by admin
}

export interface ReferralSettings {
  referrerReward: number; // e.g. 1500
  refereeReward: number;  // e.g. 500
  partnerRequiredDirectBookings: number; // default 10 (editable in admin)
  partnerIndirectReferralBonus: number; // default 100 (editable in admin)
  agentRequiredDownlinePartners: number; // default 1 (editable in admin)
  agentNetworkBonus: number; // default 250 (editable in admin)
  holdUntilFirstBooking: boolean; // default true
  securityAdminPin?: string; // default '1234'
  maxWalletAdjustmentLimit?: number; // default 25000
  referralBonusValidityDays?: number; // default 90 days (0 = Lifetime / No Expiry)
  bonusExpiryNotificationDays?: number; // default 7 days before expiry
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'wallet' | 'user' | 'package' | 'settings' | 'security' | 'partner';
  details: string;
  adminUser: string;
  performedBy?: string;
  ipAddress?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  walletBalance: number;
  holdBalance: number;
  totalReferrals: number;
  totalEarnings: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  isPartner?: boolean;
  partnerUpgradeDate?: string;
  completedDirectReferralBookings?: number;
  isAgent?: boolean;
  agentUpgradeDate?: string;
  downlinePartnersCount?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'referral' | 'departure_alert' | 'flight_alert' | 'discount' | 'admin' | 'system' | 'price_alert';
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  date: string;
  adminNote?: string;
  status?: 'completed' | 'hold' | 'released';
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin' | 'agent' | 'partner';
  status: 'active' | 'suspended' | 'pending_kyc';
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  walletBalance: number;
  holdBalance?: number;
  referralCode: string;
  referredBy?: string; // parent referralCode or ID
  totalBookings: number;
  totalSpent: number;
  joinedDate: string;
  lastActive: string;
  city?: string;
  transactions?: WalletTransaction[];
  isPartner?: boolean;
  partnerUpgradeDate?: string;
  directReferralsBookedCount?: number;
  isAgent?: boolean;
  agentUpgradeDate?: string;
  downlinePartnersCount?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'agent';
  text: string;
  timestamp: string;
}
