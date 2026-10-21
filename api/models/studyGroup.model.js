import mongoose from 'mongoose';
const { Schema } = mongoose;

const studyGroupSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  topic: { type: String, trim: true },
  course: { type: Schema.Types.ObjectId, ref: 'Content', index: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  maxMembers: { type: Number, default: 30 },
  nextSession: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('StudyGroup', studyGroupSchema);
