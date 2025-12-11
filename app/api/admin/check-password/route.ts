import { NextRequest, NextResponse } from 'next/server';
import { passwordSchema } from '@/lib/validation/user-schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = passwordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { valid: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const { password } = parseResult.data;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return NextResponse.json(
        { valid: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Simple password comparison
    const isValid = password === adminPassword;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error checking password:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
