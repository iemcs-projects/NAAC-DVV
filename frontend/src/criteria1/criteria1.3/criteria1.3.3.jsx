import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import axios from "axios";
import api from "../../api";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { FaTrash, FaEdit } from 'react-icons/fa';
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria1_3_3 = () => {
  const { user } = useAuth();
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const { sessions: availableSessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [currentYear, setCurrentYear] = useState(availableSessions?.[0] || "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    slNo: '',
    program_code: "",
    program_name: "",
    student_name: "",
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);
  const navigate = useNavigate();

  const convertToPaddedFormat = (code) => {
    return '010101010303';
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
        "/criteria2/getResponse/1.3.3", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '010101010303'
          }
        }
      );
      
      console.log('API Response:', response.data);
      
      if (!response.data || !response.data.data) {
        console.warn('No data in response');
        return [];
      }
      
      const data = response.data.data;
      
      // Store the SL numbers in localStorage for each entry
      data.forEach(item => {
        if (item.slNo) {
          localStorage.setItem(`criteria1.3.3_slNo_${item.id}`, item.slNo);
        }
      });
      
      return data;
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
    
    const cachedScore = localStorage.getItem(`criteria133_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria133_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria1/score133`);
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria133_score_${currentYear}`, 
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
      const yearToSend = formDataToSubmit.year.split("-")[0];
      const payload = {
        program_code: formDataToSubmit.program_code,
        program_name: formDataToSubmit.program_name,
        student_name: formDataToSubmit.student_name,
        session: parseInt(yearToSend),
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria1/createResponse133', payload);
      console.log('Response received:', response);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        alert('Data submitted successfully!');
        
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria133_${formDataToSubmit.program_name}_${yearToSend}`, 
            response.data.data.sl_no
          );
        }
        
        const updatedData = await fetchResponseData(currentYear);
        
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSubmittedData(prev => [
          ...prev,
          {
            ...formDataToSubmit,
            slNo: response.data?.data?.sl_no || Date.now(),
            year: currentYear
          }
        ]);
        
        // Reset form
        setFormData({
          slNo: '',
          program_code: "",
          program_name: "",
          student_name: "",
          supportLinks: []
        });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error creating entry:", err);
      setError(err.response?.data?.message || "Failed to create entry");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update entry
  const handleUpdate = async (formDataToSubmit) => {
    const recordId = editingId || formDataToSubmit.slNo;
    if (!recordId) {
      setError("No entry selected for update");
      return false;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const yearToSend = (formDataToSubmit.year || currentYear).split("-")[0];
      const payload = {
        program_code: formDataToSubmit.program_code || '',
        program_name: formDataToSubmit.program_name || '',
        student_name: formDataToSubmit.student_name || '',
        session: parseInt(yearToSend),
      };
      
      console.log('Updating record with ID:', recordId);
      console.log('Payload:', payload);
      
      const response = await api.put(`/criteria1/updateResponse133/${recordId}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Update response:', response);
      
      if (response.status >= 200 && response.status < 300) {
        const updatedData = await fetchResponseData(currentYear);
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        setSubmittedData(updatedData || []);
        
        setSuccess('Entry updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to update entry');
      }
    } catch (err) {
      console.error("Error updating entry:", err);
      setError(err.response?.data?.message || "Failed to update entry. Please try again.");
      setTimeout(() => setError(''), 3000);
      return false;
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

    if (!dataToSubmit.program_code || !dataToSubmit.program_name) {
      throw new Error("Please fill in all required fields (Program Code and Program Name).");
    }
    
    if (isNaN(session) || session < 1990 || session > currentYearNum) {
      throw new Error(`Year must be between 1990 and ${currentYearNum}.`);
    }

    return true;
  };

  // Reset form and edit state
  const resetForm = () => {
    setFormData({
      slNo: '',
      program_code: '',
      program_name: '',
      student_name: '',
      supportLinks: [],
      year: currentYear
    });
    setIsEditMode(false);
    setEditingId(null);
    setEditKey(null);
    setError('');
  };

  // Handle edit
  const handleEdit = (entry) => {
    const recordId = entry.slNo || entry.sl_no || entry.id;
    if (!recordId) {
      console.error('No valid ID found for edit:', entry);
      setError('Cannot edit: Invalid entry ID');
      return;
    }

    console.log('Editing entry with ID:', recordId);
    
    setFormData({
      slNo: recordId,
      program_code: entry.program_code || '',
      program_name: entry.program_name || '',
      student_name: entry.student_name || '',
      supportLinks: entry.supportLinks || [],
      year: entry.year || currentYear
    });
    
    // Set editing state
    setEditingId(recordId);
    setIsEditMode(true);
    setEditKey(recordId);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
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
      const response = await api.delete(`/criteria1/deleteResponse133/${slNo}`, {
        params: { year }
      });
      
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

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataWithYear = { ...formData, year: currentYear };
      validateFormData(formDataWithYear);
      
      // Determine if we're updating or creating
      const isUpdating = isEditMode && (editingId || formData.slNo);
      const recordId = editingId || formData.slNo;
      
      console.log('Submit mode:', isUpdating ? 'UPDATE' : 'CREATE');
      console.log('Record ID:', recordId);
      console.log('Form data:', formDataWithYear);
      
      if (isUpdating && recordId) {
        console.log('Updating entry with ID:', recordId);
        await handleUpdate(formDataWithYear);
      } else {
        console.log('Creating new entry');
        await handleCreate(formDataWithYear);
      }
      
      // Reset form and edit mode
      resetForm();
      
      // Refresh data
      const data = await fetchResponseData(currentYear);
      setSubmittedData(data || []);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to submit form. Please try again.');
      setTimeout(() => setError(''), 3000);
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

  const goToNextPage = () => {
    navigate("/criteria1.4.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.3.2");
  };

  const handleExport = () => {
    const headers = [
      'SL No',
      'Program Code',
      'Program Name',
      'Student Name'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.program_code || ''}"`,
        `"${entry.program_name || ''}"`,
        `"${entry.student_name || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_1.3.3_data_${new Date().toISOString().split('T')[0]}.csv`);
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
              <p className="text-2xl font-bold text-gray-800">Criteria 1 - Curricular Planning and Implementation</p>
              <p className="text-gray-600 text-sm">1.3 Curriculum Enrichment</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-blue-600 font-semibold text-lg mb-3">1.3.3 Metric Information</h3>
          <p className="text-gray-700 mb-4">
            Percentage of students undertaking project work/field work/internship
          </p>
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-700 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>List of programmes and number of students undertaking project work/field work/internships</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Work/Field Work/Internship Entry</h2>
          
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
                  Provisional Score (1.3.3): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Input Table */}
          <div className="border rounded mb-6">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Student Projects/Internships - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="w-full border text-sm border-black">
                <thead className="bg-gray-100 text-gray-950">
                  <tr>
                    <th className="border px-2 py-2">Programme Code</th>
                    <th className="border px-2 py-2">Programme Name</th>
                    <th className="border px-2 py-2">Name of the Students</th>
                    <th className="border px-2 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.program_code}
                        onChange={(e) => handleChange("program_code", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Programme Code"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.program_name}
                        onChange={(e) => handleChange("program_name", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Programme Name"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.student_name}
                        onChange={(e) => handleChange("student_name", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Student Names"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`px-3 py-1 !bg-blue-600 !text-white rounded ${isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} ${submitting ? 'opacity-50' : ''}`}
                        >
                          {submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
                        </button>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditMode(false);
                              setFormData({
                                program_code: '',
                                program_name: '',
                                student_name: '',
                                supportLinks: []
                              });
                            }}
                            className="px-3 py-1 !bg-blue-600 !text-white rounded hover:bg-gray-600"
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
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Upload Documents
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="fas fa-upload mr-2"></i> Choose Files
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={async (e) => {
                      const filesArray = Array.from(e.target.files);
                      for (const file of filesArray) {
                        try {
                          console.log('Uploading file:', file.name);
                          const yearToUse = currentYear || new Date().getFullYear().toString();
                          console.log('Using year:', yearToUse);
                          
                          const uploaded = await uploadFile(
                            "1.3.3",  // Metric ID
                            file,
                            "1.3.3",  // Criteria code
                            yearToUse,
                            user?.session
                          );
          
                          // Add the uploaded file info to the form data
                          setFormData(prev => ({
                            ...prev,
                            supportLinks: [
                              ...(prev.supportLinks || []), 
                              {
                                id: uploaded.id,
                                url: uploaded.fileUrl || uploaded.file_url,
                                name: file.name
                              }
                            ]
                          }));
                        } catch (err) {
                          console.error('Upload error:', err);
                          console.error('Error details:', {
                            message: err.message,
                            response: err.response?.data,
                            status: err.response?.status
                          });
                          setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
                        }
                      }
                    }}
                  />
                </label>
                {uploading && <span className="text-gray-600">Uploading...</span>}
                {error && <span className="text-red-600">{error}</span>}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <i className="fas fa-sync-alt fa-spin mr-2"></i>
                Changes will be auto-saved
              </div>
              {formData.supportLinks && formData.supportLinks.length > 0 && (
                <ul className="list-disc pl-5 text-gray-700 mt-2">
                  {formData.supportLinks.map((link, index) => (
                    <li key={index} className="flex justify-between items-center mb-1">
                      <a
                        href={`http://localhost:3000${link.url || link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.name || (typeof link === 'string' ? link.split("/").pop() : link.url?.split("/").pop())}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          // Remove from local formData
                          setFormData(prev => {
                            const newLinks = prev.supportLinks.filter(l => 
                              typeof link === 'string' 
                                ? l !== link 
                                : l.id !== link.id
                            );
                            // Show success message
                            if (newLinks.length < prev.supportLinks.length) {
                              console.log('File removed successfully');
                            }
                            return {
                              ...prev,
                              supportLinks: newLinks
                            };
                          });
                          // Also remove from context
                          if (typeof link === 'object' && link.id) {
                            removeFile("1.3.3", link.id);
                          } else if (typeof link === 'string') {
                            removeFile("1.3.3", link);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 bg-white hover:bg-gray-100 ml-2 p-1 rounded transition-colors duration-200"
                        title="Remove file"
                      >
                        <FaTrash size={16} className="text-red-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Submitted Data Table */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Submitted Entries</h2>
          </div>
          
          {/* Year-wise Data Display */}
          {availableSessions?.map((session) => (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {session}</h3>
              {yearData[session] && yearData[session].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Program Code</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Program Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Student Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.program_name}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.program_code}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.program_name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.student_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 text-blue-600 !bg-white hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                setFormData({
                                  slNo: entry.sl_no || entry.slNo,
                                  program_code: entry.program_code,
                                  program_name: entry.program_name,
                                  student_name: entry.student_name,
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
                              <FaEdit className="text-blue-500" size={16} />
                            </button>
                            <button
                              className="p-2 text-red-600 !bg-white hover:bg-red-100 rounded-full transition-colors"
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

          {/* Bottom Navigation */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default Criteria1_3_3;