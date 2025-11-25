import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { UserRole } from '@repo/types';

const SECRET = new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value;
  const { pathname } = req.nextUrl;

  // If no token redirect to home page
  if (!token) {
    return NextResponse.redirect(new URL('/?expired=true', req.url));
  }

  // Verify token
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role;

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Protect user routes
    if (pathname.startsWith('/user')) {
      if (role !== UserRole.USER) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // If all checks pass, continue to the requested page
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/user/:path*', '/admin/:path*'],
};
