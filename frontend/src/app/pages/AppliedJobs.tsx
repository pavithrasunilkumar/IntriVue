import { useEffect, useState } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import { Job } from '../components/JobCard';
import { fetchAppliedJobs } from '../api';

export function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppliedJobs()
      .then((data) => setAppliedJobs(data.jobs || []))
      .catch(() => setAppliedJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Applied Jobs
          </h1>
          {!loading && (
            <p className="text-gray-600 text-lg">
              You have applied to {appliedJobs.length} job{appliedJobs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appliedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Applications Yet</h2>
            <p className="text-gray-600">Start swiping right on jobs to see them here!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appliedJobs.map((job) => (
              <div key={String(job.id)} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h2>
                    <p className="text-lg text-gray-600 font-medium">{job.company}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                    {job.matchPercentage}% Match
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-blue-600" /><span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-5 h-5 text-green-600" /><span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-5 h-5 text-purple-600" /><span>{job.type}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" /><span>Applied recently</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
