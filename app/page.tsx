import Link from "next/link";
import { leads } from "@/lib/data";
import { getICPFit, getLeadScore, getLeadState, getPersona, getPriority } from "@/lib/scoring";

function getScoreStyles(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function HomePage() {
  const enrichedLeads = leads
    .map((lead) => ({
      ...lead,
      icpFit: getICPFit(lead),
      persona: getPersona(lead.title),
      state: getLeadState(lead),
      priority: getPriority(lead),
      score: getLeadScore(lead),
    }))
    .sort((a, b) => b.score - a.score);

  const highPriority = enrichedLeads.filter((lead) => lead.priority === "High").length;
  const dormant = enrichedLeads.filter((lead) => lead.state === "Dormant").length;
  const warmNeglected = enrichedLeads.filter((lead) => lead.state === "Warm but Neglected").length;
  const highICP = enrichedLeads.filter((lead) => lead.icpFit === "High").length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">AI Sales Agent MVP</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            Dormant pipeline recovery dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600">
            Rank neglected leads, understand why they matter now, and generate the next best action based on fit, timing, engagement and pain signals.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total leads</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{enrichedLeads.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">High priority</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{highPriority}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">High ICP fit</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{highICP}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Warm but neglected</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{warmNeglected}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Opportunities surfaced</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-4 font-medium">Lead</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Persona</th>
                  <th className="px-6 py-4 font-medium">ICP fit</th>
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
                      <span className={`inline-flex min-w-[52px] justify-center rounded-full border px-3 py-1 text-xs font-semibold ${getScoreStyles(lead.score)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">{lead.persona}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                        {lead.icpFit}
                      </span>
                    </td>
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

        <div className="mt-8 text-sm text-gray-500">
          Dormant: {dormant} · Warm but neglected: {warmNeglected}
        </div>
      </div>
    </main>
  );
}
