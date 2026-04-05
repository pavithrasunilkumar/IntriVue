import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { JobCard, Job } from '../components/JobCard';
import { AppliedPopup } from '../components/AppliedPopup';
import { RotateCcw, X, Heart } from 'lucide-react';
import { fetchJobs, applyToJob } from '../api';

export function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAppliedPopup, setShowAppliedPopup] = useState(false);
  const [appliedJob, setAppliedJob] = useState<Job | null>(null);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJobs();
      setAllJobs(data.jobs || []);
      setCurrentIndex(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const last = localStorage.getItem('lastSwipeDate');
    const streak = parseInt(localStorage.getItem('streak') || '0');
    if (last !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      localStorage.setItem('streak', last === yesterday.toDateString() ? String(streak + 1) : '1');
      localStorage.setItem('lastSwipeDate', today);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const job = allJobs[currentIndex];
    if (!job) return;

    setSwipeDir(direction);
    updateStreak();

    if (direction === 'right') {
      try { await applyToJob(String(job.id)); } catch { /* silent */ }
      setAppliedJob(job);
      setShowAppliedPopup(true);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDir(null);
    }, 350);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowAppliedPopup(false);
    setAppliedJob(null);
    loadJobs();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading jobs…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Could not load jobs</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadJobs}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
            <RotateCcw className="w-5 h-5" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentJob = allJobs[currentIndex];
  const nextJob = allJobs[currentIndex + 1];
  const done = currentIndex >= allJobs.length;

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">All Caught Up!</h2>
          <p className="text-gray-600 mb-8 text-lg">You've reviewed all {allJobs.length} available jobs.</p>
          <button onClick={handleReset}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
            <RotateCcw className="w-5 h-5" /> Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">

        <div className="relative w-full max-w-lg" style={{ height: '560px' }}>

          {nextJob && (
            <div className="absolute inset-0 scale-95 translate-y-3 rounded-2xl bg-white shadow-lg opacity-60 pointer-events-none" />
          )}

          <AnimatePresence mode="wait">
            {currentJob && !swipeDir && (
              <motion.div
                key={String(currentJob.id)}
                className="absolute inset-0"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <JobCard job={currentJob} onSwipe={handleSwipe} />
              </motion.div>
            )}

            {currentJob && swipeDir && (
              <motion.div
                key={String(currentJob.id) + '-exit'}
                className="absolute inset-0 pointer-events-none"
                initial={{ x: 0, rotate: 0, opacity: 1 }}
                animate={{
                  x: swipeDir === 'right' ? 700 : -700,
                  rotate: swipeDir === 'right' ? 30 : -30,
                  opacity: 0,
                }}
                transition={{ duration: 0.35, ease: 'easeIn' }}
              >
                <JobCard job={currentJob} onSwipe={() => {}} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-red-200 flex items-center justify-center hover:scale-110 hover:border-red-400 transition-all active:scale-95"
            title="Skip"
          >
            <X className="w-7 h-7 text-red-500" />
          </button>

          <span className="text-sm text-gray-400 font-medium">
            {currentIndex + 1} / {allJobs.length}
          </span>

          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-green-200 flex items-center justify-center hover:scale-110 hover:border-green-400 transition-all active:scale-95"
            title="Apply"
          >
            <Heart className="w-7 h-7 text-green-500" />
          </button>
        </div>

      </main>

      <AnimatePresence>
        {showAppliedPopup && appliedJob && (
          <AppliedPopup
            jobTitle={appliedJob.title}
            company={appliedJob.company}
            onClose={() => setShowAppliedPopup(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}