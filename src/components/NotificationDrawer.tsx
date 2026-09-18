import React, { useEffect } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Plane, 
  Gift, 
  ShieldCheck, 
  Info, 
  Clock,
  Sparkles
} from 'lucide-react';
import { NotificationItem } from '../types/travel';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearNotification: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearNotification,
}) => {
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
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-display">Notifications & Alerts</h3>
              <p className="text-[11px] text-slate-400">
                {notifications.filter(n => !n.read).length} unread updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold p-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Close (Esc)"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No notifications yet</p>
              <p className="text-xs text-slate-400">
                Your booking confirmations, flight departure alerts, and referral rewards will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const getIcon = () => {
                switch (item.type) {
                  case 'booking':
                    return <Plane className="w-4 h-4 text-sky-600" />;
                  case 'referral':
                    return <Gift className="w-4 h-4 text-amber-600" />;
                  case 'price_alert':
                    return <Sparkles className="w-4 h-4 text-emerald-600" />;
                  default:
                    return <Info className="w-4 h-4 text-indigo-600" />;
                }
              };

              return (
                <div
                  key={item.id}
                  className={`pt-3 first:pt-0 pb-1 flex items-start gap-3 transition ${
                    !item.read ? 'bg-sky-50/40 p-2.5 rounded-xl' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon()}
                  </div>

                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp}</span>
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                  </div>

                  <button
                    onClick={() => onClearNotification(item.id)}
                    className="text-slate-300 hover:text-slate-500 text-xs p-1"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-500">
            Push alerts are enabled on your device for instant flight departure notices.
          </p>
        </div>
      </div>
    </div>
  );
};
