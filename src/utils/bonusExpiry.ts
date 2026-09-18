/**
 * Bonus Expiry and Referral Validity Utilities
 * Handles date parsing, days remaining calculation, expiry formatting, and localStorage persistence.
 */

export const REFERRAL_VALIDITY_STORAGE_KEY = 'yatrasafar_referral_validity_days';
export const REFERRAL_SETTINGS_STORAGE_KEY = 'yatrasafar_referral_settings';

/**
 * Parses diverse date formats into a standard JS Date object.
 * Handles 'Just now', 'Today', 'Yesterday', '11 Sep 2026', ISO dates, etc.
 */
export const parseRecordDate = (dateStr?: string): Date => {
  if (!dateStr || dateStr === 'Just now' || dateStr === 'Today') {
    return new Date();
  }
  if (dateStr === 'Yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date();
};

export interface BonusExpiryInfo {
  isLifetime: boolean;
  daysRemaining: number;
  displayRemaining: string;
  expiryDateFormatted: string;
  elapsedDays: number;
  percentRemaining: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
  badgeClass: string;
  progressClass: string;
}

/**
 * Calculates real-time expiry and days remaining for a bonus credit.
 * @param dateStr Issue/Creation date string of the bonus
 * @param validityDays Active validity in days (0 = Lifetime / No Expiry)
 * @param extendedDays Any admin-granted extension days (default 0)
 */
export const calculateBonusExpiry = (
  dateStr: string,
  validityDays: number,
  extendedDays = 0
): BonusExpiryInfo => {
  const effectiveTotalValidity = validityDays + extendedDays;

  // 0 Days signifies Lifetime Validity (No Expiration)
  if (validityDays === 0) {
    return {
      isLifetime: true,
      daysRemaining: 9999,
      displayRemaining: 'Lifetime (No Expiry)',
      expiryDateFormatted: 'Lifetime / Never Expires',
      elapsedDays: 0,
      percentRemaining: 100,
      isExpiringSoon: false,
      isExpired: false,
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      progressClass: 'bg-emerald-500',
    };
  }

  const createdDate = parseRecordDate(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const elapsedDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, effectiveTotalValidity - elapsedDays);
  const isExpired = daysRemaining === 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 14;

  const expiryTimestamp = createdDate.getTime() + effectiveTotalValidity * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(expiryTimestamp);
  const expiryDateFormatted = expiryDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const percentRemaining = Math.min(
    100,
    Math.max(0, Math.round((daysRemaining / effectiveTotalValidity) * 100))
  );

  let badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  let progressClass = 'bg-emerald-500';

  if (isExpired) {
    badgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
    progressClass = 'bg-rose-500';
  } else if (daysRemaining <= 7) {
    badgeClass = 'bg-red-100 text-red-900 border-red-300 font-bold';
    progressClass = 'bg-red-500 animate-pulse';
  } else if (daysRemaining <= 14) {
    badgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    progressClass = 'bg-amber-500';
  } else if (daysRemaining <= 30) {
    badgeClass = 'bg-sky-100 text-sky-900 border-sky-300';
    progressClass = 'bg-sky-500';
  }

  const displayRemaining = isExpired
    ? 'Expired'
    : daysRemaining === 1
    ? '1 Day Remaining'
    : `${daysRemaining} Days Remaining`;

  return {
    isLifetime: false,
    daysRemaining,
    displayRemaining,
    expiryDateFormatted,
    elapsedDays,
    percentRemaining,
    isExpiringSoon,
    isExpired,
    badgeClass,
    progressClass,
  };
};

/**
 * Persist the configured Referral Reward Validity (Days) into localStorage
 * and updates any existing referral settings object.
 */
export const saveReferralValidityToLocalStorage = (days: number): void => {
  try {
    const safeDays = Math.max(0, days);
    localStorage.setItem(REFERRAL_VALIDITY_STORAGE_KEY, String(safeDays));

    const savedSettingsRaw = localStorage.getItem(REFERRAL_SETTINGS_STORAGE_KEY);
    if (savedSettingsRaw) {
      try {
        const parsed = JSON.parse(savedSettingsRaw);
        parsed.referralBonusValidityDays = safeDays;
        localStorage.setItem(REFERRAL_SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        // ignore JSON parse error
      }
    }
  } catch (e) {
    console.error('Failed to save referral validity to localStorage:', e);
  }
};

/**
 * Read the configured Referral Reward Validity (Days) from localStorage.
 */
export const getReferralValidityFromLocalStorage = (): number | null => {
  try {
    const stored = localStorage.getItem(REFERRAL_VALIDITY_STORAGE_KEY);
    if (stored !== null) {
      const parsed = Number(stored);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    const savedSettingsRaw = localStorage.getItem(REFERRAL_SETTINGS_STORAGE_KEY);
    if (savedSettingsRaw) {
      const parsed = JSON.parse(savedSettingsRaw);
      if (parsed.referralBonusValidityDays !== undefined) {
        return Number(parsed.referralBonusValidityDays);
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
};
