import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Briefcase, User, Building2 } from 'lucide-react';

export function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'job-seeker' | 'company' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;

    localStorage.setItem('userRole', selectedRole);

    if (selectedRole === 'job-seeker') {
      navigate('/signup');
    } else {
      navigate('/company-signup');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IntriVue
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your role</h2>
          <p className="text-gray-600 text-lg">Select how you want to use IntriVue</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Job Seeker Card */}
          <button
            onClick={() => setSelectedRole('job-seeker')}
            className={`bg-white rounded-2xl shadow-lg p-8 text-left transition-all hover:shadow-xl ${
              selectedRole === 'job-seeker'
                ? 'ring-4 ring-blue-600 ring-offset-2'
                : 'hover:scale-105'
            }`}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Job Seeker</h3>
            <p className="text-gray-600 leading-relaxed">
              Discover and apply to jobs with a swipe. Build your profile and find your dream job.
            </p>
          </button>

          {/* Job Giver / Company Card */}
          <button
            onClick={() => setSelectedRole('company')}
            className={`bg-white rounded-2xl shadow-lg p-8 text-left transition-all hover:shadow-xl ${
              selectedRole === 'company'
                ? 'ring-4 ring-purple-600 ring-offset-2'
                : 'hover:scale-105'
            }`}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Job Giver / Company</h3>
            <p className="text-gray-600 leading-relaxed">
              Post job openings and connect with talented candidates looking for opportunities.
            </p>
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
            selectedRole
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
