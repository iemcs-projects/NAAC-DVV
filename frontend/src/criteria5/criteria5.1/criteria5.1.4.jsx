import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../../components/landing-navbar";
import api from "../../api";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { FaTrash, FaEdit } from 'react-icons/fa';

const Criteria5_1_4 = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const { sessions: availableSessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [currentYear, setCurrentYear] = useState(availableSessions?.[0] || "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    slNo: '',
    activity_name: "",
    students_participated: "",
    year: new Date().getFullYear().toString(), // Default to current year
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);
  const navigate = useNavigate();

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
        "http://localhost:3000/api/v1/criteria2/getResponse/5.1.4", 
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
          activity_name: item.activity_name || 'N/A',
          students_participated: item.students_participated || 0,
          students_benefitted: item.students_benefitted || 0,
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
          localStorage.setItem(`criteria5.1.4_slNo_${item.id || item.sl_no}`, item.sl_no);
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

  // Fetch score for the current year
  const fetchScore = async () => {
    if (!currentYear) return;
    
    const cachedScore = localStorage.getItem(`criteria514_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria514_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get('http://localhost:3000/api/v1/criteria5/score514');
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria514_score_${currentYear}`, 
          JSON.stringify(cacheData)
        );
      }
    } catch (err) {
      console.error("Error fetching score:", err);
      setError("Failed to load score");
    }
  };

  // Handle create new entry
  const handleCreate = async (formDataToSubmit) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formDataToSubmit.activity_name || !formDataToSubmit.students_participated) {
        throw new Error('Activity name and number of students participated are required');
      }
      
      const yearToSend = formDataToSubmit.year ? formDataToSubmit.year.split("-")[0] : new Date().getFullYear().toString();
      
      const payload = {
        activity_name: formDataToSubmit.activity_name.trim(),
        students_participated: parseInt(formDataToSubmit.students_participated) || 0,
        year: parseInt(yearToSend),  // Convert to number as expected by backend
        session: parseInt(yearToSend)  // Using the same value for session as year
      };
      
      if (isNaN(payload.students_participated) || payload.students_participated < 0) {
        throw new Error('Number of students participated must be a positive number');
      }
      
      console.log('Prepared payload for submission:', JSON.stringify(payload, null, 2));
      
      const response = await api.post('criteria5/createResponse514', payload);
      console.log('Response received:', response);
      
      if (response.data && response.data.success) {
        console.log('Request was successful, showing alert');
        
        // Reset form
        setFormData({
          slNo: '',
          activity_name: "",
          students_participated: "",
          year: new Date().getFullYear().toString(),
          supportLinks: []
        });
        
        // Show success message
        alert('Career counseling data submitted successfully!');
        
        // Store the response ID if available
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria514_${formDataToSubmit.activity_name}_${yearToSend}`, 
            response.data.data.sl_no.toString()
          );
        }
        
        // Refresh the data
        const updatedData = await fetchResponseData(yearToSend);
        
        setYearData(prev => ({
          ...prev,
          [yearToSend]: updatedData
        }));
        
        setSubmittedData(prev => [
          ...prev.filter(item => item.slNo !== formDataToSubmit.slNo), // Remove if updating
          {
            ...formDataToSubmit,
            slNo: response.data?.data?.sl_no || Date.now(),
            year: yearToSend,
            students_benefitted: payload.students_participated // For display
          }
        ]);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Handle API error response
        const errorMsg = response.data?.message || 'Failed to submit data';
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Error creating entry:", err);
      setError(err.response?.data?.message || err.message || "Failed to create entry");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update entry
  const handleUpdate = async (formDataToSubmit) => {
    const entryId = formDataToSubmit.id || formDataToSubmit.slNo;
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
        sl_no: entryId,
        activity_name: formDataToSubmit.activity_name,
        students_participated: parseInt(formDataToSubmit.students_participated) || 0,
        students_benefitted: parseInt(formDataToSubmit.students_benefitted) || 0,
        session: parseInt(yearToSend),
        year: yearToSend,
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put(`http://localhost:3000/api/v1/updateResponse514/${entryId}`, payload);
      
      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.message || "Failed to update entry";
        throw new Error(errorMsg);
      }
      
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

    // Helper function to check string fields
    const checkStringField = (value, fieldName) => {
      if (typeof value === 'string') return value.trim();
      if (value === null || value === undefined) return '';
      return String(value);
    };

    // Check each required field
    if (!checkStringField(dataToSubmit.activity_name)) missingFields.push("Activity Name");
    if (!dataToSubmit.students_participated || isNaN(parseInt(dataToSubmit.students_participated))) missingFields.push("Valid Students Participated Count");
    if (!dataToSubmit.students_benefitted || isNaN(parseInt(dataToSubmit.students_benefitted))) missingFields.push("Valid Students Benefitted Count");
    
    if (missingFields.length > 0) {
      throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }
    
    if (isNaN(session) || session < 1990 || session > currentYearNum) {
      throw new Error(`Year must be between 1990 and ${currentYearNum}.`);
    }

    return true;
  };

  // Handle edit
  const handleEdit = (entry) => {
    console.log('Editing entry:', entry);
    setIsEditMode(true);
    setEditKey(entry.id || entry.sl_no);
    
    // Map the entry data to form fields
    setFormData({
      id: entry.id || entry.sl_no,
      slNo: entry.sl_no || '',
      activity_name: entry.activity_name || '',
      students_participated: entry.students_participated || '',
      students_benefitted: entry.students_benefitted || '',
      supportLinks: entry.support_links || entry.supportLinks || [],
      year: entry.year || currentYear
    });
    
    // Scroll to the form
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle delete entry
  const handleDelete = async (slNo, year) => {
    if (!slNo) {
      console.error('No SL number provided for deletion');
      setError('Error: No entry selected for deletion');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.delete(`http://localhost:3000/api/v1/deleteResponse514/${slNo}`);
      
      if (response.status === 200) {
        setYearData(prev => ({
          ...prev,
          [year]: (prev[year] || []).filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        }));
        
        setSubmittedData(prev => 
          prev.filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        );
        
        setSuccess('Entry deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
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
        year: formData.year?.toString() || currentYear.toString(),
        students_participated: formData.students_participated ? 
          parseInt(formData.students_participated) : 0,
        students_benefitted: formData.students_benefitted ? 
          parseInt(formData.students_benefitted) : 0
      };
      
      console.log('Submitting form data:', formDataWithYear);
      
      validateFormData(formDataWithYear);
      
      if (isEditMode && (formData.id || formData.slNo)) {
        console.log('Updating entry:', formDataWithYear);
        await handleUpdate(formDataWithYear);
        setIsEditMode(false);
      } else {
        console.log('Creating new entry:', formDataWithYear);
        await handleCreate(formDataWithYear);
      }
      
      // Reset form after successful operation
      setFormData({
        slNo: '',
        activity_name: "",
        students_participated: "",
        students_benefitted: "",
        supportLinks: [],
        year: currentYear
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    try {
      const data = await fetchResponseData(currentYear);
      console.log('Setting submitted data:', data);
      setSubmittedData(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Load data when component mounts or currentYear changes
  useEffect(() => {
    const loadData = async () => {
      if (currentYear) {
        console.log('Loading data for year:', currentYear);
        try {
          const data = await fetchResponseData(currentYear);
          console.log('Setting submitted data:', data);
          setSubmittedData(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (error) {
          console.error('Error in loadData:', error);
          setSubmittedData([]);
        }
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

  // Set default current year when sessions load
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0 && !currentYear) {
      const firstYear = availableSessions[0];
      setCurrentYear(firstYear);
      setFormData(prev => ({ ...prev, year: firstYear }));
    }
  }, [availableSessions, currentYear]);

  // Handle year change
  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setCurrentYear(selectedYear);
    setFormData(prev => ({ ...prev, year: selectedYear }));
    setIsEditMode(false);
    setEditKey(null);
  };

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...(formData.supportLinks || [])];
      updatedLinks[index] = value;
      setFormData(prev => ({ ...prev, supportLinks: updatedLinks }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Navigation functions
  const goToNextPage = () => {
    navigate('/criteria5.1.5');
  };

  const goToPreviousPage = () => {
    navigate('/criteria5.1.3');
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      '#',
      'Activity Name',
      'Students Participated',
      'Students Benefitted'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.activity_name || ''}"`,
        entry.students_participated || 0,
        entry.students_benefitted || 0
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_5.1.4_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main component render
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex">
    <Sidebar onCollapse={setIsSidebarCollapsed} />
    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 pt-4`}>

        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Criterion 5 - Student Support and Progression</h2>
            <div className="text-sm text-gray-600">5.1 Student Support</div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">5.1.4 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Average percentage of students benefitted by guidance for competitive examinations and career counseling offered by the institution
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Number of students benefited by guidance for competitive examinations and career counselling</li>
              <li className="mb-1">Any additional information</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Career Counseling Entry</h2>

          {/* Year Dropdown */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={handleYearChange}
              disabled={sessionLoading}
            >
              {sessionLoading ? (
                <option>Loading sessions...</option>
              ) : (
                availableSessions?.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (5.1.4): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0}%
                </p>
                <p className="text-lg font-semibold text-green-800">
                  Grade: {provisionalScore.data.sub_sub_cr_grade || provisionalScore.data.grade || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Input Table */}
          <div className="overflow-auto border rounded mb-6">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Students Benefitted by Guidance - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            
            {/* Students Benefitted Count Input */}
            <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">
                  Number of students benefited by guidance for competitive examinations and career counselling:
                </label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-gray-950"
                  placeholder="Enter count"
                  min="0"
                  value={formData.students_benefitted}
                  onChange={(e) => handleChange("students_benefitted", e.target.value)}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">Activity Name</th>
                    <th className="px-4 py-2 border">Students Participated</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.activity_name}
                        onChange={(e) => handleChange("activity_name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Name of the Activity"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        value={formData.students_participated}
                        onChange={(e) => handleChange("students_participated", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Number of Students"
                        min="0"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`px-3 py-1 text-white rounded ${isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} ${submitting ? 'opacity-50' : ''}`}
                        >
                          {submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add')}
                        </button>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditMode(false);
                              setFormData({
                                slNo: '',
                                activity_name: "",
                                students_participated: "",
                                students_benefitted: "",
                                supportLinks: []
                              });
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div>

          {/* Upload Documents Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Documents (Activity Reports | Student Lists)
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
                          "criteria5_1_4",
                          file,
                          "5.1.4",
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
              {uploading && <span className="text-gray-600">Uploading...</span>}
              {uploadError && <span className="text-red-600">{uploadError}</span>}
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
                        removeFile("criteria5_1_4", link);
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
          {/* Year-wise Data Display */}
          {availableSessions?.map((session) => {
            const sessionData = yearData[session] || [];
            console.log(`Rendering session ${session} with data:`, sessionData);
            
            // Filter data for the current session
            const currentSessionData = submittedData.filter(item => {
              const itemYear = item.year || '';
              return itemYear.toString() === session || itemYear.toString() === session.split('-')[0];
            });
            
            return (
              <div key={session} className="mb-8 border rounded">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">
                  Year: {session} (Entries: {currentSessionData.length})
                </h3>
                {currentSessionData.length > 0 ? (
                  <table className="w-full text-sm border border-black">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border border-black px-4 py-2 text-gray-800">#</th>
                        <th className="border border-black px-4 py-2 text-gray-800">Activity Name</th>
                        <th className="border border-black px-4 py-2 text-gray-800">Students Participated</th>
                        <th className="border border-black px-4 py-2 text-gray-800">Students Benefitted</th>
                        <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSessionData.map((entry, index) => (
                        <tr key={`${entry.activity_name}-${entry.year}-${index}`}>
                          <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                          <td className="border border-black text-black px-4 py-2">{entry.activity_name}</td>
                          <td className="border border-black text-black px-4 py-2">{entry.students_participated}</td>
                          <td className="border border-black text-black px-4 py-2">{entry.students_benefitted}</td>
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
                                  handleDelete(entry.sl_no || entry.slNo, entry.year || currentYear);
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
                  <p className="px-4 py-2 text-gray-500">No career counseling activities submitted for {session}.</p>
                )}
              </div>
            );
          })}

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

          {/* Bottom Navigation */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_1_4;