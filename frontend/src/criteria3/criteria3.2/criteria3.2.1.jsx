import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import LandingNavbar from "../../components/landing-navbar";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import api from "../../api";
import { FaTrash, FaEdit } from 'react-icons/fa';
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";


const Criteria3_2_1 = () => {
    const { user } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [useupload, setUseupload] = useState(false);
  const { sessions: availableSessions, isLoading: isLoadingSessions } = useContext(SessionContext);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [error, setError] = useState(null);
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState(null);

  const [formData, setFormData] = useState({
    slNo: '',
    year: "",
    proj: '',           // paper_title
    name: '',           // author_names
    dept: '',           // department
    journal: '',        // journal_name
    yearPub: '',        // year_of_publication
    issn: '',           // issn_number
    indexation: 'Yes',  // indexation_status - default to 'Yes' or provide a dropdown in the form
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);

  const navigate = useNavigate();

  // Load data when component mounts or when currentYear changes
  useEffect(() => {
    const loadData = async () => {
      if (currentYear) {
        const data = await fetchResponseData(currentYear);
        setSubmittedData(data);
      }
    };
    
    loadData();
  }, [currentYear]);

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
      
      // Make the API call
      const response = await api.get(
        "/criteria2/getResponse/3.2.1", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '030202010001'
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
        paper_title: item.paper_title || item.proj || '',
        author_names: item.author_names || item.name || '',
        department: item.department || item.dept || '',
        journal_name: item.journal_name || item.journal || '',
        year_of_publication: item.year_of_publication || item.yearPub || '',
        issn_number: item.issn_number || item.issn || '',
        indexation_status: item.indexation_status || item.indexation || '',
        session: item.session || yearToSend
      }));
      
      console.log('Formatted data:', formattedData);
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
    const cachedScore = localStorage.getItem(`criteria321_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria321_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria3/score321`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria321_score_${currentYear}`, 
          JSON.stringify(cacheData)
        );
      }
    } catch (err) {
      console.error("Error fetching score:", err);
      setError("Failed to load score");
    }
  };

  // Validate form data
  const validateFormData = (dataToSubmit) => {
    const proj = dataToSubmit.proj?.toString()?.trim();
    const name = dataToSubmit.name?.toString()?.trim();
    const dept = dataToSubmit.dept?.toString()?.trim();
    const journal = dataToSubmit.journal?.toString()?.trim();
    const yearPub = dataToSubmit.yearPub;
    const issn = dataToSubmit.issn?.toString()?.trim();
    
    // Handle year input - ensure it's a string and get the first part if it's in range format
    let yearToSend;
    if (typeof dataToSubmit.year === 'string') {
      yearToSend = dataToSubmit.year.split('-')[0];
    } else if (dataToSubmit.year) {
      yearToSend = dataToSubmit.year.toString();
    } else {
      yearToSend = currentYear.toString();
    }
    
    const session = parseInt(yearToSend, 10);
    const currentYearNum = new Date().getFullYear();

    if (!proj || !name || !dept || !journal || yearPub === undefined || yearPub === '' || !issn) {
      throw new Error("Please fill in all required fields: Paper Title, Author Names, Department, Journal Name, Year of Publication, and ISSN Number.");
    }
    
    // Ensure yearPub is a number
    const yearPubNum = Number(yearPub);
    if (isNaN(yearPubNum) || yearPubNum < 1990 || yearPubNum > currentYearNum) {
      throw new Error(`Year of Publication must be a valid year between 1990 and ${currentYearNum}.`);
    }
    
    if (isNaN(session) || session < 1990 || session > currentYearNum) {
      throw new Error(`Session year must be between 1990 and ${currentYearNum}.`);
    }

    return true;
  };

  // Handle create new entry
  const handleCreate = async (formDataToSubmit) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Handle year input consistently
      let yearToSend;
      if (typeof formDataToSubmit.year === 'string') {
        yearToSend = formDataToSubmit.year.split('-')[0];
      } else {
        yearToSend = formDataToSubmit.year?.toString() || new Date().getFullYear().toString();
      }
      
      const payload = {
        paper_title: formDataToSubmit.proj?.toString().trim() || '',
        author_names: formDataToSubmit.name?.toString().trim() || '',
        department: formDataToSubmit.dept?.toString().trim() || '',
        journal_name: formDataToSubmit.journal?.toString().trim() || '',
        year_of_publication: formDataToSubmit.yearPub?.toString().trim() || '',
        issn_number: formDataToSubmit.issn?.toString().trim() || '',
        indexation_status: formDataToSubmit.indexation?.toString().trim() || '',
        session: parseInt(yearToSend, 10) || new Date().getFullYear(),
        year: parseInt(yearToSend, 10) || new Date().getFullYear()
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria3/createResponse321', payload);
      console.log('Response received:', response);
      
      // Show success if we get any response (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        // Show success alert
        alert('Research paper data submitted successfully!');
        
        // Store the SL number in localStorage if available
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria321_${formDataToSubmit.proj}_${yearToSend}`, 
            response.data.data.sl_no
          );
        }
        
        // Force refresh the data by fetching it again
        const updatedData = await fetchResponseData(currentYear);
        
        // Update the state with the new data
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        // Also update the submittedData state
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
          year: currentYear,
          proj: '',
          name: '',
          dept: '',
          journal: '',
          yearPub: '',
          issn: '',
          indexation: '',
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
    if (!formDataToSubmit.slNo) {
      setError("No entry selected for update");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Handle year input consistently
      let yearToSend;
      if (typeof formDataToSubmit.year === 'string') {
        yearToSend = formDataToSubmit.year.split('-')[0];
      } else {
        yearToSend = formDataToSubmit.year?.toString() || new Date().getFullYear().toString();
      }
      
      const payload = {
        paper_title: formDataToSubmit.proj?.toString().trim() || '',
        author_names: formDataToSubmit.name?.toString().trim() || '',
        department: formDataToSubmit.dept?.toString().trim() || '',
        journal_name: formDataToSubmit.journal?.toString().trim() || '',
        year_of_publication: formDataToSubmit.yearPub?.toString().trim() || '',
        issn_number: formDataToSubmit.issn?.toString().trim() || '',
        indexation_status: formDataToSubmit.indexation?.toString().trim() || ''
      };

      console.log('Updating entry with ID:', formDataToSubmit.slNo);
      console.log('Update payload:', payload);
      
      const response = await api.put(`/criteria3/updateResponse321/${formDataToSubmit.slNo}`, payload);
      
      if (response.status >= 200 && response.status < 300) {
        alert('Research paper data updated successfully!');
        
        // Refresh data
        const updatedData = await fetchResponseData(currentYear);
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        setSubmittedData(updatedData);
        
        // Reset form and edit mode
        setFormData({
          slNo: '',
          year: currentYear,
          proj: '',
          name: '',
          dept: '',
          journal: '',
          yearPub: '',
          issn: '',
          indexation: '',
          supportLinks: []
        });
        setIsEditMode(false);
        setEditKey(null);
        
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
      const response = await api.delete(`/criteria3/deleteResponse321/${String(id)}`);
      
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
        
        setSuccess('Entry deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError(error.response?.data?.message || 'Failed to delete entry. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create a clean copy of form data with proper values
      const formDataToSubmit = {
        ...formData,
        yearPub: formData.yearPub?.toString() || '',
        issn: formData.issn?.toString() || '',
        proj: formData.proj?.toString() || '',
        name: formData.name?.toString() || '',
        dept: formData.dept?.toString() || '',
        journal: formData.journal?.toString() || '',
        year: formData.year?.toString() || currentYear.toString()
      };
      
      validateFormData(formDataToSubmit);
      
      if (isEditMode && formData.slNo) {
        console.log('Updating entry:', formDataToSubmit);
        await handleUpdate(formDataToSubmit);
      } else {
        console.log('Creating new entry:', formDataToSubmit);
        await handleCreate(formDataToSubmit);
      }
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to save data');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Fetch data when currentYear changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch data for all available years
        const promises = availableSessions.map(year => fetchResponseData(year));
        const data = await Promise.all(promises);
        
        // Create yearData object with all years' data
        const newYearData = {};
        availableSessions.forEach((year, index) => {
          newYearData[year] = data[index];
        });
        
        setYearData(newYearData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    if (availableSessions && availableSessions.length > 0) {
      loadData();
    }
  }, [currentYear, availableSessions]);

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
    navigate("/criteria3.2.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria3.1.3");
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
                <p className="text-gray-600 text-sm">3.2 Promotion of Research</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4 " />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">3.2.1 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              3.2.1.1. Number of research papers in the Journals notified on UGC website during the last five years
            </p>
            <h4 className="font-semibold mb-1">Requirements:</h4>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Any additional information</li>
              <li>List of research papers by title, author, department, name and year of publication (Data Template)</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={handleYearChange}
            >
              {availableSessions && availableSessions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (3.2.1): {provisionalScore.data.score || provisionalScore.data.score_sub_sub_criteria || 0}%
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          <div className="border rounded mb-8">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Research Papers Data - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="w-full border text-sm">
                <thead className="bg-gray-50 text-black">
                  <tr>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Title of Paper</th>
                    <th className="px-4 py-2 border">Author Names</th>
                    <th className="px-4 py-2 border">Department</th>
                    <th className="px-4 py-2 border">Journal Name</th>
                    <th className="px-4 py-2 border">Year of Publication</th>
                    <th className="px-4 py-2 border">ISSN Number</th>
                    <th className="px-4 py-2 border">Indexation</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Form Row */}
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder={currentYear}
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.proj}
                        onChange={(e) => handleChange("proj", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Paper Title"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Author Names"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.dept}
                        onChange={(e) => handleChange("dept", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Department"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.journal}
                        onChange={(e) => handleChange("journal", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Journal Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.yearPub}
                        onChange={(e) => handleChange("yearPub", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Year"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.issn}
                        onChange={(e) => handleChange("issn", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="ISSN Number"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <select
                        value={formData.indexation}
                        onChange={(e) => handleChange("indexation", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        required
                      >
                        <option value="">Select Indexation</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border text-center">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add')}
                      </button>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditMode(false);
                            setEditKey(null);
                            setFormData({
                              slNo: '',
                              year: currentYear,
                              proj: '',
                              name: '',
                              dept: '',
                              journal: '',
                              yearPub: '',
                              issn: '',
                              indexation: '',
                              supportLinks: []
                            });
                          }}
                          className="ml-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div>

          {/* Upload Documents Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Documents (Journal | UGC | Article):
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
                          "criteria3_2_1",
                          file,
                          "3.2.1",
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
              {uploadError && <span className="text-red-600">{uploadError}</span>}
            </div>

            {formData.supportLinks.length > 0 && (
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
                        // Remove from local formData
                        setFormData(prev => ({
                          ...prev,
                          supportLinks: prev.supportLinks.filter(l => l !== link)
                        }));
                        // Also remove from context
                        removeFile("criteria3_2_1", link);
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

          {/* Display data by year */}
          {availableSessions && availableSessions.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 !text-gray-800 px-4 py-2">
                Year: {year}
              </h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Paper Title</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Author Names</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Department</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Journal Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of Publication</th>
                      <th className="border border-black px-4 py-2 text-gray-800">ISSN Number</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Indexation</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={`${entry.id || entry.slNo}-${year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.paper_title}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.author_names}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.department}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.journal_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.year_of_publication}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.issn_number}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.indexation_status}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setFormData({
                                  slNo: entry.slNo || entry.id,
                                  year: entry.session || currentYear,
                                  proj: entry.paper_title || '',
                                  name: entry.author_names || '',
                                  dept: entry.department || '',
                                  journal: entry.journal_name || '',
                                  yearPub: entry.year_of_publication || '',
                                  issn: entry.issn_number || '',
                                  indexation: entry.indexation_status || '',
                                  supportLinks: entry.supportLinks || []
                                });
                                setIsEditMode(true);
                                setEditKey(entry.slNo || entry.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                              title="Edit entry"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
                                  try {
                                    const entryId = entry.sl_no || entry.slNo || entry.id;
                                    if (!entryId) {
                                      throw new Error('No valid ID found for this entry');
                                    }
                                    await handleDelete(entryId);
                                  } catch (error) {
                                    console.error('Delete error:', error);
                                    setError('Failed to delete entry. Please try again.');
                                    setTimeout(() => setError(''), 3000);
                                  }
                                }
                              }}
                              disabled={loading}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
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
                <p className="px-4 py-2 text-gray-500">No research papers submitted for this year.</p>
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

          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_2_1;