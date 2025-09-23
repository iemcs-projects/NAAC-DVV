import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';

const DataEntryNavbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow-sm border-b border-gray-200 h-16">
      {/* NAAC DVV System on the left */}
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-[#5D6096]">NAAC DVV System</h1>
      </div>

      {/* User dropdown on the right */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="flex items-center space-x-2 focus:outline-none"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <FaUserCircle className="w-8 h-8 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {localStorage.getItem('userName') || 'User'}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isDropdownOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                // Add profile navigation logic
                setIsDropdownOpen(false);
              }}
            >
              <FaUserCircle className="mr-2" />
              My Profile
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                // Add settings navigation logic
                setIsDropdownOpen(false);
              }}
            >
              <FaCog className="mr-2" />
              Settings
            </a>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DataEntryNavbar;
