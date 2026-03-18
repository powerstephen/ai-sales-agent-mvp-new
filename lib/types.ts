export type ActivityType =
  | "email_open"
  | "email_click"
  | "call"
  | "meeting"
  | "webinar"
  | "note";

export type Activity = {
  type: ActivityType;
  note: string;
  daysAgo: number;
};

export type CompanyData = {
  industry: string;
  employees: number;
  location: string;
  signal: string;
  domain: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  lifecycleStage: "lead" | "opportunity" | "customer" | "stalled";
  lastContactedDays: number;
  companyData: CompanyData;
  activities: Activity[];
};

export type ICPFit = "High" | "Medium" | "Low";
export type Persona =
  | "Sales Leader"
  | "RevOps"
  | "Founder"
  | "Marketing Leader"
  | "Other";
export type LeadState =
  | "Dormant"
  | "Warm but Neglected"
  | "At Risk"
  | "Active";

export type LeadAnalysis = {
  icpFit: ICPFit;
  persona: Persona;
  state: LeadState;
  priority: "High" | "Medium" | "Low";
  score: number;
  reasoning: string;
  whyNow: string[];
  angle: string;
  suggestedAction:
    | "Re-engage now"
    | "Push to nurture"
    | "Assign to SDR"
    | "Low priority";
  email: string;
};
