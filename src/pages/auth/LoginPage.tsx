import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const userId = formData.get('userId')?.toString() || '';
      const password = formData.get('password')?.toString() || '';

      await login(userId, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | ghoorni</title>
      </Helmet>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl dark:bg-dark-surface animate-fade-in">
        <div className="text-center">
          <img src="/ghoorni-logo.png" alt="ghoorni Logo" className="w-20 h-20 mx-auto" />
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-white">
            Sign in to ghoorni
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-cuet-primary-800 hover:text-cuet-primary-700 dark:text-cuet-primary-400 dark:hover:text-cuet-primary-300">
              Sign up
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">User ID</label>
            <input 
              id="userId" 
              name="userId" 
              type="text" 
              placeholder="Enter your Student ID or Teacher ID" 
              required 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Password</label>
            <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" />
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cuet-primary-900 hover:bg-cuet-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cuet-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Sign in'}
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
