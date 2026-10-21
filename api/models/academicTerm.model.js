import mongoose from 'mongoose';
const { Schema } = mongoose;

const academicTermSchema = new Schema({
  name: { type: String, required: true, trim: true }, // e.g. "First Semester 2026/2027"
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  registrationOpen: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('AcademicTerm', academicTermSchema);
