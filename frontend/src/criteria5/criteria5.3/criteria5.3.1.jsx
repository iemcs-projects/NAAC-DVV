import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { FaTrash, FaEdit } from 'react-icons/fa';
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria5_3_1 = () => {
  const { user } = useAuth();
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    slNo: '',
    award_name: "",
    student_name: "",
    team_or_individual: "",
    level: "",
    activity_type: "",
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);
  const navigate = useNavigate();

  // Team/Individual options - exact match with enum
  const teamOptions = [
    { value: 'Team', label: 'Team' },
    { value: 'Individual', label: 'Individual' }
  ];

  // Level options - exact match with enum
  const levelOptions = [
    { value: 'University', label: 'University' },
    { value: 'State', label: 'State' },
    { value: 'National', label: 'National' },
    { value: 'International', label: 'International' }
  ];

  // Activity type options - exact match with enum
  const activityOptions = [
    { value: 'Sports', label: 'Sports' },
    { value: 'Cultural', label: 'Cultural' }
  ];

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
        "/criteria2/getResponse/5.3.1", 
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
          award_name: item.award_name || 'N/A',
          student_name: item.student_name || 'N/A',
          team_or_individual: item.team_or_individual || 'N/A',
          level: item.level || 'N/A',
          activity_type: item.activity_type || 'N/A',
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

  // Fetch score for the current year
  const fetchScore = async () => {
    if (!currentYear) return;
    
    const cachedScore = localStorage.getItem(`criteria531_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria531_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria5/score531`);
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria531_score_${currentYear}`, 
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
      // Basic validation
      if (!formDataToSubmit.year) {
        throw new Error('Please select a year');
      }
      
      const yearToSend = formDataToSubmit.year.split("-")[0];
      const payload = {
        award_name: formDataToSubmit.award_name,
        student_name: formDataToSubmit.student_name,
        team_or_individual: formDataToSubmit.team_or_individual,
        level: formDataToSubmit.level,
        activity_type: formDataToSubmit.activity_type,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend)
      };
      
      console.log('Sending request to /criteria5/createResponse531 with payload:', payload);
      
      const response = await api.post('/criteria5/createResponse531', payload);
      console.log('API Response:', response);
      
      if (response.data && response.data.success) {
        console.log('Entry created successfully:', response.data);
        
        // Update local state
        const newEntry = {
          ...formDataToSubmit,
          id: response.data.data?.id || Date.now(),
          sl_no: response.data.data?.sl_no || response.data.data?.id || Date.now(),
          year: currentYear
        };
        
        // Update submitted data
        setSubmittedData(prev => [...prev, newEntry]);
        
        // Update year data
        const updatedData = await fetchResponseData(currentYear);
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        // Store in localStorage if needed
        if (response.data.data?.sl_no) {
          localStorage.setItem(
            `criteria531_${formDataToSubmit.award_name}_${yearToSend}`, 
            response.data.data.sl_no
          );
        }
        
        // Reset form
        setFormData({
          slNo: '',
          award_name: "",
          student_name: "",
          team_or_individual: "",
          level: "",
          activity_type: "",
          supportLinks: [],
          year: currentYear
        });
        
        setSuccess('Entry created successfully!');
        setTimeout(() => setSuccess(''), 3000);
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to create entry');
      }
    } catch (err) {
      console.error("Error creating entry:", err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to create entry. Please check your input and try again.';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      return false;
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
        award_name: formDataToSubmit.award_name,
        student_name: formDataToSubmit.student_name,
        team_or_individual: formDataToSubmit.team_or_individual,
        level: formDataToSubmit.level,
        activity_type: formDataToSubmit.activity_type,
        session: parseInt(yearToSend),
        year: yearToSend,
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put(`/criteria5/updateResponse531/${entryId}`, payload);
      
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
    if (!checkStringField(dataToSubmit.award_name)) missingFields.push("Award Name");
    if (!checkStringField(dataToSubmit.student_name)) missingFields.push("Student Name");
    if (!checkStringField(dataToSubmit.team_or_individual)) missingFields.push("Team/Individual");
    if (!checkStringField(dataToSubmit.level)) missingFields.push("Level");
    if (!checkStringField(dataToSubmit.activity_type)) missingFields.push("Activity Type");
    
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
    const formData = {
      slNo: '',
      award_name: '',
      student_name: '',
      team_or_individual: '',
      level: '',
      activity_type: '',
      supportLinks: [],
      year: currentYear,
      // Override with entry data
      ...entry,
      // Ensure these fields are set from the entry or use defaults
      id: entry.id || entry.slNo,
      year: entry.year || currentYear
    };
    
    setFormData(formData);
    setIsEditMode(true);
    setEditKey(entry.id || entry.slNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const response = await api.delete(`/criteria5/deleteResponse531/${slNo}`);
      
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
        year: formData.year?.toString() || currentYear.toString()
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
        award_name: "",
        student_name: "",
        team_or_individual: "",
        level: "",
        activity_type: "",
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
    navigate('/criteria5.3.2');
  };

  const goToPreviousPage = () => {
    navigate('/criteria5.2.3');
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      '#',
      'Award Name',
      'Student Name',
      'Team/Individual',
      'Level',
      'Activity Type'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.award_name || ''}"`,
        `"${entry.student_name || ''}"`,
        entry.team_or_individual || '',
        entry.level || '',
        entry.activity_type || ''
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_5.3.1_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main component render
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
              <p className="text-2xl font-bold text-gray-800">Criteria 5 - Student Support and Progression</p>
              <p className="text-gray-600 text-sm">5.3 Student Participation and Activities</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">5.3.1 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Number of awards/medals for outstanding performance in sports/cultural activities at university/state/national/international level (award for a team event should be counted as one)
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">e-copies of award letters and certificates</li>
              <li className="mb-1">Number of awards/medals for outstanding performance in sports/cultural activities at university/state/national/international level</li>
              <li className="mb-1">Any additional information</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Awards/Medals Entry</h2>

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
                  Provisional Score (5.3.1): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0}%
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
              Awards/Medals for Outstanding Performance - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>

            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Award Name</th>
                    <th className="px-4 py-2 border">Team/Individual</th>
                    <th className="px-4 py-2 border">Level</th>
                    <th className="px-4 py-2 border">Activity Type</th>
                    <th className="px-4 py-2 border">Student Name</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.year || currentYear}
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Year"
                        readOnly
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.award_name}
                        onChange={(e) => handleChange("award_name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Award Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <select
                        value={formData.team_or_individual}
                        onChange={(e) => handleChange("team_or_individual", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        required
                      >
                        <option value="">Select option</option>
                        {teamOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 border">
                      <select
                        value={formData.level}
                        onChange={(e) => handleChange("level", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        required
                      >
                        <option value="">Select level</option>
                        {levelOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 border">
                      <select
                        value={formData.activity_type}
                        onChange={(e) => handleChange("activity_type", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        required
                      >
                        <option value="">Select activity type</option>
                        {activityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.student_name}
                        onChange={(e) => handleChange("student_name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Student Name"
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
                                award_name: "",
                                student_name: "",
                                team_or_individual: "",
                                level: "",
                                activity_type: "",
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
              Upload Documents (Award Letters | Certificates)
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
                          "criteria5_3_1",
                          file,
                          "5.3.1",
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
                        removeFile("criteria5_3_1", link);
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
          {availableSessions?.map((session) => {
            const sessionData = yearData[session];
            console.log(`Rendering session ${session} with data:`, sessionData);
            return (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {session} (Entries: {sessionData?.length || 0})</h3>
              {sessionData && sessionData.length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Award Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Student Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Team/Individual</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Level</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Activity Type</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionData.map((entry, index) => (
                      <tr key={`${entry.award_name}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.award_name || 'N/A'}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.student_name || 'N/A'}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.team_or_individual || 'N/A'}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.level || 'N/A'}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.activity_type || 'N/A'}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                setFormData({
                                  slNo: entry.sl_no || entry.slNo,
                                  award_name: entry.award_name,
                                  student_name: entry.student_name,
                                  team_or_individual: entry.team_or_individual,
                                  level: entry.level,
                                  activity_type: entry.activity_type,
                                  supportLinks: [],
                                });
                                setEditKey({ 
                                  slNo: entry.sl_no || entry.slNo, 
                                  year: entry.year 
                                });
                                setIsEditMode(true);
                              }}
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
                <p className="px-4 py-2 text-gray-500">No award/medal data submitted for {session}. Data: {JSON.stringify(sessionData)}</p>
              )}
            </div>
          )})}

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

export default Criteria5_3_1;