import {
  getAngle,
  getICPFit,
  getLeadScore,
  getLeadState,
  getPersona,
  getPriority,
  getScoreBreakdown,
} from "@/lib/scoring";
import { buildICP, calculateICPMatchScore, getICPMatchReasons } from "@/lib/icp";
import { leads } from "@/lib/data";
import { Lead, LeadAnalysis } from "@/lib/types";

type LeadAnalysisWithFollowUp = LeadAnalysis & {
  followUpEmail: string;
  icpMatchScore: number;
  icpMatchReasons: string[];
};

export async function analyzeLead(lead: Lead): Promise<LeadAnalysisWithFollowUp> {
  const icpFit = getICPFit(lead);
  const persona = getPersona(lead.title);
  const state = getLeadState(lead);
  const priority = getPriority(lead);
  const angle = getAngle(lead);
  const score = getLeadScore(lead);

  const icp = buildICP(leads);
  const icpMatchScore = calculateICPMatchScore(lead, icp);
  const icpMatchReasons = getICPMatchReasons(lead, icp);

  const whyNow = [
    ...getScoreBreakdown(lead),
    `Not contacted in ${lead.lastContactedDays} days`,
    `Company signal: ${lead.companyData.signal}`,
  ];

  const firstName = lead.name.split(" ")[0];

  const email = `Hi ${firstName},

I saw ${lead.company} is ${lead.companyData.signal.toLowerCase()}.

Usually at this stage, teams have strong-fit opportunities sitting in the CRM that just haven’t been worked properly.

From your side, it looks more like a coverage or timing issue than a demand problem.

Worth a quick look?

Stephen`;

  const followUpEmail = `Hi ${firstName},

Just looping back on this.

A lot of teams we speak to already have pipeline sitting there. It is just not being prioritised or worked consistently.

Happy to share a quick example if useful.

Stephen`;

  return {
    icpFit,
    persona,
    state,
    priority,
    score,
    reasoning: `${lead.name} looks like a strong opportunity based on fit, seniority, growth signals and evidence that pipeline may be underutilised. This account also aligns well with the current best-performing ICP based on revenue patterns.`,
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
    icpMatchScore,
    icpMatchReasons,
  };
}
