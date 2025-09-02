import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show success message if coming from signup
  React.useEffect(() => {
    if (location.state?.message) {
      showSuccess('Account Created', location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, showSuccess, navigate, location.pathname]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const userId = formData.get('userId')?.toString() || '';
      const password = formData.get('password')?.toString() || '';

      await login(userId, password);
      showSuccess('Login Successful', 'Welcome back!');
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle email verification error
      if (err.response?.needsEmailVerification) {
        showError('Email Not Verified', 'Please verify your email to continue');
        navigate('/verify-email', { state: { userId: err.response.userId } });
        return;
      }

      // Get error message from response - safer error message extraction
      let errorMessage = 'An error occurred during login. Please try again.';
      
      try {
        if (err.response?.data) {
          // Backend returns LoginResponse object with errorMessage field
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.errorMessage) {
            errorMessage = err.response.data.errorMessage;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            // Fallback to status-based message
            if (err.response.status === 401) {
              errorMessage = 'Invalid username or password. Please try again.';
            }
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      } catch (parseError) {
        console.error('Error parsing login error response:', parseError);
        errorMessage = 'An unexpected error occurred during login. Please try again.';
      }
      
      // Set local error for immediate display
      setError(errorMessage);
      
      // Show toast notification with the specific error from backend
      showError('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | ghoorni</title>
      </Helmet>
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 animate-fade-in">
        <div className="text-center">
          <img src="/ghoorni-logo.png" alt="ghoorni Logo" className="w-20 h-20 mx-auto" />
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Sign in to continue to ghoorni
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">User ID</label>
            <input 
              id="userId" 
              name="userId" 
              type="text" 
              placeholder="Student or Teacher ID" 
              required 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-dark-border border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Enter your password"
              required 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-dark-border border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" 
            />
          </div>
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cuet-primary-900 hover:bg-cuet-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cuet-primary-500 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-dark-text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-cuet-primary-800 hover:text-cuet-primary-700 dark:text-cuet-primary-400 dark:hover:text-cuet-primary-300">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;
