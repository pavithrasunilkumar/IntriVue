const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  companyUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skills: [String],
  location: { type: String, required: true },
  salary: { type: String, default: 'Competitive' },
  type: { type: String, default: 'Full-time' },
  benefits: [String],
  status: { type: String, default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
