import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type PresetKey = 'all' | 'this_year' | 'last_12_months' | 'last_6_months' | 'last_3_months' | 'last_30_days' | 'last_7_days' | 'custom';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'this_year', label: 'This Year' },
  { key: 'last_12_months', label: 'Last 12 Months' },
  { key: 'last_6_months', label: 'Last 6 Months' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'last_30_days', label: 'Last 30 Days' },
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'custom', label: 'Custom Range' },
];

function getPresetRange(preset: PresetKey): DateRange {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (preset) {
    case 'all':
      return { startDate: null, endDate: null };
    case 'this_year':
      return { startDate: `${now.getFullYear()}-01-01`, endDate: today };
    case 'last_12_months': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { startDate: d.toISOString().split('T')[0], endDate: today };
    }
    case 'last_6_months': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return { startDate: d.toISOString().split('T')[0], endDate: today };
    }
    case 'last_3_months': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return { startDate: d.toISOString().split('T')[0], endDate: today };
    }
    case 'last_30_days': {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { startDate: d.toISOString().split('T')[0], endDate: today };
    }
    case 'last_7_days': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { startDate: d.toISOString().split('T')[0], endDate: today };
    }
    case 'custom':
      return { startDate: null, endDate: null };
  }
}

function detectPreset(range: DateRange): PresetKey {
  if (!range.startDate && !range.endDate) return 'all';
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  if (range.endDate === today || !range.endDate) {
    const startDate = range.startDate;
    if (!startDate) return 'all';
    
    if (startDate === `${now.getFullYear()}-01-01`) return 'this_year';
    
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    if (startDate === d.toISOString().split('T')[0]) return 'last_12_months';
    
    d.setTime(now.getTime());
    d.setMonth(d.getMonth() - 6);
    if (startDate === d.toISOString().split('T')[0]) return 'last_6_months';
    
    d.setTime(now.getTime());
    d.setMonth(d.getMonth() - 3);
    if (startDate === d.toISOString().split('T')[0]) return 'last_3_months';
    
    d.setTime(now.getTime());
    d.setDate(d.getDate() - 30);
    if (startDate === d.toISOString().split('T')[0]) return 'last_30_days';
    
    d.setTime(now.getTime());
    d.setDate(d.getDate() - 7);
    if (startDate === d.toISOString().split('T')[0]) return 'last_7_days';
  }
  
  return 'custom';
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(detectPreset(value));
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (preset: PresetKey) => {
    setSelectedPreset(preset);
    setIsOpen(false);
    if (preset !== 'custom') {
      onChange(getPresetRange(preset));
    }
  };

  const handleStartDateChange = (date: string) => {
    onChange({ ...value, startDate: date || null });
  };

  const handleEndDateChange = (date: string) => {
    onChange({ ...value, endDate: date || null });
  };

  const clearRange = () => {
    setSelectedPreset('all');
    onChange({ startDate: null, endDate: null });
  };

  const hasFilter = value.startDate || value.endDate;
  const currentPreset = PRESETS.find(p => p.key === selectedPreset);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-neutral-400 text-xs uppercase tracking-wider">
          Date Range
        </h3>
        {hasFilter && selectedPreset !== 'all' && (
          <button
            onClick={clearRange}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Clear date filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white hover:bg-neutral-700/50 transition-colors"
        >
          <span>{currentPreset?.label || 'Select Range'}</span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePresetChange(preset.key)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  selectedPreset === preset.key
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPreset === 'custom' && (
        <div className="flex gap-2 mt-2">
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
      )}
    </div>
  );
}