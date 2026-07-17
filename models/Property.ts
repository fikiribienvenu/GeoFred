import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  type: 'land' | 'house' | 'apartment' | 'commercial';
  category: 'sale' | 'rent';
  price: number;
  province: string;
  district: string;
  sector: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  images: string[];
  contactInfo: { name: string; phone: string; email?: string };
  status: 'available' | 'sold' | 'rented' | 'pending';
  published: boolean;
  assignedAgent?: mongoose.Types.ObjectId; // auto-assigned based on location
  plotSize?: number;
  plotSizeUnit?: 'sqm' | 'acres' | 'hectares';
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floorArea?: number;
  yearBuilt?: number;
  amenities?: string[];
  createdBy: mongoose.Types.ObjectId;
  views: number;
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['land', 'house', 'apartment', 'commercial'], required: true },
    category: { type: String, enum: ['sale', 'rent'], required: true },
    price: { type: Number, required: true, min: 0 },
    province: { type: String, required: true },
    district: { type: String, required: true },
    sector: { type: String, required: true },
    coordinates: { lat: { type: Number }, lng: { type: Number } },
    description: { type: String, required: true },
    images: [{ type: String }],
    contactInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending'],
      default: 'available',
    },
    published: { type: Boolean, default: false },
    assignedAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    plotSize: { type: Number },
    plotSizeUnit: { type: String, enum: ['sqm', 'acres', 'hectares'], default: 'sqm' },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    parkingSpaces: { type: Number },
    floorArea: { type: Number },
    yearBuilt: { type: Number },
    amenities: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

PropertySchema.index({ district: 1, sector: 1, type: 1, category: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ published: 1, status: 1 });
PropertySchema.index({ title: 'text', description: 'text' });
PropertySchema.index({ assignedAgent: 1 });

const Property = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
export default Property;
