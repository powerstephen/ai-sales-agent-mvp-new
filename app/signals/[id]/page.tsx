import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignalById, scoreSignal, getSignalReasons, getSignalReasoning, generateSignalEmails } from "@/lib/signals";

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

export default function SignalPage({ params }: { params: { id: string } }) {
  const signal = getSignalById(params.id);

  if (!signal) {
    notFound();
  }

  const score = scoreSignal(signal);
  const reasons = getSignalReasons(signal);
  const reasoning = getSignalReasoning(signal);
  const emails = generateSignalEmails(signal);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>

          <h1 className="mt-4 text-3xl font-semibold text-gray-900">
            {signal.company}
          </h1>
          <p className="text-gray-600">
            {signal.persona} · {signal.industry}
          </p>
        </div>

        <div className="mb-8 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[320px_1fr] md:items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Signal Score</p>
              <div className="mt-3 flex items-end gap-4">
                <div className={`text-8xl font-bold leading-none ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="pb-3 text-2xl font-medium text-gray-700">
                  {getPriorityLabel(score)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium text-green-800"
                >
                  {reason}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Why this opportunity now</h2>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm leading-6 text-gray-800">{reasoning}</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Industry</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{signal.industry}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company size</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{signal.employees} employees</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Persona</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{signal.persona}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{signal.location}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Detected signal</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{signal.signal}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Suggested outreach</h2>

            <div className="mt-4 space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email 1 · New outbound
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="mb-4 text-xs text-gray-500">
                    From: Stephen
                    <br />
                    To: {signal.persona} at {signal.company}
                  </div>

                  <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
                    {emails.email}
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
                    To: {signal.persona} at {signal.company}
                  </div>

                  <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
                    {emails.followUpEmail}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
                Launch outbound
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">
                Edit emails
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
