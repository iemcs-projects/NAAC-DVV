import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import UserDropdown from "../../components/UserDropdown";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import { useAuth } from "../../auth/authProvider";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";

const Criteria1_4_1 = () => {
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const [useupload, setUseupload] = useState(false);
  const { user } = useAuth();
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  const [selectedOption, setSelectedOption] = useState("");
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [currentYear, setCurrentYear] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [department, setDepartment] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [formData, setFormData] = useState({
    supportLinks: []
  });
  
  const navigate = useNavigate();
  
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
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score141", {
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

  const handleRadioChange = (option) => {
    setSelectedOption(option);
    console.log('Selected option (number):', option, 'Type:', typeof option);
  };

  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleRowNameChange = (id, name) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
  };
const goToNextPage = () => {
    navigate('/criteria1.4.2'); 
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

      const response = await axios.post("http://localhost:3000/api/v1/criteria1/createResponse141", {
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

  const goToPreviousPage = () => {
    navigate('/criteria1.3.3'); 
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
              <p className="text-2xl font-bold text-gray-800">Criteria 1-Curricular Planning and Implementation</p>
              <p className="text-gray-600 text-sm">1.4 Feedback System</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          {/* Score Display */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (1.4.1): {provisionalScore.data.score}
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
              <h3 className="text-blue-600 font-medium mb-2">1.4.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Institution obtains  feedback on the syllabus and its transaction at the 
institution from the following  stakeholders <br/>

1. Students <br/>
2.Teachers <br/>
3.Employers <br/>
4.Alumni   <br/>
              </p>
            </div>

            

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Report of analysis of feedback received from different stakeholders year 
wise </li>
               
                
              </ul>
            </div>
          </div>


          {/* Inputs Grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Department</label>
              <select 
                className="w-full border text-gray-950 border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
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
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 w-[100px]">Faculty Name</label>
              <input
                type="text"
                placeholder="Enter faculty name"
                className="text-gray-950 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
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
              Institution obtains  feedback on the syllabus and its transaction at the 
institution from the following  stakeholders 
  ) <br/> 1.Students <br/> 2.Teachers<br/> 3.Employers<br/> 4.Alumni
            </h3>
            <div className="space-y-3">
              {[
                { value: 4, label: "All of the above" },
                { value: 3, label: "Any 3 of the above" },
                { value: 2, label: "Any 2 of the above" },
                { value: 1, label: "Any 1 of the above" },
                { value: 0, label: "None of the above" }
              ].map((item, index) => {
                const optionKey = `option_${item.value}`;
                return (
                  <div key={optionKey} className="flex items-center">
                    <input
                      type="radio"
                      id={optionKey}
                      name="stakeholder_feedback"
                      className="mr-3 h-4 w-4 text-blue-600"
                      checked={selectedOption === item.value}
                      onChange={() => handleRadioChange(item.value)}
                      required
                    />
                    <label htmlFor={optionKey} className="text-sm text-gray-800">
                      {item.label}
                    </label>
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
              <li>URL for stakeholder feedback report 
</li>
              <li>Action taken report of the Institution on feedback report as stated in the 
minutes of the Governing Council, Syndicate, Board of Management 
(Upload)</li>
<li>Any additional information (Upload) </li>
            </ul>
          </div>

          <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        Upload Documents
      </label>
      <div className="flex items-center gap-4 mb-2">
      <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
  <i className="fas fa-upload mr-2"></i> Choose Files
  <input
    type="file"
    className="hidden"
    multiple
    onChange={async (e) => {
      const filesArray = Array.from(e.target.files);
      for (const file of filesArray) {
        try {
          const uploaded = await uploadFile(
            "criteria1_2_2",
            file,
            "1.2.2",
            currentYear
          );
          setFormData((prev) => ({
            ...prev,
            supportLinks: [...prev.supportLinks, uploaded.file_url],
          }));
        } catch (err) {
          alert(err.message || "Upload failed");
        }
      }
    }}
  />
</label>
        {/* Status Messages */}
        {uploading && <span className="text-gray-600">Uploading...</span>}
{error && <span className="text-red-600">{error}</span>}
      </div>
      </div>
      {formData.supportLinks.length > 0 && (
    <ul className="list-disc pl-5 text-gray-700">
      {formData.supportLinks.map((link, index) => (
        <li key={index} className="flex justify-between items-center mb-1">
          <a
            href={`http://localhost:3000${link}`} // ✅ prefix with backend base URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {link.split("/").pop()}
          </a>
          <button
            type="button"
            onClick={() => {
              // Remove from local formData
              setFormData(prev => ({
                ...prev,
                supportLinks: prev.supportLinks.filter(l => l !== link)
              }));
              // Also remove from context
              removeFile("criteria1_1_3", link);
            }}
            className="text-red-600 ml-2"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )}
          
          {/* Bottom Navigation */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
    </div>

 
  );
};

export default Criteria1_4_1;
