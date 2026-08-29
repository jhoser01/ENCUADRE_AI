import { NextResponse } from 'next/server';
import { validateClientTokenAction } from '@/server/actions/sessions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const validation = await validateClientTokenAction(token);

  if (!validation.valid) {
    return NextResponse.json({ valid: false, error: validation.error }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    projectName: validation.projectName,
    photographerName: validation.photographerName,
    studioName: validation.studioName,
    status: validation.status,
  });
}
