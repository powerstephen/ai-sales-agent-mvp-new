import { getAngle, getICPFit, getLeadScore, getLeadState, getPersona, getPriority, getScoreBreakdown } from "@/lib/scoring";
import { Lead, LeadAnalysis } from "@/lib/types";

export async function analyzeLead(lead: Lead): Promise<LeadAnalysis> {
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

  return {
    icpFit,
    persona,
    state,
    priority,
    score,
    reasoning: `${lead.name} scores strongly because the account is a solid fit, the contact is senior enough to care about commercial outcomes, there is evidence of either growth or process change at the company, and there are signs the opportunity may have been under-worked rather than truly lost.`,
    whyNow,
    angle,
    suggestedAction:
      priority === "High"
        ? "Re-engage now"
        : priority === "Medium"
        ? "Assign to SDR"
        : "Push to nurture",
    email: `Hi ${firstName},

I noticed ${lead.company} is ${lead.companyData.signal.toLowerCase()}.

Given your role in ${
      persona === "RevOps"
        ? "revenue operations"
        : persona === "Sales Leader"
        ? "sales leadership"
        : persona === "Founder"
        ? "running the business"
        : persona === "marketing and growth"
    }, I thought this might be worth a quick note.

A lot of teams at this stage have good-fit leads and warm opportunities sitting in the CRM without a clear next step, especially when the team is stretched or priorities have shifted.

From what I can see, this looks more like a coverage and timing issue than a lack of demand.

We’ve been working on a way to surface the best dormant opportunities and generate the right re-engagement based on context, persona and previous signals.

Worth a quick look?

Best,
Stephen`,
  };
}
