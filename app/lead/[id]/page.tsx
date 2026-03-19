"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { leads as demoLeads } from "@/lib/data";
import { analyzeLead } from "@/lib/openai";
import { buildICP } from "@/lib/icp";
import { getSignalCards } from "@/lib/scoring";
import { Lead } from "@/lib/types";

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-500";
  return "text-gray-400";
}

function getPriorityLabel(score: number) {
  if (score >= 80) return "High Priority";
  if (score >= 60) return "Medium Priority";
  return "Low Priority";
}

export default function LeadPage() {
  const params = useParams<{ id: string }>();
  const [activeLeads, setActiveLeads] = useState<Lead[]>(demoLeads);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const uploaded = localStorage.getItem("uploadedLeads");
    if (uploaded) {
      try {
        const parsed = JSON.parse(uploaded) as Lead[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveLeads(parsed);
        }
      } catch {
        setActiveLeads(demoLeads);
      }
    }
    setLoaded(true);
  }, []);

  const lead = useMemo(
    () => activeLeads.find((item) => item.id === params.id),
    [activeLeads, params.id]
  );

  const icp = useMemo(() => buildICP(activeLeads), [activeLeads]);

  const [analysis, setAnalysis] = useState<Awaited<ReturnType<typeof analyzeLead>> | null>(null);

  useEffect(() => {
    if (lead) {
      analyzeLead(lead).then(setAnalysis);
    }
  }, [lead]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">Loading lead...</p>
        </div>
      </main>
    );
  }

  if (!lead) {
    notFound();
  }

  if (!analysis) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">Analyzing lead...</p>
        </div>
      </main>
    );
  }

  const signals = getSignalCards(lead);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>

          <h1 className="mt-4 text-3xl font-semibold text-gray-900">
            {lead.name}
          </h1>
          <p className="text-gray-600">
            {lead.title} at {lead.company}
          </p>
        </div>

        <div className="mb-8 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[320px_1fr] md:items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Lead Score</p>
              <div className="mt-3 flex items-end gap-4">
                <div className={`text-8xl font-bold leading-none ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="pb-3 text-2xl font-medium text-gray-700">
                  {getPriorityLabel(analysis.score)}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">ICP Match Score</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{analysis.icpMatchScore}</p>
                <p className="mt-2 text-sm text-gray-600">
                  Compared against your best-performing segment: {icp.industry}, {icp.employeeBand} employees, {icp.persona}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {signals.map((signal, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border px-4 py-4 text-sm font-medium ${
                    signal.active
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  {signal.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Why this lead now</h2>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm leading-6 text-gray-800">{analysis.reasoning}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Priority drivers</p>
              <ul className="mt-3 space-y-3">
                {analysis.whyNow.map((item, index) => (
                  <li
                    key={index}
                    className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">ICP alignment</p>
              <ul className="mt-3 space-y-3">
                {analysis.icpMatchReasons.map((item, index) => (
                  <li
                    key={index}
                    className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Activity</h2>

            <div className="mt-4 space-y-3">
              {lead.activities.map((activity, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-gray-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium capitalize text-gray-900">
                      {activity.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-500">{activity.daysAgo}d ago</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {activity.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Outreach sequence</h2>

            <div className="flex gap-2">
              {["3 days", "5 days", "7 days"].map((delay) => (
                <button
                  key={delay}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  {delay}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Email 1 · Send now
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-4 text-xs text-gray-500">
                  From: Stephen
                  <br />
                  To: {lead.email}
                </div>

                <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
                  {analysis.email}
                </pre>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                Email 2 · Follow-up
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-4 text-xs text-gray-500">
                  From: Stephen
                  <br />
                  To: {lead.email}
                </div>

                <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
                  {analysis.followUpEmail}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
              Launch sequence
            </button>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">
              Edit emails
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
