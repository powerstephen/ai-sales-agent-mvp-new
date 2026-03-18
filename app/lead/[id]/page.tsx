import Link from "next/link";
import { notFound } from "next/navigation";
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
            ← Back
          </Link>

          <h1 className="mt-4 text-3xl font-semibold text-gray-900">
            {lead.name}
          </h1>
          <p className="text-gray-600">
            {lead.title} at {lead.company}
          </p>
        </div>

        <div className="mb-8 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Lead Score</p>
              <div className="mt-2 flex items-end gap-4">
                <div className={`text-7xl font-bold leading-none ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="pb-2 text-lg font-medium text-gray-600">
                  {getPriorityLabel(analysis.score)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {analysis.whyNow.slice(0, 4).map((item, index) => (
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

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {signals.map((signal, index) => (
            <div
              key={index}
              className={`rounded-xl border p-4 text-sm font-medium ${
                signal.active
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              {signal.label}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Why this lead now
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-700">
                {analysis.reasoning}
              </p>

              <ul className="mt-4 space-y-2">
                {analysis.whyNow.slice(0, 4).map((item, index) => (
                  <li
                    key={index}
                    className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Activity
              </h2>

              <div className="mt-4 space-y-3">
                {lead.activities.map((activity, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="capitalize text-gray-900">
                        {activity.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-500">{activity.daysAgo}d ago</span>
                    </div>
                    <p className="mt-1 text-gray-700">{activity.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Outreach sequence
            </h2>

            <div className="mt-4 flex gap-2">
              {["3 days", "5 days", "7 days"].map((delay) => (
                <button
                  key={delay}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-gray-100"
                >
                  {delay}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl border bg-gray-50 p-4">
              <p className="mb-2 text-xs text-gray-500">Email 1 (Now)</p>

              <div className="rounded-lg border bg-white p-4 text-sm leading-6 text-gray-800">
                <div className="mb-3 text-xs text-gray-500">
                  From: Stephen
                  <br />
                  To: {lead.email}
                </div>

                <pre className="whitespace-pre-wrap">{analysis.email}</pre>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-gray-400">
              ↓ Follow-up
            </div>

            <div className="mt-3 rounded-xl border bg-gray-50 p-4">
              <p className="mb-2 text-xs text-gray-500">Email 2</p>

              <div className="rounded-lg border bg-white p-4 text-sm leading-6 text-gray-800">
                <div className="mb-3 text-xs text-gray-500">
                  From: Stephen
                  <br />
                  To: {lead.email}
                </div>

                <pre className="whitespace-pre-wrap">{analysis.followUpEmail}</pre>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
                Launch sequence
              </button>
              <button className="rounded-lg border px-4 py-2 text-sm">
                Edit emails
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Sequence timing can later be made configurable per user.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
