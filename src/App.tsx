import React, { useState, useMemo, useEffect } from 'react';
import { 
  initialPackages, 
  initialBookings, 
  initialReferrals, 
  initialNotifications, 
  departureCities 
} from './data/travelData';
import { INITIAL_USERS } from './data/userData';
import { INITIAL_AUDIT_LOGS } from './data/securityAuditData';
import { 
  HolidayPackage, 
  BookingRecord, 
  ReferralRecord, 
  NotificationItem,
  ReferralSettings,
  AdminUserRecord,
  AdminAuditLog
} from './types/travel';

// Components
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { PackageCard } from './components/PackageCard';
import { PackageDetailModal } from './components/PackageDetailModal';
import { BookingModal } from './components/BookingModal';
import { ReferAndEarn } from './components/ReferAndEarn';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { RealtimeChatSupport } from './components/RealtimeChatSupport';
import { MobileAppSimulatorModal } from './components/MobileAppSimulatorModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthModal, AuthUser } from './components/AuthModal';

// Icons
import { 
  Plane, 
  Gift, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  HeartHandshake, 
  Smartphone, 
  PhoneCall, 
  CheckCircle2,
  ChevronRight,
  Filter,
  Share2,
  Copy,
  Check,
  User,
  X
} from 'lucide-react';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<'packages' | 'fixed-departures' | 'refer' | 'dashboard' | 'admin'>('packages');

  // Search & Filter State
  const [activeSearchTab, setActiveSearchTab] = useState<'all' | 'domestic' | 'international' | 'fixed-departures'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // App Data State
  const [packages, setPackages] = useState<HolidayPackage[]>(initialPackages);
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);
  const [referrals, setReferrals] = useState<ReferralRecord[]>(initialReferrals);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [users, setUsers] = useState<AdminUserRecord[]>(INITIAL_USERS);
  
  // Wallet & Referral State (Editable in Admin Panel)
  const [walletBalance, setWalletBalance] = useState<number>(7150);
  const [holdBalance, setHoldBalance] = useState<number>(6100);
  const [totalEarnings, setTotalEarnings] = useState<number>(14650);
  const [isPartner, setIsPartner] = useState<boolean>(true);
  const [directReferralsBookedCount, setDirectReferralsBookedCount] = useState<number>(10);
  const [isAgent, setIsAgent] = useState<boolean>(true);
  const [downlinePartnersCount, setDownlinePartnersCount] = useState<number>(1);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const referralCode = 'YS-GANESH789';

  const [referralSettings, setReferralSettings] = useState<ReferralSettings>(() => {
    try {
      const saved = localStorage.getItem('yatrasafar_referral_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          referrerReward: parsed.referrerReward ?? 1500,
          refereeReward: parsed.refereeReward ?? 500,
          partnerRequiredDirectBookings: parsed.partnerRequiredDirectBookings ?? 10,
          partnerIndirectReferralBonus: parsed.partnerIndirectReferralBonus ?? 100,
          agentRequiredDownlinePartners: parsed.agentRequiredDownlinePartners ?? 1,
          agentNetworkBonus: parsed.agentNetworkBonus ?? 250,
          holdUntilFirstBooking: parsed.holdUntilFirstBooking ?? true,
          securityAdminPin: parsed.securityAdminPin ?? '1234',
          maxWalletAdjustmentLimit: parsed.maxWalletAdjustmentLimit ?? 25000,
          referralBonusValidityDays: parsed.referralBonusValidityDays ?? 90,
          bonusExpiryNotificationDays: parsed.bonusExpiryNotificationDays ?? 7,
        };
      }
    } catch (e) {
      // ignore
    }
    return {
      referrerReward: 1500,
      refereeReward: 500,
      partnerRequiredDirectBookings: 10,
      partnerIndirectReferralBonus: 100,
      agentRequiredDownlinePartners: 1,
      agentNetworkBonus: 250,
      holdUntilFirstBooking: true,
      securityAdminPin: '1234',
      maxWalletAdjustmentLimit: 25000,
      referralBonusValidityDays: 90,
      bonusExpiryNotificationDays: 7,
    };
  });

  const logAdminAction = (
    category: AdminAuditLog['category'],
    action: string,
    details: string,
    severity: AdminAuditLog['severity'] = 'info'
  ) => {
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', Today',
      category,
      action,
      details,
      adminUser: 'Super Admin',
      performedBy: 'Super Admin',
      ipAddress: '192.168.1.104',
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateReferralSettings = (settings: ReferralSettings) => {
    setReferralSettings(settings);
    try {
      localStorage.setItem('yatrasafar_referral_settings', JSON.stringify(settings));
      if (settings.referralBonusValidityDays !== undefined) {
        localStorage.setItem('yatrasafar_referral_validity_days', String(settings.referralBonusValidityDays));
      }
    } catch (e) {
      // ignore
    }
    const validityText = settings.referralBonusValidityDays === 0 ? 'Lifetime' : `${settings.referralBonusValidityDays ?? 90} Days`;
    logAdminAction(
      'settings',
      'POLICY_CONFIGURATION_UPDATED',
      `Referral policy updated: Referrer ₹${settings.referrerReward}, Referee ₹${settings.refereeReward}, Validity: ${validityText}, Partner Target: ${settings.partnerRequiredDirectBookings} bookings, Downline Override: ₹${settings.partnerIndirectReferralBonus}, Hold 1st Booking: ${settings.holdUntilFirstBooking ? 'ON' : 'OFF'}`,
      'warning'
    );
    showToast(`Referral policy updated: ₹${settings.referrerReward} Referrer / ₹${settings.refereeReward} Referee / ${validityText} Validity!`);
  };

  const handleExtendBonusValidity = (referralId: string, additionalDays: number) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id === referralId) {
          const currentExt = r.extendedDays || 0;
          return {
            ...r,
            extendedDays: currentExt + additionalDays,
          };
        }
        return r;
      })
    );
    const target = referrals.find((r) => r.id === referralId);
    logAdminAction(
      'wallet',
      'BONUS_VALIDITY_EXTENDED',
      `Extended pending bonus validity by +${additionalDays} days for ${target?.friendName || referralId}`,
      'info'
    );
    showToast(`⏳ Extended validity by +${additionalDays} days for ${target?.friendName || 'Traveler'}`);
  };

  const handleUnlockPendingBonus = (referralId: string) => {
    let unlockedAmt = 0;
    let friendName = '';
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id === referralId && r.status !== 'Credited') {
          unlockedAmt = r.amountEarned;
          friendName = r.friendName;
          return {
            ...r,
            status: 'Credited',
            hasFirstBooking: true,
            holdReason: 'Admin Manual Clearance - 1st Booking Overridden',
          };
        }
        return r;
      })
    );
    if (unlockedAmt > 0) {
      setHoldBalance((prev) => Math.max(0, prev - unlockedAmt));
      setWalletBalance((prev) => prev + unlockedAmt);
      setTotalEarnings((prev) => prev + unlockedAmt);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.referralCode === referralCode) {
            return {
              ...u,
              walletBalance: u.walletBalance + unlockedAmt,
              holdBalance: Math.max(0, u.holdBalance - unlockedAmt),
              transactions: [
                {
                  id: `tx-${Date.now()}`,
                  type: 'credit' as const,
                  amount: unlockedAmt,
                  reason: `Admin Clearance: Released bonus for ${friendName}`,
                  date: 'Today',
                },
                ...(u.transactions || []),
              ],
            };
          }
          return u;
        })
      );
      logAdminAction(
        'wallet',
        'BONUS_MANUALLY_UNLOCKED',
        `Admin released held bonus ₹${unlockedAmt} for ${friendName} (${referralId}) to available wallet.`,
        'warning'
      );
      showToast(`🔓 Successfully released ₹${unlockedAmt} held bonus to available wallet!`);
    }
  };

  // Welcome bonus modal when referee visits via referral link
  const [refereeWelcomeModal, setRefereeWelcomeModal] = useState<{ open: boolean; code: string; bonus: number }>({
    open: false,
    code: '',
    bonus: 500,
  });

  // Check URL on mount for ?ref=...
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        const bonus = referralSettings.refereeReward;
        setWalletBalance((prev) => prev + bonus);
        setRefereeWelcomeModal({ open: true, code: ref, bonus });
        
        const welcomeNotif: NotificationItem = {
          id: `ref-join-${Date.now()}`,
          title: `₹${bonus} Referral Welcome Bonus Credited!`,
          message: `You joined via referral link ${ref}. Enjoy ₹${bonus} welcome cash towards your holiday booking.`,
          timestamp: 'Just now',
          read: false,
          type: 'referral',
        };
        setNotifications((prev) => [welcomeNotif, ...prev]);
        showToast(`🎉 Welcome! ₹${bonus} referral welcome bonus credited to your wallet.`);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Close referee welcome modal on Escape key
  useEffect(() => {
    if (!refereeWelcomeModal.open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRefereeWelcomeModal((prev) => ({ ...prev, open: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refereeWelcomeModal.open]);

  const handleSimulateReferral = (isDownlineOverride?: boolean) => {
    const friendNames = ['Rahul Sharma', 'Sneha Kapoor', 'Vikram Malhotra', 'Priya Patel', 'Amit Verma', 'Tanvi Deshmukh'];
    const randomFriend = friendNames[Math.floor(Math.random() * friendNames.length)];
    const packageNames = ['Kashmir Paradise 6D/5N', 'Dubai Spectacular 5D/4N', 'Goa Beachfront Escape 4D/3N', 'Bali Island Odyssey 6D/5N'];
    const randomPkg = packageNames[Math.floor(Math.random() * packageNames.length)];

    const reward = referralSettings.referrerReward || 1500;
    const partnerOverride = referralSettings.partnerIndirectReferralBonus || 100;
    const isHoldRequired = referralSettings.holdUntilFirstBooking ?? true;

    // 1. Partner Downline Referral Simulation
    if (isDownlineOverride && isPartner) {
      if (isHoldRequired) {
        setHoldBalance((prev) => prev + partnerOverride);
      } else {
        setWalletBalance((prev) => prev + partnerOverride);
      }
      setTotalEarnings((prev) => prev + partnerOverride);

      const newRecord: ReferralRecord = {
        id: `ref-dl-${Date.now().toString().slice(-4)}`,
        friendName: `${randomFriend} (via Downline)`,
        friendPhone: '+91 98990 00111',
        packageBooked: 'Awaiting Downline 1st Booking',
        amountEarned: partnerOverride,
        date: 'Just now',
        status: isHoldRequired ? 'Hold' : 'Credited',
        hasFirstBooking: !isHoldRequired,
        holdReason: isHoldRequired ? 'Partner Override Held: Waiting for downline traveler 1st booking' : 'Partner Override Released',
        isIndirect: true,
        referredLevel: 2,
        validityDays: referralSettings.referralBonusValidityDays ?? 90,
      };
      setReferrals((prev) => [newRecord, ...prev]);

      logAdminAction(
        'partner',
        'DOWNLINE_REFERRAL_OVERRIDE',
        `Partner received ₹${partnerOverride} override (${isHoldRequired ? 'Hold' : 'Credited'}) for downline traveler join.`,
        'info'
      );
      showToast(`⚡ Partner Override: ₹${partnerOverride} added ${isHoldRequired ? 'on HOLD until 1st booking' : 'to wallet'}!`);
      return;
    }

    // 2. Direct Referral Simulation
    if (isHoldRequired) {
      // Hold policy: Place reward in Hold balance until referee confirms 1st booking
      setHoldBalance((prev) => prev + reward);
      const newRecord: ReferralRecord = {
        id: `ref-${Date.now().toString().slice(-4)}`,
        friendName: randomFriend,
        friendPhone: '+91 98765 00000',
        packageBooked: 'Awaiting 1st Booking',
        amountEarned: reward,
        date: 'Just now',
        status: 'Hold',
        hasFirstBooking: false,
        holdReason: 'Held: Waiting for friend to complete 1st Holiday Booking',
        referredLevel: 1,
        validityDays: referralSettings.referralBonusValidityDays ?? 90,
      };
      setReferrals((prev) => [newRecord, ...prev]);

      const notif: NotificationItem = {
        id: `notif-ref-${Date.now()}`,
        title: `🔒 ₹${reward.toLocaleString('en-IN')} Referral Reward on HOLD`,
        message: `${randomFriend} joined through your referral link! ₹${reward.toLocaleString('en-IN')} is kept on HOLD in your wallet and will instantly unlock to available cash when they confirm their 1st holiday booking.`,
        timestamp: 'Just now',
        read: false,
        type: 'referral',
      };
      setNotifications((prev) => [notif, ...prev]);
      logAdminAction('wallet', 'REFERRAL_HOLD_CREATED', `Referral reward ₹${reward} held for ${randomFriend} pending 1st booking.`);
      showToast(`🔒 ${randomFriend} joined via link! ₹${reward.toLocaleString('en-IN')} is on HOLD in your wallet until 1st booking.`);
    } else {
      // Immediate credit when hold is toggled off
      setWalletBalance((prev) => prev + reward);
      setTotalEarnings((prev) => prev + reward);

      const newRecord: ReferralRecord = {
        id: `ref-${Date.now().toString().slice(-4)}`,
        friendName: randomFriend,
        friendPhone: '+91 98765 00000',
        packageBooked: randomPkg,
        amountEarned: reward,
        date: 'Just now',
        status: 'Credited',
        hasFirstBooking: true,
        holdReason: '1st Booking Confirmed - Unlocked',
        referredLevel: 1,
        validityDays: referralSettings.referralBonusValidityDays ?? 90,
      };
      setReferrals((prev) => [newRecord, ...prev]);

      const notif: NotificationItem = {
        id: `notif-ref-${Date.now()}`,
        title: `🎉 ₹${reward.toLocaleString('en-IN')} Referral Cash Earned!`,
        message: `${randomFriend} clicked your link, received ₹${referralSettings.refereeReward} welcome bonus, and booked ${randomPkg}! Your ₹${reward.toLocaleString('en-IN')} cash is ready in wallet.`,
        timestamp: 'Just now',
        read: false,
        type: 'referral',
      };
      setNotifications((prev) => [notif, ...prev]);
      showToast(`🎉 ${randomFriend} joined via link and booked! ₹${reward.toLocaleString('en-IN')} added to your wallet.`);
    }
  };

  // Downline Promotion simulation: Downline user becomes Partner -> Sponsor moves UP to Agent
  const handleSimulateDownlinePartnerUpgrade = () => {
    setDownlinePartnersCount((prev) => prev + 1);
    setIsAgent(true);

    // Update the downline in users array
    setUsers((prev) =>
      prev.map((u) => {
        // Upgrade downline friend (e.g., Vikram Joshi) to Partner if not already
        if (u.referredBy === referralCode && !u.isPartner) {
          return {
            ...u,
            isPartner: true,
            role: 'partner' as const,
            directReferralsBookedCount: 10,
            partnerUpgradeDate: 'Today',
          };
        }
        // Upgrade current user to Agent
        if (u.referralCode === referralCode) {
          return {
            ...u,
            isAgent: true,
            role: 'agent' as const,
            downlinePartnersCount: (u.downlinePartnersCount || 0) + 1,
            agentUpgradeDate: 'Today',
          };
        }
        return u;
      })
    );

    const agentNotif: NotificationItem = {
      id: `agent-upgrade-${Date.now()}`,
      title: '👑 Promoted to Certified Travel Agent!',
      message: `Your downline recruit achieved 10 direct bookings and became an Affiliate Partner! As the sponsor, you moved UP to Certified Travel Agent tier with ₹${referralSettings.agentNetworkBonus || 250} agency network override bonus!`,
      timestamp: 'Just now',
      read: false,
      type: 'referral',
    };
    setNotifications((prev) => [agentNotif, ...prev]);

    logAdminAction(
      'partner',
      'AGENT_AUTO_UPGRADE',
      `User ${referralCode} auto-promoted to Travel Agent because downline qualified as Partner (10 bookings).`,
      'info'
    );

    showToast('👑 Downline became Affiliate Partner! You have been promoted UP to Travel Agent!');
  };

  // Switch active user simulation for viewing different downlines
  const [activeReferralCode, setActiveReferralCode] = useState<string>(referralCode);

  const handleSwitchActiveUser = (targetUser: AdminUserRecord) => {
    setActiveReferralCode(targetUser.referralCode);
    showToast(`Switched view to ${targetUser.name} (${targetUser.referralCode})'s downline`);
  };

  const handleSimulateReferralForUser = (targetCode: string) => {
    const friendFirstNames = ['Deepak', 'Megha', 'Abhishek', 'Pooja', 'Sunil', 'Kavita', 'Rajat'];
    const friendLastNames = ['Shah', 'Verma', 'Patel', 'Yadav', 'Malhotra', 'Gupta'];
    const randomName = `${friendFirstNames[Math.floor(Math.random() * friendFirstNames.length)]} ${friendLastNames[Math.floor(Math.random() * friendLastNames.length)]}`;
    const newUserId = `usr-gen-${Date.now().toString().slice(-4)}`;
    const newCode = `YS-${randomName.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 899)}`;
    const phone = `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`;

    const newUser: AdminUserRecord = {
      id: newUserId,
      name: randomName,
      email: `${randomName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone,
      role: 'user',
      status: 'active',
      tier: 'Silver',
      walletBalance: referralSettings.refereeReward,
      holdBalance: 0,
      referralCode: newCode,
      referredBy: targetCode,
      totalBookings: 0,
      totalSpent: 0,
      joinedDate: 'Today',
      lastActive: 'Just now',
      city: 'Delhi NCR',
      isPartner: false,
      isAgent: false,
      directReferralsBookedCount: 0,
      downlinePartnersCount: 0,
    };

    setUsers((prev) => [newUser, ...prev]);

    // Check if targetCode belongs to current active user
    if (targetCode === referralCode) {
      setReferrals((prev) => [
        {
          id: `ref-sim-${Date.now().toString().slice(-4)}`,
          friendName: randomName,
          friendPhone: phone,
          packageBooked: 'Awaiting 1st Holiday Booking',
          amountEarned: referralSettings.referrerReward,
          date: 'Just now',
          status: 'Hold',
          hasFirstBooking: false,
          holdReason: 'Held: Waiting for 1st Holiday Booking',
          referredLevel: 1,
          validityDays: referralSettings.referralBonusValidityDays ?? 90,
        },
        ...prev,
      ]);
      setHoldBalance((prev) => prev + referralSettings.referrerReward);
    }

    logAdminAction('partner', 'DOWNLINE_USER_JOINED', `${randomName} enrolled under sponsor code ${targetCode}`);
    showToast(`🎉 ${randomName} enrolled under code ${targetCode}!`);
  };

  // Modals State
  const [selectedPkgDetail, setSelectedPkgDetail] = useState<HolidayPackage | null>(null);
  const [selectedPkgBooking, setSelectedPkgBooking] = useState<HolidayPackage | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileAppOpen, setIsMobileAppOpen] = useState(false);

  // Authentication State (Login & Register)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser, msg: string) => {
    setCurrentUser(user);
    showToast(msg);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('You have been logged out successfully.');
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Inactive packages are hidden from the traveler catalogue
      if (pkg.status === 'inactive') return false;

      // Category filter
      if (activeSearchTab === 'domestic' && pkg.type !== 'domestic') return false;
      if (activeSearchTab === 'international' && pkg.type !== 'international') return false;
      if (activeSearchTab === 'fixed-departures' && !pkg.isFixedDeparture) return false;
      if (currentView === 'fixed-departures' && !pkg.isFixedDeparture) return false;

      // Query filter (search in title, destination, highlights)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = pkg.title.toLowerCase().includes(q);
        const matchesDest = pkg.destination.toLowerCase().includes(q);
        const matchesCountry = pkg.stateOrCountry.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDest && !matchesCountry) return false;
      }

      // Departure city filter
      if (selectedCity !== 'all' && pkg.departureCity !== selectedCity) {
        return false;
      }

      return true;
    });
  }, [packages, activeSearchTab, currentView, searchQuery, selectedCity, selectedMonth]);

  // Handlers
  const handleBookingSuccess = (newBooking: BookingRecord, referralUsed: boolean) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Booking Confirmed: ${newBooking.destination}`,
      message: `Flight tickets & vouchers confirmed for ${newBooking.contactName}. PNR: ${newBooking.pnrNumber}.`,
      timestamp: 'Just now',
      read: false,
      type: 'booking',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Hold vs Released Referral Reward Logic:
    const reward = referralSettings.referrerReward || 1500;
    const partnerOverride = referralSettings.partnerIndirectReferralBonus || 100;
    const threshold = referralSettings.partnerRequiredDirectBookings || 10;

    let unlockedHoldDirect = false;
    let unlockedHoldOverride = false;

    setReferrals((prev) => {
      let matchedDirect = false;
      const updated = prev.map((r) => {
        // Match referee by name or first pending hold record
        if (!r.hasFirstBooking && (r.status === 'Hold' || r.status === 'Pending')) {
          if (!r.isIndirect && (!matchedDirect || r.friendName.toLowerCase().includes(newBooking.contactName.toLowerCase()))) {
            matchedDirect = true;
            unlockedHoldDirect = true;
            return {
              ...r,
              packageBooked: newBooking.packageTitle,
              status: 'Credited' as const,
              hasFirstBooking: true,
              holdReason: '1st Holiday Booking Confirmed - Unlocked to Available Cash',
            };
          } else if (r.isIndirect && !unlockedHoldOverride) {
            unlockedHoldOverride = true;
            return {
              ...r,
              status: 'Credited' as const,
              hasFirstBooking: true,
              holdReason: 'Partner Override Unlocked: Downline traveler completed 1st booking',
            };
          }
        }
        return r;
      });

      // If no hold record existed but referralUsed is true, create a newly credited record
      if (!matchedDirect && referralUsed) {
        unlockedHoldDirect = true;
        const newRecord: ReferralRecord = {
          id: `ref-${Date.now()}`,
          friendName: newBooking.contactName,
          friendPhone: newBooking.contactPhone,
          packageBooked: newBooking.packageTitle,
          amountEarned: reward,
          date: 'Today',
          status: 'Credited',
          hasFirstBooking: true,
          holdReason: '1st Holiday Booking Confirmed - Instant Credited',
          referredLevel: 1,
          validityDays: referralSettings.referralBonusValidityDays ?? 90,
        };
        return [newRecord, ...updated];
      }
      return updated;
    });

    // If a direct referral hold was unlocked or referralUsed:
    if (unlockedHoldDirect || referralUsed) {
      // Shift from holdBalance to walletBalance
      setHoldBalance((prev) => Math.max(0, prev - reward));
      setWalletBalance((prev) => prev + reward);
      setTotalEarnings((prev) => prev + reward);

      // Increment direct 1st-bookings count
      const updatedDirectCount = directReferralsBookedCount + 1;
      setDirectReferralsBookedCount(updatedDirectCount);

      // Check Partner Tier threshold (e.g. 10 direct bookings)
      if (updatedDirectCount >= threshold && !isPartner) {
        setIsPartner(true);
        const partnerNotif: NotificationItem = {
          id: `partner-${Date.now()}`,
          title: `🌟 Congratulations! Upgraded to Travel Partner!`,
          message: `You completed ${threshold} direct referrals with confirmed 1st bookings! You now earn ₹${partnerOverride} (Hold) on EVERY downline referral made by your network.`,
          timestamp: 'Just now',
          read: false,
          type: 'referral',
        };
        setNotifications((prev) => [partnerNotif, ...prev]);
        logAdminAction(
          'partner',
          'PARTNER_AUTO_UPGRADE',
          `Traveler reached ${threshold} direct 1st bookings. Upgraded to Official Partner Tier.`,
          'info'
        );
        showToast(`🌟 Milestone Reached! You have completed ${threshold} direct bookings and upgraded to Official Travel Partner!`);
      } else {
        showToast(`🎉 1st Booking Confirmed! ₹${reward.toLocaleString('en-IN')} referral reward unlocked from HOLD to Available Cash!`);
      }

      logAdminAction(
        'wallet',
        'REFERRAL_HOLD_RELEASED',
        `Referral reward ₹${reward} released to Available Wallet Cash after 1st booking for ${newBooking.contactName}.`,
        'info'
      );
    }

    if (unlockedHoldOverride) {
      setHoldBalance((prev) => Math.max(0, prev - partnerOverride));
      setWalletBalance((prev) => prev + partnerOverride);
      setTotalEarnings((prev) => prev + partnerOverride);
      logAdminAction(
        'partner',
        'PARTNER_OVERRIDE_RELEASED',
        `Partner override ₹${partnerOverride} unlocked after downline 1st booking confirmation.`,
        'info'
      );
    }

    // Decrement seats on the booked package
    setPackages((prev) =>
      prev.map((p) =>
        p.id === newBooking.packageId
          ? { ...p, remainingSeats: Math.max(0, p.remainingSeats - newBooking.passengerCount.adults) }
          : p
      )
    );

    showToast(`🎉 Booking confirmed! PNR: ${newBooking.pnrNumber}`);
  };

  const handleWithdrawWallet = (amount: number, upi: string) => {
    setWalletBalance((prev) => Math.max(0, prev - amount));
    const notif: NotificationItem = {
      id: `wth-${Date.now()}`,
      title: 'Withdrawal Processed',
      message: `₹${amount.toLocaleString('en-IN')} has been disbursed to ${upi}.`,
      timestamp: 'Just now',
      read: false,
      type: 'referral',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`₹${amount.toLocaleString('en-IN')} withdrawal initiated to ${upi}!`);
  };

  const handleUpdatePackagePrice = (packageId: string, newPrice: number, newSeats: number) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === packageId ? { ...p, price: newPrice, remainingSeats: newSeats } : p))
    );
    logAdminAction('package', 'PACKAGE_PRICE_UPDATE', `Package ${packageId} price updated to ₹${newPrice}, seats: ${newSeats}.`);
    showToast('Package price and seats updated successfully!');
  };

  const handleUpdatePackage = (updatedPkg: HolidayPackage) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p))
    );
    logAdminAction('package', 'PACKAGE_UPDATED', `Package "${updatedPkg.title}" details updated.`);
    showToast(`Package "${updatedPkg.title}" updated successfully!`);
  };

  const handleUpdatePackageStatus = (packageId: string, newStatus: 'active' | 'inactive' | 'sold_out') => {
    setPackages((prev) =>
      prev.map((p) => (p.id === packageId ? { ...p, status: newStatus } : p))
    );
    const statusLabels = {
      active: 'Active (Live)',
      inactive: 'Inactive (Hidden from public)',
      sold_out: 'Sold Out'
    };
    logAdminAction('package', 'PACKAGE_STATUS_CHANGE', `Package ${packageId} marked as ${newStatus}.`);
    showToast(`Package status marked as ${statusLabels[newStatus]}`);
  };

  const handleAddNewPackage = (newPkg: HolidayPackage) => {
    setPackages((prev) => [newPkg, ...prev]);
    logAdminAction('package', 'NEW_PACKAGE_CREATED', `New package "${newPkg.title}" created with ${newPkg.remainingSeats} seats.`);
    showToast(`New package "${newPkg.title}" published!`);
  };

  const handleDeletePackage = (packageId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== packageId));
    logAdminAction('package', 'PACKAGE_DELETED', `Package ${packageId} deleted by Admin.`, 'warning');
    showToast('Package deleted from catalogue.');
  };

  const handleUpdateBookingStatus = (bookingId: string, newStatus: 'Confirmed' | 'Completed' | 'Cancelled') => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: newStatus } : b))
    );
    logAdminAction('settings', 'BOOKING_STATUS_CHANGE', `Booking ${bookingId} status changed to ${newStatus}.`);
    showToast(`Booking status updated to ${newStatus}`);
  };

  const handleUpdateBookingPnr = (bookingId: string, newPnr: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, pnrNumber: newPnr } : b))
    );
    logAdminAction('settings', 'PNR_UPDATED', `Booking ${bookingId} PNR updated to ${newPnr}.`);
    showToast(`Flight PNR updated to ${newPnr}`);
  };

  const handleSendAdminAlert = (title: string, message: string) => {
    const notif: NotificationItem = {
      id: `admin-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type: 'system',
    };
    setNotifications((prev) => [notif, ...prev]);
    logAdminAction('security', 'BROADCAST_ALERT_SENT', `Broadcast message dispatched: ${title}`);
    showToast(`Broadcast alert sent to all users: ${title}`);
  };

  // User Management Handlers
  const handleAddUser = (newUser: AdminUserRecord) => {
    setUsers((prev) => [newUser, ...prev]);
    logAdminAction('user', 'USER_REGISTERED', `User "${newUser.name}" (${newUser.email}) created by Admin.`);
    showToast(`New user "${newUser.name}" registered successfully!`);
  };

  const handleUpdateUser = (updatedUser: AdminUserRecord) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    logAdminAction('user', 'USER_UPDATED', `User "${updatedUser.name}" profile updated.`);
    showToast(`User profile for "${updatedUser.name}" updated!`);
  };

  const handleUpdateUserWallet = (userId: string, amount: number, type: 'credit' | 'debit', reason: string) => {
    const maxLimit = referralSettings.maxWalletAdjustmentLimit || 25000;
    if (amount > maxLimit) {
      logAdminAction('security', 'WALLET_LIMIT_EXCEEDED', `Attempted ${type} of ₹${amount} exceeds ceiling ₹${maxLimit} for user ${userId}.`, 'critical');
      showToast(`⚠️ Security Alert: Amount exceeds safety ceiling limit of ₹${maxLimit.toLocaleString('en-IN')}.`);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newBalance = type === 'credit' ? u.walletBalance + amount : Math.max(0, u.walletBalance - amount);
          const tx = {
            id: `tx-${Date.now()}`,
            type,
            amount,
            reason,
            date: 'Today',
          };
          if (u.id === 'usr-101' || u.email === 'labanaganesh@gmail.com') {
            setWalletBalance(newBalance);
          }
          return {
            ...u,
            walletBalance: newBalance,
            transactions: [tx, ...(u.transactions || [])],
          };
        }
        return u;
      })
    );
    logAdminAction(
      'wallet',
      type === 'credit' ? 'ADMIN_WALLET_CREDIT' : 'ADMIN_WALLET_DEBIT',
      `Admin adjusted ₹${amount.toLocaleString('en-IN')} (${type}) for user ${userId}. Reason: ${reason}`
    );
    showToast(`User wallet ${type === 'credit' ? 'credited' : 'debited'} ₹${amount.toLocaleString('en-IN')}!`);
  };

  const handlePromoteToPartner = (userId: string) => {
    let sponsorReferralCode: string | undefined;

    setUsers((prev) => {
      const promoted = prev.find((u) => u.id === userId);
      if (promoted) {
        sponsorReferralCode = promoted.referredBy;
      }

      return prev
        .map((u) => {
          if (u.id === userId) {
            if (u.id === 'usr-101' || u.email === 'labanaganesh@gmail.com') {
              setIsPartner(true);
            }
            return {
              ...u,
              isPartner: true,
              role: 'partner' as const,
              directReferralsBookedCount: Math.max(u.directReferralsBookedCount || 0, 10),
              partnerUpgradeDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            };
          }
          return u;
        })
        .map((u) => {
          // If this user is the sponsor of the newly created Partner, promote sponsor UP to AGENT!
          if (sponsorReferralCode && u.referralCode === sponsorReferralCode) {
            if (u.id === 'usr-101' || u.email === 'labanaganesh@gmail.com') {
              setIsAgent(true);
              setDownlinePartnersCount((prevCount) => prevCount + 1);
            }
            return {
              ...u,
              isAgent: true,
              role: 'agent' as const,
              downlinePartnersCount: (u.downlinePartnersCount || 0) + 1,
              agentUpgradeDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            };
          }
          return u;
        });
    });

    logAdminAction(
      'partner',
      'PARTNER_MANUALLY_PROMOTED',
      `User ${userId} promoted to Partner. Sponsor (${sponsorReferralCode || 'None'}) auto-promoted UP to Certified Travel Agent!`,
      'info'
    );
    showToast(`User upgraded to Partner! Sponsor promoted UP to Agent.`);
  };

  const handleDemoteFromPartner = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (u.id === 'usr-101' || u.email === 'labanaganesh@gmail.com') {
            setIsPartner(false);
            setIsAgent(false);
          }
          return {
            ...u,
            isPartner: false,
            isAgent: false,
            role: 'client' as const,
          };
        }
        return u;
      })
    );
    logAdminAction('partner', 'PARTNER_DEMOTED', `User ${userId} demoted to standard Client.`, 'warning');
    showToast(`User ${userId} demoted to standard Client.`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showToast('User status updated successfully.');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('User account removed.');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-slate-900">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-xs ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        notifications={notifications}
        setIsNotificationOpen={setIsNotificationOpen}
        walletBalance={walletBalance}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        referralSettings={referralSettings}
      />

      {/* VIEW: Holiday Packages & Fixed Departures */}
      {(currentView === 'packages' || currentView === 'fixed-departures') && (
        <main className="flex-1">
          {/* Hero & Search Banner */}
          <HeroSearch
            activeTab={currentView === 'fixed-departures' ? 'fixed-departures' : activeSearchTab}
            setActiveTab={(tab) => {
              setActiveSearchTab(tab);
              if (tab === 'fixed-departures') {
                setCurrentView('fixed-departures');
              } else if (currentView === 'fixed-departures') {
                setCurrentView('packages');
              }
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            availableCities={departureCities}
            referrerReward={referralSettings.referrerReward}
            onOpenReferModal={() => setCurrentView('refer')}
          />

          {/* Fixed Departures Special Notice Banner */}
          {currentView === 'fixed-departures' && (
            <div className="bg-amber-50 border-b border-amber-200 py-4 px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Plane className="w-5 h-5 -rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-amber-950">
                      Guaranteed Flight Fixed Departures
                    </h3>
                    <p className="text-xs text-amber-800">
                      Airline group seats are pre-booked. Fare will not fluctuate. Instant PNR issuance upon booking.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Filter Departure City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="all">All Departure Hubs</option>
                    {departureCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Prominent Share & Earn Campaign Card - ONLY for Fixed Departures as requested */}
            {(currentView === 'fixed-departures' || activeSearchTab === 'fixed-departures') && (
              <div className="mb-8 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 p-6 sm:p-8 text-white shadow-xl shadow-amber-500/15 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
                  <Gift className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-slate-950 font-black text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Fixed Departure Exclusive • Share & Earn Program</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white leading-tight">
                      Share Fixed Departures & Earn <span className="underline decoration-amber-200">₹{referralSettings.referrerReward.toLocaleString('en-IN')} Real Cash</span>!
                    </h3>
                    <p className="text-sm text-amber-50 leading-relaxed font-medium">
                      Anyone joining through your referral link receives <strong className="text-white font-extrabold bg-black/20 px-2 py-0.5 rounded">₹{referralSettings.refereeReward.toLocaleString('en-IN')} Instant Welcome Cash</strong> in their wallet! When they confirm their 1st Fixed Departure package, you unlock <strong className="text-white font-extrabold bg-black/20 px-2 py-0.5 rounded">₹{referralSettings.referrerReward.toLocaleString('en-IN')} Cash</strong> with direct bank withdrawal.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold text-amber-100">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Instant ₹{referralSettings.refereeReward} to Friend on Sign Up</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>₹{referralSettings.referrerReward} to You per Fixed Booking</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Direct UPI / Bank Transfer</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => setCurrentView('refer')}
                      className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-black/25 transition cursor-pointer"
                    >
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Share & Earn Hub Kholein</span>
                    </button>
                    <button
                      onClick={handleSimulateReferral}
                      className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/30 transition cursor-pointer"
                      title="Simulate a friend joining and earning both rewards"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Test: Friend Joins (+₹{referralSettings.referrerReward})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section Heading & Quick stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                  <span>
                    {currentView === 'fixed-departures'
                      ? 'Flight Fixed Departure Holiday Packages'
                      : activeSearchTab === 'domestic'
                      ? 'Domestic Holiday Packages (India)'
                      : activeSearchTab === 'international'
                      ? 'International Holiday Packages'
                      : 'Featured Holiday Packages & Fixed Flights'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Showing {filteredPackages.length} hand-picked all-inclusive holidays with flights, deluxe hotels & tours
                </p>
              </div>

              {/* Referral mini promo banner */}
              <div 
                onClick={() => setCurrentView('refer')}
                className="cursor-pointer px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-2 text-xs transition"
              >
                <Gift className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700">
                  Share & earn <strong className="text-amber-800">₹{referralSettings.referrerReward.toLocaleString('en-IN')} Cash</strong>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </div>

            {/* Package Cards Grid */}
            {filteredPackages.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 mt-8">
                <Plane className="w-10 h-10 text-slate-300 mx-auto -rotate-45" />
                <h3 className="font-extrabold text-slate-800 text-lg">No holiday packages match your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or selecting "All Departure Cities" to see more fixed departures.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCity('all');
                    setActiveSearchTab('all');
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mt-8">
                {filteredPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onSelectPackage={(p) => setSelectedPkgDetail(p)}
                    onBookNow={(p) => setSelectedPkgBooking(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW: Refer & Earn (Reera & Earn) */}
      {currentView === 'refer' && (
        <main className="flex-1">
          <ReferAndEarn
            referralCode={referralCode}
            referrals={referrals}
            walletBalance={walletBalance}
            holdBalance={holdBalance}
            totalEarnings={totalEarnings}
            isPartner={isPartner}
            directReferralsBookedCount={directReferralsBookedCount}
            isAgent={isAgent}
            downlinePartnersCount={downlinePartnersCount}
            onWithdrawWallet={handleWithdrawWallet}
            referralSettings={referralSettings}
            onSimulateReferral={() => handleSimulateReferral(false)}
            onSimulateDownlineReferral={() => handleSimulateReferral(true)}
            onSimulateDownlinePartnerUpgrade={handleSimulateDownlinePartnerUpgrade}
            allUsers={users}
            currentUserRecord={users.find((u) => u.referralCode === activeReferralCode) || users[0]}
            onSwitchUser={handleSwitchActiveUser}
            onSimulateReferralForUser={handleSimulateReferralForUser}
          />
        </main>
      )}

      {/* VIEW: User Dashboard & My Bookings */}
      {currentView === 'dashboard' && (
        <main className="flex-1">
          <UserDashboard
            bookings={bookings}
            walletBalance={walletBalance}
            totalEarnings={totalEarnings}
            referralCode={referralCode}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onNavigateToRefer={() => setCurrentView('refer')}
            onNavigateToPackages={() => setCurrentView('packages')}
            allUsers={users}
            currentUserRecord={users.find((u) => u.referralCode === activeReferralCode) || users[0]}
            referralSettings={referralSettings}
            onSwitchUser={handleSwitchActiveUser}
            onSimulateReferralForUser={handleSimulateReferralForUser}
          />
        </main>
      )}

      {/* VIEW: Admin Panel */}
      {currentView === 'admin' && (
        <main className="flex-1">
          <AdminPanel
            packages={packages}
            bookings={bookings}
            referrals={referrals}
            users={users}
            auditLogs={auditLogs}
            onLogAdminAction={logAdminAction}
            onPromoteToPartner={handlePromoteToPartner}
            onDemoteFromPartner={handleDemoteFromPartner}
            onUpdatePackagePrice={handleUpdatePackagePrice}
            onAddNewPackage={handleAddNewPackage}
            onUpdatePackage={handleUpdatePackage}
            onUpdatePackageStatus={handleUpdatePackageStatus}
            onDeletePackage={handleDeletePackage}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateBookingPnr={handleUpdateBookingPnr}
            onSendAdminAlert={handleSendAdminAlert}
            referralSettings={referralSettings}
            onUpdateReferralSettings={handleUpdateReferralSettings}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onUpdateUserWallet={handleUpdateUserWallet}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onExtendBonusValidity={handleExtendBonusValidity}
            onUnlockPendingBonus={handleUnlockPendingBonus}
          />
        </main>
      )}

      {/* Detail Itinerary Modal */}
      {selectedPkgDetail && (
        <PackageDetailModal
          pkg={selectedPkgDetail}
          onClose={() => setSelectedPkgDetail(null)}
          onProceedToBook={(pkg) => {
            setSelectedPkgDetail(null);
            setSelectedPkgBooking(pkg);
          }}
        />
      )}

      {/* Interactive Booking & Payment Modal */}
      {selectedPkgBooking && (
        <BookingModal
          pkg={selectedPkgBooking}
          onClose={() => setSelectedPkgBooking(null)}
          onBookingSuccess={handleBookingSuccess}
          userWalletBalance={walletBalance}
        />
      )}

      {/* Auth Modal (Login & Register) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        referrerReward={referralSettings.referrerReward}
        refereeReward={referralSettings.refereeReward}
      />

      {/* Mobile App Simulator Modal (iOS & Android) */}
      <MobileAppSimulatorModal
        isOpen={isMobileAppOpen}
        onClose={() => setIsMobileAppOpen(false)}
        referralCode={referralCode}
        referrerReward={referralSettings.referrerReward}
        refereeReward={referralSettings.refereeReward}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onClearNotification={handleClearNotification}
      />

      {/* 24/7 AI Chat Concierge Support ("SafarMitra") */}
      <RealtimeChatSupport referrerReward={referralSettings.referrerReward} />

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-amber-500 flex items-center justify-center text-white">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-extrabold text-lg tracking-tight font-display">
                  Yatra<span className="text-sky-400">Safar</span> Holidays
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                India's premier marketplace for Domestic & International holiday packages with guaranteed flight fixed departures, transparent payment gateway, and lucrative referral rewards.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>IATA & Ministry of Tourism Certified</span>
              </div>
            </div>

            {/* Fixed Departures */}
            <div className="text-xs space-y-2">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Popular Fixed Departures</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li className="hover:text-white cursor-pointer" onClick={() => { setSearchQuery('Kashmir'); setCurrentView('packages'); }}>
                  Kashmir Winter Special (DEL ➔ SXR)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setSearchQuery('Dubai'); setCurrentView('packages'); }}>
                  Dubai Shopping Fest (BOM ➔ DXB)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setSearchQuery('Bali'); setCurrentView('packages'); }}>
                  Bali Tropical Holiday (DEL ➔ DPS)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setSearchQuery('Kerala'); setCurrentView('packages'); }}>
                  Kerala Backwaters (BOM ➔ COK)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setSearchQuery('Europe'); setCurrentView('packages'); }}>
                  Grand Switzerland & Paris (DEL ➔ CDG)
                </li>
              </ul>
            </div>

            {/* Quick Links & Referral */}
            <div className="text-xs space-y-2">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Programs & Portals</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li className="hover:text-amber-300 cursor-pointer font-bold text-amber-400" onClick={() => setCurrentView('refer')}>
                  🎁 Share & Earn ₹{referralSettings.referrerReward.toLocaleString('en-IN')} Cash
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                  User Dashboard & E-Tickets
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentView('admin')}>
                  Admin Panel (Prices & Bookings)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setCurrentView('fixed-departures')}>
                  Guaranteed Fixed Departures
                </li>
              </ul>
            </div>

            {/* 24/7 Helpline & Support */}
            <div className="text-xs space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">24x7 Customer Helpline</h4>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>1800-270-0888 (Toll-Free)</span>
                </div>
                <p className="text-[11px] text-slate-400">support@yatrasafar.com</p>
                <p className="text-[11px] text-slate-400">Mon-Sun 24 Hours Active</p>
              </div>

              <a
                href="https://wa.me/919876543210?text=Hello%20YatraSafar%20Team%2C%20I%20want%20to%20inquire%20about%20holiday%20packages%20and%20fixed%20departures"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Chat on WhatsApp Support</span>
              </a>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 YatraSafar Holidays Ltd. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Booking</span>
              <span>•</span>
              <span>Cancellation & Refunds</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Referee Welcome Modal (shown when joining via referral link) */}
      {refereeWelcomeModal.open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRefereeWelcomeModal({ ...refereeWelcomeModal, open: false });
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 text-center space-y-4 border border-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto my-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-left shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Referral Welcome Bonus
                </span>
              </div>
              <button
                onClick={() => setRefereeWelcomeModal({ ...refereeWelcomeModal, open: false })}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close welcome modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Gift className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                🎉 Referral Welcome Bonus
              </span>
              <h3 className="text-2xl font-black text-slate-900 font-display">
                You Received ₹{refereeWelcomeModal.bonus.toLocaleString('en-IN')} Welcome Cash!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You joined using your friend's invite code <strong className="font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">{refereeWelcomeModal.code}</strong>. This welcome bonus is credited to your YatraSafar wallet and can be redeemed on any holiday package booking!
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Wallet Balance Updated:</span>
              <span className="text-sm font-black text-emerald-600">₹{walletBalance.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={() => setRefereeWelcomeModal({ ...refereeWelcomeModal, open: false })}
              className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition cursor-pointer"
            >
              Explore Holiday Packages
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar for Thumb-Friendly Usability */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setCurrentView('packages')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'packages' ? 'text-sky-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'packages' ? 'bg-sky-50 text-sky-600' : ''}`}>
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Packages</span>
        </button>

        <button
          onClick={() => setCurrentView('fixed-departures')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'fixed-departures' ? 'text-sky-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`relative p-1 rounded-lg ${currentView === 'fixed-departures' ? 'bg-sky-50 text-sky-600' : ''}`}>
            <Plane className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Fixed Flights</span>
        </button>

        <button
          onClick={() => setCurrentView('refer')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'refer' ? 'text-amber-700 font-extrabold' : 'text-amber-900 font-medium'
          }`}
        >
          <div className={`relative p-1 rounded-lg ${currentView === 'refer' ? 'bg-amber-100 text-amber-800' : 'bg-amber-50 text-amber-600'}`}>
            <Gift className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 text-[8px] font-black bg-amber-500 text-slate-950 px-1 rounded-full shadow-xs">
              ₹{referralSettings.referrerReward}
            </span>
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Share & Earn</span>
        </button>

        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'dashboard' ? 'text-sky-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'dashboard' ? 'bg-sky-50 text-sky-600' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Bookings</span>
        </button>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setCurrentView('admin')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              currentView === 'admin' ? 'text-slate-950 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentView === 'admin' ? 'bg-slate-100 text-slate-950' : ''}`}>
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight">Admin</span>
          </button>
        )}
      </div>
    </div>
  );
}
