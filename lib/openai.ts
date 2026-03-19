import {
  getAngle,
  getICPFit,
  getLeadScore,
  getLeadState,
  getPersona,
  getPriority,
} from "@/lib/scoring";
import { buildICP, calculateICPMatchScore, getICPMatchReasons } from "@/lib/icp";
import { leads } from "@/lib/data";
import { Lead, LeadAnalysis } from "@/lib/types";

type LeadAnalysisWithFollowUp = LeadAnalysis & {
  followUpEmail: string;
  icpMatchScore: number;
  icpMatchReasons: string[];
};

function getRecentSignals(lead: Lead): string[] {
  const signals: string[] = [];

  const recentEmailOpen = lead.activities.find((a) => a.type === "email_open" && a.daysAgo <= 30);
  const recentEmailClick = lead.activities.find((a) => a.type === "email_click" && a.daysAgo <= 30);
  const recentWebinar = lead.activities.find((a) => a.type === "webinar" && a.daysAgo <= 45);
  const recentMeeting = lead.activities.find((a) => a.type === "meeting" && a.daysAgo <= 120);

  if (recentEmailOpen) {
    signals.push(`Opened a previous email ${recentEmailOpen.daysAgo} days ago`);
  }

  if (recentEmailClick) {
    signals.push(`Clicked through on prior content ${recentEmailClick.daysAgo} days ago`);
  }

  if (recentWebinar) {
    signals.push(`Attended a webinar ${recentWebinar.daysAgo} days ago`);
  }

  if (recentMeeting) {
    signals.push(`Had a prior meeting that suggests the account was qualified`);
  }

  return signals;
}

function getPainPoints(lead: Lead): string[] {
  const text = lead.activities.map((a) => a.note.toLowerCase()).join(" ");
  const painPoints: string[] = [];

  if (text.includes("stretched")) {
    painPoints.push("Team capacity looks stretched");
  }
  if (text.includes("coverage")) {
    painPoints.push("Pipeline coverage was explicitly mentioned");
  }
  if (text.includes("efficiency")) {
    painPoints.push("Commercial efficiency was a stated concern");
  }
  if (text.includes("problem") || text.includes("challenge")) {
    painPoints.push("A concrete challenge was already identified");
  }
  if (text.includes("timing")) {
    painPoints.push("Previous objection appears to have been timing rather than fit");
  }
  if (text.includes("interested")) {
    painPoints.push("There was prior interest, but momentum faded");
  }

  return painPoints;
}

function buildWhyNow(lead: Lead, icpMatchReasons: string[]): string[] {
  const whyNow: string[] = [];

  if (lead.lastContactedDays > 60) {
    whyNow.push(`No contact for ${lead.lastContactedDays} days despite remaining a plausible fit`);
  } else if (lead.lastContactedDays > 30) {
    whyNow.push(`Momentum has faded with no contact for ${lead.lastContactedDays} days`);
  }

  const signal = lead.companyData.signal;
  if (signal) {
    whyNow.push(`Company signal suggests a relevant trigger: ${signal}`);
  }

  const recentSignals = getRecentSignals(lead);
  if (recentSignals.length > 0) {
    whyNow.push(...recentSignals.slice(0, 2));
  }

  const painPoints = getPainPoints(lead);
  if (painPoints.length > 0) {
    whyNow.push(...painPoints.slice(0, 2));
  }

  if (icpMatchReasons.length > 0) {
    whyNow.push(icpMatchReasons[0]);
  }

  return whyNow.slice(0, 5);
}

function buildReasoning(lead: Lead, icpMatchScore: number, icpMatchReasons: string[]): string {
  const persona = getPersona(lead.title);
  const painPoints = getPainPoints(lead);
  const signal = lead.companyData.signal;
  const recentSignals = getRecentSignals(lead);

  const personaAngle =
    persona === "RevOps"
      ? "operational efficiency and pipeline discipline"
      : persona === "Sales Leader"
      ? "coverage, prioritisation and rep productivity"
      : persona === "Founder"
      ? "commercial leverage without adding headcount"
      : persona === "Marketing Leader"
      ? "better conversion from existing demand"
      : "commercial efficiency";

  const fitLine =
    icpMatchScore >= 80
      ? "This account is a strong fit for the current best-performing ICP."
      : icpMatchScore >= 60
      ? "This account is a reasonable fit for the current ICP and worth working."
      : "This account is a weaker fit, but still has some relevant signals.";

  const signalLine = signal
    ? `The company signal (${signal.toLowerCase()}) suggests that the timing may be better now than when the account was last worked.`
    : "";

  const engagementLine =
    recentSignals.length > 0
      ? `There are also recent engagement cues that suggest this is not a fully cold account.`
      : "";

  const painLine =
    painPoints.length > 0
      ? `Previous activity indicates the underlying issue was likely ${painPoints[0].toLowerCase()}, which makes the re-engagement angle more concrete.`
      : "";

  const icpLine =
    icpMatchReasons.length > 0
      ? `It aligns because ${icpMatchReasons[0].toLowerCase()}.`
      : "";

  return `${fitLine} This contact is likely to care about ${personaAngle}. ${signalLine} ${engagementLine} ${painLine} ${icpLine}`.replace(/\s+/g, " ").trim();
}

function buildEmail(lead: Lead): string {
  const firstName = lead.name.split(" ")[0];
  const persona = getPersona(lead.title);
  const signal = lead.companyData.signal;
  const painPoints = getPainPoints(lead);

  const roleContext =
    persona === "RevOps"
      ? "keeping pipeline coverage and follow-up quality consistent"
      : persona === "Sales Leader"
      ? "making sure good-fit pipeline is actually being worked"
      : persona === "Founder"
      ? "getting more value from the pipeline already in the CRM"
      : persona === "Marketing Leader"
      ? "making sure existing demand converts properly"
      : "working pipeline more effectively";

  const painLine =
    painPoints.length > 0
      ? `It looked like the issue before was ${painPoints[0].toLowerCase()}.`
      : `Usually at this stage, good-fit opportunities are sitting there but not being prioritised properly.`;

  return `Hi ${firstName},

I noticed ${lead.company} is ${signal.toLowerCase()}.

That usually makes ${roleContext} more important, especially when teams are busy and not every good-fit account gets worked properly.

${painLine}

We’ve been helping teams surface the strongest dormant opportunities in the CRM and generate the right follow-up based on fit, timing and previous activity.

Worth a quick look?

Stephen`;
}

function buildFollowUpEmail(lead: Lead): string {
  const firstName = lead.name.split(" ")[0];
  const persona = getPersona(lead.title);

  const angle =
    persona === "RevOps"
      ? "coverage and process consistency"
      : persona === "Sales Leader"
      ? "rep focus and pipeline efficiency"
      : persona === "Founder"
      ? "commercial leverage"
      : persona === "Marketing Leader"
      ? "conversion efficiency"
      : "pipeline recovery";

  return `Hi ${firstName},

Just circling back on this.

A lot of teams already have opportunities in the CRM that could move, but they get lost because nobody has time to analyse every account properly.

That is usually a ${angle} problem before it is a top-of-funnel problem.

Happy to share a quick example if useful.

Stephen`;
}

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

  const whyNow = buildWhyNow(lead, icpMatchReasons);
  const reasoning = buildReasoning(lead, icpMatchScore, icpMatchReasons);
  const email = buildEmail(lead);
  const followUpEmail = buildFollowUpEmail(lead);

  return {
    icpFit,
    persona,
    state,
    priority,
    score,
    reasoning,
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
