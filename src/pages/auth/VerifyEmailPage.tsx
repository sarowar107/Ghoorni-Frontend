import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import authService from '../../services/authService';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Get userId from location state
  const userId = location.state?.userId;
  
  const handleResendEmail = async () => {
    if (!userId) {
      showError('Error', 'User ID not found');
      return;
    }

    setLoading(true);
    try {
      await authService.resendVerification(userId);
      showSuccess('Email Sent', 'Verification email has been resent. Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      showError('Error', error.response?.data || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  // If no userId is present, redirect to login
  React.useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  return (
    <>
      <Helmet>
        <title>Verify Email | ghoorni</title>
      </Helmet>
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-cuet-primary-50 dark:bg-cuet-primary-900/20 flex items-center justify-center rounded-full">
            <MailCheck className="w-8 h-8 text-cuet-primary-600 dark:text-cuet-primary-400" />
          </div>
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            We've sent you a verification email. Please check your inbox and click the verification link.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
            Didn't receive the email? Check your spam folder or click below to resend.
          </p>
          
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cuet-primary-900 hover:bg-cuet-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cuet-primary-500 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              <>
                <MailCheck size={20} />
                Resend Verification Email
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
