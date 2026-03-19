import Link from "next/link";
import { leads } from "@/lib/data";
import { buildICP, calculateICPMatchScore } from "@/lib/icp";
import { getICPFit, getLeadScore, getLeadState, getPersona, getPriority } from "@/lib/scoring";
import { signals, scoreSignal, getSignalReason } from "@/lib/signals";

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
    .map((s) => ({
      ...s,
      score: scoreSignal(s, icp),
      reasons: getSignalReason(s),
    }))
    .sort((a, b) => b.score - a.score);

  const pipelineMatches = enrichedLeads.filter((l) => l.icpMatchScore >= 70).length;
  const pipelineQuality = Math.round((pipelineMatches / enrichedLeads.length) * 100);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Revenue Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Recover missed pipeline and identify new high-fit opportunities
          </p>
        </div>

        {/* ICP SECTION */}
        <div className="mb-6 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Your Best Customers</h2>

          <p className="text-sm text-gray-600 mb-3">
            Only <strong>{pipelineQuality}%</strong> of your pipeline matches your ICP
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Industry</p>
              <p>{icp.industry}</p>
            </div>
            <div>
              <p className="text-gray-500">Size</p>
              <p>{icp.employeeBand}</p>
            </div>
            <div>
              <p className="text-gray-500">Persona</p>
              <p>{icp.persona}</p>
            </div>
            <div>
              <p className="text-gray-500">Win Rate</p>
              <p>{icp.winRate}%</p>
            </div>
          </div>
        </div>

        {/* 🔥 NEW SIGNAL SECTION */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            New opportunities detected
          </h2>

          <div className="space-y-4">
            {enrichedSignals.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border p-4 rounded-xl"
              >
                <div>
                  <p className="font-medium">{s.company}</p>
                  <p className="text-sm text-gray-500">{s.signal}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {s.reasons.map((r, i) => (
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreStyles(
                      s.score
                    )}`}
                  >
                    {s.score}
                  </span>

                  <div className="mt-2">
                    <button className="text-sm text-black underline">
                      Generate outreach
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EXISTING LEADS */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Existing pipeline</h2>

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
                  <td>{lead.score}</td>
                  <td>{lead.icpMatchScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
