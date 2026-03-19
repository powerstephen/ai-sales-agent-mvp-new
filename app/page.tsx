"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { leads as demoLeads } from "@/lib/data";
import { buildICP, calculateICPMatchScore } from "@/lib/icp";
import { getLeadScore } from "@/lib/scoring";
import { normalizeDeals, buildICPFromDeals } from "@/lib/deals";

export default function HomePage() {
  const [leads, setLeads] = useState(demoLeads);
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    const storedLeads = localStorage.getItem("uploadedLeads");
    const storedDeals = localStorage.getItem("uploadedDeals");

    if (storedLeads) setLeads(JSON.parse(storedLeads));
    if (storedDeals) setDeals(JSON.parse(storedDeals));
  }, []);

  const icp = useMemo(() => {
    if (deals.length > 0) {
      const built = buildICPFromDeals(normalizeDeals(deals));
      if (built) return built;
    }
    return buildICP(leads);
  }, [leads, deals]);

  const enriched = leads
    .map((l) => ({
      ...l,
      score: getLeadScore(l),
      icpMatch: calculateICPMatchScore(l, icp),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <main className="p-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <Link href="/connect" className="bg-black text-white px-4 py-2 rounded">
          Import data
        </Link>
      </div>

      <div className="mb-6 p-4 border rounded">
        <p>ICP:</p>
        <p>{icp.industry} | {icp.employeeBand} | {icp.persona}</p>
        <p>Avg deal: €{icp.avgDealSize}</p>
        <p>Win rate: {icp.winRate}%</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Score</th>
            <th>ICP Match</th>
          </tr>
        </thead>
        <tbody>
          {enriched.map((l) => (
            <tr key={l.id}>
              <td>
                <Link href={`/lead/${l.id}`}>{l.name}</Link>
              </td>
              <td>{l.company}</td>
              <td>{l.score}</td>
              <td>{l.icpMatch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
