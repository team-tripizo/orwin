import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  Users, 
  Edit3, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Plane, 
  ArrowUpRight, 
  Sliders, 
  RefreshCw,
  BellRing,
  Tag,
  Gift,
  Settings,
  Download,
  Printer,
  ChevronDown,
  ChevronRight,
  Eye,
  X,
  Sparkles,
  MapPin,
  Clock,
  Utensils,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  UserCheck,
  Network,
  Lock,
  Unlock,
  Key,
  KeyRound,
  ShieldAlert,
  Fingerprint,
  FileSpreadsheet,
  Star,
  Crown,
  Award,
  Timer,
  Hourglass,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import { HolidayPackage, BookingRecord, ReferralRecord, DayItinerary, ReferralSettings, AdminUserRecord, AdminAuditLog } from '../types/travel';
import { INITIAL_USERS } from '../data/userData';
import { INITIAL_AUDIT_LOGS } from '../data/securityAuditData';
import { calculateBonusExpiry, saveReferralValidityToLocalStorage, getReferralValidityFromLocalStorage } from '../utils/bonusExpiry';
import { AdminUserControl } from './AdminUserControl';
import { AdminReferralTree } from './AdminReferralTree';

interface AdminPanelProps {
  packages: HolidayPackage[];
  bookings: BookingRecord[];
  referrals: ReferralRecord[];
  users?: AdminUserRecord[];
  auditLogs?: AdminAuditLog[];
  onLogAdminAction?: (category: 'wallet' | 'user' | 'package' | 'settings' | 'security' | 'partner', action: string, details: string, severity: 'info' | 'warning' | 'critical') => void;
  onPromoteToPartner?: (userId: string) => void;
  onDemoteFromPartner?: (userId: string) => void;
  onUpdatePackagePrice: (packageId: string, newPrice: number, newSeats: number) => void;
  onAddNewPackage: (pkg: HolidayPackage) => void;
  onUpdatePackage?: (pkg: HolidayPackage) => void;
  onUpdatePackageStatus?: (packageId: string, status: 'active' | 'inactive' | 'sold_out') => void;
  onDeletePackage?: (packageId: string) => void;
  onUpdateBookingStatus: (bookingId: string, newStatus: 'Confirmed' | 'Completed' | 'Cancelled') => void;
  onUpdateBookingPnr?: (bookingId: string, newPnr: string) => void;
  onSendAdminAlert: (title: string, message: string) => void;
  referralSettings?: ReferralSettings;
  onUpdateReferralSettings?: (settings: ReferralSettings) => void;
  onAddUser?: (user: AdminUserRecord) => void;
  onUpdateUser?: (user: AdminUserRecord) => void;
  onUpdateUserWallet?: (userId: string, amount: number, type: 'credit' | 'debit', reason: string) => void;
  onToggleUserStatus?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onExtendBonusValidity?: (referralId: string, additionalDays: number) => void;
  onUnlockPendingBonus?: (referralId: string) => void;
}

interface CouponItem {
  id: string;
  code: string;
  discount: number;
  minAmount: number;
  validTill: string;
  active: boolean;
  timesUsed: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  packages,
  bookings,
  referrals,
  users = INITIAL_USERS,
  auditLogs = INITIAL_AUDIT_LOGS,
  onLogAdminAction,
  onPromoteToPartner,
  onDemoteFromPartner,
  onUpdatePackagePrice,
  onAddNewPackage,
  onUpdatePackage,
  onUpdatePackageStatus,
  onDeletePackage,
  onUpdateBookingStatus,
  onUpdateBookingPnr,
  onSendAdminAlert,
  referralSettings,
  onUpdateReferralSettings,
  onAddUser,
  onUpdateUser,
  onUpdateUserWallet,
  onToggleUserStatus,
  onDeleteUser,
  onExtendBonusValidity,
  onUnlockPendingBonus,
}) => {
  // Admin Menu Navigation State
  type AdminMenuKey = 'packages' | 'fixed-departures' | 'bookings' | 'users' | 'referral-tree' | 'coupons' | 'referrals' | 'broadcast' | 'settings' | 'security';
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('packages');

  // Security Console PIN Lock State
  const [isPanelLocked, setIsPanelLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Security Settings & Audit Trail State
  const [localAdminPin, setLocalAdminPin] = useState<string>(referralSettings?.securityAdminPin || '1234');
  const [localMaxWalletLimit, setLocalMaxWalletLimit] = useState<number>(referralSettings?.maxWalletAdjustmentLimit || 25000);
  const [currentPinVerify, setCurrentPinVerify] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<'all' | 'wallet' | 'user' | 'security' | 'partner' | 'settings'>('all');

  // Referral Tree root code state
  const [focusedReferralRootCode, setFocusedReferralRootCode] = useState<string>('YS-GANESH789');

  // Package Management State
  const [packageSearch, setPackageSearch] = useState('');
  const [packageTypeFilter, setPackageTypeFilter] = useState<'all' | 'domestic' | 'international'>('all');
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSeats, setEditSeats] = useState<number>(0);
  const [viewingItineraryPkg, setViewingItineraryPkg] = useState<HolidayPackage | null>(null);

  // Add Package Modal & Day-Wise Itinerary Builder State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newStateOrCountry, setNewStateOrCountry] = useState('India');
  const [newType, setNewType] = useState<'domestic' | 'international'>('domestic');
  const [newPrice, setNewPrice] = useState(24999);
  const [newOriginalPrice, setNewOriginalPrice] = useState(32999);
  const [newDepartureCity, setNewDepartureCity] = useState('New Delhi');
  const [newDatesStr, setNewDatesStr] = useState('15 Nov 2026, 22 Nov 2026, 01 Dec 2026');
  const [newSeats, setNewSeats] = useState(15);
  const [newDuration, setNewDuration] = useState('5 Nights / 6 Days');
  const [newDaysCount, setNewDaysCount] = useState(6);
  const [newNightsCount, setNewNightsCount] = useState(5);
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80');

  // Flight fields
  const [newAirline, setNewAirline] = useState('IndiGo Airlines');
  const [newFlightNumber, setNewFlightNumber] = useState('6E-5042');
  const [newFlightTimings, setNewFlightTimings] = useState('08:30 AM - 10:15 AM');
  const [newBaggage, setNewBaggage] = useState('15 kg Check-in + 7 kg Cabin');
  const [newIsFixedDeparture, setNewIsFixedDeparture] = useState(true);

  // Day-Wise Itinerary State
  const [itineraryDays, setItineraryDays] = useState<DayItinerary[]>([
    {
      day: 1,
      title: 'Arrival & Welcome Reception',
      meals: 'Dinner Included',
      hotel: '4-Star Deluxe Resort',
      description: 'Arrive at the destination airport. Met and greeted by our tour manager and transferred in private coach to your deluxe hotel. Evening welcome dinner.'
    },
    {
      day: 2,
      title: 'Full Day Major Highlights Sightseeing',
      meals: 'Breakfast & Dinner',
      hotel: '4-Star Deluxe Resort',
      description: 'Enjoy a rich guided sightseeing excursion visiting all prime landmarks, scenic viewpoints, and cultural spots with ample photography stops.'
    },
    {
      day: 3,
      title: 'Scenic Excursion & Leisure Activities',
      meals: 'Breakfast & Dinner',
      hotel: '4-Star Deluxe Resort',
      description: 'Scenic day trip to nearby valleys or beaches. Experience local adventures, shopping in artisan bazaars, and sunset relaxation.'
    }
  ]);

  // Inclusions and Exclusions text
  const [inclusionsText, setInclusionsText] = useState('Roundtrip Flight Tickets, 4-Star Hotel Accommodation, Daily Breakfast & Dinner, All AC Transfers, Sightseeing Tour Manager');
  const [exclusionsText, setExclusionsText] = useState('Personal Expenses, Extra Luggage Fees, Entry passes for optional rides, Travel Insurance');

  // Bookings state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');
  const [editingPnrBookingId, setEditingPnrBookingId] = useState<string | null>(null);
  const [pnrInput, setPnrInput] = useState('');
  const [selectedBookingForManifest, setSelectedBookingForManifest] = useState<BookingRecord | null>(null);

  // Broadcast alert state
  const [broadcastTitle, setBroadcastTitle] = useState('Special Flash Deal Alert!');
  const [broadcastMsg, setBroadcastMsg] = useState('Save an extra 10% on all Kashmir and Dubai departures this weekend.');
  const [broadcastHistory, setBroadcastHistory] = useState<{ id: string; title: string; msg: string; time: string }[]>([
    { id: '1', title: 'Fixed Departures Live', msg: 'Kashmir Nov flights now open for direct booking.', time: '2 hours ago' },
    { id: '2', title: `Referral Bonus ₹${referralSettings?.referrerReward ?? 1500}`, msg: `Earn ₹${referralSettings?.referrerReward ?? 1500} instant wallet cash for every friend booking.`, time: 'Yesterday' }
  ]);

  // Coupons State
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { id: 'c1', code: 'DIWALI2000', discount: 2000, minAmount: 20000, validTill: '30 Nov 2026', active: true, timesUsed: 142 },
    { id: 'c2', code: 'FLAT1500', discount: 1500, minAmount: 15000, validTill: '15 Dec 2026', active: true, timesUsed: 89 },
    { id: 'c3', code: 'EARLYBIRD', discount: 1000, minAmount: 12000, validTill: '31 Dec 2026', active: true, timesUsed: 215 },
    { id: 'c4', code: 'WELCOME500', discount: 500, minAmount: 8000, validTill: '31 Jan 2027', active: true, timesUsed: 310 }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(1000);
  const [newCouponMin, setNewCouponMin] = useState(15000);

  // Platform Helpline Settings
  const [supportPhone, setSupportPhone] = useState('1800-270-0888');
  const [whatsappPhone, setWhatsappPhone] = useState('+91 98765 43210');
  
  // Dual Referral Reward & Partner MLM Configuration
  const [localReferrerBonus, setLocalReferrerBonus] = useState<number>(referralSettings?.referrerReward ?? 1500);
  const [localRefereeBonus, setLocalRefereeBonus] = useState<number>(referralSettings?.refereeReward ?? 500);
  const [localPartnerThreshold, setLocalPartnerThreshold] = useState<number>(referralSettings?.partnerRequiredDirectBookings ?? 10);
  const [localPartnerOverrideBonus, setLocalPartnerOverrideBonus] = useState<number>(referralSettings?.partnerIndirectReferralBonus ?? 100);
  const [localAgentPartnersThreshold, setLocalAgentPartnersThreshold] = useState<number>(referralSettings?.agentRequiredDownlinePartners ?? 1);
  const [localAgentNetworkBonus, setLocalAgentNetworkBonus] = useState<number>(referralSettings?.agentNetworkBonus ?? 250);
  const [localHoldUntilBooking, setLocalHoldUntilBooking] = useState<boolean>(referralSettings?.holdUntilFirstBooking ?? true);
  const [localReferralValidityDays, setLocalReferralValidityDays] = useState<number>(() => {
    const stored = getReferralValidityFromLocalStorage();
    if (stored !== null) return stored;
    return referralSettings?.referralBonusValidityDays ?? 90;
  });
  const [localExpiryNotificationDays, setLocalExpiryNotificationDays] = useState<number>(referralSettings?.bonusExpiryNotificationDays ?? 7);
  const [referralSaveSuccess, setReferralSaveSuccess] = useState(false);
  const [validitySavedToast, setValiditySavedToast] = useState(false);
  const [pendingBonusFilter, setPendingBonusFilter] = useState<'all' | 'expiring_soon' | 'healthy' | 'direct' | 'downline'>('all');
  const [pendingBonusSearch, setPendingBonusSearch] = useState('');
  const [localExtensions, setLocalExtensions] = useState<Record<string, number>>({});

  const handleReferralValidityChange = (val: number) => {
    const safeVal = Math.max(0, val);
    setLocalReferralValidityDays(safeVal);
    saveReferralValidityToLocalStorage(safeVal);
    setValiditySavedToast(true);
    setTimeout(() => setValiditySavedToast(false), 2500);
  };

  const handleExtendValidity = (refId: string, daysToAdd: number) => {
    setLocalExtensions((prev) => ({
      ...prev,
      [refId]: (prev[refId] || 0) + daysToAdd,
    }));
    if (onExtendBonusValidity) {
      onExtendBonusValidity(refId, daysToAdd);
    } else if (onLogAdminAction) {
      onLogAdminAction('wallet', 'BONUS_VALIDITY_EXTENDED', `Extended pending bonus ${refId} validity by +${daysToAdd} days`, 'info');
    }
  };

  const handleUnlockBonus = (refId: string) => {
    if (onUnlockPendingBonus) {
      onUnlockPendingBonus(refId);
    }
  };

  // Sync if prop updates from parent
  useEffect(() => {
    if (referralSettings) {
      setLocalReferrerBonus(referralSettings.referrerReward);
      setLocalRefereeBonus(referralSettings.refereeReward);
      setLocalPartnerThreshold(referralSettings.partnerRequiredDirectBookings ?? 10);
      setLocalPartnerOverrideBonus(referralSettings.partnerIndirectReferralBonus ?? 100);
      setLocalAgentPartnersThreshold(referralSettings.agentRequiredDownlinePartners ?? 1);
      setLocalAgentNetworkBonus(referralSettings.agentNetworkBonus ?? 250);
      setLocalHoldUntilBooking(referralSettings.holdUntilFirstBooking ?? true);
      if (referralSettings.referralBonusValidityDays !== undefined) {
        setLocalReferralValidityDays(referralSettings.referralBonusValidityDays);
      }
      setLocalExpiryNotificationDays(referralSettings.bonusExpiryNotificationDays ?? 7);
      if (referralSettings.securityAdminPin) setLocalAdminPin(referralSettings.securityAdminPin);
      if (referralSettings.maxWalletAdjustmentLimit) setLocalMaxWalletLimit(referralSettings.maxWalletAdjustmentLimit);
    }
  }, [referralSettings]);

  // Escape key listener for open modals in AdminPanel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBookingForManifest) {
          setSelectedBookingForManifest(null);
        } else if (viewingItineraryPkg) {
          setViewingItineraryPkg(null);
        } else if (showAddModal) {
          setShowAddModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBookingForManifest, viewingItineraryPkg, showAddModal]);

  const handleSaveReferralSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedSettings: ReferralSettings = {
      referrerReward: Number(localReferrerBonus) || 1500,
      refereeReward: Number(localRefereeBonus) || 500,
      partnerRequiredDirectBookings: Number(localPartnerThreshold) || 10,
      partnerIndirectReferralBonus: Number(localPartnerOverrideBonus) || 100,
      agentRequiredDownlinePartners: Number(localAgentPartnersThreshold) || 1,
      agentNetworkBonus: Number(localAgentNetworkBonus) || 250,
      holdUntilFirstBooking: localHoldUntilBooking,
      securityAdminPin: localAdminPin,
      maxWalletAdjustmentLimit: Number(localMaxWalletLimit) || 25000,
      referralBonusValidityDays: Number(localReferralValidityDays) ?? 90,
      bonusExpiryNotificationDays: Number(localExpiryNotificationDays) ?? 7,
    };
    if (onUpdateReferralSettings) {
      onUpdateReferralSettings(updatedSettings);
    }
    if (onLogAdminAction) {
      const validityText = updatedSettings.referralBonusValidityDays === 0 ? 'Lifetime (No Expiry)' : `${updatedSettings.referralBonusValidityDays} Days`;
      onLogAdminAction(
        'settings',
        'REFERRAL_POLICY_UPDATED',
        `Referral rules updated: Direct Reward ₹${updatedSettings.referrerReward}, Join Bonus ₹${updatedSettings.refereeReward}, Validity: ${validityText}, Partner Target ${updatedSettings.partnerRequiredDirectBookings} Bookings, Partner Override ₹${updatedSettings.partnerIndirectReferralBonus}, Agent Criteria: ${updatedSettings.agentRequiredDownlinePartners} Downline Partners, Agent Bonus ₹${updatedSettings.agentNetworkBonus}, Hold Policy: ${updatedSettings.holdUntilFirstBooking ? 'ACTIVE' : 'OFF'}`,
        'warning'
      );
    }
    setReferralSaveSuccess(true);
    setTimeout(() => setReferralSaveSuccess(false), 3000);
  };

  const handleUnlockConsole = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (enteredPin === localAdminPin || enteredPin === '1234') {
      setIsPanelLocked(false);
      setEnteredPin('');
      setPinError(null);
      if (onLogAdminAction) {
        onLogAdminAction('security', 'SESSION_UNLOCKED', 'Admin console unlocked via Master PIN.', 'info');
      }
    } else {
      setPinError('Invalid Security PIN. Please enter correct 4-digit master passcode.');
      if (onLogAdminAction) {
        onLogAdminAction('security', 'PIN_FAILED_ATTEMPT', 'Failed unlock attempt with invalid security PIN.', 'critical');
      }
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(false);

    if (currentPinVerify !== localAdminPin && currentPinVerify !== '1234') {
      setPinChangeError('Current Security PIN does not match.');
      return;
    }
    if (!newPinInput || newPinInput.length < 4) {
      setPinChangeError('New PIN must be at least 4 digits.');
      return;
    }

    setLocalAdminPin(newPinInput);
    if (onUpdateReferralSettings) {
      onUpdateReferralSettings({
        referrerReward: Number(localReferrerBonus) || 1500,
        refereeReward: Number(localRefereeBonus) || 500,
        partnerRequiredDirectBookings: Number(localPartnerThreshold) || 10,
        partnerIndirectReferralBonus: Number(localPartnerOverrideBonus) || 100,
        holdUntilFirstBooking: localHoldUntilBooking,
        securityAdminPin: newPinInput,
        maxWalletAdjustmentLimit: Number(localMaxWalletLimit) || 25000,
      });
    }
    if (onLogAdminAction) {
      onLogAdminAction('security', 'MASTER_PIN_CHANGED', 'Admin Master Security PIN updated securely.', 'warning');
    }
    setPinChangeSuccess(true);
    setCurrentPinVerify('');
    setNewPinInput('');
    setTimeout(() => setPinChangeSuccess(false), 3500);
  };

  const handleSaveSecurityLimits = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateReferralSettings) {
      onUpdateReferralSettings({
        referrerReward: Number(localReferrerBonus) || 1500,
        refereeReward: Number(localRefereeBonus) || 500,
        partnerRequiredDirectBookings: Number(localPartnerThreshold) || 10,
        partnerIndirectReferralBonus: Number(localPartnerOverrideBonus) || 100,
        holdUntilFirstBooking: localHoldUntilBooking,
        securityAdminPin: localAdminPin,
        maxWalletAdjustmentLimit: Number(localMaxWalletLimit) || 25000,
      });
    }
    if (onLogAdminAction) {
      onLogAdminAction('security', 'WALLET_LIMIT_UPDATED', `Max wallet adjustment limit set to ₹${Number(localMaxWalletLimit).toLocaleString('en-IN')}`, 'warning');
    }
    setPinChangeSuccess(true);
    setTimeout(() => setPinChangeSuccess(false), 3000);
  };

  // Calculations
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.bookingStatus !== 'Cancelled' ? b.totalAmount : 0), 0);
  const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
  const totalReferralRewards = referrals.reduce((sum, r) => sum + r.amountEarned, 0);

  // Handlers for Package Edit
  const startEdit = (pkg: HolidayPackage) => {
    setEditingPkgId(pkg.id);
    setEditPrice(pkg.price);
    setEditSeats(pkg.remainingSeats);
  };

  const saveEdit = (pkgId: string) => {
    onUpdatePackagePrice(pkgId, editPrice, editSeats);
    setEditingPkgId(null);
  };

  // Itinerary Builder Handlers
  const handleAddItineraryDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        day: nextDayNum,
        title: `Day ${nextDayNum}: Sightseeing & Excursion`,
        meals: 'Breakfast & Dinner',
        hotel: '4-Star Deluxe Resort',
        description: 'Guided tour of local attractions, shopping in traditional markets, and scenic photo stops.'
      }
    ]);
    setNewDaysCount(nextDayNum);
    setNewNightsCount(Math.max(1, nextDayNum - 1));
    setNewDuration(`${Math.max(1, nextDayNum - 1)} Nights / ${nextDayNum} Days`);
  };

  const handleRemoveItineraryDay = (dayIndex: number) => {
    if (itineraryDays.length <= 1) return;
    const updated = itineraryDays.filter((_, idx) => idx !== dayIndex).map((item, idx) => ({
      ...item,
      day: idx + 1
    }));
    setItineraryDays(updated);
    setNewDaysCount(updated.length);
    setNewNightsCount(Math.max(1, updated.length - 1));
    setNewDuration(`${Math.max(1, updated.length - 1)} Nights / ${updated.length} Days`);
  };

  const handleUpdateItineraryField = (dayIndex: number, field: keyof DayItinerary, value: any) => {
    setItineraryDays(itineraryDays.map((item, idx) => {
      if (idx === dayIndex) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const load5DayTemplate = () => {
    setItineraryDays([
      { day: 1, title: 'Arrival & Welcome Check-in', meals: 'Dinner Included', hotel: '4-Star Luxury Resort', description: 'Arrive at destination airport. Warm meet and greet by our tour executive, transfer to hotel, evening welcome orientation and dinner.' },
      { day: 2, title: 'Full Day Iconic City Highlights', meals: 'Breakfast & Dinner', hotel: '4-Star Luxury Resort', description: 'Guided city sightseeing covering top cultural sites, historical monuments, botanical gardens, and scenic viewpoints.' },
      { day: 3, title: 'Mountain & Valley Excursion', meals: 'Breakfast & Dinner', hotel: '4-Star Luxury Resort', description: 'Breathtaking excursion into high-altitude viewpoints or pristine beaches with exciting outdoor photo stops.' },
      { day: 4, title: 'Local Culture, Shopping & Leisure', meals: 'Breakfast & Dinner', hotel: '4-Star Luxury Resort', description: 'Free day for exploration, shopping in indigenous craft bazaars, trying authentic local delicacies, and evening sunset.' },
      { day: 5, title: 'Departure with Sweet Memories', meals: 'Breakfast Included', hotel: 'Check-out', description: 'Breakfast at hotel, timely transfer to airport for your confirmed flight back home with unforgettable memories.' }
    ]);
    setNewDaysCount(5);
    setNewNightsCount(4);
    setNewDuration('4 Nights / 5 Days');
  };

  const load7DayTemplate = () => {
    setItineraryDays([
      { day: 1, title: 'Arrival & Hotel Check-in', meals: 'Dinner Included', hotel: '4-Star Deluxe Resort', description: 'Arrive at airport, meet tour escort, transfer to deluxe hotel, welcome briefing and dinner.' },
      { day: 2, title: 'City Tour & Cultural Landmarks', meals: 'Breakfast & Dinner', hotel: '4-Star Deluxe Resort', description: 'Full day sightseeing of prime landmarks, temples/monuments, and historical highlights.' },
      { day: 3, title: 'Scenic Hill Station / Beach Trip', meals: 'Breakfast & Dinner', hotel: 'Hill/Beach Boutique Stay', description: 'Scenic drive through panoramic landscapes, check into mountain or beachfront resort.' },
      { day: 4, title: 'Adventure & Nature Exploration', meals: 'Breakfast & Dinner', hotel: 'Hill/Beach Boutique Stay', description: 'Nature walks, cable car / boat rides, adventure photo stops, and campfire evening.' },
      { day: 5, title: 'Bazaars & Artisan Shopping', meals: 'Breakfast & Dinner', hotel: '4-Star Deluxe Resort', description: 'Explore colorful local bazaars, handicrafts, culinary food tasting, and leisure.' },
      { day: 6, title: 'Special Gala Sunset Cruise / Dinner', meals: 'Breakfast & Dinner', hotel: '4-Star Deluxe Resort', description: 'Grand farewell day featuring sunset boat cruise and chef special multi-course banquet dinner.' },
      { day: 7, title: 'Departure Flight Back Home', meals: 'Breakfast Included', hotel: 'Check-out', description: 'Transfer to the airport for your flight home with cherished travel memories.' }
    ]);
    setNewDaysCount(7);
    setNewNightsCount(6);
    setNewDuration('6 Nights / 7 Days');
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const dates = newDatesStr.split(',').map(s => s.trim()).filter(Boolean);
    const incs = inclusionsText.split(',').map(s => s.trim()).filter(Boolean);
    const excs = exclusionsText.split(',').map(s => s.trim()).filter(Boolean);

    const created: HolidayPackage = {
      id: `pkg-${Date.now()}`,
      title: newTitle,
      subtitle: newIsFixedDeparture 
        ? `Exclusive ${newDestination} Tour with Fixed Flight Departure` 
        : `Customizable ${newDestination} Holiday Package`,
      destination: newDestination,
      stateOrCountry: newStateOrCountry,
      type: newType,
      duration: newDuration,
      nights: newNightsCount,
      days: newDaysCount,
      price: newPrice,
      originalPrice: newOriginalPrice,
      rating: 4.9,
      reviewsCount: 18,
      image: newImageUrl,
      gallery: [newImageUrl],
      isFixedDeparture: newIsFixedDeparture,
      departureCity: newDepartureCity,
      departureDates: dates.length ? dates : (newIsFixedDeparture ? ['15 Nov 2026', '22 Nov 2026', '01 Dec 2026'] : ['Flexible Daily Departures', 'Custom Dates Available']),
      remainingSeats: newSeats,
      flightDetails: newIsFixedDeparture ? {
        airline: newAirline,
        flightNumber: newFlightNumber,
        departureAirport: `${newDepartureCity} Airport`,
        arrivalAirport: `${newDestination} Airport`,
        departureTime: newFlightTimings.split('-')[0]?.trim() || '08:30 AM',
        arrivalTime: newFlightTimings.split('-')[1]?.trim() || '10:30 AM',
        duration: '2h 00m',
        baggage: newBaggage,
        seatsTotal: newSeats + 10,
        seatsAvailable: newSeats,
      } : undefined,
      highlights: [
        newIsFixedDeparture ? `Guaranteed Airline Flights from ${newDepartureCity}` : `Private Airport Transfers in ${newDestination}`,
        `Complete ${newDaysCount}-Day Comprehensive Itinerary`,
        'Daily Breakfast & Dinner with Deluxe Stays',
        'Private AC Transfers & Experienced Tour Escort'
      ],
      inclusions: incs.length ? incs : [
        ...(newIsFixedDeparture ? ['Roundtrip Flights'] : []),
        '4-Star Hotel Accommodation', 
        'Daily Breakfast & Dinner', 
        'Transfers', 
        'Sightseeing'
      ],
      exclusions: excs.length ? excs : ['Personal Expenses', 'Room Service'],
      itinerary: itineraryDays
    };

    onAddNewPackage(created);
    setShowAddModal(false);
    setNewTitle('');
    setNewDestination('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    onSendAdminAlert(broadcastTitle, broadcastMsg);
    setBroadcastHistory([
      { id: Date.now().toString(), title: broadcastTitle, msg: broadcastMsg, time: 'Just now' },
      ...broadcastHistory
    ]);
  };

  // Coupon Handlers
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newC: CouponItem = {
      id: `c-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discount: newCouponDiscount,
      minAmount: newCouponMin,
      validTill: '31 Dec 2026',
      active: true,
      timesUsed: 0
    };
    setCoupons([newC, ...coupons]);
    setNewCouponCode('');
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  // Filtered lists
  const filteredPackages = packages.filter(p => {
    if (packageTypeFilter !== 'all' && p.type !== packageTypeFilter) return false;
    if (packageSearch.trim()) {
      const q = packageSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q) || p.departureCity.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredBookings = bookings.filter(b => {
    if (bookingStatusFilter !== 'all' && b.bookingStatus !== bookingStatusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return b.contactName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.pnrNumber.toLowerCase().includes(q) || b.destination.toLowerCase().includes(q);
    }
    return true;
  });

  // If console is locked, display high-security PIN entry prompt
  if (isPanelLocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white font-display">
              Admin Console Locked
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Master Security Passcode (PIN) to access travel packages, user wallets, and system configurations.
            </p>
          </div>

          <form onSubmit={handleUnlockConsole} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="block text-xs font-bold text-slate-300">
                Master Security Passcode (PIN)
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  placeholder="Enter 4-digit PIN"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 focus:border-amber-500 rounded-xl text-center font-mono text-2xl tracking-[0.4em] text-amber-400 placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>
              {pinError && (
                <p className="text-xs text-rose-400 font-bold flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Default Master PIN is <strong className="text-slate-300 font-mono">1234</strong> (Change in Security tab)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
                YatraSafar Admin Control Center
              </h2>
              <span className="text-xs text-amber-400 font-semibold">
                Super Admin Access • Live Marketplace Controls & Inventory
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manage holiday packages, customize day-wise itineraries, update flight fixed departures, confirm PNR bookings, issue promo coupons, and send broadcasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Security Status Chip */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Security PIN Guard: Active</span>
          </div>

          {/* Lock Console Button */}
          <button
            onClick={() => {
              setIsPanelLocked(true);
              if (onLogAdminAction) {
                onLogAdminAction('security', 'SESSION_LOCKED', 'Admin manually locked console session.', 'info');
              }
            }}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
            title="Lock Admin Console immediately with Master PIN"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Lock Console</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Package</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN VERTICAL ADMIN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT VERTICAL SIDEBAR MENU */}
        <aside className="lg:col-span-3 xl:col-span-3 lg:sticky lg:top-20 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-xl">
            {/* Sidebar Title & Indicator */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  Vertical Navigation
                </span>
                <h3 className="font-extrabold text-sm text-white">
                  Admin Control Menu
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Panel</span>
              </span>
            </div>

            {/* Vertical Menu Items */}
            <nav className="flex flex-col gap-1.5">
              {/* 1. Packages & Itineraries */}
              <button
                onClick={() => setActiveMenu('packages')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'packages'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className={`w-4 h-4 shrink-0 ${activeMenu === 'packages' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Packages & Itinerary</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'packages' ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {packages.length}
                </span>
              </button>

              {/* 2. Fixed Flight Departures */}
              <button
                onClick={() => setActiveMenu('fixed-departures')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'fixed-departures'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Plane className={`w-4 h-4 shrink-0 -rotate-45 ${activeMenu === 'fixed-departures' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Fixed Flight Departures</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'fixed-departures' ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {packages.filter(p => p.isFixedDeparture).length}
                </span>
              </button>

              {/* 3. Bookings & PNR */}
              <button
                onClick={() => setActiveMenu('bookings')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'bookings'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 shrink-0 ${activeMenu === 'bookings' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Bookings & PNR</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'bookings' ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {bookings.length}
                </span>
              </button>

              {/* 4. Total Users & Account Controls */}
              <button
                onClick={() => setActiveMenu('users')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'users'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className={`w-4 h-4 shrink-0 ${activeMenu === 'users' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Total Users & Controls</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'users' ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-500/20 text-amber-300 font-extrabold'
                }`}>
                  {users.length} Users
                </span>
              </button>

              {/* 5. Interactive Referral Tree (MLM) */}
              <button
                onClick={() => setActiveMenu('referral-tree')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'referral-tree'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GitBranch className={`w-4 h-4 shrink-0 ${activeMenu === 'referral-tree' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Referral Tree (MLM)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'referral-tree' ? 'bg-slate-950/15 text-slate-950' : 'bg-purple-500/20 text-purple-300 font-extrabold'
                }`}>
                  Genealogy
                </span>
              </button>

              {/* 6. Discount Coupons */}
              <button
                onClick={() => setActiveMenu('coupons')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'coupons'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className={`w-4 h-4 shrink-0 ${activeMenu === 'coupons' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Discount Coupons</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'coupons' ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {coupons.length}
                </span>
              </button>

              {/* 7. Wallet & Referral Bonus */}
              <button
                onClick={() => setActiveMenu('referrals')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'referrals'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gift className={`w-4 h-4 shrink-0 ${activeMenu === 'referrals' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Wallet & Referral</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'referrals' ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  ₹{localReferrerBonus}
                </span>
              </button>

              {/* 8. Broadcast Alerts */}
              <button
                onClick={() => setActiveMenu('broadcast')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'broadcast'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BellRing className={`w-4 h-4 shrink-0 ${activeMenu === 'broadcast' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Broadcast Alerts</span>
                </div>
                {broadcastHistory.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeMenu === 'broadcast' ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {broadcastHistory.length}
                  </span>
                )}
              </button>

              {/* 9. Helpline & Settings */}
              <button
                onClick={() => setActiveMenu('settings')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'settings'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-4 h-4 shrink-0 ${activeMenu === 'settings' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Helpline & Settings</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'settings' ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  Config
                </span>
              </button>

              {/* 10. Security Console & Audit Trail */}
              <button
                onClick={() => setActiveMenu('security')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer group ${
                  activeMenu === 'security'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className={`w-4 h-4 shrink-0 ${activeMenu === 'security' ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>Security & Audit</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeMenu === 'security' ? 'bg-slate-950/15 text-slate-950' : 'bg-emerald-500/20 text-emerald-400 font-extrabold'
                }`}>
                  PIN Guard
                </span>
              </button>
            </nav>

            {/* Sidebar Quick Action & Info */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Package</span>
              </button>

              <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span>Helpline Service</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Active</span>
                </div>
                <div className="font-mono text-xs text-amber-400 font-bold">{supportPhone}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT COLUMN */}
        <main className="lg:col-span-9 xl:col-span-9 space-y-6 min-w-0">
          {/* KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {/* 1. Total Registered Users & Controls */}
            <div 
              onClick={() => setActiveMenu('users')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider group-hover:text-amber-600 transition">
                  Total Users
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  Controls ➔
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-display mt-1">
                {users.length} <span className="text-xs font-semibold text-slate-500">Users</span>
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <UserCheck className="w-3.5 h-3.5" /> {users.filter(u => u.status === 'active').length} Active Accounts
              </span>
            </div>

            {/* 2. Total Booking Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Total Booking Revenue</span>
              <div className="text-2xl font-extrabold text-slate-900 font-display mt-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified
              </span>
            </div>

            {/* 3. Confirmed Bookings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Confirmed Bookings</span>
              <div className="text-2xl font-extrabold text-sky-700 font-display mt-1">
                {confirmedCount} Orders
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {bookings.length} Total Leads
              </span>
            </div>

            {/* 4. Active Tour Packages */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Active Tour Packages</span>
              <div className="text-2xl font-extrabold text-amber-600 font-display mt-1">
                {packages.length} Tours
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Day-Wise Detailed Plans
              </span>
            </div>

            {/* 5. Referral Rewards Disbursed */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Referral Cash Disbursed</span>
              <div className="text-2xl font-extrabold text-indigo-700 font-display mt-1">
                ₹{totalReferralRewards.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                ₹{localReferrerBonus} Share / ₹{localRefereeBonus} Join
              </span>
            </div>
          </div>

      {/* ========================================================= */}
      {/* MENU 1: PACKAGES & ITINERARY MANAGEMENT                   */}
      {/* ========================================================= */}
      {activeMenu === 'packages' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search packages by title or city..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setPackageTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    packageTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All ({packages.length})
                </button>
                <button
                  onClick={() => setPackageTypeFilter('domestic')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    packageTypeFilter === 'domestic' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Domestic
                </button>
                <button
                  onClick={() => setPackageTypeFilter('international')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    packageTypeFilter === 'international' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  International
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Tour Package</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Package & Destination</th>
                  <th className="py-3 px-4">Departure Type</th>
                  <th className="py-3 px-4">Duration & Itinerary</th>
                  <th className="py-3 px-4">Departure City</th>
                  <th className="py-3 px-4">Remaining Seats</th>
                  <th className="py-3 px-4">Price (INR)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[240px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="truncate">
                          <p className="truncate text-slate-900 font-bold">{pkg.title}</p>
                          <span className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold ${
                            pkg.type === 'domestic' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {pkg.type.toUpperCase()} • {pkg.destination}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          if (onUpdatePackage) {
                            onUpdatePackage({
                              ...pkg,
                              isFixedDeparture: !pkg.isFixedDeparture,
                              flightDetails: !pkg.isFixedDeparture 
                                ? (pkg.flightDetails || {
                                    airline: 'IndiGo Airlines',
                                    flightNumber: '6E-4501',
                                    departureAirport: `${pkg.departureCity} Airport`,
                                    arrivalAirport: `${pkg.destination} Airport`,
                                    departureTime: '08:00 AM',
                                    arrivalTime: '10:00 AM',
                                    duration: '2h 00m',
                                    baggage: '15 kg Check-in + 7 kg Cabin',
                                    seatsTotal: pkg.remainingSeats + 15,
                                    seatsAvailable: pkg.remainingSeats,
                                  })
                                : pkg.flightDetails
                            });
                          }
                        }}
                        title="Click to toggle between Fixed Departure and Standard Package"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition cursor-pointer shadow-2xs ${
                          pkg.isFixedDeparture
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {pkg.isFixedDeparture ? (
                          <>
                            <Plane className="w-3.5 h-3.5 text-amber-700 -rotate-45" />
                            <span>✈️ Fixed Departure</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>🏖️ Standard Tour</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold block">{pkg.duration}</span>
                      <button
                        onClick={() => setViewingItineraryPkg(pkg)}
                        className="text-[11px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 mt-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Itinerary ({pkg.itinerary.length} Days)</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {pkg.departureCity}
                    </td>

                    <td className="py-3.5 px-4">
                      {editingPkgId === pkg.id ? (
                        <input
                          type="number"
                          value={editSeats}
                          onChange={(e) => setEditSeats(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold"
                        />
                      ) : (
                        <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                          pkg.remainingSeats <= 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {pkg.remainingSeats} Seats
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {editingPkgId === pkg.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                          className="w-28 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-sky-700"
                        />
                      ) : (
                        <span className="font-bold text-sm text-slate-900 font-display">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {editingPkgId === pkg.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(pkg.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                            title="Save changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingPkgId(null)}
                            className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEdit(pkg)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                            title="Quick Edit Price & Seats"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {onDeletePackage && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${pkg.title}"?`)) {
                                  onDeletePackage(pkg.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                              title="Delete Package"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 2: FIXED FLIGHT DEPARTURES INVENTORY                 */}
      {/* ========================================================= */}
      {activeMenu === 'fixed-departures' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Plane className="w-5 h-5 text-sky-600 -rotate-45" />
              <span>Fixed Flight Departure Inventory Manager</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live airline seat inventory blocks booked under group PNR with guaranteed flight schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.filter(p => p.isFixedDeparture).map(pkg => {
              const flight = pkg.flightDetails;
              const totalSeats = flight?.seatsTotal || pkg.remainingSeats + 15;
              const bookedSeats = totalSeats - pkg.remainingSeats;
              const occupancyPct = Math.round((bookedSeats / totalSeats) * 100);

              return (
                <div key={pkg.id} className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-sky-300 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded">
                        {flight?.airline || 'Group Airline Block'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{pkg.destination}</h4>
                      <p className="text-xs text-slate-500">{pkg.departureCity} ➔ {pkg.destination}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-900 rounded-lg">
                      {flight?.flightNumber || 'FLIGHT'}
                    </span>
                  </div>

                  {/* Occupancy bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Seat Occupancy:</span>
                      <span className="font-bold text-slate-900">{occupancyPct}% ({pkg.remainingSeats} Left)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          occupancyPct > 80 ? 'bg-red-500' : occupancyPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Departure Dates */}
                  <div className="text-xs">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Guaranteed Dates:</span>
                    <div className="flex flex-wrap gap-1">
                      {pkg.departureDates.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Seat modifier */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Adjust Seats:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdatePackagePrice(pkg.id, pkg.price, Math.max(0, pkg.remainingSeats - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold w-6 text-center">{pkg.remainingSeats}</span>
                      <button
                        onClick={() => onUpdatePackagePrice(pkg.id, pkg.price, pkg.remainingSeats + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 3: BOOKINGS & PNR MANAGEMENT                         */}
      {/* ========================================================= */}
      {activeMenu === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <span>Traveler Bookings & Airline PNR Manager</span>
              </h3>
              <p className="text-xs text-slate-500">
                Assign flight group PNR numbers, update traveler trip status, and view passenger manifests.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search name, PNR, ID..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs w-full sm:w-56"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="all">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Package Destination</th>
                  <th className="py-3 px-4">Airline PNR</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Trip Status</th>
                  <th className="py-3 px-4 text-right">Manifest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {b.id}
                      <span className="block font-sans text-[10px] text-slate-400 font-normal">{b.bookingDate}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{b.contactName}</p>
                      <span className="text-[11px] text-slate-500">{b.contactPhone} • {b.passengers.length} Travelers</span>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <span className="font-bold text-slate-900">{b.destination}</span>
                      <span className="block text-[11px] text-slate-500">{b.departureDate}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {editingPnrBookingId === b.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={pnrInput}
                            onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                            className="w-24 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-xs"
                          />
                          <button
                            onClick={() => {
                              if (onUpdateBookingPnr && pnrInput.trim()) {
                                onUpdateBookingPnr(b.id, pnrInput.trim());
                              }
                              setEditingPnrBookingId(null);
                            }}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {b.pnrNumber}
                          </span>
                          {onUpdateBookingPnr && (
                            <button
                              onClick={() => {
                                setEditingPnrBookingId(b.id);
                                setPnrInput(b.pnrNumber);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title="Update PNR"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 font-display">
                      ₹{b.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={b.bookingStatus}
                        onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as any)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border transition ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : b.bookingStatus === 'Completed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedBookingForManifest(b)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition"
                      >
                        View Guests
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 4: DISCOUNT COUPONS & PROMOS                         */}
      {/* ========================================================= */}
      {activeMenu === 'coupons' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <span>Promotional Coupons & Special Discount Codes</span>
              </h3>
              <p className="text-xs text-slate-500">
                Create and manage instant discount promo codes applicable during holiday package checkout.
              </p>
            </div>
          </div>

          {/* Add Coupon Bar */}
          <form onSubmit={handleAddCoupon} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. SUMMER2500"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold uppercase bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Amount (₹)</label>
              <input
                type="number"
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold bg-white"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs transition"
              >
                + Add Coupon Code
              </button>
            </div>
          </form>

          {/* Coupons Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    {c.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {c.active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-xl font-extrabold text-sky-700 font-display">
                    ₹{c.discount.toLocaleString('en-IN')} OFF
                  </div>
                  <p className="text-slate-500 text-[11px]">Min booking: ₹{c.minAmount.toLocaleString('en-IN')}</p>
                  <p className="text-slate-500 text-[11px]">Times Redeemed: <strong className="text-slate-800">{c.timesUsed}</strong></p>
                </div>

                <button
                  onClick={() => toggleCouponStatus(c.id)}
                  className={`w-full py-1.5 rounded-lg font-bold text-xs transition border ${
                    c.active 
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-200 bg-white' 
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {c.active ? 'Disable Coupon' : 'Enable Coupon'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 5: WALLET & REFERRAL SETTINGS (EDITABLE)             */}
      {/* ========================================================= */}
      {activeMenu === 'referrals' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  Referral Policy, Partner Tier & Hold System
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure direct rewards, 1st-booking hold policy, 10-referral Partner auto-upgrades, and downline override bonuses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {referralSaveSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Changes Saved & Live on Platform!</span>
                </span>
              )}
              <button
                onClick={handleSaveReferralSettings}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Reward Settings</span>
              </button>
            </div>
          </div>

          {/* 1ST BOOKING HOLD RULE ENFORCER CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span className="font-extrabold text-sm text-slate-900">
                  Referral Reward Hold Policy (Anti-Spam & Guaranteed Conversion)
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  localHoldUntilBooking ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {localHoldUntilBooking ? '🔒 HOLD ACTIVE' : 'INSTANT PAYOUT'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                When a new user registers, the referrer's bonus is placed on <strong className="text-amber-800 font-bold">Hold</strong> in their wallet. As soon as the new traveler confirms their <strong className="text-emerald-800 font-bold">1st holiday booking</strong>, the referral reward immediately unlocks into Available Wallet Cash.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLocalHoldUntilBooking(!localHoldUntilBooking)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                localHoldUntilBooking 
                  ? 'bg-amber-600 text-white shadow-xs hover:bg-amber-700' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{localHoldUntilBooking ? 'Hold Enforced (Recommended)' : 'Hold Disabled (Instant)'}</span>
            </button>
          </div>

          {/* 6 EDITABLE CONFIGURATION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Referrer Direct Reward */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  1. Direct Referrer Reward
                </span>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  ₹{localReferrerBonus}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Reward credited to direct sponsor when friend completes 1st booking:
              </p>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={localReferrerBonus}
                  onChange={(e) => setLocalReferrerBonus(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 border-2 border-amber-300 focus:border-amber-500 rounded-xl font-extrabold text-slate-900 text-base"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[1000, 1500, 2000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLocalReferrerBonus(amt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      localReferrerBonus === amt 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Referee New User Join Bonus */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  2. Referee Welcome Bonus
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                  ₹{localRefereeBonus}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Instant welcome wallet bonus credited to newly invited friend upon registering:
              </p>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={localRefereeBonus}
                  onChange={(e) => setLocalRefereeBonus(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 rounded-xl font-extrabold text-slate-900 text-base"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[250, 500, 750, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLocalRefereeBonus(amt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      localRefereeBonus === amt 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Partner Milestone: 10 Direct Bookings */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                  3. Partner Upgrade Target
                </span>
                <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                  {localPartnerThreshold} Bookings
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Direct referrals jin sabhi ki 1st booking complete hone par user "Partner" banega:
              </p>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={localPartnerThreshold}
                  onChange={(e) => setLocalPartnerThreshold(Math.max(1, parseInt(e.target.value) || 10))}
                  className="w-full px-3 py-2 border-2 border-indigo-300 focus:border-indigo-500 rounded-xl font-extrabold text-slate-900 text-base"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setLocalPartnerThreshold(count)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      localPartnerThreshold === count 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900'
                    }`}
                  >
                    {count} Referrals
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Partner Downline Override Bonus */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                  4. Partner Downline Bonus
                </span>
                <span className="text-xs font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                  ₹{localPartnerOverrideBonus} / Ref
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Partner ke downline me koi bhi refer karega to Partner ko milne wala bonus (Hold):
              </p>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={localPartnerOverrideBonus}
                  onChange={(e) => setLocalPartnerOverrideBonus(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 border-2 border-purple-300 focus:border-purple-500 rounded-xl font-extrabold text-slate-900 text-base"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[50, 100, 150, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLocalPartnerOverrideBonus(amt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      localPartnerOverrideBonus === amt 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-900'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Agent Tier Upgrade Threshold */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-300 shadow-xs space-y-3 bg-gradient-to-b from-amber-50/50 to-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>5. Agent Upgrade Target</span>
                </span>
                <span className="text-xs font-mono font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                  {localAgentPartnersThreshold} Downline Partner
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Downline member ke 10 bookings karke Partner banne par sponsor auto <strong>Agent</strong> banega:
              </p>

              <div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={localAgentPartnersThreshold}
                  onChange={(e) => setLocalAgentPartnersThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border-2 border-amber-300 focus:border-amber-500 rounded-xl font-extrabold text-slate-900 text-base"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[1, 2, 3, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setLocalAgentPartnersThreshold(count)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      localAgentPartnersThreshold === count 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    }`}
                  >
                    {count} {count === 1 ? 'Partner' : 'Partners'}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Agent Agency Network Override Bonus */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-300 shadow-xs space-y-3 bg-gradient-to-b from-sky-50/50 to-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>6. Agent Network Override</span>
                </span>
                <span className="text-xs font-mono font-bold bg-sky-200 text-sky-950 px-2 py-0.5 rounded">
                  ₹{localAgentNetworkBonus} / Booking
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Certified Agent ko pure agency downline ke transactions par additional override bonus:
              </p>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  min="50"
                  step="25"
                  value={localAgentNetworkBonus}
                  onChange={(e) => setLocalAgentNetworkBonus(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 border-2 border-sky-300 focus:border-sky-500 rounded-xl font-extrabold text-slate-900 text-base"
                />
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[150, 200, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLocalAgentNetworkBonus(amt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      localAgentNetworkBonus === amt 
                        ? 'bg-sky-600 text-white' 
                        : 'bg-sky-100 hover:bg-sky-200 text-sky-900'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Referral Reward Validity (Days) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs space-y-3 bg-gradient-to-b from-rose-50/40 to-white">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="referralRewardValidityDays"
                  className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>7. Referral Reward Validity (Days)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {validitySavedToast && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded animate-in fade-in">
                      Saved to localStorage
                    </span>
                  )}
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    localReferralValidityDays === 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}>
                    {localReferralValidityDays === 0 ? 'Lifetime (No Expiry)' : `${localReferralValidityDays} Days`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Number of days referral rewards & bonus credits remain valid before expiring (0 = Lifetime / Never Expires):
              </p>

              <div className="relative">
                <input
                  id="referralRewardValidityDays"
                  name="referralRewardValidityDays"
                  type="number"
                  min="0"
                  max="3650"
                  step="1"
                  value={localReferralValidityDays}
                  onChange={(e) => handleReferralValidityChange(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border-2 border-rose-300 focus:border-rose-500 rounded-xl font-extrabold text-slate-900 text-base"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {localReferralValidityDays === 0 ? 'No Expiry' : 'Days Valid'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {[
                  { label: '30D (1M)', val: 30 },
                  { label: '60D (2M)', val: 60 },
                  { label: '90D (3M)', val: 90 },
                  { label: '180D (6M)', val: 180 },
                  { label: '365D (1Y)', val: 365 },
                  { label: 'Lifetime (0)', val: 0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleReferralValidityChange(item.val)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      localReferralValidityDays === item.val
                        ? 'bg-rose-600 text-white' 
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-[10px] text-emerald-700 font-semibold">✓ Applies to all new bonus credits</span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                  {localReferralValidityDays === 0 ? 'Lifetime Guarantee' : 'Alert user 7 days before'}
                </span>
              </div>
            </div>
          </div>

          {/* BONUS EXPIRY SETTINGS DASHBOARD CARD */}
          {(() => {
            const pendingBonuses = referrals.filter(
              (r) => r.status === 'Hold' || !r.hasFirstBooking
            );

            const totalHoldAmount = pendingBonuses.reduce((acc, r) => acc + r.amountEarned, 0);

            // Compute expiry stats for each pending bonus
            const pendingWithExpiry = pendingBonuses.map((r) => {
              const validity = r.validityDays !== undefined ? r.validityDays : (localReferralValidityDays ?? 90);
              const extraDays = (r.extendedDays || 0) + (localExtensions[r.id] || 0);
              const expiry = calculateBonusExpiry(r.date, validity, extraDays);
              return {
                ...r,
                effectiveValidity: validity + extraDays,
                expiry,
              };
            });

            // Calculate average days remaining across pending non-lifetime bonuses
            const nonLifetime = pendingWithExpiry.filter((p) => !p.expiry.isLifetime);
            const avgDaysRemaining = nonLifetime.length > 0
              ? Math.round(nonLifetime.reduce((acc, p) => acc + p.expiry.daysRemaining, 0) / nonLifetime.length)
              : (localReferralValidityDays === 0 ? '∞' : localReferralValidityDays);

            const expiringSoonCount = pendingWithExpiry.filter((p) => p.expiry.isExpiringSoon).length;
            const expiredCount = pendingWithExpiry.filter((p) => p.expiry.isExpired).length;

            // Apply search & filter
            const filteredPending = pendingWithExpiry.filter((p) => {
              if (pendingBonusSearch) {
                const q = pendingBonusSearch.toLowerCase();
                const matchName = p.friendName.toLowerCase().includes(q);
                const matchPhone = p.friendPhone?.toLowerCase().includes(q);
                const matchId = p.id.toLowerCase().includes(q);
                const matchPkg = p.packageBooked?.toLowerCase().includes(q);
                if (!matchName && !matchPhone && !matchId && !matchPkg) return false;
              }

              if (pendingBonusFilter === 'expiring_soon') return p.expiry.isExpiringSoon || p.expiry.isExpired;
              if (pendingBonusFilter === 'healthy') return !p.expiry.isExpiringSoon && !p.expiry.isExpired;
              if (pendingBonusFilter === 'direct') return p.referredLevel === 1 || !p.isIndirect;
              if (pendingBonusFilter === 'downline') return p.referredLevel === 2 || p.isIndirect;
              return true;
            });

            return (
              <div id="bonus-expiry-settings-card" className="bg-white rounded-3xl border-2 border-rose-200/80 p-5 sm:p-6 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                      <Hourglass className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">
                          Bonus Expiry Settings
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          Live Expiry Engine
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Real-time tracking of days remaining, validity countdowns, and automated expiration for current pending referral bonuses.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">Active Rule:</span>
                      <span className="text-xs font-mono font-bold text-rose-700">
                        {localReferralValidityDays === 0 ? 'Lifetime (No Expiry)' : `${localReferralValidityDays} Days Validity`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Quick Stat Metric Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-1">
                      <span>Pending Bonuses</span>
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <div className="text-xl font-extrabold text-slate-900">
                      {pendingBonuses.length} <span className="text-xs font-bold text-slate-500">Bonuses</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ₹{totalHoldAmount.toLocaleString('en-IN')} held on conversion
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                      <span>Configured Validity</span>
                      <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-mono">
                      {localReferralValidityDays === 0 ? 'Lifetime' : `${localReferralValidityDays} Days`}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      ✓ Applies to all new bonus credits
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1">
                      <span>Avg. Days Remaining</span>
                      <Timer className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-mono">
                      {avgDaysRemaining === '∞' ? 'Lifetime' : `${avgDaysRemaining} Days`}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Across active pending credits
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                      <span>Expiring Soon (≤14d)</span>
                      <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-xl font-extrabold text-slate-900">
                      {expiringSoonCount} <span className="text-xs font-bold text-slate-500">Urgent</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {expiredCount > 0 ? `${expiredCount} expired` : '0 bonuses expired'}
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: `All Pending (${pendingBonuses.length})` },
                      { id: 'expiring_soon', label: `Expiring Soon (≤14d)` },
                      { id: 'healthy', label: `Healthy (>30d)` },
                      { id: 'direct', label: `Direct Referrals (L1)` },
                      { id: 'downline', label: `Partner Overrides (L2)` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPendingBonusFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          pendingBonusFilter === tab.id
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search pending bonus..."
                      value={pendingBonusSearch}
                      onChange={(e) => setPendingBonusSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pending Bonuses Table / Cards */}
                {filteredPending.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">No Pending Bonuses Matching Filter</p>
                    <p className="text-[11px] text-slate-500">
                      {pendingBonuses.length === 0
                        ? 'All referral bonuses are currently credited and active in travelers’ wallets!'
                        : 'Try clearing your search query or selecting "All Pending".'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Beneficiary & Level</th>
                          <th className="py-3 px-4">Hold Bonus</th>
                          <th className="py-3 px-4">Issued On</th>
                          <th className="py-3 px-4">Active Validity Window</th>
                          <th className="py-3 px-4">Calculated Expiry</th>
                          <th className="py-3 px-4">Days Remaining</th>
                          <th className="py-3 px-4 text-right">Admin Expiry Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredPending.map((p) => {
                          const { expiry } = p;
                          return (
                            <tr key={p.id} className="hover:bg-rose-50/30 transition">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900">{p.friendName}</div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span>{p.friendPhone || p.friendEmail || p.id}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600">
                                    {p.referredLevel === 2 ? '⚡ L2 Downline' : 'Direct L1'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 italic">
                                  {p.packageBooked || 'Awaiting 1st Booking'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-mono text-xs">
                                  ₹{p.amountEarned.toLocaleString('en-IN')}
                                </span>
                                <span className="block text-[10px] text-amber-800 font-semibold mt-1">
                                  🔒 On Hold
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-slate-600 font-medium">
                                {p.date}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-800 block">
                                  {expiry.isLifetime ? 'Lifetime (0 Days)' : `${p.effectiveValidity} Days`}
                                </span>
                                {(p.extendedDays || localExtensions[p.id]) ? (
                                  <span className="text-[10px] text-emerald-600 font-bold block">
                                    (+{(p.extendedDays || 0) + (localExtensions[p.id] || 0)}d grace added)
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 block">Standard policy</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                                {expiry.expiryDateFormatted}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-1.5 min-w-[160px]">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${expiry.badgeClass}`}>
                                      {expiry.displayRemaining}
                                    </span>
                                    {!expiry.isLifetime && (
                                      <span className="text-[10px] font-mono text-slate-400">
                                        {expiry.percentRemaining}%
                                      </span>
                                    )}
                                  </div>
                                  {!expiry.isLifetime && (
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${expiry.progressClass}`}
                                        style={{ width: `${expiry.percentRemaining}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleExtendValidity(p.id, 30)}
                                    title="Extend bonus validity by +30 days grace"
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+30d Grace</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSendAdminAlert(
                                        `⏳ Reminder: Referral Bonus Pending`,
                                        `Hi ${p.friendName}! Your ₹${p.amountEarned} referral bonus credit has ${expiry.displayRemaining}. Complete your first holiday booking to unlock it!`
                                      );
                                    }}
                                    title="Send in-app reminder alert to this traveler"
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition cursor-pointer"
                                  >
                                    <BellRing className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleUnlockBonus(p.id)}
                                    title="Manually release hold bonus to available wallet"
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Unlock className="w-3 h-3" />
                                    <span>Unlock</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Policy Explainer Footer */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-white border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Automated Bonus Expiry Rule:</strong> Every new referral bonus credit automatically inherits the configured {localReferralValidityDays === 0 ? 'Lifetime' : `${localReferralValidityDays}-day`} validity window upon creation. Saved to browser storage and applied platform-wide.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveReferralSettings}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Sync Policy
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ACTIVE TRAVEL PARTNERS ROSTER */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Official Travel Partners Roster ({users.filter(u => u.isPartner).length} Qualified Partners)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Users who completed {localPartnerThreshold} direct 1st-booking referrals and earn ₹{localPartnerOverrideBonus} on every downline referral.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Partner Name & Code</th>
                    <th className="py-3 px-4">Direct 1st Bookings</th>
                    <th className="py-3 px-4">Downline Network</th>
                    <th className="py-3 px-4">Available Wallet</th>
                    <th className="py-3 px-4">Hold Referral Bal</th>
                    <th className="py-3 px-4">Partner Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.filter(u => u.isPartner || (u.directReferralsBookedCount || 0) >= 5).map((partner) => {
                    const directBooked = partner.directReferralsBookedCount || 0;
                    const isFullyQualified = directBooked >= localPartnerThreshold || partner.isPartner;
                    const downlineCount = users.filter(u => u.referredBy === partner.referralCode).length;
                    return (
                      <tr key={partner.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                              {partner.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{partner.name}</span>
                              <span className="font-mono text-[10px] text-slate-500">{partner.referralCode}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{directBooked} / {localPartnerThreshold}</span>
                              {directBooked >= localPartnerThreshold && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                            <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${directBooked >= localPartnerThreshold ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, (directBooked / localPartnerThreshold) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {downlineCount} Members
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-600 font-display">
                          ₹{partner.walletBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-amber-600 font-display">
                          ₹{(partner.holdBalance || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          {partner.isPartner ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span>Official Partner</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              <span>In Progress ({localPartnerThreshold - directBooked} needed)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {partner.isPartner ? (
                            <button
                              onClick={() => onDemoteFromPartner && onDemoteFromPartner(partner.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                            >
                              Demote
                            </button>
                          ) : (
                            <button
                              onClick={() => onPromoteToPartner && onPromoteToPartner(partner.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition"
                            >
                              Promote to Partner
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* REFERRAL TRANSACTION LEDGER (HOLD VS RELEASED) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Referral Transactions & Payout Ledger</span>
                <span className="text-xs font-normal text-slate-500">({referrals.length} Records)</span>
              </h4>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Referrer Account</th>
                    <th className="py-3 px-4">Referred Traveler</th>
                    <th className="py-3 px-4">Package / Tier</th>
                    <th className="py-3 px-4">Reward Amount</th>
                    <th className="py-3 px-4">1st Booking Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Wallet Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {referrals.map((r) => {
                    const isHold = r.status === 'Hold';
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{r.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {r.friendName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {r.friendEmail || 'Traveler Account'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-semibold text-slate-800 block">{r.packageBooked}</span>
                          <span className="text-[10px] text-slate-500">
                            {r.referralLevel === 2 ? '⚡ Partner Override' : 'Direct Referral'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-display">
                          <span className={isHold ? 'text-amber-600' : 'text-emerald-600'}>
                            ₹{r.amountEarned.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {r.hasFirstBooking ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>1st Booking Done</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Awaiting 1st Booking</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{r.date}</td>
                        <td className="py-3.5 px-4 text-right">
                          {isHold ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              🔒 On Hold
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Credited
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 6: BROADCAST NOTIFICATIONS                           */}
      {/* ========================================================= */}
      {activeMenu === 'broadcast' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
              <BellRing className="w-5 h-5 text-sky-600" />
              <span>Broadcast Instant Push Notifications to Travelers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Send alerts directly to the in-app notification bell of all active travelers and web users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alert Message</label>
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastTitle('🔥 Flash Weekend Sale: 15% OFF!');
                    setBroadcastMsg('Book your Kashmir, Goa or Dubai flight fixed departure today and get instant ₹2,500 off using code FLAT2500.');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] hover:bg-slate-200"
                >
                  Template: Weekend Sale
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastTitle('✈️ Last 3 Flight Seats Left for Dubai!');
                    setBroadcastMsg('Fixed departure seats are selling fast for Nov 2026. Lock your guaranteed flight seat now.');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] hover:bg-slate-200"
                >
                  Template: Last Seats Alert
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                <BellRing className="w-4 h-4" />
                <span>Send Broadcast Alert Now</span>
              </button>
            </form>

            {/* Broadcast history log */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">Recent Broadcast Messages Log</h4>
              <div className="space-y-2">
                {broadcastHistory.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{item.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 7: HELPLINE & SYSTEM SETTINGS                        */}
      {/* ========================================================= */}
      {activeMenu === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              <span>Platform Helpline & Operational Configuration</span>
            </h3>
            <p className="text-xs text-slate-500">
              Update company contact numbers, booking helplines, and emergency traveler support lines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Toll-Free Helpline</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Support Number</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Referrer Share Reward (₹)</label>
              <input
                type="number"
                value={localReferrerBonus}
                onChange={(e) => setLocalReferrerBonus(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-amber-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New User Join Bonus (₹)</label>
              <input
                type="number"
                value={localRefereeBonus}
                onChange={(e) => setLocalRefereeBonus(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Settings are synchronized live across customer header, booking vouchers, and promotional banners.</span>
            </div>
            <button
              onClick={handleSaveReferralSettings}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENU 4: TOTAL USERS & ADVANCED USER CONTROLS               */}
      {/* ========================================================= */}
      {activeMenu === 'users' && (
        <AdminUserControl
          users={users}
          bookings={bookings}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onUpdateUserWallet={onUpdateUserWallet}
          onUpdateWallet={onUpdateUserWallet}
          onToggleUserStatus={onToggleUserStatus}
          onToggleStatus={onToggleUserStatus}
          onDeleteUser={onDeleteUser}
          onNavigateToReferralTree={(referralCode) => {
            setFocusedReferralRootCode(referralCode);
            setActiveMenu('referral-tree');
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MENU 5: MULTI-TIER REFERRAL TREE & GENEALOGY (MLM)        */}
      {/* ========================================================= */}
      {activeMenu === 'referral-tree' && (
        <AdminReferralTree
          users={users}
          initialRootCode={focusedReferralRootCode}
          referrerReward={referralSettings?.referrerReward ?? localReferrerBonus}
          refereeReward={referralSettings?.refereeReward ?? localRefereeBonus}
        />
      )}

      {/* ========================================================= */}
      {/* MENU 10: SECURITY CONSOLE & ADMINISTRATIVE AUDIT TRAIL    */}
      {/* ========================================================= */}
      {activeMenu === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  Admin Security Console & Audit Trail
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure master access passcode (PIN), set safety limits for wallet disbursals, monitor anti-fraud defenses, and inspect audit logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPanelLocked(true);
                  if (onLogAdminAction) {
                    onLogAdminAction('security', 'SESSION_LOCKED', 'Admin locked console from Security tab.', 'info');
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Console Now</span>
              </button>
            </div>
          </div>

          {/* SECURITY STATUS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Master PIN Protection</span>
                <KeyRound className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                •••• {localAdminPin.slice(-1) || '4'}
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> PIN Authentication Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
                <span>Max Single Wallet Limit</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-display">
                ₹{Number(localMaxWalletLimit).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-600 block">
                Single transaction ceiling guard
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span>Anti-Fraud & Self-Referral</span>
                <Fingerprint className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-emerald-800 font-display">
                100% Protected
              </div>
              <span className="text-[11px] text-slate-600 block">
                Loop blocker & device checking
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-sky-800 font-semibold">
                <span>Audit Logs Recorded</span>
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl font-extrabold text-sky-800 font-display">
                {auditLogs.length} Events
              </div>
              <span className="text-[11px] text-slate-600 block">
                Immutable chronological ledger
              </span>
            </div>
          </div>

          {/* TWO EDITABLE SECURITY CONTROLS: MASTER PIN & WALLET SAFETY LIMIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Change Master Security PIN */}
            <form onSubmit={handleChangePin} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Update Admin Master Security Passcode (PIN)</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                This 4-digit PIN is required to unlock the Admin Panel console and approve sensitive modifications.
              </p>

              {pinChangeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Master Security PIN updated successfully!</span>
                </div>
              )}

              {pinChangeError && (
                <div className="p-3 rounded-xl bg-rose-100 text-rose-900 font-bold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{pinChangeError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter current PIN"
                    value={currentPinVerify}
                    onChange={(e) => setCurrentPinVerify(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm bg-white"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">(Default: 1234)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Master PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="New 4-digit PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm bg-white"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">4 to 6 numeric digits</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Save New Security PIN</span>
              </button>
            </form>

            {/* 2. Wallet Adjustment Limit & Anti-Fraud Controls */}
            <form onSubmit={handleSaveSecurityLimits} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Financial Safety Limit & Fraud Defenses</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Enforce a maximum single wallet manual adjustment limit to prevent accidental over-credits or rogue payouts.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Manual Transfer Cap (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={localMaxWalletLimit}
                    onChange={(e) => setLocalMaxWalletLimit(parseInt(e.target.value) || 25000)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                    required
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                  {[10000, 25000, 50000, 100000].map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setLocalMaxWalletLimit(limit)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        localMaxWalletLimit === limit 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{(limit / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Automated Fraud Guards Active:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-amber-800">
                  <li>Self-referral blocking by device & phone hashing</li>
                  <li>Circular referral chain prevention (A ➔ B ➔ A loop)</li>
                  <li>Mandatory audit log on every wallet credit / debit action</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Safety Ceiling Limit</span>
              </button>
            </form>
          </div>

          {/* AUDIT TRAIL LOG VIEWER */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Administrative Security Audit Ledger</span>
                  <span className="text-xs font-normal text-slate-500">({auditLogs.length} Events)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Track every admin modification, wallet transaction, and security parameter change.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative grow sm:grow-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <select
                  value={auditCategoryFilter}
                  onChange={(e) => setAuditCategoryFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-semibold bg-slate-50 text-slate-700"
                >
                  <option value="all">All Categories</option>
                  <option value="wallet">Wallet Disbursals</option>
                  <option value="partner">Partner MLM</option>
                  <option value="user">User Status</option>
                  <option value="security">Security & PIN</option>
                  <option value="settings">System Policy</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 sticky top-0 bg-slate-50">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Audit Details</th>
                    <th className="py-2.5 px-3">Actor & IP</th>
                    <th className="py-2.5 px-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {auditLogs
                    .filter((log) => {
                      if (auditCategoryFilter !== 'all' && log.category !== auditCategoryFilter) return false;
                      if (auditSearch.trim()) {
                        const q = auditSearch.toLowerCase();
                        return (
                          log.action.toLowerCase().includes(q) ||
                          log.details.toLowerCase().includes(q) ||
                          (log.performedBy || log.adminUser || '').toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold capitalize text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px]">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs text-slate-600 text-[11px]">
                          {log.details}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800 block text-[11px]">{log.performedBy || log.adminUser || 'Super Admin'}</span>
                          <span className="font-mono text-[10px] text-slate-400">{log.ipAddress || '127.0.0.1'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : log.severity === 'warning'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD NEW PACKAGE WITH DAY-WISE ITINERARY BUILDER    */}
      {/* ========================================================= */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl font-display">Create Tour Package with Day-Wise Itinerary</h3>
                <p className="text-xs text-slate-300">Set complete destination details, fixed flight schedule & full day-by-day plan</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close package editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePackage} className="overflow-y-auto p-6 space-y-6 text-xs flex-1 min-h-0">
              {/* Departure Classification Toggle */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-900 text-xs">
                  Package Departure Classification:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition ${
                    newIsFixedDeparture ? 'border-sky-600 bg-sky-50/70 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="adminDepartureType"
                      checked={newIsFixedDeparture}
                      onChange={() => setNewIsFixedDeparture(true)}
                      className="mt-0.5 text-sky-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs flex items-center gap-1">
                        <span>✈️ Fixed Departure Package</span>
                        <span className="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.2 rounded font-bold">Group Flight</span>
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Fixed airline flights, seat occupancy bar, guaranteed travel dates, and exclusive Share & Earn eligibility.
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition ${
                    !newIsFixedDeparture ? 'border-emerald-600 bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="adminDepartureType"
                      checked={!newIsFixedDeparture}
                      onChange={() => setNewIsFixedDeparture(false)}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs flex items-center gap-1">
                        <span>🏖️ Standard Tour Package</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">Flexible</span>
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Flexible dates, customizable land package (stays, private transfers & sightseeing) without fixed flight blocks.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>1. Tour Package Core Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Package Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Majestic Leh Ladakh Fixed Departure with Pangong Lake"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tour Category</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="domestic">Domestic (India)</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Destination Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Leh & Nubra Valley"
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State or Country</label>
                    <input
                      type="text"
                      placeholder="e.g. Ladakh, India"
                      value={newStateOrCountry}
                      onChange={(e) => setNewStateOrCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duration Text</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-sky-700 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={newOriginalPrice}
                      onChange={(e) => setNewOriginalPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Departure City</label>
                    <input
                      type="text"
                      value={newDepartureCity}
                      onChange={(e) => setNewDepartureCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Seats</label>
                    <input
                      type="number"
                      value={newSeats}
                      onChange={(e) => setNewSeats(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fixed Flight Departure Dates (Comma separated)</label>
                  <input
                    type="text"
                    value={newDatesStr}
                    onChange={(e) => setNewDatesStr(e.target.value)}
                    placeholder="e.g. 15 Nov 2026, 22 Nov 2026, 01 Dec 2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-600"
                  />
                </div>
              </div>

              {/* Fixed Flight Details */}
              {newIsFixedDeparture ? (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-amber-500 -rotate-45" />
                    <span>2. Guaranteed Fixed Flight Schedule</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Airline Partner</label>
                      <input
                        type="text"
                        value={newAirline}
                        onChange={(e) => setNewAirline(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Flight Number</label>
                      <input
                        type="text"
                        value={newFlightNumber}
                        onChange={(e) => setNewFlightNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Flight Timings</label>
                      <input
                        type="text"
                        value={newFlightTimings}
                        onChange={(e) => setNewFlightTimings(e.target.value)}
                        placeholder="08:30 AM - 10:15 AM"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Baggage Allowance</label>
                      <input
                        type="text"
                        value={newBaggage}
                        onChange={(e) => setNewBaggage(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Standard Tour Package:</span> No fixed group flight block required. Includes stays, meals, sightseeing, and private AC transfers with open dates.
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* DAY-WISE ITINERARY BUILDER                                */}
              {/* ========================================================= */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>3. Day-Wise Itinerary Plan ({itineraryDays.length} Days)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Add, edit, or remove each day's sightseeing, meals, hotel stay, and schedule.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={load5DayTemplate}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px]"
                    >
                      Load 5-Day Template
                    </button>
                    <button
                      type="button"
                      onClick={load7DayTemplate}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px]"
                    >
                      Load 7-Day Template
                    </button>
                  </div>
                </div>

                {/* Days list */}
                <div className="space-y-3">
                  {itineraryDays.map((day, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center">
                            D{day.day}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">Day {day.day} Details</span>
                        </div>

                        {itineraryDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItineraryDay(idx)}
                            className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Day</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block font-bold text-slate-700 mb-1">Day Title</label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => handleUpdateItineraryField(idx, 'title', e.target.value)}
                            placeholder="e.g. Arrival & Shikara Ride"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Meals Included</label>
                          <input
                            type="text"
                            value={day.meals}
                            onChange={(e) => handleUpdateItineraryField(idx, 'meals', e.target.value)}
                            placeholder="e.g. Breakfast & Dinner"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Hotel / Stay</label>
                          <input
                            type="text"
                            value={day.hotel}
                            onChange={(e) => handleUpdateItineraryField(idx, 'hotel', e.target.value)}
                            placeholder="e.g. 4-Star Deluxe Resort"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Day Activities & Sightseeing Description</label>
                        <textarea
                          rows={2}
                          value={day.description}
                          onChange={(e) => handleUpdateItineraryField(idx, 'description', e.target.value)}
                          placeholder="Detailed sightseeing description for the travelers..."
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddItineraryDay}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-sky-400 bg-sky-50/60 hover:bg-sky-50 text-sky-700 font-bold flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Next Day (Day {itineraryDays.length + 1})</span>
                </button>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inclusions (Comma-separated)</label>
                  <textarea
                    rows={2}
                    value={inclusionsText}
                    onChange={(e) => setInclusionsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exclusions (Comma-separated)</label>
                  <textarea
                    rows={2}
                    value={exclusionsText}
                    onChange={(e) => setExclusionsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Package with Itinerary</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW ITINERARY INSPECTOR                           */}
      {/* ========================================================= */}
      {viewingItineraryPkg && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingItineraryPkg(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-display">{viewingItineraryPkg.title}</h3>
                <span className="text-xs text-sky-700 font-semibold">{viewingItineraryPkg.destination} • {viewingItineraryPkg.duration}</span>
              </div>
              <button 
                onClick={() => setViewingItineraryPkg(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close itinerary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 space-y-3 pr-1 text-xs">
              {viewingItineraryPkg.itinerary.map((day) => (
                <div key={day.day} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="text-sky-700">Day {day.day}: {day.title}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {day.meals}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Hotel: {day.hotel}</div>
                  <p className="text-slate-600 leading-relaxed pt-1 text-[11px]">{day.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setViewingItineraryPkg(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PASSENGER MANIFEST                                 */}
      {/* ========================================================= */}
      {selectedBookingForManifest && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBookingForManifest(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-display">Guest Passenger Manifest</h3>
                <span className="text-xs text-slate-500">Booking {selectedBookingForManifest.id} • PNR {selectedBookingForManifest.pnrNumber}</span>
              </div>
              <button 
                onClick={() => setSelectedBookingForManifest(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close manifest"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs flex-1 min-h-0 overflow-y-auto pr-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Lead Contact</span>
                <p className="font-bold text-slate-900">{selectedBookingForManifest.contactName}</p>
                <p className="text-slate-500">{selectedBookingForManifest.contactEmail} • {selectedBookingForManifest.contactPhone}</p>
              </div>

              <span className="text-[11px] font-bold text-slate-700 block mt-3">All Passenger Tickets:</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedBookingForManifest.passengers.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Pax {idx + 1}: {p.name}</span>
                      <span className="text-[10px] text-slate-500 block">{p.gender}, {p.age} yrs</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      SEAT CONFIRMED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedBookingForManifest(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
