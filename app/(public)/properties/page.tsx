import { Suspense } from 'react';
import PropertiesClient from './PropertiesClient';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

async function getInitialProperties(searchParams: Record<string, string>) {
  try {
    await connectDB();
    const Property = (await import('@/models/Property')).default;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { status: { $nin: ['sold', 'rented'] } };
    if (searchParams.category) query.category = searchParams.category;
    if (searchParams.type) query.type = searchParams.type;
    if (searchParams.province) query.province = searchParams.province;
    if (searchParams.district) query.district = searchParams.district;

    const props = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    const total = await Property.countDocuments(query);

    return {
      properties: props.map((p: Record<string, unknown>) => ({
        _id: String(p._id),
        title: String(p.title || ''),
        type: String(p.type || ''),
        category: String(p.category || ''),
        price: Number(p.price || 0),
        district: String(p.district || ''),
        sector: String(p.sector || ''),
        province: String(p.province || ''),
        images: Array.isArray(p.images) ? (p.images as string[]) : [],
        bedrooms: p.bedrooms ? Number(p.bedrooms) : undefined,
        bathrooms: p.bathrooms ? Number(p.bathrooms) : undefined,
        plotSize: p.plotSize ? Number(p.plotSize) : undefined,
        status: String(p.status || ''),
        description: String(p.description || ''),
      })),
      total,
    };
  } catch {
    return { properties: [], total: 0 };
  }
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const { properties, total } = await getInitialProperties(searchParams);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <PropertiesClient initialProperties={properties} initialTotal={total} />
    </Suspense>
  );
}
