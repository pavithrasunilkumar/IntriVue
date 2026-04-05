const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workExperienceSchema = new mongoose.Schema({
  jobTitle: String,
  company: String,
  duration: String,
});

const educationSchema = new mongoose.Schema({
  degree: String,
  university: String,
  graduationYear: String,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'company'], required: true },

  fullName: String,
  jobTitle: String,
  phone: String,
  location: String,
  yearsExperience: String,
  aboutMe: String,
  skills: [String],
  education: educationSchema,
  workExperience: [workExperienceSchema],
  certifications: [String],
  resumes: [String],
  resumeBase64: String,
  resumeFileName: String,
  resumeMimeType: String,

  companyName: String,
  industry: String,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);