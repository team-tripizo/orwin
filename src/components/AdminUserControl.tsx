import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  Shield, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Gift, 
  GitBranch, 
  Copy, 
  Check, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Briefcase
} from 'lucide-react';
import { AdminUserRecord, BookingRecord, WalletTransaction } from '../types/travel';

interface AdminUserControlProps {
  users: AdminUserRecord[];
  bookings?: BookingRecord[];
  onAddUser?: (user: AdminUserRecord) => void;
  onUpdateUser?: (user: AdminUserRecord) => void;
  onUpdateUserWallet?: (userId: string, amount: number, type: 'credit' | 'debit', reason: string) => void;
  onUpdateWallet?: (userId: string, amount: number, type: 'credit' | 'debit', reason: string) => void;
  onToggleUserStatus?: (userId: string) => void;
  onToggleStatus?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onNavigateToReferralTree?: (userCode: string) => void;
}

export const AdminUserControl: React.FC<AdminUserControlProps> = ({
  users,
  bookings = [],
  onAddUser,
  onUpdateUser,
  onUpdateUserWallet,
  onUpdateWallet,
  onToggleUserStatus,
  onToggleStatus,
  onDeleteUser,
  onNavigateToReferralTree,
}) => {
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'agent'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [walletModalUser, setWalletModalUser] = useState<AdminUserRecord | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUserRecord | null>(null);

  // Close any open modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewingUser) {
          setViewingUser(null);
        } else if (walletModalUser) {
          setWalletModalUser(null);
        } else if (editingUser) {
          setEditingUser(null);
        } else if (showAddModal) {
          setShowAddModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingUser, walletModalUser, editingUser, showAddModal]);

  // Add User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'agent'>('user');
  const [newTier, setNewTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Diamond'>('Bronze');
  const [newWallet, setNewWallet] = useState(500);
  const [newReferredBy, setNewReferredBy] = useState('');

  // Wallet Modal State
  const [walletActionType, setWalletActionType] = useState<'credit' | 'debit'>('credit');
  const [walletAmount, setWalletAmount] = useState<number>(1000);
  const [walletReason, setWalletReason] = useState('Promotional Referral Bonus');

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // KPIs
  const totalUsersCount = users.length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const agentCount = users.filter((u) => u.role === 'agent').length;
  const totalWalletPool = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);
  const totalUserSpend = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchPhone = u.phone.toLowerCase().includes(q);
        const matchCode = u.referralCode.toLowerCase().includes(q);
        const matchRefBy = (u.referredBy || '').toLowerCase().includes(q);
        const matchCity = (u.city || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCode && !matchRefBy && !matchCity) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'active' && u.status !== 'active') return false;
      if (statusFilter === 'suspended' && u.status !== 'suspended') return false;
      if (statusFilter === 'agent' && u.role !== 'agent') return false;

      // Tier filter
      if (tierFilter !== 'all' && u.tier !== tierFilter) return false;

      return true;
    });
  }, [users, searchTerm, statusFilter, tierFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Tier', 'Wallet Balance (INR)', 'Referral Code', 'Referred By', 'Total Bookings', 'Total Spent (INR)', 'City', 'Joined Date'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone,
      u.role,
      u.status,
      u.tier,
      u.walletBalance,
      u.referralCode,
      u.referredBy || 'None (Direct)',
      u.totalBookings,
      u.totalSpent,
      `"${u.city || ''}"`,
      u.joinedDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yatrasafar_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Add User
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const initials = newName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'USER';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedCode = `YS-${initials}${randomSuffix}`;

    const newUser: AdminUserRecord = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+91 98000 00000',
      role: newRole,
      status: 'active',
      tier: newTier,
      walletBalance: Number(newWallet) || 0,
      referralCode: generatedCode,
      referredBy: newReferredBy.trim() || undefined,
      totalBookings: 0,
      totalSpent: 0,
      joinedDate: 'Today',
      lastActive: 'Just registered',
      city: newCity.trim() || 'New Delhi',
      transactions: [
        {
          id: `tx-init-${Date.now()}`,
          type: 'credit',
          amount: Number(newWallet) || 0,
          reason: 'Initial Account Provisioning Balance',
          date: 'Today',
        },
      ],
    };

    if (onAddUser) {
      onAddUser(newUser);
    }
    setShowAddModal(false);
    // Reset form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewCity('');
    setNewRole('user');
    setNewTier('Bronze');
    setNewWallet(500);
    setNewReferredBy('');
  };

  // Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (onUpdateUser) {
      onUpdateUser(editingUser);
    }
    setEditingUser(null);
  };

  // Submit Wallet Adjustment
  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalUser || walletAmount <= 0) return;
    const updateFn = onUpdateUserWallet || onUpdateWallet;
    if (updateFn) {
      updateFn(walletModalUser.id, Number(walletAmount), walletActionType, walletReason);
    }
    setWalletModalUser(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Analytics Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-extrabold uppercase tracking-wider border border-amber-500/30">
                User Management & Access Control
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live System
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Total Users & Account Controls
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time directory of all registered customers, travel agents, and administrators. Manage wallet balances, activate or suspend accounts, review booking history, and inspect referral downlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New User</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              title="Download full user dataset in CSV format"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mini KPI metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Users</span>
            <div className="text-xl font-black text-white mt-0.5">{totalUsersCount}</div>
            <span className="text-[10px] text-sky-400 font-medium">All registered</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Accounts</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{activeCount}</div>
            <span className="text-[10px] text-emerald-300 font-medium">{Math.round((activeCount / (totalUsersCount || 1)) * 100)}% active rate</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Travel Agents</span>
            <div className="text-xl font-black text-purple-400 mt-0.5">{agentCount}</div>
            <span className="text-[10px] text-purple-300 font-medium">Commissioned</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Suspended</span>
            <div className="text-xl font-black text-rose-400 mt-0.5">{suspendedCount}</div>
            <span className="text-[10px] text-rose-300 font-medium">Flagged/Restricted</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Wallet Pool</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">₹{totalWalletPool.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-amber-300 font-medium">In user wallets</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">User Lifetime Spend</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5">₹{totalUserSpend.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-cyan-300 font-medium">Gross Bookings</span>
          </div>
        </div>
      </div>

      {/* 2. Search, Filters & Quick Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Email, Phone (+91), Referral Code (YS-...) or City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 bg-slate-50/50 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('agent')}
            className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'agent'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Agents ({agentCount})
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'suspended'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            Suspended ({suspendedCount})
          </button>

          {/* Tier select */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 text-xs focus:outline-hidden"
          >
            <option value="all">All Tiers (Diamond/Gold/Silver/Bronze)</option>
            <option value="Diamond">💎 Diamond Tier</option>
            <option value="Gold">🥇 Gold Tier</option>
            <option value="Silver">🥈 Silver Tier</option>
            <option value="Bronze">🥉 Bronze Tier</option>
          </select>
        </div>
      </div>

      {/* 3. Comprehensive Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-display">
              User Directory & Permissions
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-bold">
              Showing {filteredUsers.length} of {users.length}
            </span>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Click on any user's referral code or "View in Tree" to inspect downline network
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Contact & Location</th>
                <th className="py-3 px-4">Referral Code & Sponsor</th>
                <th className="py-3 px-4">Tier & Spending</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">User Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  const isSuspended = u.status === 'suspended';

                  // Tier badge colors
                  const tierColors = {
                    Diamond: 'bg-purple-100 text-purple-900 border-purple-200',
                    Gold: 'bg-amber-100 text-amber-900 border-amber-200',
                    Silver: 'bg-slate-200 text-slate-800 border-slate-300',
                    Bronze: 'bg-amber-50 text-amber-800 border-amber-200',
                  }[u.tier] || 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition group">
                      {/* Column 1: User & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs shadow-xs">
                                {initials}
                              </div>
                            )}
                            {u.role === 'admin' && (
                              <span className="absolute -top-1 -right-1 p-0.5 bg-amber-500 rounded-full text-slate-950" title="Super Admin">
                                <Shield className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-sm group-hover:text-sky-600 transition">
                                {u.name}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-900 font-extrabold'
                                  : u.role === 'agent'
                                  ? 'bg-purple-100 text-purple-900 font-extrabold'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {u.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              ID: <span className="font-mono">{u.id}</span> • Joined {u.joinedDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Contact & Location */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]" title={u.email}>{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                        {u.city && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{u.city}</span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Referral Code & Sponsor */}
                      <td className="py-3.5 px-4 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                            {u.referralCode}
                          </span>
                          <button
                            onClick={() => handleCopy(u.referralCode)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition"
                            title="Copy referral code"
                          >
                            {copiedCode === u.referralCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {u.referredBy ? (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>Sponsor:</span>
                            <span 
                              onClick={() => {
                                setSearchTerm(u.referredBy || '');
                              }}
                              className="font-mono text-sky-600 hover:underline font-bold cursor-pointer"
                              title="Click to search this sponsor"
                            >
                              {u.referredBy}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Direct / Root</span>
                        )}
                        {onNavigateToReferralTree && (
                          <button
                            onClick={() => onNavigateToReferralTree(u.referralCode)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            title="Inspect this user's downline referral tree"
                          >
                            <GitBranch className="w-3 h-3" />
                            <span>View Downline Tree</span>
                          </button>
                        )}
                      </td>

                      {/* Column 4: Tier & Spending */}
                      <td className="py-3.5 px-4 space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${tierColors}`}>
                          {u.tier} Tier
                        </span>
                        <div className="text-[11px] text-slate-600">
                          <strong className="text-slate-900 font-bold">{u.totalBookings}</strong> Trips Booked
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Total: <strong className="text-slate-900 font-bold">₹{u.totalSpent.toLocaleString('en-IN')}</strong>
                        </div>
                      </td>

                      {/* Column 5: Wallet Balance */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="text-sm font-black text-emerald-600 font-display">
                            ₹{(u.walletBalance || 0).toLocaleString('en-IN')}
                          </div>
                          <button
                            onClick={() => {
                              setWalletModalUser(u);
                              setWalletActionType('credit');
                              setWalletAmount(1000);
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                            title="Credit or Debit wallet balance"
                          >
                            <Wallet className="w-3 h-3 text-emerald-600" />
                            <span>Adjust Wallet</span>
                          </button>
                        </div>
                      </td>

                      {/* Column 6: Account Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                            {isSuspended ? 'Suspended' : 'Active'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Active {u.lastActive}
                          </span>
                        </div>
                      </td>

                      {/* Column 7: User Control Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setViewingUser(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 transition cursor-pointer"
                            title="View user dossier & history"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* Edit user */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition cursor-pointer"
                            title="Edit user details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle status */}
                          <button
                            onClick={() => {
                              const toggleFn = onToggleUserStatus || onToggleStatus;
                              if (toggleFn) {
                                toggleFn(u.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            }`}
                            title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                          >
                            {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete user "${u.name}"?`)) {
                                if (onDeleteUser) {
                                  onDeleteUser(u.id);
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW USER                                     */}
      {/* ========================================================= */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">
                    Create & Register New User
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add customer, travel agent, or admin account manually
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close user registration"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number (+91)</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50 font-bold"
                  >
                    <option value="user">Traveler (User)</option>
                    <option value="agent">Travel Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loyalty Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50 font-bold"
                  >
                    <option value="Bronze">Bronze Tier</option>
                    <option value="Silver">Silver Tier</option>
                    <option value="Gold">Gold Tier</option>
                    <option value="Diamond">Diamond Tier</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Wallet (₹)</label>
                  <input
                    type="number"
                    value={newWallet}
                    onChange={(e) => setNewWallet(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Referred By Sponsor Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. YS-GANESH789"
                  value={newReferredBy}
                  onChange={(e) => setNewReferredBy(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-slate-50 font-mono"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  If entered, this user will automatically link into that sponsor's referral downline tree.
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <strong>Auto-Provisioning:</strong>
                <p>A unique referral code (e.g. YS-{newName.slice(0, 4).toUpperCase() || 'USER'}...) will be automatically generated and linked to their account.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Save & Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT USER DETAILS                                */}
      {/* ========================================================= */}
      {editingUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">
                    Edit User Profile
                  </h3>
                  <p className="text-xs text-slate-500">ID: {editingUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close user editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="user">Traveler</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tier</label>
                  <select
                    value={editingUser.tier}
                    onChange={(e) => setEditingUser({ ...editingUser, tier: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                <input
                  type="text"
                  value={editingUser.city || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADJUST WALLET BALANCE (CREDIT / DEBIT)            */}
      {/* ========================================================= */}
      {walletModalUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWalletModalUser(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">
                    Adjust Wallet Balance
                  </h3>
                  <p className="text-xs text-slate-500">
                    User: <strong className="text-slate-900">{walletModalUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWalletModalUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close wallet adjustment"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Current Balance:</span>
              <span className="text-lg font-black text-emerald-600 font-display">
                ₹{(walletModalUser.walletBalance || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleWalletSubmit} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalletActionType('credit')}
                  className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    walletActionType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Credit Cash (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWalletActionType('debit')}
                  className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    walletActionType === 'debit'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Debit / Deduct (-)</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-black text-slate-900 text-base"
                />
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 1500, 3000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWalletAmount(amt)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Note for Ledger</label>
                <select
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium mb-2"
                >
                  <option value="Promotional Referral Bonus">Promotional Referral Bonus</option>
                  <option value="Festival Goodwill Credit">Festival Goodwill Credit</option>
                  <option value="Cancellation / Refund Goodwill">Cancellation / Refund Goodwill</option>
                  <option value="Admin Correction / Discrepancy Fix">Admin Correction / Discrepancy Fix</option>
                  <option value="Special VIP Travel Agent Bonus">Special VIP Travel Agent Bonus</option>
                  <option value="Referral Reward Clawback">Referral Reward Clawback (For Debit)</option>
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom remark..."
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px]"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-sky-900 flex justify-between font-bold">
                <span>New Expected Balance:</span>
                <span className="text-emerald-700 font-extrabold text-sm">
                  ₹{Math.max(0, (walletModalUser.walletBalance || 0) + (walletActionType === 'credit' ? walletAmount : -walletAmount)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWalletModalUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-black text-white transition ${
                    walletActionType === 'credit'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20'
                  }`}
                >
                  Confirm {walletActionType === 'credit' ? 'Credit' : 'Debit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: USER FULL DOSSIER & TRANSACTION HISTORY          */}
      {/* ========================================================= */}
      {viewingUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingUser(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                {viewingUser.avatar ? (
                  <img
                    src={viewingUser.avatar}
                    alt={viewingUser.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 font-bold text-lg flex items-center justify-center shadow-md">
                    {viewingUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 font-display">
                      {viewingUser.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                      {viewingUser.tier} Tier
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {viewingUser.email} • {viewingUser.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close user dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Wallet Cash</span>
                <div className="text-lg font-black text-emerald-600 font-display mt-0.5">
                  ₹{(viewingUser.walletBalance || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Referral Code</span>
                <div className="text-sm font-black font-mono text-amber-600 mt-1">
                  {viewingUser.referralCode}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Bookings Made</span>
                <div className="text-lg font-black text-sky-700 font-display mt-0.5">
                  {viewingUser.totalBookings} Trips
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Lifetime Spent</span>
                <div className="text-lg font-black text-slate-900 font-display mt-0.5">
                  ₹{viewingUser.totalSpent.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Direct Downline Referrals recruited by this user */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Friends Recruited (Direct Downline)</span>
                {onNavigateToReferralTree && (
                  <button
                    onClick={() => {
                      setViewingUser(null);
                      onNavigateToReferralTree(viewingUser.referralCode);
                    }}
                    className="text-sky-600 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Full Tree</span>
                    <GitBranch className="w-3.5 h-3.5" />
                  </button>
                )}
              </h4>

              {(() => {
                const directRecruits = users.filter((u) => u.referredBy === viewingUser.referralCode);
                if (directRecruits.length === 0) {
                  return (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400 text-center">
                      No direct referrals yet with code <strong className="font-mono">{viewingUser.referralCode}</strong>.
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {directRecruits.map((rec) => (
                      <div key={rec.id} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{rec.name}</div>
                          <div className="text-[10px] text-slate-500">{rec.city} • Code: {rec.referralCode}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          ₹{rec.totalSpent > 0 ? 'Booked' : 'Joined'}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Wallet Transactions Ledger */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Wallet Ledger & Earnings History
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                {(!viewingUser.transactions || viewingUser.transactions.length === 0) ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No transactions recorded for this user.
                  </div>
                ) : (
                  viewingUser.transactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{tx.reason}</div>
                        <div className="text-[10px] text-slate-400">{tx.date}</div>
                      </div>
                      <span className={`font-black font-display ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
