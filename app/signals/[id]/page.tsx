import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSignalById,
  scoreSignal,
  getSignalReasons,
  getSignalReasoning,
  generateSignalEmails,
  getSignalDrivers,
  getSignalRecommendedAction,
} from "@/lib/signals";
import { estimatePipelineImpact } from "@/lib/pipeline";

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

function formatCurrency(value: number) {
  return `€${value.toLocaleString()}`;
}

export default function SignalPage({ params }: { params: { id: string } }) {
  const signal = getSignalById(params.id);

  if (!signal) {
    notFound();
  }

  const score = scoreSignal(signal);
  const reasons = getSignalReasons(signal);
  const drivers = getSignalDrivers(signal);
  const reasoning = getSignalReasoning(signal);
  const emails = generateSignalEmails(signal);
  const recommendedAction = getSignalRecommendedAction(signal);

  const pipeline = estimatePipelineImpact(score);

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

        {/* SCORE + PIPELINE */}
        <div className="mb-8 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[320px_1fr] md:items-center">
            <div>
              <p className="text-sm text-gray-500">Signal Score</p>

              <div className="mt-3 flex items-end gap-4">
                <div className={`text-8xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="pb-3 text-2xl text-gray-700">
                  {getPriorityLabel(score)}
                </div>
              </div>

              {/* 💰 PIPELINE IMPACT */}
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs uppercase text-green-700">
                  Estimated pipeline impact
                </p>

                <p className="mt-2 text-2xl font-semibold text-green-900">
                  {formatCurrency(pipeline.pipelineValue)}
                </p>

                <p className="mt-1 text-sm text-green-800">
                  Based on your avg deal size and win rate
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500 uppercase">
                  Recommended action
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {recommendedAction.label}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {recommendedAction.reason}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {reasons.slice(0, 4).map((reason, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm"
                >
                  {reason}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WHY */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Why this opportunity</h2>

            <div className="mt-4 bg-gray-50 p-4 rounded-xl">
              <p className="text-sm">{reasoning}</p>
            </div>

            <ul className="mt-4 space-y-2">
              {drivers.map((d, i) => (
                <li key={i} className="text-sm">
                  • {d}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Trigger</h2>
            <p className="mt-4 text-sm">{signal.signal}</p>
          </section>
        </div>

        {/* EMAILS */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Outbound</h2>

          <div className="mt-6 space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl">
              <pre className="text-sm whitespace-pre-wrap">
                {emails.email}
              </pre>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl">
              <pre className="text-sm whitespace-pre-wrap">
                {emails.followUpEmail}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
