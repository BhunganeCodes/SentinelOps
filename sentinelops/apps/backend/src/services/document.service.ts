import type { Express } from "express";
import { readFile } from "node:fs/promises";
import pdf from "pdf-parse";
import { supabase } from "../lib/supabase";

export type CreatedDocument = {
  id: string;
  status: "processing";
};

export type DocumentForAnalysis = {
  id: string;
  file_path: string;
  mime_type: string;
  original_filename: string;
};

export async function createProcessingDocument(
  file: Express.Multer.File
): Promise<CreatedDocument> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      filename: file.originalname,
      original_filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      file_path: file.path,
      status: "processing"
    })
    .select("id,status")
    .single();

  if (error) {
    throw new Error(`Failed to create document row in Supabase: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Failed to create document: missing document id");
  }

  return {
    id: String(data.id),
    status: "processing"
  };
}

export async function getDocumentForAnalysis(
  documentId: string
): Promise<DocumentForAnalysis> {
  const { data, error } = await supabase
    .from("documents")
    .select("id,file_path,mime_type,original_filename")
    .eq("id", documentId)
    .single();

  if (error) {
    throw new Error(`Failed to load document: ${error.message}`);
  }

  if (!data?.file_path || !data?.mime_type || !data?.original_filename) {
    throw new Error("Failed to load document: missing file metadata");
  }

  return {
    id: String(data.id),
    file_path: String(data.file_path),
    mime_type: String(data.mime_type),
    original_filename: String(data.original_filename)
  };
}

export async function updateDocumentStatus(
  documentId: string,
  status: "blocked" | "processing" | "complete" | "failed"
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({ status })
    .eq("id", documentId);

  if (error) {
    throw new Error(`Failed to update document status: ${error.message}`);
  }
}

export async function readDocumentText(
  document: Pick<DocumentForAnalysis, "file_path" | "mime_type">
): Promise<string> {
  const contents = await readFile(document.file_path);

  if (document.mime_type === "text/plain") {
    return contents.toString("utf8");
  }

  if (document.mime_type === "application/pdf") {
    const data = await pdf(contents);
    return data.text;
  }

  return contents
    .toString("utf8")
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
