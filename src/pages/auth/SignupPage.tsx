import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

type Role = 'Student' | 'CR' | 'Teacher';

const departments = ['CSE', 'EEE', 'ME', 'CE', 'Arch', 'URP', 'MIE', 'PME', 'ECE'];
const batches = ['18', '19', '20', '21', '22', '23', '24'];

const SignupPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('Student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { signup } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      const userId = formData.get('userId')?.toString() || '';
      const email = formData.get('email')?.toString() || '';
      const password = formData.get('password')?.toString() || '';
      
      if (!userId) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }
      
      const userData = {
        userId: userId,
        name: formData.get('fullName')?.toString() || '',
        email: email,
        password: password,
        deptName: formData.get('department')?.toString() || '',
        batch: selectedRole !== 'Teacher' ? formData.get('batch')?.toString() || '' : null,
        role: selectedRole.toLowerCase() as 'student' | 'cr' | 'teacher'
      };
      
      if (selectedRole === 'CR') {
        const crVerificationCode = formData.get('crVerificationCode')?.toString();
        if (!crVerificationCode) {
          setError('CR Verification Code is required');
          setIsLoading(false);
          return;
        }
        
        // Here you would verify the CR verification code with your backend
        // For now, we'll just proceed with signup assuming verification succeeded
      }
      
      // Submit the form data using the auth context
      await signup(userData);
      
      // Show success toast
      showSuccess('Account Created Successfully!', 'Your account has been created. You can now log in.');
      
      // Redirect to login page on successful registration
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Get error message from response
      const errorMessage = err.response?.data || 'Failed to register. Please try again.';
      
      // Set local error for immediate display
      setError(errorMessage);
      
      // Show toast notification based on error type
      if (errorMessage.toLowerCase().includes('user id already exists') || 
          errorMessage.toLowerCase().includes('already exists')) {
        showError('User Already Exists', 'An account with this User ID already exists. Please use a different ID or try logging in.');
      } else if (errorMessage.toLowerCase().includes('email already exists') || 
                 errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
        showError('Email Already Registered', 'This email address is already registered. Please use a different email or try logging in.');
      } else {
        showError('Registration Failed', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | ghoorni</title>
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20"
      >
        <div className="text-center">
          <img src="/ghoorni-logo.png" alt="ghoorni Logo" className="w-20 h-20 mx-auto" />
          <h2 className="mt-4 text-3xl font-bold font-serif text-gray-900 dark:text-dark-text">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Join the CUET Portal community
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-dark-bg rounded-lg">
          {(['Student', 'CR', 'Teacher'] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={clsx(
                "px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-dark-bg",
                selectedRole === role ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-border'
              )}
            >
              {role}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField 
            label="User ID" 
            id="userId" 
            type="text" 
            placeholder={selectedRole === 'Teacher' ? "Enter your Teacher ID" : "Enter your Student ID"} 
          />
          <InputField label="Full Name" id="fullName" type="text" placeholder="Enter your full name" />
          <InputField label="Email Address" id="email" type="email" placeholder="your.email@cuet.ac.bd" />
          
          <div className="relative">
            <InputField label="Password" id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {selectedRole === 'Student' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4"
              >
                <SelectField label="Department" id="department" options={departments} />
                <SelectField label="Batch" id="batch" options={batches} />
              </motion.div>
            )}
            
            {selectedRole === 'CR' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4"
              >
                <SelectField label="Department" id="department" options={departments} />
                <SelectField label="Batch" id="batch" options={batches} />
                <InputField label="CR Verification Code" id="crVerificationCode" type="text" placeholder="Enter your CR verification code" />
              </motion.div>
            )}
            
            {selectedRole === 'Teacher' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-4"
              >
                <SelectField label="Department" id="department" options={departments} />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 dark:text-dark-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </>
  );
};

interface InputFieldProps {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  [key: string]: any;
}

const InputField = ({ label, id, ...props }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
    <input id={id} name={id} required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-dark-border dark:border-gray-600 dark:placeholder-gray-500 dark:text-white" {...props} />
  </div>
);

interface SelectFieldProps {
  label: string;
  id: string;
  options: string[];
  defaultValue?: string;
}

const SelectField = ({ label, id, options, defaultValue = "" }: SelectFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
    <div className="relative">
      <select 
        id={id} 
        name={id} 
        required 
        defaultValue={defaultValue}
        className="appearance-none mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-dark-border dark:border-gray-600 dark:text-white"
      >
        <option value="" disabled>Select {label}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

export default SignupPage;
