import { buildFallbackAnalysis } from '@/lib/scoring';
import { LeadRecord, AnalysisResult } from '@/lib/types';

export async function analyzeLead(record: LeadRecord): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackAnalysis(record);
  }

  const prompt = `You are an expert B2B SaaS SDR and RevOps strategist. Analyze this dormant CRM record and return strict JSON with these keys only: icp_fit, persona, state, angle, why_now, next_action, suggested_subject, email_body.\n\nICP definition:\n- B2B SaaS or adjacent software\n- 50 to 500 employees\n- Senior commercial, sales, revops, founder, or marketing leadership roles\n\nRules:\n- Use recent call notes, meeting notes and CRM notes if available\n- Be specific and commercially sharp\n- Do not invent factual company news beyond the provided data\n- why_now must be an array of 4 to 6 concise strings\n- email_body should be strong, natural, executive, and under 220 words\n\nRecord:\n${JSON.stringify(record, null, 2)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You output valid JSON only.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    return buildFallbackAnalysis(record);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    return buildFallbackAnalysis(record);
  }

  try {
    return JSON.parse(content) as AnalysisResult;
  } catch {
    return buildFallbackAnalysis(record);
  }
}
