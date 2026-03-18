import Link from 'next/link';
import { LeadRecord } from '@/lib/types';
import { buildFallbackAnalysis } from '@/lib/scoring';
import Badge from '@/components/Badge';

export default function LeadTable({ leads }: { leads: LeadRecord[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-panel shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Company</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Contact</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Persona</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ICP Fit</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">State</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Last Touch</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {leads.map((lead) => {
              const analysis = buildFallbackAnalysis(lead);
              return (
                <tr key={lead.contact.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 align-top">
                    <div className="font-semibold text-slate-900">{lead.company.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{lead.company.industry}</div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="font-semibold text-slate-900">
                      {lead.contact.first_name} {lead.contact.last_name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{lead.contact.job_title}</div>
                  </td>
                  <td className="px-4 py-4 align-top">{analysis.persona}</td>
                  <td className="px-4 py-4 align-top"><Badge>{analysis.icp_fit}</Badge></td>
                  <td className="px-4 py-4 align-top">{analysis.state}</td>
                  <td className="px-4 py-4 align-top">{lead.contact.last_contacted_days_ago} days ago</td>
                  <td className="px-4 py-4 align-top">
                    <Link
                      href={`/lead/${lead.contact.id}`}
                      className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      View AI insight
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
