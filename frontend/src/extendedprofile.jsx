import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/iqac-sidebar';
import { navItems } from './config/navigation';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaChartLine, FaQuestionCircle, FaCog, FaSignOutAlt, FaUser, FaBell } from 'react-icons/fa';
import { useAuth } from './auth/authProvider';
import UserDropdown from './components/UserDropdown';

const ExtendedProfileForm = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
  const [selectedYear, setSelectedYear] = useState(years[4]); // default latest year

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    courses: Array(5).fill(''),
    students: Array(5).fill(''),
    reservedSeats: Array(5).fill(''),
    outgoingStudents: Array(5).fill(''),
    fullTimeTeachers: Array(5).fill(''),
    sanctionedPosts: Array(5).fill(''),
    totalClassrooms: '',
    totalSeminarHalls: '',
    expenditure: Array(5).fill(''),
    totalComputers: ''
  });

  const handleInputChange = (category, value) => {
    const index = years.indexOf(selectedYear);
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => (i === index ? value : item))
    }));
  };

  const handleSingleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Prepare payload for backend
      const payload = {
        year: selectedYear,
        number_of_courses_offered: Number(formData.courses[years.indexOf(selectedYear)]),
        total_students: Number(formData.students[years.indexOf(selectedYear)]),
        reserved_category_seats: Number(formData.reservedSeats[years.indexOf(selectedYear)]),
        outgoing_final_year_students: Number(formData.outgoingStudents[years.indexOf(selectedYear)]),
        full_time_teachers: Number(formData.fullTimeTeachers[years.indexOf(selectedYear)]),
        sanctioned_posts: Number(formData.sanctionedPosts[years.indexOf(selectedYear)]),
        total_classrooms: Number(formData.totalClassrooms),
        total_seminar_halls: Number(formData.totalSeminarHalls),
        total_computers: Number(formData.totalComputers),
        expenditure_in_lakhs: Number(formData.expenditure[years.indexOf(selectedYear)])
      };

      console.log("Submitting extended profile:", payload);

      const response = await axios.post(
        "http://localhost:3000/api/v1/extendedprofile/createExtendedProfile",
        payload
      );

      alert("Extended Profile submitted successfully!");
      navigate("/criteria1.1.1");
      console.log("API Response:", response.data);

    } catch (error) {
      console.error("Error submitting extended profile:", error);
      alert(
        error.response?.data?.message ||
        "Failed to submit extended profile. Please try again."
      );
    }
  };

  const YearWiseInput = ({ title, category, unit = '' }) => (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <input
        type="number"
        className="w-64 text-black px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        value={formData[category][years.indexOf(selectedYear)]}
        onChange={(e) => handleInputChange(category, e.target.value)}
        placeholder={`Enter value for ${selectedYear} ${unit}`}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        navItems={navItems} 
        navigate={navigate} 
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center h-[50px] w-[350px] shadow border border-black/10 rounded-2xl">
              <a href="#" className="text-gray-500 hover:text-gray-700 mr-2">
                <i className="fas fa-arrow-left"></i>
              </a>
              <p className="text-2xl font-bold text-gray-800">Extended Profile</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* <div className="relative cursor-pointer group">
                <FaBell className="text-gray-600 text-xl transform transition-transform duration-200 group-hover:scale-110"/>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">1</span>
              </div> */}
              <UserDropdown user={user} className="ml-2" />
            </div>
          </div>
        </div>

        <div className="px-6">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-1">Extended Profile of the Institution</h4>
            <p className="text-sm text-gray-600">Comprehensive academic and institutional information</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Academic Information Header */}
            <div className="bg-blue-600 text-white px-6 py-4">
              <h2 className="text-lg font-medium">Academic Information</h2>
            </div>

            <div className="p-6 space-y-8">
              {/* Global Year Selector */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <label className="text-lg font-medium text-blue-800">Select Year for All Sections:</label>
                  <select
                    className="px-4 py-2 border border-blue-300 rounded-md text-lg font-medium bg-white"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <span className="text-blue-700 text-sm">This will update all year-wise fields below</span>
                </div>
              </div>

              {/* Section 1: Programme */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                  1. Programme:
                </h2>
                <YearWiseInput
                  title="1.1 Number of courses offered by the Institution across all programs during the last five years"
                  category="courses"
                />
              </div>

              {/* Section 2: Student */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                  2. Student:
                </h2>
                <YearWiseInput
                  title="2.1 Number of students year wise during the last five years"
                  category="students"
                />

                <YearWiseInput
                  title="2.2 Number of seats earmarked for reserved category as per GOI/State Govt rule year wise during the last five years"
                  category="reservedSeats"
                />

                <YearWiseInput
                  title="2.3 Number of outgoing/final year students year wise during the last five years"
                  category="outgoingStudents"
                />
              </div>

              {/* Section 3: Academic */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                  3. Academic:
                </h2>
                <YearWiseInput
                  title="3.2 Number of full time teachers year wise during the last five years"
                  category="fullTimeTeachers"
                />

                <YearWiseInput
                  title="3.3 Number of Sanctioned posts year wise during the last five years"
                  category="sanctionedPosts"
                />
              </div>

              {/* Section 4: Institution */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                  4. Institution:
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4.1 Total number of Classrooms and Seminar halls
                  </label>
                  <input
                    type="number"
                    className="w-64 text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.totalClassrooms}
                    onChange={(e) =>
                      handleSingleInputChange('totalClassrooms', e.target.value)
                    }
                    placeholder="Enter number"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4.1.1 Total number of Seminar Halls
                  </label>
                  <input
                    type="number"
                    className="w-64 text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.totalSeminarHalls}
                    onChange={(e) =>
                      handleSingleInputChange('totalSeminarHalls', e.target.value)
                    }
                    placeholder="Enter number"
                  />
                </div>

                <YearWiseInput
                  title="4.2 Total expenditure excluding salary year wise during the last five years"
                  category="expenditure"
                  unit="INR in lakhs"
                />

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4.3 Number of Computers
                  </label>
                  <input
                    type="number"
                    className="w-64 text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.totalComputers}
                    onChange={(e) =>
                      handleSingleInputChange('totalComputers', e.target.value)
                    }
                    placeholder="Enter number"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      NAAC for Quality and Excellence in Higher Education
                    </p>
                    <p>Copyright Reg. No. L-94712/2020</p>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtendedProfileForm;
