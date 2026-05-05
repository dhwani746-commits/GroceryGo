import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { lookupPincodeMetadata, normalizePincodeInput } from '@/lib/services/pincode.service';

const LookupSchema = z.object({
  pincode: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 });
    }

    const normalized = normalizePincodeInput(parsed.data.pincode);
    if (!/^\d{6}$/.test(normalized)) {
      return NextResponse.json({ success: false, error: 'Pincode must be 6 digits' }, { status: 400 });
    }

    const metadata = await lookupPincodeMetadata(normalized);
    return NextResponse.json({ success: true, data: metadata });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_PINCODE') {
      return NextResponse.json({ success: false, error: 'Invalid pincode format' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'PINCODE_NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'Pincode not found' }, { status: 404 });
    }
    console.error('POST /api/pincode/lookup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to validate pincode' }, { status: 500 });
  }
}

