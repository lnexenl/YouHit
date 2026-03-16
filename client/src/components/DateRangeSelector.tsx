import { X } from 'lucide-react';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const handleStartDateChange = (date: string) => {
    onChange({ ...value, startDate: date || null });
  };

  const handleEndDateChange = (date: string) => {
    onChange({ ...value, endDate: date || null });
  };

  const clearRange = () => {
    onChange({ startDate: null, endDate: null });
  };

  const hasFilter = value.startDate || value.endDate;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-neutral-400 text-xs uppercase tracking-wider">
          Date Range
        </h3>
        {hasFilter && (
          <button
            onClick={clearRange}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Clear date filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-neutral-500 text-[10px] mb-1 block">From</label>
          <input
            type="date"
            value={value.startDate || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50"
          />
        </div>
        <div className="flex-1">
          <label className="text-neutral-500 text-[10px] mb-1 block">To</label>
          <input
            type="date"
            value={value.endDate || ''}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50"
          />
        </div>
      </div>
      {hasFilter && (
        <p className="text-neutral-500 text-[10px] mt-1.5">
          Filtering by date range
        </p>
      )}
    </div>
  );
}