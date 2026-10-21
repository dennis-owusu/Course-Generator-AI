import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: [
      'course_created', 'enrollment', 'lesson_completed', 'assignment_due',
      'assignment_submitted', 'graded', 'feedback', 'schedule', 'announcement',
      'study_group', 'result_published'
    ],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  link: { type: String, trim: true },
  isRead: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
