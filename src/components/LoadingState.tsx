const steps = [
  "Extracting resume content…",
  "Parsing job requirements…",
  "Running ATS keyword analysis…",
  "Scoring skills alignment…",
  "Generating improvement suggestions…",
];

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Animated rings */}
      <div className="relative w-20 h-20">
        <span className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <span className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-blue-400 animate-spin" />
        <span className="absolute inset-2 rounded-full border-4 border-t-blue-300 border-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-slate-700 mb-1">Analyzing your resume</p>
        <p className="text-sm text-slate-400">This usually takes 10–20 seconds</p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
              style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}
            />
            <span className="text-xs text-slate-500">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
