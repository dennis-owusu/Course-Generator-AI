import mongoose from 'mongoose';
const { Schema } = mongoose;

const liveClassSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  course: { type: Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  meetingProvider: { type: String, enum: ['jitsi'], default: 'jitsi' },
  meetingRoom: { type: String, required: true, unique: true },
  recordingUrl: { type: String, trim: true },
  recordingMimeType: { type: String, trim: true },
  recordingStatus: { type: String, enum: ['none', 'processing', 'available'], default: 'none' },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

liveClassSchema.index({ course: 1, startTime: 1 });
liveClassSchema.index({ teacher: 1, startTime: 1 });

export default mongoose.model('LiveClass', liveClassSchema);
