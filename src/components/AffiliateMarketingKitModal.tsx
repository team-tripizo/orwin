import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  QrCode, 
  Smartphone, 
  Gift, 
  Plane, 
  CheckCircle2, 
  Flame,
  Award,
  Users
} from 'lucide-react';

interface AffiliateMarketingKitModalProps {
  referralCode: string;
  onClose: () => void;
  userTier?: string;
}

export const AffiliateMarketingKitModal: React.FC<AffiliateMarketingKitModalProps> = ({
  referralCode,
  onClose,
  userTier = 'Partner',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`;
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const promoCreatives = [
    {
      id: 'whatsapp-family',
      badge: '🔥 Highest Converting',
      title: 'Family & Group Holiday WhatsApp Pitch',
      text: `✈️ *Exclusive Flight + Holiday Departures with Guaranteed Airline Tickets!* 🏖️\n\nPlanning your next vacation to Dubai, Kashmir, Bali, Vietnam or Kerala? Check out YatraSafar's fixed group departures!\n\n🎁 *Special Offer:* Use my VIP Referral Code *${referralCode}* to get *₹500 Instant Cashback* credited to your travel wallet!\n\n👉 Book your seat here:\n${referralLink}`,
    },
    {
      id: 'luxury-escape',
      badge: '✨ Premium Travel',
      title: 'Luxury 5-Star International Getaways',
      text: `🌴 *Book Your Dream Luxury Holiday with YatraSafar!* ✈️\n\nExperience 5-star hotels, verified airline PNRs, guided transfers & hassle-free visas.\n\nBook using code *${referralCode}* for special member rates & ₹500 welcome bonus:\n${referralLink}`,
    },
    {
      id: 'affiliate-invite',
      badge: '💼 Agent & Partner Invite',
      title: 'Affiliate Partner Recruitment Pitch',
      text: `💼 *Start Your Travel Business with Zero Investment!* 🚀\n\nJoin the YatraSafar Affiliate & Partner Network! Earn up to ₹1,500 on every direct holiday booking + 2-tier downline overrides on every traveler referral.\n\n👉 Sign up under my team with code *${referralCode}*:\n${referralLink}`,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  const handleShareWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg font-display">Affiliate Growth & Marketing Kit</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {userTier} Pro
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ready-to-share promotional messages, banners & viral invite links for your network.
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

        {/* Quick Link & Code Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles className="w-3.5 h-3.5" />
              Your Verified Referral Identity
            </div>
            <div className="text-2xl font-black font-mono tracking-wide text-white">
              {referralCode}
            </div>
            <div className="text-xs text-slate-300 font-mono break-all max-w-sm">
              {referralLink}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={() => handleShareWhatsApp(`Hi! Join YatraSafar fixed holiday departures with ₹500 welcome cash using my referral code: ${referralCode}\n${referralLink}`)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Ready-to-Use Creatives List */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>High-Converting Promotional WhatsApp Copy</span>
          </h4>

          <div className="space-y-3">
            {promoCreatives.map((creative, index) => {
              const isCopied = copiedMessageIndex === index;
              return (
                <div 
                  key={creative.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800">{creative.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {creative.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyText(creative.text, index)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(creative.text)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3 h-3 text-emerald-600" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs font-sans text-slate-700 whitespace-pre-line leading-relaxed">
                    {creative.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promoter Tip Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-sky-50 to-white border border-amber-200 text-xs text-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Promoter Strategy:</strong> Share in travel clubs, alumni WhatsApp groups, and corporate friends. When 10 direct friends book, you unlock Partner Tier & 2-tier downline overrides!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
