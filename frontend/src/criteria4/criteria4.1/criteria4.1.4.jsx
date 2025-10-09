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
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria4_1_4 = () => {
  const { user } = useAuth();
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const { sessions: availableSessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [currentYear, setCurrentYear] = useState(availableSessions?.[0] || "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    slNo: '',
    year: "",
    budget_allocated_infra: "",
    expenditure_infra_lakhs: "",
    total_exp_infra_lakhs: "",
    exp_maintainance_acad: "",
    exp_maintainance_physical: "",
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);
  const navigate = useNavigate();

  // Reset form function
  const resetForm = () => {
    setFormData({
      slNo: '',
      year: "",
      budget_allocated_infra: "",
      expenditure_infra_lakhs: "",
      total_exp_infra_lakhs: "",
      exp_maintainance_acad: "",
      exp_maintainance_physical: "",
      supportLinks: []
    });
    setEditingId(null);
    setIsEditMode(false);
    setEditKey(null);
    setError(null);
  };

  const convertToPaddedFormat = (code) => {
    return '040104040104';
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
        "/criteria2/getResponse/4.1.4", 
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
      
      // Handle both response.data and response.data.data
      let data = response.data.data || response.data;
      
      console.log('Data before processing:', data);
      
      // If data is not an array but is an object, convert it to an array
      if (data) {
        if (!Array.isArray(data)) {
          console.log('Converting single object to array');
          data = [data];
        }
      } else {
        console.warn('Data is null or undefined');
        return [];
      }
      
      // Map the data to ensure consistent structure
      const mappedData = data.map(item => {
        console.log('Raw database item:', item);
        
        const mappedItem = {
          id: item.id || item.sl_no,
          sl_no: item.sl_no || item.id,
          year: item.year,
          budget_allocated_infra: item.budget_allocated_infra || item.budget_allocated_infra_aug,
          expenditure_infra_lakhs: item.expenditure_infra_lakhs || item.expenditure_infra_aug,
          total_exp_infra_lakhs: item.total_exp_infra_lakhs,
          exp_maintainance_acad: item.exp_maintainance_acad || item.expenditure_academic_maint,
          exp_maintainance_physical: item.exp_maintainance_physical || item.expenditure_physical_maint,
          ...item
        };
        
        console.log('Mapped item:', mappedItem);
        return mappedItem;
      });
      
      console.log('Final mapped data:', mappedData);
      
      // Store the SL numbers in localStorage for each entry
      mappedData.forEach(item => {
        if (item.sl_no) {
          localStorage.setItem(`criteria4.1.4_slNo_${item.id || item.sl_no}`, item.sl_no);
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
    
    const cachedScore = localStorage.getItem(`criteria414_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria414_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria4/score414`);
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria414_score_${currentYear}`, 
          JSON.stringify(cacheData)
        );
      }
    } catch (err) {
      console.error("Error fetching score:", err);
      setError("Failed to load score");
    }
  };

  // Unified handleSubmit function
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);

    // Basic validation
    if (!formData.budget_allocated_infra || !formData.expenditure_infra_lakhs || !formData.exp_maintainance_acad || !formData.exp_maintainance_physical) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      // Get year - use the form's year or current year as fallback
      const yearToSend = formData.year || currentYear.split("-")[0] || new Date().getFullYear();
      const sessionYear = parseInt(yearToSend, 10);
      
      if (isNaN(sessionYear)) {
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
          const originalSession = originalRecord?.session || sessionYear;
          
          // Prepare the payload for update
          const updatePayload = {
            session: originalSession,
            year: originalSession, 
            budget_allocated_infra: parseFloat(formData.budget_allocated_infra) || 0,
            expenditure_infra_lakhs: parseFloat(formData.expenditure_infra_lakhs) || 0,
            total_exp_infra_lakhs: parseFloat(formData.total_exp_infra_lakhs) || 0,
            exp_maintainance_acad: parseFloat(formData.exp_maintainance_acad) || 0,
            exp_maintainance_physical: parseFloat(formData.exp_maintainance_physical) || 0
          };
          
          // Convert recordId to a number to ensure proper type matching with the backend
          const recordIdNum = parseInt(recordId, 10);
          if (isNaN(recordIdNum)) {
            throw new Error('Invalid record ID');
          }
          const endpoint = `/criteria4/updateResponse414_441/${recordIdNum}`;
          console.log('Update endpoint:', endpoint);
          console.log('Update payload:', updatePayload);
          
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
            setError(errorMessage);
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
          session: sessionYear,
          year: sessionYear,
          budget_allocated_infra: parseFloat(formData.budget_allocated_infra) || 0,
          expenditure_infra_lakhs: parseFloat(formData.expenditure_infra_lakhs) || 0,
          total_exp_infra_lakhs: parseFloat(formData.total_exp_infra_lakhs) || 0,
          exp_maintainance_acad: parseFloat(formData.exp_maintainance_acad) || 0,
          exp_maintainance_physical: parseFloat(formData.exp_maintainance_physical) || 0
        };
        
        console.log('Create payload:', createPayload);
        
        const endpoint = '/criteria4/createResponse414';
        response = await api.post(endpoint, createPayload);
        
        console.log('Create response:', response.data);
        
        if (response.status >= 200 && response.status < 300) {
          alert('Data submitted successfully!');
          
          // Store the SL number in localStorage if available
          if (response.data?.data?.sl_no) {
            localStorage.setItem(
              `criteria414_${sessionYear}`, 
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
      const response = await api.delete(`/criteria4/deleteResponse414/${slNo}`);
      
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
    setEditingId(null);
  };

  // Navigation functions
  const goToNextPage = () => {
    navigate('/criteria4.4.2');
  };

  const goToPreviousPage = () => {
    navigate('/criteria4.3.3s');
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Year',
      'Budget Allocated (Lakhs)',
      'Infrastructure Expenditure (Lakhs)',
      'Total Expenditure (Lakhs)',
      'Academic Maintenance (Lakhs)',
      'Physical Maintenance (Lakhs)'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        entry.year || '',
        entry.budget_allocated_infra || '',
        entry.expenditure_infra_lakhs || '',
        entry.total_exp_infra_lakhs || '',
        entry.exp_maintainance_acad || '',
        entry.exp_maintainance_physical || ''
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_4.1.4_data_${new Date().toISOString().split('T')[0]}.csv`);
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
              <p className="text-2xl font-bold text-gray-800">Criteria 4 - Infrastructure and Learning Resources</p>
              <p className="text-gray-600 text-sm">4.1 Physical Infrastructure</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">4.1.4 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Average percentage of expenditure, excluding salary for infrastructure augmentation during last five years (INR in Lakhs)
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Expenditure for infrastructure augmentation</li>
              <li className="mb-1">Total expenditure excluding salary</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Infrastructure Expenditure Entry</h2>

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
                  Provisional Score (4.1.4): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0}%
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
              Infrastructure Expenditure - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Budget Allocated (Lakhs)</th>
                    <th className="px-4 py-2 border">Infrastructure Expenditure (Lakhs)</th>
                    <th className="px-4 py-2 border">Total Expenditure (Lakhs)</th>
                    <th className="px-4 py-2 border">Academic Maintenance (Lakhs)</th>
                    <th className="px-4 py-2 border">Physical Maintenance (Lakhs)</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="2000"
                        max={new Date().getFullYear()}
                        value={formData.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Year"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budget_allocated_infra}
                        onChange={(e) => handleChange("budget_allocated_infra", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Budget"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.expenditure_infra_lakhs}
                        onChange={(e) => handleChange("expenditure_infra_lakhs", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Infrastructure Exp."
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.total_exp_infra_lakhs}
                        onChange={(e) => handleChange("total_exp_infra_lakhs", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Total Exp."
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.exp_maintainance_acad}
                        onChange={(e) => handleChange("exp_maintainance_acad", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Academic Exp."
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.exp_maintainance_physical}
                        onChange={(e) => handleChange("exp_maintainance_physical", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Physical Exp."
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

          {/* Upload Documents Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Documents (Financial Records | Budget Documents)
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
                          "criteria4_1_4",
                          file,
                          "4.1.4",
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
                        removeFile("criteria4_1_4", link);
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
                      <th className="border border-black px-4 py-2 text-gray-800">Year</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Budget (Lakhs)</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Infrastructure Exp. (Lakhs)</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Total Exp. (Lakhs)</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Academic Exp. (Lakhs)</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Physical Exp. (Lakhs)</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.year}-${entry.budget_allocated_infra}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.year}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.budget_allocated_infra}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.expenditure_infra_lakhs}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.total_exp_infra_lakhs}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.exp_maintainance_acad}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.exp_maintainance_physical}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 !bg-white text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                const recordId = entry.sl_no || entry.slNo || entry.id;
                                console.log('Editing entry with ID:', recordId);
                                
                                setFormData({
                                  slNo: recordId,
                                  year: entry.year || '',
                                  budget_allocated_infra: entry.budget_allocated_infra || '',
                                  expenditure_infra_lakhs: entry.expenditure_infra_lakhs || '',
                                  total_exp_infra_lakhs: entry.total_exp_infra_lakhs || '',
                                  exp_maintainance_acad: entry.exp_maintainance_acad || '',
                                  exp_maintainance_physical: entry.exp_maintainance_physical || '',
                                  supportLinks: [],
                                });
                                
                                // Set the editingId
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
                <p className="px-4 py-2 text-gray-500">No infrastructure expenditure data submitted for this year.</p>
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

          {/* Bottom Navigation */}
          <div className="mt-6 mb-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_1_4;