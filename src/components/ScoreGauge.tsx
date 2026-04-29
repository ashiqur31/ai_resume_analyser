interface Props {
  score: number;
}

function getScoreColor(score: number): { text: string; ring: string; bar: string; label: string } {
  if (score >= 80) return { text: "text-emerald-600", ring: "ring-emerald-500", bar: "bg-emerald-500", label: "Excellent Match" };
  if (score >= 60) return { text: "text-blue-600", ring: "ring-blue-500", bar: "bg-blue-500", label: "Good Match" };
  if (score >= 40) return { text: "text-amber-500", ring: "ring-amber-400", bar: "bg-amber-400", label: "Partial Match" };
  return { text: "text-red-500", ring: "ring-red-400", bar: "bg-red-400", label: "Low Match" };
}

export function ScoreGauge({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const colors = getScoreColor(clamped);

  // SVG arc parameters
  const radius = 54;
  const cx = 70;
  const cy = 70;
  const circumference = Math.PI * radius; // half circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="140" height="80" viewBox="0 0 140 80">
          {/* Background arc */}
          <path
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0 1 ${cx + radius},${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0 1 ${cx + radius},${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={colors.text}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={`text-4xl font-black ${colors.text}`}>{clamped}</span>
          <span className="text-lg font-bold text-slate-400 mb-1">/100</span>
        </div>
      </div>

      <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-opacity-10 ${colors.text} ${
        clamped >= 80 ? "bg-emerald-100" :
        clamped >= 60 ? "bg-blue-100" :
        clamped >= 40 ? "bg-amber-100" : "bg-red-100"
      }`}>
        {colors.label}
      </span>

      {/* Linear bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
