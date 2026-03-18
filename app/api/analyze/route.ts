import { NextRequest, NextResponse } from 'next/server';
import { getLeadById } from '@/lib/data';
import { analyzeLead } from '@/lib/openai';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = body?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
  }

  const lead = getLeadById(id);
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const analysis = await analyzeLead(lead);
  return NextResponse.json({ analysis });
}
