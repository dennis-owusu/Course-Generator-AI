import mongoose from 'mongoose';
const { Schema } = mongoose;

const auditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true }, // e.g. 'user.login', 'grade.updated'
  resource: { type: String, required: true }, // model name or route
  resourceId: { type: Schema.Types.Mixed },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
