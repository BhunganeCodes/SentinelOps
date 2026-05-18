import { useState, useEffect, useRef, useCallback } from "react";

// ─── LOGO ────────────────────────────────────────────────────────────────────
const LOGO_SRC = "data:image/jpeg;base64,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";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const API_BASE_URL = "http://localhost:3001";
const SOCKET_URL = "http://localhost:3001";

// ─── MOCK USER ───────────────────────────────────────────────────────────────
const MOCK_USER = {
  name: "Latoya Matai",
  email: "latoya.matai@sentinelops.io",
  avatar: "LM",
  role: "Security Administrator",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_THREATS = [
  { id: "evt-001", event_type: "injection_detected", severity: "critical", message: "Prompt injection attempt detected in procurement module", metadata: { source_agent: "GPT-Auditor-1", target_system: "ProcurementAPI", ip_address: "192.168.1.45" }, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: "evt-002", event_type: "policy_violated", severity: "high", message: "Policy GP-03 violated: unauthorized data exfiltration attempt", metadata: { source_agent: "GeminiProcure-2", target_system: "VendorDB", ip_address: "10.0.0.12" }, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: "evt-003", event_type: "anomaly_detected", severity: "medium", message: "Unusual API call pattern from agent GPT-Auditor-3", metadata: { source_agent: "GPT-Auditor-3", target_system: "AuditLog", ip_address: "172.16.0.5" }, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: "evt-004", event_type: "unauthorized_access", severity: "critical", message: "Unauthorized access to restricted procurement data", metadata: { source_agent: "ExternalBot-7", target_system: "FinanceAPI", ip_address: "203.45.67.89" }, created_at: new Date(Date.now() - 900000).toISOString() },
  { id: "evt-005", event_type: "injection_detected", severity: "high", message: "SQL injection pattern detected in vendor query", metadata: { source_agent: "GeminiProcure-1", target_system: "VendorDB", ip_address: "10.0.1.33" }, created_at: new Date(Date.now() - 1200000).toISOString() },
  { id: "evt-006", event_type: "policy_violated", severity: "low", message: "Agent exceeded rate limit on document analysis endpoint", metadata: { source_agent: "GPT-Auditor-2", target_system: "DocAnalysis", ip_address: "192.168.2.10" }, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: "evt-007", event_type: "anomaly_detected", severity: "medium", message: "Suspicious pricing anomaly detected in Vendor contract #VN-4421", metadata: { source_agent: "ProcureBot-4", target_system: "ContractMgr", ip_address: "10.0.2.88" }, created_at: new Date(Date.now() - 2400000).toISOString() },
  { id: "evt-008", event_type: "unauthorized_access", severity: "high", message: "Cross-tenant data access attempt blocked by GP-01", metadata: { source_agent: "ExternalBot-3", target_system: "TenantAPI", ip_address: "198.51.100.4" }, created_at: new Date(Date.now() - 3000000).toISOString() },
  { id: "evt-009", event_type: "injection_detected", severity: "critical", message: "Jailbreak attempt on governance policy enforcement layer", metadata: { source_agent: "UnknownAgent", target_system: "PolicyEngine", ip_address: "45.33.32.156" }, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "evt-010", event_type: "policy_violated", severity: "medium", message: "Document upload bypass attempt detected", metadata: { source_agent: "GPT-Auditor-4", target_system: "UploadSvc", ip_address: "192.168.3.22" }, created_at: new Date(Date.now() - 4200000).toISOString() },
];

const MOCK_AUDIT = [
  { id: "aud-001", event_type: "injection_detected", severity: "critical", message: "Prompt injection blocked — procurement module", metadata: { policy: "GP-01", agent: "GPT-Auditor-1" }, created_at: new Date(Date.now() - 60000).toISOString() },
  { id: "aud-002", event_type: "document_upload", severity: "info", message: "Vendor contract uploaded — TechCorp Ltd", metadata: { doc_id: "doc-9981", size: "2.4MB" }, created_at: new Date(Date.now() - 360000).toISOString() },
  { id: "aud-003", event_type: "policy_violated", severity: "high", message: "GP-03 triggered — data scope exceeded", metadata: { policy: "GP-03", agent: "GeminiProcure-2" }, created_at: new Date(Date.now() - 720000).toISOString() },
  { id: "aud-004", event_type: "analysis_complete", severity: "info", message: "Procurement analysis complete — anomaly score 87", metadata: { doc_id: "doc-9978", vendor: "NexaTech" }, created_at: new Date(Date.now() - 1440000).toISOString() },
  { id: "aud-005", event_type: "injection_detected", severity: "high", message: "Cross-prompt injection attempt blocked", metadata: { policy: "GP-02", agent: "ExternalBot-7" }, created_at: new Date(Date.now() - 2160000).toISOString() },
  { id: "aud-006", event_type: "document_upload", severity: "info", message: "RFQ document processed — GlobalSupply Inc", metadata: { doc_id: "doc-9975", size: "1.1MB" }, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "aud-007", event_type: "policy_violated", severity: "medium", message: "Rate limit policy GP-05 exceeded", metadata: { policy: "GP-05", agent: "GPT-Auditor-3" }, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "aud-008", event_type: "analysis_complete", severity: "info", message: "Risk assessment complete — 3 vendors flagged", metadata: { doc_id: "doc-9970", flagged: 3 }, created_at: new Date(Date.now() - 10800000).toISOString() },
];

const MOCK_AGENTS = [
  { id: "ag-01", name: "GPT-Auditor-1", current_task: "Scanning procurement batch #PR-2241", status: "active", risk_score: 12, last_seen: new Date(Date.now() - 30000).toISOString() },
  { id: "ag-02", name: "GeminiProcure-2", current_task: "Analyzing vendor contracts for anomalies", status: "active", risk_score: 34, last_seen: new Date(Date.now() - 60000).toISOString() },
  { id: "ag-03", name: "GPT-Auditor-3", current_task: "Monitoring API call patterns", status: "monitoring", risk_score: 67, last_seen: new Date(Date.now() - 120000).toISOString() },
  { id: "ag-04", name: "ProcureBot-4", current_task: "Cross-referencing vendor pricing data", status: "flagged", risk_score: 89, last_seen: new Date(Date.now() - 300000).toISOString() },
  { id: "ag-05", name: "GeminiProcure-1", current_task: "Document classification — batch #DC-441", status: "active", risk_score: 8, last_seen: new Date(Date.now() - 45000).toISOString() },
  { id: "ag-06", name: "GPT-Auditor-2", current_task: "Idle — awaiting next task assignment", status: "monitoring", risk_score: 5, last_seen: new Date(Date.now() - 600000).toISOString() },
];

const MOCK_VENDORS = [
  { id: "v-01", name: "TechCorp Solutions", anomaly_score: 23, risk_level: "low", compliance_risk: "low", contract_status: "active", last_scan: new Date(Date.now() - 3600000).toISOString(), intelligence_summary: "Consistent pricing. No anomalies detected in last 12 months." },
  { id: "v-02", name: "NexaTech Industries", anomaly_score: 87, risk_level: "critical", compliance_risk: "critical", contract_status: "under_review", last_scan: new Date(Date.now() - 7200000).toISOString(), intelligence_summary: "Multiple pricing irregularities detected. Contract under compliance review." },
  { id: "v-03", name: "GlobalSupply Inc", anomaly_score: 45, risk_level: "medium", compliance_risk: "medium", contract_status: "active", last_scan: new Date(Date.now() - 14400000).toISOString(), intelligence_summary: "Minor pricing deviations noted. Monitoring recommended." },
  { id: "v-04", name: "SecureVend Ltd", anomaly_score: 12, risk_level: "low", compliance_risk: "low", contract_status: "active", last_scan: new Date(Date.now() - 21600000).toISOString(), intelligence_summary: "Fully compliant. No issues detected." },
  { id: "v-05", name: "DataBridge Corp", anomaly_score: 71, risk_level: "high", compliance_risk: "high", contract_status: "under_review", last_scan: new Date(Date.now() - 28800000).toISOString(), intelligence_summary: "Suspicious invoice patterns flagged. Pending compliance audit." },
  { id: "v-06", name: "OmniProcure Systems", anomaly_score: 58, risk_level: "medium", compliance_risk: "medium", contract_status: "active", last_scan: new Date(Date.now() - 43200000).toISOString(), intelligence_summary: "Moderate risk profile. Quarterly review scheduled." },
  { id: "v-07", name: "AlphaSource Group", anomaly_score: 91, risk_level: "critical", compliance_risk: "critical", contract_status: "suspended", last_scan: new Date(Date.now() - 86400000).toISOString(), intelligence_summary: "Contract suspended pending investigation of fraudulent invoicing." },
  { id: "v-08", name: "PrimeParts Co", anomaly_score: 31, risk_level: "low", compliance_risk: "low", contract_status: "active", last_scan: new Date(Date.now() - 108000000).toISOString(), intelligence_summary: "Clean compliance record. No notable concerns." },
];

const MOCK_GOVERNANCE = [
  { id: "gov-001", detected_intent: "Extract vendor pricing beyond authorized scope", declared_intent: "Generate market comparison report", risk_score: 92, action_taken: "blocked", policy_triggered: "GP-01", status: "Open", created_at: new Date(Date.now() - 180000).toISOString() },
  { id: "gov-002", detected_intent: "Access cross-tenant procurement data", declared_intent: "Audit internal documents", risk_score: 78, action_taken: "flagged", policy_triggered: "GP-03", status: "Investigating", created_at: new Date(Date.now() - 900000).toISOString() },
  { id: "gov-003", detected_intent: "Bypass document classification filters", declared_intent: "Process vendor RFQ batch", risk_score: 65, action_taken: "flagged", policy_triggered: "GP-02", status: "Investigating", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "gov-004", detected_intent: "Unauthorized API endpoint enumeration", declared_intent: "Health check system services", risk_score: 55, action_taken: "allowed", policy_triggered: "GP-04", status: "Resolved", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "gov-005", detected_intent: "Exfiltrate confidential contract terms", declared_intent: "Summarize contract highlights", risk_score: 88, action_taken: "blocked", policy_triggered: "GP-01", status: "Open", created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: "gov-006", detected_intent: "Override rate limiting governance rule", declared_intent: "Process urgent vendor batch", risk_score: 42, action_taken: "allowed", policy_triggered: "GP-05", status: "Resolved", created_at: new Date(Date.now() - 28800000).toISOString() },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const severityColor = (s) => {
  const map = { critical: "#FF0F7B", high: "#FF6400", medium: "#FFB800", low: "#00C878", info: "#6496FF", warning: "#FFB800" };
  return map[s?.toLowerCase()] || "#6496FF";
};

const severityBg = (s) => {
  const map = { critical: "rgba(255,15,123,0.15)", high: "rgba(255,100,0,0.15)", medium: "rgba(255,184,0,0.15)", low: "rgba(0,200,120,0.15)", info: "rgba(100,150,255,0.15)", warning: "rgba(255,184,0,0.15)" };
  return map[s?.toLowerCase()] || "rgba(100,150,255,0.15)";
};

const riskColor = (score) => {
  if (score >= 80) return "#FF0F7B";
  if (score >= 60) return "#FF6400";
  return "#00C878";
};

// ─── PARTICLE BACKGROUND ──────────────────────────────────────────────────────
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,15,123,0.25)";
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,15,123,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
};

// ─── SEVERITY BADGE ───────────────────────────────────────────────────────────
const Badge = ({ label, size = "sm" }) => (
  <span style={{
    background: severityBg(label),
    color: severityColor(label),
    border: `1px solid ${severityColor(label)}55`,
    padding: size === "sm" ? "2px 8px" : "4px 12px",
    borderRadius: 4,
    fontSize: size === "sm" ? 10 : 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    whiteSpace: "nowrap",
  }}>{label}</span>
);

// ─── CARD ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{
    background: "rgba(17,17,17,0.85)",
    border: "1px solid rgba(255,15,123,0.2)",
    boxShadow: "0 0 20px rgba(255,15,123,0.05), 0 4px 24px rgba(0,0,0,0.4)",
    backdropFilter: "blur(12px)",
    borderRadius: 12,
    transition: "border-color 0.2s, box-shadow 0.2s",
    ...style,
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,15,123,0.4)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,15,123,0.12), 0 4px 24px rgba(0,0,0,0.5)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,15,123,0.2)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,15,123,0.05), 0 4px 24px rgba(0,0,0,0.4)"; }}
  >
    {children}
  </div>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", style = {}, disabled = false }) => {
  const [hov, setHov] = useState(false);
  const base = variant === "primary" ? {
    background: hov ? "transparent" : "linear-gradient(135deg,#FF0F7B,#FF2D95)",
    border: hov ? "1px solid #FF0F7B" : "1px solid transparent",
    color: hov ? "#FF0F7B" : "#fff",
    boxShadow: hov ? "0 0 20px rgba(255,15,123,0.4)" : "0 0 16px rgba(255,15,123,0.3)",
  } : {
    background: hov ? "rgba(255,15,123,0.15)" : "rgba(255,15,123,0.08)",
    border: hov ? "1px solid rgba(255,15,123,0.4)" : "1px solid rgba(255,15,123,0.2)",
    color: hov ? "#F5F5F5" : "rgba(245,245,245,0.8)",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...base,
        padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        transform: hov ? "translateY(-1px)" : "none",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex", alignItems: "center", gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ─── RISK GAUGE ───────────────────────────────────────────────────────────────
const RiskGauge = ({ score }) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(score), 300); return () => clearTimeout(t); }, [score]);
  const r = 70, cx = 90, cy = 90;
  const circ = Math.PI * r;
  const dash = (anim / 100) * circ;
  const col = riskColor(score);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={180} height={100} style={{ overflow: "visible" }}>
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke={col} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.5s ease, stroke 0.5s ease", filter: `drop-shadow(0 0 6px ${col})` }} />
        <text x={cx} y={cy - 8} textAnchor="middle" fill={col} fontSize={28} fontWeight={700} style={{ filter: `drop-shadow(0 0 8px ${col})` }}>{score}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(245,245,245,0.5)" fontSize={10} fontWeight={500} letterSpacing={2}>RISK SCORE</text>
      </svg>
      {score >= 80 && (
        <div style={{ color: "#FF0F7B", fontSize: 11, fontWeight: 700, letterSpacing: 2, animation: "pulse 1s ease-in-out infinite" }}>
          ⚠ CRITICAL ALERT MODE
        </div>
      )}
    </div>
  );
};

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
const Counter = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const duration = 1000; const step = Math.ceil(value / (duration / 16));
    const t = setInterval(() => { start += step; if (start >= value) { setDisplay(value); clearInterval(t); } else setDisplay(start); }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <span>{display}</span>;
};

// ─── SPLASH SCREEN ───────────────────────────────────────────────────────────
const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState(0); // 0=fadein, 1=pulse, 2=fadeout
  const [pulseCount, setPulseCount] = useState(0);
  const [glowOpacity, setGlowOpacity] = useState(0.2);
  const [opacity, setOpacity] = useState(0);
  const [logoScale, setLogoScale] = useState(0.8);

  useEffect(() => {
    // Fade in logo
    setTimeout(() => { setOpacity(1); setLogoScale(1); }, 100);
    // Start pulses
    setTimeout(() => {
      let count = 0;
      const pulse = () => {
        setGlowOpacity(0.7);
        setTimeout(() => {
          setGlowOpacity(0.15);
          count++;
          setPulseCount(count);
          if (count < 3) setTimeout(pulse, 700);
          else setTimeout(() => { setOpacity(0); setTimeout(onDone, 800); }, 600);
        }, 700);
      };
      pulse();
    }, 1200);
  }, [onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#050505", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, transition: "opacity 0.8s ease", opacity }}>
      <ParticleBackground />
      {/* Rotating ring */}
      <div style={{
        position: "absolute", width: 360, height: 360, borderRadius: "50%",
        border: "1px solid rgba(255,15,123,0.2)",
        animation: "spin 8s linear infinite",
        boxShadow: "0 0 40px rgba(255,15,123,0.1)",
      }} />
      <div style={{
        position: "absolute", width: 320, height: 320, borderRadius: "50%",
        border: "1px dashed rgba(255,15,123,0.1)",
        animation: "spin 12s linear infinite reverse",
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,15,123,${glowOpacity}) 0%, transparent 70%)`,
        transition: "opacity 0.5s ease",
        filter: "blur(30px)",
      }} />
      {/* Logo */}
      <div style={{ position: "relative", zIndex: 2, transition: "transform 1s ease, opacity 1s ease", transform: `scale(${logoScale})` }}>
      <div style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "#0A0A0F",
        padding: "6px",
        display: "inline-block"
        }}>
        <img
            src={LOGO_SRC}
            style={{
            display: "block",
            borderRadius: "12px",
            width: "100%"
            }}
        />
      </div>
      </div>
      <div style={{ position: "relative", zIndex: 2, marginTop: 16, color: "rgba(245,245,245,0.4)", fontSize: 11, letterSpacing: 4, fontWeight: 500 }}>
        INITIALIZING COMMAND CENTER
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { onLogin(MOCK_USER); setLoading(false); }, 1500);
  };
  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <ParticleBackground />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 32, animation: "fadeUp 0.6s ease" }}>
        <div style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "#0A0A0F",
        padding: "6px",
        display: "inline-block"
        }}>
        <img
            src={LOGO_SRC}
            style={{
            display: "block",
            borderRadius: "12px",
            width: "100%"
            }}
        />
        </div>
        <Card style={{ width: 380, padding: 36 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Welcome Back</div>
            <div style={{ color: "rgba(245,245,245,0.5)", fontSize: 13 }}>Sign in to SentinelOPS Command Center</div>
          </div>
          <Btn onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px 0", fontSize: 14 }}>
            {loading ? (
              <><span style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: 8 }}>⟳</span> Authenticating...</>
            ) : (
              <><svg width={18} height={18} viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v2.8h5.35C16.8 16.6 14.65 18 12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.55 0 2.95.6 4 1.55l2.1-2.1C16.5 3.8 14.35 3 12 3 7.05 3 3 7.05 3 12s4.05 9 9 9c5.2 0 8.65-3.6 8.65-9 0-.6-.05-1.2-.15-1.9z" /></svg>Continue with Google</>
            )}
          </Btn>
          <div style={{ textAlign: "center", marginTop: 16, color: "rgba(245,245,245,0.3)", fontSize: 11 }}>
             Secured by enterprise-grade authentication
          </div>
        </Card>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "upload", label: "Upload Center", icon: "↑" },
  { id: "threats", label: "Threat Feed", icon: "⚡", count: 4 },
  { id: "audit", label: "Audit Timeline", icon: "≡" },
  { id: "governance", label: "Governance Events", icon: "⚖", count: 2 },
  { id: "procurement", label: "Procurement Analysis", icon: "📋" },
  { id: "vendor", label: "Vendor Intelligence", icon: "🏢" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const Sidebar = ({ currentPage, onNav, user }) => (
  <aside style={{
    width: 260, minHeight: "100vh", background: "#0A0A0F",
    borderRight: "1px solid rgba(255,15,123,0.1)",
    display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
  }}>
    <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,15,123,0.1)" }}>
      <img src={LOGO_SRC} alt="SentinelOPS" style={{ width: 150, objectFit: "contain", cursor: "pointer" }} onClick={() => onNav("dashboard")} />
    </div>
    <div style={{ padding: "12px 16px 4px" }}>
      <div style={{ color: "rgba(245,245,245,0.3)", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Command Center</div>
    </div>
    <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
      {NAV_ITEMS.map(item => {
        const active = currentPage === item.id;
        return (
          <div key={item.id} onClick={() => onNav(item.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
            marginBottom: 2,
            background: active ? "rgba(255,15,123,0.1)" : "transparent",
            borderLeft: active ? "3px solid #FF0F7B" : "3px solid transparent",
            color: active ? "#FF0F7B" : "rgba(245,245,245,0.7)",
            fontWeight: active ? 600 : 400,
            fontSize: 13,
            transition: "all 0.2s ease",
            boxShadow: active ? "inset 0 0 20px rgba(255,15,123,0.05)" : "none",
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,15,123,0.06)"; e.currentTarget.style.color = "#F5F5F5"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(245,245,245,0.7)"; } }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.count && <span style={{ background: "rgba(255,15,123,0.2)", color: "#FF0F7B", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10, border: "1px solid rgba(255,15,123,0.3)" }}>{item.count}</span>}
          </div>
        );
      })}
    </nav>
    {/* User panel */}
    <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,15,123,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#FF0F7B,#FF2D95)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{user.avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#F5F5F5", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
        <div style={{ color: "rgba(245,245,245,0.4)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.role}</div>
      </div>
    </div>
  </aside>
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ user, onNav, onLogout, isLive }) => {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 260, right: 0, height: 64, zIndex: 99,
      background: "rgba(5,5,5,0.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,15,123,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
    }}>
      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,15,123,0.1)", borderRadius: 8, padding: "7px 14px", width: 280 }}>
        <span style={{ color: "rgba(245,245,245,0.4)", fontSize: 14 }}>🔍</span>
        <input placeholder="Search threats, vendors, events..." style={{ background: "none", border: "none", outline: "none", color: "#F5F5F5", fontSize: 13, width: "100%" }} />
      </div>
      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Connection status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.3)", border: `1px solid ${isLive ? "rgba(0,200,120,0.3)" : "rgba(255,184,0,0.3)"}`, borderRadius: 20, padding: "4px 12px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? "#00C878" : "#FFB800", boxShadow: `0 0 6px ${isLive ? "#00C878" : "#FFB800"}`, animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: isLive ? "#00C878" : "#FFB800" }}>{isLive ? "LIVE" : "DEMO"}</span>
        </div>
        {/* Bell */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <span style={{ fontSize: 18, color: "rgba(245,245,245,0.6)" }}>🔔</span>
          <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, background: "#FF0F7B", borderRadius: "50%", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>4</div>
        </div>
        {/* Avatar dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <div onClick={() => setDropOpen(!dropOpen)} style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#FF0F7B,#FF2D95)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 0 12px rgba(255,15,123,0.4)" }}>
            {user.avatar}
          </div>
          {dropOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 10px)", width: 240, zIndex: 200,
              background: "rgba(17,17,17,0.98)", border: "1px solid rgba(255,15,123,0.25)", borderRadius: 12,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)", overflow: "hidden",
              animation: "dropIn 0.15s ease",
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,15,123,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#FF0F7B,#FF2D95)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{user.avatar}</div>
                <div>
                  <div style={{ color: "#F5F5F5", fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>{user.email}</div>
                </div>
              </div>
              {[
                { label: "Profile", icon: "👤", action: () => {} },
                { label: "Settings", icon: "⚙", action: () => { onNav("settings"); setDropOpen(false); } },
                { label: "Notifications", icon: "🔔", action: () => {} },
                { label: "Theme Preferences", icon: "🎨", action: () => {} },
              ].map(item => (
                <div key={item.label} onClick={item.action} style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "rgba(245,245,245,0.75)", fontSize: 13, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,15,123,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span>{item.icon}</span>{item.label}
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,15,123,0.1)" }}>
                <div onClick={() => { onLogout(); setDropOpen(false); }} style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#FF0F7B", fontSize: 13, fontWeight: 600, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,15,123,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span>🚪</span>Logout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes dropIn { from{opacity:0;transform:scale(0.95) translateY(-5px)} to{opacity:1;transform:scale(1) translateY(0)} } @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </header>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, sub, alert }) => (
  <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,15,123,0.1)", border: "1px solid rgba(255,15,123,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
      <span style={{ color: "rgba(245,245,245,0.6)", fontSize: 13, fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ fontSize: 30, fontWeight: 700, color: alert ? "#FF0F7B" : "#F5F5F5", textShadow: alert ? "0 0 20px rgba(255,15,123,0.5)" : "none" }}>
      <Counter value={value} />
    </div>
    {sub && <div style={{ fontSize: 11, color: "rgba(245,245,245,0.4)" }}>{sub}</div>}
  </div>
);

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
const DashboardPage = ({ threats, setThreats, auditLogs }) => {
  const riskScore = Math.min(100, 73 + Math.floor(threats.length * 0.5));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats bar */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <StatCard label="Total Events" value={threats.length} icon="📊" sub="Last 24 hours" />
          <div style={{ width: 1, background: "rgba(255,15,123,0.1)", margin: "12px 0" }} />
          <StatCard label="Blocked Threats" value={threats.filter(t => t.severity === "critical").length} icon="🛡️" sub="Critical events" />
          <div style={{ width: 1, background: "rgba(255,15,123,0.1)", margin: "12px 0" }} />
          <StatCard label="Risk Score" value={riskScore} icon="⚠️" sub="System-wide" alert={riskScore >= 80} />
          <div style={{ width: 1, background: "rgba(255,15,123,0.1)", margin: "12px 0" }} />
          <StatCard label="Active Alerts" value={threats.filter(t => t.severity === "critical" || t.severity === "high").length} icon="⚡" sub="Require attention" />
        </div>
      </Card>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Live threat feed */}
          <Card style={{ flex: 1 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,15,123,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15 }}>Live Threat Feed</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF0F7B", animation: "pulse 1s ease-in-out infinite" }} />
                <span style={{ fontSize: 10, color: "#FF0F7B", letterSpacing: 1 }}>LIVE</span>
              </div>
            </div>
            <div style={{ padding: "8px", maxHeight: 320, overflowY: "auto" }}>
              {threats.slice(0, 8).map((t, i) => (
                <div key={t.id} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", animation: i === 0 ? "slideIn 0.3s ease" : "none", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,15,123,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <Badge label={t.severity} />
                    <span style={{ color: "rgba(245,245,245,0.35)", fontSize: 10 }}>{timeAgo(t.created_at)}</span>
                  </div>
                  <div style={{ color: "rgba(245,245,245,0.8)", fontSize: 12, lineHeight: 1.4 }}>{t.message}</div>
                  <div style={{ color: "rgba(245,245,245,0.3)", fontSize: 10, marginTop: 4 }}>{t.metadata?.source_agent}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Agent Monitor */}
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,15,123,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15 }}>AI Agents</span>
              <span style={{ background: "rgba(0,200,120,0.15)", color: "#00C878", border: "1px solid rgba(0,200,120,0.3)", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{MOCK_AGENTS.filter(a => a.status === "active").length} Active</span>
            </div>
            <div style={{ padding: "8px" }}>
              {MOCK_AGENTS.map(agent => (
                <div key={agent.id} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: agent.status === "active" ? "#00C878" : agent.status === "flagged" ? "#FF0F7B" : "#6496FF", flexShrink: 0, boxShadow: `0 0 6px ${agent.status === "active" ? "#00C878" : agent.status === "flagged" ? "#FF0F7B" : "#6496FF"}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#F5F5F5", fontSize: 12, fontWeight: 600 }}>{agent.name}</div>
                    <div style={{ color: "rgba(245,245,245,0.4)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.current_task}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: riskColor(agent.risk_score) }}>{agent.risk_score}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Risk Gauge */}
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,15,123,0.1)" }}>
              <span style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15 }}>System Risk Score</span>
            </div>
            <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <RiskGauge score={riskScore} />
              <div style={{ flex: 1, minWidth: 200 }}>
                {[{ label: "Injection Attempts", val: 34, color: "#FF0F7B" }, { label: "Policy Violations", val: 58, color: "#FF6400" }, { label: "Anomaly Score", val: 71, color: "#FFB800" }, { label: "Compliance Rate", val: 87, color: "#00C878" }].map(item => (
                  <div key={item.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "rgba(245,245,245,0.6)", fontSize: 12 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: 12, fontWeight: 700 }}>{item.val}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.val}%`, background: item.color, borderRadius: 2, boxShadow: `0 0 6px ${item.color}`, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Audit Timeline */}
          <Card style={{ flex: 1 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,15,123,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15 }}>Recent Audit Events</span>
              <Btn variant="ghost" style={{ padding: "4px 10px", fontSize: 11 }}>View All</Btn>
            </div>
            <div style={{ padding: "16px 20px", position: "relative" }}>
              <div style={{ position: "absolute", left: 28, top: 16, bottom: 16, width: 1, background: "rgba(255,15,123,0.15)" }} />
              {auditLogs.slice(0, 6).map(log => (
                <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16, position: "relative" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: severityColor(log.severity), flexShrink: 0, marginTop: 2, boxShadow: `0 0 8px ${severityColor(log.severity)}`, border: "2px solid #0A0A0F", zIndex: 1 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ color: "#F5F5F5", fontSize: 12, fontWeight: 600 }}>{log.event_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</div>
                        <div style={{ color: "rgba(245,245,245,0.5)", fontSize: 11, marginTop: 2 }}>{log.message}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        <Badge label={log.severity} />
                        <span style={{ color: "rgba(245,245,245,0.3)", fontSize: 10 }}>{timeAgo(log.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
};

// ─── UPLOAD PAGE ──────────────────────────────────────────────────────────────
const UploadPage = () => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploads] = useState([
    { name: "VendorContract_TechCorp.pdf", type: "PDF", time: "2 mins ago", status: "analyzed" },
    { name: "RFQ_GlobalSupply_Q4.docx", type: "DOCX", time: "14 mins ago", status: "analyzed" },
    { name: "PricingData_NexaTech.csv", type: "CSV", time: "1 hour ago", status: "flagged" },
    { name: "ComplianceReport_2024.pdf", type: "PDF", time: "3 hours ago", status: "analyzed" },
  ]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false); setUploading(true); setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(interval); setUploading(false); return 100; } return p + 5; });
    }, 80);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, margin: 0 }}>Upload Center</h1>
      <Card>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            padding: 48, textAlign: "center", border: `2px dashed ${dragging ? "#FF0F7B" : "rgba(255,15,123,0.3)"}`,
            borderRadius: 12, background: dragging ? "rgba(255,15,123,0.05)" : "transparent",
            transition: "all 0.2s ease", cursor: "pointer",
          }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>☁</div>
          <div style={{ color: "#F5F5F5", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Drag & Drop Documents Here</div>
          <div style={{ color: "rgba(245,245,245,0.4)", fontSize: 13, marginBottom: 16 }}>or click to browse files</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {["PDF", "DOCX", "CSV"].map(t => <Badge key={t} label={t} />)}
          </div>
          {uploading && (
            <div style={{ marginTop: 20 }}>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#FF0F7B,#FF2D95)", transition: "width 0.1s", boxShadow: "0 0 10px rgba(255,15,123,0.5)" }} />
              </div>
              <div style={{ color: "#FF0F7B", fontSize: 12, marginTop: 8 }}>Uploading... {progress}%</div>
            </div>
          )}
        </div>
      </Card>
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,15,123,0.1)" }}>
          <span style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15 }}>Recent Uploads</span>
        </div>
        <div style={{ padding: 8 }}>
          {uploads.map((u, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,15,123,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,15,123,0.1)", border: "1px solid rgba(255,15,123,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#FF0F7B" }}>{u.type}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#F5F5F5", fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                <div style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>{u.time}</div>
              </div>
              <Badge label={u.status === "flagged" ? "high" : "low"} />
              <Btn variant="ghost" style={{ padding: "4px 12px", fontSize: 11 }}>View Analysis</Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── THREAT FEED PAGE ─────────────────────────────────────────────────────────
const ThreatFeedPage = ({ threats }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? threats : threats.filter(t => t.severity === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, margin: 0 }}>Threat Feed</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "critical", "high", "medium", "low"].map(f => (
            <Btn key={f} variant={filter === f ? "primary" : "ghost"} onClick={() => setFilter(f)} style={{ padding: "6px 14px", fontSize: 12, textTransform: "capitalize" }}>{f}</Btn>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(t => (
          <Card key={t.id} style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Badge label={t.severity} />
                    <span style={{ color: "rgba(245,245,245,0.5)", fontSize: 12, fontWeight: 600 }}>{t.event_type.replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                  <div style={{ color: "#F5F5F5", fontSize: 14, marginBottom: 8 }}>{t.message}</div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>Agent: <span style={{ color: "rgba(245,245,245,0.7)" }}>{t.metadata?.source_agent}</span></span>
                    <span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>Target: <span style={{ color: "rgba(245,245,245,0.7)" }}>{t.metadata?.target_system}</span></span>
                    <span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>IP: <span style={{ color: "rgba(245,245,245,0.7)" }}>{t.metadata?.ip_address}</span></span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>{timeAgo(t.created_at)}</div>
                  <div style={{ color: "rgba(245,245,245,0.3)", fontSize: 10, marginTop: 4 }}>{t.id}</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── AUDIT TIMELINE PAGE ──────────────────────────────────────────────────────
const AuditPage = ({ logs }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <h1 style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, margin: 0 }}>Audit Timeline</h1>
    <Card>
      <div style={{ padding: "24px 24px 24px 48px", position: "relative" }}>
        <div style={{ position: "absolute", left: 36, top: 0, bottom: 0, width: 1, background: "rgba(255,15,123,0.2)" }} />
        {logs.map(log => (
          <div key={log.id} style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ position: "absolute", left: -26, top: 4, width: 14, height: 14, borderRadius: "50%", background: severityColor(log.severity), border: "2px solid #0A0A0F", zIndex: 1, boxShadow: `0 0 10px ${severityColor(log.severity)}` }} />
            <div style={{ marginLeft: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#F5F5F5", fontSize: 13, fontWeight: 600 }}>{log.event_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                  <Badge label={log.severity} />
                </div>
                <span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>{timeAgo(log.created_at)}</span>
              </div>
              <div style={{ color: "rgba(245,245,245,0.6)", fontSize: 12 }}>{log.message}</div>
              <div style={{ color: "rgba(245,245,245,0.3)", fontSize: 10, marginTop: 4, fontFamily: "monospace" }}>ID: {log.id}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── GOVERNANCE PAGE ──────────────────────────────────────────────────────────
const GovernancePage = () => {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, margin: 0 }}>Governance Events</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {MOCK_GOVERNANCE.map(g => (
          <Card key={g.id} style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge label={g.action_taken === "blocked" ? "critical" : g.action_taken === "flagged" ? "high" : "low"} />
                  <span style={{ background: "rgba(100,150,255,0.1)", color: "#6496FF", border: "1px solid rgba(100,150,255,0.3)", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{g.policy_triggered}</span>
                </div>
                <span style={{ background: g.status === "Open" ? "rgba(255,15,123,0.15)" : g.status === "Investigating" ? "rgba(255,184,0,0.15)" : "rgba(0,200,120,0.15)", color: g.status === "Open" ? "#FF0F7B" : g.status === "Investigating" ? "#FFB800" : "#00C878", border: `1px solid ${g.status === "Open" ? "rgba(255,15,123,0.3)" : g.status === "Investigating" ? "rgba(255,184,0,0.3)" : "rgba(0,200,120,0.3)"}`, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{g.status}</span>
              </div>
              <div style={{ color: "#F5F5F5", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{g.detected_intent}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>{timeAgo(g.created_at)}</span>
                <span style={{ color: riskColor(g.risk_score), fontSize: 14, fontWeight: 700 }}>Risk: {g.risk_score}</span>
              </div>
              {expanded === g.id && (
                <div style={{ marginTop: 14, padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,15,123,0.1)", animation: "fadeIn 0.2s ease" }}>
                  <div style={{ marginBottom: 8 }}><span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>Declared Intent:</span><div style={{ color: "rgba(245,245,245,0.7)", fontSize: 12 }}>{g.declared_intent}</div></div>
                  <div style={{ marginBottom: 8 }}><span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>Action Taken:</span><div style={{ color: "#F5F5F5", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{g.action_taken}</div></div>
                  <div><span style={{ color: "rgba(245,245,245,0.4)", fontSize: 11 }}>Event ID:</span><div style={{ color: "rgba(245,245,245,0.7)", fontSize: 11, fontFamily: "monospace" }}>{g.id}</div></div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
};

// ─── PROCUREMENT PAGE ─────────────────────────────────────────────────────────
const ProcurementPage = () => {
  const avgAnomaly = Math.round(MOCK_VENDORS.reduce((a, v) => a + v.anomaly_score, 0) / MOCK_VENDORS.length);
  const highRisk = MOCK_VENDORS.filter(v => v.risk_level === "critical" || v.risk_level === "high").length;
  const flagged = MOCK_VENDORS.filter(v => v.anomaly_score > 60).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, margin: 0 }}>Procurement Analysis</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {[{ label: "Avg Anomaly Score", val: avgAnomaly, color: riskColor(avgAnomaly) }, { label: "High Risk Vendors", val: highRisk, color: "#FF0F7B" }, { label: "Flagged Items", val: flagged, color: "#FFB800" }].map(s => (
          <Card key={s.label} style={{ padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.val}</div>
            <div style={{ color: "rgba(245,245,245,0.5)", fontSize: 12 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,15,123,0.1)" }}>
          <span style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15 }}>Vendor Risk Table</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,15,123,0.1)" }}>
                {["Vendor", "Anomaly Score", "Compliance Risk", "Suspicious Pricing", "Contract Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "rgba(245,245,245,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_VENDORS.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,15,123,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 20px", color: "#F5F5F5", fontSize: 13, fontWeight: 500 }}>{v.name}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: riskColor(v.anomaly_score), fontWeight: 700, fontSize: 14 }}>{v.anomaly_score}</span>
                      <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${v.anomaly_score}%`, background: riskColor(v.anomaly_score), transition: "width 1s" }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}><Badge label={v.compliance_risk} /></td>
                  <td style={{ padding: "14px 20px" }}><Badge label={v.anomaly_score > 60 ? "critical" : "low"} /></td>
                  <td style={{ padding: "14px 20px" }}><span style={{ color: v.contract_status === "active" ? "#00C878" : v.contract_status === "suspended" ? "#FF0F7B" : "#FFB800", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{v.contract_status.replace("_", " ")}</span></td>
                  <td style={{ padding: "14px 20px" }}><Btn variant="ghost" style={{ padding: "4px 12px", fontSize: 11 }}>View</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── VENDOR INTELLIGENCE PAGE ─────────────────────────────────────────────────
const VendorPage = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <h1 style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, margin: 0 }}>Vendor Intelligence</h1>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
      {MOCK_VENDORS.map(v => (
        <Card key={v.id} style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ color: "#F5F5F5", fontSize: 15, fontWeight: 700 }}>{v.name}</div>
            <Badge label={v.risk_level} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            <RiskGauge score={v.anomaly_score} />
            <div>
              <div style={{ color: "rgba(245,245,245,0.5)", fontSize: 11, marginBottom: 4 }}>Contract Status</div>
              <div style={{ color: v.contract_status === "active" ? "#00C878" : v.contract_status === "suspended" ? "#FF0F7B" : "#FFB800", fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{v.contract_status.replace("_", " ")}</div>
              <div style={{ color: "rgba(245,245,245,0.4)", fontSize: 10, marginTop: 6 }}>Last scan: {timeAgo(v.last_scan)}</div>
            </div>
          </div>
          <div style={{ color: "rgba(245,245,245,0.5)", fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>{v.intelligence_summary}</div>
          <Btn variant="ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>View Full Report</Btn>
        </Card>
      ))}
    </div>
  </div>
);

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
const SettingsPage = ({ user, onLogout }) => {
  const [notifs, setNotifs] = useState({ email: true, critical: true, audit: false, weekly: true });
  const [theme, setTheme] = useState("dark");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
      <h1 style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, margin: 0 }}>Settings</h1>
      {/* Profile */}
      <Card style={{ padding: 24 }}>
        <div style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Profile Settings</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#FF0F7B,#FF2D95)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20 }}>{user.avatar}</div>
          <div>
            <div style={{ color: "#F5F5F5", fontSize: 16, fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: "rgba(245,245,245,0.5)", fontSize: 13 }}>{user.email}</div>
            <div style={{ color: "#FF0F7B", fontSize: 12, fontWeight: 600 }}>{user.role}</div>
          </div>
        </div>
        <Btn variant="ghost" style={{ fontSize: 12 }}>Edit Profile</Btn>
      </Card>
      {/* Notifications */}
      <Card style={{ padding: 24 }}>
        <div style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Notification Preferences</div>
        {[{ key: "email", label: "Email Alerts" }, { key: "critical", label: "Critical Threat Notifications" }, { key: "audit", label: "Audit Log Emails" }, { key: "weekly", label: "Weekly Reports" }].map(n => (
          <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ color: "rgba(245,245,245,0.75)", fontSize: 13 }}>{n.label}</span>
            <div onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} style={{ width: 44, height: 24, borderRadius: 12, background: notifs[n.key] ? "linear-gradient(135deg,#FF0F7B,#FF2D95)" : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", transition: "background 0.2s", boxShadow: notifs[n.key] ? "0 0 12px rgba(255,15,123,0.4)" : "none" }}>
              <div style={{ position: "absolute", top: 3, left: notifs[n.key] ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
            </div>
          </div>
        ))}
      </Card>
      {/* Theme */}
      <Card style={{ padding: 24 }}>
        <div style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Theme Preferences</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ id: "dark", label: "Dark", bg: "#111" }, { id: "darker", label: "Darker", bg: "#080808" }, { id: "midnight", label: "Midnight", bg: "#050505" }].map(t => (
            <div key={t.id} onClick={() => setTheme(t.id)} style={{ flex: 1, padding: "16px", borderRadius: 10, cursor: "pointer", border: `1px solid ${theme === t.id ? "#FF0F7B" : "rgba(255,255,255,0.08)"}`, background: t.bg, textAlign: "center", transition: "border-color 0.2s", boxShadow: theme === t.id ? "0 0 16px rgba(255,15,123,0.2)" : "none" }}>
              <div style={{ width: 32, height: 32, background: "rgba(255,15,123,0.2)", borderRadius: 6, margin: "0 auto 8px" }} />
              <div style={{ color: theme === t.id ? "#FF0F7B" : "rgba(245,245,245,0.6)", fontSize: 12, fontWeight: 600 }}>{t.label}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* API Config */}
      <Card style={{ padding: 24 }}>
        <div style={{ color: "#F5F5F5", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>API Integration</div>
        {[{ label: "API Base URL", val: API_BASE_URL }, { label: "Socket URL", val: SOCKET_URL }].map(c => (
          <div key={c.label} style={{ marginBottom: 14 }}>
            <div style={{ color: "rgba(245,245,245,0.5)", fontSize: 11, marginBottom: 4 }}>{c.label}</div>
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,15,123,0.15)", borderRadius: 6, padding: "8px 14px", fontFamily: "monospace", fontSize: 12, color: "#00C878" }}>{c.val}</div>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(0,200,120,0.08)", border: "1px solid rgba(0,200,120,0.2)", borderRadius: 8, color: "rgba(0,200,120,0.8)", fontSize: 12 }}>
          ✓ Replace these values with real backend URLs to connect live data
        </div>
      </Card>
      {/* Danger zone */}
      <Card style={{ padding: 24, borderColor: "rgba(255,15,123,0.3)" }}>
        <div style={{ color: "#FF0F7B", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Session Management</div>
        <Btn onClick={onLogout} style={{ background: "rgba(255,15,123,0.1)", border: "1px solid rgba(255,15,123,0.4)", color: "#FF0F7B", fontSize: 12 }}>🚪 Logout</Btn>
      </Card>
    </div>
  );
};

// ─── SHELL LAYOUT ─────────────────────────────────────────────────────────────
const AppShell = ({ children, currentPage, onNav, user, onLogout, isLive }) => (
  <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#F5F5F5", fontFamily: "'Inter', sans-serif" }}>
    <ParticleBackground />
    <Sidebar currentPage={currentPage} onNav={onNav} user={user} />
    <Navbar user={user} onNav={onNav} onLogout={onLogout} isLive={isLive} />
    <main
        style={{
            marginLeft: window.innerWidth < 768 ? 0 : 260,
            paddingTop: 64,
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
            paddingLeft: window.innerWidth < 768 ? 12 : 24,
            paddingRight: window.innerWidth < 768 ? 12 : 24
        }}
        >
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      {children}
    </main>
  </div>
);

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isLive] = useState(false);
  const [threats, setThreats] = useState(MOCK_THREATS);
  const [auditLogs] = useState(MOCK_AUDIT);

  // Live feed simulation
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const newThreats = [
        { id: `evt-${Date.now()}`, event_type: "injection_detected", severity: ["critical", "high", "medium"][Math.floor(Math.random() * 3)], message: ["Real-time prompt injection blocked", "Cross-agent data leak attempt detected", "Unauthorized scope escalation prevented", "Policy GP-02 enforcement triggered"][Math.floor(Math.random() * 4)], metadata: { source_agent: MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)].name, target_system: ["ProcurementAPI", "VendorDB", "AuditLog"][Math.floor(Math.random() * 3)], ip_address: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` }, created_at: new Date().toISOString() },
      ];
      setThreats(prev => [...newThreats, ...prev].slice(0, 30));
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = useCallback((u) => { setUser(u); setScreen("app"); }, []);
  const handleLogout = useCallback(() => { setUser(null); setScreen("login"); setCurrentPage("dashboard"); }, []);
  const handleNav = useCallback((page) => setCurrentPage(page), []);

  if (screen === "splash") return <SplashScreen onDone={() => setScreen("login")} />;
  if (screen === "login") return <LoginScreen onLogin={handleLogin} />;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardPage threats={threats} setThreats={setThreats} auditLogs={auditLogs} />;
      case "upload": return <UploadPage />;
      case "threats": return <ThreatFeedPage threats={threats} />;
      case "audit": return <AuditPage logs={auditLogs} />;
      case "governance": return <GovernancePage />;
      case "procurement": return <ProcurementPage />;
      case "vendor": return <VendorPage />;
      case "settings": return <SettingsPage user={user} onLogout={handleLogout} />;
      default: return <DashboardPage threats={threats} setThreats={setThreats} auditLogs={auditLogs} />;
    }
  };

  return (
    <AppShell currentPage={currentPage} onNav={handleNav} user={user} onLogout={handleLogout} isLive={isLive}>
      {renderPage()}
    </AppShell>
  );
}