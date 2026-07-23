import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import PropertyDetailClient from './PropertyDetailClient';

export const dynamic = 'force-dynamic';

async function getProperty(id: string) {
  try {
    if (!mongoose.isValidObjectId(id)) return null;
    await connectDB();

    const Property = (await import('@/models/Property')).default;
    const Agent = (await import('@/models/Agent')).default;
    const User = (await import('@/models/User')).default;

    // Increment views
    const property = await Property.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean() as Record<string, unknown> | null;

    if (!property) return null;

    // Get assigned agent info
    let assignedAgent = null;
    if (property.assignedAgent) {
      const agent = await Agent.findById(property.assignedAgent).lean() as Record<string, unknown> | null;
      if (agent) {
        const user = await User.findById(agent.userId).select('name email phone avatar').lean() as Record<string, unknown> | null;
        assignedAgent = {
          _id: String(agent._id),
          userId: {
            name: user?.name ? String(user.name) : 'Agent',
            email: user?.email ? String(user.email) : '',
            phone: user?.phone ? String(user.phone) : '',
          },
          district: String(agent.district || ''),
          sector: String(agent.sector || ''),
          rating: Number(agent.rating || 0),
          profileImage: agent.profileImage ? String(agent.profileImage) : null,
          avatar: (user?.avatar) ? String(user.avatar) : null,
        };
      }
    }

    const contactInfo = property.contactInfo as { name?: string; phone?: string; email?: string } || {};

    return {
      _id: String(property._id),
      title: String(property.title || ''),
      type: String(property.type || ''),
      category: String(property.category || ''),
      price: Number(property.price || 0),
      province: String(property.province || ''),
      district: String(property.district || ''),
      sector: String(property.sector || ''),
      description: String(property.description || ''),
      images: Array.isArray(property.images) ? (property.images as string[]) : [],
      bedrooms: property.bedrooms ? Number(property.bedrooms) : undefined,
      bathrooms: property.bathrooms ? Number(property.bathrooms) : undefined,
      parkingSpaces: property.parkingSpaces ? Number(property.parkingSpaces) : undefined,
      plotSize: property.plotSize ? Number(property.plotSize) : undefined,
      plotSizeUnit: property.plotSizeUnit ? String(property.plotSizeUnit) : undefined,
      floorArea: property.floorArea ? Number(property.floorArea) : undefined,
      amenities: Array.isArray(property.amenities) ? (property.amenities as string[]) : [],
      contactInfo: {
        name: String(contactInfo.name || ''),
        phone: String(contactInfo.phone || ''),
        email: contactInfo.email ? String(contactInfo.email) : undefined,
      },
      status: String(property.status || ''),
      views: Number(property.views || 0),
      createdAt: property.createdAt ? new Date(property.createdAt as string).toISOString() : new Date().toISOString(),
      assignedAgent,
    };
  } catch {
    return null;
  }
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
