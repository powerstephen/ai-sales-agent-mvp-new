import Link from "next/link";
import { leads } from "@/lib/data";
import { buildICP, calculateICPMatchScore } from "@/lib/icp";
import { getICPFit, getLeadScore, getLeadState, getPersona, getPriority } from "@/lib/scoring";
import { signals, scoreSignal, getSignalReasons } from "@/lib/signals";

function getScoreStyles(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function HomePage() {
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

  const pipelineMatches = enrichedLeads.filter((lead) => lead.icpMatchScore >= 70).length;
  const pipelineQuality = Math.round((pipelineMatches / enrichedLeads.length) * 100);

  const highValueDormant = enrichedLeads.filter(
    (lead) => lead.score >= 80 && lead.lastContactedDays > 60
  );
  const estimatedPipeline = highValueDormant.length * 20000;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">AI Sales Agent MVP</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            Revenue Intelligence Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600">
            Recover missed pipeline, learn from revenue patterns, and surface new high-fit opportunities based on external triggers.
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-black p-6 text-white">
          <p className="text-sm text-gray-300">Missed opportunity</p>
          <p className="mt-2 text-2xl font-semibold">
            {highValueDormant.length} high-value leads not contacted in 60+ days
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Estimated recoverable pipeline: €{estimatedPipeline.toLocaleString()}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Estimate your missed pipeline
            </Link>
            <Link
              href="/lead/lead_001"
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-white"
            >
              View sample lead
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Your best customers</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">{icp.label}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Based on revenue patterns, your strongest segment appears to be {icp.industry} companies with {icp.employeeBand} employees, typically buying through {icp.persona} stakeholders.
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 px-5 py-4">
              <p className="text-sm text-amber-800">
                Only <span className="font-semibold">{pipelineQuality}%</span> of your current pipeline matches your best-performing ICP
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Industry</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{icp.industry}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company size</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{icp.employeeBand}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Primary persona</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{icp.persona}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Avg deal size</p>
              <p className="mt-2 text-sm font-medium text-gray-900">€{icp.avgDealSize.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Win rate</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{icp.winRate}%</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {icp.notes.map((note, index) => (
              <div key={index} className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900">
                {note}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">New opportunities detected</h2>
              <p className="mt-1 text-sm text-gray-600">
                External signals that appear to match your ICP and may deserve outbound attention.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {enrichedSignals.map((signal) => (
              <div
                key={signal.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-base font-semibold text-gray-900">{signal.company}</p>
                    <span
                      className={`inline-flex min-w-[52px] justify-center rounded-full border px-3 py-1 text-xs font-semibold ${getScoreStyles(
                        signal.score
                      )}`}
                    >
                      {signal.score}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {signal.persona} · {signal.industry} · {signal.employees} employees · {signal.location}
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900">{signal.signal}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {signal.reasons.map((reason, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/signals/${signal.id}`}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                  >
                    Generate outreach
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Existing pipeline</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-4 font-medium">Lead</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">ICP Match</th>
                  <th className="px-6 py-4 font-medium">Persona</th>
                  <th className="px-6 py-4 font-medium">State</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrichedLeads.map((lead) => (
                  <tr key={lead.id} className="text-sm text-gray-700">
                    <td className="px-6 py-4">
                      <Link href={`/lead/${lead.id}`} className="font-medium text-gray-900 hover:text-gray-600">
                        {lead.name}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">{lead.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{lead.company}</p>
                      <p className="mt-1 text-xs text-gray-500">{lead.companyData.signal}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex min-w-[52px] justify-center rounded-full border px-3 py-1 text-xs font-semibold ${getScoreStyles(
                          lead.score
                        )}`}
                      >
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex min-w-[52px] justify-center rounded-full border px-3 py-1 text-xs font-semibold ${getScoreStyles(
                          lead.icpMatchScore
                        )}`}
                      >
                        {lead.icpMatchScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">{lead.persona}</td>
                    <td className="px-6 py-4">{lead.state}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          lead.priority === "High"
                            ? "bg-black text-white"
                            : lead.priority === "Medium"
                            ? "bg-gray-200 text-gray-900"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
