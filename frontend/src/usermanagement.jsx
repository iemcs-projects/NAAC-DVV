import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, ChevronDown, ChevronRight, BarChart3, Users as UsersIcon, Building2, FileText, Upload, Settings, Shield } from 'lucide-react';
import { FaUsers, FaFileAlt, FaChartLine, FaPaperPlane, FaDownload, FaQuestionCircle, FaCog, FaSignOutAlt, FaBell, FaUser, FaTachometerAlt } from 'react-icons/fa';
import Sidebar from './components/iqac-sidebar';
import UserDropdown from './components/UserDropdown';
import { useAuth } from './auth/authProvider';
import { navItems } from './config/navigation';

function UserManagement() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  // const navItems = [
  //   { icon: FaTachometerAlt, text: 'Dashboard', path: '/iqac-dashboard' },
  //   { icon: FaUsers, text: 'User Management', path: '/user-management' },
  //   { icon: FaFileAlt, text: 'Data Entry Forms', path: '/criteria1.1.1' },
  //   { icon: FaChartLine, text: 'GPA Analysis', path: '/gpa-analysis' },
  //   { icon: FaPaperPlane, text: 'IIQA Form', path: '/iiqa' },
  //   { icon: FaDownload, text: 'Extended Profile', path: '/extendedprofile' },
  //   { icon: FaQuestionCircle, text: 'Help and Support', path: '/helpsupport' },
  //   { icon: FaCog, text: 'Configuration', path: '/configuration' },
  //   { icon: FaSignOutAlt, text: 'Logout', path: '/logout' }
  // ];
    
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Faculty',
    department: 'Computer Science Engineering',
    supervisor: ''
  });
  const [newUserRoleDropdown, setNewUserRoleDropdown] = useState(false);
  const [newUserDeptDropdown, setNewUserDeptDropdown] = useState(false);
  const [newUserSupervisorDropdown, setNewUserSupervisorDropdown] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [usersList, setUsersList] = useState([
    {
      id: 'DRK',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@college.edu',
      department: 'Administration',
      role: 'IQAC Supervisor',
      roleColor: 'bg-blue-100 text-blue-800',
      supervisor: null,
      level: 0
    },
    {
      id: 'PMS',
      name: 'Prof. Meera Sharma',
      email: 'meera.sharma@college.edu',
      department: 'Administration',
      role: 'College Authority',
      roleColor: 'bg-blue-100 text-blue-800',
      supervisor: 'DRK',
      level: 1
    },
    {
      id: 'DAP',
      name: 'Dr. Amit Patel',
      email: 'amit.patel@college.edu',
      department: 'Computer Science Engineering',
      role: 'HoD',
      roleColor: 'bg-teal-100 text-teal-800',
      supervisor: 'DRK',
      level: 1
    },
    {
      id: 'DSR',
      name: 'Dr. Sunita Reddy',
      email: 'sunita.reddy@college.edu',
      department: 'Electronics & Communication',
      role: 'HoD',
      roleColor: 'bg-teal-100 text-teal-800',
      supervisor: 'DRK',
      level: 1
    },
    {
      id: 'DPS',
      name: 'Dr. Priya Singh',
      email: 'priya.singh@college.edu',
      department: 'Computer Science Engineering',
      role: 'Faculty',
      roleColor: 'bg-yellow-100 text-yellow-800',
      supervisor: 'DAP',
      level: 2
    },
    {
      id: 'PRG',
      name: 'Prof. Ravi Gupta',
      email: 'ravi.gupta@college.edu',
      department: 'Computer Science Engineering',
      role: 'Faculty',
      roleColor: 'bg-yellow-100 text-yellow-800',
      supervisor: 'DAP',
      level: 2
    },
    {
      id: 'JSM',
      name: 'John Student Mentor',
      email: 'john.mentor@college.edu',
      department: 'Administration',
      role: 'Student Mentor',
      roleColor: 'bg-green-100 text-green-800',
      supervisor: 'DRK',
      level: 1
    }
  ]);

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'IQAC Supervisor':
      case 'College Authority':
        return 'bg-blue-100 text-blue-800';
      case 'HoD':
        return 'bg-teal-100 text-teal-800';
      case 'Faculty':
        return 'bg-yellow-100 text-yellow-800';
      case 'Student Mentor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateUserId = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3);
  };

  const getAvailableSupervisors = (role) => {
    switch (role) {
      case 'College Authority':
      case 'HoD':
      case 'Student Mentor':
        return usersList.filter(user => user.role === 'IQAC Supervisor');
      case 'Faculty':
        return usersList.filter(user => user.role === 'HoD');
      default:
        return [];
    }
  };

  const getSupervisorLevel = (supervisorId) => {
    if (!supervisorId) return 0;
    const supervisor = usersList.find(user => user.id === supervisorId);
    return supervisor ? supervisor.level + 1 : 1;
  };

  const handleAddUser = () => {
    if (newUserForm.name && newUserForm.email) {
      const newUser = {
        id: generateUserId(newUserForm.name),
        name: newUserForm.name,
        email: newUserForm.email,
        department: newUserForm.department,
        role: newUserForm.role,
        roleColor: getRoleColor(newUserForm.role),
        supervisor: newUserForm.supervisor || null,
        level: getSupervisorLevel(newUserForm.supervisor)
      };
      
      setUsersList([...usersList, newUser]);
      setNewUserForm({
        name: '',
        email: '',
        role: 'Faculty',
        department: 'Computer Science Engineering',
        supervisor: ''
      });
      setShowAddUserModal(false);
    }
  };

  const buildHierarchy = (users) => {
    const hierarchy = [];
    const userMap = {};
    
    // Create a map for quick lookup
    users.forEach(user => {
      userMap[user.id] = { ...user, children: [] };
    });
    
    // Build the hierarchy
    users.forEach(user => {
      if (user.supervisor && userMap[user.supervisor]) {
        userMap[user.supervisor].children.push(userMap[user.id]);
      } else {
        hierarchy.push(userMap[user.id]);
      }
    });
    
    return hierarchy;
  };

  const departments = ['All Departments', 'Administration', 'Computer Science Engineering', 'Electronics & Communication'];
  const roles = ['All Roles', 'IQAC Supervisor', 'College Authority', 'HoD', 'Faculty', 'Student Mentor'];
  const availableDepartments = ['Administration', 'Computer Science Engineering', 'Electronics & Communication'];
  const availableRoles = ['IQAC Supervisor', 'College Authority', 'HoD', 'Faculty', 'Student Mentor'];

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All Departments' || user.department === departmentFilter;
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const hierarchyData = buildHierarchy(filteredUsers);

  const renderUserHierarchy = (users, depth = 0) => {
    return users.map((user) => (
      <div key={user.id}>
        <div className="border-b border-gray-200 last:border-b-0">
          <div className="p-4 flex items-center justify-between"  style={{ paddingLeft: `${16 + depth * 24}px` }}>
            <div className="flex items-center">
              <button 
                onClick={() => toggleUserExpansion(user.id)}
                className="mr-2 p-1 hover:bg-gray-100 rounded"
                style={{ visibility: user.children.length > 0 ? 'visible' : 'hidden' }}
              >
                {expandedUsers[user.id] ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {/* Hierarchy connector lines */}
              {depth > 0 && (
                <div className="flex items-center mr-2">
                  <div className="w-4 h-0.5 bg-gray-300"></div>
                </div>
              )}
              
              <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center mr-4">
                <span className="text-sm font-medium text-blue-600">{user.id}</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.roleColor}`}>
                    {user.role}
                  </span>

                  {user.children.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {user.children.length} subordinate{user.children.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-blue-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.department}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Render children if expanded */}
        {expandedUsers[user.id] && user.children.length > 0 && (
          <div>
            {renderUserHierarchy(user.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', active: false },
    { icon: UsersIcon, label: 'User Management', active: true },
    { icon: Building2, label: 'Departments', active: false },
    { icon: FileText, label: 'DVV Criteria', active: false },
    { icon: Upload, label: 'Submissions', active: false },
    { icon: BarChart3, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false }
  ];

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
              {/* <div className="relative cursor-pointer group">
                <FaBell className="text-gray-600 text-xl transform transition-transform duration-200 group-hover:scale-110"/>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">1</span>
              </div> */}
              <UserDropdown user={user} className="ml-2" />
            </div>
          </div>
          

        <div className="p-6">
          {/* Dashboard Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 flex items-center">
                <div className="bg-blue-600 rounded-lg p-3 mr-4">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{usersList.length}</p>
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
                  <p className="text-sm font-medium text-purple-600">Roles</p>
                  <p className="text-2xl font-bold text-purple-600">5</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">User Hierarchy</h2>
              <button 
                className="!bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700"
                onClick={() => setShowAddUserModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2 text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
                  className="flex items-center justify-between w-48 px-4 py-2 border text-gray-950 border-gray-300 rounded-lg !bg-white hover:bg-gray-50"
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
                        className="!bg-white w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
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
                  className="flex items-center justify-between w-32 px-4 py-2 border text-gray-950 border-gray-300 rounded-lg !bg-white hover:bg-gray-50"
                >
                  <span className="text-sm">{roleFilter}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {roleDropdownOpen && (
                  <div className="absolute top-full mt-1 w-32 !bg-white border text-gray-950 border-gray-300 rounded-lg shadow-lg z-10">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setRoleFilter(role);
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full !bg-white text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hierarchical User List */}
            <div className="!bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-900">Organizational Hierarchy</h3>
                <p className="text-sm text-gray-600 mt-1">Click on users with subordinates to expand their team</p>
              </div>
              {hierarchyData.length > 0 ? (
                renderUserHierarchy(hierarchyData)
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No users found matching your filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-950 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-950 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email"
                />
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <button
                    onClick={() => setNewUserRoleDropdown(!newUserRoleDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border text-gray-950 border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                  >
                    <span className="text-sm">{newUserForm.role}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {newUserRoleDropdown && (
                    <div className="absolute top-full mt-1 w-full text-gray-950 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {availableRoles.map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setNewUserForm({...newUserForm, role, supervisor: ''});
                            setNewUserRoleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-950 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Supervisor Field */}
              {getAvailableSupervisors(newUserForm.role).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supervisor
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setNewUserSupervisorDropdown(!newUserSupervisorDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-950 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                    >
                      <span className="text-sm">
                        {newUserForm.supervisor ? 
                          usersList.find(u => u.id === newUserForm.supervisor)?.name || 'Select Supervisor' : 
                          'Select Supervisor'
                        }
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {newUserSupervisorDropdown && (
                      <div className="absolute top-full mt-1 w-full text-gray-950 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {getAvailableSupervisors(newUserForm.role).map((supervisor) => (
                          <button
                            key={supervisor.id}
                            onClick={() => {
                              setNewUserForm({...newUserForm, supervisor: supervisor.id});
                              setNewUserSupervisorDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-950 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {supervisor.name} ({supervisor.role})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Department Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <button
                    onClick={() => setNewUserDeptDropdown(!newUserDeptDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border text-gray-950 border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                  >
                    <span className="text-sm">{newUserForm.department}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {newUserDeptDropdown && (
                    <div className="absolute top-full mt-1 w-full bg-white text-gray-950 border border-gray-300 rounded-lg shadow-lg z-10">
                      {availableDepartments.map((dept) => (
                        <button
                          key={dept}
                          onClick={() => {
                            setNewUserForm({...newUserForm, department: dept});
                            setNewUserDeptDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-950 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end !bg-white gap-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 !bg-white rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    
 

  );
}

export default UserManagement;