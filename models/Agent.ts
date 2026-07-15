import mongoose, { Document, Schema } from 'mongoose';

export interface IAgent extends Document {
  userId: mongoose.Types.ObjectId;
  nationalId: string;
  province: string;
  district: string;
  sector: string;
  profileImage?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  bio?: string;
  experience?: number;
  specializations?: string[];
  rating?: number;
  totalReviews?: number;
  completedRequests?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    nationalId: { type: String, required: true, unique: true, trim: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    sector: { type: String, required: true },
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
  },
  { timestamps: true }
);

AgentSchema.index({ province: 1, district: 1, sector: 1 });
AgentSchema.index({ approvalStatus: 1 });

const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);
export default Agent;
