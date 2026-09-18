import React, { useState, useEffect } from 'react';
import { 
  User, 
  Plane, 
  Calendar, 
  Clock, 
  Download, 
  Printer, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Gift, 
  ShieldCheck, 
  FileText, 
  Phone,
  ChevronRight,
  Sparkles,
  Lock,
  LogIn,
  UserPlus,
  Users,
  GitBranch,
  Crown,
  Star,
  ArrowUpRight,
  X,
  Trophy,
  Share2,
  FileCheck
} from 'lucide-react';
import { AdminUserRecord, BookingRecord, ReferralSettings } from '../types/travel';
import { AuthUser } from './AuthModal';
import { UserDownlineNetwork } from './UserDownlineNetwork';
import { AffiliateProgramGuide } from './AffiliateProgramGuide';
import { GstInvoiceModal } from './GstInvoiceModal';
import { TravelChecklistModal } from './TravelChecklistModal';
import { AffiliateMarketingKitModal } from './AffiliateMarketingKitModal';
import { AffiliateLeaderboard } from './AffiliateLeaderboard';

interface UserDashboardProps {
  bookings: BookingRecord[];
  walletBalance: number;
  totalEarnings: number;
  referralCode: string;
  currentUser: AuthUser | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateToRefer: () => void;
  onNavigateToPackages: () => void;
  allUsers?: AdminUserRecord[];
  currentUserRecord?: AdminUserRecord;
  referralSettings?: ReferralSettings;
  onSwitchUser?: (user: AdminUserRecord) => void;
  onSimulateReferralForUser?: (targetCode: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  bookings,
  walletBalance,
  totalEarnings,
  referralCode,
  currentUser,
  onOpenAuth,
  onNavigateToRefer,
  onNavigateToPackages,
  allUsers = [],
  currentUserRecord,
  referralSettings,
  onSwitchUser,
  onSimulateReferralForUser,
}) => {
  const [filter, setFilter] = useState<'all' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');
  const [selectedVoucherBooking, setSelectedVoucherBooking] = useState<BookingRecord | null>(null);
  const [selectedGstBooking, setSelectedGstBooking] = useState<BookingRecord | null>(null);
  const [selectedChecklistBooking, setSelectedChecklistBooking] = useState<BookingRecord | null>(null);
  const [supportModalBooking, setSupportModalBooking] = useState<BookingRecord | null>(null);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [voucherDownloadSuccess, setVoucherDownloadSuccess] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'bookings' | 'downline' | 'leaderboard'>('bookings');
  const [showAffiliateGuide, setShowAffiliateGuide] = useState(false);
  const [showMarketingKit, setShowMarketingKit] = useState(false);

  // Close open modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAffiliateGuide) {
          setShowAffiliateGuide(false);
        } else if (showMarketingKit) {
          setShowMarketingKit(false);
        } else if (selectedGstBooking) {
          setSelectedGstBooking(null);
        } else if (selectedChecklistBooking) {
          setSelectedChecklistBooking(null);
        } else if (selectedVoucherBooking) {
          setSelectedVoucherBooking(null);
        } else if (supportModalBooking) {
          setSupportModalBooking(null);
          setCallbackRequested(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAffiliateGuide, showMarketingKit, selectedGstBooking, selectedChecklistBooking, selectedVoucherBooking, supportModalBooking]);

  const handleDownloadTicketFile = (b: BookingRecord) => {
    const ticketHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>YatraSafar Official E-Ticket - ${b.pnrNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; background: #f8fafc; }
    .ticket { max-width: 650px; margin: 0 auto; background: white; border: 2px solid #0284c7; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 900; color: #0284c7; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; }
    .pnr-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .pnr-num { font-size: 20px; font-weight: 900; font-family: monospace; color: #0f766e; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
    .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .field-val { font-size: 15px; font-weight: 800; color: #1e293b; margin-top: 2px; }
    .passengers { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div>
        <div class="brand">✈️ YatraSafar Holidays</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Guaranteed Flight Departure E-Voucher</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">CONFIRMED &amp; TICKETED</span>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Ref: ${b.bookingRef}</div>
      </div>
    </div>
    <div class="pnr-box">
      <div>
        <div class="field-label">Official Airline PNR</div>
        <div class="pnr-num">${b.pnrNumber}</div>
      </div>
      <div style="text-align: right;">
        <div class="field-label">Status</div>
        <div style="font-weight: 800; color: #0369a1;">${b.bookingStatus}</div>
      </div>
    </div>
    <div class="grid">
      <div><div class="field-label">Package</div><div class="field-val">${b.packageTitle}</div></div>
      <div><div class="field-label">Route</div><div class="field-val">${b.departureCity} ✈️ ${b.destination}</div></div>
      <div><div class="field-label">Travel Date</div><div class="field-val">${b.departureDate}</div></div>
      <div><div class="field-label">Total Amount Paid</div><div class="field-val">₹${b.totalAmount.toLocaleString('en-IN')}</div></div>
    </div>
    <div class="passengers">
      <div class="field-label">Confirmed Travelers:</div>
      <div style="margin-top: 8px; font-weight: 700; color: #1e293b;">
        ${b.passengers.map(p => `• ${p.name} (${p.gender}, ${p.age} yrs)`).join('<br>')}
      </div>
    </div>
    <div class="footer">
      Support Helpline: 1800-270-0888 • 24x7 Airport Assistance • Present with valid Govt ID
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([ticketHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YatraSafar-Ticket-${b.pnrNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setVoucherDownloadSuccess(true);
    setTimeout(() => setVoucherDownloadSuccess(false), 3000);
  };

  // Compute active user record
  const activeUser = currentUserRecord || allUsers.find(u => u.referralCode === referralCode) || (allUsers.length > 0 ? allUsers[0] : null);

  // Compute downline count
  const myDownlineList = allUsers.filter(u => u.referredBy === referralCode);
  const myDownlineBookedCount = myDownlineList.filter(u => (u.totalBookings || 0) > 0).length;

  // If user is not logged in, show Auth Gatekeeper
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 font-display">
              Login Required for "My Bookings"
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Please sign in or create an account to view your bookings, confirmed flight fixed departure tickets, PNR status, and e-vouchers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Login</span>
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Create New Account</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Verified PNR</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-sky-600" />
              <span>Instant E-Tickets</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const userInitials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'TR';

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.bookingStatus === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Profile & KPI Summary Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-sky-500/20 font-display">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-display">{currentUser.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {currentUser.role === 'admin' ? '🛡️ Admin Verified' : '⭐ Verified Traveler'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.email} {currentUser.phone ? `• ${currentUser.phone}` : ''}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">Your Referral Code:</span>
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                {referralCode}
              </span>
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Trips</span>
            <span className="text-xl font-extrabold text-slate-900 font-display">{bookings.length}</span>
          </div>

          <div 
            onClick={onNavigateToRefer}
            className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center cursor-pointer hover:bg-amber-100 transition"
          >
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Wallet Cash</span>
            <span className="text-xl font-extrabold text-amber-900 font-display">₹{walletBalance.toLocaleString('en-IN')}</span>
          </div>

          <div 
            onClick={onNavigateToRefer}
            className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center cursor-pointer hover:bg-emerald-100 transition"
          >
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Ref Earned</span>
            <span className="text-xl font-extrabold text-emerald-900 font-display">₹{totalEarnings.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD PRIMARY NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveDashboardTab('bookings')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeDashboardTab === 'bookings'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>My Holiday Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('downline')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeDashboardTab === 'downline'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>My Downline Network & Referrals</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-sky-500 text-white">
            {myDownlineList.length} Members
          </span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('leaderboard')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeDashboardTab === 'leaderboard'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-200" />
          <span>Promoter Leaderboard</span>
        </button>

        <button
          onClick={() => setShowMarketingKit(true)}
          className="sm:ml-auto px-3.5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-1.5 transition shadow-xs cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-emerald-100" />
          <span>Promoter Marketing Kit</span>
        </button>
      </div>

      {/* VIEW: Downline Network tab */}
      {activeDashboardTab === 'downline' && activeUser && (
        <UserDownlineNetwork
          currentUserRecord={activeUser}
          allUsers={allUsers}
          referralSettings={referralSettings}
          onSwitchUser={onSwitchUser}
          onSimulateReferralForUser={onSimulateReferralForUser}
        />
      )}

      {/* VIEW: Promoter Leaderboard tab */}
      {activeDashboardTab === 'leaderboard' && (
        <AffiliateLeaderboard
          allUsers={allUsers}
          currentUserRecord={activeUser}
        />
      )}

      {/* VIEW: Bookings tab */}
      {activeDashboardTab === 'bookings' && (
        <>
          <div className="space-y-4">
          {/* Quick Downline Summary Strip */}
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block text-sm">
                  My Downline Team: {myDownlineList.length} Travelers Enrolled
                </span>
                <span className="text-slate-600">
                  {myDownlineBookedCount} completed 1st holiday booking • {myDownlineList.length - myDownlineBookedCount} bookings pending
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAffiliateGuide(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-xs shadow-xs cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Affiliate Guide</span>
              </button>
              <button
                onClick={() => setActiveDashboardTab('downline')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-xs shadow-xs cursor-pointer"
              >
                <span>View My Downline Tree & Referrals</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">My Holiday Bookings</h3>
              <p className="text-xs text-slate-500">Track flight fixed departures, download vouchers and manage reservations</p>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setFilter('Confirmed')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === 'Confirmed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilter('Cancelled')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === 'Cancelled' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Plane className="w-6 h-6 -rotate-45" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No bookings found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't booked any holiday packages yet. Explore our flight fixed departures and book your dream vacation!
            </p>
            <button
              onClick={onNavigateToPackages}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-xs inline-flex items-center gap-2"
            >
              <span>Explore Holiday Packages</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5"
              >
                {/* Left Flight & Package Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {b.packageType === 'domestic' ? 'Domestic' : 'International'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Ref: {b.bookingRef}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{b.bookingStatus}</span>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {b.packageTitle}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      <span>Departure: <strong>{b.departureDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-sky-600 -rotate-45" />
                      <span>PNR: <strong className="font-mono text-sky-800">{b.pnrNumber}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>From: {b.departureCity}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Travelers: {b.passengers.map(p => p.name).join(', ')} ({b.passengerCount.adults} Adults)
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 shrink-0 gap-3">
                  <div className="text-left md:text-right">
                    {b.paymentType === 'TokenDeposit' ? (
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
                          Token Advance (25% Paid)
                        </span>
                        <div className="text-lg font-extrabold text-slate-900 font-display">
                          ₹{(b.amountPaid ?? Math.round(b.totalAmount * 0.25)).toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">paid</span>
                        </div>
                        <p className="text-[11px] text-amber-700 font-medium">
                          Balance ₹{(b.balanceDue ?? (b.totalAmount - Math.round(b.totalAmount * 0.25))).toLocaleString('en-IN')} due before trip
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] text-slate-400 block">Total Paid (All-Inclusive)</span>
                        <div className="text-xl font-extrabold text-slate-900 font-display">
                          ₹{b.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">Payment: {b.paymentMethod} (Full Settlement)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                    <button
                      onClick={() => setSelectedVoucherBooking(b)}
                      className="py-1.5 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      title="View Flight & Hotel Voucher"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Voucher</span>
                    </button>
                    <button
                      onClick={() => setSelectedGstBooking(b)}
                      className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      title="View Official GST Tax Invoice"
                    >
                      <span className="text-emerald-400 font-bold text-[10px]">GST</span>
                      <span>Invoice</span>
                    </button>
                    <button
                      onClick={() => setSelectedChecklistBooking(b)}
                      className="py-1.5 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                      title="View Pre-Departure Checklist & Documents"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Checklist</span>
                    </button>
                    <button
                      onClick={() => setSupportModalBooking(b)}
                      className="py-1.5 px-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      title="Contact Tour Support"
                    >
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      <span>Help</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Travel Document Vault */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <h4 className="font-bold text-slate-900 text-base">Travel Document & KYC Vault</h4>
          </div>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
            ✓ Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Government ID</span>
            <p className="font-bold text-slate-800">Aadhaar Card (•••• 9842)</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Valid for Domestic Flights</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Passport Status</span>
            <p className="font-bold text-slate-800">Indian Passport (Z•••••84)</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Valid till Nov 2031</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Travel Insurance</span>
            <p className="font-bold text-slate-800">Complimentary Policy Active</p>
            <span className="text-[10px] text-sky-600 font-semibold">Covers Medical & Baggage</span>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Voucher Modal */}
      {selectedVoucherBooking && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedVoucherBooking(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg font-display">Official E-Ticket & Voucher</h3>
                <p className="text-xs text-slate-500 font-mono">Booking Ref: {selectedVoucherBooking.bookingRef}</p>
              </div>
              <button 
                onClick={() => setSelectedVoucherBooking(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close voucher"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-slate-900">{selectedVoucherBooking.packageTitle}</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {selectedVoucherBooking.bookingStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-slate-500 block">Flight PNR</span>
                  <span className="font-extrabold text-sky-700 font-mono text-sm">{selectedVoucherBooking.pnrNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Departure Date</span>
                  <span className="font-bold text-slate-900">{selectedVoucherBooking.departureDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">From City</span>
                  <span className="font-bold text-slate-900">{selectedVoucherBooking.departureCity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Destination</span>
                  <span className="font-bold text-slate-900">{selectedVoucherBooking.destination}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Confirmed Travelers:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedVoucherBooking.passengers.map((p, i) => (
                    <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-800">
                      {p.name} ({p.gender}, {p.age} yrs)
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-sky-700">₹{selectedVoucherBooking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {voucherDownloadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>E-Ticket downloaded to your device!</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedGstBooking(selectedVoucherBooking);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>GST Tax Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedChecklistBooking(selectedVoucherBooking);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-purple-200" />
                <span>Travel Checklist</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTicketFile(selectedVoucherBooking)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download E-Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Support Modal for Booking */}
      {supportModalBooking && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSupportModalBooking(null);
              setCallbackRequested(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Booking Assistance</h3>
                  <p className="text-[11px] text-slate-500 font-mono">PNR: {supportModalBooking.pnrNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSupportModalBooking(null);
                  setCallbackRequested(false);
                }} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close assistance"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 space-y-1">
                <p className="font-bold text-sky-950">{supportModalBooking.packageTitle}</p>
                <p className="text-slate-600">Travel Date: {supportModalBooking.departureDate} • Route: {supportModalBooking.departureCity} ✈️ {supportModalBooking.destination}</p>
              </div>

              <div className="space-y-2">
                <a
                  href="tel:18002700888"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Call Toll-Free Helpline: 1800-270-0888</span>
                </a>

                {callbackRequested ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Callback requested! Tour manager will call within 15 mins.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCallbackRequested(true)}
                    className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>Request Immediate Callback from Tour Officer</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setSupportModalBooking(null);
                  setCallbackRequested(false);
                }}
                className="text-xs text-slate-500 font-bold hover:underline"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AFFILIATE PROGRAM GUIDE MODAL */}
      <AffiliateProgramGuide
        isOpen={showAffiliateGuide}
        onClose={() => setShowAffiliateGuide(false)}
        referralSettings={referralSettings}
        userTier={activeUser?.isAgent ? 'Agent' : activeUser?.isPartner ? 'Partner' : 'Client'}
        directBookingsCount={activeUser?.directReferralsBookedCount ?? 0}
        downlinePartnersCount={activeUser?.downlinePartnersCount ?? 0}
        referralCode={referralCode}
        onNavigateToRefer={onNavigateToRefer}
      />

      {/* GST INVOICE MODAL */}
      {selectedGstBooking && (
        <GstInvoiceModal
          booking={selectedGstBooking}
          onClose={() => setSelectedGstBooking(null)}
        />
      )}

      {/* TRAVEL READINESS CHECKLIST MODAL */}
      {selectedChecklistBooking && (
        <TravelChecklistModal
          booking={selectedChecklistBooking}
          onClose={() => setSelectedChecklistBooking(null)}
        />
      )}

      {/* AFFILIATE MARKETING KIT & SHARING MODAL */}
      {showMarketingKit && (
        <AffiliateMarketingKitModal
          referralCode={referralCode}
          userTier={activeUser?.isAgent ? 'Agent' : activeUser?.isPartner ? 'Partner' : 'Client'}
          onClose={() => setShowMarketingKit(false)}
        />
      )}
    </div>
  );
};
