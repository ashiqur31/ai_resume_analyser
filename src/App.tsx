import { useState } from "react";
import { FileSearch } from "lucide-react";
import { InputSection } from "./components/InputSection";
import { AnalysisResults } from "./components/AnalysisResults";
import { LoadingState } from "./components/LoadingState";
import type { AnalysisResult } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const ANALYZE_RESUME_URL = `${API_BASE_URL}/api/analyze-resume`;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getResumeMimeType(file: File): string {
  if (file.type) {
    return file.type;
  }

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (fileName.endsWith(".txt")) {
    return "text/plain";
  }

  return "application/pdf";
}

export default function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!resumeFile || !jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resumeBase64 = await fileToBase64(resumeFile);
      const res = await fetch(ANALYZE_RESUME_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resumeBase64,
          resumeMimeType: getResumeMimeType(resumeFile),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error: ${res.status}`);
      }

      setResult(data as AnalysisResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <FileSearch size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">ResumeAI</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Powered by GPT-4o mini</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            ATS-Powered Resume Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Know Exactly How Your Resume<br className="hidden sm:block" /> Scores Against the JD
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Paste a job description, upload your resume, and get an instant ATS match score with actionable improvements.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Steps indicator */}
          {!result && !loading && (
            <div className="px-6 pt-6 pb-0 flex items-center gap-4 mb-6">
              {[
                { n: "1", label: "Paste JD" },
                { n: "2", label: "Upload Resume" },
                { n: "3", label: "Get Results" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {step.n}
                  </span>
                  <span className="text-xs font-medium text-slate-600 hidden sm:block">{step.label}</span>
                  {i < 2 && <span className="w-8 h-px bg-slate-200 hidden sm:block" />}
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <LoadingState />
            ) : result ? (
              <div>
                <AnalysisResults result={result} />
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleReset}
                    className="text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 px-5 py-2 rounded-lg transition"
                  >
                    Analyze Another Resume
                  </button>
                </div>
              </div>
            ) : (
              <InputSection
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                resumeFile={resumeFile}
                onResumeFile={setResumeFile}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <strong className="font-semibold">Error: </strong>{error}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Your resume is processed securely and never stored.
        </p>
      </main>
    </div>
  );
}
