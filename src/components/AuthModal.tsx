import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Lock, User, Gift, CheckCircle2, Shield, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

export interface AuthUser {
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, welcomeMessage: string) => void;
  referrerReward?: number;
  refereeReward?: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  referrerReward = 1500,
  refereeReward = 500,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('labanaganesh@gmail.com');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('••••••••');
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetSentMessage, setResetSentMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode when initialMode changes upon opening
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  // Close on Escape key press
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'login') {
        const isAdmin = identifier.toLowerCase().includes('admin');
        const user: AuthUser = {
          name: isAdmin ? 'YatraSafar Admin' : 'Ganesh Labana',
          email: identifier.includes('@') ? identifier : `${identifier}@yatrasafar.com`,
          phone: '+91 98765 43210',
          role: isAdmin ? 'admin' : 'user',
        };
        onLoginSuccess(user, `Welcome back, ${user.name}!`);
        onClose();
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          return;
        }
        const user: AuthUser = {
          name: name.trim(),
          email: identifier.includes('@') ? identifier : `${identifier}@yatrasafar.com`,
          phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
          role: 'user',
        };
        onLoginSuccess(user, `Account created successfully! Welcome to YatraSafar, ${user.name}!`);
        onClose();
      }
    }, 600);
  };

  const handleQuickLogin = (role: 'user' | 'admin') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'admin') {
        const adminUser: AuthUser = {
          name: 'YatraSafar Admin',
          email: 'admin@yatrasafar.com',
          phone: '+91 98765 00001',
          role: 'admin',
        };
        onLoginSuccess(adminUser, 'Admin Panel access granted. Welcome Admin!');
      } else {
        const standardUser: AuthUser = {
          name: 'Ganesh Labana',
          email: 'labanaganesh@gmail.com',
          phone: '+91 98765 43210',
          role: 'user',
        };
        onLoginSuccess(standardUser, 'Logged in successfully as Ganesh Labana!');
      }
      onClose();
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 pr-8">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
              {mode === 'login' ? 'Welcome Back' : 'Join YatraSafar'}
            </span>
            <span className="text-xs text-sky-200 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Guaranteed Best Deals
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white pr-6">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create Free Traveler Account'}
          </h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">
            {mode === 'login' 
              ? 'Access your booked fixed departure tickets, PNRs, and wallet bonuses.' 
              : `Sign up to get instant ₹2,000 off coupon and ₹${refereeReward.toLocaleString('en-IN')} refer & earn welcome bonus.`}
          </p>

          {/* Mode Switch Tabs */}
          <div className="mt-4 sm:mt-5 grid grid-cols-2 p-1 bg-sky-950/40 rounded-2xl border border-sky-400/20 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                mode === 'login'
                  ? 'bg-white text-sky-900 shadow-md font-black'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                mode === 'register'
                  ? 'bg-white text-sky-900 shadow-md font-black'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              New Register (Sign Up)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ganesh Labana"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {mode === 'login' ? 'Email or Mobile Number' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={mode === 'login' ? 'name@example.com or 9876543210' : 'name@example.com'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (for SMS & WhatsApp E-Ticket)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetSentMessage(true);
                      setTimeout(() => setResetSentMessage(false), 5000);
                    }}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {resetSentMessage && (
                <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold animate-in fade-in">
                  ✓ Password reset link has been sent to your registered mobile and email!
                </div>
              )}
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your secret password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                {!showReferralInput ? (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(true)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    <span>Have a Referral Code? (Get ₹2,000 Off)</span>
                  </button>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      Referral Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. YS-GANESH789"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-sm font-bold uppercase tracking-wider text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>
                  I agree to YatraSafar Terms of Service, Privacy Policy & Airline Fixed Departure Conditions.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading || (mode === 'register' && !agreedToTerms)}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Fast 1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/60 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-xs font-black text-slate-900 group-hover:text-sky-700">Traveler Demo</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Ganesh Labana</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-black text-slate-900 group-hover:text-slate-950">Admin Demo</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Manage Tours & Fares</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            256-Bit SSL Encrypted
          </span>
          <span>Need Help? 1800-270-0888</span>
        </div>
      </div>
    </div>
  );
};
