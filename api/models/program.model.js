import mongoose from 'mongoose';
const { Schema } = mongoose;

const programSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  description: { type: String, trim: true },
  durationYears: { type: Number, required: true, min: 1, max: 6 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

programSchema.index({ department: 1, code: 1 }, { unique: true });

export default mongoose.model('Program', programSchema);
