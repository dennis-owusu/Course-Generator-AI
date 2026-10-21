import mongoose from 'mongoose';
const { Schema } = mongoose;

const assignmentSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  course: { type: Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  term: { type: Schema.Types.ObjectId, ref: 'AcademicTerm', required: true },
  type: { type: String, enum: ['Essay', 'Quiz', 'Care Plan', 'Report', 'Case Study', 'Lab', 'Project'], required: true },
  totalPoints: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  attachments: [{ filename: String, url: String, mimeType: String }],
  isPublished: { type: Boolean, default: false },
  allowLateSubmission: { type: Boolean, default: false },
}, { timestamps: true });

assignmentSchema.index({ course: 1, dueDate: 1 });

export default mongoose.model('Assignment', assignmentSchema);
