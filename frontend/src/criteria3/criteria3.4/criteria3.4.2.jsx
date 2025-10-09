import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import api from "../../api";
import { FaTrash, FaEdit } from 'react-icons/fa';
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria3_4_2 = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { sessions: availableSessions, isLoading: sessionLoading } = useContext(SessionContext);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [editingId, setEditingId] = useState(null); // ADDED: Missing state variable

  const [formData, setFormData] = useState({
    slNo: '',
    year: "",
    institution_name: "",
    year_of_mou: "",
    duration: "",
    activities_list: ""
  });

  const navigate = useNavigate();

  // ADDED: Missing resetForm function (exactly like other components)
  const resetForm = () => {
    setFormData({
      slNo: '',
      year: currentYear.split('-')[0],
      institution_name: "",
      year_of_mou: currentYear.split('-')[0],
      duration: "",
      activities_list: ""
    });
    setEditingId(null);
    setIsEditMode(false);
    setEditKey(null);
    setError(null);
  };

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
        "/criteria2/getResponse/3.4.2", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '030402040201'
          }
        }
      );
      
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle different possible response structures
      let responseData = [];
      if (response.data && response.data.data) {
        // Case 1: Response has data property containing the array
        responseData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        // Case 2: Response is directly an array
        responseData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Case 3: Response is a single object
        responseData = [response.data];
      }
      
      console.log('Processed data array:', responseData);
      
      // Map the data to match the expected format
      const formattedData = responseData.map(item => ({
        id: item.id || item.sl_no || Math.random().toString(36).substr(2, 9),
        slNo: item.sl_no || item.id,
        institution_name: item.institution_name || '',
        year_of_mou: item.year_of_mou || '',
        duration: item.duration || '',
        activities_list: item.activities_list || '',
        session: item.session || yearToSend
      }));
      
      console.log('Formatted data:', formattedData);
      
      // Store the SL numbers in localStorage for each entry
      formattedData.forEach(item => {
        if (item.sl_no) {
          const institution = item.institution_name || item.name;
          localStorage.setItem(`criteria342_${institution}_${yearToSend}`, item.sl_no);
        }
      });
      
      return formattedData;
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
    
    // Try to load from localStorage first
    const cachedScore = localStorage.getItem(`criteria342_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria342_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria3/score342`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria342_score_${currentYear}`, 
          JSON.stringify(cacheData)
        );
      }
    } catch (err) {
      console.error("Error fetching score:", err);
      setError("Failed to load score");
    }
  };

  // REPLACED: New unified handleSubmit function (following other components pattern)
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);

    // Basic validation
    if (!formData.institution_name || !formData.year_of_mou || 
        !formData.duration || !formData.activities_list) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      // Get year - use the form's year or current year as fallback
      const yearToSend = formData.year || currentYear.split('-')[0];
      const sessionYearNum = parseInt(yearToSend, 10);
      
      if (isNaN(sessionYearNum)) {
        throw new Error('Please enter a valid year');
      }

      // Check if we're in edit mode
      const isUpdating = isEditMode && (editingId || formData.slNo);
      const recordId = editingId || formData.slNo;
      
      console.log('Submit mode:', isUpdating ? 'UPDATE' : 'CREATE');
      console.log('Record ID:', recordId);
      console.log('Form data:', formData);
      
      let response;
      
      if (isUpdating && recordId) {
        try {
          // Get the original record to preserve its session
          const originalRecord = submittedData.find(item => (item.sl_no || item.slNo) === recordId);
          const originalSession = originalRecord?.session || sessionYearNum;
          
          // Prepare the payload for update
          const updatePayload = {
            session: originalSession, // Use the original session from the record
            institution_name: formData.institution_name.trim(),
            year_of_mou: formData.year_of_mou.toString().trim(),
            duration: parseInt(formData.duration) || 0,
            activities_list: formData.activities_list.trim()
          };
          
          // Convert recordId to a number to ensure proper type matching with the backend
          const recordIdNum = parseInt(recordId, 10);
          if (isNaN(recordIdNum)) {
            throw new Error('Invalid record ID');
          }
          const endpoint = `/criteria3/updateResponse342/${recordIdNum}`;
          console.log('Update endpoint:', endpoint);
          console.log('Update payload:', updatePayload);
          
          // Validate required fields
          if (!updatePayload.institution_name || !updatePayload.year_of_mou || 
              !updatePayload.activities_list) {
            throw new Error('Missing required fields for update');
          }
          
          // Make the API call
          response = await api.put(endpoint, updatePayload);
          
          console.log('Update response:', response.data);
          
          if (response.status >= 200 && response.status < 300) {
            // Refresh the data after successful update
            const updatedData = await fetchResponseData(currentYear);
            setYearData(prev => ({
              ...prev,
              [currentYear]: updatedData
            }));
            setSubmittedData(updatedData);
            
            // Reset form and edit mode
            resetForm();
            setSuccess('Record updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
          }
          
        } catch (error) {
          console.error('Error updating record:', error);
          
          // Handle specific error cases from your backend
          if (error.response?.status === 404) {
            setError('Record not found. It may have been deleted.');
          } else if (error.response?.status === 400) {
            const errorMessage = error.response.data?.message || 'Bad request';
            if (errorMessage.includes('Session/year mismatch')) {
              setError('Cannot update: Session/year mismatch with original record');
            } else if (errorMessage.includes('Session must be between')) {
              setError(`Session year must be within the valid IIQA range: ${errorMessage}`);
            } else {
              setError(errorMessage);
            }
          } else {
            setError(error.response?.data?.message || 'Failed to update record');
          }
          
          // Don't proceed with refresh if update failed
          setSubmitting(false);
          return;
        }
      } else {
        // For new entries, use the create endpoint
        const createPayload = {
          institution_name: formData.institution_name.trim(),
          year_of_mou: formData.year_of_mou.toString().trim(),
          duration: parseInt(formData.duration) || 0,
          activities_list: formData.activities_list.trim(),
          session: sessionYearNum,
          year: sessionYearNum
        };
        
        console.log('Create payload:', createPayload);
        
        const endpoint = '/criteria3/createResponse342';
        response = await api.post(endpoint, createPayload);
        
        console.log('Create response:', response.data);
        
        if (response.status >= 200 && response.status < 300) {
          alert('Data submitted successfully!');
          
          // Store the SL number in localStorage if available
          if (response.data?.data?.sl_no) {
            localStorage.setItem(
              `criteria342_${formData.institution_name}_${yearToSend}`, 
              response.data.data.sl_no
            );
          }
        }
      }
      
      // Refresh the data after successful operation
      const updatedData = await fetchResponseData(currentYear);
      setSubmittedData(updatedData);
      
      // Update yearData as well
      setYearData(prev => ({
        ...prev,
        [currentYear]: updatedData
      }));
      
      // Reset form
      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      
      // More specific error handling
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Missing required fields')) {
        setError('All fields are required. Please check your input.');
      } else if (err.response?.status === 404) {
        setError('Resource not found. Please refresh and try again.');
      } else {
        setError(err.response?.data?.message || err.message || "Operation failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      const response = await api.delete(`/criteria3/deleteResponse342/${slNo}`);
      
      if (response.status === 200) {
        // Update the local state to remove the deleted entry
        setYearData(prev => ({
          ...prev,
          [year]: (prev[year] || []).filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        }));
        
        // Also update the submittedData state
        setSubmittedData(prev => 
          prev.filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        );
        
        // Show success message
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

  // Set default current year when sessions load
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0 && !currentYear) {
      const firstYear = availableSessions[0];
      setCurrentYear(firstYear);
      setFormData(prev => ({ 
        ...prev, 
        year: firstYear.split('-')[0],
        year_of_mou: firstYear.split('-')[0]
      }));
    }
  }, [availableSessions, currentYear]);

  // Handle year change
  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setCurrentYear(selectedYear);
    const yearOnly = selectedYear.split('-')[0];
    setFormData(prev => ({ 
      ...prev, 
      year: yearOnly,
      year_of_mou: yearOnly
    }));
    setIsEditMode(false);
    setEditKey(null);
    setEditingId(null); // ADDED: Reset editingId on year change
  };

  // Navigation functions
  const goToNextPage = () => {
    navigate("/criteria3.4.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria3.4.1");
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Institution Name',
      'Year of MOU',
      'Duration',
      'Activities List'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.institution_name || ''}"`,
        entry.year_of_mou || '',
        entry.duration || '',
        `"${entry.activities_list || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_3.4.2_data_${new Date().toISOString().split('T')[0]}.csv`);
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
                <p className="text-2xl font-bold text-gray-800">Criteria 3-Research, Innovations and Extension</p>
                <p className="text-gray-600 text-sm">3.4 Collaboration</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4 " />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">3.4.2 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Number of awards and recognitions received for extension activities from government/recognised bodies during the last five years
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Award letters</li>
              <li className="mb-1">Any additional relevant information</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Awards and Recognition Entry</h2>

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
                  Provisional Score (3.4.2): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0}
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
              Awards and Recognition - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">Institution Name</th>
                    <th className="px-4 py-2 border">Year of MOU</th>
                    <th className="px-4 py-2 border">Duration</th>
                    <th className="px-4 py-2 border">Activities List</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.institution_name}
                        onChange={(e) => handleChange("institution_name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Institution Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="1990"
                        max={new Date().getFullYear()}
                        value={formData.year_of_mou}
                        onChange={(e) => handleChange("year_of_mou", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Year"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => handleChange("duration", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Duration (months)"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.activities_list}
                        onChange={(e) => handleChange("activities_list", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Activities List"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`px-3 py-1 !bg-blue-600 text-white rounded ${isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} ${submitting ? 'opacity-50' : ''}`}
                        >
                          {submitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Add')}
                        </button>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={resetForm}
                            className="px-3 py-1 !bg-blue-600 text-white rounded hover:bg-gray-600"
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

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Submitted Entries</h2>
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
                      <th className="border border-black px-4 py-2 text-gray-800">Institution Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of MOU</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Duration</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Activities List</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.institution_name}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.institution_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.year_of_mou}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.duration}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.activities_list}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 !bg-white text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                const recordId = entry.sl_no || entry.slNo || entry.id;
                                console.log('Editing entry with ID:', recordId);
                                
                                setFormData({
                                  slNo: recordId,
                                  year: entry.session || currentYear.split('-')[0],
                                  institution_name: entry.institution_name || '',
                                  year_of_mou: entry.year_of_mou || '',
                                  duration: entry.duration || '',
                                  activities_list: entry.activities_list || '',
                                });
                                
                                // CRITICAL: Set the editingId
                                setEditingId(recordId);
                                setEditKey({ slNo: recordId, year: entry.year });
                                setIsEditMode(true);
                                
                                console.log('Edit mode activated for record:', recordId);
                              }}
                              title="Edit entry"
                            >
                             <FaEdit className="text-blue-500" size={16} />
                            </button>
                            <button
                              className="p-2 !bg-white text-red-600 hover:bg-red-100 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(entry.sl_no || entry.slNo, entry.year || currentYear);
                              }}
                              disabled={submitting}
                              title="Delete entry"
                            >
                              <FaTrash className="text-red-500" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-2 text-gray-500">No data submitted for this year.</p>
              )}
            </div>
          ))}

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

          {/* Navigation */}
          <div className="bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onPrevious={goToPreviousPage} onNext={goToNextPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_4_2;