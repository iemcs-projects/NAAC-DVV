import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { SessionContext } from './contextprovider/sessioncontext';
import { Search, Users, Building2, Shield, BarChart3, FileText, Upload, Settings, Edit, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import Sidebar from './components/iqac-sidebar';
import { useNavigate } from 'react-router-dom';
import { navItems } from './config/navigation';
import { useAuth } from './auth/authProvider';
import LandingNavbar from './components/landing-navbar';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaChartLine, FaPaperPlane, FaDownload, FaQuestionCircle, FaCog, FaSignOutAlt, FaBell, FaUser, FaEnvelope, FaUserCircle } from 'react-icons/fa';
import UserDropdown from './components/UserDropdown';
import {useGpa} from './contextprovider/GpaContext';
import { useGpaData } from './contextprovider/gpadata';
import RadarGraphSection from './Radar';



const IqacDashboard = () => {
  const {
    grade,
    criteria,
    isLoading: isGpaLoading,
    error: gpaError,
    criteriaLacking
  } = useGpaData();
 
  const [currentDate] = useState(new Date('2025-06-25'));
  const [collapsed, setCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { desiredGrade } = useContext(SessionContext);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Animation on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Monthly Progress Chart with animation
    const progressChart = echarts.init(document.getElementById('progress-chart'));
    const progressOption = {
      animation: true,
      animationDuration: 2000,
      animationEasing: 'cubicOut',
      grid: { left: '3%', right: '4%', bottom: '10%', top: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        max: 1000,
        splitLine: { lineStyle: { color: '#e5e7eb' } }
      },
      series: [
        {
          data: [200, 350, 400, 480, 550, 650, 720, 800, 850, 920],
          type: 'line',
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { color: '#3b82f6', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
              ]
            }
          }
        }
      ]
    };
    progressChart.setOption(progressOption);

    const handleResize = () => {
      progressChart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      progressChart.dispose();
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

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', active: false },
    { icon: Users, label: 'User Management', active: true },
    { icon: Building2, label: 'Departments', active: false },
    { icon: FileText, label: 'DVV Criteria', active: false },
    { icon: Upload, label: 'Submissions', active: false },
    { icon: BarChart3, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false }
  ];


  console.log('Final criteriaLacking value:', criteriaLacking);
  const statusCards = useMemo(() => [
    {
      label: 'Projected Grade',
      value: isGpaLoading ? '…' : gpaError ? 'Error' : grade,
      color: 'text-blue-600',
      sub: isGpaLoading ? 'Loading...' : gpaError ? 'Error loading grade' : 'Based on current progress',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      label: 'Desired Grade',
      value: desiredGrade || 'N/A',
      color: 'text-amber-500',
      sub: 'Target accreditation level',
      bgGradient: 'from-amber-50 to-amber-100'
    },
    {
      label: 'Criteria Lacking',
      value: isGpaLoading ? '…' : gpaError ? 'Error' : criteriaLacking,
      color: 'text-red-500',
      sub: isGpaLoading ? 'Loading...' : 'Need immediate attention',
      bgGradient: 'from-red-50 to-red-100'
    },
    {
      label: 'Next Deadline',
      value: '16th july',
      color: 'text-gray-800',
      sub: 'Upcoming submission',
      bgGradient: 'from-gray-50 to-gray-100'
    }
  ], [isGpaLoading, gpaError, grade, desiredGrade, criteriaLacking]);
  const actionItems = [
    {
      priority: 'high',
      icon: 'fas fa-exclamation-circle',
      title: 'High Priority: Criterion 2.5 missing data',
      assignee: 'Assigned to Dr. Smith',
      due: 'Due: Jun 12, 2025',
      colorScheme: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800', subtext: 'text-red-700', icon: 'text-red-500', meta: 'text-red-600' }
    },
    {
      priority: 'medium',
      icon: 'fas fa-exclamation-triangle',
      title: 'Medium Priority: Criterion 3.2 needs review',
      assignee: 'Assigned to Prof. Williams',
      due: 'Due: Jun 20, 2025',
      colorScheme: { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-800', subtext: 'text-amber-700', icon: 'text-amber-500', meta: 'text-amber-600' }
    },
    {
      priority: 'info',
      icon: 'fas fa-info-circle',
      title: 'Informational: Criterion 5.1.2 data updated',
      assignee: 'Data file awaiting final review',
      due: 'Updated: Jun 8, 2025',
      colorScheme: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', subtext: 'text-blue-700', icon: 'text-blue-500', meta: 'text-blue-600' }
    },
    {
      priority: 'completed',
      icon: 'fas fa-check-circle',
      title: 'Completed: Criterion 1.1.1 approved',
      assignee: 'Approved by Principal',
      due: 'Completed: Jun 5, 2025',
      colorScheme: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800', subtext: 'text-green-700', icon: 'text-green-500', meta: 'text-green-600' }
    },
    {
      priority: 'medium',
      icon: 'fas fa-exclamation-triangle',
      title: 'Medium Priority: Criterion 7.1.2 data inconsistent',
      assignee: 'Assigned to Dr. Anthony',
      due: 'Due: Jun 18, 2025',
      colorScheme: { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-800', subtext: 'text-amber-700', icon: 'text-amber-500', meta: 'text-amber-600' }
    }
  ];

  const feedbackItems = [
    { criterion: 'Criterion 2.5: data reliability', status: 'Needs Attention', color: 'bg-red-500', textColor: 'text-red-600' },
    { criterion: 'Criterion 4.2: needs clarification', status: 'In Progress', color: 'bg-amber-500', textColor: 'text-amber-600' },
    { criterion: 'Criterion 3.1: requires evidence', status: 'Under Review', color: 'bg-blue-500', textColor: 'text-blue-600' },
    { criterion: 'Criterion 6.1: data missing', status: 'Needs Attention', color: 'bg-red-500', textColor: 'text-red-600' },
    { criterion: 'General feedback on data formatting', status: 'Addressed', color: 'bg-green-500', textColor: 'text-green-600' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
 
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        navItems={navItems}
        navigate={navigate}
      />
      
      {/* Main Content */}
      <div className={`flex-1 ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 relative`}>
        <div className="p-6">
          {/* Header */}
          <div className={`flex justify-between items-center mb-6 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`} style={{ position: 'relative', zIndex: 10000 }}>
            <div className="flex items-center h-[50px] w-[350px] shadow border border-black/10 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <a href="#" className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200">
                <i className="fas fa-arrow-left"></i>
              </a>
              <p className="text-2xl font-bold text-gray-800">IQAC Supervisor Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* <div className="relative cursor-pointer group">
                <FaBell className="text-gray-600 text-xl transform transition-transform duration-200 group-hover:scale-110"/>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">1</span>
              </div> */}
              
              {/* User Dropdown */}
              <UserDropdown user={user} className="ml-2" />
            </div>
          </div>
          console.log(desiredGrade)

          {/* Welcome Message */}
          <div className={`mb-6 transform transition-all duration-700 delay-100 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <h2 className="text-lg font-medium text-gray-800">Welcome, {user?.name || 'User'}</h2>
            <p className="text-sm text-gray-600">Your NAAC accreditation progress is on track, keep up the good work!</p>
          </div>

          {/* Status Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transform transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {statusCards.map(({ label, value, color, sub, bgGradient }, index) => (
              <div 
                key={label} 
                className={`bg-white rounded-lg shadow p-5 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br ${bgGradient}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h3 className="text-sm font-medium text-gray-500 mb-2 transition-colors duration-200">{label}</h3>
                <div className="flex items-end">
                  <div className={`text-4xl font-bold ${color} transform transition-all duration-300 ${hoveredCard === index ? 'scale-110' : ''}`}>
                    {value}
                  </div>
                  <div className="ml-3 text-xs text-gray-500 transition-colors duration-200">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transform transition-all duration-700 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* GPA Visuals */}
            <div className="bg-white rounded-lg shadow p-5 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-sm font-medium text-gray-700 mb-4">GPA Visuals</h3>
              {/* Embedded Radar Graph */}
              <RadarGraphSection />
            </div>

            {/* Monthly Progress */}
            <div className="bg-white rounded-lg shadow p-5 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Monthly Progress</h3>
                <span className="text-xs text-gray-500">Last 30 Days</span>
              </div>
              <div id="progress-chart" className="w-full h-64"></div>
              <div className="flex justify-end mt-2 text-xs">
                <div className="flex items-center text-blue-600 hover:scale-105 transition-transform duration-200">
                  <span>Rows Filled:</span>
                  <span className="ml-2 font-semibold">430</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Required Section */}
          <div className={`bg-white rounded-lg shadow p-5 mb-8 hover:shadow-xl transition-shadow duration-300 transform transition-all duration-700 delay-400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Action Required Section</h3>
            {actionItems.map((item, index) => (
              <div 
                key={index}
                className={`border-l-4 ${item.colorScheme.border} ${item.colorScheme.bg} p-4 rounded-r mb-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <i className={`${item.icon} ${item.colorScheme.icon} transform transition-transform duration-200`}></i>
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${item.colorScheme.text}`}>{item.title}</div>
                    <div className={`text-sm ${item.colorScheme.subtext}`}>{item.assignee}</div>
                    <div className={`text-xs ${item.colorScheme.meta} mt-1`}>{item.due}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* SSR Download & Submission Panel */}
          <div className={`bg-white rounded-lg shadow p-5 mb-8 hover:shadow-xl transition-shadow duration-300 transform transition-all duration-700 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h3 className="text-sm font-medium text-gray-700 mb-4">SSR Download & Submission Panel</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: 'fas fa-history', text: 'View History' },
                { icon: 'fas fa-cloud-download-alt', text: 'Review/Download Submission' },
                { icon: 'fas fa-check-circle', text: 'Final Grade Submission' }
              ].map((button, index) => (
                <button 
                  key={index}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <i className={`${button.icon} mr-2 transform transition-transform duration-200`}></i>
                  {button.text}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`text-center text-xs text-gray-500 mt-8 mb-4 transform transition-all duration-700 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex justify-end items-center">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IqacDashboard;