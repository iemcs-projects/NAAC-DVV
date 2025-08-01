import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../auth/authProvider';

const Sidebar = ({ collapsed, setCollapsed, navItems = [], navigate }) => {
  const { logout } = useAuth();

  return (
    <div className={`h-screen bg-gray-900 text-white flex flex-col fixed top-0 left-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        {!collapsed && <span className="font-bold text-xl">NAAC</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="focus:outline-none text-gray-300 !bg-gray-800 hover:text-white">
          {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="mt-4 space-y-1">
          {Array.isArray(navItems) && navItems.map(({ icon: Icon, text, path }) => (
            <div
              key={text}
              onClick={async () => {
                if (path === '/logout') {
                  await logout();
                } else {
                  navigate(path);
                }
              }}
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer ${
                window.location.pathname === path ? 'bg-gray-800' : ''
              }`}
            >
              <Icon />
              {!collapsed && <span className="ml-2">{text}</span>}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
