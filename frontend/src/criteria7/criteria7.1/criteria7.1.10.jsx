import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria7_1_10 = () => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState("");
  const navigate = useNavigate();
  const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };

  const goToNextPage = () => {
    navigate("/criteria7.1.11");
  };

  const goToPreviousPage = () => {
    navigate("/criteria7.1.9");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 overflow-hidden pt-8">
        <div className={`fixed top-8 left-0 bottom-0 z-40 ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white shadow-md`}>
          <Sidebar onCollapse={setIsSidebarCollapsed} />
        </div>
        <div className={`flex-1 transition-all duration-300 overflow-y-auto ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 `}>
          {/* Page Header with Title and User Dropdown */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center h-[70px] w-[700px] shadow border border-black/10 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <a href="#" className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200 px-4">
                <i className="fas fa-arrow-left"></i>
              </a>
              <div>
                <p className="text-2xl font-bold text-gray-800">Criteria 7 - Institutional Values and Best Practices</p>
                <p className="text-gray-600 text-sm">7.1 Institutional Values and Social Responsibilities</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4 " />
            </div>
          </div>
          {/* Metric Info */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">7.1.10 Metric Information</h3>
            <p className="text-sm text-gray-700">
              The Institution has a prescribed code of conduct for students, teachers, administrators and other staff and conducts periodic programmes in this regard:<br />
              1. The Code of Conduct is displayed on the website<br />
              2. There is a committee to monitor adherence to the Code of Conduct<br />
              3. Institution organizes professional ethics programmes for students,teachers, administrators and other staff<br />
              4. Annual awareness programmes on Code of Conduct are organized
            </p>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-1">Department</label>
              <select className="w-full px-4 py-2 border rounded text-gray-950">
                <option value="">Select department</option>
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Faculty ID</label>
              <input className="w-full px-4 py-2 border rounded text-gray-950" placeholder="Enter faculty ID" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Faculty Name</label>
              <input className="w-full px-4 py-2 border rounded text-gray-950" placeholder="Enter faculty name" />
            </div>
          </div>

          {/* Radio Buttons */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">Select the Options</h3>
            {[
              "All of the above",
              "Any 3 of the above",
              "Any 2 of the above",
              "Any 1 of the above",
              "None of the above",
            ].map((label, index) => {
              const optionKey = `option${index + 1}`;
              return (
                <div key={optionKey} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={optionKey}
                    name="participation"
                    className="mr-2"
                    checked={selectedOption === optionKey}
                    onChange={() => handleRadioChange(optionKey)}
                  />
                  <label htmlFor={optionKey} className="text-sm text-gray-800">
                    {label}
                  </label>
                </div>
              );
            })}
          </div>

          {/* File Upload Section */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <ul className="list-disc text-sm text-gray-700 mb-4 pl-5">
              <li>Upload:Code of ethics policy document</li>
              <li>Upload:Details of the monitoring committee composition and minutes of the committee meeting, number of programmes organized, reports on the various programs etc., in support of the claims</li>
              <li>Upload:Any other relevant information</li>
            </ul>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
                <i className="fas fa-upload mr-2"></i>Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Info (Link)</label>
            <input
              type="text"
              placeholder="Enter URL here"
              className="w-full px-4 py-2 border rounded text-gray-900"
            />
          </div>

          {/* Bottom Buttons */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria7_1_10;