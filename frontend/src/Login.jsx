import React, { useState, useContext } from 'react';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth/authProvider';
import api from './api';
import LandingNavbar from './components/landing-navbar';
import { AppContext } from './contextprovider/appContext';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('faculty');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { checkAuth, login } = useContext(AuthContext);

  const getAuthState = async () => {
    try {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        setIsLoggedIn(true);
        navigate('/iqac-dashboard');
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, role });
      const result = await login(email, password, role);
      console.log('Login result:', result);
      
      if (result && result.success) {
        console.log('Login successful, user data:', result.user);
        setIsLoggedIn(true);
        
        // Check if user has the required role for the dashboard
        if (result.user && result.user.role === 'iqac') {
          console.log('User has iqac role, navigating to /iqac-dashboard');
          navigate('/iqac-dashboard', { replace: true });
        } else {
          console.log('User does not have iqac role, checking other roles');
          // Handle other roles here if needed
          setError('You do not have permission to access the dashboard');
        }
      } else {
        const errorMsg = result?.error || 'Invalid credentials';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-screen">
      <LandingNavbar />
      <div className="flex items-center justify-center min-h-[85vh] px-4">
        <div className="w-full max-w-md bg-white mt-15 rounded-xl shadow-lg p-8 mb-15">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#5D6096]">User Login</h2>
            <p className="text-gray-600 text-sm mt-1">
              Welcome back! Please enter your credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {/* Email */}
            <div >
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Email
              </label>
              <div className="flex items-center gap-3  border  rounded-md  bg-white">
                <Mail className="text-gray-400" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 "
              >
                Password
              </label>
              <div className="flex items-center gap-3 border  rounded-md  bg-white">
                <Lock className="text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium "
              >
                Role
              </label>
              <div className="flex items-center gap-3 border  rounded-md  bg-white">
                <FaUser className="text-gray-400" />
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white text-black outline-none text-sm"
                  required
                >
                  <option value="">Select role</option>
                  <option value="faculty">Faculty</option>
                  <option value="hod">HOD</option>
                  <option value="college_authority">College Authority</option>
                  <option value="iqac">IQAC</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 !bg-[#5D6096] hover:bg-[#4a4d7a] text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600 pt-3">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Register here
              </a>
            </p>

            {/* Footer */}
            <footer className="text-center text-gray-400 text-xs mt-6">
              &copy; {new Date().getFullYear()} NAAC DVV System. All rights reserved.
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
