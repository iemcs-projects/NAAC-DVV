import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria4_2_2 = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  
  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  
  
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  
  // Changed to handle multiple selections
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });

  // Initialize sessions
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      setCurrentYear(sessions[0]);
      setSelectedYear(sessions[0]);
    }
  }, [sessions]);

  // Fallback to pastFiveYears if no sessions available
  useEffect(() => {
    const yearToUse = availableSessions?.length > 0 ? availableSessions[0] : pastFiveYears[0];
    if (yearToUse && currentYear !== yearToUse) {
      setCurrentYear(yearToUse);
      setSelectedYear(yearToUse);
    }
  }, [availableSessions, pastFiveYears, currentYear]);

  useEffect(() => {
    if (!availableSessions?.length && pastFiveYears.length > 0) {
      setCurrentYear(pastFiveYears[0]);
      setSelectedYear(pastFiveYears[0]);
    }
  }, [availableSessions, pastFiveYears]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria4/score422");
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      setProvisionalScore(response.data);
      console.log('provisionalScore after set:', provisionalScore);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  // Updated to handle checkbox changes
  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const navigate = useNavigate()
  const goToNextPage = () => {
    navigate("/criteria4.2.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria4.2.1");
  };

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount >= 4) return 'A. Any 4 or more of the above';
    if (selectedCount === 3) return 'B. Any 3 of the above';
    if (selectedCount === 2) return 'C. Any 2 of the above';
    if (selectedCount === 1) return 'D. Any 1 of the above';
    return 'E. None of the above';
  };

  const handleSubmit = async () => {
    try {
      if (!currentYear) {
        throw new Error("Please select a year");
      }
      
      const sessionFull = currentYear;
      const session = sessionFull.split("-")[0];
      
      // Count number of selected options (0-5)
      const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
      console.log("Submitting with session:", session, "selected count:", selectedCount);
      
      // No need to prevent submission if no options are selected (0 is valid)
      
      const response = await axios.post("http://localhost:3000/api/v1/criteria4/createResponse422", {
        session: parseInt(session),
        options: selectedCount
      });

      if (response.data && response.data.success) {
        alert("Options submitted successfully!");
        await fetchScore();
      } else {
        throw new Error(response.data?.message || "Failed to submit options");
      }
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(`Error: ${error.response?.data?.message || error.message || "An error occurred while submitting"}`);
    }
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
                <p className="text-2xl font-bold text-gray-800">Criteria 4 - Infrastructure and Learning Resources</p>
                <p className="text-gray-600 text-sm">4.2 Library Infrastructure</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4 " />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.2.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
               The institution has subscription for the following e-resources
1. e-journals<br/>
2. e-ShodhSindhu<br/>
3. Shodhganga Membership<br/>
4. e-books<br/>
5. Databases<br/>
6. Remote access to e-resources<br/>
  <br/>
  Choose from the following<br/>    
A. Any 4 or more of the above<br/>
B. Any 3 of the above<br/>
C. Any 2 of the above<br/>
D. Any 1 of the above<br/>
E. None of the above <br/>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Upload any additional information</li>
                <li>Details of subscriptions like e-journals, e-ShodhSindhu,</li>
                <li>Shodhganga Membership etc (Data Template)</li>
               </ul>
            </div>
          </div>

          {/* Provisional Score */}
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

          {/* Year Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(e.target.value);
                setSelectedYear(e.target.value);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-gray-950"
            >
              {availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>

          {/* Multiple Selection Checkboxes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the E-resources Available (Multiple selections allowed)
            </h3>
            <div className="space-y-3">
              {[
                { key: "option1", label: "1. e-journals" },
                { key: "option2", label: "2. e-ShodhSindhu" },
                { key: "option3", label: "3. Shodhganga Membership" },
                { key: "option4", label: "4. e-books" },
                { key: "option5", label: "5. Databases" }
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
            
            {/* Add Button */}
            <div className="mt-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
            
            {/* Grade Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                Current Grade: {getGrade()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Selected: {Object.values(selectedOptions).filter(Boolean).length} out of 5 options
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Upload any additional information</li>
                <li>Details of subscriptions like e-journals, e-ShodhSindhu, Shodhganga Membership etc (Data Template)</li>
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

export default Criteria4_2_2;