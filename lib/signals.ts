import { buildICP } from "@/lib/icp";
import { leads } from "@/lib/data";

export type Signal = {
  id: string;
  company: string;
  industry: string;
  employees: number;
  signal: string;
  persona: string;
  location: string;
};

export const signals: Signal[] = [
  {
    id: "sig_001",
    company: "PipelineIQ",
    industry: "B2B SaaS",
    employees: 110,
    signal: "Hiring 4 SDRs and 1 Sales Manager",
    persona: "Head of Sales",
    location: "London, UK",
  },
  {
    id: "sig_002",
    company: "RevLayer",
    industry: "B2B SaaS",
    employees: 75,
    signal: "Raised Series A (€12M)",
    persona: "Founder",
    location: "Berlin, Germany",
  },
  {
    id: "sig_003",
    company: "DemandForge",
    industry: "Marketing Software",
    employees: 220,
    signal: "Launching new outbound motion",
    persona: "VP Marketing",
    location: "Dublin, Ireland",
  },
  {
    id: "sig_004",
    company: "OpsPilot",
    industry: "Operations SaaS",
    employees: 160,
    signal: "Expanding into US market",
    persona: "Head of Sales",
    location: "Amsterdam, Netherlands",
  },
  {
    id: "sig_005",
    company: "FlowMetrics",
    industry: "B2B SaaS",
    employees: 95,
    signal: "Hiring RevOps Manager",
    persona: "RevOps",
    location: "Paris, France",
  },
];

export function getSignalById(id: string) {
  return signals.find((signal) => signal.id === id);
}

function getEmployeeBand(size: number): string {
  if (size < 50) return "1-49";
  if (size <= 200) return "50-200";
  if (size <= 500) return "201-500";
  return "500+";
}

export function scoreSignal(signal: Signal) {
  const icp = buildICP(leads);
  let score = 0;

  if (signal.industry.toLowerCase().includes("saas")) score += 40;

  const band = getEmployeeBand(signal.employees);
  if (band === icp.employeeBand) score += 25;
  else if (
    (band === "201-500" && icp.employeeBand === "50-200") ||
    (band === "50-200" && icp.employeeBand === "201-500")
  ) {
    score += 15;
  }

  if (
    signal.persona.toLowerCase().includes("sales") ||
    signal.persona.toLowerCase().includes("revops")
  ) {
    score += 25;
  } else if (
    signal.persona.toLowerCase().includes("founder") ||
    signal.persona.toLowerCase().includes("marketing")
  ) {
    score += 12;
  }

  if (
    signal.signal.toLowerCase().includes("hiring") ||
    signal.signal.toLowerCase().includes("funding") ||
    signal.signal.toLowerCase().includes("expanding") ||
    signal.signal.toLowerCase().includes("launch")
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function getSignalReasons(signal: Signal) {
  const reasons: string[] = [];

  if (signal.industry.toLowerCase().includes("saas")) {
    reasons.push("Matches high-performing industry");
  }

  const band = getEmployeeBand(signal.employees);
  if (band === "50-200") {
    reasons.push("Matches ideal company size band");
  } else if (band === "201-500") {
    reasons.push("Close to ideal company size band");
  }

  if (signal.signal.toLowerCase().includes("hiring")) {
    reasons.push("Hiring signal suggests demand or pipeline pressure");
  }

  if (signal.signal.toLowerCase().includes("funding")) {
    reasons.push("Funding event suggests growth initiative");
  }

  if (signal.signal.toLowerCase().includes("expanding")) {
    reasons.push("Expansion signal suggests new pipeline creation");
  }

  if (signal.persona.toLowerCase().includes("sales")) {
    reasons.push("Sales leadership is a strong buyer persona");
  }

  if (signal.persona.toLowerCase().includes("revops")) {
    reasons.push("RevOps persona is close to core ICP");
  }

  if (signal.persona.toLowerCase().includes("founder")) {
    reasons.push("Founder persona can be strong in earlier-stage companies");
  }

  return reasons.slice(0, 4);
}

export function getSignalReasoning(signal: Signal) {
  const score = scoreSignal(signal);
  const reasons = getSignalReasons(signal);

  const strength =
    score >= 80
      ? "This looks like a strong net-new opportunity."
      : score >= 60
      ? "This looks like a reasonable ICP match worth testing."
      : "This is a weaker signal, but there may still be value in outreach.";

  const trigger = `The trigger here is ${signal.signal.toLowerCase()}, which often creates a relevant commercial moment.`;

  const fit =
    reasons.length > 0
      ? `It aligns because ${reasons[0].toLowerCase()}.`
      : "";

  return `${strength} ${trigger} ${fit}`.replace(/\s+/g, " ").trim();
}

export function generateSignalEmails(signal: Signal) {
  const firstNameFallback =
    signal.persona.toLowerCase().includes("sales")
      ? "there"
      : signal.persona.toLowerCase().includes("revops")
      ? "there"
      : "there";

  const email = `Hi ${firstNameFallback},

I noticed ${signal.company} is ${signal.signal.toLowerCase()}.

That usually creates pressure to make sure strong-fit pipeline is being prioritised and worked consistently, especially before teams add more process or headcount.

We’ve been helping teams identify where good opportunities are being missed and generate more targeted follow-up based on fit and timing.

Worth a quick look?

Stephen`;

  const followUpEmail = `Hi ${firstNameFallback},

Just following up on this.

When companies hit this stage, a lot of revenue leakage is not top-of-funnel. It is usually existing opportunity, prioritisation and timing.

Happy to share a quick example if useful.

Stephen`;

  return {
    email,
    followUpEmail,
  };
}
