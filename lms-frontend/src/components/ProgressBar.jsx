import React from 'react';

const ProgressBar = ({ progress = 0, height = 'h-2', showLabel = true, color = 'blue' }) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600',
    indigo: 'bg-indigo-600',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-600">Progress</span>
          <span className="text-xs font-semibold text-slate-700">{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${colorClasses[color] || colorClasses.blue} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
