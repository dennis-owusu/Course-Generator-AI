import mongoose from 'mongoose';
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  term: { type: Schema.Types.ObjectId, ref: 'AcademicTerm', index: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'withdrawn'],
    default: 'active',
    index: true,
  },
  enrollmentDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  finalGrade: { type: String, trim: true },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1, term: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
