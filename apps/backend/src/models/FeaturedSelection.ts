import mongoose, { Schema, Document } from 'mongoose';

export interface IFeaturedSelection extends Document {
  selectionId: string;
  description: string;
  odds: number;
  result: string;
  profit: number;
  createdAt: Date;
}

const FeaturedSchema = new Schema<IFeaturedSelection>({
  selectionId: { type: String, required: true },
  description: String,
  odds: Number,
  result: { type: String, default: 'pending' },
  profit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const FeaturedSelection = mongoose.model<IFeaturedSelection>('FeaturedSelection', FeaturedSchema);
