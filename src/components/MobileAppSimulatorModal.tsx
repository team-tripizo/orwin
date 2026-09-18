import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Apple, 
  QrCode, 
  Download, 
  Share, 
  Compass, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles,
  Home,
  Plane,
  Gift,
  User
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  referrerReward?: number;
  refereeReward?: number;
}

export const MobileAppSimulatorModal: React.FC<MobileAppSimulatorModalProps> = ({
  isOpen,
  onClose,
  referralCode,
  referrerReward = 1500,
  refereeReward = 500,
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [activeScreen, setActiveScreen] = useState<'home' | 'departures' | 'refer' | 'profile'>('home');
  const [showInstallTip, setShowInstallTip] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

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

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto my-auto relative">
        {/* Container Header with X close button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                YatraSafar Mobile Apps Simulator
              </h3>
              <p className="text-xs text-slate-500">Native PWA Experience for iOS (iPhone/iPad) & Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition shadow-xs cursor-pointer"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left column guide + Right column phone preview */}
        <div className="flex flex-col lg:flex-row gap-6 pt-4 flex-1 min-h-0 overflow-y-auto">
          {/* Left column: Platform switch & Native Installation Guide */}
          <div className="flex-1 space-y-5">

          {/* Platform Switcher Buttons */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setPlatform('ios')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                platform === 'ios'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>iOS (iPhone App)</span>
            </button>

            <button
              onClick={() => setPlatform('android')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                platform === 'android'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-emerald-600 font-bold">🤖</span>
              <span>Android (APK / WebApp)</span>
            </button>
          </div>

          {/* Quick 1-Click Install Button if supported */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Direct 1-Click Installation</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                0 MB Storage
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Install directly to your home screen with offline flight itineraries and push notification alerts.
            </p>
            <button
              type="button"
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setShowInstallTip(true);
                }
              }}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'Already Installed on This Device' : 'Install YatraSafar App Now'}</span>
            </button>

            {showInstallTip && (
              <div className="p-3 bg-sky-100/70 border border-sky-300 rounded-xl text-xs text-sky-950 space-y-1 animate-in fade-in">
                <p className="font-bold">
                  {platform === 'ios' ? '📱 How to install on iOS:' : '🤖 How to install on Android:'}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {platform === 'ios'
                    ? 'Tap the Safari "Share" icon (square with upward arrow) at the bottom, then scroll and tap "Add to Home Screen".'
                    : 'Tap the 3 dots menu (⋮) at top right of Chrome/browser and select "Install app" or "Add to Home Screen".'}
                </p>
              </div>
            )}
          </div>

          {/* Instructions specific to platform */}
          {platform === 'ios' ? (
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Apple className="w-4 h-4" />
                <span>How to Install on iPhone / iPad (Safari)</span>
              </h4>
              <ol className="space-y-2.5 text-slate-600 list-decimal list-inside">
                <li>Open this website in <strong>Apple Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> at bottom center.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-sky-600" />.</li>
                <li>Tap <strong>Add</strong> at top right to launch full-screen with offline support!</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span>🤖</span>
                <span>How to Install on Android (Chrome / Play Store)</span>
              </h4>
              <ol className="space-y-2.5 text-slate-600 list-decimal list-inside">
                <li>Open this website in <strong>Google Chrome</strong> or Edge.</li>
                <li>Tap the prompt <strong>"Add YatraSafar to Home screen"</strong> or the 3-dots menu at top-right.</li>
                <li>Tap <strong>Install App</strong>.</li>
                <li>Enjoy native push notifications, offline vouchers, and fast departures booking!</li>
              </ol>
            </div>
          )}

          {/* Scan QR code to launch on phone */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
              <QrCode className="w-11 h-11 text-slate-800" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Scan to Open on Mobile</span>
              <p className="text-[11px] text-slate-500">
                Point your phone camera at this QR to open YatraSafar directly on your iOS or Android device.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Mobile Mockup Frame */}
        <div className="w-full lg:w-[320px] flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live {platform.toUpperCase()} Simulator
            </span>
          </div>

          {/* Smartphone Hardware Frame */}
          <div className={`w-[290px] h-[550px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 ${
            platform === 'ios' ? 'border-slate-800' : 'border-slate-700'
          } relative flex flex-col justify-between overflow-hidden`}>
            {/* Top Island / Camera notch */}
            {platform === 'ios' ? (
              <div className="w-24 h-5 bg-black rounded-full mx-auto z-20 shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900 ml-auto mr-2"></div>
              </div>
            ) : (
              <div className="w-3 h-3 bg-black rounded-full mx-auto z-20 shrink-0 mt-0.5"></div>
            )}

            {/* Mobile Screen Simulated UI */}
            <div className="bg-slate-900 text-white flex-1 rounded-[32px] overflow-y-auto flex flex-col mt-2 mb-2 p-3 text-xs relative">
              {/* Mobile App Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-amber-500 flex items-center justify-center text-white text-[10px]">
                    <Plane className="w-3 h-3 -rotate-45" />
                  </div>
                  <span className="font-extrabold text-xs">YatraSafar</span>
                </div>
                <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                  APP
                </span>
              </div>

              {/* Screen Content based on bottom tab */}
              {activeScreen === 'home' && (
                <div className="py-2.5 space-y-2.5">
                  <div className="p-2.5 bg-gradient-to-r from-sky-800 to-sky-700 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-amber-300">DIWALI SPECIAL</span>
                    <h5 className="font-extrabold text-xs leading-tight">Fixed Flight Holiday Packages</h5>
                    <p className="text-[10px] text-sky-200">Kashmir, Dubai, Bali starting ₹18,999</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Popular Trips</span>
                    <div className="p-2 bg-slate-800 rounded-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-sky-900 shrink-0 flex items-center justify-center font-bold text-sky-400 text-[10px]">
                        KASHMIR
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[11px]">Kashmir Paradise</p>
                        <p className="text-[9px] text-slate-400">Fixed Flight from DEL • ₹21,499</p>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-800 rounded-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-900 shrink-0 flex items-center justify-center font-bold text-amber-400 text-[10px]">
                        DUBAI
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[11px]">Dubai & Abu Dhabi</p>
                        <p className="text-[9px] text-slate-400">Fixed Flight from BOM • ₹48,999</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeScreen === 'departures' && (
                <div className="py-2.5 space-y-2 text-[10px]">
                  <h5 className="font-bold text-xs text-amber-300">Guaranteed Flight Departures</h5>
                  <div className="p-2 bg-slate-800 rounded-lg space-y-1">
                    <span className="text-emerald-400 font-bold">● 6E-2412 (DEL ➔ SXR)</span>
                    <p className="text-slate-300">20 Oct 2026 • 6 Seats Left</p>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg space-y-1">
                    <span className="text-emerald-400 font-bold">● EK-501 (BOM ➔ DXB)</span>
                    <p className="text-slate-300">24 Oct 2026 • 8 Seats Left</p>
                  </div>
                </div>
              )}

              {activeScreen === 'refer' && (
                <div className="py-2.5 space-y-2 text-center">
                  <Gift className="w-7 h-7 text-amber-400 mx-auto" />
                  <h5 className="font-bold text-xs">Refer & Earn ₹{referrerReward.toLocaleString('en-IN')} Cash</h5>
                  <p className="text-[10px] text-slate-300">
                    Your referral code: <strong className="text-amber-300 font-mono">{referralCode}</strong>
                  </p>
                  <div className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-lg text-[10px] text-amber-200">
                    Your Friend Gets: ₹2,000 OFF
                  </div>
                </div>
              )}

              {activeScreen === 'profile' && (
                <div className="py-2.5 space-y-2 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                      GS
                    </div>
                    <div>
                      <p className="font-bold text-xs">Ganesh Sharma</p>
                      <p className="text-slate-400">Wallet: ₹3,000</p>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <p className="font-bold text-emerald-400">Upcoming: Kashmir Tour</p>
                    <p className="text-slate-400">PNR: 6E-9842 • 20 Oct 2026</p>
                  </div>
                </div>
              )}

              {/* Bottom Native Navigation Tabs */}
              <div className="mt-auto pt-2 border-t border-slate-800 grid grid-cols-4 gap-1 text-center text-[9px]">
                <button
                  onClick={() => setActiveScreen('home')}
                  className={`flex flex-col items-center py-1 ${activeScreen === 'home' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setActiveScreen('departures')}
                  className={`flex flex-col items-center py-1 ${activeScreen === 'departures' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Flights</span>
                </button>
                <button
                  onClick={() => setActiveScreen('refer')}
                  className={`flex flex-col items-center py-1 ${activeScreen === 'refer' ? 'text-amber-400 font-bold' : 'text-slate-500'}`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Earn</span>
                </button>
                <button
                  onClick={() => setActiveScreen('profile')}
                  className={`flex flex-col items-center py-1 ${activeScreen === 'profile' ? 'text-sky-400 font-bold' : 'text-slate-500'}`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Account</span>
                </button>
              </div>
            </div>

            {/* Bottom Home indicator bar */}
            <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto shrink-0 mt-0.5"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
