import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaTable,
  FaBell,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";

const Notification = () => {
  const [activeNavItem, setActiveNavItem] = useState("Notifications");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const handleNavClick = (navItem, route) => {
    setActiveNavItem(navItem);
    if (route) navigate(route);
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-4 font-semibold text-lg border-b border-gray-800">
          College Admin
        </div>
        <nav className="mt-6">
          <NavItem
            Icon={FaTachometerAlt}
            text="Dashboard"
            active={activeNavItem === "Dashboard"}
            onClick={() => handleNavClick("Dashboard", "/dashboard")}
          />
          <NavItem
            Icon={FaTable}
            text="Data Entry"
            active={activeNavItem === "Data Entry"}
            onClick={() => handleNavClick("Data Entry", "/dataentry")}
          />
          <NavItem
            Icon={FaBell}
            text="Notifications"
            active={activeNavItem === "Notifications"}
            onClick={() => handleNavClick("Notifications","/notification")}
            badge={1}
          />
          <NavItem
            Icon={FaQuestionCircle}
            text="Help & Support"
            active={activeNavItem === "Help & Support"}
            onClick={() => handleNavClick("Help & Support", "/helpsupport")}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-700">Notifications</h1>
          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer">
              <FaBell className="text-gray-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                1
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer">
              <span>JS</span>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-auto flex-1">
          {/* Welcome */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700">Welcome, John Smith</h2>
            <p className="text-sm text-gray-500">
              Here are your latest notifications and key performance indicators.
            </p>
          </div>

          {/* KPIs Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Projected Grade"
              value="A"
              color="text-yellow-500"
              subtitle="Based on sub-criteria scores"
            />
            <MetricCard
              title="Desired Grade"
              value="A"
              color="text-yellow-500"
              subtitle="Target accreditation level"
            />
            <MetricCard
              title="Criteria Lacking"
              value="4"
              color="text-red-500"
              subtitle="Need immediate attention"
            />
            <MetricCard
              title="Next Deadline"
              value="Jun 15"
              color="text-gray-700"
              subtitle="12 days remaining"
            />
          </div>

          {/* Notifications Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex mt-2 border-b">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`mr-4 py-2 px-1 font-medium text-sm ${
                    activeTab === "all"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`mr-4 py-2 px-1 font-medium text-sm ${
                    activeTab === "unread"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setActiveTab("important")}
                  className={`py-2 px-1 font-medium text-sm ${
                    activeTab === "important"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  Important
                </button>
              </div>
            </div>

            {/* Notifications Content */}
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Priority Notifications
              </h4>
              <NotificationCard
                title="Criteria 4 Documentation Missing"
                description="Please upload the required documents for Criteria 4.2 before the deadline."
                type="Urgent"
                time="2 hours ago"
                bg="red"
              />

              <NotificationCard
                title="HoD Review Required"
                description="Criteria 2 documentation needs review from your department head."
                type="Important"
                time="Yesterday"
                bg="yellow"
              />

              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6">
                General Updates
              </h4>

              <NotificationCard
                title="Criteria 1 Approved"
                description="Your submission for Criteria 1.3 has been approved by the IQAC."
                type="Approved"
                time="June 19, 2025"
                bg="green"
              />

              <NotificationCard
                title="Form Submission Reminder"
                description="Don't forget to complete the faculty achievement form by June 25."
                type="Reminder"
                time="June 18, 2025"
                bg="blue"
              />

              <NotificationCard
                title="NAAC Meeting Scheduled"
                description="A department meeting regarding NAAC preparations has been scheduled for June 22."
                type="Meeting"
                time="June 17, 2025"
                bg="purple"
              />
            </div>
          </div>
        </main>

        <footer className="bg-white p-4 border-t text-sm text-gray-500 flex justify-between items-center flex-shrink-0">
          <div>© 2025 College Admin Portal. All rights reserved.</div>
          <div className="flex items-center space-x-1">
            <span>Designed by</span>
            <span className="font-medium">Readdy</span>
          </div>
          <div>Last updated: Jul 07, 2025</div>
        </footer>
      </div>

      {/* Logout Button */}
      <div
        className="fixed bottom-6 left-6 bg-gray-800 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={handleLogout}
      >
        <FaSignOutAlt />
      </div>
    </div>
  );
};

// NavItem with badge optional
const NavItem = ({ Icon, text, active, onClick, badge }) => (
  <div
    className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
      active
        ? "bg-gray-800 text-blue-400"
        : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
    }`}
    onClick={onClick}
  >
    <Icon className="w-5 h-5" />
    <span className="ml-3">{text}</span>
    {badge !== undefined && badge !== null && (
      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </div>
);

const MetricCard = ({ title, value, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
    <div className="flex items-end">
      <span className={`text-4xl font-bold ${color}`}>{value}</span>
    </div>
    <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
  </div>
);

const NotificationCard = ({ title, description, type, time, bg }) => (
  <div className={`bg-${bg}-50 border-l-4 border-${bg}-500 p-4 mb-4`}>
    <div className="flex justify-between">
      <div>
        <h5 className={`font-medium text-${bg}-800`}>{title}</h5>
        <p className={`text-sm text-${bg}-700 mt-1`}>{description}</p>
      </div>
      <div className="text-right">
        <span
          className={`bg-${bg}-200 text-${bg}-800 text-xs px-2 py-1 rounded whitespace-nowrap`}
        >
          {type}
        </span>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  </div>
);

export default Notification;
