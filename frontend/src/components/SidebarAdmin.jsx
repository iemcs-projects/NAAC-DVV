import React from "react";
import { useNavigate } from "react-router-dom";

const SidebarAdmin = ({ activeNavItem, setActiveNavItem }) => {
  const navigate = useNavigate();

  const handleClick = (text, path) => {
    setActiveNavItem(text);
    navigate(path);
  };

  const menuItems = [
    { text: "Dashboard", path: "/" },
    { text: "Data Entry", path: "/data-entry" },
    { text: "Notifications", path: "/notifications" },
    { text: "Help & Support", path: "/help" },
  ];

  return (
    <div className="w-64 bg-[#1F2937] text-white min-h-screen">
      <div className="p-4 font-semibold text-lg border-b border-gray-800">
        College Admin
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <div
            key={item.text}
            onClick={() => handleClick(item.text, item.path)}
            className={`flex items-center px-6 py-3 cursor-pointer ${
              activeNavItem === item.text
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span className="ml-3">{item.text}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SidebarAdmin;
