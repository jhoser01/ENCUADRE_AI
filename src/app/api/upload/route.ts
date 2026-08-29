import { NextResponse } from 'next/server';
import { uploadPortfolioImageAction } from '@/server/actions/portfolio';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await uploadPortfolioImageAction(formData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, imageId: result.imageId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload error' }, { status: 500 });
  }
}
