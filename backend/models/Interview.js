const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  accuracy:      { type: Number, default: 0 },
  technical:     { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  confidence:    { type: Number, default: 0 },
  overall:       { type: Number, default: 0 }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  question: String,
  type:     { type: String, enum: ['resume','job','skill_gap'] },
  answer:   { type: String, default: '' },
  scores:   { type: scoreSchema, default: () => ({}) }
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain:             { type: String, required: true },
  jobDescription:     { type: String, required: true },
  resumeText:         { type: String, default: '' },
  resumeSkills:       [String],
  jobSkills:          [String],
  skillGaps:          [String],
  questions:          [questionSchema],
  overallScore:       { type: Number, default: 0 },
  accuracyScore:      { type: Number, default: 0 },
  confidenceScore:    { type: Number, default: 0 },
  technicalScore:     { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  strengths:          [String],
  weaknesses:         [String],
  status:             { type: String, enum: ['setup','in_progress','completed'], default: 'setup' },
  createdAt:          { type: Date, default: Date.now },
  completedAt:        Date
});

module.exports = mongoose.model('Interview', interviewSchema);
