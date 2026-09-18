import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Plane, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BookingRecord } from '../types/travel';

interface TravelChecklistModalProps {
  booking: BookingRecord;
  onClose: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'documents' | 'flights' | 'stay' | 'health';
  isRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export const TravelChecklistModal: React.FC<TravelChecklistModalProps> = ({ booking, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isInternational = booking.packageType === 'international';

  const initialItems: ChecklistItem[] = isInternational
    ? [
        {
          id: 'passport',
          title: 'Original Passport (Minimum 6 Months Validity)',
          description: `Ensure passports for all ${booking.passengers.length} passengers have at least 2 blank pages and do not expire before 6 months from ${booking.departureDate}.`,
          category: 'documents',
          isRequired: true,
        },
        {
          id: 'visa',
          title: 'Tourist Visa / Visa on Arrival Documents',
          description: `Confirmed hotel booking voucher and return flight ticket (PNR: ${booking.pnrNumber}) printed for immigration officer at ${booking.destination}.`,
          category: 'documents',
          isRequired: true,
        },
        {
          id: 'web-checkin',
          title: 'Airline Mandatory Web Check-in',
          description: 'Opens 48 hours before scheduled departure. Retrieve boarding passes online and select seats.',
          category: 'flights',
          isRequired: true,
          actionLabel: 'Check-in Guide',
        },
        {
          id: 'insurance',
          title: 'Overseas Travel Medical Insurance',
          description: 'Covers medical emergencies, baggage delays, and flight cancellations during international travel.',
          category: 'health',
          isRequired: true,
        },
        {
          id: 'forex',
          title: 'Forex Card / Local Currency Cash',
          description: `Carry international credit/forex card and minimal cash for local transit & dining at ${booking.destination}.`,
          category: 'stay',
          isRequired: false,
        },
        {
          id: 'hotel-voucher',
          title: 'Printed Hotel Voucher & Airport Transfer Slip',
          description: `Confirmed reservation at ${booking.hotelName}. Carry digital PDF or printed copy.`,
          category: 'stay',
          isRequired: true,
        },
      ]
    : [
        {
          id: 'gov-id',
          title: 'Valid Government Photo ID (Aadhaar / Voter ID / DL)',
          description: 'Required at airport security gate for all adult passengers matching airline ticket names.',
          category: 'documents',
          isRequired: true,
        },
        {
          id: 'web-checkin',
          title: 'Mandatory Airline Web Check-in',
          description: `Check-in online 48h to 60 min before departure using Airline PNR: ${booking.pnrNumber}.`,
          category: 'flights',
          isRequired: true,
        },
        {
          id: 'baggage',
          title: 'Baggage Allowance Adherence',
          description: 'Standard domestic limits: 15kg Check-in Bag + 7kg Cabin Bag per passenger.',
          category: 'flights',
          isRequired: true,
        },
        {
          id: 'hotel-voucher',
          title: 'Hotel Check-in Voucher',
          description: `Keep booking confirmation for ${booking.hotelName} handy for fast-track front desk check-in.`,
          category: 'stay',
          isRequired: true,
        },
        {
          id: 'local-weather',
          title: 'Weather-Appropriate Clothing & Essentials',
          description: `Pack comfortable layers, sunscreen, and essential medication for ${booking.destination}.`,
          category: 'health',
          isRequired: false,
        },
      ];

  const [completedIds, setCompletedIds] = useState<string[]>(['hotel-voucher']);

  const toggleItem = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round((completedIds.length / initialItems.length) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto relative border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg font-display">Pre-Departure Travel Readiness</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isInternational ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                  {isInternational ? 'International Trip' : 'Domestic Tour'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {booking.destination} • Departs {booking.departureDate} (PNR: {booking.pnrNumber})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close (Esc)"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Readiness Progress Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Traveler Readiness Score:
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${progressPercent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
              {progressPercent}% Ready ({completedIds.length}/{initialItems.length})
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-sky-600'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {progressPercent === 100 
              ? '🎉 Outstanding! All pre-flight requirements are completed. Have a wonderful holiday!' 
              : 'Complete mandatory document verification before arriving at the airport terminal.'}
          </p>
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {initialItems.map((item) => {
            const isDone = completedIds.includes(item.id);
            return (
              <div 
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                  isDone 
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-900' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 shrink-0"
                  aria-label={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {item.title}
                    </h4>
                    {item.isRequired && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 uppercase tracking-wide shrink-0">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 24/7 Departure Helpline */}
        <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
            <span>Need flight terminal assistance or visa queries? Call <strong>+91 98765 43210</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
