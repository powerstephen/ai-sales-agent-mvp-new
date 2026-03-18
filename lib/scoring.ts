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

  const isSaaS =
    lowerIndustry.includes("saas") ||
    lowerIndustry.includes("software") ||
    lowerIndustry.includes("marketing") ||
    lowerIndustry.includes("operations");

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

export function getLeadScore(lead: Lead): number {
  let score = 0;

  const icp = getICPFit(lead);
  if (icp === "High") score += 30;
  if (icp === "Medium") score += 15;

  const persona = getPersona(lead.title);
  if (persona === "RevOps" || persona === "Sales Leader") score += 15;
  else if (persona === "Founder" || persona === "Marketing Leader") score += 10;

  const recentEngagement = lead.activities.some((a) => a.daysAgo <= 30);
  if (recentEngagement) score += 20;

  if (lead.lastContactedDays > 60) score += 15;
  else if (lead.lastContactedDays > 30) score += 10;

  const signal = lead.companyData.signal.toLowerCase();
  if (
    signal.includes("hiring") ||
    signal.includes("funding") ||
    signal.includes("expanding") ||
    signal.includes("launch")
  ) {
    score += 10;
  }

  const hasPain = lead.activities.some((a) => {
    const note = a.note.toLowerCase();
    return (
      note.includes("stretched") ||
      note.includes("challenge") ||
      note.includes("problem") ||
      note.includes("coverage") ||
      note.includes("efficiency") ||
      note.includes("timing") ||
      note.includes("pipeline")
    );
  });

  if (hasPain) score += 10;

  return Math.min(score, 100);
}

export function getScoreBreakdown(lead: Lead): string[] {
  const reasons: string[] = [];

  if (getICPFit(lead) === "High") {
    reasons.push("High ICP Match");
  }

  const persona = getPersona(lead.title);
  if (persona === "Sales Leader" || persona === "RevOps" || persona === "Founder") {
    reasons.push("Senior Persona");
  }

  if (lead.activities.some((a) => a.daysAgo <= 30)) {
    reasons.push("Recent Engagement");
  }

  if (lead.activities.some((a) => a.type === "webinar")) {
    reasons.push("Webinar Attended");
  }

  if (lead.lastContactedDays > 60) {
    reasons.push("Dormant Opportunity");
  }

  if (lead.companyData.signal.toLowerCase().includes("hiring")) {
    reasons.push("Team Growth");
  }

  const hasPain = lead.activities.some((a) => {
    const note = a.note.toLowerCase();
    return (
      note.includes("stretched") ||
      note.includes("challenge") ||
      note.includes("problem") ||
      note.includes("coverage") ||
      note.includes("efficiency") ||
      note.includes("pipeline")
    );
  });

  if (hasPain) {
    reasons.push("Pain Point Identified");
  }

  if (lead.activities.some((a) => a.note.toLowerCase().includes("interested"))) {
    reasons.push("Previous Interest");
  }

  return reasons;
}

export function getSignalCards(lead: Lead) {
  const noteText = lead.activities.map((a) => a.note.toLowerCase()).join(" ");

  return [
    {
      label: "ICP Match",
      active: getICPFit(lead) === "High",
    },
    {
      label: "Senior Persona",
      active: ["RevOps", "Sales Leader", "Founder", "Marketing Leader"].includes(
        getPersona(lead.title)
      ),
    },
    {
      label: "Recent Engagement",
      active: lead.activities.some((a) => a.daysAgo <= 30),
    },
    {
      label: "Webinar Attended",
      active: lead.activities.some((a) => a.type === "webinar"),
    },
    {
      label: "Dormant Opportunity",
      active: lead.lastContactedDays > 60,
    },
    {
      label: "Team Growth",
      active: lead.companyData.signal.toLowerCase().includes("hiring"),
    },
    {
      label: "Business Growth",
      active:
        lead.companyData.signal.toLowerCase().includes("funding") ||
        lead.companyData.signal.toLowerCase().includes("expanding") ||
        lead.companyData.signal.toLowerCase().includes("launch"),
    },
    {
      label: "Pain Point Identified",
      active:
        noteText.includes("stretched") ||
        noteText.includes("challenge") ||
        noteText.includes("problem") ||
        noteText.includes("coverage") ||
        noteText.includes("efficiency") ||
        noteText.includes("pipeline"),
    },
  ];
}
