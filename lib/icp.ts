import { Lead, Persona } from "@/lib/types";
import { getPersona } from "@/lib/scoring";

export type ICPProfile = {
  label: string;
  industry: string;
  employeeBand: string;
  persona: Persona;
  avgDealSize: number;
  winRate: number;
  salesCycleDays: number;
  notes: string[];
};

export function getEmployeeBand(employees: number): string {
  if (employees < 50) return "1-49";
  if (employees <= 200) return "50-200";
  if (employees <= 500) return "201-500";
  return "500+";
}

export function buildICP(_leads: Lead[]): ICPProfile {
  return {
    label: "Best Customers",
    industry: "B2B SaaS",
    employeeBand: "50-200",
    persona: "Sales Leader",
    avgDealSize: 18400,
    winRate: 24,
    salesCycleDays: 41,
    notes: [
      "Companies hiring sales teams convert at a higher rate",
      "Head of Sales and RevOps personas move faster",
      "50-200 employee companies are the strongest fit",
    ],
  };
}

export function calculateICPMatchScore(lead: Lead, icp: ICPProfile): number {
  let score = 0;

  const leadIndustry = lead.companyData.industry.toLowerCase();
  const icpIndustry = icp.industry.toLowerCase();

  if (leadIndustry.includes("saas") && icpIndustry.includes("saas")) {
    score += 35;
  } else if (
    leadIndustry.includes("software") ||
    leadIndustry.includes("marketing") ||
    leadIndustry.includes("operations")
  ) {
    score += 20;
  }

  const leadBand = getEmployeeBand(lead.companyData.employees);
  if (leadBand === icp.employeeBand) {
    score += 25;
  } else if (
    (leadBand === "201-500" && icp.employeeBand === "50-200") ||
    (leadBand === "50-200" && icp.employeeBand === "201-500")
  ) {
    score += 15;
  }

  const persona = getPersona(lead.title);
  if (persona === icp.persona) {
    score += 25;
  } else if (
    (persona === "RevOps" && icp.persona === "Sales Leader") ||
    (persona === "Sales Leader" && icp.persona === "RevOps")
  ) {
    score += 18;
  } else if (persona === "Founder" || persona === "Marketing Leader") {
    score += 10;
  }

  const hasRecentEngagement = lead.activities.some((a) => a.daysAgo <= 30);
  if (hasRecentEngagement) {
    score += 10;
  }

  const hasPainSignal = lead.activities.some((a) => {
    const note = a.note.toLowerCase();
    return (
      note.includes("stretched") ||
      note.includes("coverage") ||
      note.includes("efficiency") ||
      note.includes("pipeline") ||
      note.includes("challenge") ||
      note.includes("problem")
    );
  });

  if (hasPainSignal) {
    score += 5;
  }

  return Math.min(score, 100);
}

export function getICPMatchReasons(lead: Lead, icp: ICPProfile): string[] {
  const reasons: string[] = [];
  const persona = getPersona(lead.title);
  const band = getEmployeeBand(lead.companyData.employees);

  if (lead.companyData.industry.toLowerCase().includes("saas")) {
    reasons.push("Matches top-performing industry");
  }

  if (band === icp.employeeBand) {
    reasons.push("Matches ideal company size");
  }

  if (persona === icp.persona) {
    reasons.push("Matches highest-converting persona");
  } else if (persona === "RevOps" || persona === "Sales Leader") {
    reasons.push("Close to core buyer persona");
  }

  if (lead.companyData.signal.toLowerCase().includes("hiring")) {
    reasons.push("Growth signal detected");
  }

  if (lead.activities.some((a) => a.daysAgo <= 30)) {
    reasons.push("Recent engagement signal");
  }

  return reasons;
}
