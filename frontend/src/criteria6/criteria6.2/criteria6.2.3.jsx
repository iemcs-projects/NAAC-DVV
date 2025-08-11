import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria6_2_3 = () => {
  const navigate = useNavigate();
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  
  const [currentYear, setCurrentYear] = useState("");
  
  // Multiple selection checkboxes for governance areas
  const [selectedOptions, setSelectedOptions] = useState({
    administration: false,
    financeAccounts: false,
    studentAdmissionSupport: false,
    examination: false,
  });

  const [governanceData, setGovernanceData] = useState([
    { area: "Administration", year: "" },
    { area: "Finance and Accounts", year: "" },
    { area: "Student Admission and Support", year: "" },
    { area: "Examination", year: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);

  // Set default year when sessions are loaded
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]);
    }
  }, [availableSessions]);

  // Handle checkbox changes
  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => {
      const newState = {
        ...prev,
        [option]: !prev[option]
      };
      console.log("Checkbox changed:", option, "new state:", newState);
      return newState;
    });
  };

  const handleYearChange = (index, value) => {
    const updatedData = [...governanceData];
    updatedData[index].year = value;
    setGovernanceData(updatedData);
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
      // Validate that at least one option is selected
      const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
      console.log('Selected governance areas:', selectedOptions);
      
      if (selectedCount === 0) {
        alert("Please select at least one governance area");
        return;
      }

      // Filter out items with empty years (only submit rows with data)
      const filledData = governanceData.filter(item => item.year.trim() !== '');
      console.log('Filled data to submit:', filledData);
      
      if (filledData.length === 0) {
        alert("Please enter at least one year of implementation");
        return;
      }

      // Show alert if no options are selected
      if (selectedCount === 0) {
        alert("Please select at least one governance area before submitting");
        return;
      }

      if (!currentYear) {
        alert("Please select a session year");
        return;
      }
      
      // Calculate implementation count based on selected checkboxes
      const implementationCount = Object.values(selectedOptions).filter(Boolean).length;
      console.log("Total selected options:", implementationCount, "Selected options:", selectedOptions);
      
      // Send each filled item as a separate request with the same implementation value
      const requests = filledData.map((item, index) => {
        const requestBody = {
          session: parseInt(currentYear.split('-')[0], 10),
          implimentation: implementationCount,
          area_of_e_governance: item.area,
          year_of_implementation: parseInt(currentYear.split('-')[0])
        };
        
        console.log('Request body for', item.area, ':', requestBody);
        
        // Update the year in the UI to match the session
        const updatedData = [...governanceData];
        updatedData[index] = {
          ...item,
          year: currentYear
        };
        setGovernanceData(updatedData);
        
        return axios.post(
          "http://localhost:3000/api/v1/criteria6/createResponse623", 
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true
          }
        ).then(response => {
          console.log('Success response for', item.area, ':', response.data);
          return response;
        }).catch(error => {
          console.error('Error response for', item.area, ':', error.response?.data || error.message);
          throw error;
        });
      });
      
      // Wait for all requests to complete
      const responses = await Promise.all(requests);
      console.log('All responses:', responses);
      
      const successMessage = `Successfully submitted data for ${filledData.length} area(s) with ${selectedCount} governance areas selected`;
      console.log(successMessage);
      alert(successMessage);
      
      // Reset form
      setGovernanceData(governanceData.map(item => ({ ...item, year: '' })));
      setSelectedOptions({
        administration: false,
        financeAccounts: false,
        studentAdmissionSupport: false,
        examination: false,
      });
      
      // Refresh score
      await fetchScore();
      
    } catch (error) {
      console.error("Submission failed:", error);
      let errorMessage = "Submission failed!";
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        console.error('Error:', error.message);
      }
      alert(errorMessage);
    }
  };

  const fetchScore = async () => {
    console.log("Fetching score...");
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score623");
      console.log("API Response:", response);
      setProvisionalScore(response.data);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const goToNextPage = () => navigate("/criteria6.3.1");
  const goToPreviousPage = () => navigate("/criteria6.2.2");

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Criteria 6: Governance, Leadership and Management</h2>
            <div className="text-sm text-gray-600">6.2 - Strategy Development and Deployment</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">6.2.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Implementation of e-governance in areas of operation:
                <br />1. Administration
                <br />2. Finance and Accounts  
                <br />3. Student Admission and Support
                <br />4. Examination
                <br /><br />
                Choose from the following:<br />    
                A. Any 4 or more of the above<br />
                B. Any 3 of the above<br />
                C. Any 2 of the above<br />
                D. Any 1 of the above<br />
                E. None of the above
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>ERP (Enterprise Resource Planning) Document</li>
                <li>Screen shots of user interfaces</li>
                <li>Any other relevant document</li>
              </ul>
            </div>
          </div>

          {/* Session Selection */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Session:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? (
                <option>Loading sessions...</option>
              ) : availableSessions ? (
                availableSessions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option>No sessions available</option>
              )}
            </select>
            {sessionError && <p className="text-red-500 text-sm mt-1">{sessionError}</p>}
          </div>

          {/* Provisional Score Section */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (6.2.3): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Multiple Selection Checkboxes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the E-Governance Areas Implemented (Multiple selections allowed)
            </h3>
            <div className="space-y-3">
              {[
                { key: "administration", label: "1. Administration" },
                { key: "financeAccounts", label: "2. Finance and Accounts" },
                { key: "studentAdmissionSupport", label: "3. Student Admission and Support" },
                { key: "examination", label: "4. Examination" }
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
                Selected: {Object.values(selectedOptions).filter(Boolean).length} out of 4 governance areas
              </p>
            </div>
          </div>

          {/* E-Governance Implementation Details Table */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">E-Governance Implementation Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Area of Governance</th>
                    <th className="py-2 px-4 border-b text-left">Year of Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  {governanceData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 text-black px-4 border-b">{item.area}</td>
                      <td className="py-3 text-black px-4 border-b">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            className="w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter full session year (e.g., 2022-23)"
                            value={item.year}
                            onChange={(e) => handleYearChange(index, e.target.value)}
                          />
                          <small className="text-gray-500 mt-1">First year: {currentYear ? currentYear.split('-')[0] : ''}</small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Single Submit Button */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Submit E-Governance Data
              </button>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">Supporting Documents</h3>
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>ERP (Enterprise Resource Planning) Document</li>
                <li>Screen shots of user interfaces</li>
                <li>Any other relevant document</li>
              </ul>
            </div>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, or JPG (MAX. 10MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple />
              </label>
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

export default Criteria6_2_3;