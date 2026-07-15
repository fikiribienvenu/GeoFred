'use client';

import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-black mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to access this page.</p>
        <Link href="/"><Button variant="terra">Go Home</Button></Link>
      </div>
    </div>
  );
}
