import { useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'motion/react';
import { Briefcase, MapPin, DollarSign, Clock, Building2, X, Heart } from 'lucide-react';

export interface Job {
  id: number | string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
  matchPercentage: number;
}

interface JobCardProps {
  job: Job;
  onSwipe: (direction: 'left' | 'right') => void;
}

export function JobCard({ job, onSwipe }: JobCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const applyOpacity = useTransform(x, [0, 100], [0, 1]);
  const rejectOpacity = useTransform(x, [-100, 0], [1, 0]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0.3, 1, 1, 1, 0.3]);

  const constraintsRef = useRef(null);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 120) {
      onSwipe('right');
    } else if (info.offset.x < -120) {
      onSwipe('left');
    }
  };

  return (
    <div ref={constraintsRef} className="absolute inset-0">
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity: cardOpacity }}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 1.02 }}
      >
        {/* APPLY stamp */}
        <motion.div
          style={{ opacity: applyOpacity }}
          className="absolute top-10 right-8 z-20 bg-green-500 text-white px-5 py-2 rounded-xl font-black text-2xl border-4 border-green-400 rotate-12 shadow-xl pointer-events-none select-none"
        >
          <Heart className="w-6 h-6 inline mr-1 mb-1" />
          APPLY
        </motion.div>

        {/* REJECT stamp */}
        <motion.div
          style={{ opacity: rejectOpacity }}
          className="absolute top-10 left-8 z-20 bg-red-500 text-white px-5 py-2 rounded-xl font-black text-2xl border-4 border-red-400 -rotate-12 shadow-xl pointer-events-none select-none"
        >
          <X className="w-6 h-6 inline mr-1 mb-1" />
          NOPE
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl h-full overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex-shrink-0">
            <h2 className="text-2xl font-bold mb-1">{job.title}</h2>
            <div className="flex items-center gap-2 text-blue-100 mb-4">
              <Building2 className="w-4 h-4" />
              <span className="text-lg">{job.company}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Profile Match</span>
                <span className="text-xl font-black">{job.matchPercentage}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${job.matchPercentage}%` }}
                />
              </div>
              <p className="text-xs mt-2 text-blue-100">
                {job.matchPercentage >= 80
                  ? '🔥 Excellent match — High chance of selection!'
                  : job.matchPercentage >= 60
                  ? '✅ Good match — Strong candidate'
                  : job.matchPercentage >= 40
                  ? '👍 Fair match — Consider applying'
                  : '📚 Low match — May need more qualifications'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm">{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{job.salary}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm">{job.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Briefcase className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm">Full Benefits</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">About the Role</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Requirements</h3>
                <ul className="space-y-1">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits?.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
            <p className="text-center text-gray-400 text-xs">
              ← Drag left to skip &nbsp;|&nbsp; Drag right to apply →
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}