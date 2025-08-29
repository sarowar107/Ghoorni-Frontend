import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const CRVerificationPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>CR Verification | ghoorni</title>
      </Helmet>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl dark:bg-dark-surface animate-fade-in">
        <div className="text-center">
          <img src="/ghoorni-logo.svg" alt="ghoorni Logo" className="w-16 h-16 mx-auto" />
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-white">
            CR Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Enter the verification code provided by the administrator.
          </p>
        </div>
        <form className="space-y-6">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Verification Code</label>
            <input id="verificationCode" name="verificationCode" type="text" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cuet-primary-500 focus:border-cuet-primary-500" />
          </div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cuet-primary-900 hover:bg-cuet-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cuet-primary-500 transition-colors">
            Verify Account
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-dark-text-secondary">
          <Link to="/login" className="font-medium text-cuet-primary-800 hover:text-cuet-primary-700 dark:text-cuet-primary-400 dark:hover:text-cuet-primary-300">
            Back to login
          </Link>
        </p>
      </div>
    </>
  );
};

export default CRVerificationPage;
