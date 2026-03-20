"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { leads as demoLeads } from "@/lib/data";
import { signals } from "@/lib/signals";
import { getLeadScore } from "@/lib/scoring";
import { estimatePipelineImpact } from "@/lib/pipeline";
import { scoreSignal } from "@/lib/signals";
import { Lead } from "@/lib/types";

type Opportunity = {
  id: string;
  type: "lead" | "signal";
  name: string;
  company: string;
  score: number;
  pipelineValue: number;
  reason: string;
};

function formatCurrency(value: number) {
  return `€${value.toLocaleString()}`;
}

export default function OpportunitiesPage() {
  const [activeLeads, setActiveLeads] = useState<Lead[]>(demoLeads);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const uploaded = localStorage.getItem("uploadedLeads");

    if (uploaded) {
      try {
        const parsed = JSON.parse(uploaded);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveLeads(parsed);
        }
      } catch {
        setActiveLeads(demoLeads);
      }
    }

    setLoaded(true);
  }, []);

  const opportunities: Opportunity[] = useMemo(() => {
    const leadOpps: Opportunity[] = activeLeads.map((lead) => {
      const score = getLeadScore(lead);
      const pipeline = estimatePipelineImpact(score);

      return {
        id: lead.id,
        type: "lead",
        name: lead.name,
        company: lead.company,
        score,
        pipelineValue: pipeline.pipelineValue,
        reason: "Existing pipeline opportunity",
      };
    });

    const signalOpps: Opportunity[] = signals.map((signal) => {
      const score = scoreSignal(signal);
      const pipeline = estimatePipelineImpact(score);

      return {
        id: signal.id,
        type: "signal",
        name: signal.company,
        company: signal.company,
        score,
        pipelineValue: pipeline.pipelineValue,
        reason: "New pipeline opportunity",
      };
    });

    return [...leadOpps, ...signalOpps].sort(
      (a, b) => b.pipelineValue - a.pipelineValue
    );
  }, [activeLeads]);

  if (!loaded) {
    return <div className="p-10">Loading...</div>;
  }

  const totalPipeline = opportunities.reduce(
    (sum, o) => sum + o.pipelineValue,
    0
  );

  const leadPipeline = opportunities
    .filter((o) => o.type === "lead")
    .reduce((sum, o) => sum + o.pipelineValue, 0);

  const signalPipeline = opportunities
    .filter((o) => o.type === "signal")
    .reduce((sum, o) => sum + o.pipelineValue, 0);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-gray-500">
          ← Back
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">
          Revenue Opportunities
        </h1>

        {/* SUMMARY */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl border">
            <p className="text-sm text-gray-500">Total Pipeline</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(totalPipeline)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <p className="text-sm text-gray-500">Recoverable Pipeline</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(leadPipeline)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <p className="text-sm text-gray-500">New Pipeline</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(signalPipeline)}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-8 bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Company</th>
                <th className="p-4">Score</th>
                <th className="p-4">Pipeline Value</th>
                <th className="p-4"></th>
              </tr>
            </thead>

            <tbody>
              {opportunities.map((op) => (
                <tr key={op.id} className="border-t">
                  <td className="p-4 capitalize">{op.type}</td>
                  <td className="p-4">{op.company}</td>
                  <td className="p-4">{op.score}</td>
                  <td className="p-4 font-medium">
                    {formatCurrency(op.pipelineValue)}
                  </td>
                  <td className="p-4">
                    <Link
                      href={
                        op.type === "lead"
                          ? `/lead/${op.id}`
                          : `/signals/${op.id}`
                      }
                      className="text-blue-600"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
