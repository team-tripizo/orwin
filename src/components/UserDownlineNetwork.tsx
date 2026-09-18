import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  GitBranch, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  Star, 
  Crown, 
  Award, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Copy, 
  Check, 
  Share2, 
  MessageSquare, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Eye,
  Filter
} from 'lucide-react';
import { AdminUserRecord, ReferralSettings } from '../types/travel';

export interface DownlineMemberInfo {
  user: AdminUserRecord;
  level: number; // 1 = Direct, 2 = Level 2, 3 = Level 3
  sponsor?: AdminUserRecord;
  hasFirstBooking: boolean;
  packageBooked?: string;
  bookingDate?: string;
  commissionAmount: number;
  commissionStatus: 'Credited' | 'Hold';
  subRecruitsCount: number;
}

interface UserDownlineNetworkProps {
  currentUserRecord: AdminUserRecord;
  allUsers: AdminUserRecord[];
  referralSettings?: ReferralSettings;
  onSwitchUser?: (user: AdminUserRecord) => void;
  onSimulateReferralForUser?: (targetUserCode: string) => void;
}

export const UserDownlineNetwork: React.FC<UserDownlineNetworkProps> = ({
  currentUserRecord,
  allUsers,
  referralSettings,
  onSwitchUser,
  onSimulateReferralForUser,
}) => {
  const referrerReward = referralSettings?.referrerReward ?? 1500;
  const refereeReward = referralSettings?.refereeReward ?? 500;
  const partnerOverrideBonus = referralSettings?.partnerIndirectReferralBonus ?? 100;
  const agentNetworkBonus = referralSettings?.agentNetworkBonus ?? 250;
  const isHoldPolicyActive = referralSettings?.holdUntilFirstBooking ?? true;

  // View mode: 'cards' or 'tree'
  const [viewMode, setViewMode] = useState<'cards' | 'tree'>('cards');
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'level1' | 'level2' | 'booked' | 'pending' | 'partners'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubTeams, setExpandedSubTeams] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [nudgeSentToast, setNudgeSentToast] = useState<string | null>(null);

  // Referral link for current user
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${currentUserRecord.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUserRecord.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendNudge = (friend: AdminUserRecord) => {
    const text = encodeURIComponent(
      `Hi ${friend.name}! ✈️ Check out our amazing flight fixed departures with guaranteed airline tickets on YatraSafar. Complete your 1st booking and enjoy exclusive group travel rates!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${friend.phone.replace(/[^0-9]/g, '')}&text=${text}`, '_blank');
    setNudgeSentToast(`Booking reminder sent to ${friend.name} via WhatsApp!`);
    setTimeout(() => setNudgeSentToast(null), 3000);
  };

  // Find who referred this current user (their sponsor)
  const sponsorUser = useMemo(() => {
    if (!currentUserRecord.referredBy) return null;
    return allUsers.find(u => u.referralCode === currentUserRecord.referredBy) || null;
  }, [currentUserRecord, allUsers]);

  // Compute Downline Members (Level 1, Level 2, Level 3)
  const downlineData = useMemo(() => {
    const result: DownlineMemberInfo[] = [];

    // Level 1: Direct Referrals
    const level1Users = allUsers.filter(u => u.referredBy === currentUserRecord.referralCode);
    
    level1Users.forEach(l1User => {
      const hasBooking = (l1User.totalBookings || 0) > 0;
      const subRecruits = allUsers.filter(u => u.referredBy === l1User.referralCode);
      
      result.push({
        user: l1User,
        level: 1,
        sponsor: currentUserRecord,
        hasFirstBooking: hasBooking,
        packageBooked: hasBooking ? 'Confirmed Holiday Booking' : 'Awaiting 1st Booking',
        bookingDate: l1User.joinedDate,
        commissionAmount: referrerReward,
        commissionStatus: hasBooking || !isHoldPolicyActive ? 'Credited' : 'Hold',
        subRecruitsCount: subRecruits.length,
      });

      // Level 2: Indirect Referrals (Referred by Level 1 members)
      subRecruits.forEach(l2User => {
        const l2HasBooking = (l2User.totalBookings || 0) > 0;
        const l2SubRecruits = allUsers.filter(u => u.referredBy === l2User.referralCode);
        const overrideAmount = currentUserRecord.isAgent ? agentNetworkBonus : partnerOverrideBonus;

        result.push({
          user: l2User,
          level: 2,
          sponsor: l1User,
          hasFirstBooking: l2HasBooking,
          packageBooked: l2HasBooking ? 'Downline Holiday Booking' : 'Awaiting 1st Booking',
          bookingDate: l2User.joinedDate,
          commissionAmount: overrideAmount,
          commissionStatus: l2HasBooking || !isHoldPolicyActive ? 'Credited' : 'Hold',
          subRecruitsCount: l2SubRecruits.length,
        });

        // Level 3: Members referred by Level 2 members
        l2SubRecruits.forEach(l3User => {
          const l3HasBooking = (l3User.totalBookings || 0) > 0;
          result.push({
            user: l3User,
            level: 3,
            sponsor: l2User,
            hasFirstBooking: l3HasBooking,
            packageBooked: l3HasBooking ? 'Downline Holiday Booking' : 'Awaiting 1st Booking',
            bookingDate: l3User.joinedDate,
            commissionAmount: currentUserRecord.isAgent ? agentNetworkBonus : 0,
            commissionStatus: l3HasBooking || !isHoldPolicyActive ? 'Credited' : 'Hold',
            subRecruitsCount: 0,
          });
        });
      });
    });

    return result;
  }, [currentUserRecord, allUsers, referrerReward, partnerOverrideBonus, agentNetworkBonus, isHoldPolicyActive]);

  // Network Statistics
  const level1Count = downlineData.filter(d => d.level === 1).length;
  const level1BookedCount = downlineData.filter(d => d.level === 1 && d.hasFirstBooking).length;
  const level2PlusCount = downlineData.filter(d => d.level >= 2).length;
  const totalTeamCount = downlineData.length;
  const partnersInDownline = downlineData.filter(d => d.user.isPartner).length;

  const unlockedCommission = downlineData
    .filter(d => d.commissionStatus === 'Credited')
    .reduce((sum, d) => sum + d.commissionAmount, 0);

  const heldCommission = downlineData
    .filter(d => d.commissionStatus === 'Hold')
    .reduce((sum, d) => sum + d.commissionAmount, 0);

  // Filtered downline list
  const filteredDownline = useMemo(() => {
    return downlineData.filter(item => {
      // Filter tab
      if (activeFilter === 'level1' && item.level !== 1) return false;
      if (activeFilter === 'level2' && item.level < 2) return false;
      if (activeFilter === 'booked' && !item.hasFirstBooking) return false;
      if (activeFilter === 'pending' && item.hasFirstBooking) return false;
      if (activeFilter === 'partners' && !item.user.isPartner) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.user.name.toLowerCase().includes(q);
        const matchesPhone = item.user.phone.toLowerCase().includes(q);
        const matchesCode = item.user.referralCode.toLowerCase().includes(q);
        const matchesCity = item.user.city?.toLowerCase().includes(q);
        const matchesSponsor = item.sponsor?.name.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesCode || matchesCity || matchesSponsor;
      }

      return true;
    });
  }, [downlineData, activeFilter, searchQuery]);

  const toggleSubTeam = (code: string) => {
    setExpandedSubTeams(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="user-downline-network-section">
      {/* Toast alert for reminders */}
      {nudgeSentToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-emerald-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{nudgeSentToast}</span>
        </div>
      )}

      {/* TOP USER IDENTITY & PERSONA SWITCHER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-amber-500/20 font-display">
                {currentUserRecord.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-slate-900 rounded-full p-1 border border-slate-700">
                {currentUserRecord.isAgent ? (
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                ) : currentUserRecord.isPartner ? (
                  <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-sky-400" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold font-display">{currentUserRecord.name}</h3>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                  currentUserRecord.isAgent 
                    ? 'bg-amber-400 text-slate-950 font-black' 
                    : currentUserRecord.isPartner 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                }`}>
                  {currentUserRecord.isAgent && <Crown className="w-3 h-3 fill-slate-950" />}
                  {currentUserRecord.isPartner && !currentUserRecord.isAgent && <Star className="w-3 h-3 fill-white" />}
                  <span>{currentUserRecord.isAgent ? 'Certified Travel Agent' : currentUserRecord.isPartner ? 'Affiliate Partner' : 'Client (Traveler)'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                <span>{currentUserRecord.email}</span>
                <span>•</span>
                <span>{currentUserRecord.phone}</span>
                {currentUserRecord.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {currentUserRecord.city}
                    </span>
                  </>
                )}
              </p>

              {/* Sponsor details if available */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">Referred by (Sponsor):</span>
                {sponsorUser ? (
                  <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {sponsorUser.name} ({sponsorUser.referralCode})
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Direct Root Member / Company Enrolled</span>
                )}
              </div>
            </div>
          </div>

          {/* Persona Switcher & Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {/* Account switcher dropdown */}
            {onSwitchUser && allUsers.length > 1 && (
              <div className="w-full sm:w-auto flex flex-col items-start lg:items-end gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Account / View Downline As:
                </span>
                <select
                  value={currentUserRecord.id}
                  onChange={(e) => {
                    const selected = allUsers.find(u => u.id === e.target.value);
                    if (selected) onSwitchUser(selected);
                  }}
                  className="w-full sm:w-64 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl border border-slate-600 focus:border-amber-400 focus:outline-none transition cursor-pointer"
                >
                  {allUsers.map((u) => {
                    const downlinesCount = allUsers.filter(sub => sub.referredBy === u.referralCode).length;
                    return (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {u.name} ({u.isAgent ? '👑 Agent' : u.isPartner ? '⭐ Partner' : 'Client'} • {downlinesCount} Direct)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Referral code copy pill */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center justify-between gap-3 w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400">My Code:</span>
                <span className="font-mono text-xs font-black text-amber-300">{currentUserRecord.referralCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Copy Referral Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Direct Referrals (Level 1) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Direct Referrals (L1)
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {level1Count}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              <strong className="text-emerald-600">{level1BookedCount}</strong> booked • {level1Count - level1BookedCount} pending
            </p>
          </div>
          <div className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg inline-block">
            ₹{referrerReward.toLocaleString('en-IN')} / 1st booking
          </div>
        </div>

        {/* Card 2: Team Downline (Level 2+) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Downline Team (L2+)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {level2PlusCount}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Team: <strong className="text-slate-800">{totalTeamCount}</strong> members
            </p>
          </div>
          <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg inline-block">
            {currentUserRecord.isAgent ? `+₹${agentNetworkBonus} Agent Bonus` : currentUserRecord.isPartner ? `+₹${partnerOverrideBonus} Partner Override` : 'Unlock at Partner tier'}
          </div>
        </div>

        {/* Card 3: Partners in Downline */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Downline Partners
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {partnersInDownline}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUserRecord.isAgent 
                ? '👑 Agent Promotion achieved!' 
                : `${partnersInDownline}/1 needed for Agent`}
            </p>
          </div>
          <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg inline-block">
            {currentUserRecord.isAgent ? 'Top Rank Active' : '1 Partner = Agent Upgrade'}
          </div>
        </div>

        {/* Card 4: Commissions Released vs On Hold */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Referral Commissions
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display">
              ₹{unlockedCommission.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-amber-700 font-bold mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>₹{heldCommission.toLocaleString('en-IN')} on Hold (1st booking pending)</span>
            </p>
          </div>
          <div className="text-[11px] text-slate-500">
            Hold releases when referee books
          </div>
        </div>
      </div>

      {/* VIEW CONTROLS & FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search downline by name, phone, city or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none transition"
          />
        </div>

        {/* View Toggle: Roster vs Interactive Tree */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Downline Roster ({filteredDownline.length})</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'tree' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
              <span>Genealogy Tree</span>
            </button>
          </div>

          {/* Simulate New Downline Referral Button */}
          {onSimulateReferralForUser && (
            <button
              onClick={() => onSimulateReferralForUser(currentUserRecord.referralCode)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
              title="Test: Add a new direct referral under this account"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>+ Add Test Referral</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === 'all' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Downline ({downlineData.length})
        </button>
        <button
          onClick={() => setActiveFilter('level1')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === 'level1' 
              ? 'bg-sky-600 text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Direct Level 1 ({level1Count})
        </button>
        <button
          onClick={() => setActiveFilter('level2')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === 'level2' 
              ? 'bg-purple-600 text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Team Level 2+ ({level2PlusCount})
        </button>
        <button
          onClick={() => setActiveFilter('booked')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === 'booked' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          1st Booking Done ({downlineData.filter(d => d.hasFirstBooking).length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === 'pending' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Booking Pending / Hold ({downlineData.filter(d => !d.hasFirstBooking).length})
        </button>
        <button
          onClick={() => setActiveFilter('partners')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeFilter === 'partners' 
              ? 'bg-purple-700 text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Affiliate Partners ({partnersInDownline})
        </button>
      </div>

      {/* VIEW MODE 1: DOWNLINE MEMBER CARDS / ROSTER */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {filteredDownline.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-extrabold text-slate-900 text-base">
                  {searchQuery ? 'No downline members match your search' : 'No Downline Members Yet'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchQuery 
                    ? 'Try searching with a different name, phone number, or clear your active filters.'
                    : `Share your referral link with friends and family. Once they sign up with your code ${currentUserRecord.referralCode}, they will appear here in your team!`
                  }
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleCopyLink}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Copy Invite Link</span>
                </button>
                {onSimulateReferralForUser && (
                  <button
                    onClick={() => onSimulateReferralForUser(currentUserRecord.referralCode)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Add Demo Referral to Test</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDownline.map((item) => {
                const { user, level, sponsor, hasFirstBooking, commissionAmount, commissionStatus, subRecruitsCount } = item;
                const isExpanded = !!expandedSubTeams[user.referralCode];
                const subMembers = allUsers.filter(u => u.referredBy === user.referralCode);

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Member Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="relative shrink-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base font-display ${
                            user.isAgent
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : user.isPartner
                              ? 'bg-purple-600 text-white'
                              : level === 1
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1 rounded-md text-white ${
                            level === 1 ? 'bg-sky-600' : 'bg-purple-600'
                          }`}>
                            L{level}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{user.name}</span>
                            
                            {/* Rank Badge */}
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              user.isAgent
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : user.isPartner
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {user.isAgent && <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />}
                              {user.isPartner && !user.isAgent && <Star className="w-3 h-3 text-purple-600 fill-purple-500" />}
                              <span>{user.isAgent ? 'Certified Agent' : user.isPartner ? 'Affiliate Partner' : 'Client'}</span>
                            </span>

                            {/* Level Tag */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              level === 1 ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {level === 1 ? 'Direct Referral' : `Level ${level} (via ${sponsor?.name || 'Partner'})`}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Joined: {user.joinedDate}</span>
                            </span>
                            {user.city && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{user.city}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 1st Booking Status & Reward Column */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 sm:gap-6 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {/* 1st Booking Card */}
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            1st Booking Status
                          </span>
                          {hasFirstBooking ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>1st Booking Confirmed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Booking Pending</span>
                            </span>
                          )}
                        </div>

                        {/* Commission Earned / Lock Status */}
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Your Commission
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-base font-extrabold font-display ${
                              commissionStatus === 'Credited' ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              +₹{commissionAmount.toLocaleString('en-IN')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-0.5 ${
                              commissionStatus === 'Credited' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {commissionStatus === 'Credited' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              <span>{commissionStatus === 'Credited' ? 'Available' : 'On Hold'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {!hasFirstBooking && (
                            <button
                              onClick={() => handleSendNudge(user)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                              title="Send polite WhatsApp nudge to book & unlock cash"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">WhatsApp Nudge</span>
                            </button>
                          )}

                          {subRecruitsCount > 0 && (
                            <button
                              onClick={() => toggleSubTeam(user.referralCode)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                            >
                              <span>Team ({subRecruitsCount})</span>
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable sub-team row */}
                    {isExpanded && subMembers.length > 0 && (
                      <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
                          <GitBranch className="w-4 h-4 text-purple-600" />
                          <span>Members recruited by {user.name} ({subMembers.length} Downlines):</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subMembers.map((sub) => {
                            const subBooked = (sub.totalBookings || 0) > 0;
                            return (
                              <div key={sub.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 block">{sub.name}</span>
                                  <span className="text-[11px] text-slate-500">{sub.city || 'Traveler'} • {sub.phone}</span>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    subBooked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {subBooked ? '✓ Booked' : '⏳ Pending'}
                                  </span>
                                  <span className="text-[11px] font-extrabold text-purple-700 block mt-0.5">
                                    +₹{partnerOverrideBonus} Override
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE GENEALOGY TREE */}
      {viewMode === 'tree' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-600" />
                <span>My Visual Downline Hierarchy Tree</span>
              </h4>
              <p className="text-xs text-slate-500">
                Interactive organizational chart of all travelers enrolled under your network
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Agent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Partner
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Client
              </span>
            </div>
          </div>

          {/* Tree Diagram Container */}
          <div className="overflow-x-auto py-4">
            <div className="min-w-[650px] flex flex-col items-center">
              {/* Root User Node (You) */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-lg border border-slate-700 max-w-xs w-full text-center space-y-1.5">
                <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  {currentUserRecord.isAgent ? <Crown className="w-3 h-3 fill-slate-950" /> : <Star className="w-3 h-3 fill-slate-950" />}
                  <span>{currentUserRecord.isAgent ? 'Certified Agent (You)' : currentUserRecord.isPartner ? 'Affiliate Partner (You)' : 'Client (You)'}</span>
                </div>
                <div className="font-extrabold text-base font-display">{currentUserRecord.name}</div>
                <div className="text-[11px] text-amber-200 font-mono font-bold">{currentUserRecord.referralCode}</div>
                <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800 flex justify-around">
                  <span>Direct: <strong>{level1Count}</strong></span>
                  <span>Team: <strong>{level2PlusCount}</strong></span>
                </div>
              </div>

              {/* Connecting Vertical Stem */}
              {level1Count > 0 && (
                <>
                  <div className="w-0.5 h-8 bg-slate-300" />
                  
                  {/* Level 1 Nodes Row */}
                  <div className="w-full flex justify-center items-start gap-4 sm:gap-6 pt-2">
                    {allUsers.filter(u => u.referredBy === currentUserRecord.referralCode).map((l1) => {
                      const l1SubMembers = allUsers.filter(u => u.referredBy === l1.referralCode);
                      const l1Booked = (l1.totalBookings || 0) > 0;

                      return (
                        <div key={l1.id} className="flex flex-col items-center flex-1 max-w-xs">
                          {/* Node Card */}
                          <div className={`w-full rounded-2xl p-3 border shadow-xs text-center space-y-1 ${
                            l1.isPartner 
                              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20' 
                              : 'bg-white border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">L1 Direct</span>
                              <span className={`px-1.5 py-0.5 rounded ${l1Booked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {l1Booked ? '✓ 1st Booked' : '⏳ Pending'}
                              </span>
                            </div>

                            <div className="font-extrabold text-slate-900 text-xs truncate">{l1.name}</div>
                            <div className="text-[10px] text-slate-500">{l1.city || 'Member'}</div>
                            
                            <div className="text-[10px] font-bold pt-1 border-t border-slate-100 flex justify-between">
                              <span className={l1Booked ? 'text-emerald-700' : 'text-amber-700'}>
                                {l1Booked ? `+₹${referrerReward.toLocaleString('en-IN')} Cash` : `₹${referrerReward.toLocaleString('en-IN')} Hold`}
                              </span>
                              {l1SubMembers.length > 0 && (
                                <span className="text-purple-700 font-extrabold">{l1SubMembers.length} recruits</span>
                              )}
                            </div>
                          </div>

                          {/* Level 2 Sub-branches */}
                          {l1SubMembers.length > 0 && (
                            <>
                              <div className="w-0.5 h-6 bg-slate-300" />
                              <div className="w-full flex flex-col gap-2 pt-1">
                                {l1SubMembers.map((l2) => {
                                  const l2Booked = (l2.totalBookings || 0) > 0;
                                  return (
                                    <div 
                                      key={l2.id}
                                      className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-xs space-y-0.5 shadow-2xs"
                                    >
                                      <div className="flex items-center justify-between text-[9px] font-bold">
                                        <span className="text-purple-700">L2 (via {l1.name.split(' ')[0]})</span>
                                        <span className={l2Booked ? 'text-emerald-700' : 'text-amber-700'}>
                                          {l2Booked ? 'Booked' : 'Pending'}
                                        </span>
                                      </div>
                                      <div className="font-bold text-slate-800 text-[11px] truncate">{l2.name}</div>
                                      <div className="text-[10px] font-extrabold text-purple-800">
                                        +₹{partnerOverrideBonus} Override
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
