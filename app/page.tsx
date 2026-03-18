import LeadTable from '@/components/LeadTable';
import { getLeadRecords } from '@/lib/data';
import { buildFallbackAnalysis } from '@/lib/scoring';

export default function HomePage() {
  const leads = getLeadRecords();
  const highFitDormant = leads.filter((lead) => {
    const analysis = buildFallbackAnalysis(lead);
    return analysis.icp_fit !== 'Low' && lead.contact.last_contacted_days_ago >= 45;
  });

  const companies = new Set(highFitDormant.map((lead) => lead.company.name)).size;

  return (
    <main className="min-h-screen bg-shell">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-line bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">AI Revenue Reactivation Agent</div>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900">
                Surface the best dormant opportunities in your CRM and generate the right next step instantly.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                This MVP simulates HubSpot-style CRM data, including notes, call summaries and meeting context. It identifies high-fit dormant leads, explains why they matter now, and drafts a tailored re-engagement email.
              </p>
            </div>
            <div className="grid min-w-[280px] grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dormant high-fit leads</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{highFitDormant.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Companies surfaced</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{companies}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dormant opportunities dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">Click into any lead to view the AI reasoning, CRM context and generated email.</p>
          </div>
        </div>

        <LeadTable leads={highFitDormant} />
      </div>
    </main>
  );
}
