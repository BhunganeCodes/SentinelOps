"use client";

import { useRef, useState } from "react";
import { Badge, Card, Shell } from "../components/sentinel-shell";

const recentUploads = [
  { name: "demo-procurement-document.pdf", type: "PDF", status: "queued", risk: "info" },
  { name: "VendorContract_Apex.pdf", type: "PDF", status: "flagged", risk: "critical" },
  { name: "Northline_RFQ.txt", type: "TXT", status: "analyzed", risk: "low" },
] as const;

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<string>("No file selected");
  const [progress, setProgress] = useState(0);

  function simulateUpload(fileName?: string) {
    setSelected(fileName ?? "demo-procurement-document.pdf");
    setProgress(12);
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return value + 11;
      });
    }, 120);
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

        <Card className="p-5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              simulateUpload(event.dataTransfer.files[0]?.name);
            }}
            className="w-full rounded-lg border-2 border-dashed border-[rgba(255,15,123,0.34)] bg-[rgba(255,15,123,0.04)] px-6 py-12 text-center transition hover:border-[#ff0f7b] hover:bg-[rgba(255,15,123,0.08)]"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(event) => simulateUpload(event.target.files?.[0]?.name)}
            />
            <div className="text-4xl text-[#ff0f7b]">↑</div>
            <div className="mt-3 text-base font-bold">Drop procurement documents here</div>
            <div className="mt-2 text-sm text-[rgba(245,245,245,0.5)]">PDF and TXT files match the backend upload pipeline.</div>
            <div className="mt-4 flex justify-center gap-2">
              <Badge tone="info">PDF</Badge>
              <Badge tone="info">TXT</Badge>
              <Badge tone="low">Prompt gate</Badge>
            </div>
          </button>
          <div className="mt-5 rounded-md border border-[rgba(255,15,123,0.14)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{selected}</span>
              <span className="text-[#ff0f7b]">{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded bg-[rgba(255,255,255,0.08)]">
              <div className="h-full rounded bg-gradient-to-r from-[#ff0f7b] to-[#ff2d95] transition-all" style={{ width: `${progress}%` }} />
            </div>
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
