import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('Fuck'); // This will log in the terminal
  console.log('Login data:', body);
  return NextResponse.json({ success: true });
} 