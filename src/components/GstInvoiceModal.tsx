import React, { useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Building2,
  Plane,
  Sparkles
} from 'lucide-react';
import { BookingRecord } from '../types/travel';

interface GstInvoiceModalProps {
  booking: BookingRecord;
  onClose: () => void;
}

export const GstInvoiceModal: React.FC<GstInvoiceModalProps> = ({ booking, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const invoiceNumber = booking.gstInvoiceNumber || `YS/26-27/INV-${booking.id.replace(/[^0-9]/g, '').padEnd(4, '0') || '1088'}`;
  const totalAmount = booking.totalAmount;
  const isToken = booking.paymentType === 'TokenDeposit';
  const amountPaid = booking.amountPaid ?? totalAmount;
  const balanceDue = booking.balanceDue ?? (totalAmount - amountPaid);
  
  // Tax breakdown: 5% GST (2.5% CGST + 2.5% SGST)
  const taxableValue = Math.round(totalAmount / 1.05);
  const totalGst = totalAmount - taxableValue;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    const invoiceHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; background: #fff; }
    .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; border-radius: 8px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 800; color: #0284c7; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f8fafc; font-weight: 700; }
    .text-right { text-align: right; }
    .badge { display: inline-block; padding: 4px 8px; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="brand">YatraSafar Private Limited</div>
        <p style="margin: 4px 0; font-size: 12px; color: #475569;">Regd. Office: 402, Trade Avenue, BKC, Mumbai - 400051</p>
        <p style="margin: 2px 0; font-size: 12px; color: #475569;"><strong>GSTIN:</strong> 27AABCY8912K1Z9 | <strong>PAN:</strong> AABCY8912K</p>
      </div>
      <div style="text-align: right;">
        <h2 style="margin: 0; color: #0f172a; font-size: 20px;">TAX INVOICE</h2>
        <p style="margin: 4px 0; font-size: 12px; font-weight: 700; color: #0284c7;">${invoiceNumber}</p>
        <p style="margin: 2px 0; font-size: 12px; color: #64748b;">Date: ${booking.bookingDate}</p>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px;">
      <div>
        <strong>Billed To:</strong><br>
        ${booking.contactName}<br>
        Phone: ${booking.contactPhone}<br>
        Email: ${booking.contactEmail}
      </div>
      <div style="text-align: right;">
        <strong>Tour Confirmation Details:</strong><br>
        PNR: <strong>${booking.pnrNumber}</strong><br>
        Destination: ${booking.destination}<br>
        Departure: ${booking.departureDate} (${booking.departureCity})
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description of Services</th>
          <th>SAC Code</th>
          <th>Qty (Pax)</th>
          <th class="text-right">Taxable Value</th>
          <th class="text-right">CGST (2.5%)</th>
          <th class="text-right">SGST (2.5%)</th>
          <th class="text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${booking.packageTitle}</strong><br>
            <span style="font-size: 11px; color: #64748b;">Includes Flight PNR, ${booking.hotelName}, transfers & sightseeing</span>
          </td>
          <td>998555</td>
          <td>${booking.passengers.length}</td>
          <td class="text-right">₹${taxableValue.toLocaleString('en-IN')}</td>
          <td class="text-right">₹${cgst.toLocaleString('en-IN')}</td>
          <td class="text-right">₹${sgst.toLocaleString('en-IN')}</td>
          <td class="text-right"><strong>₹${totalAmount.toLocaleString('en-IN')}</strong></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 13px;">
      <div>
        <p><strong>Payment Status:</strong> <span class="badge">${booking.paymentStatus === 'Success' ? 'PAID / CONFIRMED' : 'TOKEN ADVANCE'}</span></p>
        <p>Payment Mode: ${booking.paymentMethod} | Reference: ${booking.id}</p>
        ${isToken && balanceDue > 0 ? `<p style="color: #b45309; font-weight: bold;">Balance Due: ₹${balanceDue.toLocaleString('en-IN')} (Payable 7 days before departure)</p>` : ''}
      </div>
      <div style="text-align: right; width: 260px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Subtotal:</span>
          <span>₹${taxableValue.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>CGST (2.5%):</span>
          <span>₹${cgst.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>SGST (2.5%):</span>
          <span>₹${sgst.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #0f172a; font-weight: 800; font-size: 15px;">
          <span>Total Invoice:</span>
          <span>₹${totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #166534; font-weight: 700;">
          <span>Amount Paid:</span>
          <span>₹${amountPaid.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
      <div>
        <p>This is a computer-generated tax invoice and requires no physical signature.</p>
        <p>Governing Law: Subject to Mumbai Jurisdiction.</p>
      </div>
      <div style="text-align: right;">
        <p>For <strong>YatraSafar Private Limited</strong></p>
        <br>
        <p><strong>Authorized Signatory</strong></p>
      </div>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax-Invoice-${invoiceNumber.replace(/\//g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto relative border border-slate-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg font-display">Official GST Tax Invoice</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  GST Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">Invoice No: {invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Invoice"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadInvoice}
              title="Download Invoice"
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              title="Close (Esc)"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Paper Layout */}
        <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-slate-50/50 space-y-6 text-xs text-slate-700">
          {/* Company & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h4 className="font-extrabold text-sky-700 text-base">YatraSafar Private Limited</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">402, Trade Avenue, BKC, Mumbai, Maharashtra - 400051</p>
              <p className="text-[11px] text-slate-600 font-medium">
                <strong>GSTIN:</strong> 27AABCY8912K1Z9 | <strong>PAN:</strong> AABCY8912K
              </p>
              <p className="text-[11px] text-slate-500">Ministry of Tourism Reg. No: MOT/MH/2024/0991</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Original for Recipient</span>
              <div className="text-sm font-extrabold text-slate-900 font-mono">{invoiceNumber}</div>
              <div className="text-slate-500 text-[11px]">Invoice Date: <strong className="text-slate-800">{booking.bookingDate}</strong></div>
              <div className="text-slate-500 text-[11px]">Place of Supply: <strong className="text-slate-800">Maharashtra (27)</strong></div>
            </div>
          </div>

          {/* Traveler & Flight Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Customer Billing Details</span>
              <div className="font-bold text-slate-900 text-sm">{booking.contactName}</div>
              <div className="text-slate-600">{booking.contactPhone} • {booking.contactEmail}</div>
              <div className="text-[11px] text-slate-500">Number of Passengers: {booking.passengers.length} ({booking.passengerCount.adults} Adults, {booking.passengerCount.children} Children)</div>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Fixed Departure Booking</span>
              <div className="font-extrabold text-slate-900">{booking.packageTitle}</div>
              <div className="text-sky-700 font-mono font-bold">Flight PNR: {booking.pnrNumber}</div>
              <div className="text-[11px] text-slate-600">Departure: {booking.departureDate} from {booking.departureCity}</div>
            </div>
          </div>

          {/* Services Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">SAC</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">CGST (2.5%)</th>
                  <th className="py-2.5 px-3 text-right">SGST (2.5%)</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{booking.packageTitle}</div>
                    <div className="text-[10px] text-slate-500">
                      Guaranteed airline seats + Hotel ({booking.hotelName}) + Sightseeing & Transfers
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">998555</td>
                  <td className="py-3 px-3 text-right font-mono">₹{taxableValue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{cgst.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono">₹{sgst.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</td>
                </tr>

                {/* If there were Add-ons */}
                {booking.selectedAddOns && booking.selectedAddOns.length > 0 && (
                  booking.selectedAddOns.map(addon => (
                    <tr key={addon.id} className="bg-sky-50/30">
                      <td className="py-2 px-3 text-[11px]">
                        <span className="font-semibold text-slate-800">Add-On: {addon.title}</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px]">998555</td>
                      <td className="py-2 px-3 text-right font-mono text-[11px]">Included</td>
                      <td className="py-2 px-3 text-right font-mono text-[11px]">-</td>
                      <td className="py-2 px-3 text-right font-mono text-[11px]">-</td>
                      <td className="py-2 px-3 text-right font-mono text-[11px] font-bold">₹{addon.price.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals and Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Settlement & Terms</span>
              <div className="text-xs">
                Payment Status: <strong className="text-emerald-700">{booking.paymentStatus === 'Success' ? '✓ Fully Settled' : 'Partially Settled (Token Deposit)'}</strong>
              </div>
              <div className="text-[11px] text-slate-500">Method: {booking.paymentMethod} • Ref: {booking.id}</div>
              {isToken && balanceDue > 0 ? (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold mt-1">
                  Remaining Balance of ₹{balanceDue.toLocaleString('en-IN')} payable by {booking.balanceDueDate || '7 days prior to departure'}.
                </div>
              ) : (
                <div className="text-[11px] text-emerald-700 font-medium">
                  ✓ 100% Package & Flight PNR fees fully cleared.
                </div>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono">₹{taxableValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Central GST (2.5%):</span>
                <span className="font-mono">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State GST (2.5%):</span>
                <span className="font-mono">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-sky-700">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <span>Amount Paid:</span>
                <span className="font-mono">₹{amountPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer certification */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Electronically certified tax invoice under Section 31 of CGST Act, 2017.</span>
            </div>
            <div className="text-right font-medium">
              Authorized Signatory: <strong>YatraSafar Travel Accounts</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
