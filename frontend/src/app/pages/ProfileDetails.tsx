import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Briefcase, User, Mail, Phone, MapPin, GraduationCap,
  FileText, Upload, X, Award, CheckCircle,
} from 'lucide-react';
import { register } from '../api';

export function ProfileDetails() {
  const navigate = useNavigate();
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const certificateFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '', title: '', email: '', phone: '', location: '',
    experience: '', about: '', education: '', university: '', graduationYear: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);
  const [uploadedCertificates, setUploadedCertificates] = useState<string[]>([]);
  const [workExperiences, setWorkExperiences] = useState<Array<{ jobTitle: string; company: string; duration: string }>>([]);
  const [currentWorkExp, setCurrentWorkExp] = useState({ jobTitle: '', company: '', duration: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeBase64, setResumeBase64] = useState('');
  const [resumeMimeType, setResumeMimeType] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');

  const handleInputChange = (field: string, value: string) => setFormData({ ...formData, [field]: value });

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()]);
        setCurrentSkill('');
      }
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter(sk => sk !== s));

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedResume(file.name);
    setResumeFileName(file.name);
    setResumeMimeType(file.type || 'application/pdf');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setResumeBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedCertificates([...uploadedCertificates, file.name]);
  };

  const removeCertificate = (i: number) => setUploadedCertificates(uploadedCertificates.filter((_, idx) => idx !== i));

  const handleAddWorkExp = () => {
    if (currentWorkExp.jobTitle.trim() && currentWorkExp.company.trim() && currentWorkExp.duration.trim()) {
      setWorkExperiences([...workExperiences, currentWorkExp]);
      setCurrentWorkExp({ jobTitle: '', company: '', duration: '' });
    }
  };

  const removeWorkExp = (i: number) => setWorkExperiences(workExperiences.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const basic = JSON.parse(sessionStorage.getItem('signupBasic') || '{}');
      if (!basic.username || !basic.email || !basic.password) {
        navigate('/signup');
        return;
      }

      await register({
        username: basic.username,
        email: basic.email,
        password: basic.password,
        role: 'jobseeker',
        fullName: formData.name,
        jobTitle: formData.title,
        phone: formData.phone,
        location: formData.location,
        yearsExperience: formData.experience,
        aboutMe: formData.about,
        skills,
        education: {
          degree: formData.education,
          university: formData.university,
          graduationYear: formData.graduationYear,
        },
        workExperience: workExperiences,
        certifications: uploadedCertificates,
        resumeBase64,
        resumeFileName,
        resumeMimeType,
      });

      sessionStorage.removeItem('signupBasic');
      navigate('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">IntriVue</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 text-lg">Tell us more about yourself</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" /> Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Job Title</label>
                <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Software Developer" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="john@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mobile No</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="+1 (555) 123-4567" required />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="San Francisco, CA" required />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Years of Experience</label>
                <input type="text" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="5+ years" required />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-gray-700 font-medium mb-2">About Me</label>
              <textarea value={formData.about} onChange={(e) => handleInputChange('about', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[120px]"
                placeholder="Tell us about yourself..." required />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" /> Skills
            </h3>
            <input type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="e.g., React, TypeScript, Node.js (Press Enter to add)" />
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((skill) => (
                  <span key={skill} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" /> Education
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Degree</label>
                <input type="text" value={formData.education} onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Bachelor of Science in Computer Science" required />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">University</label>
                  <input type="text" value={formData.university} onChange={(e) => handleInputChange('university', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Stanford University" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Graduation Year</label>
                  <input type="text" value={formData.graduationYear} onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="2020" required />
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" /> Work Experiences
            </h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Job Title</label>
                <input type="text" value={currentWorkExp.jobTitle} onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, jobTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Company</label>
                <input type="text" value={currentWorkExp.company} onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., Tech Solutions Inc." />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Duration</label>
                <input type="text" value={currentWorkExp.duration} onChange={(e) => setCurrentWorkExp({ ...currentWorkExp, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., 2020 - Present" />
              </div>
              <button type="button" onClick={handleAddWorkExp}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                <Upload className="w-5 h-5" /> Add Work Experience
              </button>
            </div>
            {workExperiences.length > 0 && (
              <div className="space-y-3">
                {workExperiences.map((exp, index) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{exp.jobTitle}</h4>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      </div>
                      <button type="button" onClick={() => removeWorkExp(index)} className="p-1 hover:bg-blue-200 rounded transition-colors">
                        <X className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" /> Resume
            </h3>
            <input ref={resumeFileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
            {uploadedResume && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" /><span>Uploaded: {uploadedResume}</span>
              </div>
            )}
            <button type="button" onClick={() => resumeFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <Upload className="w-5 h-5" /> Upload Resume (PDF/DOC)
            </button>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" /> Certificates (Optional)
            </h3>
            <input ref={certificateFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertificateUpload} className="hidden" />
            {uploadedCertificates.length > 0 && (
              <div className="mb-4 space-y-2">
                {uploadedCertificates.map((cert, index) => (
                  <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-700"><CheckCircle className="w-5 h-5" /><span>{cert}</span></div>
                    <button type="button" onClick={() => removeCertificate(index)} className="p-1 hover:bg-purple-200 rounded transition-colors">
                      <X className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => certificateFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <Upload className="w-5 h-5" /> Add Certificate
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-shadow disabled:opacity-60">
            {loading ? 'Creating Account...' : 'Complete Profile & Start Swiping'}
          </button>
        </form>
      </div>
    </div>
  );
}