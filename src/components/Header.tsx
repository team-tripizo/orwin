import React, { useState, useRef, useEffect } from 'react';
import { 
  Plane, 
  Gift, 
  User, 
  ShieldCheck, 
  Bell, 
  PhoneCall, 
  LogIn,
  UserPlus,
  ChevronDown,
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { NotificationItem, ReferralSettings } from '../types/travel';
import { AuthUser } from './AuthModal';

interface HeaderProps {
  currentView: 'packages' | 'fixed-departures' | 'refer' | 'dashboard' | 'admin';
  setCurrentView: (view: 'packages' | 'fixed-departures' | 'refer' | 'dashboard' | 'admin') => void;
  notifications: NotificationItem[];
  setIsNotificationOpen: (open: boolean) => void;
  walletBalance: number;
  currentUser: AuthUser | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  referralSettings?: ReferralSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  notifications,
  setIsNotificationOpen,
  walletBalance,
  currentUser,
  onOpenAuth,
  onLogout,
  referralSettings,
}) => {
  const referrerReward = referralSettings?.referrerReward ?? 1500;
  const refereeReward = referralSettings?.refereeReward ?? 500;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Announcement Bar - Promoting Share & Earn */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] tracking-wide uppercase shadow-xs">
              Share & Earn
            </span>
            <span className="font-bold text-slate-200 hidden sm:inline">
              Invite friends & earn <strong className="text-amber-300">₹{referrerReward.toLocaleString('en-IN')} Cash</strong>! Friend gets <strong className="text-emerald-400">₹{refereeReward.toLocaleString('en-IN')} Welcome Bonus</strong> on joining.
            </span>
            <span className="font-bold text-slate-200 sm:hidden">
              Share & Earn: ₹{referrerReward} Cash + ₹{refereeReward} Join Bonus
            </span>
            <button
              onClick={() => setCurrentView('refer')}
              className="text-amber-400 underline font-bold hover:text-amber-300 ml-1 text-[11px]"
            >
              Share Now →
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <a 
              href="tel:18002700888" 
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>1800-270-0888</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-18 gap-2 sm:gap-3">
          {/* Brand Logo */}
          <div 
            onClick={() => { setCurrentView('packages'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition shrink-0">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl lg:text-2xl tracking-tight text-slate-950 font-display whitespace-nowrap">
                  Yatra<span className="text-sky-600">Safar</span>
                </span>
                <span className="text-[10px] lg:text-[11px] uppercase font-black tracking-wider px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md shadow-xs whitespace-nowrap">
                  Holidays
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 tracking-tight whitespace-nowrap hidden sm:block">
                Holiday Packages & Fixed Departures
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            <button
              onClick={() => setCurrentView('packages')}
              className={`px-3 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition whitespace-nowrap shrink-0 flex items-center ${
                currentView === 'packages'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'text-slate-800 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <span>Holiday Packages</span>
            </button>

            <button
              onClick={() => setCurrentView('fixed-departures')}
              className={`px-3 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'fixed-departures'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'text-slate-800 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <Plane className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${currentView === 'fixed-departures' ? 'text-amber-300' : 'text-sky-600'}`} />
              <span>Fixed Departures</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            </button>

            <button
              onClick={() => setCurrentView('refer')}
              className={`px-3 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'refer'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-amber-950 hover:bg-amber-100/80 bg-amber-50 border border-amber-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-600 shrink-0" />
              <span>Share & Earn</span>
              <span className="text-[11px] font-black px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full shadow-xs whitespace-nowrap">
                ₹{referrerReward.toLocaleString('en-IN')}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'text-slate-800 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-600 shrink-0" />
              <span>My Bookings</span>
            </button>
          </nav>

          {/* Right Section: Login & Register Options + Notifications */}
          <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
            {!currentUser ? (
              /* When Not Logged In: Distinct Bold Login & Register Options */
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-sky-500 text-slate-800 hover:text-sky-700 font-bold text-xs xl:text-sm hover:bg-sky-50/50 transition cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-slate-600" />
                  <span>Login</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs xl:text-sm transition shadow-sm hover:shadow-md shadow-sky-600/25 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </div>
            ) : (
              /* When Logged In: User Profile Pill with Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 font-bold transition cursor-pointer shrink-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-black text-slate-900 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] font-bold text-sky-600">
                      {currentUser.role === 'admin' ? 'Administrator' : 'Traveler'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                      <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {currentUser.role === 'admin' ? 'Admin Access' : 'Verified Member'}
                        </span>
                        <span className="text-amber-700">
                          Wallet: ₹{walletBalance.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setCurrentView('dashboard'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Bookings & Tickets</span>
                    </button>

                    <button
                      onClick={() => { setCurrentView('refer'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Refer & Earn (Wallet)</span>
                    </button>

                    {currentUser.role === 'admin' ? (
                      <button
                        onClick={() => { setCurrentView('admin'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-sky-800 hover:bg-sky-50 flex items-center gap-2 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Admin Control Panel</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => { onOpenAuth('login'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Login as Administrator</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100"></div>

                    <button
                      onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 hover:text-sky-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 shadow-lg">
          {/* Mobile Auth Buttons */}
          {!currentUser ? (
            <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-slate-100">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition"
              >
                <LogIn className="w-4 h-4 text-sky-600" />
                <span>Login</span>
              </button>

              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-sky-700 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{currentUser.email}</p>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          <button
            onClick={() => { setCurrentView('packages'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              currentView === 'packages' ? 'bg-sky-600 text-white' : 'text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Holiday Packages (Domestic & Intl)</span>
          </button>

          <button
            onClick={() => { setCurrentView('fixed-departures'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              currentView === 'fixed-departures' ? 'bg-sky-600 text-white' : 'text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-600" />
              <span>Flight Fixed Departures</span>
            </span>
            <span className="text-[11px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              Guaranteed Seats
            </span>
          </button>

          <button
            onClick={() => { setCurrentView('refer'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              currentView === 'refer' ? 'bg-amber-500 text-slate-950' : 'text-slate-900 hover:bg-amber-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Share & Earn (Referral Bonus)</span>
            </span>
            <span className="text-xs font-black px-2 py-0.5 bg-amber-300 text-slate-950 rounded-full">
              ₹{referrerReward.toLocaleString('en-IN')} Cash
            </span>
          </button>

          <button
            onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 ${
              currentView === 'dashboard' ? 'bg-sky-600 text-white' : 'text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>My Bookings & E-Tickets</span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 ${
                currentView === 'admin' ? 'bg-slate-950 text-white' : 'text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Panel (Manage Prices & Bookings)</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
