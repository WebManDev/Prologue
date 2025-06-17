import { NextResponse } from 'next/server';
import { processPayouts } from '@/lambda/process-payouts';

export async function GET() {
  await processPayouts();
  return NextResponse.json({ success: true });
} 