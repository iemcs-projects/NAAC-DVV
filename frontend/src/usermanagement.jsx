import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, ChevronDown, BarChart3, Users as UsersIcon, Building2, FileText, Upload, Settings, Shield, Check, X, Clock, Eye } from 'lucide-react';
import { FaUsers, FaFileAlt, FaChartLine, FaPaperPlane, FaDownload, FaQuestionCircle, FaCog, FaSignOutAlt, FaBell, FaUser, FaTachometerAlt } from 'react-icons/fa';
import Sidebar from './components/iqac-sidebar';
import UserDropdown from './components/UserDropdown';
import { useAuth } from './auth/authProvider';
import { navItems } from './config/navigation';
import axiosInstance from './contextprovider/axios';


function UserManagement() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Pending user requests
 

  // Approved users
  const [approvedUsers, setApprovedUsers] = useState([]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'College Admin':
        return 'bg-blue-100 text-blue-800';
      case 'HoD':
        return 'bg-teal-100 text-teal-800';
      case 'Faculty':
        return 'bg-yellow-100 text-yellow-800';
      case 'Student Admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch approved users from backend
  const fetchApprovedUsers = async () => {
    try {
      const response = await axiosInstance.get('/auth/getApprovedUsers', { withCredentials: true });
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setApprovedUsers(response.data.data.map(user => ({
          ...user,
          status: 'approved'
        })));
      }
    } catch (err) {
      console.error('Error fetching approved users:', err);
    }
  };

  // Fetch pending users from backend
  const fetchPendingUsers = async () => {
    try {
      const response = await axiosInstance.get('/auth/getPendingUsers', { withCredentials: true });
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setPendingUsers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching pending users:', err);
    }
  };

  // Fetch both pending and approved users when component mounts
  useEffect(() => {
    fetchPendingUsers();
    fetchApprovedUsers();
  }, []);


  const handleApproveUser = async (userId) => {
    try {
      console.log('Approving user with ID:', userId);
      // Find the user to get their UUID
      const userToApprove = pendingUsers.find(u => u.id === userId);
      console.log('Found user to approve:', userToApprove);
      
      if (!userToApprove) {
        console.error('User not found in pending list');
        alert('Error: User not found in pending list');
        return;
      }
      
      console.log(`Making API call to: /auth/approveUser/${userToApprove.uuid}`);
      const response = await axiosInstance.post(
        `/auth/approveUser/${userToApprove.uuid}`, 
        {}, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('API Response:', response);
      
      if (response.data && response.data.success) {
        // Show success message
        alert('User approved successfully!');
        
        // Refresh both user lists
        await Promise.all([
          fetchPendingUsers(),
          fetchApprovedUsers()
        ]);
        
        console.log('UI refreshed with updated data');
      } else {
        throw new Error(response.data?.message || 'Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert(`Error: ${error.message || 'Failed to approve user'}`);
    }
  };
  
  const handleRejectUser = async (userId) => {
    try {
      axiosInstance.post(`/auth/rejectUser/${userId}`, {}, { withCredentials: true });
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error rejecting user:', err);
    }
  };

  const handleRemoveUser = (userId) => {
    setApprovedUsers(approvedUsers.filter(u => u.id !== userId));
  };

  const showUserDetails = (userData) => {
    setSelectedUser(userData);
    setShowUserDetailsModal(true);
  };

  const departments = ['All Departments', 'Administration', 'Computer Science Engineering', 'Electronics & Communication'];
  const roles = ['All Roles', 'College Admin', 'HoD', 'Faculty', 'Student Admin'];

  const currentUsers = activeTab === 'pending' ? pendingUsers : approvedUsers;
  
  const filteredUsers = currentUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All Departments' || user.department === departmentFilter;
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const renderUserCard = (userData) => (
    <div key={userData.id} className="border-b border-gray-200 last:border-b-0">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-sm font-medium text-blue-600">
              {userData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-gray-900">{userData.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                {userData.role}
              </span>
              {activeTab === 'pending' && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-blue-600">{userData.email}</p>
              <p className="text-sm text-gray-600">{userData.department}</p>
              <p className="text-xs text-gray-500">
                {activeTab === 'pending' 
                  ? `Requested on: ${new Date(userData.requestDate).toLocaleDateString()}`
                  : `Approved on: ${new Date(userData.approvedDate).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => showUserDetails(userData)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {activeTab === 'pending' ? (
            <>
              <button 
                onClick={() => handleApproveUser(userData.id)}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Approve User"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleRejectUser(userData.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Reject User"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleRemoveUser(userData.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-screen bg-gray-100">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navItems={navItems}
        navigate={navigate}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center h-[50px] w-[350px] shadow border border-black/10 rounded-2xl">
              <a href="#" className="text-gray-500 hover:text-gray-700 mr-2">
                <i className="fas fa-arrow-left"></i>
              </a>
              <p className="text-2xl font-bold text-gray-800">User Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <UserDropdown user={user} className="ml-2" />
            </div>
          </div>

          {/* Dashboard Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-orange-50 rounded-lg p-6 flex items-center">
                <div className="bg-orange-600 rounded-lg p-3 mr-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingUsers.length}</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 flex items-center">
                <div className="bg-blue-600 rounded-lg p-3 mr-4">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Approved Users</p>
                  <p className="text-2xl font-bold text-blue-600">{approvedUsers.length}</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-6 flex items-center">
                <div className="bg-green-600 rounded-lg p-3 mr-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Departments</p>
                  <p className="text-2xl font-bold text-green-600">3</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 flex items-center">
                <div className="bg-purple-600 rounded-lg p-3 mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Roles</p>
                  <p className="text-2xl font-bold text-purple-600">4</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div>
            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-200">
    <button
      onClick={() => setActiveTab('pending')}
      className={`!bg-white px-6 py-3 font-medium text-sm border-b-2 transition-colors mr-4 ${
        activeTab === 'pending'
          ? '!border-orange-500 !text-orange-600'
        : 'border-transparent !text-gray-500 hover:text-gray-700'
      }`}
    >
      Pending Requests ({pendingUsers.length})
    </button>
    <button
      onClick={() => setActiveTab('approved')}
      className={`!bg-white px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
        activeTab === 'approved'
          ? '!border-blue-500 !text-blue-600'
          : 'border-transparent !text-gray-500 hover:text-gray-700'
      }`}
    >
      Approved Users ({approvedUsers.length})
    </button>
  </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full pl-4 pr-10 py-2 text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
                  className="flex items-center justify-between w-48 px-4 py-2 border text-gray-950 border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                >
                  <span className="text-sm">{departmentFilter}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {departmentDropdownOpen && (
                  <div className="absolute top-full mt-1 w-48 bg-white text-gray-950 border border-gray-300 rounded-lg shadow-lg z-10">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setDepartmentFilter(dept);
                          setDepartmentDropdownOpen(false);
                        }}
                        className="bg-white w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center justify-between w-32 px-4 py-2 border text-gray-950 border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                >
                  <span className="text-sm">{roleFilter}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {roleDropdownOpen && (
                  <div className="absolute top-full mt-1 w-32 bg-white border text-gray-950 border-gray-300 rounded-lg shadow-lg z-10">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setRoleFilter(role);
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full bg-white text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-900">
                  {activeTab === 'pending' ? 'User Registration Requests' : 'Approved Users'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'pending' 
                    ? 'Review and approve or reject user registration requests'
                    : 'Manage approved users in your institution'
                  }
                </p>
              </div>
              {filteredUsers.length > 0 ? (
                <div>
                  {filteredUsers.map(userData => renderUserCard(userData))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {activeTab === 'pending' 
                    ? 'No pending requests found'
                    : 'No approved users found matching your filters'
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button 
                onClick={() => setShowUserDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-medium text-blue-600">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <h4 className="text-lg font-medium text-gray-900">{selectedUser.name}</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)} mt-2`}>
                  {selectedUser.role}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="text-sm text-gray-900">{selectedUser.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {selectedUser.status === 'pending' ? 'Request Date' : 'Approved Date'}
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.status === 'pending' ? selectedUser.requestDate : selectedUser.approvedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUser.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      handleApproveUser(selectedUser.id);
                      setShowUserDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleRejectUser(selectedUser.id);
                      setShowUserDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;