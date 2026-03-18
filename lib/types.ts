export type ActivityType =
  | 'email_open'
  | 'email_click'
  | 'webinar_attended'
  | 'meeting_attended'
  | 'call_logged'
  | 'note_added'
  | 'none';

export interface Engagement {
  type: ActivityType;
  days_ago: number | null;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  company_id: string;
  lifecycle_stage: 'subscriber' | 'lead' | 'marketingqualifiedlead' | 'salesqualifiedlead' | 'opportunity' | 'customer';
  last_contacted_days_ago: number;
  last_engagement: Engagement;
  notes?: string[];
  meetings?: {
    title: string;
    days_ago: number;
    summary: string;
  }[];
  calls?: {
    days_ago: number;
    summary: string;
  }[];
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employee_count: number;
  location: string;
  recent_signal: string;
}

export interface LeadRecord {
  contact: Contact;
  company: Company;
}

export interface AnalysisResult {
  icp_fit: 'High' | 'Medium' | 'Low';
  persona: string;
  state: string;
  angle: string;
  why_now: string[];
  next_action: string;
  suggested_subject: string;
  email_body: string;
}
