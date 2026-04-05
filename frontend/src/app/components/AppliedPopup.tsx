import { motion } from 'motion/react';
import { CheckCircle2, X, FileText } from 'lucide-react';
import { useEffect } from 'react';

interface AppliedPopupProps {
  jobTitle: string;
  company: string;
  onClose: () => void;
}

export function AppliedPopup({ jobTitle, company, onClose }: AppliedPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 15, stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Applied Successfully!
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <p className="font-semibold text-gray-900 text-lg">{jobTitle}</p>
            <p className="text-gray-600">{company}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <FileText className="w-5 h-5" />
            <p className="font-medium">Submitted with your resume</p>
          </div>

          <p className="text-sm text-gray-500">
            Good luck! The employer will review your application soon.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}