import { Company, Contact, LeadRecord } from '@/lib/types';

export const companies: Company[] = [
  {
    id: 'co_001',
    name: 'RevScale',
    domain: 'revscale.io',
    industry: 'B2B SaaS',
    employee_count: 120,
    location: 'Germany',
    recent_signal: 'Hiring SDRs and AEs across EMEA'
  },
  {
    id: 'co_002',
    name: 'LogiHub',
    domain: 'logihub.com',
    industry: 'Logistics SaaS',
    employee_count: 300,
    location: 'United Kingdom',
    recent_signal: 'Raised Series B four months ago and launched a new analytics module'
  },
  {
    id: 'co_003',
    name: 'OpsPilot',
    domain: 'opspilot.ai',
    industry: 'Revenue Operations SaaS',
    employee_count: 75,
    location: 'Netherlands',
    recent_signal: 'Hosted a webinar on pipeline efficiency six weeks ago'
  },
  {
    id: 'co_004',
    name: 'CrewStack',
    domain: 'crewstack.com',
    industry: 'Maritime HR SaaS',
    employee_count: 210,
    location: 'Denmark',
    recent_signal: 'Hiring customer success and sales operations roles'
  },
  {
    id: 'co_005',
    name: 'FlowMetric',
    domain: 'flowmetric.io',
    industry: 'B2B SaaS',
    employee_count: 48,
    location: 'Ireland',
    recent_signal: 'No visible company news in recent months'
  },
  {
    id: 'co_006',
    name: 'ProcurePath',
    domain: 'procurepath.ai',
    industry: 'Procurement SaaS',
    employee_count: 160,
    location: 'United States',
    recent_signal: 'Recently expanded into EMEA and published a customer case study'
  }
];

export const contacts: Contact[] = [
  {
    id: 'c_001',
    first_name: 'Barry',
    last_name: "O'Sullivan",
    email: 'barry@revscale.io',
    job_title: 'Head of Sales',
    company_id: 'co_001',
    lifecycle_stage: 'lead',
    last_contacted_days_ago: 72,
    last_engagement: { type: 'email_open', days_ago: 10 },
    notes: [
      'Mentioned SDR ramp time was slower than expected.',
      'Interested in pipeline coverage and handoff quality.'
    ],
    meetings: [
      {
        title: 'Intro call',
        days_ago: 95,
        summary: 'Barry wanted practical ideas to improve outbound consistency across a new SDR team.'
      }
    ],
    calls: [
      {
        days_ago: 95,
        summary: 'Good initial fit. Timing was not right due to hiring freeze at the time.'
      }
    ]
  },
  {
    id: 'c_002',
    first_name: 'Anna',
    last_name: 'Meyer',
    email: 'anna@revscale.io',
    job_title: 'VP Revenue Operations',
    company_id: 'co_001',
    lifecycle_stage: 'opportunity',
    last_contacted_days_ago: 45,
    last_engagement: { type: 'webinar_attended', days_ago: 30 },
    notes: ['Asked for examples showing better lead routing and SLA adherence.'],
    meetings: [
      {
        title: 'Demo follow-up',
        days_ago: 60,
        summary: 'Anna cared most about workflow logic, stale lead detection and reporting.'
      }
    ]
  },
  {
    id: 'c_003',
    first_name: 'James',
    last_name: 'Wright',
    email: 'james@logihub.com',
    job_title: 'Director of Sales',
    company_id: 'co_002',
    lifecycle_stage: 'lead',
    last_contacted_days_ago: 90,
    last_engagement: { type: 'none', days_ago: null },
    notes: ['Had interest before the new budget cycle.'],
    calls: [
      {
        days_ago: 115,
        summary: 'Said the business was focused on product rollout, not sales process changes yet.'
      }
    ]
  },
  {
    id: 'c_004',
    first_name: 'Sophie',
    last_name: 'van Dijk',
    email: 'sophie@opspilot.ai',
    job_title: 'Head of Revenue Operations',
    company_id: 'co_003',
    lifecycle_stage: 'salesqualifiedlead',
    last_contacted_days_ago: 54,
    last_engagement: { type: 'meeting_attended', days_ago: 40 },
    notes: ['Focused on pipeline leakage between marketing and SDR.'],
    meetings: [
      {
        title: 'Pipeline workshop',
        days_ago: 40,
        summary: 'Strong fit. They wanted a lighter-weight way to surface neglected but warm accounts.'
      }
    ]
  },
  {
    id: 'c_005',
    first_name: 'Mikkel',
    last_name: 'Jensen',
    email: 'mikkel@crewstack.com',
    job_title: 'Chief Revenue Officer',
    company_id: 'co_004',
    lifecycle_stage: 'lead',
    last_contacted_days_ago: 67,
    last_engagement: { type: 'email_click', days_ago: 8 },
    notes: ['Very interested in visibility across sales and CS handoff.'],
    calls: [
      {
        days_ago: 80,
        summary: 'He liked the commercial story but needed clearer ROI proof and a use case for dormant leads.'
      }
    ]
  },
  {
    id: 'c_006',
    first_name: 'Clare',
    last_name: 'Murphy',
    email: 'clare@flowmetric.io',
    job_title: 'Founder',
    company_id: 'co_005',
    lifecycle_stage: 'subscriber',
    last_contacted_days_ago: 130,
    last_engagement: { type: 'email_open', days_ago: 75 },
    notes: ['Early stage founder, interested but limited budget.']
  },
  {
    id: 'c_007',
    first_name: 'Daniel',
    last_name: 'Hart',
    email: 'daniel@procurepath.ai',
    job_title: 'VP Sales',
    company_id: 'co_006',
    lifecycle_stage: 'lead',
    last_contacted_days_ago: 58,
    last_engagement: { type: 'webinar_attended', days_ago: 21 },
    notes: ['Wanted examples of pipeline recovery and rep productivity improvement.'],
    meetings: [
      {
        title: 'Post-webinar chat',
        days_ago: 21,
        summary: 'Daniel said EMEA expansion makes coverage and follow-up consistency more important this quarter.'
      }
    ]
  },
  {
    id: 'c_008',
    first_name: 'Lea',
    last_name: 'Schmidt',
    email: 'lea@revscale.io',
    job_title: 'Senior Demand Generation Manager',
    company_id: 'co_001',
    lifecycle_stage: 'marketingqualifiedlead',
    last_contacted_days_ago: 51,
    last_engagement: { type: 'note_added', days_ago: 48 },
    notes: ['Mentioned webinar follow-up was inconsistent across regions.']
  }
];

export function getLeadRecords(): LeadRecord[] {
  return contacts.map((contact) => ({
    contact,
    company: companies.find((company) => company.id === contact.company_id)!
  }));
}

export function getLeadById(id: string): LeadRecord | undefined {
  return getLeadRecords().find((record) => record.contact.id === id);
}
