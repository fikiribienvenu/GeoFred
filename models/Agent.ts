import mongoose, { Document, Schema } from 'mongoose';

// Coverage area: one province can have multiple districts,
// and each district can have multiple sectors
export interface ICoverageArea {
  province: string;
  district: string;
  sectors: string[]; // multiple sectors per district
}

export interface IAgent extends Document {
  userId: mongoose.Types.ObjectId;
  nationalId: string;
  // Legacy single-location fields (kept for backward compat)
  province: string;
  district: string;
  sector: string;
  // New: multiple coverage areas
  coverageAreas: ICoverageArea[];
  profileImage?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  bio?: string;
  experience?: number;
  specializations?: string[];
  rating?: number;
  totalReviews?: number;
  completedRequests?: number;
  canUploadProperties: boolean; // permission flag
  createdAt: Date;
  updatedAt: Date;
}

const CoverageAreaSchema = new Schema<ICoverageArea>({
  province: { type: String, required: true },
  district: { type: String, required: true },
  sectors: [{ type: String }],
}, { _id: false });

const AgentSchema = new Schema<IAgent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    nationalId: { type: String, required: true, unique: true, trim: true },
    // Legacy single location (primary)
    province: { type: String, required: true },
    district: { type: String, required: true },
    sector: { type: String, required: true },
    // Multiple coverage areas
    coverageAreas: [CoverageAreaSchema],
    profileImage: { type: String },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    bio: { type: String },
    experience: { type: Number, default: 0 },
    specializations: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completedRequests: { type: Number, default: 0 },
    canUploadProperties: { type: Boolean, default: false }, // admin grants this
  },
  { timestamps: true }
);

AgentSchema.index({ province: 1, district: 1, sector: 1 });
AgentSchema.index({ 'coverageAreas.district': 1 });
AgentSchema.index({ approvalStatus: 1 });

const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);
export default Agent;
