import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: false, trim: true },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  profilePicture: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
  },
  googleId: { type: String, unique: true, sparse: true },

  // Role-based access
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
    index: true,
  },
  // Teacher verification lifecycle
  teacherStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'verified', 'rejected'],
    default: 'not_applicable',
    index: true,
  },
  teacherApplication: {
    qualifications: { type: String, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    submittedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true },
  },
  isActive: { type: Boolean, default: true },

  // Academic identity
  studentId: { type: String, unique: true, sparse: true, trim: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
  program: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
  enrollmentYear: { type: Number, min: 2000, max: 2100 },
  expectedGraduationYear: { type: Number, min: 2000, max: 2100 },

  // Teacher-specific
  teacherBio: { type: String, trim: true },
  assignedCourses: [{ type: Schema.Types.ObjectId, ref: 'Content', index: true }],

  // Subscription plan
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  planExpiresAt: { type: Date },

  // Preferred explanation level
  preferredLevel: { type: String, enum: ['JHS', 'SHS', 'Standard'], default: 'Standard' },

  // Monthly AI course generation usage
  monthlyAiCourses: {
    month: { type: String, default: '' },
    count: { type: Number, default: 0 },
  },

  // Gamification
  points: { type: Number, default: 0, index: true },
  badges: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now },
  }],
  completedLessons: [{
    courseId: { type: String, required: true },
    lessonId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
  }],
  waecStats: {
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
  },

  // Notification preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    assignments: { type: Boolean, default: true },
    grades: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    studyGroups: { type: Boolean, default: true },
  },

  // Timestamps
}, { timestamps: true });

// Compound indexes for common queries
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ department: 1, program: 1 });
userSchema.index({ points: -1 });

const User = mongoose.model('User', userSchema);
export default User;
