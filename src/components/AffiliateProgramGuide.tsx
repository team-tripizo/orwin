import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Award, 
  Crown, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Briefcase, 
  Plane, 
  Percent, 
  HelpCircle,
  FileCheck,
  Star,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { ReferralSettings } from '../types/travel';

export interface AffiliateProgramGuideProps {
  isOpen: boolean;
  onClose: () => void;
  referralSettings?: ReferralSettings;
  userTier?: 'Client' | 'Partner' | 'Agent';
  directBookingsCount?: number;
  downlinePartnersCount?: number;
  referralCode?: string;
  onNavigateToRefer?: () => void;
}

export const AffiliateProgramGuide: React.FC<AffiliateProgramGuideProps> = ({
  isOpen,
  onClose,
  referralSettings,
  userTier = 'Client',
  directBookingsCount = 0,
  downlinePartnersCount = 0,
  referralCode = 'YS-GANESH789',
  onNavigateToRefer,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);

  // Dynamic values from referral settings or defaults
  const referrerReward = referralSettings?.referrerReward ?? 1500;
  const refereeReward = referralSettings?.refereeReward ?? 500;
  const partnerRequired = referralSettings?.partnerRequiredDirectBookings ?? 10;
  const partnerOverride = referralSettings?.partnerIndirectReferralBonus ?? 100;
  const agentNetworkBonus = referralSettings?.agentNetworkBonus ?? 250;
  const validityDays = referralSettings?.referralBonusValidityDays ?? 90;

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Set default active tab based on user's current tier
  useEffect(() => {
    if (isOpen) {
      if (userTier === 'Agent') setActiveStep(3);
      else if (userTier === 'Partner') setActiveStep(2);
      else setActiveStep(1);
    }
  }, [isOpen, userTier]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="affiliate-guide-title"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] my-auto overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-5 sm:p-7 relative shrink-0 border-b border-purple-900/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Official Affiliate Career Roadmap</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-medium border border-white/15">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Validity: {validityDays === 0 ? 'Lifetime (No Expiry)' : `${validityDays} Days`}</span>
                </span>
              </div>

              <h2 id="affiliate-guide-title" className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-white tracking-tight">
                How You Level Up & Earn in YatraSafar
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
                Understand the 3-Tier progression hierarchy: start as a <strong>Client</strong>, upgrade to an <strong>Affiliate Partner</strong> at 10 bookings, and graduate to a <strong>Certified Travel Agent</strong> as your downline grows.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
              title="Close (Esc)"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3-STEP VISUAL PROGRESSION BAR / STEP SELECTOR */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-5 border-t border-white/10">
            {/* Step 1 Tab: Client */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`p-2.5 sm:p-3.5 rounded-2xl text-left transition relative border ${
                activeStep === 1
                  ? 'bg-sky-600/30 border-sky-400 text-white ring-2 ring-sky-400/40 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-300">
                  Stage 1
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === 1 ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="font-extrabold text-xs sm:text-sm mt-1 text-white truncate">
                Client (Traveler)
              </div>
              <div className="text-[10px] text-sky-200 truncate mt-0.5">
                ₹{referrerReward} Direct Cash
              </div>
            </button>

            {/* Step 2 Tab: Partner */}
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`p-2.5 sm:p-3.5 rounded-2xl text-left transition relative border ${
                activeStep === 2
                  ? 'bg-purple-600/30 border-purple-400 text-white ring-2 ring-purple-400/40 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-300">
                  Stage 2 (10 Bookings)
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === 2 ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="font-extrabold text-xs sm:text-sm mt-1 text-white truncate">
                Affiliate Partner
              </div>
              <div className="text-[10px] text-purple-200 truncate mt-0.5">
                + ₹{partnerOverride} Team Override
              </div>
            </button>

            {/* Step 3 Tab: Agent */}
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`p-2.5 sm:p-3.5 rounded-2xl text-left transition relative border ${
                activeStep === 3
                  ? 'bg-amber-600/30 border-amber-400 text-white ring-2 ring-amber-400/40 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300">
                  Stage 3 (Elite)
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === 3 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-slate-400'
                }`}>
                  <Crown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="font-extrabold text-xs sm:text-sm mt-1 text-white truncate">
                Certified Travel Agent
              </div>
              <div className="text-[10px] text-amber-200 truncate mt-0.5">
                + ₹{agentNetworkBonus} Agency Bonus
              </div>
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          {/* ACTIVE STAGE CARD INSPECTOR */}
          {activeStep === 1 && (
            <div className="bg-white rounded-2xl border-2 border-sky-300 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase">
                        Stage 1 of 3
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Automatic Free Enrollment</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-0.5">
                      The Registered Client (Traveler)
                    </h3>
                  </div>
                </div>

                <div className="bg-sky-50 px-3.5 py-1.5 rounded-xl border border-sky-200 text-right shrink-0">
                  <span className="text-[10px] font-bold text-sky-700 block uppercase tracking-wider">Per Referral</span>
                  <span className="text-base font-extrabold text-sky-900 font-mono">₹{referrerReward.toLocaleString('en-IN')} Cash</span>
                </div>
              </div>

              {/* How it Works & Qualification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>How You Start</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                      <span>Every traveler is instantly enrolled as a <strong>Verified Client</strong> upon creating an account.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                      <span>You immediately receive a unique shareable referral link & invite code.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                      <span>No deposit, registration fees, or prior bookings are required to start referring!</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span>Earnings & Unlocking Mechanism</span>
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Your Direct Reward:</span>
                      <span className="font-bold text-emerald-700 font-mono">₹{referrerReward.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Friend's Welcome Bonus:</span>
                      <span className="font-bold text-sky-700 font-mono">₹{refereeReward.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <strong>Security Hold Policy:</strong> Reward is initially stored in <em>Hold Balance</em> and unlocks immediately when your friend confirms their <strong>1st holiday booking</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Progression Trigger to Next Level */}
              <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <span className="text-sky-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                    <span>How to Level Up to Stage 2 (Affiliate Partner)</span>
                  </span>
                  <p className="text-xs sm:text-sm font-semibold">
                    Complete <strong>{partnerRequired} direct referrals</strong> who make their 1st holiday booking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 rounded-xl bg-white text-sky-900 hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Preview Partner Perks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="bg-white rounded-2xl border-2 border-purple-400 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                        Stage 2 of 3 (Pro Tier)
                      </span>
                      <span className="text-xs text-amber-600 font-bold">⭐ High Earning Potential</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-0.5">
                      The Affiliate Partner
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 text-right shrink-0">
                    <span className="text-[10px] font-bold text-purple-700 block uppercase tracking-wider">Direct Reward</span>
                    <span className="text-sm font-extrabold text-purple-950 font-mono">₹{referrerReward.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-right shrink-0">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">Team Override</span>
                    <span className="text-sm font-extrabold text-amber-950 font-mono">+ ₹{partnerOverride} / ref</span>
                  </div>
                </div>
              </div>

              {/* The Key Upgrade Benefit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>How You Upgrade</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                      <span>Automatically triggered as soon as your <strong>10th direct referral</strong> completes their first booking.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                      <span>No manual review needed: the system automatically promotes your account and unlocks team commission overrides.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                      <span>Receive an official digital <strong>Verified Partner Certificate</strong>.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Passive Downline Overrides (Level 2 Income)</span>
                  </h4>
                  <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200 space-y-2 text-xs">
                    <p className="text-slate-700">
                      You now earn <strong>₹{partnerOverride} on every single holiday booking</strong> made by anyone referred by your friends (your Level 2 downline network)!
                    </p>
                    <div className="bg-white p-2 rounded-lg border border-purple-100 text-[11px] text-purple-900 font-semibold flex items-center justify-between">
                      <span>Example: 25 bookings from your downline:</span>
                      <span className="font-mono font-bold text-emerald-700">+ ₹2,500 Pure Passive Cash</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progression Trigger to Stage 3 */}
              <div className="bg-gradient-to-r from-purple-700 to-amber-700 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <span className="text-amber-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>How to Evolve to Stage 3 (Certified Travel Agent)</span>
                  </span>
                  <p className="text-xs sm:text-sm font-semibold">
                    When <strong>any member in your downline reaches 10 bookings</strong> and becomes a Partner, you automatically graduate to <strong>Certified Travel Agent</strong>!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Explore Agent Rank</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                    <Crown className="w-6 h-6 fill-amber-500 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                        Stage 3 of 3 (Top Elite Tier)
                      </span>
                      <span className="text-xs text-amber-800 font-extrabold">👑 Highest Payout Hierarchy</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-0.5">
                      The Certified Travel Agent
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-right shrink-0">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">Agency Super Bonus</span>
                    <span className="text-sm font-extrabold text-amber-950 font-mono">+ ₹{agentNetworkBonus} / Booking</span>
                  </div>
                </div>
              </div>

              {/* Agent Benefits & Power */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>How You Evolve into an Agent</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                      <span>You don't just refer—you mentor! When a member in your downline completes 10 bookings and becomes an <strong>Affiliate Partner</strong>, the platform elevates you to <strong>Certified Travel Agent</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                      <span>This ensures leaders who build active communities are rewarded at the highest institutional tier.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Full Agency Privileges & Wholesale Access</span>
                  </h4>
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-amber-950 font-bold">
                      <span>Agency Network Bonus:</span>
                      <span className="font-mono text-emerald-700">₹{agentNetworkBonus} per tour package</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-950 font-bold">
                      <span>Partner Override:</span>
                      <span className="font-mono text-emerald-700">₹{partnerOverride} per downline ref</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-950 font-bold">
                      <span>Direct Referral Bonus:</span>
                      <span className="font-mono text-emerald-700">₹{referrerReward} per direct booking</span>
                    </div>
                    <p className="text-[11px] text-amber-900 pt-1 border-t border-amber-200">
                      ✓ Wholesale Group Flight Allocations • Dedicated B2B Desk • Gold Agency Seal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP-BY-STEP PROGRESSION FLOWCHART */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Visual Career Progression Flow</span>
            </h4>

            <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative">
              {/* Box 1 */}
              <div className="flex-1 w-full bg-sky-50 border border-sky-200 rounded-2xl p-3.5 space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-200/60 px-2 py-0.5 rounded">
                    Level 1
                  </span>
                  <UserCheck className="w-4 h-4 text-sky-600" />
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">Client (Traveler)</h5>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Earn <strong>₹{referrerReward}</strong> on direct referrals (stored in Hold; unlocks on 1st booking).
                </p>
              </div>

              {/* Connecting Arrow 1 */}
              <div className="flex flex-col items-center justify-center shrink-0 px-1 py-2 md:py-0 text-purple-600">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full whitespace-nowrap mb-1">
                  10 Bookings
                </span>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-5 h-5 hidden md:block" />
                  <span className="text-xs font-bold md:hidden">▼ Downline Milestone</span>
                </div>
              </div>

              {/* Box 2 */}
              <div className="flex-1 w-full bg-purple-50 border border-purple-200 rounded-2xl p-3.5 space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded">
                    Level 2
                  </span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">Affiliate Partner</h5>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Earn <strong>₹{partnerOverride} override</strong> on all bookings made across your downline network!
                </p>
              </div>

              {/* Connecting Arrow 2 */}
              <div className="flex flex-col items-center justify-center shrink-0 px-1 py-2 md:py-0 text-amber-600">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full whitespace-nowrap mb-1">
                  Downline ➔ Partner
                </span>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-5 h-5 hidden md:block" />
                  <span className="text-xs font-bold md:hidden">▼ Mentorship Ascend</span>
                </div>
              </div>

              {/* Box 3 */}
              <div className="flex-1 w-full bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                    Level 3 (Top)
                  </span>
                  <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">Certified Travel Agent</h5>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Earn <strong>₹{agentNetworkBonus} Agency Bonus</strong> + wholesale B2B group flights & hotel rates!
                </p>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE SUMMARY TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Comprehensive Level Comparison Matrix</h4>
                <p className="text-[11px] text-slate-400">Side-by-side breakdown of commission rates & privileges</p>
              </div>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                Transparent Fares
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Attribute</th>
                    <th className="p-3 text-sky-900">Level 1: Client</th>
                    <th className="p-3 text-purple-900 bg-purple-50/40">Level 2: Partner</th>
                    <th className="p-3 text-amber-950 bg-amber-50/40">Level 3: Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Milestone Requirement</td>
                    <td className="p-3">Free Signup</td>
                    <td className="p-3 bg-purple-50/20 font-semibold">{partnerRequired} Direct 1st Bookings</td>
                    <td className="p-3 bg-amber-50/20 font-semibold">1 Downline Partner</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Direct Referral Reward</td>
                    <td className="p-3 font-bold text-emerald-600">₹{referrerReward.toLocaleString('en-IN')} (Hold ➔ Cash)</td>
                    <td className="p-3 bg-purple-50/20 font-bold text-emerald-600">₹{referrerReward.toLocaleString('en-IN')} (Hold ➔ Cash)</td>
                    <td className="p-3 bg-amber-50/20 font-bold text-emerald-600">₹{referrerReward.toLocaleString('en-IN')} (Hold ➔ Cash)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Downline Team Override</td>
                    <td className="p-3 text-slate-400">❌ Locked</td>
                    <td className="p-3 bg-purple-50/20 font-extrabold text-purple-700">₹{partnerOverride} per booking</td>
                    <td className="p-3 bg-amber-50/20 font-extrabold text-purple-700">₹{partnerOverride} per booking</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Agency Network Bonus</td>
                    <td className="p-3 text-slate-400">❌ Locked</td>
                    <td className="p-3 bg-purple-50/20 text-slate-400">❌ Locked</td>
                    <td className="p-3 bg-amber-50/20 font-extrabold text-amber-700">₹{agentNetworkBonus} per booking</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Reward Validity</td>
                    <td className="p-3">{validityDays === 0 ? 'Lifetime (No Expiry)' : `${validityDays} Days`}</td>
                    <td className="p-3 bg-purple-50/20">{validityDays === 0 ? 'Lifetime (No Expiry)' : `${validityDays} Days`}</td>
                    <td className="p-3 bg-amber-50/20">{validityDays === 0 ? 'Lifetime (No Expiry)' : `${validityDays} Days`}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Credentials & Badge</td>
                    <td className="p-3 text-slate-500">Traveler Pass</td>
                    <td className="p-3 bg-purple-50/20 font-semibold text-purple-900">Verified Partner Certificate</td>
                    <td className="p-3 bg-amber-50/20 font-semibold text-amber-900">Certified Agency Gold Seal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FREQUENTLY ASKED QUESTIONS STRIP */}
          <div className="bg-slate-100/80 rounded-2xl p-4 space-y-3 text-xs">
            <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-600" />
              <span>Quick Answers & Important Rules</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">When does the ₹{referrerReward} unlock?</span>
                <span>As soon as your referred friend completes their 1st holiday booking, the reward moves from Hold to Available Cash for instant bank withdrawal.</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Can anyone become a Travel Agent?</span>
                <span>Yes! Simply help your direct referrals build their own teams. When one of your team members achieves 10 bookings and becomes a Partner, you elevate to Agent.</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Your Code:</span>
              <span className="font-mono font-extrabold text-slate-900 text-xs sm:text-sm">{referralCode}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 ml-1 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Close Guide
            </button>
            {onNavigateToRefer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToRefer();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Go to Refer & Earn</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
