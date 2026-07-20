// Server-side data fetching functions — run directly on the server, no HTTP round-trip
import connectDB from '@/lib/mongodb';

export interface PropertyData {
  _id: string;
  title: string;
  type: string;
  category: string;
  price: number;
  district: string;
  sector: string;
  province: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  plotSize?: number;
  plotSizeUnit?: string;
  status: string;
}

export interface AgentData {
  _id: string;
  name: string;
  avatar: string | null;
  profileImage: string | null;
  district: string;
  sector: string;
  province: string;
  rating: number;
  completedRequests: number;
}

export interface AgentStats {
  total: number;
  districts: number;
  rating: string;
}

export async function getFeaturedProperties(): Promise<PropertyData[]> {
  try {
    await connectDB();
    // Dynamic import to avoid issues with mongoose models in edge runtime
    const Property = (await import('@/models/Property')).default;
    const props = await Property.find({ status: { $in: ['available', 'pending'] } })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return props.map((p: Record<string, unknown>) => ({
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
      plotSizeUnit: p.plotSizeUnit ? String(p.plotSizeUnit) : undefined,
      status: String(p.status || ''),
    }));
  } catch {
    return [];
  }
}

export async function getFeaturedAgents(): Promise<{ agents: AgentData[]; stats: AgentStats }> {
  try {
    await connectDB();
    const Agent = (await import('@/models/Agent')).default;
    const User = (await import('@/models/User')).default;

    const agents = await Agent.find({ approvalStatus: 'approved' })
      .sort({ rating: -1, completedRequests: -1 })
      .limit(3)
      .lean();

    const agentList: AgentData[] = await Promise.all(
      agents.map(async (a: Record<string, unknown>) => {
        const user = await User.findById(a.userId).select('name avatar').lean() as Record<string, unknown> | null;
        return {
          _id: String(a._id),
          name: user ? String(user.name || 'Agent') : 'Agent',
          avatar: user?.avatar ? String(user.avatar) : null,
          profileImage: a.profileImage ? String(a.profileImage) : null,
          district: String(a.district || ''),
          sector: String(a.sector || ''),
          province: String(a.province || ''),
          rating: Number(a.rating || 0),
          completedRequests: Number(a.completedRequests || 0),
        };
      })
    );

    const total = await Agent.countDocuments({ approvalStatus: 'approved' });
    const distinctDistricts = await Agent.distinct('district', { approvalStatus: 'approved' });
    const ratingAgg = await Agent.aggregate([
      { $match: { approvalStatus: 'approved', rating: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = ratingAgg[0]?.avg?.toFixed(1) || '4.8';

    return {
      agents: agentList,
      stats: { total, districts: distinctDistricts.length, rating: avgRating },
    };
  } catch {
    return { agents: [], stats: { total: 0, districts: 0, rating: '4.8' } };
  }
}
