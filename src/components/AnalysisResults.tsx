import { CheckCircle, XCircle, Lightbulb, MessageSquare, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { AnalysisResult } from "../types";
import { ScoreGauge } from "./ScoreGauge";

interface Props {
  result: AnalysisResult;
}

function SkillTag({ label, variant }: { label: string; variant: "match" | "missing" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
        variant === "match"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {variant === "match" ? (
        <CheckCircle size={11} className="shrink-0" />
      ) : (
        <XCircle size={11} className="shrink-0" />
      )}
      {label}
    </span>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

export function AnalysisResults({ result }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = [
      `ATS Match Score: ${result.score}/100`,
      ``,
      `Summary: ${result.summary}`,
      ``,
      `Matching Skills:\n${result.matching_skills.map((s) => `• ${s}`).join("\n")}`,
      ``,
      `Missing Skills:\n${result.missing_skills.map((s) => `• ${s}`).join("\n")}`,
      ``,
      `Improvement Suggestions:\n${result.improvement_suggestions.map((s) => `• ${s}`).join("\n")}`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Analysis Results</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy Report"}
        </button>
      </div>

      {/* Score + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="ATS Match Score" icon={<span className="text-blue-600 font-bold text-base">#</span>}>
          <ScoreGauge score={result.score} />
        </SectionCard>

        <SectionCard title="Summary Verdict" icon={<MessageSquare size={15} className="text-slate-500" />}>
          <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
        </SectionCard>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard
          title={`Matching Skills (${result.matching_skills.length})`}
          icon={<CheckCircle size={15} className="text-emerald-500" />}
        >
          {result.matching_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.matching_skills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="match" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No matching skills identified.</p>
          )}
        </SectionCard>

        <SectionCard
          title={`Missing Skills (${result.missing_skills.length})`}
          icon={<XCircle size={15} className="text-red-400" />}
        >
          {result.missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="missing" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No missing skills identified.</p>
          )}
        </SectionCard>
      </div>

      {/* Suggestions */}
      <SectionCard
        title="Improvement Suggestions"
        icon={<Lightbulb size={15} className="text-amber-500" />}
      >
        {result.improvement_suggestions.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {result.improvement_suggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No suggestions available.</p>
        )}
      </SectionCard>
    </div>
  );
}
