import { 
    FaTachometerAlt, 
    FaUsers, 
    FaFileAlt, 
    FaChartLine, 
    FaQuestionCircle, 
    FaCog, 
    FaSignOutAlt, 
    FaUser 
  } from 'react-icons/fa';
  
  export const navItems = [
      { icon: FaTachometerAlt, text: 'Dashboard', path: '/iqac-dashboard' },
      { icon: FaUsers, text: 'User Management', path: '/user-management' },
      { icon: FaFileAlt, text: 'Data Entry Forms', path: '/criteria1.1.1' },
      { icon: FaChartLine, text: 'GPA Analysis', path: '/gpa-analysis' },
      { icon: FaFileAlt, text: 'IIQA Form', path: '/iiqa' },
      { icon: FaUser, text: 'Extended Profile', path: '/extendedprofile' },
      { icon: FaQuestionCircle, text: 'Help and Support', path: '/helpsupport' },
      { icon: FaCog, text: 'Configuration', path: '/configuration' },
      { icon: FaSignOutAlt, text: 'Logout', path: '/logout' }
    ];