import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface EmailVerificationPopupProps {
  onClose: () => void;
}

const EmailVerificationPopup: React.FC<EmailVerificationPopupProps> = ({ onClose }) => {
  const { user, resendVerificationEmail } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyEmail = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await resendVerificationEmail();
      showSuccess(
        'Email Sent',
        'Verification email has been sent. Please check your inbox.',
        6000
      );
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      showError(
        'Verification Failed',
        'Failed to send verification email. Please try again.',
        6000
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show popup if user is not loaded or email is verified
  if (!user || user.emailVerified === true) {
    console.log('EmailVerificationPopup: Not showing popup. User:', user?.userId, 'EmailVerified:', user?.emailVerified);
    return null;
  }

  console.log('EmailVerificationPopup: Showing popup. User:', user?.userId, 'EmailVerified:', user?.emailVerified);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Verify email to unlock all features
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVerifyEmail}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {isLoading ? 'Sending...' : 'Verify Email'}
            </button>
            <button
              onClick={onClose}
              className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPopup;
