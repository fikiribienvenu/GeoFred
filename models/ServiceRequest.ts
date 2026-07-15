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
  clientId: mongoose.Types.ObjectId;
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
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
ServiceRequestSchema.index({ assignedAgent: 1, status: 1 });
ServiceRequestSchema.index({ district: 1, sector: 1 });

const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);
export default ServiceRequest;
