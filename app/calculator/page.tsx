"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PipelineCalculatorPage() {
  const [totalLeads, setTotalLeads] = useState(2500);
  const [dormantPercent, setDormantPercent] = useState(35);
  const [avgDealSize, setAvgDealSize] = useState(12000);
  const [recoveryRate, setRecoveryRate] = useState(25);
  const [closeRate, setCloseRate] = useState(12);

  const results = useMemo(() => {
    const dormantLeads = Math.round(totalLeads * (dormantPercent / 100));
    const recoverableLeads = Math.round(dormantLeads * (recoveryRate / 100));
    const estimatedRecoveredPipeline = recoverableLeads * avgDealSize;
    const estimatedClosedRevenue = estimatedRecoveredPipeline * (closeRate / 100);

    return {
      dormantLeads,
      recoverableLeads,
      estimatedRecoveredPipeline,
      estimatedClosedRevenue,
    };
  }, [totalLeads, dormantPercent, avgDealSize, recoveryRate, closeRate]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>

          <p className="mt-4 text-sm font-medium text-gray-500">Pipeline Recovery Calculator</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            Estimate missed pipeline in your CRM
          </h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600">
            Use a few simple inputs to estimate how much revenue may be sitting in dormant or under-worked leads.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Inputs</h2>

            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total leads in CRM
                </label>
                <input
                  type="number"
                  value={totalLeads}
                  onChange={(e) => setTotalLeads(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  % of leads dormant or untouched
                </label>
                <input
                  type="number"
                  value={dormantPercent}
                  onChange={(e) => setDormantPercent(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Average deal size (€)
                </label>
                <input
                  type="number"
                  value={avgDealSize}
                  onChange={(e) => setAvgDealSize(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  % of dormant leads you could realistically recover
                </label>
                <input
                  type="number"
                  value={recoveryRate}
                  onChange={(e) => setRecoveryRate(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Close rate on recovered leads (%)
                </label>
                <input
                  type="number"
                  value={closeRate}
                  onChange={(e) => setCloseRate(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Estimated opportunity</h2>

            <div className="mt-6 rounded-2xl bg-black p-6 text-white">
              <p className="text-sm text-gray-300">Estimated recovered pipeline</p>
              <p className="mt-2 text-4xl font-semibold">
                {formatCurrency(results.estimatedRecoveredPipeline)}
              </p>
              <p className="mt-3 text-sm text-gray-300">
                Based on {results.recoverableLeads.toLocaleString()} recoverable dormant leads
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Dormant leads</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {results.dormantLeads.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Recoverable leads</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {results.recoverableLeads.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 md:col-span-2">
                <p className="text-sm text-gray-500">Estimated closed revenue</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(results.estimatedClosedRevenue)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="text-sm font-medium text-green-800">Suggested hook</p>
              <p className="mt-2 text-sm leading-6 text-green-900">
                Based on these assumptions, there may be{" "}
                <span className="font-semibold">
                  {formatCurrency(results.estimatedRecoveredPipeline)}
                </span>{" "}
                of dormant pipeline sitting in the CRM, with an estimated{" "}
                <span className="font-semibold">
                  {formatCurrency(results.estimatedClosedRevenue)}
                </span>{" "}
                in potential revenue if the best-fit leads were reactivated and worked consistently.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
                Book pipeline audit
              </button>
              <Link
                href="/"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                View live product demo
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
