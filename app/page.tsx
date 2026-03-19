"use client";

import { useState } from "react";
import Link from "next/link";
import { leads } from "@/lib/data";
import { buildICP, calculateICPMatchScore } from "@/lib/icp";
import {
  getICPFit,
  getLeadScore,
  getLeadState,
  getPersona,
  getPriority,
} from "@/lib/scoring";
import { signals, scoreSignal, getSignalReasons } from "@/lib/signals";

function getScoreStyles(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function HomePage() {
  const [mode, setMode] = useState<"recover" | "generate">("recover");

  const icp = buildICP(leads);

  const enrichedLeads = leads
    .map((lead) => ({
      ...lead,
      icpFit: getICPFit(lead),
      persona: getPersona(lead.title),
      state: getLeadState(lead),
      priority: getPriority(lead),
      score: getLeadScore(lead),
      icpMatchScore: calculateICPMatchScore(lead, icp),
    }))
    .sort((a, b) => b.score - a.score);

  const enrichedSignals = signals
    .map((signal) => ({
      ...signal,
      score: scoreSignal(signal),
      reasons: getSignalReasons(signal),
    }))
    .sort((a, b) => b.score - a.score);

  const highValueDormant = enrichedLeads.filter(
    (lead) => lead.score >= 80 && lead.lastContactedDays > 60
  );

  const estimatedPipeline = highValueDormant.length * 20000;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">AI Sales Agent</p>
          <h1 className="text-3xl font-semibold mt-2">
            Revenue Intelligence Dashboard
          </h1>
        </div>

        {/* 🔥 MODE TOGGLE */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setMode("recover")}
            className={`px-4 py-2 rounded-lg text-sm ${
              mode === "recover"
                ? "bg-black text-white"
                : "bg-white border"
            }`}
          >
            Recover Pipeline
          </button>

          <button
            onClick={() => setMode("generate")}
            className={`px-4 py-2 rounded-lg text-sm ${
              mode === "generate"
                ? "bg-black text-white"
                : "bg-white border"
            }`}
          >
            Generate Pipeline
          </button>
        </div>

        {/* ========================= */}
        {/* RECOVER PIPELINE MODE */}
        {/* ========================= */}
        {mode === "recover" && (
          <>
            {/* VALUE BOX */}
            <div className="mb-6 bg-black text-white p-6 rounded-2xl">
              <p className="text-sm text-gray-300">Missed opportunity</p>
              <p className="text-2xl font-semibold mt-2">
                {highValueDormant.length} high-value leads not contacted in 60+ days
              </p>
              <p className="text-sm mt-2 text-gray-300">
                Estimated recoverable pipeline: €{estimatedPipeline.toLocaleString()}
              </p>
            </div>

            {/* LEADS */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-lg font-semibold mb-4">
                Existing pipeline
              </h2>

              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th>Lead</th>
                    <th>Company</th>
                    <th>Score</th>
                    <th>ICP</th>
                  </tr>
                </thead>

                <tbody>
                  {enrichedLeads.map((lead) => (
                    <tr key={lead.id} className="border-t">
                      <td className="py-3">
                        <Link href={`/lead/${lead.id}`}>
                          {lead.name}
                        </Link>
                      </td>
                      <td>{lead.company}</td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded border ${getScoreStyles(
                            lead.score
                          )}`}
                        >
                          {lead.score}
                        </span>
                      </td>
                      <td>{lead.icpMatchScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ========================= */}
        {/* GENERATE PIPELINE MODE */}
        {/* ========================= */}
        {mode === "generate" && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              New opportunities detected
            </h2>

            <div className="space-y-4">
              {enrichedSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex justify-between items-center border p-4 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{signal.company}</p>
                    <p className="text-sm text-gray-500">
                      {signal.signal}
                    </p>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      {signal.reasons.map((r, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getScoreStyles(
                        signal.score
                      )}`}
                    >
                      {signal.score}
                    </span>

                    <div className="mt-2">
                      <Link
                        href={`/signals/${signal.id}`}
                        className="text-sm underline"
                      >
                        Generate outreach
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
