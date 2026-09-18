import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Star, 
  Plane, 
  Calendar, 
  Check, 
  ShieldAlert, 
  Luggage, 
  Utensils, 
  Building2, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  ChevronDown,
  Download,
  Printer,
  FileText,
  Share2,
  Copy,
  CheckCheck
} from 'lucide-react';
import { HolidayPackage } from '../types/travel';

interface PackageDetailModalProps {
  pkg: HolidayPackage | null;
  onClose: () => void;
  onProceedToBook: (pkg: HolidayPackage) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  onClose,
  onProceedToBook,
}) => {
  if (!pkg) return null;

  const [activeTab, setActiveTab] = useState<'itinerary' | 'flight' | 'inclusions'>('itinerary');
  const [selectedPhoto, setSelectedPhoto] = useState(pkg.image);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSoldOut = pkg.status === 'sold_out' || pkg.remainingSeats <= 0;

  // Generate plain text itinerary
  const generateItineraryText = () => {
    return `
=====================================================
          YATRASAFAR HOLIDAYS & FIXED DEPARTURES
      Toll-Free: 1800-270-0888 | info@yatrasafar.com
=====================================================

PACKAGE: ${pkg.title}
DESTINATION: ${pkg.destination} (${pkg.stateOrCountry})
DURATION: ${pkg.duration} (${pkg.nights} Nights / ${pkg.days} Days)
DEPARTURE CITY: ${pkg.departureCity}
SPECIAL FARE: ₹${pkg.price.toLocaleString('en-IN')} per traveler (Original: ₹${pkg.originalPrice.toLocaleString('en-IN')})
RATING: ${pkg.rating} / 5.0 (${pkg.reviewsCount} verified traveler reviews)

${pkg.flightDetails ? `
-----------------------------------------------------
FLIGHT & FIXED DEPARTURE DETAILS
-----------------------------------------------------
Airline: ${pkg.flightDetails.airline} (${pkg.flightDetails.flightNumber})
Route: ${pkg.flightDetails.departureAirport} -> ${pkg.flightDetails.arrivalAirport}
Timings: Departure ${pkg.flightDetails.departureTime} | Arrival ${pkg.flightDetails.arrivalTime}
Duration: ${pkg.flightDetails.duration}
Baggage Allowance: ${pkg.flightDetails.baggage}
Available Fixed Departure Dates: ${pkg.departureDates.join(', ')}
` : ''}

-----------------------------------------------------
DAY-BY-DAY DETAILED ITINERARY
-----------------------------------------------------
${pkg.itinerary.map(day => `
DAY ${day.day}: ${day.title}
• Meals: ${day.meals}
• Stay / Hotel: ${day.hotel}
• Activities & Highlights:
  ${day.description}
`).join('\n')}

-----------------------------------------------------
WHAT'S INCLUDED IN PACKAGE
-----------------------------------------------------
${pkg.inclusions.map(inc => `✓ ${inc}`).join('\n')}

-----------------------------------------------------
WHAT'S NOT INCLUDED
-----------------------------------------------------
${pkg.exclusions.map(exc => `✗ ${exc}`).join('\n')}

-----------------------------------------------------
BOOKING & 24x7 ASSISTANCE
-----------------------------------------------------
Website: https://yatrasafar.com
Customer Care Helpline: 1800-270-0888
WhatsApp Support: +91 98765 43210
IATA Certified & Ministry of Tourism Registered
=====================================================
`;
  };

  // Generate beautiful HTML brochure for PDF printing
  const generateBrochureHtml = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Itinerary - ${pkg.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; background: #fff; line-height: 1.5; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 24px; font-weight: 900; color: #0f172a; }
    .brand span { color: #0284c7; }
    .meta { font-size: 12px; color: #64748b; text-align: right; }
    .title-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .title-box h1 { margin: 0 0 8px 0; font-size: 20px; color: #0f172a; }
    .badges { display: flex; gap: 12px; font-size: 12px; color: #475569; font-weight: 600; }
    .price-tag { color: #0284c7; font-size: 18px; font-weight: 800; }
    .flight-box { background: #0f172a; color: #fff; border-radius: 10px; padding: 16px; margin-bottom: 24px; }
    .flight-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #38bdf8; }
    .flight-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11px; }
    .itinerary-day { border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 14px; page-break-inside: avoid; }
    .day-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .day-badge { background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; }
    .day-title { font-weight: bold; font-size: 14px; color: #0f172a; }
    .day-meta { font-size: 11px; color: #64748b; margin-left: auto; }
    .day-desc { font-size: 12px; color: #334155; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; page-break-inside: avoid; }
    .inc-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; font-size: 12px; }
    .exc-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px; font-size: 12px; }
    .inc-box h4 { margin: 0 0 8px 0; color: #166534; font-size: 13px; }
    .exc-box h4 { margin: 0 0 8px 0; color: #991b1b; font-size: 13px; }
    .footer { margin-top: 30px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Yatra<span>Safar</span> Holidays</div>
      <div style="font-size: 11px; color: #64748b;">Fixed Departures & Guaranteed Tour Packages</div>
    </div>
    <div class="meta">
      <div><strong>Helpline:</strong> 1800-270-0888 (24x7)</div>
      <div><strong>Email:</strong> bookings@yatrasafar.com</div>
      <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="title-box">
    <h1>${pkg.title}</h1>
    <div class="badges">
      <span>📍 ${pkg.destination}, ${pkg.stateOrCountry}</span>
      <span>⏱️ ${pkg.duration}</span>
      <span>${pkg.isFixedDeparture ? `✈️ Fixed Departure from ${pkg.departureCity}` : `📍 Departure: ${pkg.departureCity}`}</span>
      <span class="price-tag">₹${pkg.price.toLocaleString('en-IN')}</span>
    </div>
  </div>

  ${pkg.isFixedDeparture && pkg.flightDetails ? `
  <div class="flight-box">
    <h3>✈️ Confirmed Fixed Departure Flight Schedule</h3>
    <div class="flight-grid">
      <div><strong>Airline:</strong> ${pkg.flightDetails.airline} (${pkg.flightDetails.flightNumber})</div>
      <div><strong>Route:</strong> ${pkg.departureCity} ➔ ${pkg.destination}</div>
      <div><strong>Timing:</strong> ${pkg.flightDetails.departureTime} - ${pkg.flightDetails.arrivalTime}</div>
      <div><strong>Baggage:</strong> ${pkg.flightDetails.baggage}</div>
    </div>
  </div>
  ` : ''}

  <h2 style="font-size: 16px; margin: 20px 0 12px 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
    Day-Wise Itinerary Plan (${pkg.itinerary.length} Days)
  </h2>

  ${pkg.itinerary.map(day => `
    <div class="itinerary-day">
      <div class="day-header">
        <span class="day-badge">Day ${day.day}</span>
        <span class="day-title">${day.title}</span>
        <span class="day-meta">🍽️ ${day.meals} | 🏨 ${day.hotel}</span>
      </div>
      <div class="day-desc">${day.description}</div>
    </div>
  `).join('')}

  <div class="grid-2">
    <div class="inc-box">
      <h4>✓ What's Included</h4>
      <ul style="margin: 0; padding-left: 18px;">
        ${pkg.inclusions.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>
    <div class="exc-box">
      <h4>✗ What's Excluded</h4>
      <ul style="margin: 0; padding-left: 18px;">
        ${pkg.exclusions.map(e => `<li>${e}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="footer">
    <span>YatraSafar Holidays • Approved by Ministry of Tourism • Verified Fixed Departures</span>
    <span>www.yatrasafar.com • Booking ID: YS-ITIN-${pkg.id.toUpperCase()}</span>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print when opened
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;
  };

  // Download text file
  const handleDownloadTxt = () => {
    const text = generateItineraryText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `YatraSafar-Itinerary-${pkg.destination.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download or print formatted HTML brochure
  const handlePrintOrDownloadBrochure = () => {
    const htmlContent = generateBrochureHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Try opening print window
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      // If popup was blocked by browser, trigger direct file download
      const link = document.createElement('a');
      link.href = url;
      link.download = `YatraSafar-Itinerary-${pkg.destination.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Copy WhatsApp Shareable Itinerary
  const handleCopyWhatsApp = () => {
    const waText = `✈️ *${pkg.title}*
📍 Destination: ${pkg.destination} (${pkg.duration})
💰 Special Fare: ₹${pkg.price.toLocaleString('en-IN')}/person
🛫 Departure: ${pkg.departureCity}

*Day-by-Day Tour Itinerary:*
${pkg.itinerary.map(d => `*Day ${d.day}: ${d.title}*\n• Meals: ${d.meals}\n• Hotel: ${d.hotel}\n• Activities: ${d.description}\n`).join('\n')}

*Included:* ${pkg.inclusions.slice(0, 3).join(', ')} & more!
📞 Book on YatraSafar Holidays: 1800-270-0888`;

    navigator.clipboard.writeText(waText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Close on Escape key press (nested download modal first, then main modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDownloadModal) {
          setShowDownloadModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDownloadModal, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
              pkg.type === 'domestic' ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'
            }`}>
              {pkg.type === 'domestic' ? 'Domestic Package' : 'International Package'}
            </span>
            {isSoldOut && (
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-rose-600 text-white">
                SOLD OUT
              </span>
            )}
            <span className="text-xs text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300" />
              <span>{pkg.rating} ({pkg.reviewsCount} reviews)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Itinerary Download button in Header */}
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
              title="Download Day-wise Itinerary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Itinerary</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 min-h-0 p-5 sm:p-6 space-y-6">
          {/* Main Info Hero */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {pkg.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1 text-sky-700 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>{pkg.destination}, {pkg.stateOrCountry}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{pkg.duration} ({pkg.nights} Nights / {pkg.days} Days)</span>
              </span>
              {pkg.isFixedDeparture && (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                  <Plane className="w-3 h-3 -rotate-45 text-amber-600" />
                  <span>Fixed Departure from {pkg.departureCity}</span>
                </span>
              )}
            </div>
          </div>

          {/* Photo Gallery with Preview */}
          <div className="space-y-2">
            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-inner bg-slate-100">
              <img
                src={selectedPhoto}
                alt={pkg.title}
                className="w-full h-full object-cover transition duration-300"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs font-semibold">
                Photo Gallery
              </div>
            </div>

            {pkg.gallery && pkg.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pkg.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(img)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      selectedPhoto === img ? 'border-sky-600 ring-2 ring-sky-300' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Flight Fixed Departure Banner (Only for Fixed Departures) */}
          {pkg.isFixedDeparture && pkg.flightDetails ? (
            <div className="bg-gradient-to-r from-sky-900 to-sky-800 text-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-amber-300 -rotate-45" />
                  <h4 className="font-bold text-sm sm:text-base">Guaranteed Fixed Departure Flights</h4>
                </div>
                <span className="text-[11px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">
                  {pkg.remainingSeats} Seats Available
                </span>
              </div>

              {/* Seat Occupancy Bar - Matches User Screenshot */}
              {(() => {
                const totalSeats = pkg.flightDetails?.seatsTotal || (pkg.remainingSeats === 6 ? 40 : pkg.remainingSeats + 16);
                const bookedSeats = totalSeats - pkg.remainingSeats;
                const occupancyPct = Math.min(95, Math.max(15, Math.round((bookedSeats / totalSeats) * 100)));
                return (
                  <div className="bg-sky-950/60 rounded-xl p-2.5 border border-sky-700/50 mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-200 font-medium">Seat Occupancy:</span>
                      <span className="font-bold text-white">{occupancyPct}% ({pkg.remainingSeats} Left)</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-sky-700/60">
                <div>
                  <span className="text-sky-300 block text-[11px]">Airline & Flight</span>
                  <span className="font-bold">{pkg.flightDetails.airline} ({pkg.flightDetails.flightNumber})</span>
                </div>
                <div>
                  <span className="text-sky-300 block text-[11px]">Route</span>
                  <span className="font-bold">{pkg.departureCity} ➔ {pkg.destination}</span>
                </div>
                <div>
                  <span className="text-sky-300 block text-[11px]">Flight Timing</span>
                  <span className="font-bold">{pkg.flightDetails.departureTime} - {pkg.flightDetails.arrivalTime}</span>
                </div>
                <div>
                  <span className="text-sky-300 block text-[11px]">Baggage Included</span>
                  <span className="font-bold">{pkg.flightDetails.baggage}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-sky-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-amber-200 font-semibold">Guaranteed Departures:</span>
                  {pkg.departureDates.map((date) => (
                    <span key={date} className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                      {date}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToBook(pkg);
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-950" />
                  <span>Check Seat Availability Calendar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Flexible Tour Package</h4>
                  <p className="text-slate-500">Pick any travel date, enjoy private transfers, premium stays, and custom itinerary options.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {pkg.departureDates.map((d, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-2 pb-1 sm:pb-0">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition shrink-0 ${
                  activeTab === 'itinerary'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Day-by-Day Itinerary ({pkg.itinerary.length} Days)
              </button>
              <button
                onClick={() => setActiveTab('inclusions')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition shrink-0 ${
                  activeTab === 'inclusions'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Inclusions & Exclusions
              </button>
              {pkg.flightDetails && (
                <button
                  onClick={() => setActiveTab('flight')}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition shrink-0 ${
                    activeTab === 'flight'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Flight & Hotel Details
                </button>
              )}
            </div>

            <button
              onClick={() => setShowDownloadModal(true)}
              className="self-start sm:self-auto mb-1 sm:mb-0 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs border border-sky-200 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Download / Print Itinerary</span>
            </button>
          </div>

          {/* Tab 1: Day-by-day Itinerary */}
          {activeTab === 'itinerary' && (
            <div className="space-y-3">
              {pkg.itinerary.map((day) => (
                <div 
                  key={day.day}
                  className="border border-slate-200 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        D{day.day}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{day.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-amber-500" />
                            <span>{day.meals}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-indigo-500" />
                            <span>{day.hotel}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedDay === day.day ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedDay === day.day && (
                    <div className="p-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {day.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Inclusions & Exclusions */}
          {activeTab === 'inclusions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inclusions */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-bold text-emerald-900 text-sm mb-3 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>What's Included in Package</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-red-50/50 border border-red-200 rounded-xl p-4">
                <h4 className="font-bold text-red-900 text-sm mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>What's NOT Included</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {pkg.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 3: Flight & Hotel Details */}
          {activeTab === 'flight' && pkg.flightDetails && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-sky-600" />
                  <span>Fixed Departure Flight Schedule</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Departure Airport</span>
                    <p className="font-semibold text-slate-800">{pkg.flightDetails.departureAirport}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Arrival Airport</span>
                    <p className="font-semibold text-slate-800">{pkg.flightDetails.arrivalAirport}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Baggage Allowance</span>
                    <p className="font-semibold text-slate-800">{pkg.flightDetails.baggage}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Accommodations & Hotel Standards</span>
                </h4>
                <p className="text-xs text-slate-600">
                  All stays are vetted 4-Star or Deluxe boutique properties with daily breakfast, private bathrooms, Wi-Fi, and 24-hour reception.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer with Pricing & Booking Trigger */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 line-through">
                ₹{pkg.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save ₹{(pkg.originalPrice - pkg.price).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              ₹{pkg.price.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-500 ml-1">/ traveler</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDownloadModal(true)}
              className="px-3 sm:px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Download</span>
              <span>Itinerary</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs sm:text-sm font-bold transition"
            >
              Close
            </button>
            {isSoldOut ? (
              <button
                onClick={() => {
                  onClose();
                  onProceedToBook(pkg);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold transition shadow-md flex items-center gap-2"
                title="View departure dates calendar & waitlist"
              >
                <span>Check Alternate Dates / Waitlist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onProceedToBook(pkg);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-sky-600/20 flex items-center gap-2"
              >
                <span>Book This Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Download Itinerary Modal */}
      {showDownloadModal && (
        <div 
          className="fixed inset-0 z-[60] overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDownloadModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg font-display">Download Tour Itinerary</h3>
                  <p className="text-xs text-slate-300">{pkg.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content & Options */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
              {/* Quick Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: PDF Brochure */}
                <button
                  onClick={handlePrintOrDownloadBrochure}
                  className="p-4 rounded-2xl border-2 border-sky-200 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 text-left transition group shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">Print / PDF Brochure</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Color-formatted travel brochure with logo, flight timings & all days.
                  </p>
                </button>

                {/* Option 2: Offline File */}
                <button
                  onClick={handleDownloadTxt}
                  className="p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-left transition group shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">Offline File (.txt)</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Lightweight day-by-day plan to view on your phone without internet.
                  </p>
                </button>

                {/* Option 3: WhatsApp Share */}
                <button
                  onClick={handleCopyWhatsApp}
                  className="p-4 rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-left transition group shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                    {copied ? <CheckCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {copied ? 'Copied to Clipboard!' : 'Copy for WhatsApp'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Formatted text to share instantly with family or co-travelers.
                  </p>
                </button>
              </div>

              {/* Itinerary Preview Sheet */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Included in this Itinerary ({pkg.itinerary.length} Days)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Official Voucher
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                  {pkg.itinerary.map((d) => (
                    <div key={d.day} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span className="text-sky-700">Day {d.day}: {d.title}</span>
                        <span className="text-[10px] text-slate-500">{d.meals}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                        {d.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Departure: {pkg.departureCity}</span>
                  <span>Fare: ₹{pkg.price.toLocaleString('en-IN')}/person</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
