const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appliedAt: { type: Date, default: Date.now },

  // Applicant profile snapshot
  applicantName: String,
  applicantEmail: String,
  applicantPhone: String,
  applicantLocation: String,
  applicantSkills: [String],
  applicantExperience: String,
  applicantAbout: String,
  applicantEducation: {
    degree: String,
    university: String,
    graduationYear: String,
  },
  applicantWorkExperience: [{
    jobTitle: String,
    company: String,
    duration: String,
  }],

  // Resume file
  resumeBase64: String,
  resumeFileName: String,
  resumeMimeType: String,
});

applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);