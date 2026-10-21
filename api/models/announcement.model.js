import mongoose from 'mongoose';
const { Schema } = mongoose;

const announcementSchema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetAudience: {
    roles: [{ type: String, enum: ['student', 'teacher', 'admin'] }],
    departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    programs: [{ type: Schema.Types.ObjectId, ref: 'Program' }],
    courses: [{ type: Schema.Types.ObjectId, ref: 'Content' }],
  },
  isPinned: { type: Boolean, default: false },
  expiresAt: { type: Date },
}, { timestamps: true });

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);
