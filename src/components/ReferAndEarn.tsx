import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Wallet, 
  ArrowUpRight, 
  Users, 
  Coins, 
  Trophy, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Star,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Award,
  Crown,
  GitBranch,
  FileText,
  X
} from 'lucide-react';
import { AdminUserRecord, ReferralRecord, ReferralSettings } from '../types/travel';
import { UserDownlineNetwork } from './UserDownlineNetwork';
import { AffiliateProgramGuide } from './AffiliateProgramGuide';
import { calculateBonusExpiry } from '../utils/bonusExpiry';

interface ReferAndEarnProps {
  referralCode: string;
  referrals: ReferralRecord[];
  walletBalance: number;
  holdBalance?: number;
  totalEarnings: number;
  isPartner?: boolean;
  directReferralsBookedCount?: number;
  isAgent?: boolean;
  downlinePartnersCount?: number;
  onWithdrawWallet: (amount: number, upiOrBank: string) => void;
  referralSettings?: ReferralSettings;
  onSimulateReferral?: () => void;
  onSimulateDownlineReferral?: () => void;
  onSimulateDownlinePartnerUpgrade?: () => void;
  allUsers?: AdminUserRecord[];
  currentUserRecord?: AdminUserRecord;
  onSwitchUser?: (user: AdminUserRecord) => void;
  onSimulateReferralForUser?: (targetCode: string) => void;
}

export const ReferAndEarn: React.FC<ReferAndEarnProps> = ({
  referralCode,
  referrals,
  walletBalance,
  holdBalance = 0,
  totalEarnings,
  isPartner = false,
  directReferralsBookedCount = 0,
  isAgent = false,
  downlinePartnersCount = 0,
  onWithdrawWallet,
  referralSettings,
  onSimulateReferral,
  onSimulateDownlineReferral,
  onSimulateDownlinePartnerUpgrade,
  allUsers = [],
  currentUserRecord,
  onSwitchUser,
  onSimulateReferralForUser,
}) => {
  const referrerReward = referralSettings?.referrerReward ?? 1500;
  const refereeReward = referralSettings?.refereeReward ?? 500;
  const partnerThreshold = referralSettings?.partnerRequiredDirectBookings ?? 10;
  const partnerOverrideBonus = referralSettings?.partnerIndirectReferralBonus ?? 100;
  const agentNetworkBonus = referralSettings?.agentNetworkBonus ?? 250;
  const isHoldPolicyActive = referralSettings?.holdUntilFirstBooking ?? true;
  const referralValidityDays = referralSettings?.referralBonusValidityDays ?? 90;
  const expiryNotificationDays = referralSettings?.bonusExpiryNotificationDays ?? 7;

  // Simulator states for Affiliate Career Roadmap
  const [simDirectCount, setSimDirectCount] = useState(10);
  const [simDownlineCount, setSimDownlineCount] = useState(25);

  // Sub-tabs in Refer & Earn: default to 'network' (My Downline Users & Team)
  const [activeTab, setActiveTab] = useState<'network' | 'roadmap' | 'share' | 'transactions'>('network');

  const [copied, setCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAffiliateGuideModal, setShowAffiliateGuideModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(walletBalance > 0 ? walletBalance : referrerReward);
  const [withdrawUpi, setWithdrawUpi] = useState('user@upi');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Close open modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAffiliateGuideModal) {
          setShowAffiliateGuideModal(false);
        } else if (showWithdrawModal) {
          setShowWithdrawModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAffiliateGuideModal, showWithdrawModal]);

  // Active user record fallback
  const activeUser = currentUserRecord || allUsers.find(u => u.referralCode === referralCode) || {
    id: 'usr-101',
    name: 'Ganesh Labana',
    email: 'labanaganesh@gmail.com',
    phone: '+91 98765 43210',
    role: 'admin' as const,
    status: 'active' as const,
    tier: 'Diamond' as const,
    walletBalance,
    holdBalance,
    referralCode,
    totalBookings: 3,
    totalSpent: 120000,
    joinedDate: '10 Jan 2026',
    city: 'Mumbai',
    isPartner,
    isAgent,
    downlinePartnersCount,
    directReferralsBookedCount,
  };

  // Count downline members for badge
  const downlineCount = allUsers.filter(u => u.referredBy === referralCode).length;

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `✈️ Join YatraSafar using my invite link and get an instant ₹${refereeReward} Welcome Cash in your wallet for holiday package bookings with Guaranteed Flights! Link: ${referralLink}`
    );
    try {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    } catch (e) {
      // Fallback in sandboxed environment
    }
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > walletBalance || withdrawAmount <= 0) {
      setWithdrawError(`Withdrawal amount cannot exceed available wallet balance (Max ₹${walletBalance.toLocaleString('en-IN')}).`);
      return;
    }
    setWithdrawError(null);
    onWithdrawWallet(withdrawAmount, withdrawUpi);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
    }, 1800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-amber-100 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>YatraSafar Share & Earn Rewards Program</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
            Invite Friends & Earn <span className="underline decoration-amber-300">₹{referrerReward.toLocaleString('en-IN')} Cash</span> per Referral!
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-amber-100 leading-relaxed">
            Your friend receives <strong>₹{refereeReward.toLocaleString('en-IN')} instant welcome wallet cash</strong> when signing up via your link. Once they complete their <strong>1st holiday booking</strong>, your reward unlocks immediately into Available Cash!
          </p>

          {/* Referral Code & Share Container */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white rounded-xl p-1.5 shadow-md border border-amber-200">
              <span className="text-slate-400 text-xs font-medium px-2 uppercase tracking-wider">Your Code:</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm sm:text-base px-2">
                {referralCode}
              </span>
              <button
                onClick={handleCopy}
                className="ml-auto px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Direct Link</span>
            </button>

            {onSimulateReferral && (
              <button
                onClick={onSimulateReferral}
                className="px-4 py-3 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                title="Test simulation of friend joining via link"
              >
                <Sparkles className="w-4 h-4 text-amber-800" />
                <span>Test: Friend Joins (Hold ₹{referrerReward})</span>
              </button>
            )}

            {isPartner && onSimulateDownlineReferral && (
              <button
                onClick={onSimulateDownlineReferral}
                className="px-4 py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition border border-amber-400/40"
                title="Simulate downline member referring someone"
              >
                <Star className="w-4 h-4 fill-amber-400" />
                <span>Test: Downline Ref (₹{partnerOverrideBonus} Hold)</span>
              </button>
            )}

            {!isAgent && onSimulateDownlinePartnerUpgrade && (
              <button
                onClick={onSimulateDownlinePartnerUpgrade}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition border border-amber-300"
                title="Simulate downline member reaching 10 direct bookings & becoming Partner -> Promotes you UP to Agent!"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>Test: Downline Becomes Partner (You ➔ Agent!)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HOLD POLICY BANNER */}
      {isHoldPolicyActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Security & Fair Booking Rule Active</span>
              <span className="text-amber-800">
                Referral rewards remain securely stored in <strong>Hold Balance</strong> until your referred traveler confirms their <strong>1st holiday booking</strong>. Once booked, the amount immediately unlocks into <strong>Available Wallet Cash</strong>!
              </span>
            </div>
          </div>
          <span className="shrink-0 font-bold bg-amber-200/80 text-amber-950 px-3 py-1.5 rounded-xl text-center">
            Auto-Release on 1st Booking
          </span>
        </div>
      )}

      {/* Wallet Balance & Earnings Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Available Wallet Balance Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Wallet Cash</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-emerald-600 font-display">
              ₹{walletBalance.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Bank Payout
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 py-1 border-t border-slate-100 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Amount Validity:</span>
            </span>
            <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              {referralValidityDays === 0 ? 'Lifetime (No Expiry)' : `${referralValidityDays} Days`}
            </span>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={walletBalance <= 0}
            className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Transfer to Bank</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. HOLD Balance Card (Waiting for 1st booking) */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col justify-between bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">On Hold Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-amber-600 font-display">
              ₹{holdBalance.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-amber-800 font-medium mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Awaiting friend 1st booking
            </p>
          </div>
          <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-xl">
            Unlocks automatically to Available Cash on booking!
          </div>
        </div>

        {/* 3. Total Lifetime Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Referral Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 font-display">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              From {referrals.length} friends & downlines
            </p>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
            Earn ₹{referrerReward.toLocaleString('en-IN')} on every direct booking!
          </div>
        </div>

        {/* 4. Career Tier Status Card (Client -> Partner -> Agent) */}
        <div className={`rounded-2xl p-5 border shadow-xs flex flex-col justify-between ${
          isAgent 
            ? 'bg-amber-500/10 border-amber-300 ring-2 ring-amber-400/20' 
            : isPartner 
            ? 'bg-purple-50/40 border-purple-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isAgent ? 'text-amber-900' : isPartner ? 'text-purple-900' : 'text-slate-600'
            }`}>
              Career Hierarchy Tier
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isAgent ? 'bg-amber-400 text-slate-950 font-black' : isPartner ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {isAgent ? <Crown className="w-4 h-4 fill-slate-950" /> : <Star className="w-4 h-4 fill-current" />}
            </div>
          </div>
          <div className="my-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-slate-900 font-display">
                {isAgent ? 'Certified Travel Agent' : isPartner ? 'Affiliate Partner' : 'Client (Traveler)'}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isAgent ? 'bg-amber-400 text-slate-950 font-black' : isPartner ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isAgent ? 'Top Rank' : isPartner ? 'Partner Level' : 'Level 1'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isAgent ? (
                <span className="text-amber-900 font-bold">
                  👑 Downline Partner Trigger Achieved! Earning ₹{agentNetworkBonus} Agency Override per referral.
                </span>
              ) : isPartner ? (
                <span className="text-purple-900 font-semibold">
                  🌟 Earning ₹{partnerOverrideBonus} override. Downline partners: {downlinePartnersCount}/1 to become Agent!
                </span>
              ) : (
                <span>
                  {directReferralsBookedCount} of {partnerThreshold} 1st bookings completed toward Partner
                </span>
              )}
            </p>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isAgent ? 'bg-amber-500' : isPartner ? 'bg-purple-600' : 'bg-sky-600'}`}
                style={{ 
                  width: isAgent 
                    ? '100%' 
                    : isPartner 
                    ? `${Math.min(100, (downlinePartnersCount / 1) * 100 || 50)}%` 
                    : `${Math.min(100, (directReferralsBookedCount / partnerThreshold) * 100)}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>{isAgent ? 'Max Rank Reached' : isPartner ? `${downlinePartnersCount} Downline Partners` : `${directReferralsBookedCount} Bookings`}</span>
              <span>{isAgent ? '👑 Agent Active' : isPartner ? '1 Downline Partner = Agent' : `${partnerThreshold - directReferralsBookedCount} More Bookings`}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAffiliateGuideModal(true)}
              className="pt-2 text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer transition border-t border-slate-100"
            >
              <span>View Affiliate Hierarchy Guide</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('network')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'network'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>My Downline & Team</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-sky-500 text-white">
            {allUsers.filter(u => u.referredBy === referralCode).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'roadmap'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Career Hierarchy & Rules</span>
          {isAgent && <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">Agent</span>}
          {isPartner && !isAgent && <span className="text-[10px] bg-purple-400 text-slate-950 font-black px-1.5 py-0.5 rounded">Partner</span>}
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'share'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4 text-white" />
          <span>Invite & Share Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-300" />
          <span>Transaction Logs ({referrals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAffiliateGuideModal(true)}
          className="ml-auto px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Affiliate Program Guide</span>
        </button>
      </div>

      {/* TAB 1: USER DOWNLINE NETWORK (FULL SCOPE) */}
      {activeTab === 'network' && (
        <UserDownlineNetwork
          currentUserRecord={activeUser}
          allUsers={allUsers}
          referralSettings={referralSettings}
          onSwitchUser={onSwitchUser}
          onSimulateReferralForUser={onSimulateReferralForUser}
        />
      )}

      {/* TAB 2: CAREER PROGRESSION ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-purple-800/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Crown className="w-4 h-4 fill-amber-400" />
                  <span>Official Affiliate Career & Level Advancement Program</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display mt-1 text-white">
                  3-Tier Growth Hierarchy: How You Level Up & What You Earn
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAffiliateGuideModal(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Progression Guide</span>
                </button>
                <div className="bg-amber-400/20 border border-amber-400/40 px-3.5 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-amber-200 block font-medium">Partner Override</span>
                  <span className="text-base font-extrabold text-amber-300 font-mono">₹{partnerOverrideBonus} / Downline</span>
                </div>
                <div className="bg-emerald-400/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-200 block font-medium">Agent Network Bonus</span>
                  <span className="text-base font-extrabold text-emerald-300 font-mono">₹{agentNetworkBonus} / Booking</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-4xl">
              YatraSafar Holidays rewards travelers and creators through an automated multi-tier progression model. You start as a <strong>Client</strong>, upgrade to an <strong>Affiliate Partner</strong> by driving bookings, and elevate to a <strong>Certified Travel Agent</strong> as your community prospers.
            </p>

            {/* 3 TIERS PROGRESSION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Level 1: Client */}
              <div className="bg-white/10 backdrop-blur-xs border border-sky-400/30 rounded-2xl p-5 space-y-3 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
                      Level 1
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">Auto Enrolled</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-2 flex items-center gap-2">
                    <span>Verified Client</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Initial tier assigned to all registered users upon signup.
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Direct Referral Reward</span>
                      <span className="text-sm font-extrabold text-sky-300">₹{referrerReward.toLocaleString('en-IN')} Cash</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Credited to HOLD; unlocks when friend makes 1st booking</p>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Friend's Joining Bonus</span>
                      <span className="text-sm font-extrabold text-emerald-300">₹{refereeReward.toLocaleString('en-IN')} Welcome Gift</span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Downline Team Overrides</span>
                      <span className="text-xs text-rose-300 font-semibold">Locked (Upgrade to Partner)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-[11px] text-sky-200">
                  <strong>Upgrade Rule:</strong> Complete {partnerThreshold} direct referrals with bookings to reach Partner.
                </div>
              </div>

              {/* Level 2: Affiliate Partner */}
              <div className="bg-white/10 backdrop-blur-xs border-2 border-purple-400/50 rounded-2xl p-5 space-y-3 relative flex flex-col justify-between shadow-lg shadow-purple-900/30">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/40">
                      Level 2 (Pro)
                    </span>
                    <span className="text-[11px] text-amber-300 font-bold">⭐ Recommended</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-2 flex items-center gap-2">
                    <span>Affiliate Partner</span>
                  </h4>
                  <p className="text-xs text-purple-200 mt-1">
                    Achieved after {partnerThreshold} direct referrals complete their 1st holiday booking.
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-700/40">
                      <span className="text-purple-300 block text-[10px] uppercase font-bold">Direct Referral Reward</span>
                      <span className="text-sm font-extrabold text-white">₹{referrerReward.toLocaleString('en-IN')} / Booking</span>
                    </div>
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-700/40">
                      <span className="text-amber-300 block text-[10px] uppercase font-bold">Passive Downline Override</span>
                      <span className="text-sm font-extrabold text-amber-300">₹{partnerOverrideBonus} / Every Referral</span>
                      <p className="text-[10px] text-purple-200 mt-0.5">Earned on all bookings made across your downline team</p>
                    </div>
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-700/40">
                      <span className="text-purple-300 block text-[10px] uppercase font-bold">Exclusive Partner Perks</span>
                      <span className="text-xs text-purple-100 block">✓ Official Partner Certificate</span>
                      <span className="text-xs text-purple-100 block">✓ Dedicated Relationship Desk</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-400/20 text-[11px] text-purple-200">
                  <strong>Upgrade Rule:</strong> When any downline member reaches 10 bookings, you elevate to Agent!
                </div>
              </div>

              {/* Level 3: Certified Travel Agent */}
              <div className="bg-white/10 backdrop-blur-xs border-2 border-amber-400/60 rounded-2xl p-5 space-y-3 relative flex flex-col justify-between shadow-lg shadow-amber-900/30">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-400/40">
                      Level 3 (Elite)
                    </span>
                    <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mt-2 flex items-center gap-2">
                    <span>Certified Travel Agent</span>
                  </h4>
                  <p className="text-xs text-amber-200 mt-1">
                    Unlocked when a downline member qualifies as an Affiliate Partner!
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="bg-amber-950/60 p-2.5 rounded-xl border border-amber-700/40">
                      <span className="text-amber-300 block text-[10px] uppercase font-bold">All Direct & Partner Overrides</span>
                      <span className="text-sm font-extrabold text-white">₹{referrerReward} + ₹{partnerOverrideBonus} / ref</span>
                    </div>
                    <div className="bg-amber-950/60 p-2.5 rounded-xl border border-amber-700/40">
                      <span className="text-emerald-300 block text-[10px] uppercase font-bold">Agency Network Super Bonus</span>
                      <span className="text-sm font-extrabold text-emerald-300">₹{agentNetworkBonus} / Booking</span>
                      <p className="text-[10px] text-amber-200 mt-0.5">Continuous agency commission on all holiday packages</p>
                    </div>
                    <div className="bg-amber-950/60 p-2.5 rounded-xl border border-amber-700/40">
                      <span className="text-amber-300 block text-[10px] uppercase font-bold">Elite Agent Credentials</span>
                      <span className="text-xs text-amber-100 block">✓ Wholesale Flight & Hotel Tariffs</span>
                      <span className="text-xs text-amber-100 block">✓ Verified Agency Seal & VIP Support</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-400/20 text-[11px] text-amber-300 font-bold">
                  Top Tier: Highest recurring earning potential in travel!
                </div>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE COMPARISON MATRIX TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-600" />
                <span>Level-by-Level Earnings & Privilege Matrix</span>
              </h4>
              <p className="text-xs text-slate-500">
                Detailed breakdown of benefits, commission rates, and requirements across all 3 levels.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Feature / Benefit</th>
                    <th className="p-3 text-sky-900 font-extrabold">Level 1: Client</th>
                    <th className="p-3 text-purple-900 font-extrabold bg-purple-50/50">Level 2: Affiliate Partner</th>
                    <th className="p-3 text-amber-950 font-extrabold bg-amber-50/50">Level 3: Travel Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Eligibility Requirement</td>
                    <td className="p-3">Signup / Registration</td>
                    <td className="p-3 bg-purple-50/30 font-semibold">{partnerThreshold} Direct 1st Bookings</td>
                    <td className="p-3 bg-amber-50/30 font-semibold">1 Downline Partner with 10 Bookings</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Direct Referral Reward</td>
                    <td className="p-3 font-semibold text-emerald-700">₹{referrerReward.toLocaleString('en-IN')} (Hold ➔ Cash)</td>
                    <td className="p-3 bg-purple-50/30 font-semibold text-emerald-700">₹{referrerReward.toLocaleString('en-IN')} (Hold ➔ Cash)</td>
                    <td className="p-3 bg-amber-50/30 font-semibold text-emerald-700">₹{referrerReward.toLocaleString('en-IN')} (Hold ➔ Cash)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Downline Team Override Bonus</td>
                    <td className="p-3 text-slate-400">✗ Not eligible</td>
                    <td className="p-3 bg-purple-50/30 font-extrabold text-purple-700">₹{partnerOverrideBonus} per referral</td>
                    <td className="p-3 bg-amber-50/30 font-extrabold text-purple-700">₹{partnerOverrideBonus} per referral</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Agency Network Super Bonus</td>
                    <td className="p-3 text-slate-400">✗ Not eligible</td>
                    <td className="p-3 bg-purple-50/30 text-slate-400">✗ Not eligible</td>
                    <td className="p-3 bg-amber-50/30 font-extrabold text-amber-700">₹{agentNetworkBonus} per booking</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Referral Amount Validity</td>
                    <td className="p-3 font-medium">{referralValidityDays === 0 ? 'Lifetime (No Expiry)' : `${referralValidityDays} Days`}</td>
                    <td className="p-3 bg-purple-50/30 font-medium">{referralValidityDays === 0 ? 'Lifetime (No Expiry)' : `${referralValidityDays} Days`}</td>
                    <td className="p-3 bg-amber-50/30 font-medium">{referralValidityDays === 0 ? 'Lifetime (No Expiry)' : `${referralValidityDays} Days`}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Official Certification</td>
                    <td className="p-3 text-slate-400">Traveler Pass</td>
                    <td className="p-3 bg-purple-50/30 font-semibold text-purple-900">Official Partner Certificate</td>
                    <td className="p-3 bg-amber-50/30 font-semibold text-amber-900">Certified Agency Seal</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Support Level</td>
                    <td className="p-3">Standard Support</td>
                    <td className="p-3 bg-purple-50/30">Priority WhatsApp Desk</td>
                    <td className="p-3 bg-amber-50/30 font-semibold text-amber-900">Dedicated Account Manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* INTERACTIVE EARNINGS SIMULATOR */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-sm space-y-4">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Earnings Calculator & Potential Simulator</span>
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-white mt-1">
                Calculate How Much You Can Earn as You Level Up
              </h4>
              <p className="text-xs text-slate-300">
                Adjust direct referrals and team size below to preview your qualified tier and monthly payout potential:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 p-4 rounded-xl space-y-2 border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">1. Direct Referrals with Bookings:</span>
                  <span className="font-extrabold text-amber-300 font-mono text-sm">{simDirectCount} Friends</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={simDirectCount}
                  onChange={(e) => setSimDirectCount(parseInt(e.target.value) || 1)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1</span>
                  <span>10 (Partner Milestone)</span>
                  <span>50</span>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-xl space-y-2 border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">2. Downline Team Referrals:</span>
                  <span className="font-extrabold text-purple-300 font-mono text-sm">{simDownlineCount} Referrals</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={simDownlineCount}
                  onChange={(e) => setSimDownlineCount(parseInt(e.target.value) || 0)}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0</span>
                  <span>50</span>
                  <span>200+</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Box */}
            {(() => {
              const qualifiesPartner = simDirectCount >= partnerThreshold;
              const qualifiesAgent = qualifiesPartner && simDownlineCount >= 10;
              const currentTier = qualifiesAgent ? 'Certified Travel Agent' : qualifiesPartner ? 'Affiliate Partner' : 'Client';

              const directIncome = simDirectCount * referrerReward;
              const overrideIncome = qualifiesPartner ? simDownlineCount * partnerOverrideBonus : 0;
              const agentIncome = qualifiesAgent ? simDownlineCount * agentNetworkBonus : 0;
              const totalEst = directIncome + overrideIncome + agentIncome;

              return (
                <div className="bg-white/15 p-4 rounded-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">Your Projected Status</span>
                    <div className="text-lg font-extrabold text-amber-300 flex items-center gap-2 mt-0.5">
                      {qualifiesAgent ? (
                        <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ) : (
                        <Award className="w-5 h-5 text-purple-300" />
                      )}
                      <span>{currentTier}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Direct: ₹{directIncome.toLocaleString('en-IN')} | Team Overrides: ₹{overrideIncome.toLocaleString('en-IN')} {qualifiesAgent ? `| Agent Bonus: ₹${agentIncome.toLocaleString('en-IN')}` : ''}
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-slate-900/60 p-3 rounded-xl border border-white/10 min-w-[180px]">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Estimated Earning</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{totalEst.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Direct to your Bank Account</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* REFERRAL REWARD VALIDITY & EXPIRY NOTICE */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-rose-950 text-sm">
                  Referral Reward Validity: {referralValidityDays === 0 ? 'Lifetime (No Expiry)' : `${referralValidityDays} Days`}
                </h5>
                <p className="text-rose-800 text-xs mt-0.5">
                  {referralValidityDays === 0
                    ? 'Referral bonuses and wallet balances do not expire. They remain securely in your account until withdrawn or used.'
                    : `Unlocked referral rewards remain valid for ${referralValidityDays} days from the date of credit. Automated reminders are dispatched ${expiryNotificationDays} days prior to expiration.`}
                </p>
              </div>
            </div>
            <span className="bg-rose-100 text-rose-900 font-bold px-3 py-1 rounded-xl text-xs shrink-0 self-start sm:self-auto">
              Configurable in Admin Panel
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: SHARE TOOLS & 3-STEP GUIDE */}
      {activeTab === 'share' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-4">
              How It Works (3 Simple Steps)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="font-bold text-sm text-slate-800">Share Your Link & Code</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Share your unique referral link with friends, family, and travel groups via WhatsApp, social media, or SMS.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="font-bold text-sm text-slate-800">Friends Join via Link</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Friends who join with your link instantly receive <strong className="text-emerald-700 font-bold">₹{refereeReward.toLocaleString('en-IN')} Welcome Bonus Cash</strong> in their wallet!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="font-bold text-sm text-slate-800">Unlock Real Cash on 1st Booking</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  As soon as your referred friend completes their 1st holiday booking, your <strong className="text-amber-800 font-bold">₹{referrerReward.toLocaleString('en-IN')} Hold Bonus</strong> unlocks into Available Wallet Cash!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSACTION LOGS */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Referral Track Record & Hold Status</h3>
              <p className="text-xs text-slate-500">Track friends who joined and their 1st booking status</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full self-start sm:self-auto">
              {referrals.length} Total Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Friend Name</th>
                  <th className="py-3 px-4">Tour Package / Referral Tier</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reward Amount</th>
                  <th className="py-3 px-4">1st Booking Status</th>
                  <th className="py-3 px-4">Wallet Status</th>
                  <th className="py-3 px-4">Days Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {referrals.map((ref) => {
                  const isHold = ref.status === 'Hold';
                  const expiry = calculateBonusExpiry(
                    ref.date,
                    ref.validityDays ?? referralValidityDays,
                    ref.extendedDays ?? 0
                  );

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{ref.friendName}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 block">{ref.packageBooked}</span>
                        <span className="text-[10px] text-slate-400">
                          {ref.isIndirect || ref.referredLevel === 2 ? '⚡ Partner Downline Override' : 'Direct Referral'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{ref.date}</td>
                      <td className="py-3.5 px-4 font-bold font-display text-sm">
                        <span className={isHold ? 'text-amber-600' : 'text-emerald-700'}>
                          +₹{ref.amountEarned.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {ref.hasFirstBooking ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>1st Booking Done</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Waiting for 1st Booking</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          !isHold
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isHold ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{isHold ? 'On Hold' : 'Available Cash'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${expiry.badgeClass}`}>
                            {expiry.displayRemaining}
                          </span>
                          {!expiry.isLifetime && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              Exp: {expiry.expiryDateFormatted}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWithdrawModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base font-display">Withdraw Referral Cash</h4>
              <button 
                onClick={() => setShowWithdrawModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close withdrawal modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-sm">Withdrawal Request Submitted!</h5>
                <p className="text-xs text-emerald-700">
                  ₹{withdrawAmount.toLocaleString('en-IN')} is being transferred to <strong>{withdrawUpi}</strong>. Expected turnaround: under 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
                {withdrawError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold">
                    {withdrawError}
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount to Withdraw (Available: ₹{walletBalance.toLocaleString('en-IN')})
                  </label>
                  <input
                    type="number"
                    max={walletBalance}
                    min={100}
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(parseInt(e.target.value) || 0);
                      setWithdrawError(null);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-sm"
                    required
                  />
                  {holdBalance > 0 && (
                    <p className="text-[11px] text-amber-700 mt-1 font-medium">
                      Note: ₹{holdBalance.toLocaleString('en-IN')} is currently on Hold and will be withdrawable once referees complete their 1st booking.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    UPI ID or Bank Account Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mobile@upi or A/C + IFSC"
                    value={withdrawUpi}
                    onChange={(e) => setWithdrawUpi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AFFILIATE PROGRAM GUIDE MODAL */}
      <AffiliateProgramGuide
        isOpen={showAffiliateGuideModal}
        onClose={() => setShowAffiliateGuideModal(false)}
        referralSettings={referralSettings}
        userTier={isAgent ? 'Agent' : isPartner ? 'Partner' : 'Client'}
        directBookingsCount={directReferralsBookedCount}
        downlinePartnersCount={downlinePartnersCount}
        referralCode={referralCode}
        onNavigateToRefer={() => {
          setActiveTab('share');
        }}
      />
    </div>
  );
};
