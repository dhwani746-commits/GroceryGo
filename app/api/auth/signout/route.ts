import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    await supabase.auth.signOut();

    // Check if it's a form submission (from AccountPageClient)
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const redirectTo = formData.get('redirect') as string;
      
      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }

    return NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
