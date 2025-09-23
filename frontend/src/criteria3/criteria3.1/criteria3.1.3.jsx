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
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria3_1_3 = () => {
    const { user } = useAuth();
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
    workshop_name: "",
    participants: "",
    date_from: "",
    date_to: "",
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);
  const navigate = useNavigate();

  const convertToPaddedFormat = (code) => {
    return '030101010103';
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
        "/criteria2/getResponse/3.1.3", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '030101010103'
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
          localStorage.setItem(`criteria3.1.3_slNo_${item.id}`, item.slNo);
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
    
    const cachedScore = localStorage.getItem(`criteria313_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria313_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria3/score313`);
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria313_score_${currentYear}`, 
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
        workshop_name: formDataToSubmit.workshop_name,
        participants: parseInt(formDataToSubmit.participants),
        date_from: formDataToSubmit.date_from,
        date_to: formDataToSubmit.date_to,
        year: yearToSend,
        session: parseInt(yearToSend),
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria3/createResponse313', payload);
      console.log('Response received:', response);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        alert('Data submitted successfully!');
        
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria313_${formDataToSubmit.workshop_name}_${yearToSend}`, 
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
          workshop_name: "",
          participants: "",
          date_from: "",
          date_to: "",
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
    if (!formDataToSubmit.sl_no && !formDataToSubmit.slNo) {
      setError("No entry selected for update");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Ensure sl_no is a number
      const sl_no = parseInt(formDataToSubmit.sl_no || formDataToSubmit.slNo, 10);
      if (isNaN(sl_no)) {
        throw new Error('Invalid entry ID');
      }
      
      const yearToSend = formDataToSubmit.year?.split("-")[0] || new Date().getFullYear().toString();
      
      console.log('Update payload:', {
        sl_no,
        yearToSend,
        formDataToSubmit
      });
      
      const payload = {
        workshop_name: formDataToSubmit.workshop_name,
        participants: parseInt(formDataToSubmit.participants) || 0,
        date_from: formDataToSubmit.date_from,
        date_to: formDataToSubmit.date_to,
        year: yearToSend,
        session: parseInt(yearToSend),
      };
      
      console.log('Sending update request to:', `/criteria3/updateResponse313/${sl_no}`, 'with payload:', payload);
      const response = await api.put(`/criteria3/updateResponse313/${sl_no}`, payload);
      
      if (response.data.success) {
        const updatedData = await fetchResponseData(currentYear);
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error updating entry:", err);
      setError(err.response?.data?.message || "Failed to update entry");
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

    if (!dataToSubmit.workshop_name || !dataToSubmit.participants || 
        !dataToSubmit.date_from || !dataToSubmit.date_to) {
      throw new Error("Please fill in all required fields.");
    }
    
    if (isNaN(session) || session < 1990 || session > currentYearNum) {
      throw new Error(`Year must be between 1990 and ${currentYearNum}.`);
    }

    if (isNaN(parseInt(dataToSubmit.participants)) || parseInt(dataToSubmit.participants) <= 0) {
      throw new Error("Participants must be a positive number.");
    }

    return true;
  };

  // Handle edit
  const handleEdit = (entry) => {
    setFormData({
      ...entry,
      id: entry.id,
      year: currentYear
    });
    setIsEditMode(true);
    setEditKey(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete entry
  const handleDelete = async (id) => {
    if (!id) {
      setError('No ID provided for deletion');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setLoading(true);
      // Convert ID to string to match backend expectations
      const response = await api.delete(`/criteria3/deleteResponse313/${String(id)}`);
      
      if (response.data) {
        // Update the UI by removing the deleted entry
        setSubmittedData(prev => prev.filter(item => (item.id !== id && item.sl_no !== id && item.slNo !== id)));
        
        // Update yearData to reflect the deletion
        if (currentYear) {
          setYearData(prev => ({
            ...prev,
            [currentYear]: (prev[currentYear] || []).filter(item => 
              (item.id !== id && item.sl_no !== id && item.slNo !== id)
            )
          }));
        }

        // Show success message
        setSuccess('Entry deleted successfully');
        setTimeout(() => setSuccess(''), 3000);

        // If we're in edit mode for the deleted entry, reset the form
        if (isEditMode && (formData.id === id || formData.slNo === id)) {
          setIsEditMode(false);
          setEditKey(null);
          setFormData({
            slNo: '',
            workshop_name: "",
            participants: "",
            date_from: "",
            date_to: "",
            supportLinks: []
          });
        }

        // Refresh the score
        await fetchScore();
      } else {
        throw new Error(response.data?.message || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete entry. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataWithYear = { ...formData, year: currentYear };
      validateFormData(formDataWithYear);
      
      if (isEditMode && (formData.slNo || formData.sl_no)) {
        console.log('Updating entry:', formDataWithYear);
        await handleUpdate(formDataWithYear);
      } else {
        console.log('Creating new entry:', formDataWithYear);
        await handleCreate(formDataWithYear);
      }
      
      // Reset form and edit mode
      setIsEditMode(false);
      setEditKey(null);
      setFormData({
        slNo: '',
        workshop_name: "",
        participants: "",
        date_from: "",
        date_to: "",
        supportLinks: []
      });
      
      // Refresh data
      const data = await fetchResponseData(currentYear);
      setYearData(prev => ({
        ...prev,
        [currentYear]: data || []
      }));
      setSubmittedData(data || []);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to submit form. Please try again.');
      setTimeout(() => setError(null), 3000);
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
    navigate("/criteria3.2.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria3.1.2");
  };

  const handleExport = () => {
    const headers = [
      'SL No',
      'Workshop Name',
      'Participants',
      'Date From',
      'Date To'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.workshop_name || ''}"`,
        entry.participants || '',
        entry.date_from || '',
        entry.date_to || ''
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_3.1.3_data_${new Date().toISOString().split('T')[0]}.csv`);
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
                <p className="text-gray-600 text-sm">3.1 Promotion of Research</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4 " />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">3.1.3 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Number of seminars/conferences/workshops conducted by the institution during the last five years
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Report of the event</li>
              <li className="mb-1">Any additional information</li>
              <li className="mb-1">List of workshops/seminars during last 5 years (Data Template)</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Seminars/Conferences/Workshops Entry</h2>

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
                  Provisional Score (3.1.3): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Input Table */}
          <div className="overflow-auto border rounded mb-6">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Seminars/Conferences/Workshops - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">Workshop Name</th>
                    <th className="px-4 py-2 border">Participants</th>
                    <th className="px-4 py-2 border">Date From (YYYY)</th>
                    <th className="px-4 py-2 border">Date To (YYYY)</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.workshop_name}
                        onChange={(e) => handleChange("workshop_name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Workshop/Seminar Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        value={formData.participants}
                        onChange={(e) => handleChange("participants", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Number of Participants"
                        required
                        min="1"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        value={formData.date_from}
                        onChange={(e) => handleChange("date_from", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="YYYY"
                        min="1900"
                        max={new Date().getFullYear()}
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        value={formData.date_to}
                        onChange={(e) => handleChange("date_to", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="YYYY"
                        min="1900"
                        max={new Date().getFullYear()}
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
                                workshop_name: "",
                                participants: "",
                                date_from: "",
                                date_to: "",
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
                          "criteria3_1_3",
                          file,
                          "3.1.3",
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
                        removeFile("criteria3_1_3", link);
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
                      <th className="border border-black px-4 py-2 text-gray-800">Workshop Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Participants</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Date From</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Date To</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.workshop_name}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.workshop_name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.participants}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.date_from}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.date_to}</td>
                        <td className="border border-black text-black px-2 py-2 w-48">
                          <div className="flex justify-between gap-1">
                            <button
                              type="button"
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                setFormData({
                                  id: entry.id,
                                  slNo: entry.sl_no || entry.slNo,
                                  workshop_name: entry.workshop_name,
                                  participants: entry.participants,
                                  date_from: entry.date_from,
                                  date_to: entry.date_to,
                                  supportLinks: [],
                                });
                                setEditKey(entry.id);
                                setIsEditMode(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              title="Edit entry"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const entryId = entry.id || entry.sl_no || entry.slNo;
                                  if (!entryId) {
                                    throw new Error('No valid ID found for this entry');
                                  }
                                  await handleDelete(entryId);
                                } catch (error) {
                                  console.error('Delete error:', error);
                                  setError('Failed to delete entry. Please try again.');
                                  setTimeout(() => setError(''), 3000);
                                }
                              }}
                              disabled={loading}
                              title="Delete entry"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
                  );
                };
                
                export default Criteria3_1_3;