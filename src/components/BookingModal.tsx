import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Check,
  CreditCard, 
  QrCode, 
  Smartphone, 
  Building, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Plane, 
  ArrowRight, 
  ArrowLeft, 
  Gift, 
  Download, 
  Printer, 
  Sparkles,
  Lock,
  Tag,
  Clock,
  FileCheck,
  FileText,
  BadgePercent
} from 'lucide-react';
import { HolidayPackage, BookingRecord, Passenger } from '../types/travel';
import { DepartureCalendarView } from './DepartureCalendarView';
import { GstInvoiceModal } from './GstInvoiceModal';
import { TravelChecklistModal } from './TravelChecklistModal';

interface BookingModalProps {
  pkg: HolidayPackage | null;
  onClose: () => void;
  onBookingSuccess: (booking: BookingRecord, referralBonusEarned: boolean) => void;
  userWalletBalance: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  pkg,
  onClose,
  onBookingSuccess,
  userWalletBalance,
}) => {
  if (!pkg) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Configuration
  const [selectedDate, setSelectedDate] = useState(pkg.departureDates[0] || '20 Oct 2026');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Step 2: Passenger & Contact
  const [contactName, setContactName] = useState('Ganesh Sharma');
  const [contactEmail, setContactEmail] = useState('ganesh@example.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: 'Ganesh Sharma', age: 32, gender: 'Male' },
    { name: 'Sunita Sharma', age: 30, gender: 'Female' },
  ]);

  // Step 3: Payment & Promo
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'EMI'>('UPI');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // UPI App selected
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('qr');
  const [upiId, setUpiId] = useState('ganesh@okaxis');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [upiError, setUpiError] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  // Optional Add-on Experiences & Customizations
  const availableAddOns = [
    {
      id: 'insurance',
      title: 'Comprehensive Travel & Medical Insurance',
      description: 'Covers up to ₹5 Lakh emergency medical, trip delay & luggage protection',
      price: 499,
      perPerson: true,
    },
    {
      id: 'transfer',
      title: 'Airport VIP Chauffeur Meet & Greet Transfer',
      description: 'Private sedan with dedicated arrival placard directly to hotel lobby',
      price: 1500,
      perPerson: false,
    },
    {
      id: 'dinner-experience',
      title: pkg.type === 'international' ? 'Exclusive Sunset Yacht / Desert Safari Feast' : 'Special Candlelight Dinner & Folk Cultural Show',
      description: 'Curated gourmet chef dinner with luxury roundtrip transport included',
      price: 2200,
      perPerson: false,
    },
  ];

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [paymentTypeOption, setPaymentTypeOption] = useState<'Full' | 'TokenDeposit'>('Full');
  const [showGstModal, setShowGstModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Step 4: Final Booking state
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Calculations
  const basePricePerPerson = pkg.price;
  const childPricePerPerson = Math.round(pkg.price * 0.75);
  const addOnsTotal = selectedAddOns.reduce((acc, id) => {
    const item = availableAddOns.find((a) => a.id === id);
    if (!item) return acc;
    return acc + (item.perPerson ? item.price * adults : item.price);
  }, 0);
  const subtotal = adults * basePricePerPerson + children * childPricePerPerson + addOnsTotal;
  const taxesAndFees = Math.round(subtotal * 0.05); // 5% GST on tour packages
  const walletDeduction = useWallet ? Math.min(userWalletBalance, subtotal) : 0;
  const grandTotal = Math.max(0, subtotal + taxesAndFees - discountAmount - walletDeduction);

  const tokenDepositAmount = Math.max(5000, Math.round(grandTotal * 0.25));
  const effectivePayAmount = paymentTypeOption === 'TokenDeposit' ? tokenDepositAmount : grandTotal;
  const balanceDueAmount = paymentTypeOption === 'TokenDeposit' ? grandTotal - tokenDepositAmount : 0;

  // Update passenger count array
  const handleAdultChange = (count: number) => {
    setAdults(count);
    const newPassengers: Passenger[] = [];
    for (let i = 0; i < count; i++) {
      newPassengers.push(passengers[i] || { name: `Traveler ${i + 1}`, age: 30, gender: 'Male' });
    }
    setPassengers(newPassengers);
  };

  const handlePassengerNameChange = (index: number, name: string) => {
    const updated = [...passengers];
    updated[index].name = name;
    setPassengers(updated);
  };

  const handleApplyPromo = () => {
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'DIWALI2000' || code === 'YS2000' || code.startsWith('YS-') || code.startsWith('YATRA')) {
      setDiscountAmount(2000);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try "DIWALI2000" or referral code "YS-GANESH789"');
    }
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      setUpiError('Please enter a valid UPI address (e.g. mobile@upi or name@okaxis)');
      setUpiVerified(false);
      return;
    }
    setUpiError(null);
    setUpiVerifying(true);
    setTimeout(() => {
      setUpiVerifying(false);
      setUpiVerified(true);
    }, 500);
  };

  const handleDownloadTicket = () => {
    if (!confirmedBooking) return;
    
    // Create actual offline HTML e-ticket
    const ticketHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>YatraSafar E-Ticket - ${confirmedBooking.pnrNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; background: #f8fafc; }
    .ticket { max-width: 650px; margin: 0 auto; background: white; border: 2px solid #0284c7; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 900; color: #0284c7; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; }
    .pnr-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .pnr-num { font-size: 20px; font-weight: 900; font-family: monospace; color: #0f766e; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
    .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .field-val { font-size: 15px; font-weight: 800; color: #1e293b; margin-top: 2px; }
    .passengers { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div>
        <div class="brand">✈️ YatraSafar Holidays</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Guaranteed Flight Departure E-Voucher</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">CONFIRMED &amp; TICKETED</span>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Ref: ${confirmedBooking.bookingRef}</div>
      </div>
    </div>
    <div class="pnr-box">
      <div>
        <div class="field-label">Official Airline PNR</div>
        <div class="pnr-num">${confirmedBooking.pnrNumber}</div>
      </div>
      <div style="text-align: right;">
        <div class="field-label">Flight Details</div>
        <div style="font-weight: 800; color: #0369a1;">${pkg.flightDetails?.airline || 'IndiGo'} (${pkg.flightDetails?.flightNumber || '6E-5034'})</div>
      </div>
    </div>
    <div class="grid">
      <div><div class="field-label">Holiday Package</div><div class="field-val">${confirmedBooking.packageTitle}</div></div>
      <div><div class="field-label">Departure Hub</div><div class="field-val">${confirmedBooking.departureCity} ✈️ ${confirmedBooking.destination}</div></div>
      <div><div class="field-label">Travel Date</div><div class="field-val">${confirmedBooking.departureDate}</div></div>
      <div><div class="field-label">Total Amount Paid</div><div class="field-val">₹${confirmedBooking.totalAmount.toLocaleString('en-IN')} (All Taxes Included)</div></div>
    </div>
    <div class="passengers">
      <div class="field-label">Confirmed Passengers:</div>
      <div style="margin-top: 8px; font-weight: 700; color: #1e293b;">
        ${confirmedBooking.passengers.map(p => `• ${p.name} (${p.gender}, ${p.age} yrs)`).join('<br>')}
      </div>
    </div>
    <div class="footer">
      Support Helpline: 1800-270-0888 • 24x7 Airport Assistance • Present this e-ticket with Govt ID at Airport Gate
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([ticketHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YatraSafar-Ticket-${confirmedBooking.pnrNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3500);
  };

  const handleTestCardAutofill = () => {
    setCardNumber('4532 •••• •••• 8842');
    setCardExpiry('08/29');
    setCardCvv('721');
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);

      // Generate random PNR and Booking Ref
      const randomRef = `YS-${Math.floor(100000 + Math.random() * 900000)}`;
      const randomPnr = `${pkg.type === 'domestic' ? '6E' : 'EK'}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBooking: BookingRecord = {
        id: `bkg-${Date.now()}`,
        bookingRef: randomRef,
        packageId: pkg.id,
        packageTitle: pkg.title,
        packageType: pkg.type,
        destination: pkg.destination,
        departureCity: pkg.departureCity,
        departureDate: selectedDate,
        duration: pkg.duration,
        passengers: passengers,
        passengerCount: { adults, children, infants: 0 },
        contactName,
        contactEmail,
        contactPhone,
        totalAmount: grandTotal,
        discountAmount: discountAmount,
        referralRewardUsed: walletDeduction,
        paymentMethod: paymentMethod,
        paymentStatus: paymentTypeOption === 'TokenDeposit' ? 'Pending' : 'Success',
        bookingStatus: 'Confirmed',
        bookingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        pnrNumber: randomPnr,
        hotelName: pkg.itinerary[0]?.hotel || '4-Star Premium Resort',
        paymentType: paymentTypeOption,
        amountPaid: effectivePayAmount,
        balanceDue: balanceDueAmount,
        balanceDueDate: '7 days before departure',
        selectedAddOns: availableAddOns
          .filter((a) => selectedAddOns.includes(a.id))
          .map((a) => ({
            id: a.id,
            title: a.title,
            price: a.perPerson ? a.price * adults : a.price,
          })),
        gstInvoiceNumber: `YS/26-27/INV-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      setConfirmedBooking(newBooking);
      setStep(4);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }

      onBookingSuccess(newBooking, promoApplied && promoCode.toUpperCase().startsWith('YS-'));
    }, 1800);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 4) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Plane className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base line-clamp-1">
                {step === 4 ? 'Booking Confirmed! 🎉' : `Book: ${pkg.title}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 1 && 'Step 1 of 3: Select Departure & Travelers'}
                {step === 2 && 'Step 2 of 3: Passenger & Contact Info'}
                {step === 3 && 'Step 3 of 3: Secure Payment Gateway'}
                {step === 4 && 'Your official travel e-voucher and PNR are ready'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator (for steps 1-3) */}
        {step < 4 && (
          <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-bold text-center shrink-0">
            <div className={`py-2.5 border-b-2 flex items-center justify-center gap-1.5 ${step >= 1 ? 'border-sky-600 text-sky-700 bg-sky-50/50' : 'border-transparent text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">1</span>
              <span>Trip Dates</span>
            </div>
            <div className={`py-2.5 border-b-2 flex items-center justify-center gap-1.5 ${step >= 2 ? 'border-sky-600 text-sky-700 bg-sky-50/50' : 'border-transparent text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">2</span>
              <span>Travelers</span>
            </div>
            <div className={`py-2.5 border-b-2 flex items-center justify-center gap-1.5 ${step >= 3 ? 'border-sky-600 text-sky-700 bg-sky-50/50' : 'border-transparent text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">3</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 min-h-0 space-y-5">
          {/* STEP 1: Date & Travelers */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Package Summary micro card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <img src={pkg.image} alt={pkg.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="text-xs">
                  <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                    {pkg.destination}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{pkg.title}</h4>
                  <p className="text-slate-500">{pkg.duration} • Fixed Flight Departure from {pkg.departureCity}</p>
                </div>
              </div>

              {/* Departure Date Calendar & Seat Availability */}
              <div>
                <DepartureCalendarView 
                  pkg={pkg}
                  selectedDate={selectedDate}
                  onSelectDate={(newDate) => setSelectedDate(newDate)}
                  travelerCount={adults + children}
                />
              </div>

              {/* Travelers count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">Adults (12+ yrs)</span>
                      <span className="text-xs text-slate-500">₹{pkg.price.toLocaleString('en-IN')} / adult</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdultChange(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{adults}</span>
                      <button
                        onClick={() => handleAdultChange(Math.min(10, adults + 1))}
                        className="w-8 h-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">Children (2-11 yrs)</span>
                      <span className="text-xs text-slate-500">₹{childPricePerPerson.toLocaleString('en-IN')} (25% off)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{children}</span>
                      <button
                        onClick={() => setChildren(Math.min(6, children + 1))}
                        className="w-8 h-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Add-on Experiences & Upgrades */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Recommended Upgrades & Add-Ons
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Optional Extras</span>
                </div>

                <div className="space-y-2">
                  {availableAddOns.map((addon) => {
                    const isSelected = selectedAddOns.includes(addon.id);
                    const cost = addon.perPerson ? addon.price * adults : addon.price;
                    return (
                      <div
                        key={addon.id}
                        onClick={() => {
                          setSelectedAddOns((prev) =>
                            prev.includes(addon.id) ? prev.filter((i) => i !== addon.id) : [...prev, addon.id]
                          );
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-sky-50/70 border-sky-300 text-sky-950'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 text-sky-600">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-sky-600" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{addon.title}</span>
                            <span className="text-xs font-extrabold text-sky-700 font-mono shrink-0">
                              +₹{cost.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {addon.description} {addon.perPerson && `(₹${addon.price}/person × ${adults} pax)`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Passengers & Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Names must match Government ID (Aadhaar/Passport) for airline boarding pass issuance.</span>
              </div>

              {/* Lead contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lead Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (for E-Voucher)</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone (for Flight SMS alerts)</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Passenger List */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Traveler Details ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})
                </label>
                {passengers.map((p, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-slate-50/60 flex flex-wrap items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-[160px]">
                      <input
                        type="text"
                        placeholder="Full Name (as on ID)"
                        value={p.name}
                        onChange={(e) => handlePassengerNameChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Age"
                        value={p.age}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx].age = parseInt(e.target.value) || 25;
                          setPassengers(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none"
                      />
                    </div>
                    <div className="w-24">
                      <select
                        value={p.gender}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx].gender = e.target.value as any;
                          setPassengers(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Payment Gateway Checkout */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Promo & Referral Discount Box */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Have a Referral Code or Promo?</span>
                  </div>
                  {promoApplied && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ ₹{discountAmount} Discount Applied!
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Referral Code (e.g. YS-GANESH789) or DIWALI2000"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError(null);
                    }}
                    disabled={promoApplied}
                    className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium uppercase tracking-wider outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoApplied}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1.5">{promoError}</p>
                )}
              </div>

              {/* Wallet Deduction Option if user has balance */}
              {userWalletBalance > 0 && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">Use Referral Wallet Cash</span>
                      <p className="text-slate-500">Available balance: ₹{userWalletBalance.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>
              )}

              {/* Payment Plan Option: Full Payment vs Token Deposit */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentTypeOption('Full')}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between select-none ${
                      paymentTypeOption === 'Full'
                        ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Pay Full Amount (100%)</span>
                      {paymentTypeOption === 'Full' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                    </div>
                    <div className="text-sm font-extrabold text-sky-700 font-mono">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Immediate full settlement with final boarding vouchers.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentTypeOption('TokenDeposit')}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between select-none ${
                      paymentTypeOption === 'TokenDeposit'
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-950">Token Advance Deposit</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">25%</span>
                      </div>
                      {paymentTypeOption === 'TokenDeposit' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="text-sm font-extrabold text-amber-700 font-mono">
                      ₹{tokenDepositAmount.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-amber-900/80 mt-1">
                      Lock airline PNR & hotel voucher now. Pay balance ₹{balanceDueAmount.toLocaleString('en-IN')} 7 days before departure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Payment Gateway Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'UPI'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'Card'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>Debit / Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'NetBanking'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span>NetBanking</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('EMI')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'EMI'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>No-Cost EMI</span>
                  </button>
                </div>
              </div>

              {/* Payment Details Form */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                {paymentMethod === 'UPI' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Instant UPI Payment</span>
                      <span className="text-emerald-700">0% Convenience Fee</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                      {/* Simulated QR Code */}
                      <div className="w-28 h-28 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-white shrink-0 relative">
                        <QrCode className="w-20 h-20 text-white" />
                        <span className="text-[9px] font-bold text-amber-400 mt-1">SCAN TO PAY</span>
                      </div>

                      <div className="space-y-2 text-xs w-full">
                        <p className="text-slate-600 font-medium">
                          Scan with any UPI app (Google Pay, PhonePe, Paytm, BHIM) to pay <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>.
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Or enter UPI ID (e.g. mobile@upi)"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setUpiVerified(false);
                                setUpiError(null);
                              }}
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                            <button 
                              type="button"
                              onClick={handleVerifyUpi}
                              disabled={upiVerifying || upiVerified}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                upiVerified 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50'
                              }`}
                            >
                              {upiVerifying ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                  <span>Verifying...</span>
                                </>
                              ) : upiVerified ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Verified</span>
                                </>
                              ) : (
                                <span>Verify</span>
                              )}
                            </button>
                          </div>

                          {upiError && (
                            <p className="text-[11px] text-rose-600 font-medium">{upiError}</p>
                          )}
                          {upiVerified && (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Verified: Ganesh Sharma (State Bank of India UPI)</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>100% 256-bit Bank Grade Encryption</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Credit / Debit Card Details</span>
                      <button
                        onClick={handleTestCardAutofill}
                        className="text-[11px] font-bold text-sky-600 underline"
                      >
                        Autofill Test Card
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <input
                          type="text"
                          placeholder="Card Number (4532 xxxx xxxx 8842)"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium outline-none"
                        />
                        <input
                          type="password"
                          placeholder="CVV (3 digits)"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === 'NetBanking' || paymentMethod === 'EMI') && (
                  <div className="text-xs text-slate-600 space-y-2">
                    <p className="font-semibold text-slate-800">Popular Banks for instant processing:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border border-slate-200 rounded-lg bg-white flex items-center gap-2 cursor-pointer hover:border-sky-500">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span className="font-bold">HDFC Bank</span>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-lg bg-white flex items-center gap-2 cursor-pointer hover:border-sky-500">
                        <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                        <span className="font-bold">ICICI Bank</span>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-lg bg-white flex items-center gap-2 cursor-pointer hover:border-sky-500">
                        <span className="w-2 h-2 rounded-full bg-blue-800"></span>
                        <span className="font-bold">State Bank of India</span>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-lg bg-white flex items-center gap-2 cursor-pointer hover:border-sky-500">
                        <span className="w-2 h-2 rounded-full bg-purple-700"></span>
                        <span className="font-bold">Axis Bank</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown Box */}
              <div className="p-3.5 bg-slate-100 rounded-xl space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Base Package ({adults} Adults × ₹{basePricePerPerson.toLocaleString('en-IN')})</span>
                  <span className="font-semibold">₹{(adults * basePricePerPerson).toLocaleString('en-IN')}</span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between">
                    <span>Children ({children} × ₹{childPricePerPerson.toLocaleString('en-IN')})</span>
                    <span className="font-semibold">₹{(children * childPricePerPerson).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-indigo-700 font-medium">
                    <span>Upgrades & Optional Add-ons</span>
                    <span className="font-semibold">+₹{addOnsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST & Airport Departure Taxes</span>
                  <span className="font-semibold">₹{taxesAndFees.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Referral / Promo Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {walletDeduction > 0 && (
                  <div className="flex justify-between text-sky-700 font-bold">
                    <span>Referral Wallet Balance Used</span>
                    <span>-₹{walletDeduction.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Package Cost</span>
                  <span className="text-slate-900 font-display text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                {paymentTypeOption === 'TokenDeposit' && (
                  <div className="pt-2 mt-1 border-t border-amber-200 bg-amber-50/70 -mx-3.5 -mb-3.5 p-3 rounded-b-xl space-y-1">
                    <div className="flex justify-between text-xs font-bold text-amber-950">
                      <span>Today's Token Advance (25% Deposit):</span>
                      <span className="text-amber-700 font-mono text-sm">₹{tokenDepositAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-amber-900 font-medium">
                      <span>Remaining Balance Due (7 days before departure):</span>
                      <span className="font-mono">₹{balanceDueAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Confirmed E-Voucher Ticket */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-4">
              {/* Green Success Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1.5">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-emerald-950 text-lg">Booking & Payment Successful!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  A confirmation email with tax invoice, flight tickets, and hotel voucher has been dispatched to <strong>{confirmedBooking.contactEmail}</strong>.
                </p>
              </div>

              {/* Printable Official E-Voucher */}
              <div id="printable-voucher" className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-white space-y-4 relative">
                {/* Header Ticket Section */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="font-extrabold text-lg text-slate-900 font-display">YatraSafar Holidays</span>
                    <p className="text-[11px] text-slate-500">Official E-Ticket & Travel Itinerary Voucher</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      STATUS: CONFIRMED
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Ref: {confirmedBooking.bookingRef}</p>
                  </div>
                </div>

                {/* Key Flight & Package Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Destination</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Flight Departure</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.departureDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Airline PNR</span>
                    <span className="font-bold text-sky-700 font-mono">{confirmedBooking.pnrNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Origin City</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.departureCity}</span>
                  </div>
                </div>

                {/* Passenger list */}
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Travelers List:</span>
                  <div className="flex flex-wrap gap-2">
                    {confirmedBooking.passengers.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 rounded-md font-semibold text-slate-800">
                        {p.name} ({p.age}y, {p.gender})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hotel & Inclusions note */}
                <div className="text-xs text-slate-600 bg-sky-50/60 p-2.5 rounded-lg">
                  <p><strong>Accommodations:</strong> {confirmedBooking.hotelName} with Daily Breakfast Included.</p>
                  <p className="mt-0.5"><strong>Airport Transfers:</strong> Dedicated executive will meet you at airport arrival exit gate with name placard.</p>
                </div>

                {/* Total Paid */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">Paid via {confirmedBooking.paymentMethod} Gateway</span>
                  <span className="text-base font-extrabold text-slate-900 font-display">
                    Total: ₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTicket}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download E-Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGstModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Official GST Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowChecklistModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-purple-200" />
                  <span>Pre-Departure Checklist</span>
                </button>
              </div>

              {downloadSuccessToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>E-Ticket downloaded successfully to your device!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs ml-auto cursor-pointer"
            >
              <span>Continue to Travelers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs ml-auto cursor-pointer"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleProcessPayment}
              disabled={isProcessingPayment}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-emerald-600/30 ml-auto disabled:opacity-50 cursor-pointer"
            >
              {isProcessingPayment ? (
                <span>Authorizing Payment...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    Pay ₹{effectivePayAmount.toLocaleString('en-IN')} & Confirm
                    {paymentTypeOption === 'TokenDeposit' ? ' (Token Deposit)' : ''}
                  </span>
                </>
              )}
            </button>
          )}

          {step === 4 && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition ml-auto shadow-xs cursor-pointer"
            >
              Done / View My Bookings
            </button>
          )}
        </div>
      </div>

      {/* Sub-modals for GST Invoice & Travel Checklist */}
      {showGstModal && confirmedBooking && (
        <GstInvoiceModal
          booking={confirmedBooking}
          onClose={() => setShowGstModal(false)}
        />
      )}

      {showChecklistModal && confirmedBooking && (
        <TravelChecklistModal
          booking={confirmedBooking}
          onClose={() => setShowChecklistModal(false)}
        />
      )}
    </div>
  );
};
