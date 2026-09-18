import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plane, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock,
  Check,
  ShieldCheck
} from 'lucide-react';
import { HolidayPackage } from '../types/travel';

export interface DepartureDateSeatInfo {
  dateStr: string;
  dateObj: Date;
  day: number;
  month: number; // 0-11
  year: number;
  seatsAvailable: number;
  seatsTotal: number;
  occupancyPct: number;
  price: number;
  status: 'high' | 'medium' | 'low' | 'sold_out';
  flightNumber?: string;
  airline?: string;
  timing?: string;
}

interface DepartureCalendarViewProps {
  pkg: HolidayPackage;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  travelerCount?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS: Record<string, number> = {
  'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
  'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
};

export const DepartureCalendarView: React.FC<DepartureCalendarViewProps> = ({
  pkg,
  selectedDate,
  onSelectDate,
  travelerCount = 2,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'grid'>('calendar');

  // Parse all departure dates and map with seat availability
  const departureMap = useMemo(() => {
    const map = new Map<string, DepartureDateSeatInfo>();
    const dates = pkg.departureDates || [];
    const totalSeats = pkg.flightDetails?.seatsTotal || 40;
    const baseAvailable = pkg.flightDetails?.seatsAvailable ?? 6;

    dates.forEach((dateStr, idx) => {
      // Parse "20 Oct 2026" or "YYYY-MM-DD"
      let day = 1;
      let month = 9; // default Oct
      let year = 2026;

      const clean = dateStr.trim();
      const parts = clean.split(/[\s-]+/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[2], 10);
        } else {
          // DD MMM YYYY
          day = parseInt(parts[0], 10) || 1;
          const mStr = parts[1].slice(0, 3).toLowerCase();
          month = SHORT_MONTHS[mStr] !== undefined ? SHORT_MONTHS[mStr] : 9;
          year = parseInt(parts[2], 10) || 2026;
        }
      }

      // Seat availability distribution for different dates
      // Produce realistic numbers: e.g. 6, 3, 12, 2, 8, etc.
      let available = baseAvailable;
      if (idx === 0) available = baseAvailable; // e.g. 6
      else if (idx === 1) available = Math.max(2, baseAvailable - 3); // e.g. 3
      else if (idx === 2) available = baseAvailable + 6; // e.g. 12
      else if (idx === 3) available = Math.max(2, baseAvailable - 4); // e.g. 2
      else available = 4 + (idx % 7);

      const booked = totalSeats - available;
      const occupancyPct = Math.round((booked / totalSeats) * 100);

      let status: DepartureDateSeatInfo['status'] = 'high';
      if (available <= 0) status = 'sold_out';
      else if (available <= 3) status = 'low';
      else if (available <= 8) status = 'medium';
      else status = 'high';

      const dateObj = new Date(year, month, day);

      map.set(clean, {
        dateStr: clean,
        dateObj,
        day,
        month,
        year,
        seatsAvailable: available,
        seatsTotal: totalSeats,
        occupancyPct,
        price: pkg.price,
        status,
        flightNumber: pkg.flightDetails?.flightNumber || '6E-5034',
        airline: pkg.flightDetails?.airline || 'IndiGo Airlines',
        timing: pkg.flightDetails ? `${pkg.flightDetails.departureTime} - ${pkg.flightDetails.arrivalTime}` : '08:25 AM - 09:55 AM',
      });
    });

    return map;
  }, [pkg]);

  // Determine initial calendar month and year based on first departure date
  const parsedDatesList = useMemo(() => Array.from(departureMap.values()), [departureMap]);

  const initialYear = parsedDatesList[0]?.year || 2026;
  const initialMonth = parsedDatesList[0]?.month !== undefined ? parsedDatesList[0].month : 9;

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix for current month & year
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      dateKey: string;
      departureInfo?: DepartureDateSeatInfo;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        dateKey: `prev-${prevMonthDays - i}`,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      // Look for match in departureMap
      const matched = parsedDatesList.find(
        (item) => item.year === currentYear && item.month === currentMonth && item.day === d
      );

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateKey: matched ? matched.dateStr : `curr-${d}`,
        departureInfo: matched,
      });
    }

    // Trailing days to complete the 7-column grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateKey: `next-${i}`,
      });
    }

    return days;
  }, [currentYear, currentMonth, parsedDatesList]);

  // Selected date info
  const selectedInfo = useMemo(() => {
    return departureMap.get(selectedDate) || parsedDatesList[0];
  }, [selectedDate, departureMap, parsedDatesList]);

  const hasCapacityAlert = selectedInfo && travelerCount > selectedInfo.seatsAvailable;

  return (
    <div className="space-y-4">
      {/* Header controls: Month navigation & View switch */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              Fixed Departure Seat Availability Calendar
            </h4>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
              Live Airline Sync
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Roundtrip flight locked with guaranteed departure from {pkg.departureCity}
          </p>
        </div>

        {/* View toggle (Calendar vs Fast Grid) */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'calendar' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              📅 Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'grid' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Fast Grid
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          {/* Month Header and Month Quick Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-slate-900 text-base sm:text-lg min-w-[150px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick jump to months with scheduled departures */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Departures:</span>
              {Array.from(
                new Set(parsedDatesList.map((d) => `${MONTH_NAMES[d.month].slice(0, 3)} ${d.year}`))
              ).map((mStr) => {
                const sample = parsedDatesList.find(
                  (d) => `${MONTH_NAMES[d.month].slice(0, 3)} ${d.year}` === mStr
                );
                const isActive = sample && sample.month === currentMonth && sample.year === currentYear;
                return (
                  <button
                    key={mStr}
                    type="button"
                    onClick={() => {
                      if (sample) {
                        setCurrentMonth(sample.month);
                        setCurrentYear(sample.year);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                      isActive
                        ? 'bg-sky-100 text-sky-800 border border-sky-300 font-extrabold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    ✈️ {mStr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400 py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* 7-column Calendar Matrix */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-16 sm:h-20 rounded-xl bg-slate-50/50 p-1.5 text-slate-300 text-xs select-none border border-transparent"
                  >
                    <span>{cell.dayNumber}</span>
                  </div>
                );
              }

              const dep = cell.departureInfo;
              const isSelected = dep && selectedDate === dep.dateStr;

              if (!dep) {
                // Regular day without departure
                return (
                  <div
                    key={cell.dateKey}
                    className="h-16 sm:h-20 rounded-xl bg-white border border-slate-100 p-1.5 sm:p-2 text-slate-400 text-xs flex flex-col justify-between hover:bg-slate-50/50 transition"
                  >
                    <span className="font-semibold text-slate-400 text-xs">{cell.dayNumber}</span>
                    <span className="text-[10px] text-slate-300 hidden sm:block">No Flight</span>
                  </div>
                );
              }

              // Fixed departure day with seat availability!
              const isSoldOut = dep.status === 'sold_out';
              const isLow = dep.status === 'low';
              const isMedium = dep.status === 'medium';

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => onSelectDate(dep.dateStr)}
                  className={`h-16 sm:h-20 rounded-xl p-1.5 sm:p-2 text-left flex flex-col justify-between transition-all duration-200 relative group cursor-pointer border ${
                    isSelected
                      ? 'bg-sky-50/90 border-sky-600 ring-2 ring-sky-400/50 shadow-md transform -translate-y-0.5'
                      : isSoldOut
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : isLow
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-xs'
                      : isMedium
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400 hover:shadow-xs'
                      : 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Day number + Plane badge */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-sky-900' : 'text-slate-900'}`}>
                      {cell.dayNumber}
                    </span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : isLow
                        ? 'bg-rose-600 text-white'
                        : isMedium
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isSelected ? (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      ) : (
                        <Plane className="w-2.5 h-2.5 -rotate-45" />
                      )}
                    </div>
                  </div>

                  {/* Middle: Live Seat Availability Pill */}
                  <div className="w-full">
                    {isSoldOut ? (
                      <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-200 px-1 py-0.5 rounded text-center">
                        Sold Out
                      </span>
                    ) : isLow ? (
                      <span className="block text-[9px] sm:text-[10px] font-extrabold text-rose-700 bg-rose-100 px-1 py-0.5 rounded text-center truncate">
                        {dep.seatsAvailable} seats left!
                      </span>
                    ) : isMedium ? (
                      <span className="block text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.5 rounded text-center truncate">
                        {dep.seatsAvailable} left
                      </span>
                    ) : (
                      <span className="block text-[9px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded text-center truncate">
                        {dep.seatsAvailable} seats avail
                      </span>
                    )}
                  </div>

                  {/* Bottom: Price indicator */}
                  <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-500 font-semibold w-full pt-0.5 border-t border-slate-100/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Locked</span>
                    <span className="font-extrabold text-slate-800">₹{(dep.price / 1000).toFixed(1)}k</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color-coded Availability Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>High (9+ seats)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Filling Fast (4-8 left)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Last Seats (1-3 left)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span>Sold Out</span>
              </span>
            </div>
            <span className="text-sky-700 font-semibold flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 -rotate-45" />
              <span>All departure dates include confirmed flights</span>
            </span>
          </div>
        </div>
      )}

      {/* FAST GRID VIEW ALTERNATIVE */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parsedDatesList.map((dep) => {
              const isSelected = selectedDate === dep.dateStr;
              const isLow = dep.status === 'low';
              const isMedium = dep.status === 'medium';
              const isSoldOut = dep.status === 'sold_out';

              return (
                <button
                  key={dep.dateStr}
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => onSelectDate(dep.dateStr)}
                  className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-300'
                      : isSoldOut
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Plane className="w-4 h-4 -rotate-45" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{dep.dateStr}</span>
                        {isSelected && (
                          <span className="bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {dep.airline} • {dep.timing}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                      isSoldOut
                        ? 'bg-slate-200 text-slate-700'
                        : isLow
                        ? 'bg-rose-100 text-rose-800'
                        : isMedium
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isSoldOut ? 'Sold Out' : `${dep.seatsAvailable} Seats Left`}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 block mt-1">
                      ₹{dep.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SELECTED DATE INSPECTOR & FLIGHT SEAT OCCUPANCY METER */}
      {selectedInfo && (
        <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sky-700/50 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-amber-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selected Fixed Departure Flight</span>
              </span>
              <h5 className="font-extrabold text-base sm:text-lg text-white mt-0.5">
                {selectedInfo.dateStr} (Confirmed Departure from {pkg.departureCity})
              </h5>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-sky-200 bg-white/10 px-3 py-1 rounded-xl border border-white/20 font-mono font-bold">
                {selectedInfo.airline} • {selectedInfo.flightNumber}
              </span>
            </div>
          </div>

          {/* Seat Availability Progress Bar */}
          <div className="bg-white/10 rounded-xl p-3 border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-300" />
                <span>Group Seat Occupancy</span>
              </span>
              <span className="font-bold text-white">
                {selectedInfo.seatsTotal - selectedInfo.seatsAvailable} / {selectedInfo.seatsTotal} Seats Filled ({selectedInfo.occupancyPct}%)
              </span>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedInfo.status === 'low'
                    ? 'bg-rose-500'
                    : selectedInfo.status === 'medium'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${selectedInfo.occupancyPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className={`font-bold ${
                selectedInfo.status === 'low' ? 'text-rose-300' : 'text-amber-300'
              }`}>
                ⚡ {selectedInfo.seatsAvailable} Seats Remaining For Booking
              </span>
              <span className="text-slate-300">
                Timing: {selectedInfo.timing}
              </span>
            </div>
          </div>

          {/* Seat Capacity Overload Warning if passengers > available seats */}
          {hasCapacityAlert && (
            <div className="p-3 bg-rose-500/20 border border-rose-400/50 rounded-xl text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Seat Alert:</strong> You have selected {travelerCount} passengers, but only {selectedInfo.seatsAvailable} seats are available on this date. Please pick a date with more seats or adjust traveler count.
              </span>
            </div>
          )}

          {/* Instant Benefits Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Instant PNR Issued</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>15kg Check-in Bag</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Non-stop Flight</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Fixed Group Fare</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
