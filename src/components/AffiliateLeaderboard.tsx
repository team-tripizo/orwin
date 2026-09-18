import React from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Sparkles, 
  Users, 
  ArrowUpRight, 
  Gift, 
  Calendar,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { AdminUserRecord } from '../types/travel';

interface AffiliateLeaderboardProps {
  allUsers: AdminUserRecord[];
  currentUserRecord?: AdminUserRecord;
}

export const AffiliateLeaderboard: React.FC<AffiliateLeaderboardProps> = ({
  allUsers,
  currentUserRecord,
}) => {
  // Compute leaderboard ranks based on referrals / earnings
  const leaderboardData = [
    {
      rank: 1,
      name: 'Ganesh Labana',
      code: 'YS-GANESH789',
      city: 'Mumbai',
      tier: 'Diamond Super Agent',
      bookingsDriven: 14,
      monthlyEarnings: 14650,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badge: '👑 Leader of September',
      reward: 'Free Goa Luxury Holiday Voucher',
      isCurrentUser: currentUserRecord?.referralCode === 'YS-GANESH789',
    },
    {
      rank: 2,
      name: 'Vikram Joshi',
      code: 'YS-VIKRAM22',
      city: 'Delhi NCR',
      tier: 'Gold Partner',
      bookingsDriven: 9,
      monthlyEarnings: 8200,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      badge: '🥈 Top Performer',
      reward: '₹5,000 Airline Seat Voucher',
      isCurrentUser: currentUserRecord?.referralCode === 'YS-VIKRAM22',
    },
    {
      rank: 3,
      name: 'Sunita Verma',
      code: 'YS-SUNITA99',
      city: 'Bengaluru',
      tier: 'Silver Partner',
      bookingsDriven: 7,
      monthlyEarnings: 6100,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      badge: '🥉 Bronze Master',
      reward: '₹3,000 Taj Dining Voucher',
      isCurrentUser: currentUserRecord?.referralCode === 'YS-SUNITA99',
    },
    {
      rank: 4,
      name: 'Amit Patel',
      code: 'YS-AMIT11',
      city: 'Ahmedabad',
      tier: 'Gold Member',
      bookingsDriven: 5,
      monthlyEarnings: 4500,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      badge: 'Rising Star',
      reward: '₹2,000 Yatra Wallet Credit',
      isCurrentUser: currentUserRecord?.referralCode === 'YS-AMIT11',
    },
    {
      rank: 5,
      name: 'Harish Nair',
      code: 'YS-HARISH88',
      city: 'Kochi',
      tier: 'Silver Member',
      bookingsDriven: 4,
      monthlyEarnings: 3600,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      badge: 'Fast Mover',
      reward: '₹1,500 Travel Goodies Kit',
      isCurrentUser: currentUserRecord?.referralCode === 'YS-HARISH88',
    },
    {
      rank: 6,
      name: 'Priyanka Chopra',
      code: 'YS-PRIYA77',
      city: 'Pune',
      tier: 'Silver Member',
      bookingsDriven: 3,
      monthlyEarnings: 2800,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      badge: 'Elite Promoter',
      reward: '₹1,000 Hotel Discount Coupon',
      isCurrentUser: currentUserRecord?.referralCode === 'YS-PRIYA77',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Leaderboard Monthly Incentive Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shrink-0">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl font-display">September 2026 Partner Championship</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Live Contest
                </span>
              </div>
              <p className="text-xs text-white/90">
                Top 3 promoters win luxury holidays, flight upgrade vouchers and cash bonuses!
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/80 block">Contest Ends In</span>
            <div className="text-lg font-black font-mono">12 Days 14 Hrs</div>
          </div>
        </div>

        {/* Top 3 Podium Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/20 flex items-center gap-3">
            <div className="text-2xl font-black text-amber-200">#1</div>
            <div className="text-xs">
              <div className="font-bold text-white">1st Prize: Free Goa Luxury Tour</div>
              <div className="text-[11px] text-white/80">3N/4D 5-Star Stay + Flights</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/20 flex items-center gap-3">
            <div className="text-2xl font-black text-slate-200">#2</div>
            <div className="text-xs">
              <div className="font-bold text-white">2nd Prize: ₹5,000 Flight Voucher</div>
              <div className="text-[11px] text-white/80">Redeemable on any airline PNR</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/20 flex items-center gap-3">
            <div className="text-2xl font-black text-amber-300">#3</div>
            <div className="text-xs">
              <div className="font-bold text-white">3rd Prize: ₹3,000 Dining Card</div>
              <div className="text-[11px] text-white/80">Taj / Marriott Hotel Dining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Rankings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>National Promoter Rankings</span>
            </h4>
            <p className="text-xs text-slate-500">
              Rankings refresh automatically based on confirmed traveler bookings and team overrides.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 font-mono">
            Month: Sep 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Promoter</th>
                <th className="py-3 px-4">Affiliate Tier</th>
                <th className="py-3 px-4 text-center">Bookings Driven</th>
                <th className="py-3 px-4 text-right">Commission Earned</th>
                <th className="py-3 px-4 text-right">Monthly Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leaderboardData.map((item) => {
                return (
                  <tr 
                    key={item.code} 
                    className={`transition ${item.isCurrentUser ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {item.rank === 1 && <Crown className="w-5 h-5 text-amber-500" />}
                        {item.rank === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                        {item.rank === 3 && <Medal className="w-5 h-5 text-amber-700" />}
                        {item.rank > 3 && (
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                            {item.rank}
                          </span>
                        )}
                        {item.isCurrentUser && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-white uppercase ml-1">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={item.avatar} 
                          alt={item.name} 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">({item.code})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{item.city}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.tier.includes('Diamond')
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : item.tier.includes('Gold')
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {item.tier}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {item.bookingsDriven} <span className="text-[10px] text-slate-400 font-normal">Trips</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700 font-mono text-xs">
                      ₹{item.monthlyEarnings.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                        {item.reward}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
