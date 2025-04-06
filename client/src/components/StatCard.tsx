import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
    neutral?: boolean;
  };
  icon: ReactNode;
  iconBackground: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  iconBackground,
}: StatCardProps) {
  return (
    <div className="stat-card rounded-xl p-6 border border-card-border" style={{ background: 'rgba(0, 15, 15, 0.7)' }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-neon-cyan">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-light-cyan glow-text">{value}</h3>
          {change && (
            <p
              className={`text-xs mt-1 flex items-center ${
                change.neutral
                  ? "text-amber-400"
                  : change.positive
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {change.positive ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : change.neutral ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{change.value}</span>
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg border border-card-border flex items-center justify-center" 
             style={{ background: 'rgba(0, 25, 25, 0.6)' }}>{icon}</div>
      </div>
    </div>
  );
}
