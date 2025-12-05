import React from 'react';

interface CompactStatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  homeTeam: string;
  awayTeam: string;
  format?: 'percentage' | 'number';
  className?: string;
}

export const CompactStatBar: React.FC<CompactStatBarProps> = ({
  label,
  homeValue,
  awayValue,
  homeTeam,
  awayTeam,
  format = 'number',
  className = '',
}) => {
  // Calculate percentages for bar widths
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  // Format display values
  const formatValue = (value: number): string => {
    if (format === 'percentage') {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <div className={`py-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-center mb-1.5">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Values and Bars */}
      <div className="flex items-center gap-2">
        {/* Home Value */}
        <div className="w-10 text-right flex-shrink-0">
          <span className="text-xs font-bold text-white">
            {formatValue(homeValue)}
          </span>
        </div>

        {/* Comparison Bars */}
        <div className="flex-1 flex items-center gap-1 h-2">
          {/* Home Bar */}
          <div className="flex-1 h-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${homePercent}%` }}
              title={`${homeTeam}: ${formatValue(homeValue)}`}
            />
          </div>

          {/* Away Bar */}
          <div className="flex-1 h-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-red-500 to-red-600 rounded-full transition-all duration-300"
              style={{ width: `${awayPercent}%`, marginLeft: 'auto' }}
              title={`${awayTeam}: ${formatValue(awayValue)}`}
            />
          </div>
        </div>

        {/* Away Value */}
        <div className="w-10 text-left flex-shrink-0">
          <span className="text-xs font-bold text-white">
            {formatValue(awayValue)}
          </span>
        </div>
      </div>
    </div>
  );
};
