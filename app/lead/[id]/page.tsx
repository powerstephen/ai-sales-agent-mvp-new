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

  if (!lead) return notFound();

  const analysis = await analyzeLead(lead);
  const signals = getSignalCards(lead);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
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

        {/* HERO */}
        <div className="mb-8 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

            {/* SCORE */}
            <div>
              <p className="text-sm text-gray-500">Lead Score</p>
              <div className="flex items-end gap-4 mt-2">
                <div className={`text-7xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="text-lg text-gray-600 pb-2">
                  {getPriorityLabel(analysis.score)}
                </div>
              </div>
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2">
              {analysis.whyNow.slice(0, 4).map((item, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SIGNAL GRID */}
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {signals.map((s, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 text-sm font-medium ${
                s.active
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {/* WHY THIS LEAD */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Why this lead now
              </h2>

              <p className="mt-3 text-sm text-gray-700 leading-6">
                {analysis.reasoning}
              </p>

              <ul className="mt-4 space-y-2">
                {analysis.whyNow.slice(0, 4).map((item, i) => (
                  <li
                    key={i}
                    className="text-sm bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* TIMELINE */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Activity
              </h2>

              <div className="mt-4 space-y-3">
                {lead.activities.map((a, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="capitalize text-gray-900">
                        {a.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-500">{a.daysAgo}d ago</span>
                    </div>
                    <p className="mt-1 text-gray-700">{a.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — EMAIL */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Suggested outreach
            </h2>

            {/* EMAIL PREVIEW */}
            <div className="mt-4 border rounded-xl p-4 bg-gray-50">

              <div className="text-xs text-gray-500 mb-2">
                From: Stephen  
                <br />
                To: {lead.email}
              </div>

              <div className="bg-white border rounded-lg p-4 text-sm leading-6 text-gray-800 max-w-full">
                <pre className="whitespace-pre-wrap">
{analysis.email}
                </pre>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
                Send now
              </button>
              <button className="border px-4 py-2 rounded-lg text-sm">
                Send + follow-up
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Follow-up timing (3, 5, 7 days) can be configurable.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
