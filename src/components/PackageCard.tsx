import React from 'react';
import { 
  Plane, 
  Calendar, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Luggage,
  Sparkles,
  Flame,
  Users
} from 'lucide-react';
import { HolidayPackage } from '../types/travel';

interface PackageCardProps {
  pkg: HolidayPackage;
  onSelectPackage: (pkg: HolidayPackage) => void;
  onBookNow: (pkg: HolidayPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onSelectPackage,
  onBookNow,
}) => {
  const discountPercent = Math.round(
    ((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100
  );

  const isSoldOut = pkg.status === 'sold_out' || pkg.remainingSeats <= 0;

  return (
    <div className={`bg-white rounded-2xl border ${isSoldOut ? 'border-slate-300 opacity-90' : 'border-slate-200'} overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col group relative`}>
      {/* Top Image & Badges */}
      <div className="relative h-52 sm:h-56 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSoldOut ? 'grayscale-40' : ''}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
              pkg.type === 'domestic'
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {pkg.type === 'domestic' ? '🇮🇳 Domestic' : '🌍 International'}
          </span>

          {isSoldOut ? (
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-xs tracking-wider">
              SOLD OUT
            </span>
          ) : pkg.isFixedDeparture ? (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-sky-500 text-white shadow-xs flex items-center gap-1">
              <Plane className="w-3 h-3 -rotate-45" />
              <span>Fixed Flights</span>
            </span>
          ) : pkg.badge ? (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{pkg.badge}</span>
            </span>
          ) : null}
        </div>

        {/* Discount Tag & Seats Left Urgency Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <div className="bg-red-600 text-white font-extrabold text-xs px-2 py-1 rounded-lg shadow-md">
            {discountPercent}% OFF
          </div>

          {/* Prominent Seats Left Badge - ALWAYS VISIBLE ON ALL PACKAGES */}
          <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 backdrop-blur-xs ${
            isSoldOut
              ? 'bg-rose-900/90 text-white'
              : pkg.remainingSeats <= 6
              ? 'bg-red-600 text-white animate-pulse'
              : pkg.remainingSeats <= 12
              ? 'bg-amber-500 text-slate-950'
              : 'bg-emerald-600 text-white'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
            <span>{isSoldOut ? 'Sold Out' : `🔥 ${pkg.remainingSeats} Seats Left`}</span>
          </div>
        </div>

        {/* Bottom Image Overlay Details */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[11px]">
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>{pkg.destination}</span>
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[11px]">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{pkg.rating} ({pkg.reviewsCount})</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-sky-200">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold">{pkg.duration}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 
            onClick={() => onSelectPackage(pkg)}
            className="font-bold text-slate-900 text-base sm:text-lg line-clamp-1 hover:text-sky-600 cursor-pointer transition"
          >
            {pkg.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            {pkg.subtitle}
          </p>

          {/* Seat Occupancy & Departure Information Bar (Uniform for all packages) */}
          {(() => {
            const flight = pkg.flightDetails;
            const remaining = pkg.remainingSeats || 10;
            const totalSeats = flight?.seatsTotal || (remaining === 6 ? 40 : remaining + 16);
            const bookedSeats = totalSeats - remaining;
            const occupancyPct = Math.min(95, Math.max(20, Math.round((bookedSeats / totalSeats) * 100)));

            return (
              <div className="mt-3 p-2.5 rounded-xl bg-sky-50/80 border border-sky-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-sky-900">
                    {pkg.isFixedDeparture ? (
                      <Plane className="w-3.5 h-3.5 text-sky-600 -rotate-45" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    )}
                    <span>
                      {pkg.isFixedDeparture ? `Fixed Flight: ${pkg.departureCity}` : `Departure: ${pkg.departureCity}`}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    pkg.isFixedDeparture 
                      ? 'bg-amber-100 text-amber-900' 
                      : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {pkg.isFixedDeparture ? (flight?.airline || 'Guaranteed Airline') : 'Private AC Cab'}
                  </span>
                </div>

                {/* Seat Occupancy Bar - Present on all packages so cards are uniformly balanced */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-800 font-medium">Seat Occupancy:</span>
                    <span className="font-bold text-slate-900">{occupancyPct}% ({remaining} Left)</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <Calendar className="w-3 h-3 text-sky-500 shrink-0" />
                  <span className="truncate">Dates: {pkg.departureDates.slice(0, 2).join(', ')}...</span>
                </div>
              </div>
            );
          })()}

          {/* Key highlights list */}
          <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
            {pkg.highlights.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing and CTAs */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-slate-400 line-through mr-1.5">
                ₹{pkg.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Save ₹{(pkg.originalPrice - pkg.price).toLocaleString('en-IN')}</span>
              <div className="text-xl font-extrabold text-slate-900 font-display">
                ₹{pkg.price.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500 ml-1">/ person</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">
                {pkg.isFixedDeparture ? 'Flight + Hotel + Meals' : 'Hotel + Stays + Transfers'}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                pkg.isFixedDeparture ? 'text-sky-700 bg-sky-50' : 'text-emerald-700 bg-emerald-50'
              }`}>
                {pkg.isFixedDeparture ? 'Guaranteed Flight' : 'Customizable'}
              </span>
            </div>
          </div>

          {/* Seat Urgency Notice - Never feels empty */}
          <div className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-bold text-amber-900">
              <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-amber-500" />
              <span>Available Inventory:</span>
            </span>
            <span className={`font-black ${isSoldOut ? 'text-rose-600' : pkg.remainingSeats <= 6 ? 'text-red-600 animate-pulse' : 'text-amber-900'}`}>
              {isSoldOut ? 'Sold Out' : `⚡ Only ${pkg.remainingSeats} Seats Left!`}
            </span>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectPackage(pkg)}
              className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <span>View Details</span>
            </button>

            {isSoldOut ? (
              <button
                onClick={() => onSelectPackage(pkg)}
                className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-1"
                title="Click to check alternate departure dates"
              >
                <span>Check Dates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onBookNow(pkg)}
                className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-sm hover:shadow flex items-center justify-center gap-1 group-hover:bg-sky-500"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
