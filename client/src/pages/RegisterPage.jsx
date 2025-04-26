import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Button from '../components/Button';
import axios from 'axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'login_failed') {
      // Handle registration error (show error message to user)
      console.error('Registration failed');
    }

    // Check if we have a token in cookies
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/check', {
          withCredentials: true
        });
        if (response.data.authenticated) {
          // Redirect to the page they were trying to access or home
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [navigate, location]);

  const handleGoogleRegister = () => {
    // Redirect to backend Google OAuth endpoint with role=client
    window.location.href = 'http://localhost:3000/auth/google?role=client';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join LawConnect today</p>
          </div>

          <div className="space-y-6">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleGoogleRegister}
              className="flex items-center justify-center space-x-2"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-600 text-sm">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;