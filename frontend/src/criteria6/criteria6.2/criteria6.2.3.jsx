import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { FaTrash, FaEdit } from 'react-icons/fa';
import DataEntryNavbar from "../../components/DataEntryNavbar";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria6_2_3 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  
  const [currentYear, setCurrentYear] = useState("");
  const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [yearData, setYearData] = useState({});
  const [submittedData, setSubmittedData] = useState([]);

  // Form data for single entry
  const [formData, setFormData] = useState({
    area: "",
    year: "",
    supportLinks: []
  });

  const eGovernanceAreas = [
    "Administration",
    "Finance and Accounts", 
    "Student Admission and Support",
    "Examination"
  ];

  // Set default year when sessions are loaded
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0 && !currentYear) {
      const firstYear = availableSessions[0];
      setCurrentYear(firstYear);
      setFormData(prev => ({ ...prev, year: firstYear }));
    }
  }, [availableSessions, currentYear]);

  // Fetch response data for a specific year
  const fetchResponseData = async (year) => {
    console.log('Fetching data for year:', year);
    if (!year) {
      console.log('No year provided, returning empty array');
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const yearToSend = year.split("-")[0];
      console.log('Sending request with session:', yearToSend);
      
      const response = await axios.get(
        "http://localhost:3000/api/v1/criteria2/getResponse/6.2.3",
        { 
          params: { 
            session: yearToSend
          },
          withCredentials: true
        }
      );
      
      console.log('API Response:', response.data);
      
      if (!response.data || !response.data.data) {
        console.warn('No data in response');
        return [];
      }
      
      // Map the response data to match our form fields
      const data = response.data.data.map(item => ({
        id: item.id,
        area_of_e_governance: item.area_of_e_governance || '',
        year_of_implementation: item.year_of_implementation || year,
        session: item.session || yearToSend,
        supportLinks: item.support_links || []
      }));
      
      console.log('Mapped data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching response data:', error);
      setError('Failed to fetch data. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch score
  const fetchScore = async () => {
    if (!currentYear) return;
    
    const cachedScore = localStorage.getItem(`criteria623_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria623_score_${currentYear}`);
      }
    }
    
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score623");
      console.log('API Response:', response);
      
      const scoreData = response.data?.data?.entry || response.data?.data || response.data;
      
      if (scoreData) {
        console.log('Score data:', scoreData);
        setProvisionalScore(scoreData);
        
        if (scoreData) {
          const cacheData = {
            data: scoreData,
            timestamp: Date.now()
          };
          localStorage.setItem(
            `criteria623_score_${currentYear}`, 
            JSON.stringify(cacheData)
          );
        }
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

  // Handle create new entry
  const handleCreate = async (formDataToSubmit) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const yearToSend = formDataToSubmit.year.split("-")[0];

      const payload = {
        session: parseInt(yearToSend, 10),
        area_of_e_governance: formDataToSubmit.area,
        year_of_implementation: parseInt(formDataToSubmit.implementationYear) || parseInt(yearToSend),
        support_links: formDataToSubmit.supportLinks || []
      };
      
      console.log('Sending request with payload:', payload);
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria6/createResponse623", 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      
      console.log('Response received:', response);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        alert('E-Governance data submitted successfully!');
        
        // Refresh the data from the server
        const updatedData = await fetchResponseData(currentYear);
        
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSubmittedData(updatedData);
        
        // Reset form
        setFormData({
          area: "",
          year: currentYear,
          implementationYear: "",
          supportLinks: []
        });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        
        // Refresh score
        await fetchScore();
      }
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
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update entry
  const handleUpdate = async (formDataToSubmit) => {
    const entryId = formDataToSubmit.id;
    if (!entryId) {
      const errorMsg = "No entry selected for update";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const yearToSend = formDataToSubmit.year?.split("-")[0] || new Date().getFullYear().toString();

      const payload = {
        session: parseInt(yearToSend, 10),
        area_of_e_governance: formDataToSubmit.area,
        year_of_implementation: parseInt(formDataToSubmit.implementationYear) || parseInt(yearToSend),
        support_links: formDataToSubmit.supportLinks || []
      };
      
      console.log('Sending update payload:', payload);
      const response = await axios.put(
        `http://localhost:3000/api/v1/criteria6/updateResponse623/${entryId}`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      
      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.message || "Failed to update entry";
        throw new Error(errorMsg);
      }
      
      // Refresh the data from the server
      const updatedData = await fetchResponseData(currentYear);
      
      setYearData(prev => ({
        ...prev,
        [currentYear]: updatedData
      }));
      setSubmittedData(updatedData);
      
      setSuccess('Entry updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      return true;
    } catch (err) {
      console.error("Error updating entry:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to update entry";
      setError(errorMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Validate form data
  const validateFormData = (dataToSubmit) => {
    const yearInput = dataToSubmit.year || currentYear;
    const yearToSend = yearInput.split("-")[0];
    const session = parseInt(yearToSend);
    const currentYearNum = new Date().getFullYear();
    const missingFields = [];

    // Check required fields
    if (!dataToSubmit.area?.trim()) missingFields.push("E-Governance Area");
    if (!dataToSubmit.implementationYear?.trim()) missingFields.push("Year of Implementation");
    
    if (missingFields.length > 0) {
      throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }
    
    const implYear = parseInt(dataToSubmit.implementationYear);
    if (isNaN(implYear) || implYear < 1990 || implYear > currentYearNum) {
      throw new Error(`Implementation year must be between 1990 and ${currentYearNum}.`);
    }

    return true;
  };

  // Handle edit
  const handleEdit = (entry) => {
    const editFormData = {
      id: entry.id,
      area: entry.area_of_e_governance || '',
      year: entry.session ? `${entry.session}-${entry.session + 1}` : currentYear,
      implementationYear: entry.year_of_implementation || '',
      supportLinks: entry.supportLinks || []
    };
    
    setFormData(editFormData);
    setIsEditMode(true);
    setEditKey(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete entry
  const handleDelete = async (entryId) => {
    if (!entryId) {
      console.error('No entry ID provided for deletion');
      setError('Error: No entry selected for deletion');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.delete(
        `http://localhost:3000/api/v1/criteria6/deleteResponse623/${entryId}`,
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        // Remove from current display
        setSubmittedData(prev => prev.filter(entry => entry.id !== entryId));
        
        // Update year data
        setYearData(prev => ({
          ...prev,
          [currentYear]: (prev[currentYear] || []).filter(entry => entry.id !== entryId)
        }));
        
        setSuccess('Entry deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        
        // Refresh score
        await fetchScore();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError(error.response?.data?.message || 'Failed to delete entry. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataWithYear = { 
        ...formData,
        year: formData.year?.toString() || currentYear.toString()
      };
      
      console.log('Submitting form data:', formDataWithYear);
      
      validateFormData(formDataWithYear);
      
      if (isEditMode && formData.id) {
        console.log('Updating entry:', formDataWithYear);
        await handleUpdate(formDataWithYear);
        setIsEditMode(false);
      } else {
        console.log('Creating new entry:', formDataWithYear);
        await handleCreate(formDataWithYear);
      }
      
      // Reset form after successful operation
      setFormData({
        area: "",
        year: currentYear,
        implementationYear: "",
        supportLinks: []
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    try {
      const data = await fetchResponseData(currentYear);
      setSubmittedData(data || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Load data when component mounts or currentYear changes
  useEffect(() => {
    const loadData = async () => {
      if (currentYear) {
        const data = await fetchResponseData(currentYear);
        setSubmittedData(data || []);
      }
    };
    
    loadData();
  }, [currentYear]);

  // Load data for all sessions
  useEffect(() => {
    const loadData = async () => {
      if (availableSessions && availableSessions.length > 0) {
        const promises = availableSessions.map(year => fetchResponseData(year));
        const data = await Promise.all(promises);
        
        const newYearData = {};
        availableSessions.forEach((year, index) => {
          newYearData[year] = data[index];
        });
        
        setYearData(newYearData);
      }
    };

    loadData();
  }, [availableSessions]);

  // Fetch score when currentYear changes
  useEffect(() => {
    if (currentYear) {
      fetchScore();
    }
  }, [currentYear]);

  // Handle year change
  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setCurrentYear(selectedYear);
    setFormData(prev => ({ ...prev, year: selectedYear }));
    setIsEditMode(false);
    setEditKey(null);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Navigation functions
  const goToNextPage = () => navigate("/criteria6.3.1");
  const goToPreviousPage = () => navigate("/criteria6.2.2");

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Serial No.',
      'Area of E-Governance',
      'Year of Implementation'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.area_of_e_governance || ''}"`,
        entry.year_of_implementation || ''
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_6.2.3_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <p className="text-2xl font-bold text-gray-800">Criteria 6 - Governance, Leadership, and Management</p>
              <p className="text-gray-600 text-sm">6.2 Strategy Development and Deployment</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
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

          <h2 className="text-xl font-bold text-gray-500 mb-4">E-Governance Implementation</h2>

          {/* Session Selection */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Session:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={handleYearChange}
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

          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {isEditMode ? 'Edit E-Governance Entry' : 'Add E-Governance Entry'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area of E-Governance *
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Area</option>
                    {eGovernanceAreas.map((area, i) => (
                      <option key={i} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Implementation *
                  </label>
                  <input
                    type="number"
                    value={formData.implementationYear}
                    onChange={(e) => handleChange("implementationYear", e.target.value)}
                    placeholder="e.g. 2023"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2000"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full px-4 py-2 text-white rounded-md ${
                      isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    } ${submitting ? 'opacity-50' : ''} transition-colors`}
                  >
                    {submitting ? 'Saving...' : (isEditMode ? 'Update Entry' : 'Add Entry')}
                  </button>
                </div>
              </div>

              {isEditMode && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setEditKey(null);
                      setFormData({
                        area: "",
                        year: currentYear,
                        implementationYear: "",
                        supportLinks: []
                      });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Upload Documents Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">Supporting Documents</h3>
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>ERP (Enterprise Resource Planning) Document</li>
                <li>Screen shots of user interfaces</li>
                <li>Any other relevant document</li>
              </ul>
            </div>
            
            <div className="mb-4">
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
                          "criteria6_2_3",
                          file,
                          "6.2.3",
                          currentYear
                        );
                        setFormData(prev => ({
                          ...prev,
                          supportLinks: [...(prev.supportLinks || []), uploaded.file_url],
                        }));
                      } catch (err) {
                        console.error("Upload error:", err);
                        alert(err.message || "Upload failed");
                      }
                    }
                  }}
                />
              </label>
              {uploading && <span className="ml-2 text-gray-600">Uploading...</span>}
              {uploadError && <span className="ml-2 text-red-600">{uploadError}</span>}
            </div>
            
            {formData.supportLinks && formData.supportLinks.length > 0 && (
              <ul className="list-disc pl-5 text-gray-700">
                {formData.supportLinks.map((link, index) => (
                  <li key={index} className="flex justify-between items-center mb-1">
                    <a
                      href={`http://localhost:3000${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {link.split("/").pop()}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          supportLinks: prev.supportLinks.filter(l => l !== link)
                        }));
                        removeFile("criteria6_2_3", link);
                      }}
                      className="text-red-600 ml-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Year-wise Data Display */}
          {availableSessions?.map((session) => (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {session}</h3>
              {yearData[session] && yearData[session].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Area of E-Governance</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of Implementation</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.area_of_e_governance}-${entry.year_of_implementation}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.area_of_e_governance}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.year_of_implementation}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => handleEdit(entry)}
                              title="Edit entry"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(entry.id);
                              }}
                              disabled={submitting}
                              title="Delete entry"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-2 text-gray-500">No e-governance data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Summary Statistics */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Implementation Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {eGovernanceAreas.map((area) => {
                const isImplemented = Object.values(yearData).some(yearEntries => 
                  yearEntries && yearEntries.some(entry => entry.area_of_e_governance === area)
                );
                return (
                  <div key={area} className={`p-4 rounded-lg border-2 ${isImplemented ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                    <h4 className="font-medium text-gray-800 mb-2">{area}</h4>
                    <div className={`w-4 h-4 rounded-full ${isImplemented ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={`text-sm ${isImplemented ? 'text-green-700' : 'text-gray-600'}`}>
                      {isImplemented ? 'Implemented' : 'Not Implemented'}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Current Grade Calculation</h4>
              <p className="text-sm text-blue-700">
                {(() => {
                  const implementedCount = eGovernanceAreas.filter(area => 
                    Object.values(yearData).some(yearEntries => 
                      yearEntries && yearEntries.some(entry => entry.area_of_e_governance === area)
                    )
                  ).length;
                  
                  if (implementedCount >= 4) return 'Grade A: Any 4 or more areas implemented';
                  if (implementedCount === 3) return 'Grade B: Any 3 areas implemented';
                  if (implementedCount === 2) return 'Grade C: Any 2 areas implemented';
                  if (implementedCount === 1) return 'Grade D: Any 1 area implemented';
                  return 'Grade E: None of the areas implemented';
                })()}
              </p>
            </div>
          </div>

          {/* Calculation Actions */}
          <div className="flex justify-center mb-6">
            <button 
              onClick={fetchScore}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate Score'}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md z-50">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md z-50">
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Data saved successfully!</span>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                  <span>Loading data...</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria6_2_3