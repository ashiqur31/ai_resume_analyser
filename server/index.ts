import "dotenv/config";

import cors from "cors";
import express, { type Request, type Response } from "express";
import mammoth from "mammoth";
import OpenAI from "openai";

interface AnalysisResult {
  score: number;
  summary: string;
  matching_skills: string[];
  missing_skills: string[];
  improvement_suggestions: string[];
}

interface AnalyzeResumeRequest {
  jobDescription?: string;
  resumeBase64?: string;
  resumeMimeType?: string;
}

const app = express();
const port = Number(process.env.PORT ?? 3001);
const openaiApiKey = process.env.OPENAI_API_KEY ?? process.env.open_ai_key;
const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "running" });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/api/analyze-resume", async (req: Request, res: Response) => {
  if (!openaiApiKey) {
    res.status(500).json({
      error: "OpenAI API key not configured. Set OPENAI_API_KEY in your server environment.",
    });
    return;
  }

  const { jobDescription, resumeBase64, resumeMimeType } = req.body as AnalyzeResumeRequest;

  if (!jobDescription?.trim()) {
    res.status(400).json({ error: "Job description is required." });
    return;
  }

  if (!resumeBase64) {
    res.status(400).json({ error: "Resume file is required." });
    return;
  }

  try {
    const resumeText = await extractTextFromBase64(
      resumeBase64,
      resumeMimeType ?? "application/pdf",
    );

    if (!resumeText.trim()) {
      res.status(422).json({
        error:
          "Could not extract text from the uploaded resume. Please ensure the file is not scanned or image-only.",
      });
      return;
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const response = await openai.responses.create({
      model,
      store: false,
      temperature: 0.2,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are an expert ATS (Applicant Tracking System) and career coach. Analyze resumes against job descriptions and return concise, practical feedback.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Analyze the candidate's resume against the given job description.",
                "",
                "Job Description:",
                jobDescription,
                "",
                "Resume:",
                resumeText,
                "",
                "Return JSON only. No prose outside JSON.",
              ].join("\n"),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "resume_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "score",
              "summary",
              "matching_skills",
              "missing_skills",
              "improvement_suggestions",
            ],
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 100,
              },
              summary: {
                type: "string",
              },
              matching_skills: {
                type: "array",
                items: { type: "string" },
              },
              missing_skills: {
                type: "array",
                items: { type: "string" },
              },
              improvement_suggestions: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
    });

    const rawContent = response.output_text?.trim();
    if (!rawContent) {
      res.status(502).json({ error: "OpenAI returned an empty response." });
      return;
    }

    const parsed = JSON.parse(rawContent) as AnalysisResult;
    res.json(normalizeResult(parsed));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    const statusCode = message.startsWith("Unsupported resume file type")
      ? 400
      : message.startsWith("Failed to parse resume:")
        ? 422
        : 500;

    res.status(statusCode).json({
      error: message.startsWith("Failed to parse resume:")
        ? message
        : `Unexpected error: ${message}`,
    });
  }
});

app.listen(port, () => {
  console.log(`Resume analyzer API running on http://localhost:${port}`);
});

function normalizeResult(result: AnalysisResult): AnalysisResult {
  return {
    score: clampScore(result.score),
    summary: result.summary?.trim() ?? "",
    matching_skills: normalizeStringList(result.matching_skills),
    missing_skills: normalizeStringList(result.missing_skills),
    improvement_suggestions: normalizeStringList(result.improvement_suggestions),
  };
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

function normalizeStringList(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => value.trim())
    .filter(Boolean);
}

async function extractTextFromBase64(base64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");

  if (isPdf(mimeType)) {
    return extractPdfText(buffer);
  }

  if (isDocx(mimeType)) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  if (isPlainText(mimeType)) {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported resume file type. Please upload a PDF, DOCX, or TXT file.");
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
    });
    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      textParts.push(pageText);
    }

    return textParts.join("\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PDF parsing error.";
    throw new Error(`Failed to parse resume: ${message}`);
  }
}

function isPdf(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

function isDocx(mimeType: string): boolean {
  return mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

function isPlainText(mimeType: string): boolean {
  return mimeType === "text/plain";
}
