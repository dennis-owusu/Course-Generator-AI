import mongoose from 'mongoose';
const { Schema } = mongoose;

const scheduleSchema = new Schema({
  title: { type: String, required: true, trim: true },
  course: { type: Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  term: { type: Schema.Types.ObjectId, ref: 'AcademicTerm', required: true },
  type: { type: String, enum: ['lecture', 'lab', 'clinical', 'exam', 'seminar'], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String, trim: true },
  supervisor: { type: Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

scheduleSchema.index({ course: 1, startTime: 1 });
scheduleSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model('Schedule', scheduleSchema);
