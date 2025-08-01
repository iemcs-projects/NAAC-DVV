import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth/authProvider';
import axiosInstance from './contextprovider/axios';

import {
  FaUser,
  FaCheckCircle,
  FaChevronDown,
  FaIdCard,
  FaBuilding,
  FaUniversity,
  FaEnvelope,
  FaMobileAlt,
  FaLock,
} from 'react-icons/fa';

import LandingNavbar from './components/landing-navbar';

const Register = () => {
  const [showIQACForm, setShowIQACForm] = useState(false);
  const navigate = useNavigate();
  const { login, setUserAfterRegistration } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'faculty',
    institutionName: '',
    institutionType: '',
    aisheId: '',
    institutionalEmail: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const institutionTypes = ['university', 'autonomous', 'affiliated UG', 'affiliated PG'];

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = ({ target: { name } }) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let msg = '';
    switch (name) {
      case 'name':
        if (!value.trim()) msg = 'Name is required';
        break;
      case 'email':
      case 'institutionalEmail':
        if (!value.trim()) msg = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = 'Enter a valid email';
        break;
      case 'password':
        if (!value.trim()) msg = 'Password is required';
        else if (value.length < 8) msg = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (value !== formData.password) msg = 'Passwords do not match';
        break;
      case 'role':
        if (!showIQACForm) {
          if (!value.trim()) msg = 'Role is required';
        }
        break;
      case 'institutionName':
        if (!value.trim()) msg = 'Institution name is required';
        break;
      case 'institutionType':
        if (!value.trim()) msg = 'Institution type is required';
        break;
      case 'aisheId':
        if (!value.trim()) msg = 'AISHE ID is required';
        else if (!/^[A-Z0-9-]+$/i.test(value)) msg = 'Invalid AISHE ID';
        break;
      case 'phoneNumber':
        if (!value.trim()) msg = 'Phone number is required';
        else if (!/^\+?[0-9]{10,15}$/.test(value)) msg = 'Enter a valid phone number';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: msg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Mark all touched and validate all fields on submit
    const newTouched = {};
    Object.keys(formData).forEach(key => {
      newTouched[key] = true;
      validateField(key, formData[key]);
    });
    setTouched(newTouched);

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) return;

    const submissionData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ...(showIQACForm && {
        institutionName: formData.institutionName,
        institutionType: formData.institutionType,
        aisheId: formData.aisheId,
        institutionalEmail: formData.institutionalEmail,
        phoneNumber: formData.phoneNumber,
      }),
    };

    setIsSubmitting(true);
    try {
      const endpoint = showIQACForm ? 'auth/iqacRegister' : 'auth/register';
      const response = await axiosInstance.post(endpoint, submissionData, { withCredentials: true });

      if (response.data.success) {
        if (showIQACForm) {
          // Set user data and wait for authentication to be properly set
          const success = await setUserAfterRegistration(response.data.data.iqac);
          if (success) {
            // Show success message before navigation
            setSuccessMessage('Registration successful! Redirecting to dashboard...');
            // Wait a moment to ensure authentication is properly set
            setTimeout(() => {
              navigate('/iqac-dashboard');
            }, 1000);
          } else {
            setErrors(prev => ({ ...prev, global: 'Failed to set user session' }));
          }
        } else {
          const loginSuccess = await login(
            submissionData.email, 
            submissionData.password,
            submissionData.role
          );
          
          if (loginSuccess) {
            setSuccessMessage('Registration successful! Redirecting to dashboard...');
            // Show success message for 1.5 seconds before redirecting
              navigate('/iqac-dashboard');
            } else {
            // For login failure case, show success message first then error
            setSuccessMessage('Registration successful!');
            setTimeout(() => {
              setErrors(prev => ({ ...prev, global: 'Login failed. Please log in manually.' }));
            }, 1000);
          }
        }
      } else {
        setErrors(prev => ({ ...prev, global: response.data.message || 'Registration failed' }));
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred during registration.';
      setErrors(prev => ({ ...prev, global: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <LandingNavbar />
      <div className="flex-1 mt-15 flex items-center justify-center p-4">
        <div className="w-full max-w-md !bg-white rounded-xl shadow-lg p-8 mb-15">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#5D6096]">
              {showIQACForm ? 'IQAC Supervisor Registration' : 'Create an Account'}
            </h2>
            <p className="!text-gray-600 !bg-white text-sm mt-1">
              {showIQACForm ? 'Register as an IQAC Supervisor' : 'Join us today to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
                Full Name
              </label>
              <div className="flex items-center gap-3 border rounded-md bg-white">
                <FaUser className="text-gray-400 ml-3" size={18} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <div className="flex items-center gap-3 border rounded-md bg-white">
                <FaEnvelope className="text-gray-400 ml-3" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center gap-3 border rounded-md bg-white">
                <FaLock className="text-gray-400 ml-3" size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="flex items-center gap-3 border rounded-md bg-white">
                <FaLock className="text-gray-400 ml-3" size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {!showIQACForm && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="flex items-center gap-3 border rounded-md bg-white">
                  <FaUser className="text-gray-400 ml-3" size={18} />
                  <select
                    id="role"
                    name="role"
                    className="w-full bg-white text-black outline-none text-sm py-2.5 pr-3"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">Select role</option>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="college_authority">College Authority</option>
                  </select>
                  <FaChevronDown className="text-gray-400 mr-3" size={16} />
                </div>
                {touched.role && errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            )}

            {showIQACForm && (
              <>
                {/* Institution Name */}
                <div>
                  <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">
                    Institution Name
                  </label>
                  <div className="flex items-center gap-3 border rounded-md bg-white">
                    <FaBuilding className="text-gray-400 ml-3" size={18} />
                    <input
                      id="institutionName"
                      name="institutionName"
                      type="text"
                      className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                      placeholder="Enter institution name"
                      value={formData.institutionName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  {touched.institutionName && errors.institutionName && (
                    <p className="mt-1 text-sm text-red-600">{errors.institutionName}</p>
                  )}
                </div>

                {/* Institution Type */}
                <div>
                  <label htmlFor="institutionType" className="block text-sm font-medium text-gray-700 mb-1">
                    Institution Type
                  </label>
                  <div className="flex items-center gap-3 border rounded-md bg-white">
                    <FaUniversity className="text-gray-400 ml-3" size={18} />
                    <select
                      id="institutionType"
                      name="institutionType"
                      className="w-full bg-white text-black outline-none text-sm py-2.5 pr-3"
                      value={formData.institutionType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="">Select institution type</option>
                      {institutionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <FaChevronDown className="text-gray-400 mr-3" size={16} />
                  </div>
                  {touched.institutionType && errors.institutionType && (
                    <p className="mt-1 text-sm text-red-600">{errors.institutionType}</p>
                  )}
                </div>

                {/* AISHE ID */}
                <div>
                  <label htmlFor="aisheId" className="block text-sm font-medium text-gray-700 mb-1">
                    AISHE ID
                  </label>
                  <div className="flex items-center gap-3 border rounded-md bg-white">
                    <FaIdCard className="text-gray-400 ml-3" size={18} />
                    <input
                      id="aisheId"
                      name="aisheId"
                      type="text"
                      className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                      placeholder="Enter AISHE ID"
                      value={formData.aisheId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  {touched.aisheId && errors.aisheId && (
                    <p className="mt-1 text-sm text-red-600">{errors.aisheId}</p>
                  )}
                </div>

                {/* Institutional Email */}
                <div>
                  <label htmlFor="institutionalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Institutional Email
                  </label>
                  <div className="flex items-center gap-3 border rounded-md bg-white">
                    <FaEnvelope className="text-gray-400 ml-3" size={18} />
                    <input
                      id="institutionalEmail"
                      name="institutionalEmail"
                      type="email"
                      className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                      placeholder="institution@example.com"
                      value={formData.institutionalEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  {touched.institutionalEmail && errors.institutionalEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.institutionalEmail}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3 border rounded-md bg-white">
                    <FaMobileAlt className="text-gray-400 ml-3" size={18} />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      className="w-full bg-white text-black placeholder-gray-400 outline-none text-sm py-2.5"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  {touched.phoneNumber && errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>
              </>
            )}

            {errors.global && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                {errors.global}
              </div>
            )}
            {successMessage && (
              <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                {successMessage}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 !bg-[#5D6096] hover:bg-[#4a4d7a] text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {!showIQACForm ? (
                <p className="mt-4 text-center text-sm text-gray-600">
                  Are you an IQAC Supervisor?{' '}
                  <button
                    type="button"
                    className="!text-blue-600 !bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors"
                    onClick={() => setShowIQACForm(true)}
                  >
                    Register as IQAC Supervisor
                  </button>
                </p>
              ) : (
                <p className="mt-4 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-600 hover:underline">
                    Sign in
                  </a>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
