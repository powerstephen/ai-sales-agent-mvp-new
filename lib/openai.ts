import OpenAI from "openai";
import { getAngle, getICPFit, getLeadState, getPersona, getPriority } from "@/lib/scoring";
import { Lead, LeadAnalysis } from "@/lib/types";

function buildFallbackAnalysis(lead: Lead): LeadAnalysis {
  const icpFit = getICPFit(lead);
  const persona = getPersona(lead.title);
  const state = getLeadState(lead);
  const priority = getPriority(lead);
  const angle = getAngle(lead);

  const whyNow: string[] = [
    `Not contacted in ${lead.lastContactedDays} days`,
    `Company signal: ${lead.companyData.signal}`,
  ];

  const recentActivity = lead.activities
    .filter((activity) => activity.daysAgo <= 35)
    .map((activity) => `${activity.type.replace(/_/g, " ")} ${activity.daysAgo} days ago`);

  if (recentActivity.length > 0) {
    whyNow.push(`Recent engagement: ${recentActivity.join(", ")}`);
  }

  const firstName = lead.name.split(" ")[0];

  return {
    icpFit,
    persona,
    state,
    priority,
    reasoning: `${lead.name} is a ${lead.title} at ${lead.company}, which is a ${lead.companyData.industry} business with ${lead.companyData.employees} employees. The account is ${state.toLowerCase()}, the ICP fit is ${icpFit.toLowerCase()}, and there are recent or historical signs that the problem is still relevant. This makes it a sensible account to prioritise for a personalised re-engagement.`,
    whyNow,
    angle,
    suggestedAction: priority === "High" ? "Re-engage now" : priority === "Medium" ? "Assign to SDR" : "Push to nurture",
    email: `Hi ${firstName},

I noticed ${lead.company} is ${lead.companyData.signal.toLowerCase()}.

Given your role in ${persona === "RevOps" ? "revenue operations" : persona === "Sales Leader" ? "sales leadership" : persona === "Founder" ? "running the business" : "driving growth"}, I thought this might be relevant.

A lot of teams at this stage find that good-fit leads and warm opportunities sit in the CRM without the right next step, especially when the team is busy and coverage is inconsistent.

We’ve been working on a way to identify which dormant or under-worked accounts are worth re-engaging, then generate the right follow-up based on context, persona, and timing.

Worth a quick look?

Best,
Stephen`,
  };
}

export async function analyzeLead(lead: Lead): Promise<LeadAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackAnalysis(lead);
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are an expert B2B SaaS SDR and RevOps analyst.

Analyse this CRM lead and return strict JSON with:
{
  "icpFit": "High | Medium | Low",
  "persona": "Sales Leader | RevOps | Founder | Marketing Leader | Other",
  "state": "Dormant | Warm but Neglected | At Risk | Active",
  "priority": "High | Medium | Low",
  "reasoning": "string",
  "whyNow": ["string", "string"],
  "angle": "string",
  "suggestedAction": "Re-engage now | Push to nurture | Assign to SDR | Low priority",
  "email": "string"
}

Lead:
${JSON.stringify(lead, null, 2)}

Rules:
- Focus on dormant pipeline recovery and persona-aware messaging
- Be commercially sharp, concise, and specific
- Do not use hype language
- The email should feel like a strong SDR wrote it after real research
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return buildFallbackAnalysis(lead);
    }

    const parsed = JSON.parse(content) as LeadAnalysis;
    return parsed;
  } catch {
    return buildFallbackAnalysis(lead);
  }
}
