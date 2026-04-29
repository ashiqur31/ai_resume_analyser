import { useRef, useState } from "react";
import { Upload, FileText, X, Briefcase } from "lucide-react";

interface Props {
  jobDescription: string;
  onJobDescriptionChange: (val: string) => void;
  resumeFile: File | null;
  onResumeFile: (file: File | null) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function InputSection({
  jobDescription,
  onJobDescriptionChange,
  resumeFile,
  onResumeFile,
  onSubmit,
  loading,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  }

  function validateAndSet(file: File) {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx") && !file.name.endsWith(".txt")) {
      alert("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    onResumeFile(file);
  }

  const canSubmit = jobDescription.trim().length > 20 && resumeFile !== null && !loading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Job Description */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Briefcase size={16} className="text-blue-600" />
          Job Description
        </label>
        <textarea
          className="flex-1 min-h-[280px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
          placeholder="Paste the full job description here…&#10;&#10;Include required skills, responsibilities, qualifications, and any other relevant details."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
        />
        <p className="text-xs text-slate-400">{jobDescription.length} characters</p>
      </div>

      {/* Resume Upload + Submit */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <FileText size={16} className="text-blue-600" />
          Resume Upload
        </label>

        <div
          className={`flex-1 min-h-[200px] rounded-xl border-2 border-dashed transition cursor-pointer flex flex-col items-center justify-center gap-3 p-6 ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : resumeFile
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {resumeFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <FileText size={24} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-emerald-700">{resumeFile.name}</p>
                <p className="text-xs text-emerald-500 mt-1">{(resumeFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition mt-1"
              >
                <X size={12} /> Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                <Upload size={24} className="text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">Drop your resume here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-slate-400">PDF, DOCX, or TXT supported</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`mt-2 w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 ${
            canSubmit
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Analyzing…" : "Analyze Resume"}
        </button>

        {!canSubmit && !loading && (
          <p className="text-xs text-center text-slate-400">
            {!resumeFile && !jobDescription.trim() ? "Add a job description and upload your resume to continue." :
             !resumeFile ? "Upload your resume to continue." :
             "Job description must be at least 20 characters."}
          </p>
        )}
      </div>
    </div>
  );
}
