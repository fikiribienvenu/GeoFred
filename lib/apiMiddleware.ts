import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, JWTPayload } from '@/lib/auth';

type Handler = (req: NextRequest, user: JWTPayload) => Promise<NextResponse>;

export function withAuth(handler: Handler, allowedRoles?: string[]) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, user);
  };
}

export function apiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}
