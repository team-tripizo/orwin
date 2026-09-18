import React from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Plane, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CreditCard,
  Percent
} from 'lucide-react';
import { PackageType } from '../types/travel';

interface HeroSearchProps {
  activeTab: 'all' | 'domestic' | 'international' | 'fixed-departures';
  setActiveTab: (tab: 'all' | 'domestic' | 'international' | 'fixed-departures') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableCities: string[];
  referrerReward?: number;
  onOpenReferModal?: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  selectedMonth,
  setSelectedMonth,
  availableCities,
  referrerReward = 1500,
  onOpenReferModal,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8">
      {/* Background ambient decorative shapes */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Main Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>India's Trusted Holiday & Fixed Departure Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white">
            Discover Unforgettable Holidays with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-sky-300">Guaranteed Flight Departures</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-sky-100 max-w-2xl mx-auto">
            Book top-rated Domestic & International holiday packages with locked group flight fares, transparent payment options, and instant e-vouchers.
          </p>
        </div>

        {/* Filter / Search Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-800 border border-slate-100">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>All Packages</span>
            </button>

            <button
              onClick={() => setActiveTab('domestic')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'domestic'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🇮🇳 Domestic Holidays</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                Kashmir, Kerala, Goa
              </span>
            </button>

            <button
              onClick={() => setActiveTab('international')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'international'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🌍 International Trips</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                Dubai, Bali, Europe
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fixed-departures')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'fixed-departures'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Plane className="w-3.5 h-3.5 -rotate-45" />
              <span>Flight Fixed Departures</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          </div>

          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Destination Search */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Destination
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-600" />
                <input
                  type="text"
                  placeholder="e.g. Kashmir, Dubai, Bali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Departure City */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Departure City (Fixed Flights)
              </label>
              <div className="relative">
                <Plane className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-600" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 bg-slate-50/50 appearance-none cursor-pointer"
                >
                  <option value="all">All Departure Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Travel Month */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Travel Month / Season
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-600" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 bg-slate-50/50 appearance-none cursor-pointer"
                >
                  <option value="all">All Upcoming Months</option>
                  <option value="Oct">October 2026 (Diwali / Puja)</option>
                  <option value="Nov">November 2026 (Winter Season)</option>
                  <option value="Dec">December 2026 (New Year)</option>
                </select>
              </div>
            </div>

            {/* Clear / Filter Trigger */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('all');
                  setSelectedMonth('all');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-bold transition flex items-center justify-center gap-2"
              >
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Value Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 text-xs text-sky-100">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <p className="font-bold text-white">Guaranteed Departures</p>
              <p className="text-[11px] text-sky-200">No flight fare surges</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <CreditCard className="w-4 h-4 text-emerald-300 shrink-0" />
            <div>
              <p className="font-bold text-white">Secure Payment Gateway</p>
              <p className="text-[11px] text-sky-200">UPI, Cards, No-Cost EMI</p>
            </div>
          </div>

          <div 
            onClick={onOpenReferModal}
            className={`flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 ${
              onOpenReferModal ? 'cursor-pointer hover:bg-white/10 transition-all hover:scale-[1.02]' : ''
            }`}
            title="Click to open Refer & Earn Rewards"
          >
            <Percent className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <p className="font-bold text-white">Refer & Earn ₹{referrerReward.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-sky-200">Instant wallet credit</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-sky-300 shrink-0" />
            <div>
              <p className="font-bold text-white">24x7 Live Assistance</p>
              <p className="text-[11px] text-sky-200">Real-time chat & helpline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
