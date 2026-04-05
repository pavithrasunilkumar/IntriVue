import { Target, Users, Zap, Heart, Mail, Linkedin, Twitter } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-12 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-4">About IntriVue</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Revolutionizing the job search experience by making it as simple and intuitive as a swipe.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                We believe finding the right job shouldn't be complicated. IntriVue combines cutting-edge 
                technology with an intuitive swipe interface to help job seekers discover opportunities 
                that truly match their skills and aspirations. Our AI-powered matching algorithm ensures 
                you see the most relevant positions first, saving you time and increasing your chances 
                of landing your dream job.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">People First</h3>
            <p className="text-gray-600">
              We prioritize the needs of job seekers and employers, creating meaningful connections 
              that benefit both parties.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
            <p className="text-gray-600">
              We leverage the latest technology to simplify the job search process and make it 
              more efficient than ever.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Passion</h3>
            <p className="text-gray-600">
              We're passionate about helping people find fulfilling careers and building the 
              future of work.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How IntriVue Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Create Your Profile</h3>
                <p className="text-gray-600">
                  Tell us about your skills, experience, and career goals so we can find the best matches for you.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Swipe Through Jobs</h3>
                <p className="text-gray-600">
                  Browse curated job listings with our intuitive swipe interface. Swipe right to apply, left to pass.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Get Matched</h3>
                <p className="text-gray-600">
                  Our AI analyzes your profile and shows you your match percentage for each position, helping you 
                  make informed decisions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Land Your Dream Job</h3>
                <p className="text-gray-600">
                  Connect with employers who are looking for someone with your exact skill set and start your new career.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:hello@intrivue.com"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              <Mail className="w-5 h-5" />
              hello@intrivue.com
            </a>
            <button className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </button>
            <button className="inline-flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
              <Twitter className="w-5 h-5" />
              Twitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
