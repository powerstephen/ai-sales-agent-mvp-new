import Badge from '@/components/Badge';
import { AnalysisResult, LeadRecord } from '@/lib/types';

export default function InsightCard({ lead, analysis }: { lead: LeadRecord; analysis: AnalysisResult }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">AI decision</h2>
          <Badge>{analysis.icp_fit} ICP Fit</Badge>
          <Badge>{analysis.persona}</Badge>
          <Badge>{analysis.state}</Badge>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Angle</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.angle}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested next action</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.next_action}</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why now</div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            {analysis.why_now.map((item) => (
              <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested email subject</div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.suggested_subject}</p>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generated reactivation email</div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 whitespace-pre-wrap">
            {analysis.email_body}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Approve and send</button>
          <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Edit email</button>
          <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Regenerate</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-900">Lead context</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold">Contact:</span> {lead.contact.first_name} {lead.contact.last_name}</p>
            <p><span className="font-semibold">Title:</span> {lead.contact.job_title}</p>
            <p><span className="font-semibold">Company:</span> {lead.company.name}</p>
            <p><span className="font-semibold">Signal:</span> {lead.company.recent_signal}</p>
            <p><span className="font-semibold">Last contact:</span> {lead.contact.last_contacted_days_ago} days ago</p>
            <p><span className="font-semibold">Recent engagement:</span> {lead.contact.last_engagement.type.replaceAll('_', ' ')}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-900">CRM notes and meetings</h3>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
            {lead.contact.notes?.length ? (
              <div>
                <div className="font-semibold text-slate-900">Notes</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {lead.contact.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>
            ) : null}

            {lead.contact.calls?.length ? (
              <div>
                <div className="font-semibold text-slate-900">Call logs</div>
                <ul className="mt-2 space-y-2">
                  {lead.contact.calls.map((call) => (
                    <li key={call.summary} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{call.days_ago} days ago</div>
                      <div>{call.summary}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {lead.contact.meetings?.length ? (
              <div>
                <div className="font-semibold text-slate-900">Meetings attended</div>
                <ul className="mt-2 space-y-2">
                  {lead.contact.meetings.map((meeting) => (
                    <li key={meeting.title + meeting.days_ago} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{meeting.title} · {meeting.days_ago} days ago</div>
                      <div>{meeting.summary}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
