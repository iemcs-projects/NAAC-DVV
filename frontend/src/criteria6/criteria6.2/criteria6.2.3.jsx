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

  const eGovernanceAreas = [
    "Administration",
    "Finance and Accounts",
    "Student Admission and Support",
    "Examination"
  ];

  const [governanceData, setGovernanceData] = useState([
    { area: "", year: "" }
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

  const handleAreaChange = (index, value) => {
    const updatedData = [...governanceData];
    updatedData[index].area = value;
    setGovernanceData(updatedData);
  };

  const handleYearChange = (index, value) => {
    const updatedData = [...governanceData];
    updatedData[index].year = value;
    setGovernanceData(updatedData);
  };

  const addNewRow = () => {
    setGovernanceData([...governanceData, { area: "", year: "" }]);
  };

  const removeRow = (index) => {
    if (governanceData.length > 1) {
      const updatedData = governanceData.filter((_, i) => i !== index);
      setGovernanceData(updatedData);
    }
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
      // Validate that all rows have both area and year filled
      const hasEmptyFields = governanceData.some(item => !item.area.trim() || !item.year.trim());
      if (hasEmptyFields) {
        alert("Please fill in all fields for each row");
        return;
      }

      // Filter out any empty rows that might have been added
      const filledData = governanceData.filter(item => item.area.trim() !== '' && item.year.trim() !== '');
      
      if (filledData.length === 0) {
        alert("Please add at least one entry");
        return;
      }

      // Check if at least one area is selected in the table
      const hasSelectedAreas = governanceData.some(item => item.area.trim() !== '');
      if (!hasSelectedAreas) {
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
          // implimentation: implementationCount,
          area_of_e_governance: item.area,
          year_of_implementation: parseInt(item.year) || new Date().getFullYear()
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
      
      const successMessage = `Successfully submitted data for ${filledData.length} area(s) with ${implementationCount} governance areas selected`;
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
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score623");
      console.log('API Response:', response);
      

      // Handle different possible response structures
      const scoreData = response.data?.data?.entry || response.data?.data || response.data;
      
      if (scoreData) {
        console.log('Score data:', scoreData);
        // Set the entire response data and let the display logic handle it

        setProvisionalScore(scoreData);
      } else {
        console.log('No score data found in response');
        setProvisionalScore(null);
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
      setProvisionalScore(null);
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

            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (6.2.3): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
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
            
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Areas of E-Governance Implementation</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Areas of e-governance
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Year of Implementation
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {governanceData.map((item, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 border border-gray-300">
                          <select
                            value={item.area}
                            onChange={(e) => handleAreaChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Area</option>
                            {eGovernanceAreas.map((area, i) => (
                              <option 
                                key={i} 
                                value={area}
                                disabled={governanceData.some((item, idx) => item.area === area && idx !== index)}
                              >
                                {area}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 border border-gray-300">
                          <input
                            type="number"
                            value={item.year}
                            onChange={(e) => handleYearChange(index, e.target.value)}
                            placeholder="e.g. 2023"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="2000"
                            max={new Date().getFullYear()}
                          />
                        </td>
                        <td className="px-4 py-3 border border-gray-300 text-center space-x-2">
                          <button
                            type="button"
                            onClick={handleSubmit}
                            className="text-green-600 hover:text-green-800"
                            title="Add entry"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          {governanceData.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              className="text-red-600 hover:text-red-800 ml-2"
                              title="Remove row"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={addNewRow}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                  >
                    + Add Another Area
                  </button>
                </div>
              </div>
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