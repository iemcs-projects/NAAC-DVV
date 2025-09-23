import React, { useState, useMemo, useContext, useEffect } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { FaTrash, FaEdit } from 'react-icons/fa';
import api from "../../api";
import DataEntryNavbar from "../../components/DataEntryNavbar";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria6_3_2 = () => {
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

  const pastFiveYears = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) =>
        `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
      ),
    []
  );

  // Form data for single entry
  const [formData, setFormData] = useState({
    year: "",
    name: "",
    conf: "",
    name_body: "",
    amt: "",
    supportLinks: []
  });

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
        
        const response = await api.get(
          "/criteria2/getResponse/6.3.2", 
          { 
            params: { 
              session: yearToSend
            }
          }
        );
        
        console.log('Full API Response:', JSON.stringify(response, null, 2));
        
        if (!response.data) {
          console.warn('No data in response');
          return [];
        }
        
        console.log('Response data structure:', {
          hasData: !!response.data,
          hasDataData: !!response.data.data,
          dataKeys: Object.keys(response.data),
          dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
          dataData: response.data.data ? 
            (Array.isArray(response.data.data) ? 'array' : typeof response.data.data) : 'no data.data'
        });
        
        // Handle both response.data and response.data.data
        let data = response.data.data || response.data;
        
        // If data is not an array but is an object, convert it to an array
        console.log('Data before processing:', data);
        if (data) {
          if (!Array.isArray(data)) {
            console.log('Converting single object to array');
            data = [data];
          }
        } else {
          console.warn('Data is null or undefined');
          return [];
        }
        
        if (!data) {
          console.warn('No data array in response');
          return [];
        }
        
        // Map the data to ensure consistent structure
        const mappedData = data.map(item => {
          console.log('Raw database item:', item);
          
          const mappedItem = {
            id: item.id || item.sl_no,
            sl_no: item.sl_no || item.id,
            teacher_name: item.teacher_name || 'N/A',
            conference_name: item.conference_name || 'N/A',
            professional_body: item.professional_body || 'N/A',
            amt_of_spt_received: item.amt_of_spt_received || 'N/A',
            year: item.year || year,
            ...item
          };
          
          console.log('Mapped item:', mappedItem);
          return mappedItem;
        });
        
        console.log('Final mapped data:', mappedData);
        
        // Store the SL numbers in localStorage for each entry
        mappedData.forEach(item => {
          if (item.sl_no) {
            localStorage.setItem(`criteria5.3.1_slNo_${item.id || item.sl_no}`, item.sl_no);
          }
        });
        
        return mappedData;
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
    
    const cachedScore = localStorage.getItem(`criteria632_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria632_score_${currentYear}`);
      }
    }
    
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score632");
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
            `criteria632_score_${currentYear}`, 
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
        session: parseInt(yearToSend, 10),  // int
        year: yearToSend,  // Just the year part as string (e.g., "2023")
        teacher_name: formDataToSubmit.name.trim(),  // string
        conference_name: formDataToSubmit.conf.trim(),  // string (text in DB)
        professional_body: formDataToSubmit.name_body.trim(),  // string (text in DB)
        amt_of_spt_received: formDataToSubmit.amt ? formDataToSubmit.amt.toString() : '0',  // string (varchar)
        support_links: JSON.stringify(formDataToSubmit.supportLinks || []),  // stringify array for DB
        criteria: '6.3.2'  // string
      };
      
      console.log('Sending request with payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria6/createResponse632", 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true,
          validateStatus: (status) => status < 500 // Reject only if the status code is greater than or equal to 500
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Request was successful');
        setSuccess('Faculty financial support data submitted successfully!');
        
        // Refresh the data from the server
        const updatedData = await fetchResponseData(currentYear);
        
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSubmittedData(updatedData);
        
        // Reset form
        setFormData({
          year: currentYear,
          name: "",
          conf: "",
          name_body: "",
          amt: "",
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
        session: parseInt(yearToSend, 10),  // int
        year: yearToSend,  // Just the year part as string (e.g., "2023")
        teacher_name: formDataToSubmit.name.trim(),  // string
        conference_name: formDataToSubmit.conf.trim(),  // string (text in DB)
        professional_body: formDataToSubmit.name_body.trim(),  // string (text in DB)
        amt_of_spt_received: formDataToSubmit.amt ? formDataToSubmit.amt.toString() : '0',  // string (varchar)
        support_links: JSON.stringify(formDataToSubmit.supportLinks || []),  // stringify array for DB
        criteria: '6.3.2'  // string
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put(
        `/criteria2/updateResponse/${entryId}`, 
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
      const response = await api.delete(
        `/criteria2/deleteResponse/${entryId}`,
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
        
        // Refresh data and score
        const updatedData = await fetchResponseData(currentYear);
        setSubmittedData(updatedData || []);
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

  // Validate form data before submission
  const validateFormData = (data) => {
    const errors = [];
    
    if (!data.name || data.name.trim() === '') {
      errors.push('Teacher name is required');
    }
    
    if (!data.conf || data.conf.trim() === '') {
      errors.push('Conference name is required');
    }
    
    if (!data.name_body || data.name_body.trim() === '') {
      errors.push('Professional body name is required');
    }
    
    if (!data.amt || isNaN(parseFloat(data.amt)) || parseFloat(data.amt) <= 0) {
      errors.push('Please enter a valid amount');
    }
    
    if (!data.year || isNaN(parseInt(data.year, 10))) {
      errors.push('Please select a valid year');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const formDataWithYear = { 
        ...formData,
        year: formData.year?.toString() || currentYear.toString()
      };
      
      console.log('Submitting form data:', formDataWithYear);
      
      // Validate form data
      validateFormData(formDataWithYear);
      
      // Submit data
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
        year: currentYear,
        name: "",
        conf: "",
        name_body: "",
        amt: "",
        supportLinks: []
      });
      
      // Refresh data
      const updatedData = await fetchResponseData(currentYear);
      setSubmittedData(updatedData || []);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit form';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSubmitting(false);
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
  const goToNextPage = () => navigate("/criteria6.3.3");
  const goToPreviousPage = () => navigate("/criteria6.3.1");

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Serial No.',
      'Year',
      'Teacher Name',
      'Conference/Workshop Name',
      'Professional Body Name',
      'Amount (INR)'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.year || ''}"`,
        `"${entry.teacher_name || ''}"`,
        `"${entry.conference_name || ''}"`,
        `"${entry.professional_body || ''}"`,
        entry.amt_of_spt_received || 0
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_6.3.2_data_${new Date().toISOString().split('T')[0]}.csv`);
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
              <p className="text-gray-600 text-sm">6.3 Faculty Empowerment Strategies</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          {/* Metric Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">6.3.2 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-4">
              Average percentage of teachers provided with financial support to attend conferences/workshop and towards membership fee of professional bodies during the last five years
            </p>

            <h4 className="text-blue-600 font-medium mb-2">Calculation Formula</h4>
            <p className="text-sm text-gray-700 mb-4">
              Percentage = (Number of teachers provided with financial support to attend conferences, workshops and towards membership fee of professional bodies / Number of full time teachers) × 100
            </p>

            <h4 className="text-blue-600 font-medium mb-2">Required Documents:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Minutes of relevant Academic Council/ BOS meetings</li>
              <li className="mb-1">Any additional information</li>
              <li>Details of teachers provided with financial support to attend conference, workshops etc during the last five years (Data Template)</li>
            </ul>
          </div>

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
                Provisional Score (6.3.2): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
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

          <h2 className="text-xl font-bold text-gray-500 mb-4">Faculty Financial Support Entry</h2>

          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {isEditMode ? 'Edit Financial Support Entry' : 'Add Financial Support Entry'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-12 gap-3 mb-4 items-end">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Teacher Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Teacher name"
                    required
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Conference/Workshop *
                  </label>
                  <input
                    type="text"
                    value={formData.conf}
                    onChange={(e) => handleChange("conf", e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Conference/workshop name"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Professional Body *
                  </label>
                  <input
                    type="text"
                    value={formData.name_body}
                    onChange={(e) => handleChange("name_body", e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Professional body"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    value={formData.amt}
                    onChange={(e) => handleChange("amt", e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full px-3 py-1.5 text-sm text-white rounded ${
                      isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    } ${submitting ? 'opacity-50' : ''} transition-colors`}
                  >
                    {submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add Entry')}
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
                        year: currentYear,
                        name: "",
                        conf: "",
                        name_body: "",
                        amt: "",
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
                <li>Minutes of relevant Academic Council/ BOS meetings</li>
                <li>Details of teachers provided with financial support</li>
                <li>Any additional supporting information</li>
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
                          "criteria6_3_2",
                          file,
                          "6.3.2",
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
                        removeFile("criteria6_3_2", link);
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
                      <th className="border border-black px-4 py-2 text-gray-800">Conference/Workshop</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Professional Body</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Amount (INR)</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.teacher_name}-${entry.conference_name}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.teacher_name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.conference_name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.professional_body}</td>
                        <td className="border border-black text-black px-4 py-2">₹{entry.amt_of_spt_received?.toLocaleString()}</td>
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
                <p className="px-4 py-2 text-gray-500">No financial support data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Summary Statistics */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Financial Support Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-2">Total Entries</h4>
                <div className="text-2xl font-bold text-blue-700">
                  {Object.values(yearData).reduce((total, yearEntries) => 
                    total + (yearEntries ? yearEntries.length : 0), 0
                  )}
                </div>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                <h4 className="font-medium text-green-800 mb-2">Total Amount Supported</h4>
                <div className="text-2xl font-bold text-green-700">
                  ₹{Object.values(yearData).reduce((total, yearEntries) => {
                    if (!yearEntries) return total;
                    return total + yearEntries.reduce((sum, entry) => 
                      sum + (entry.amt_of_spt_received || 0), 0
                    );
                  }, 0).toLocaleString()}
                </div>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50">
                <h4 className="font-medium text-purple-800 mb-2">Years with Data</h4>
                <div className="text-2xl font-bold text-purple-700">
                  {Object.values(yearData).filter(yearEntries => 
                    yearEntries && yearEntries.length > 0
                  ).length} / {availableSessions?.length || 0}
                </div>
              </div>
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

export default Criteria6_3_2;