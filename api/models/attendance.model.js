import mongoose from 'mongoose';
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  schedule: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true, index: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['present', 'absent', 'excused', 'late'], required: true },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  markedAt: { type: Date, default: Date.now },
  note: { type: String, trim: true },
}, { timestamps: true });

attendanceSchema.index({ schedule: 1, student: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
