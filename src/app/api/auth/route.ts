import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateAdmin,
  generateSignedToken,
  validateToken,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Validate existing token
    if (action === 'validate') {
      const token = req.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
      }
      const session = validateToken(token);
      if (!session) {
        return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
      }
      return NextResponse.json({ success: true, user: session });
    }

    // Logout — client-side only clears localStorage
    if (action === 'logout') {
      return NextResponse.json({ success: true });
    }

    // Login
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateAdmin(username, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateSignedToken(user);

    return NextResponse.json({
      success: true,
      token,
      username: user.username,
      loginTime: user.loginTime,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
