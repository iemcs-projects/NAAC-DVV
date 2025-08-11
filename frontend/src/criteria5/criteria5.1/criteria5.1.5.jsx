import React, { useState, useContext, useEffect } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";

const Criteria5_1_5 = () => {
  const { sessions: availableSessions } = useContext(SessionContext);
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [currentYear, setCurrentYear] = useState(pastFiveYears[0]);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Changed to handle multiple selections for grievance redressal components
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
  });

  // Updated to handle checkbox changes
  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const navigate = useNavigate();
  const goToNextPage = () => {
    navigate("/criteria5.2.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria5.1.4");
  };

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount === 4) return 'All of the above';
    if (selectedCount === 3) return 'Any 3 of the above';
    if (selectedCount === 2) return 'Any 2 of the above';
    if (selectedCount === 1) return 'Any 1 of the above';
    return 'None of the above';
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          {/* Page Title and Score */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 5: Student Support and Progression
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">5.1 Student Support</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center"></div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">5.1.5 Metric Information</h3>
              <p className="text-sm text-gray-700">
                The Institution has a transparent mechanism for timely redressal of student grievances including sexual harassment and ragging cases:<br/>      
                1. Implementation of guidelines of statutory/regulatory bodies<br/>  
                2. Organisation wide awareness and undertakings on policies with zero tolerance<br/>  
                3. Mechanisms for submission of online/offline students' grievances<br/>
                4. Timely redressal of the grievances through appropriate committees<br/><br/>
                Choose from the following:<br/>    
                A. All of the above<br/>
                B. Any 3 of the above<br/>
                C. Any 2 of the above<br/>
                D. Any 1 of the above<br/>
                E. None of the above<br/>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Upload the grievance redressal policy document with reference to prevention of sexual harassment committee and anti ragging committee, constitution of various committees for addressing the issues, minutes of the meetings of the committees, number of cases received and redressed.</li>
                <li>Minutes of the meetings of student redressal committee, prevention of sexual harassment committee and Anti Ragging committee</li>
                <li>Upload any additional information</li>
                <li>Details of student grievances including sexual harassment and ragging cases</li>
              </ul>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.1.3): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
                  ? (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria).toFixed(2)
                  : (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria)} %
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                </span>
              </p>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          {/* Multiple Selection Checkboxes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the Grievance Redressal Components Available (Multiple selections allowed)
            </h3>
            <div className="space-y-3">
              {[
                { key: "option1", label: "1. Implementation of guidelines of statutory/regulatory bodies" },
                { key: "option2", label: "2. Organisation wide awareness and undertakings on policies with zero tolerance" },
                { key: "option3", label: "3. Mechanisms for submission of online/offline students' grievances" },
                { key: "option4", label: "4. Timely redressal of the grievances through appropriate committees" }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedOptions[key]}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  <label htmlFor={key} className="text-sm text-gray-800">{label}</label>
                </div>
              ))}
            </div>
            
            {/* Grade Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                Option Selected: {getGrade()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Selected: {Object.values(selectedOptions).filter(Boolean).length} out of 4 components
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Upload the grievance redressal policy document with reference to prevention of sexual harassment committee and anti ragging committee, constitution of various committees for addressing the issues, minutes of the meetings of the committees, number of cases received and redressed.</li>
                <li>Minutes of the meetings of student redressal committee, prevention of sexual harassment committee and Anti Ragging committee</li>
                <li>Upload any additional information</li>
                <li>Details of student grievances including sexual harassment and ragging cases</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
                <i className="fas fa-upload mr-2"></i> Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>
          </div>

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_1_5;