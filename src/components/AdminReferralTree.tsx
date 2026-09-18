import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight, 
  Gift, 
  Sparkles, 
  Wallet, 
  DollarSign, 
  Award, 
  Search, 
  RefreshCw, 
  Share2, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  ArrowDown, 
  Network, 
  UserCheck, 
  Layers
} from 'lucide-react';
import { AdminUserRecord } from '../types/travel';

interface AdminReferralTreeProps {
  users: AdminUserRecord[];
  initialRootCode?: string;
  onSelectUserForWallet?: (user: AdminUserRecord) => void;
  onSimulateNewRecruit?: (parentCode: string) => void;
  referrerReward?: number;
  refereeReward?: number;
}

interface TreeNode {
  user: AdminUserRecord;
  level: number;
  children: TreeNode[];
}

export const AdminReferralTree: React.FC<AdminReferralTreeProps> = ({
  users,
  initialRootCode,
  onSelectUserForWallet,
  referrerReward = 1500,
  refereeReward = 500,
}) => {
  // Select which user to view as the Root of the tree
  const [selectedRootCode, setSelectedRootCode] = useState<string>(() => {
    return initialRootCode || 'YS-GANESH789';
  });

  // Collapsed nodes state (set of referral codes that are collapsed)
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // View mode: 'tree' or 'table'
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');

  // Search filter for dropdown
  const [searchQuery, setSearchQuery] = useState('');

  // Find root user
  const rootUser = useMemo(() => {
    const found = users.find((u) => u.referralCode === selectedRootCode);
    return found || users[0] || null;
  }, [users, selectedRootCode]);

  // Recursively build tree up to 4 levels
  const buildTree = (currentUser: AdminUserRecord, currentLevel: number = 0, maxLevel: number = 4): TreeNode => {
    if (currentLevel >= maxLevel) {
      return { user: currentUser, level: currentLevel, children: [] };
    }
    const directChildrenUsers = users.filter((u) => u.referredBy === currentUser.referralCode);
    const childrenNodes = directChildrenUsers.map((child) => buildTree(child, currentLevel + 1, maxLevel));
    return {
      user: currentUser,
      level: currentLevel,
      children: childrenNodes,
    };
  };

  const treeData = useMemo(() => {
    if (!rootUser) return null;
    return buildTree(rootUser, 0, 4);
  }, [rootUser, users]);

  // Flatten tree for statistics and table view
  const flattenTree = (node: TreeNode | null): { node: TreeNode; depth: number }[] => {
    if (!node) return [];
    let list: { node: TreeNode; depth: number }[] = [];
    for (const child of node.children) {
      list.push({ node: child, depth: child.level });
      list = list.concat(flattenTree(child));
    }
    return list;
  };

  const downlineList = useMemo(() => {
    return flattenTree(treeData);
  }, [treeData]);

  // Calculate network stats
  const totalDownlineMembers = downlineList.length;
  const tier1Count = downlineList.filter((item) => item.depth === 1).length;
  const tier2Count = downlineList.filter((item) => item.depth === 2).length;
  const tier3Count = downlineList.filter((item) => item.depth >= 3).length;

  const totalDownlineVolume = downlineList.reduce((acc, item) => acc + (item.node.user.totalSpent || 0), 0);
  const totalBookedUsers = downlineList.filter((item) => (item.node.user.totalBookings || 0) > 0).length;
  const conversionRate = totalDownlineMembers > 0 ? Math.round((totalBookedUsers / totalDownlineMembers) * 100) : 0;

  // Multi-tier estimated commission paid out to this tree:
  // Tier 1: ₹{referrerReward} each booked + ₹{refereeReward} join
  // Tier 2: ₹500 indirect bonus
  // Tier 3: ₹250 indirect bonus
  const estimatedTreeCommission = useMemo(() => {
    let total = 0;
    downlineList.forEach(({ node, depth }) => {
      if (depth === 1) {
        total += refereeReward; // Welcome join
        if (node.user.totalBookings > 0) total += referrerReward * node.user.totalBookings;
      } else if (depth === 2) {
        total += 250;
        if (node.user.totalBookings > 0) total += 500 * node.user.totalBookings;
      } else if (depth >= 3) {
        if (node.user.totalBookings > 0) total += 250 * node.user.totalBookings;
      }
    });
    return total;
  }, [downlineList, referrerReward, refereeReward]);

  // Toggle collapse
  const toggleCollapse = (code: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Node Component for Visual Tree
  const renderTreeNode = (node: TreeNode, isRoot: boolean = false) => {
    const isCollapsed = !!collapsedNodes[node.user.referralCode];
    const hasChildren = node.children.length > 0;
    const directRecruitsCount = node.children.length;

    const tierColors = {
      Diamond: 'border-purple-300 bg-purple-50/50 text-purple-900',
      Gold: 'border-amber-300 bg-amber-50/50 text-amber-900',
      Silver: 'border-slate-300 bg-slate-50/50 text-slate-800',
      Bronze: 'border-amber-200 bg-amber-50/30 text-amber-800',
    }[node.user.tier] || 'border-slate-200 bg-white text-slate-800';

    return (
      <div key={node.user.id} className="flex flex-col items-center">
        {/* The Node Card */}
        <div
          className={`relative rounded-2xl p-3.5 sm:p-4 border transition duration-200 shadow-sm w-64 sm:w-72 ${
            isRoot
              ? 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-amber-400 shadow-md ring-2 ring-amber-400/20'
              : `bg-white ${tierColors} hover:shadow-md`
          }`}
        >
          {/* Top Row: Level Pill & Tier */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isRoot
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : node.level === 1
                  ? 'bg-sky-100 text-sky-800'
                  : node.level === 2
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isRoot ? 'Root Promoter' : `Tier ${node.level} Direct`}
            </span>

            <span className="text-[10px] font-bold text-slate-500">
              {node.user.tier} Tier
            </span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2.5">
            {node.user.avatar ? (
              <img
                src={node.user.avatar}
                alt={node.user.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-xs">
                {node.user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                {node.user.name}
              </div>
              <div className="text-[11px] font-mono font-bold text-amber-700 truncate">
                {node.user.referralCode}
              </div>
              {/* Role Badge (Client -> Affiliate Partner -> Agent) */}
              <div className="mt-1">
                {node.user.isAgent || node.user.role === 'agent' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                    👑 Travel Agent (Top Tier)
                  </span>
                ) : node.user.isPartner || node.user.role === 'partner' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full">
                    🌟 Affiliate Partner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full">
                    ✈️ Client (Traveler)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mini Stats inside Node */}
          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-200/60 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Wallet:</span>
              <span className="font-black text-emerald-600">₹{(node.user.walletBalance || 0).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Bookings:</span>
              <span className="font-bold text-slate-800">
                {node.user.totalBookings > 0 ? (
                  <span className="text-sky-700 font-extrabold">{node.user.totalBookings} Trips (₹{(node.user.totalSpent || 0).toLocaleString('en-IN')})</span>
                ) : (
                  <span className="text-slate-400">0 (Lead)</span>
                )}
              </span>
            </div>
          </div>

          {/* Promotion Milestones (Client -> Partner -> Agent) */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] space-y-1 bg-slate-50/80 -mx-3.5 -mb-1 px-3 py-1.5 rounded-b-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">1st Bookings (Partner Target):</span>
              <span className="font-extrabold text-slate-800 font-mono">
                {node.user.directReferralsBookedCount || 0} / 10 {node.user.isPartner ? '🌟 Done' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Downline Partners (Agent Target):</span>
              <span className="font-extrabold text-purple-800 font-mono">
                {node.user.downlinePartnersCount || 0} {node.user.isAgent ? '👑 Agent' : ''}
              </span>
            </div>
          </div>

          {/* Action buttons on card */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px]">
            {!isRoot && (
              <button
                onClick={() => setSelectedRootCode(node.user.referralCode)}
                className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                title="Make this user the Root of tree"
              >
                <span>Make Root</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}

            {hasChildren && (
              <button
                onClick={() => toggleCollapse(node.user.referralCode)}
                className="ml-auto px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer"
              >
                <span>{isCollapsed ? `+ Show ${directRecruitsCount}` : `- Hide ${directRecruitsCount}`}</span>
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {!hasChildren && (
              <span className="ml-auto text-slate-400 text-[10px] italic">0 Recruits</span>
            )}
          </div>
        </div>

        {/* Connector Line down to children */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical stem down */}
            <div className="w-0.5 h-6 bg-slate-300"></div>

            {/* Horizontal branch bar if multiple children */}
            <div className="relative flex justify-center gap-6 sm:gap-8 pt-2">
              {node.children.length > 1 && (
                <div 
                  className="absolute top-0 h-0.5 bg-slate-300"
                  style={{
                    left: '50px',
                    right: '50px',
                  }}
                ></div>
              )}

              {/* Children nodes */}
              {node.children.map((childNode) => (
                <div key={childNode.user.id} className="relative flex flex-col items-center">
                  {/* Vertical stem from horizontal bar into child */}
                  <div className="w-0.5 h-4 bg-slate-300"></div>
                  {renderTreeNode(childNode, false)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Root Selector */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl border border-indigo-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-extrabold uppercase tracking-wider border border-indigo-500/30">
                Multi-Tier Referral Tree & Genealogy
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                Level 1-3 Commission Network
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
              <GitBranch className="w-7 h-7 text-amber-400" />
              <span>Interactive Referral Tree</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Visual downline hierarchy of user invitations. Inspect who referred whom across multiple tiers, track direct vs indirect conversions, and monitor commission distribution flows.
            </p>
          </div>

          {/* Root Selector and View Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Select Root Dropdown */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-1.5 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 pl-2">Root Promoter:</span>
              <select
                value={selectedRootCode}
                onChange={(e) => setSelectedRootCode(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-hidden text-amber-300 font-mono"
              >
                {users.map((u) => {
                  const downlineCount = users.filter((child) => child.referredBy === u.referralCode).length;
                  return (
                    <option key={u.id} value={u.referralCode}>
                      {u.name} ({u.referralCode}) - {downlineCount} direct
                    </option>
                  );
                })}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'tree' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Visual Tree</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Downline Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Network Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Root Promoter</span>
            <div className="text-base font-extrabold text-white mt-0.5 truncate">{rootUser?.name || 'N/A'}</div>
            <span className="text-[10px] text-amber-400 font-mono">{rootUser?.referralCode}</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Downline</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">{totalDownlineMembers} Members</div>
            <span className="text-[10px] text-slate-400">All levels combined</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tier 1 Direct</span>
            <div className="text-xl font-black text-sky-400 mt-0.5">{tier1Count} Friends</div>
            <span className="text-[10px] text-sky-300 font-medium">100% Commission</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tier 2 Indirect</span>
            <div className="text-xl font-black text-purple-400 mt-0.5">{tier2Count} Friends</div>
            <span className="text-[10px] text-purple-300 font-medium">Sub-referrals</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tree Sales Volume</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">₹{totalDownlineVolume.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-300 font-medium">{conversionRate}% converted</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Est. Distributed Rewards</span>
            <div className="text-xl font-black text-amber-300 mt-0.5">₹{estimatedTreeCommission.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">Multi-tier payouts</span>
          </div>
        </div>
      </div>

      {/* 3-Tier Promotion Hierarchy Explanation (Client ➔ Affiliate Partner ➔ Travel Agent) */}
      <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Career Progression Ladder: Client ➔ Affiliate Partner ➔ Travel Agent
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Step 1: Client */}
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-sky-900">
              <span>Level 1: Client (Traveler)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">Starting Rank</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Every newly registered user begins as a <strong>Client</strong>. They can book holiday packages and earn ₹{referrerReward.toLocaleString('en-IN')} Hold rewards per direct referral (credited upon 1st booking).
            </p>
          </div>

          {/* Step 2: Affiliate Partner */}
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-purple-950">
              <span>Level 2: Affiliate Partner</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">10 Direct Bookings</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              When a Client achieves <strong>10 direct referrals</strong> with confirmed 1st bookings, they elevate to <strong>Affiliate Partner</strong>, unlocking override bonuses on all downline referrals.
            </p>
          </div>

          {/* Step 3: Travel Agent */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 space-y-1">
            <div className="flex items-center justify-between font-bold text-amber-950">
              <span>Level 3: Certified Travel Agent</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">Downline Partner Trigger</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              When any team member in the Partner's downline completes 10 direct bookings and becomes a Partner, the sponsor automatically rises to <strong>Certified Travel Agent</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Visual Tree or Downline Table */}
      {viewMode === 'tree' ? (
        <div className="bg-slate-100/70 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-inner overflow-x-auto min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span>Root Promoter</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="w-3 h-3 rounded-full bg-sky-400"></span>
              <span>Tier 1 Direct</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="w-3 h-3 rounded-full bg-purple-400"></span>
              <span>Tier 2 Sub-referral</span>
            </div>

            <button
              onClick={() => setSelectedRootCode('YS-GANESH789')}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Master Root</span>
            </button>
          </div>

          {treeData ? (
            <div className="flex justify-center min-w-max py-4">
              {renderTreeNode(treeData, true)}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <GitBranch className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600">No tree data found for this code</p>
            </div>
          )}
        </div>
      ) : (
        /* Downline Leaderboard & Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-display">
              Downline Genealogy Table for {rootUser?.name}
            </h3>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
              {downlineList.length} Total Recruits in Downline
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Genealogy Tier</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Rank & Level</th>
                  <th className="py-3 px-4">Referral Code</th>
                  <th className="py-3 px-4">Referred By (Sponsor)</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Bookings & Progress</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {downlineList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      No downline members found under this promoter.
                    </td>
                  </tr>
                ) : (
                  downlineList.map(({ node, depth }) => (
                    <tr key={node.user.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          depth === 1
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : depth === 2
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          Level {depth} {depth === 1 ? '(Direct)' : '(Indirect)'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {node.user.avatar ? (
                            <img src={node.user.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                              {node.user.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 block">{node.user.name}</span>
                            <span className="text-[11px] text-slate-400">{node.user.city || 'India'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {node.user.isAgent || node.user.role === 'agent' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                            👑 Travel Agent
                          </span>
                        ) : node.user.isPartner || node.user.role === 'partner' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-300">
                            🌟 Affiliate Partner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                            ✈️ Client
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                          {node.user.referralCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-600 font-bold">
                          {node.user.referredBy}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-600 font-display">
                        ₹{(node.user.walletBalance || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {node.user.directReferralsBookedCount || 0} / 10 Direct Bookings
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {node.user.downlinePartnersCount || 0} Downline Partners
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRootCode(node.user.referralCode);
                            setViewMode('tree');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer transition"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>View Sub-tree</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
