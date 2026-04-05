import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, MapPin, Briefcase, CheckCircle, ChevronDown, ChevronUp,
  Users, Download, Mail, Phone, Award, GraduationCap, Loader2, XCircle
} from 'lucide-react';
import { fetchCompanyJobs, fetchJobApplicants, closeJob } from '../api';

interface PostedJob {
  _id: string;
  title: string;
  location: string;
  description: string;
  status: string;
  skills?: string[];
  salary?: string;
}

interface Applicant {
  applicationId: string;
  appliedAt: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  about: string;
  education: { degree?: string; university?: string; graduationYear?: string };
  workExperience: { jobTitle: string; company: string; duration: string }[];
  resumeBase64: string;
  resumeFileName: string;
  resumeMimeType: string;
}

function generateResumePDF(applicant: Applicant, _jobTitle: string) {
  if (applicant.resumeBase64) {
    const byteChars = atob(applicant.resumeBase64);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArr[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArr], { type: applicant.resumeMimeType || 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = applicant.resumeFileName || `${applicant.name}_Resume.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    alert(`${applicant.name} did not upload a resume file.`);
  }
}

function ApplicantCard({ applicant, jobTitle }: { applicant: Applicant; jobTitle: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {applicant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{applicant.name}</h4>
              <p className="text-sm text-gray-500">
                Applied {new Date(applicant.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>{applicant.email}</span>
            </div>
            {applicant.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>{applicant.phone}</span>
              </div>
            )}
            {applicant.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{applicant.location}</span>
              </div>
            )}
            {applicant.experience && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span>{applicant.experience} experience</span>
              </div>
            )}
          </div>

          {applicant.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {applicant.skills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {(applicant.education?.degree || applicant.education?.university) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <GraduationCap className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>
                {applicant.education.degree}
                {applicant.education.university && ` — ${applicant.education.university}`}
                {applicant.education.graduationYear && ` (${applicant.education.graduationYear})`}
              </span>
            </div>
          )}

          {applicant.workExperience?.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>
                {applicant.workExperience.map(w => `${w.jobTitle} at ${w.company}`).join(' · ')}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => generateResumePDF(applicant, jobTitle)}
          className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-shadow"
        >
          <Download className="w-4 h-4" />
          Resume
        </button>
      </div>
    </div>
  );
}

function JobRow({ job, onClose }: { job: PostedJob; onClose: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  const isClosed = job.status === 'Closed';

  const handleExpand = async () => {
    const opening = !expanded;
    setExpanded(opening);
    if (opening && !loaded) {
      setLoadingApplicants(true);
      try {
        const data = await fetchJobApplicants(job._id);
        setApplicants(data.applicants || []);
        setLoaded(true);
      } catch {
        setApplicants([]);
      } finally {
        setLoadingApplicants(false);
      }
    }
  };

  const handleClose = async () => {
    if (!confirm(`Close "${job.title}"? It will be removed from job seeker swipe cards.`)) return;
    setClosing(true);
    try {
      await closeJob(job._id);
      onClose(job._id);
    } catch {
      alert('Failed to close job. Please try again.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${isClosed ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>
      <div className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="w-4 h-4" /><span>{job.location}</span>
            </div>
            <p className="text-gray-600 line-clamp-2 text-sm mb-3">{job.description}</p>
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{skill}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              isClosed ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
            }`}>
              {isClosed ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {job.status || 'Active'}
            </span>

            <div className="flex gap-2">
              {!isClosed && (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {closing ? 'Closing…' : 'Close Job'}
                </button>
              )}
              <button
                onClick={handleExpand}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-purple-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                Applicants
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Applicants
            {loaded && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {applicants.length}
              </span>
            )}
          </h4>

          {loadingApplicants ? (
            <div className="flex items-center justify-center py-8 gap-3 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading applicants…</span>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applicants yet for this position.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map(applicant => (
                <ApplicantCard
                  key={applicant.applicationId}
                  applicant={applicant}
                  jobTitle={job.title}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CompanyDashboard() {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyJobs()
      .then(data => setPostedJobs(data.jobs || []))
      .catch(() => setPostedJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleJobClosed = (jobId: string) => {
    setPostedJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: 'Closed' } : j));
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Company Dashboard</h1>
            <p className="text-gray-600 text-lg">Manage your job postings and find the best talent</p>
          </div>

          <button
            onClick={() => navigate('/company/create-job')}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-shadow mb-8"
          >
            <Plus className="w-6 h-6" /> Create Job
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Posted Jobs</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : postedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-6">No jobs posted yet</p>
                <button
                  onClick={() => navigate('/company/create-job')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  <Plus className="w-5 h-5" /> Post Your First Job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {postedJobs.map(job => (
                  <JobRow key={job._id} job={job} onClose={handleJobClosed} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}