import mongoose from 'mongoose';
const { Schema } = mongoose;

const submissionSchema = new Schema({
  assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, trim: true },
  attachments: [{ filename: String, url: String, mimeType: String }],
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  grade: { type: Number, min: 0 },
  feedback: { type: String, trim: true },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date },
  status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);


