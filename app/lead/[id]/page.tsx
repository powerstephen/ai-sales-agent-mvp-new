import Link from "next/link";
import { notFound } from "next/navigation";
import InsightCard from "@/components/InsightCard";
import { getLeadById } from "@/lib/data";
import { analyzeLead } from "@/lib/openai";
import { getSignalCards } from "@/lib/scoring";

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

export default async function LeadPage({ params }: { params: { id: string } }) {
  const lead = getLeadById(params.id);

  if (!lead) {
    notFound();
  }

  const analysis = await analyzeLead(lead);
  const signals = getSignalCards(lead);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </Link>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Lead detail</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{lead.name}</h1>
            <p className="mt-2 text-base text-gray-600">
              {lead.title} at {lead.company}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Lead Score</p>
              <div className="mt-2 flex items-end gap-4">
                <div className={`text-7xl font-bold leading-none ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="pb-2 text-lg font-medium text-gray-600">{getPriorityLabel(analysis.score)}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {analysis.whyNow.slice(0, 5).map((item, index) => (
                <span
                  key={index}
                  className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {signals.map((signal, index) => (
            <div
              key={index}
              className={`rounded-2xl border p-4 text-sm font-medium ${
                signal.active
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              {signal.label}
            </div>
          ))}
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <InsightCard label="ICP fit" value={analysis.icpFit} />
          <InsightCard label="Persona" value={analysis.persona} />
          <InsightCard label="State" value={analysis.state} />
          <InsightCard label="Suggested action" value={analysis.suggestedAction} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Company and contact context</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company</p>
                  <p className="mt-2 text-sm text-gray-900">{lead.company}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Industry</p>
                  <p className="mt-2 text-sm text-gray-900">{lead.companyData.industry}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Employees</p>
                  <p className="mt-2 text-sm text-gray-900">{lead.companyData.employees}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Signal</p>
                  <p className="mt-2 text-sm text-gray-900">{lead.companyData.signal}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Lifecycle stage</p>
                  <p className="mt-2 text-sm text-gray-900 capitalize">{lead.lifecycleStage}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last contacted</p>
                  <p className="mt-2 text-sm text-gray-900">{lead.lastContactedDays} days ago</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Activity timeline</h2>
              <div className="mt-5 space-y-4">
                {lead.activities.map((activity, index) => (
                  <div key={`${activity.type}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium capitalize text-gray-900">
                        {activity.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-500">{activity.daysAgo} days ago</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{activity.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">AI reasoning</h2>
              <p className="mt-4 text-sm leading-6 text-gray-700">{analysis.reasoning}</p>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Why this scored high</p>
                <ul className="mt-3 space-y-2">
                  {analysis.whyNow.map((item, index) => (
                    <li key={index} className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 grid gap-4">
                <InsightCard label="Suggested angle" value={analysis.angle} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Suggested email</h2>
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-6 text-gray-800">{analysis.email}</pre>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
                  Send Now
                </button>
                <button className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  Send + Schedule Follow-Up
                </button>
                <button className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  Push to nurture
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Follow-up timing can later be made configurable by the client, for example 3, 5, or 7 days.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
