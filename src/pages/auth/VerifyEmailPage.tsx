import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { MailCheck, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { refreshUserData, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);
  const [lastEmailSentTime, setLastEmailSentTime] = useState<number>(0);

  // Get token from URL params or userId from location state or current user
  const token = searchParams.get('token');
  const userId = location.state?.userId || user?.userId;

  // Simplified verification function - no complex retry logic
  const performVerification = async (token: string) => {
    try {
      console.log('Starting email verification with token:', token);
      await authService.verifyEmail(token);
      console.log('Email verification API call successful');
      
      // Simple refresh of user data without dependency issues
      try {
        await refreshUserData();
        console.log('User data refreshed successfully');
      } catch (refreshError) {
        console.warn('Failed to refresh user data, but verification succeeded:', refreshError);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error verifying email:', error);
      return { success: false, error };
    }
  };
  
  const handleResendEmail = async () => {
    if (!userId) {
      showError('Error', 'User ID not found');
      return;
    }

    // Prevent rapid duplicate calls (within 5 seconds)
    const now = Date.now();
    if (now - lastEmailSentTime < 5000) {
      console.log('Email resend request ignored - too soon after last send');
      showError('Too Fast', 'Please wait a moment before requesting another email.');
      return;
    }

    setLoading(true);
    setLastEmailSentTime(now);
    
    try {
      await authService.resendVerification(userId);
      showSuccess('Email Sent', 'Verification email has been resent. Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      // Reset the timestamp on error so user can retry
      setLastEmailSentTime(0);
      showError('Error', error.response?.data || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  // Handle token verification - only run once
  useEffect(() => {
    const verifyToken = async () => {
      // Prevent multiple executions
      if (hasAttemptedVerification) {
        console.log('Verification already attempted, skipping...');
        return;
      }

      if (token) {
        console.log('Attempting email verification for the first time');
        setHasAttemptedVerification(true);
        setLoading(true);
        
        const result = await performVerification(token);
        
        if (result.success) {
          setVerificationStatus('success');
          showSuccess('Email Verified', 'Your email has been verified successfully!');
        } else {
          setVerificationStatus('error');
          showError('Verification Failed', 'Invalid or expired verification token.');
        }
        
        setLoading(false);
      } else if (!userId && !token) {
        // Only redirect to login if there's no token and no userId
        navigate('/login');
      }
    };

    verifyToken();
  }, [token, userId, navigate]); // Removed refreshUserData from dependencies

  // Show different content based on verification status
  const renderContent = () => {
    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/20 flex items-center justify-center rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-white">
            Email Verified Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Your email has been verified successfully. Your account is now fully activated.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 bg-cuet-primary-900 text-white rounded-lg hover:bg-cuet-primary-800 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 flex items-center justify-center rounded-full">
            <MailCheck className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-white">
            Verification Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Invalid or expired verification token. Please try again.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cuet-primary-900 hover:bg-cuet-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cuet-primary-500 transition-all transform hover:scale-[1.02]"
          >
            Go to Login
          </button>
        </div>
      );
    }

    // Default content for pending verification or resend
    return (
      <>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-cuet-primary-50 dark:bg-cuet-primary-900/20 flex items-center justify-center rounded-full">
            <MailCheck className="w-8 h-8 text-cuet-primary-600 dark:text-cuet-primary-400" />
          </div>
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-white">
            {loading ? 'Verifying...' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            {loading ? 'Please wait while we verify your email...' : "We've sent you a verification email. Please check your inbox and click the verification link."}
          </p>
        </div>

        {!loading && (
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
        )}
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>Verify Email | ghoorni</title>
      </Helmet>
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        {renderContent()}
      </div>
    </>
  );
};

export default VerifyEmailPage;
