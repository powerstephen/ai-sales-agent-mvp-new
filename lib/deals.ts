export type Deal = {
  deal_id: string;
  company: string;
  buyer_title: string;
  industry: string;
  employees: number;
  amount_eur: number;
  outcome: "won" | "lost";
};

export function normalizeDeals(rows: any[]): Deal[] {
  return rows.map((row, i) => ({
    deal_id: row.deal_id || `deal_${i}`,
    company: row.company || "Unknown",
    buyer_title: row.buyer_title || "Unknown",
    industry: row.industry || "Unknown",
    employees: Number(row.employees || 0),
    amount_eur: Number(row.amount_eur || 0),
    outcome: row.outcome === "won" ? "won" : "lost",
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
  const personaMap: Record<string, number> = {};
  let totalValue = 0;

  wonDeals.forEach((d) => {
    industryMap[d.industry] = (industryMap[d.industry] || 0) + 1;

    const size = band(d.employees);
    sizeMap[size] = (sizeMap[size] || 0) + 1;

    personaMap[d.buyer_title] = (personaMap[d.buyer_title] || 0) + 1;

    totalValue += d.amount_eur;
  });

  const top = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    industry: top(industryMap),
    employeeBand: top(sizeMap),
    persona: top(personaMap),
    avgDealSize: Math.round(totalValue / wonDeals.length),
    winRate: Math.round((wonDeals.length / deals.length) * 100),
    label: `${top(industryMap)} | ${top(sizeMap)} | ${top(personaMap)}`,
    notes: ["Derived from won deals"],
  };
}
