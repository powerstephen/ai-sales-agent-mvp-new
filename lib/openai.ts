import {
  getAngle,
  getICPFit,
  getLeadScore,
  getLeadState,
  getPersona,
  getPriority,
  getScoreBreakdown,
} from "@/lib/scoring";
import { Lead, LeadAnalysis } from "@/lib/types";

export async function analyzeLead(lead: Lead): Promise<LeadAnalysis & { followUpEmail: string }> {
  const icpFit = getICPFit(lead);
  const persona = getPersona(lead.title);
  const state = getLeadState(lead);
  const priority = getPriority(lead);
  const angle = getAngle(lead);
  const score = getLeadScore(lead);

  const whyNow = [
    ...getScoreBreakdown(lead),
    `Not contacted in ${lead.lastContactedDays} days`,
    `Company signal: ${lead.companyData.signal}`,
  ];

  const firstName = lead.name.split(" ")[0];

  const email = `Hi ${firstName},

I saw ${lead.company} is ${lead.companyData.signal.toLowerCase()}.

Usually at this stage, teams have strong-fit opportunities sitting in the CRM that just haven’t been worked properly.

From your side, it looks more like a coverage / timing issue than a demand problem.

Worth a quick look?

Stephen`;

  const followUpEmail = `Hi ${firstName},

Just looping back on this.

A lot of teams we speak to already have pipeline sitting there — it’s just not being prioritised or worked consistently.

Happy to share a quick example if useful.

Stephen`;

  return {
    icpFit,
    persona,
    state,
    priority,
    score,
    reasoning: `${lead.name} looks like a strong opportunity based on fit, seniority, and clear signals that pipeline may be underutilised.`,
    whyNow,
    angle,
    suggestedAction:
      priority === "High"
        ? "Re-engage now"
        : priority === "Medium"
        ? "Assign to SDR"
        : "Push to nurture",
    email,
    followUpEmail,
  };
}
