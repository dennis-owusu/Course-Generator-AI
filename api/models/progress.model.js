import mongoose from 'mongoose';
const { Schema } = mongoose;

const progressSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  lessonId: { type: String, required: true },
  moduleId: { type: String, required: false },
  status: { type: String, enum: ['started', 'completed'], default: 'started' },
  completionDate: { type: Date },
  timeSpentMinutes: { type: Number, default: 0 },
}, { timestamps: true });

progressSchema.index({ student: 1, course: 1, lessonId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
