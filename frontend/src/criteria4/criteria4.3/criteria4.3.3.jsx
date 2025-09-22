import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria4_3_3 = () => {
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);

  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
  );

  const [selectedOption, setSelectedOption] = useState("");
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);

  // Handle sessions from context
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      setCurrentYear(sessions[0]);
    }
  }, [sessions]);

  useEffect(() => {
    const yearToUse = availableSessions?.length > 0 ? availableSessions[0] : pastFiveYears[0];
    if (yearToUse && currentYear !== yearToUse) {
      setCurrentYear(yearToUse);
    }
  }, [availableSessions, pastFiveYears, currentYear]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria4/score433");
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

  useEffect(() => {
    if (!availableSessions?.length && pastFiveYears.length > 0) {
      setCurrentYear(pastFiveYears[0]);
    }
  }, [availableSessions, pastFiveYears]);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      alert('Please select an option');
      return;
    }

    // Map the selected option to score
    const optionToScore = {
      'option1': 5,  // ≥ 50 MBPS
      'option2': 4,  // 30 - 50 MBPS
      'option3': 3,  // 10 - 30 MBPS
      'option4': 2,  // 10 - 5 MBPS
      'option5': 1   // less than 5 MBPS
    };

    const score = optionToScore[selectedOption] || 0;

    try {
      const response = await axios.post('http://localhost:3000/api/v1/criteria4/createResponse433', {
        session: currentYear.split("-")[0],
        options: score,
      });
      
      // Update local state with the new entry
      const newRow = {
        year: currentYear,
        bandwidth: selectedOption,
      };
      
      setRows([...rows, newRow]);
      setSelectedOption(''); // Reset selection after adding
      
      // Refresh the score after successful submission
      await fetchScore();
      
      alert('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Failed to submit data: ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('Failed to submit data. Please check your connection and try again.');
      }
    }
  };

  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex">
    <Sidebar onCollapse={setIsSidebarCollapsed} />
    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 pt-4`}>

        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          {/* Page Title and Score */}
          <div className="flex justify-between items-center mb-3 ">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 4: Infrastructure and Learning Resources
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">- 4.3 IT Infrastructure</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
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


          {/* Year Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-gray-950"
            >
              {availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.3.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
               Bandwidth of internet connection in the Institution  <br/>      
A. ≥ 50 MBPS <br/>  
B. 30 - 50 MBPS  <br/>  
C. 10 - 30 MBPS<br/>
D. 10 - 5 MBPS<br/>
E. less than 50 MBPS<br/>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Data Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Available internet bandwidth </li>
               </ul>
            </div>
          </div>
        
          {/* Radio Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the Options <br/> 
A. ≥ 50 MBPS<br/> 
B. 30 - 50 MBPS<br/> 
C. 10 - 30 MBPS<br/> 
D. 10 - 5 MBPS<br/> 
E. less than 5 MBPS<br/> 
            </h3>
            <div className="space-y-3">
              {[
                " ≥ 50 MBPS" ,
                "30 - 50 MBPS",
                "10 - 30 MBPS" ,
                "10 - 5 MBPS" ,
                "less than 5 MBPS"
              ].map((label, index) => {
                const optionKey = `option${index + 1}`;
                return (
                  <div key={optionKey} className="flex items-center">
                    <input
                      type="radio"
                      id={optionKey}
                      name="participation"
                      className="mr-3 h-4 w-4 text-blue-600"
                      checked={selectedOption === optionKey}
                      onChange={() => handleRadioChange(optionKey)}
                    />
                    <label htmlFor={optionKey} className="text-sm text-gray-800">{label}</label>
                  </div>
                );
              })}
              <div className="mt-4">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>Upload any additional Information</li>
<li>Details of available bandwidth of internet connection in the
Institution </li>
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

<label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Paste Link for Additional Information</label>
<input
  type="text"
  placeholder="Enter URL here"
  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
/>
          </div>
          
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_3_3;