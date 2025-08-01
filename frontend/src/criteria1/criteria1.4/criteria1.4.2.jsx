import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import Criteria2_1_1 from "../../criteria2/criteria2.1/criteria2.1.1";
import LandingNavbar from "../../components/landing-navbar";
const Criteria1_4_2 = () => {
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  const [selectedOption, setSelectedOption] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);

  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]); // Default to most recent session
    }
  }, [availableSessions]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score142", {
        params: {
          session: currentYear ? currentYear.split('-')[0] : null
        }
      });
      
      console.log('Score API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (response.data && typeof response.data === 'object') {
        setProvisionalScore(response.data);
        console.log('Successfully set provisionalScore:', response.data);
      } else {
        console.warn('Unexpected response format from score API:', response.data);
        setProvisionalScore(null);
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        setError(`Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        setError(error.message);
      }
      setProvisionalScore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);


  const [additionalInfo, setAdditionalInfo] = useState("");
  const handleRadioChange = (option) => {
    console.log('Selected option:', option, 'Type:', typeof option);
    setSelectedOption(option);
  };

  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedOption === undefined || selectedOption === '') {
      alert("Please select an option");
      return;
    }

    try {
      // Ensure selectedOption is a number
      const optionValue = Number(selectedOption);
      const sessionYear = parseInt(currentYear.split('-')[0], 10);
      
      console.log('Submitting data...', {
        session: sessionYear,
        option_selected: optionValue,
      });

      const response = await axios.post("http://localhost:3000/api/v1/criteria1/createResponse142", {
        session: sessionYear,
        option_selected: optionValue,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success) {
        alert("Data submitted successfully!");
        fetchScore(); // Refresh the score after submission
      } else {
        console.error('Unexpected response format:', response.data);
        alert("Received unexpected response from server. Check console for details.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        alert(`Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        alert('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleRowNameChange = (id, name) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
  };
  const navigate = useNavigate();
  const goToNextPage = () => {
    navigate('/criteria2.1.1'); 
  };

  const goToPreviousPage = () => {
    navigate('/criteria1.4.1'); 
  };
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <LandingNavbar />

      <div className="flex mt-6 flex-1">
        <Sidebar />

        <div className="flex-1 mt-6 flex flex-col p-4">
          {/* Page Title and Score */}
           
          <div className="flex justify-between items-center mb-3 ">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 1: Curricular Aspects
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">1.4-Feedback System</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (1.4.2): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>


          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">1.4.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Feedback process of the Institution may be classified as follows: <br/>
Options: <br/>
A. Feedback collected, analysed and action taken and feedback <br/>
available on website 
B. Feedback collected, analysed and action has been taken  <br/>
C. Feedback collected and analysed <br/>
D. Feedback collected <br/>
E.  Feedback not collected
              </p>
            </div>

            

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Upload Stakeholders feedback report, Action taken report of the institute 
on it as stated in the minutes of the Governing Council, Syndicate, 
Board of Management </li>
               
               
              </ul>
            </div>
          </div>


          {/* Inputs Grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Department</label>
              <select className="w-full border text-gray-950 border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select department</option>
                <option value="computer-science">Computer Science</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Faculty ID</label>
              <input
                type="text"
                placeholder="Enter faculty ID"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 w-[100px]">Faculty Name</label>
              <input
                type="text"
                placeholder="Enter faculty name"
                className=" text-gray-950 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div> */}
          <div className="mb-4">
            <div className="flex items-center">
              <label className="font-medium text-gray-700 mr-2">Select Year:</label>
              <select
                className="border px-3 py-1 rounded text-black"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
              >
                {availableSessions && availableSessions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Radio Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the Options ( Feedback process of the Institution
  )  
            </h3>
            <div className="space-y-3">
              {[
                { value: 4, label: "Feedback collected, analysed and action taken and feedback available on website" },
                { value: 3, label: "Feedback collected, analysed and action has been taken" },
                { value: 2, label: "Feedback collected and analysed" },
                { value: 1, label: "Feedback collected" },
                { value: 0, label: "Feedback not collected" }
              ].map((item, index) => {
                const optionKey = `option_${item.value}`;
                return (
                  <div key={optionKey} className="flex items-center">
                    <input
                      type="radio"
                      id={optionKey}
                      name="participation"
                      className="mr-3 h-4 w-4 text-blue-600"
                      checked={selectedOption === item.value}
                      onChange={() => handleRadioChange(item.value)}
                    />
                    <label htmlFor={optionKey} className="text-sm text-gray-800">{item.label}</label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-2 py-2 border">
                    <button
                      onClick={handleSubmit}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>URL for the feedback report 
</li>
              <li>Upload Stakeholders feedback report, Action taken report of the institute 
on it as stated in the minutes of the Governing Council, Syndicate, 
Board of Management </li>
<li>Any additional information (Upload) </li>
            </ul>
          </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
                <i className="fas fa-upload mr-2"></i>Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Paste Link for Additional Information</label>
            <input
              type="text"
              placeholder="Enter URL here"
              className="w-full px-4 py-2 border rounded text-gray-900"
            />
            
          </div>

          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
          
          
        </div>
      </div>
    </div>
  );
};

export default Criteria1_4_2;
