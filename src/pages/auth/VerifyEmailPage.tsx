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

  // Get token from URL params or userId from location state or current user
  const token = searchParams.get('token');
  const userId = location.state?.userId || user?.userId;

  // Helper function to retry user data refresh until email is verified
  const refreshUserDataUntilVerified = async (maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Refreshing user data (attempt ${i + 1}/${maxRetries})...`);
        await refreshUserData();
        
        // Wait a moment for the context to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if user data was refreshed and email is now verified
        const currentUser = await authService.getCurrentUser();
        console.log('Current user data after refresh:', currentUser);
        
        if (currentUser && currentUser.emailVerified === true) {
          console.log('Email verification confirmed in user data');
          return true;
        } else {
          console.log(`Email not yet verified (attempt ${i + 1}), current status:`, currentUser?.emailVerified);
        }
        
        // Wait before next retry
        if (i < maxRetries - 1) {
          console.log(`Waiting 1.5 seconds before retry ${i + 2}...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`Error refreshing user data (attempt ${i + 1}):`, error);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }
    console.log('Max retries reached, email verification status may not be updated yet');
    return false;
  };
  
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

  // Handle token verification
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        setLoading(true);
        try {
          console.log('Starting email verification with token:', token);
          await authService.verifyEmail(token);
          console.log('Email verification API call successful');
          
          // Wait a bit for the backend to fully process the verification
          console.log('Waiting for backend to process verification...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Refresh user data with retry logic to ensure verification is reflected
          console.log('Starting user data refresh with retry logic...');
          const verificationConfirmed = await refreshUserDataUntilVerified();
          
          if (verificationConfirmed) {
            console.log('Email verification successfully confirmed in user data');
            setVerificationStatus('success');
            showSuccess('Email Verified', 'Your email has been verified successfully!');
          } else {
            console.warn('Email verification may not be fully reflected in user data yet');
            // Still show success but mention data sync
            setVerificationStatus('success');
            showSuccess('Email Verified', 'Your email has been verified successfully!');
          }
          
        } catch (error: any) {
          console.error('Error verifying email:', error);
          setVerificationStatus('error');
          showError('Verification Failed', 'Invalid or expired verification token.');
        } finally {
          setLoading(false);
        }
      } else if (!userId && !token) {
        // Only redirect to login if there's no token and no userId
        navigate('/login');
      }
    };

    verifyToken();
  }, [token, userId, navigate, showSuccess, showError, refreshUserData]);

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
