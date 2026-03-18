import Link from 'next/link';
import { notFound } from 'next/navigation';
import InsightCard from '@/components/InsightCard';
import { getLeadById } from '@/lib/data';
import { analyzeLead } from '@/lib/openai';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = getLeadById(params.id);
  if (!lead) notFound();

  const analysis = await analyzeLead(lead);

  return (
    <main className="min-h-screen bg-shell">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              ← Back to dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {lead.contact.first_name} {lead.contact.last_name} · {lead.company.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              This view combines CRM metadata with notes from calls and meetings. In a real HubSpot connection, these can come from engagements, notes, calls and meeting objects if they exist in the account.
            </p>
          </div>
        </div>

        <InsightCard lead={lead} analysis={analysis} />
      </div>
    </main>
  );
}
