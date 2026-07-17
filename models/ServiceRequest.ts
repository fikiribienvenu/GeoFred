import mongoose, { Document, Schema } from 'mongoose';

export type ServiceType =
  | 'land_survey'
  | 'topographic_survey'
  | 'construction_permit'
  | 'property_valuation'
  | 'building_construction'
  | 'parcel_rental'
  | 'land_sale'
  | 'building_sale';

export interface IServiceRequest extends Document {
  // Registered client (optional — guest requests have no clientId)
  clientId?: mongoose.Types.ObjectId;
  // Guest info for requests without account
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  isGuest: boolean;
  serviceType: ServiceType;
  province: string;
  district: string;
  sector: string;
  assignedAgent?: mongoose.Types.ObjectId;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  documents?: string[];
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  completedAt?: Date;
  rating?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User' }, // optional for guests
    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String },
    isGuest: { type: Boolean, default: false },
    serviceType: {
      type: String,
      enum: [
        'land_survey', 'topographic_survey', 'construction_permit',
        'property_valuation', 'building_construction', 'parcel_rental',
        'land_sale', 'building_sale',
      ],
      required: true,
    },
    province: { type: String, required: true },
    district: { type: String, required: true },
    sector: { type: String, required: true },
    assignedAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    description: { type: String, required: true },
    documents: [{ type: String }],
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    notes: { type: String },
    completedAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
  },
  { timestamps: true }
);

ServiceRequestSchema.index({ clientId: 1, status: 1 });
ServiceRequestSchema.index({ guestEmail: 1 });
ServiceRequestSchema.index({ assignedAgent: 1, status: 1 });
ServiceRequestSchema.index({ district: 1, sector: 1 });

// Delete cached model to pick up schema changes (important during development)
delete mongoose.models.ServiceRequest;
const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);
export default ServiceRequest;
