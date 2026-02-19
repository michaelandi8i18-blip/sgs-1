import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    const result = await authenticateUser(username, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    const token = await generateToken(result.user);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
