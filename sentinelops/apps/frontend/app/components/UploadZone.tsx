"use client";

import { useRef, useState } from "react";
import { Badge, Card } from "./sentinel-shell";

export type UploadZoneProps = {
  onUpload: (file: File) => Promise<void>;
  progress: number;
  status: "idle" | "uploading" | "complete" | "error";
  message: string | null;
  selectedFileName: string;
};

export function UploadZone({ onUpload, progress, status, message, selectedFileName }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function validateAndUpload(file?: File) {
    if (!file) return;

    const validFile = file.type === "application/pdf" || file.type === "text/plain" || /\.(pdf|txt)$/i.test(file.name);
    if (!validFile) {
      return;
    }

    onUpload(file);
  }

  return (
    <Card className="p-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          validateAndUpload(event.dataTransfer.files[0]);
        }}
        className={`w-full rounded-lg border-2 border-dashed px-6 py-12 text-center transition ${
          dragOver
            ? "border-[#ff0f7b] bg-[rgba(255,15,123,0.12)]"
            : "border-[rgba(255,15,123,0.34)] bg-[rgba(255,15,123,0.04)] hover:border-[#ff0f7b] hover:bg-[rgba(255,15,123,0.08)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(event) => validateAndUpload(event.target.files?.[0])}
        />
        <div className="text-4xl text-[#ff0f7b]">Upload</div>
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
          <span className="font-semibold">{selectedFileName}</span>
          <span className="text-[#ff0f7b]">{progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded bg-[rgba(255,255,255,0.08)]">
          <div className="h-full rounded bg-gradient-to-r from-[#ff0f7b] to-[#ff2d95] transition-all" style={{ width: `${progress}%` }} />
        </div>
        {message ? (
          <div className={`mt-3 text-sm ${status === "error" ? "text-[#ffb800]" : "text-[rgba(245,245,245,0.68)]"}`}>
            {message}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
