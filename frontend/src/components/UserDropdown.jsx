import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignOutAlt, FaUserCircle, FaEnvelope, FaCog } from 'react-icons/fa';
import { useAuth } from '../auth/authProvider';
import { useNavigate } from 'react-router-dom';

const UserDropdown = ({ user, className = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className="cursor-pointer group"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 transform transition-transform duration-200 group-hover:scale-110">
          <FaUser className=""/>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div 
          className="fixed top-16 right-6 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] transform transition-all duration-200 scale-100 opacity-100"
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <FaUserCircle className="text-xl"/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User Name'}
                </p>
                <div className="flex items-center mt-1">
                  <FaEnvelope className="flex-shrink-0 mr-1.5 h-3 w-3 text-gray-400"/>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <div className="mt-1.5 text-xs text-gray-500">
                  Role: {user?.role || 'IQAC Supervisor'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Options */}
          <div className="py-1">
            <button 
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
              onClick={() => {
                setShowDropdown(false);
                // Handle profile navigation
              }}
            >
              <FaUser className="mr-3 text-gray-500 w-4 h-4" />
              View Profile
            </button>
            <button 
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-150"
              onClick={() => {
                setShowDropdown(false);
                handleLogout();
              }}
            >
              <FaSignOutAlt className="mr-3 text-red-500 w-4 h-4"/>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
