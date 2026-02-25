import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ user: null });

    // Simulate retrieving userData from token
    const user = { id: 1, name: 'Admin', email: 'admin@test.com' }
    return NextResponse.json({ user });
}
