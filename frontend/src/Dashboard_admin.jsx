import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaTable,
  FaBell,
  FaQuestionCircle,
  FaSignOutAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const Dashboard_admin = () => {
  const [activeNavItem, setActiveNavItem] = useState("Dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const chartDom = document.getElementById("progressChart");
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
        xAxis: { type: "category", boundaryGap: false, data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
        yAxis: { type: "value", min: 0, max: 400 },
        series: [
          {
            name: "Progress",
            type: "line",
            symbol: "circle",
            symbolSize: 8,
            itemStyle: { color: "#3b82f6" },
            lineStyle: { width: 3, color: "#3b82f6" },
            areaStyle: {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(59, 130, 246, 0.5)" },
                  { offset: 1, color: "rgba(59, 130, 246, 0.05)" },
                ],
              },
            },
            data: [280, 250, 290, 270, 290, 280, 300],
          },
        ],
      };
      myChart.setOption(option);

      const handleResize = () => myChart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        myChart.dispose();
      };
    }
  }, []);

  const handleNavClick = (navItem, route) => {
    setActiveNavItem(navItem);
    if (route) {
      navigate(route);
    }
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
        <header className="bg-white shadow-sm p-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-700">College Admin Dashboard</h1>
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

        {/* Scrollable main section */}
        <main className="p-6 overflow-auto flex-1">
          {/* Welcome */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700">Welcome, John Smith</h2>
            <p className="text-sm text-gray-500">
              Your NAAC accreditation progress is on track. Keep up the good work!
            </p>
          </div>

          {/* Key Metrics */}
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
            <div className="bg-white rounded-lg shadow p-6 relative">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Next Deadline</h3>
              <div className="flex items-end">
                <span className="text-4xl font-bold text-gray-700">Jun 15</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">12 days remaining</p>
              <button className="absolute top-4 right-4 text-red-500 cursor-pointer">
                <FaCalendarAlt />
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-base font-medium text-gray-700 mb-4">
                Criteria Progress vs Target
              </h3>
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">Criteria {index}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${[75, 60, 80, 70, 65][index - 1]}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col">
              <h3 className="text-base font-medium text-gray-700 mb-4">
                Monthly Progress Tracker
              </h3>
              {/* Make chart fill remaining height */}
              <div id="progressChart" className="flex-1 w-full" style={{ minHeight: "250px" }}></div>
            </div>
          </div>
        </main>

        <footer className="bg-white p-4 border-t text-sm text-gray-500 flex justify-between items-center flex-shrink-0">
          <div>© 2025 College Admin Portal. All rights reserved.</div>
         
          <div>Last updated: Jun 09, 2025</div>
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

const NavItem = ({ Icon, text, active, onClick, badge }) => (
  <div
    className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
      active ? "bg-gray-800 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
    }`}
    onClick={onClick}
  >
    <Icon className="w-5 h-5" />
    <span className="ml-3">{text}</span>
    {badge && (
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

export default Dashboard_admin;
