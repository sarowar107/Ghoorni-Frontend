import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Convert Google Drive link to embeddable format
const videoId = "1ExT7xqVSRkttdhu_KJFcskaVz3PGf3Q_";
const embedLink = `https://drive.google.com/file/d/${videoId}/preview`;
const universityPortalLink = "https://course.cuet.ac.bd/result_published.php";

const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-200"
              aria-label="Close video"
            >
              <X size={20} />
            </button>

            {/* Video Section - Much Larger */}
            <div className="w-full aspect-video bg-black">
              <iframe
                src={embedLink}
                title="How to Use CGPA Calculator"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Single Link Below */}
            <div className="p-6">
              <a 
                href={universityPortalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
              >
                <span>Visit University Portal</span>
                <ExternalLink size={18} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HowToUseModal;