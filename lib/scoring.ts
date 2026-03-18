import { Lead, ICPFit, LeadState, Persona } from "@/lib/types";

export function getPersona(title: string): Persona {
  const lower = title.toLowerCase();

  if (lower.includes("revops") || lower.includes("revenue operations")) return "RevOps";
  if (lower.includes("sales") || lower.includes("account executive")) return "Sales Leader";
  if (lower.includes("founder") || lower.includes("ceo") || lower.includes("co-founder")) return "Founder";
  if (lower.includes("marketing") || lower.includes("growth")) return "Marketing Leader";

  return "Other";
}

export function getICPFit(lead: Lead): ICPFit {
  const { industry, employees } = lead.companyData;
  const lowerIndustry = industry.toLowerCase();

  const isSaaS = lowerIndustry.includes("saas") || lowerIndustry.includes("software");
  const rightSize = employees >= 50 && employees <= 500;

  if (isSaaS && rightSize) return "High";
  if (isSaaS || rightSize) return "Medium";
  return "Low";
}

export function getLeadState(lead: Lead): LeadState {
  const recentEngagement = lead.activities.some((a) => a.daysAgo <= 30);
  const engagedButOldTouch = lead.lastContactedDays > 45 && recentEngagement;
  const dormant = lead.lastContactedDays > 60;

  if (engagedButOldTouch) return "Warm but Neglected";
  if (dormant) return "Dormant";
  if (lead.lastContactedDays > 30) return "At Risk";
  return "Active";
}

export function getPriority(lead: Lead): "High" | "Medium" | "Low" {
  const icp = getICPFit(lead);
  const state = getLeadState(lead);

  if (icp === "High" && (state === "Dormant" || state === "Warm but Neglected")) return "High";
  if (icp === "High" || state === "At Risk") return "Medium";
  return "Low";
}

export function getAngle(lead: Lead): string {
  const persona = getPersona(lead.title);
  const signal = lead.companyData.signal.toLowerCase();

  if (persona === "RevOps") return "Efficiency and pipeline coverage";
  if (persona === "Sales Leader") return "Pipeline generation and rep productivity";
  if (persona === "Founder") return "Revenue leverage and commercial efficiency";
  if (persona === "Marketing Leader") return "Lead quality and conversion efficiency";

  if (signal.includes("hiring")) return "Scaling demand generation";
  if (signal.includes("funding")) return "Growth acceleration";

  return "Relevant re-engagement based on timing and fit";
}
