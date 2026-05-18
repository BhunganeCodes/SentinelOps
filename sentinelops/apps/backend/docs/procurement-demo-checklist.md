# Procurement Demo Checklist

1. Start the backend with staging Supabase credentials and `GEMINI_API_KEY` set.
2. Upload `apps/backend/docs/demo-procurement-document.pdf` to `POST /api/upload` using the `file` form field.
3. Confirm the response returns `200` with `document_id` and `status`.
4. Confirm prompt injection inspection approves the demo document or blocks unsafe text with `403`.
5. Confirm `GET /api/vendors` returns at least one row with `vendor_name`, `anomaly_score`, and `risk_level`.
6. Narrate that Gemini extracted vendor findings after the prompt inspection gate passed.
