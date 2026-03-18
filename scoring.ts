import { AnalysisResult, LeadRecord } from '@/lib/types';

function detectPersona(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('revops') || lower.includes('revenue operations')) return 'RevOps Leader';
  if (lower.includes('sales')) return 'Sales Leader';
  if (lower.includes('founder') || lower.includes('chief executive') || lower.includes('ceo')) return 'Founder / CEO';
  if (lower.includes('marketing') || lower.includes('demand gen')) return 'Marketing Leader';
  if (lower.includes('revenue')) return 'Revenue Leader';
  return 'Commercial Leader';
}

function computeIcpFit(record: LeadRecord): 'High' | 'Medium' | 'Low' {
  const company = record.company;
  const title = record.contact.job_title.toLowerCase();
  const goodIndustry = company.industry.toLowerCase().includes('saas');
  const goodSize = company.employee_count >= 50 && company.employee_count <= 500;
  const goodRole = /(head|vp|director|chief|founder)/.test(title);

  const score = [goodIndustry, goodSize, goodRole].filter(Boolean).length;
  if (score === 3) return 'High';
  if (score === 2) return 'Medium';
  return 'Low';
}

function computeState(record: LeadRecord): string {
  const lastTouch = record.contact.last_contacted_days_ago;
  const engagement = record.contact.last_engagement;

  if (lastTouch >= 60 && engagement.days_ago !== null && engagement.days_ago <= 21) {
    return 'Dormant but warm';
  }
  if (lastTouch >= 45 && engagement.type === 'webinar_attended') {
    return 'Engaged then neglected';
  }
  if (lastTouch >= 90) {
    return 'Cold and aging';
  }
  return 'Monitor';
}

function computeAngle(record: LeadRecord, persona: string): string {
  const signal = record.company.recent_signal.toLowerCase();
  if (signal.includes('hiring sdr') || signal.includes('hiring')) {
    if (persona === 'Sales Leader') return 'Pipeline coverage for a growing team';
    if (persona === 'RevOps Leader') return 'Lead routing and follow-up consistency';
    return 'Scaling commercial execution without leakage';
  }
  if (signal.includes('series b') || signal.includes('expanded')) {
    return 'Expansion creates follow-up and prioritisation pressure';
  }
  if (record.contact.last_engagement.type === 'webinar_attended') {
    return 'Follow up on clear topic-level engagement';
  }
  return 'Re-engage around missed pipeline already sitting in CRM';
}

function buildReasons(record: LeadRecord, persona: string, fit: string): string[] {
  const reasons = [
    `${fit} ICP fit based on industry, size and seniority`,
    `${record.contact.last_contacted_days_ago} days since last contact`,
    `${record.company.name} signal: ${record.company.recent_signal}`
  ];

  if (record.contact.last_engagement.days_ago !== null) {
    reasons.push(`Recent engagement: ${record.contact.last_engagement.type.replaceAll('_', ' ')} ${record.contact.last_engagement.days_ago} days ago`);
  }

  if (record.contact.meetings?.[0]) {
    reasons.push(`Meeting context: ${record.contact.meetings[0].summary}`);
  } else if (record.contact.calls?.[0]) {
    reasons.push(`Call context: ${record.contact.calls[0].summary}`);
  } else if (record.contact.notes?.[0]) {
    reasons.push(`CRM note: ${record.contact.notes[0]}`);
  }

  reasons.push(`Primary persona: ${persona}`);
  return reasons;
}

export function buildFallbackAnalysis(record: LeadRecord): AnalysisResult {
  const persona = detectPersona(record.contact.job_title);
  const icp_fit = computeIcpFit(record);
  const state = computeState(record);
  const angle = computeAngle(record, persona);
  const why_now = buildReasons(record, persona, icp_fit);
  const firstName = record.contact.first_name;
  const company = record.company.name;

  const suggested_subject =
    persona === 'RevOps Leader'
      ? `A practical way to stop warm leads going stale at ${company}`
      : `Worth revisiting pipeline coverage at ${company}?`;

  const email_body = `Hi ${firstName},\n\nI was looking back at our previous conversation and noticed a familiar pattern: strong intent signals, but then natural gaps in follow-up as priorities shift. Given ${company}'s recent context around ${record.company.recent_signal.toLowerCase()}, it feels like the cost of neglected but still-relevant leads could be higher now than it was when we last spoke.\n\nFrom your side as a ${record.contact.job_title}, my assumption is the priority is less about sending more volume and more about making sure the right accounts get the right next step at the right time. That is exactly the problem we are focused on solving.\n\nHappy to send over a short example of how this could surface dormant but high-fit pipeline and generate the right re-engagement angle automatically.\n\nBest,\nStephen`;

  return {
    icp_fit,
    persona,
    state,
    angle,
    why_now,
    next_action: 'Review and send tailored reactivation email',
    suggested_subject,
    email_body
  };
}
