import { Persona } from "@/lib/types";

export type Deal = {
  deal_id: string;
  company: string;
  buyer_title: string;
  industry: string;
  employees: number;
  amount_eur: number;
  outcome: "won" | "lost";
  sales_cycle_days?: number;
};

function mapBuyerTitleToPersona(title: string): Persona {
  const lower = title.toLowerCase();

  if (lower.includes("revops") || lower.includes("revenue operations")) {
    return "RevOps";
  }

  if (lower.includes("sales") || lower.includes("account executive")) {
    return "Sales Leader";
  }

  if (lower.includes("founder") || lower.includes("ceo") || lower.includes("co-founder")) {
    return "Founder";
  }

  if (lower.includes("marketing") || lower.includes("growth")) {
    return "Marketing Leader";
  }

  return "Other";
}

export function normalizeDeals(rows: any[]): Deal[] {
  return rows.map((row, i) => ({
    deal_id: row.deal_id || `deal_${i}`,
    company: row.company || "Unknown",
    buyer_title: row.buyer_title || "Unknown",
    industry: row.industry || "Unknown",
    employees: Number(row.employees || 0),
    amount_eur: Number(row.amount_eur || 0),
    outcome: row.outcome === "won" ? "won" : "lost",
    sales_cycle_days: Number(row.sales_cycle_days || 0),
  }));
}

function band(size: number) {
  if (size < 50) return "1-49";
  if (size <= 200) return "50-200";
  if (size <= 500) return "201-500";
  return "500+";
}

export function buildICPFromDeals(deals: Deal[]) {
  const wonDeals = deals.filter((d) => d.outcome === "won");

  if (wonDeals.length === 0) return null;

  const industryMap: Record<string, number> = {};
  const sizeMap: Record<string, number> = {};
  const personaMap: Record<Persona, number> = {
    "Sales Leader": 0,
    RevOps: 0,
    Founder: 0,
    "Marketing Leader": 0,
    Other: 0,
  };

  let totalValue = 0;
  let totalSalesCycleDays = 0;
  let salesCycleCount = 0;

  wonDeals.forEach((d) => {
    industryMap[d.industry] = (industryMap[d.industry] || 0) + 1;

    const size = band(d.employees);
    sizeMap[size] = (sizeMap[size] || 0) + 1;

    const persona = mapBuyerTitleToPersona(d.buyer_title);
    personaMap[persona] = (personaMap[persona] || 0) + 1;

    totalValue += d.amount_eur;

    if (d.sales_cycle_days && d.sales_cycle_days > 0) {
      totalSalesCycleDays += d.sales_cycle_days;
      salesCycleCount += 1;
    }
  });

  const topString = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0];

  const topPersona = (obj: Record<Persona, number>): Persona => {
    const entry = Object.entries(obj).sort((a, b) => b[1] - a[1])[0];
    return (entry?.[0] as Persona) || "Sales Leader";
  };

  const industry = topString(industryMap) || "B2B SaaS";
  const employeeBand = topString(sizeMap) || "50-200";
  const persona = topPersona(personaMap);

  return {
    industry,
    employeeBand,
    persona,
    avgDealSize: Math.round(totalValue / wonDeals.length),
    winRate: Math.round((wonDeals.length / deals.length) * 100),
    salesCycleDays:
      salesCycleCount > 0
        ? Math.round(totalSalesCycleDays / salesCycleCount)
        : 45,
    label: `${industry} | ${employeeBand} | ${persona}`,
    notes: ["Derived from won deals"],
  };
}
