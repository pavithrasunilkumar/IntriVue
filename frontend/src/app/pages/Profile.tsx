import { useState, useEffect, useRef } from 'react';
import {
  Mail, Phone, MapPin, Briefcase, Award, GraduationCap, FileText,
  Upload, Edit2, Save, X, CheckCircle, Flame, User,
} from 'lucide-react';
import { getCurrentUser, saveProfile } from '../api';

interface WorkExperience { jobTitle: string; company: string; duration: string; }

export function Profile() {
  const rawUser = getCurrentUser();

  const [profileData, setProfileData] = useState({
    name: rawUser?.fullName || '',
    title: rawUser?.jobTitle || '',
    email: rawUser?.email || '',
    phone: rawUser?.phone || '',
    location: rawUser?.location || '',
    experience: rawUser?.yearsExperience || '',
    about: rawUser?.aboutMe || '',
    education: rawUser?.education?.degree || '',
    university: rawUser?.education?.university || '',
    graduationYear: rawUser?.education?.graduationYear || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);
  const [uploadedResume, setUploadedResume] = useState<string | null>(rawUser?.resumeFileName || null);
  const [uploadedCertificates, setUploadedCertificates] = useState<string[]>(rawUser?.certifications || []);
  const [streak, setStreak] = useState(parseInt(localStorage.getItem('streak') || '0'));
  const [skills, setSkills] = useState<string[]>(rawUser?.skills || []);
  const [editedSkills, setEditedSkills] = useState<string[]>(rawUser?.skills || []);
  const [currentSkill, setCurrentSkill] = useState('');
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(rawUser?.workExperience || []);
  const [editedWorkExp, setEditedWorkExp] = useState<WorkExperience[]>(rawUser?.workExperience || []);
  const [currentWorkExpJobTitle, setCurrentWorkExpJobTitle] = useState('');
  const [currentWorkExpCompany, setCurrentWorkExpCompany] = useState('');
  const [currentWorkExpDuration, setCurrentWorkExpDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const certificateFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedStreak = localStorage.getItem('streak');
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData(profileData);
      setEditedSkills(skills);
      setEditedWorkExp(workExperiences);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await saveProfile({
        fullName: editedData.name,
        jobTitle: editedData.title,
        phone: editedData.phone,
        location: editedData.location,
        yearsExperience: editedData.experience,
        aboutMe: editedData.about,
        skills: editedSkills,
        education: {
          degree: editedData.education,
          university: editedData.university,
          graduationYear: editedData.graduationYear,
        },
        workExperience: editedWorkExp,
        certifications: uploadedCertificates,
      });
      if (updated?.user) {
        localStorage.setItem('userData', JSON.stringify(updated.user));
      }
      setProfileData(editedData);
      setSkills(editedSkills);
      setWorkExperiences(editedWorkExp);
      setIsEditing(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !editedSkills.includes(currentSkill.trim())) {
      setEditedSkills([...editedSkills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (s: string) => setEditedSkills(editedSkills.filter(sk => sk !== s));

  const handleAddWorkExp = () => {
    if (currentWorkExpJobTitle.trim() && currentWorkExpCompany.trim() && currentWorkExpDuration.trim()) {
      setEditedWorkExp([...editedWorkExp, {
        jobTitle: currentWorkExpJobTitle,
        company: currentWorkExpCompany,
        duration: currentWorkExpDuration,
      }]);
      setCurrentWorkExpJobTitle('');
      setCurrentWorkExpCompany('');
      setCurrentWorkExpDuration('');
    }
  };

  const removeWorkExp = (i: number) => setEditedWorkExp(editedWorkExp.filter((_, idx) => idx !== i));

  const handleInputChange = (field: string, value: string) =>
    setEditedData(prev => ({ ...prev, [field]: value }));

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedResume(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const updated = await saveProfile({
          resumeBase64: base64,
          resumeFileName: file.name,
          resumeMimeType: file.type || 'application/pdf',
        });
        if (updated?.user) {
          localStorage.setItem('userData', JSON.stringify(updated.user));
        }
      } catch {
        // silent
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedCertificates(prev => [...prev, file.name]);
  };

  const removeCertificate = (i: number) =>
    setUploadedCertificates(prev => prev.filter((_, idx) => idx !== i));

  const inp = 'border-b border-gray-300 focus:outline-none flex-1';

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6 flex-1">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-12 h-12" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input type="text" value={editedData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-3xl font-bold text-gray-900 mb-2 border-b-2 border-blue-600 focus:outline-none w-full" />
                      <input type="text" value={editedData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="text-xl text-gray-600 mb-4 border-b border-gray-300 focus:outline-none w-full" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name || 'Your Name'}</h1>
                      <p className="text-xl text-gray-600 mb-4">{profileData.title || 'Job Title'}</p>
                    </>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-blue-600" />
                      {isEditing
                        ? <input type="email" value={editedData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inp} />
                        : <span className="text-[15px]">{profileData.email}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-blue-600" />
                      {isEditing
                        ? <input type="tel" value={editedData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={inp} />
                        : <span className="text-[15px]">{profileData.phone}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {isEditing
                        ? <input type="text" value={editedData.location} onChange={(e) => handleInputChange('location', e.target.value)} className={inp} />
                        : <span className="text-[15px]">{profileData.location}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      {isEditing
                        ? <input type="text" value={editedData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} className={inp} />
                        : <span className="text-[15px]">{profileData.experience}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                  <Flame className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-blue-700">{streak} day streak</span>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="p-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-60">
                      <Save className="w-5 h-5" />
                    </button>
                    <button onClick={handleEditToggle}
                      className="p-2 bg-gray-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleEditToggle}
                    className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
            {isEditing
              ? <textarea value={editedData.about} onChange={(e) => handleInputChange('about', e.target.value)}
                  className="w-full text-gray-600 leading-relaxed border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-600 min-h-[120px]" />
              : <p className="text-gray-600 leading-relaxed">{profileData.about || 'Add a description about yourself.'}</p>}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" /> Skills
            </h2>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Type a skill and press Enter" />
                  <button type="button" onClick={handleAddSkill}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedSkills.map((skill) => (
                    <span key={skill} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? skills.map((skill) => (
                  <span key={skill} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                    {skill}
                  </span>
                )) : <p className="text-gray-500">No skills added yet</p>}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" /> Education
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Degree</label>
                  <input type="text" value={editedData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Bachelor of Science..." />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">University</label>
                  <input type="text" value={editedData.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Stanford University" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Graduation Year</label>
                  <input type="text" value={editedData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="2020" />
                </div>
              </div>
            ) : (
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900">{profileData.education || 'Degree'}</h3>
                <p className="text-gray-600">{profileData.university || 'University'}</p>
                <p className="text-sm text-gray-500">{profileData.graduationYear || 'Year'}</p>
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" /> Certificates
            </h2>
            <input ref={certificateFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleCertificateUpload} className="hidden" />
            {uploadedCertificates.length > 0 && (
              <div className="mb-4 space-y-2">
                {uploadedCertificates.map((cert, index) => (
                  <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-700">
                      <CheckCircle className="w-5 h-5" /><span>{cert}</span>
                    </div>
                    <button onClick={() => removeCertificate(index)}
                      className="p-1 hover:bg-purple-200 rounded transition-colors">
                      <X className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => certificateFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <Upload className="w-5 h-5" /> Add Certificate
            </button>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" /> Work Experience
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Job Title</label>
                    <input type="text" value={currentWorkExpJobTitle}
                      onChange={(e) => setCurrentWorkExpJobTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Senior Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Company</label>
                    <input type="text" value={currentWorkExpCompany}
                      onChange={(e) => setCurrentWorkExpCompany(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Tech Solutions Inc." />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Duration</label>
                    <input type="text" value={currentWorkExpDuration}
                      onChange={(e) => setCurrentWorkExpDuration(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="2020 - Present" />
                  </div>
                  <button type="button" onClick={handleAddWorkExp}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                    <Upload className="w-5 h-5" /> Add Work Experience
                  </button>
                </div>
                {editedWorkExp.map((exp, index) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{exp.jobTitle}</h4>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      </div>
                      <button type="button" onClick={() => removeWorkExp(index)}
                        className="p-1 hover:bg-blue-200 rounded transition-colors">
                        <X className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {workExperiences.length > 0 ? workExperiences.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4">
                    <h3 className="font-bold text-gray-900 text-lg">{exp.jobTitle}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                  </div>
                )) : <p className="text-gray-500">No work experience added yet</p>}
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" /> Resume
            </h2>
            <input ref={resumeFileInputRef} type="file" accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload} className="hidden" />
            {uploadedResume && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>Uploaded: {uploadedResume}</span>
              </div>
            )}
            <button onClick={() => resumeFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <Upload className="w-5 h-5" /> Upload Resume (PDF/DOC)
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}