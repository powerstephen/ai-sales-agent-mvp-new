export type Signal = {
  id: string;
  company: string;
  industry: string;
  employees: number;
  signal: string;
  persona: string;
};

export const signals: Signal[] = [
  {
    id: "sig_001",
    company: "PipelineIQ",
    industry: "B2B SaaS",
    employees: 110,
    signal: "Hiring 4 SDRs and 1 Sales Manager",
    persona: "Head of Sales",
  },
  {
    id: "sig_002",
    company: "RevLayer",
    industry: "B2B SaaS",
    employees: 75,
    signal: "Raised Series A (€12M)",
    persona: "Founder",
  },
  {
    id: "sig_003",
    company: "DemandForge",
    industry: "Marketing Software",
    employees: 220,
    signal: "Launching new outbound motion",
    persona: "VP Marketing",
  },
  {
    id: "sig_004",
    company: "OpsPilot",
    industry: "Operations SaaS",
    employees: 160,
    signal: "Expanding into US market",
    persona: "Head of Sales",
  },
  {
    id: "sig_005",
    company: "FlowMetrics",
    industry: "B2B SaaS",
    employees: 95,
    signal: "Hiring RevOps Manager",
    persona: "RevOps",
  },
];

function getEmployeeBand(size: number): string {
  if (size < 50) return "1-49";
  if (size <= 200) return "50-200";
  if (size <= 500) return "201-500";
  return "500+";
}

export function scoreSignal(signal: Signal, icp: any) {
  let score = 0;

  if (signal.industry.toLowerCase().includes("saas")) score += 40;

  const band = getEmployeeBand(signal.employees);
  if (band === icp.employeeBand) score += 25;

  if (
    signal.persona.toLowerCase().includes("sales") ||
    signal.persona.toLowerCase().includes("revops")
  ) {
    score += 25;
  }

  if (
    signal.signal.toLowerCase().includes("hiring") ||
    signal.signal.toLowerCase().includes("funding")
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function getSignalReason(signal: Signal) {
  const reasons: string[] = [];

  if (signal.industry.toLowerCase().includes("saas")) {
    reasons.push("Matches high-performing industry");
  }

  if (signal.signal.toLowerCase().includes("hiring")) {
    reasons.push("Hiring sales team → pipeline pressure");
  }

  if (signal.signal.toLowerCase().includes("funding")) {
    reasons.push("Recent funding → growth focus");
  }

  if (signal.persona.toLowerCase().includes("sales")) {
    reasons.push("Sales leadership involved");
  }

  return reasons;
}
