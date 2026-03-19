import { LeadRecord } from "./types";

export type ICPProfile = {
  industry: string;
  companySize: string;
  persona: string;
  avgDealSize: number;
  winRate: number;
};

export function buildICP(leads: LeadRecord[]): ICPProfile {
  // fake logic for now (replace later with real deal data)

  return {
    industry: "B2B SaaS",
    companySize: "50-200",
    persona: "Head of Sales",
    avgDealSize: 18400,
    winRate: 0.24,
  };
}
