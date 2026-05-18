"use client";

import { useState } from "react";
import { Badge, Card, Shell } from "../components/sentinel-shell";
import { UploadZone } from "../components/UploadZone";
import { API_URL, getJson, toneFromSeverity, type ProcurementReport } from "../lib/api";

const recentUploads = [
  { name: "demo-procurement-document.pdf", type: "PDF", status: "queued", risk: "info" },
  { name: "VendorContract_Apex.pdf", type: "PDF", status: "flagged", risk: "critical" },
  { name: "Northline_RFQ.txt", type: "TXT", status: "analyzed", risk: "low" },
] as const;

export default function UploadPage() {
  const [selected, setSelected] = useState<string>("No file selected");
  const [progress, setProgress] = useState(0);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [report, setReport] = useState<ProcurementReport | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function uploadFile(file: File) {
    const validFile = file.type === "application/pdf" || file.type === "text/plain" || /\.(pdf|txt)$/i.test(file.name);

    if (!validFile) {
      setStatus("error");
      setMessage("Only PDF and TXT files are supported.");
      return;
    }

    setSelected(file.name);
    setProgress(20);
    setStatus("uploading");
    setMessage(null);
    setReport(null);
    setDocumentId(null);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const body = await response.json() as { document_id: string; status: string };
      setProgress(70);
      setDocumentId(body.document_id);
      setMessage(`Upload accepted. Document ${body.document_id} is ${body.status}.`);

      const loadedReport = await pollReport(body.document_id);
      setReport(loadedReport);
      setProgress(100);
      setStatus("complete");
    } catch {
      setStatus("error");
      setMessage("Something went wrong while uploading or analysing this document.");
      setProgress(0);
    }
  }

  return (
    <Shell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <h1 className="m-0 text-2xl font-black">Upload Center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,245,245,0.58)]">
            Stage procurement documents for inspection, Gemini analysis, and Supabase vendor-risk persistence.
          </p>
        </div>

        <UploadZone onUpload={uploadFile} progress={progress} status={status} message={message} selectedFileName={selected} />

        <Card>
          <div className="border-b border-[rgba(255,15,123,0.14)] px-5 py-4">
            <h2 className="m-0 text-base font-bold">Analysis results</h2>
          </div>
          <div className="p-5">
            {status === "uploading" ? (
              <div className="text-sm text-[rgba(245,245,245,0.62)]">Waiting for procurement analysis...</div>
            ) : report ? (
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={toneFromSeverity(report.status)}>{report.status ?? "completed"}</Badge>
                  {documentId ? <span className="font-mono text-xs text-[rgba(245,245,245,0.44)]">{documentId}</span> : null}
                </div>
                <p className="m-0 text-sm leading-6 text-[rgba(245,245,245,0.68)]">{report.summary ?? "Analysis completed."}</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-[0.14em] text-[rgba(245,245,245,0.45)]">
                        <th className="py-2 pr-4 font-semibold">Supplier</th>
                        <th className="py-2 pr-4 font-semibold">Risk</th>
                        <th className="py-2 pr-4 font-semibold">Anomaly</th>
                        <th className="py-2 pr-4 font-semibold">Finding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                      {(report.analysis_json?.vendors ?? []).map((vendor) => (
                        <tr key={`${vendor.vendor_name ?? vendor.name}-${vendor.anomaly_score ?? vendor.score}`}>
                          <td className="py-3 pr-4 font-semibold">{vendor.vendor_name ?? vendor.name ?? "Unknown vendor"}</td>
                          <td className="py-3 pr-4"><Badge tone={toneFromSeverity(vendor.risk_level ?? vendor.risk)}>{vendor.risk_level ?? vendor.risk ?? "medium"}</Badge></td>
                          <td className="py-3 pr-4 text-[#ff0f7b]">{Math.round(Number(vendor.anomaly_score ?? vendor.score ?? 0))}</td>
                          <td className="py-3 pr-4 text-[rgba(245,245,245,0.62)]">{vendor.suspicious_claim ?? "No suspicious claim recorded"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[rgba(245,245,245,0.5)]">Upload a PDF or TXT file to show procurement analysis results.</div>
            )}
          </div>
        </Card>

        <Card>
          <div className="border-b border-[rgba(255,15,123,0.14)] px-5 py-4">
            <h2 className="m-0 text-base font-bold">Recent uploads</h2>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {recentUploads.map((upload) => (
              <div key={upload.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
                <div className="grid h-10 w-10 place-items-center rounded-md border border-[rgba(255,15,123,0.2)] bg-[rgba(255,15,123,0.08)] text-xs font-black text-[#ff0f7b]">
                  {upload.type}
                </div>
                <div>
                  <div className="text-sm font-semibold">{upload.name}</div>
                  <div className="mt-1 text-xs text-[rgba(245,245,245,0.44)]">Ready for `/api/upload`</div>
                </div>
                <Badge tone={upload.risk}>{upload.status}</Badge>
                <button className="rounded-md border border-[rgba(255,15,123,0.24)] px-3 py-2 text-xs font-semibold text-[rgba(245,245,245,0.78)] hover:border-[#ff0f7b] hover:text-white">
                  View
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}

async function pollReport(documentId: string): Promise<ProcurementReport> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const response = await getJson<{ report: ProcurementReport }>(`/api/procurement-report?document_id=${encodeURIComponent(documentId)}`);
      return response.report;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => window.setTimeout(resolve, 750));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Analysis report was not ready");
}
