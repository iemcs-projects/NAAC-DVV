import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from 'axios';
import api from "../../api";
import LandingNavbar from "../../components/landing-navbar";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { FaTrash, FaEdit } from 'react-icons/fa';
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria1_2_1 = () => {
  const { user } = useAuth();
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
  const [selectedOption, setSelectedOption] = useState("");
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    slNo: '',
    year: "",
    programme_code: "",
    programme_name: "",
    year_of_introduction: "",
    status_of_implementation_of_CBCS: false,
    year_of_implementation_of_CBCS: "",
    year_of_revision: "",
    prc_content_added: false,
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

  const convertToPaddedFormat = (code) => {
    // For criteria 1.2.1, we need to return '010101010201' based on the database
    return '010101010201';
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
        `/criteria2/getResponse/1.2.1`, 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '010101010201' // Pass the correct criteria code
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
        if (item.sl_no) {
          const programme = item.programme_name || item.name;
          localStorage.setItem(`criteria121_${programme}_${yearToSend}`, item.sl_no);
        }
      });
      
      return data.map(item => ({
        slNo: item.sl_no,
        year: item.session || year,
        programme_code: item.programme_code,
        programme_name: item.programme_name,
        year_of_introduction: item.year_of_introduction,
        status_of_implementation_of_CBCS: item.status_of_implementation_of_CBCS,
        year_of_implementation_of_CBCS: item.year_of_implementation_of_CBCS,
        year_of_revision: item.year_of_revision,
        prc_content_added: item.prc_content_added,
        session: item.session || year
      }));
    } catch (err) {
      console.error("Error fetching response data:", err);
      setError("Failed to load response data. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch score for the current year
  const fetchScore = async () => {
    if (!currentYear) return;
    
    // Try to load from localStorage first
    const cachedScore = localStorage.getItem(`criteria121_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria121_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria1/score121`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria121_score_${currentYear}`, 
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
        programme_code: formDataToSubmit.programme_code.trim(),
        programme_name: formDataToSubmit.programme_name.trim(),
        year_of_introduction: formDataToSubmit.year_of_introduction,
        status_of_implementation_of_CBCS: formDataToSubmit.status_of_implementation_of_CBCS,
        year_of_implementation_of_CBCS: formDataToSubmit.year_of_implementation_of_CBCS,
        year_of_revision: formDataToSubmit.year_of_revision,
        prc_content_added: formDataToSubmit.prc_content_added,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend)
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria1/createResponse121', payload);
      console.log('Response received:', response);
      
      // Show success if we get any response (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        // Show success alert
        alert('Data submitted successfully!');
        
        // Store the SL number in localStorage if available
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria121_${formDataToSubmit.programme_name}_${yearToSend}`, 
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
          programme_code: "",
          programme_name: "",
          year_of_introduction: "",
          status_of_implementation_of_CBCS: false,
          year_of_implementation_of_CBCS: "",
          year_of_revision: "",
          prc_content_added: false,
          year: currentYear,
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
      const yearStr = String(formDataToSubmit.year || '');
      const yearToSend = yearStr.split("-")[0];
      const yearNum = parseInt(yearToSend, 10) || new Date().getFullYear();
      
      // Convert string '1'/'0' to boolean if needed
      const statusCBCS = typeof formDataToSubmit.status_of_implementation_of_CBCS === 'string' 
        ? formDataToSubmit.status_of_implementation_of_CBCS === '1' 
        : Boolean(formDataToSubmit.status_of_implementation_of_CBCS);
        
      const prcAdded = typeof formDataToSubmit.prc_content_added === 'string'
        ? formDataToSubmit.prc_content_added === '1'
        : Boolean(formDataToSubmit.prc_content_added);
      
      const payload = {
        programme_code: formDataToSubmit.programme_code?.trim() || '',
        programme_name: formDataToSubmit.programme_name?.trim() || '',
        year_of_introduction: formDataToSubmit.year_of_introduction || '',
        status_of_implementation_of_CBCS: statusCBCS,
        year_of_implementation_of_CBCS: formDataToSubmit.year_of_implementation_of_CBCS || '',
        year_of_revision: formDataToSubmit.year_of_revision || '',
        prc_content_added: prcAdded,
        session: yearNum,
        year: yearNum
      };
      
      console.log('Sending update payload:', payload); // Debug log
      
      const response = await api.put(`/criteria1/updateResponse121/${formDataToSubmit.slNo}`, payload);
      console.log('Update response:', response.data); // Debug log
      
      if (response.data && response.data.success) {
        // Refresh the data
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
    const programme_code = dataToSubmit.programme_code?.trim();
    const programme_name = dataToSubmit.programme_name?.trim();
    const yearInput = String(dataToSubmit.year || currentYear);
    const yearToSend = yearInput.split("-")[0];
    const session = parseInt(yearToSend, 10);
    const currentYearNum = new Date().getFullYear();

    if (!programme_code || !programme_name) {
      throw new Error("Please fill in all required fields (Programme Code and Programme Name).");
    }
    
    if (isNaN(session) || session < 1990 || session > currentYearNum) {
      throw new Error(`Year must be between 1990 and ${currentYearNum}.`);
    }

    return true;
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      validateFormData(formData);
      
      if (isEditMode && formData.slNo) {
        console.log('Updating entry:', formData);
        await handleUpdate(formData);
      } else {
        console.log('Creating new entry:', formData);
        await handleCreate(formData);
      }
      
      // Reset form
      setFormData({
        slNo: '',
        programme_code: "",
        programme_name: "",
        year_of_introduction: "",
        status_of_implementation_of_CBCS: false,
        year_of_implementation_of_CBCS: "",
        year_of_revision: "",
        prc_content_added: false,
        year: currentYear,
        supportLinks: []
      });
      setIsEditMode(false);
      setEditKey(null);
      
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
    
    loadData();
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
    navigate("/criteria1.3.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.1.3");
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
      const response = await api.delete(`/criteria1/deleteResponse121/${slNo}`, {
        params: { year }
      });
      
      if (response.status === 200) {
        // Update the local state to remove the deleted entry
        setSubmittedData(prevData => {
          if (!Array.isArray(prevData)) return [];
          return prevData.filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          );
        });
        
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
                <p className="text-gray-600 text-sm">1.2 Academic Flexibility</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4 " />
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">1.2.1 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Percentage of Programmes in which Choice Based Credit System (CBCS)/ elective course system
              has been implemented
            </p>
          </div>

          <div className="mb-4">
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

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (1.2.1): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          <div className="border rounded mb-8">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              CBCS Implementation - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-50 text-black">
                <tr>
                  <th className="px-4 py-2 border">Year</th>
                  <th className="px-4 py-2 border">Programme Code</th>
                  <th className="px-4 py-2 border">Programme Name</th>
                  <th className="px-4 py-2 border">Year of Introduction</th>
                  <th className="px-4 py-2 border">CBCS Implemented</th>
                  <th className="px-4 py-2 border">Year of CBCS Implementation</th>
                  <th className="px-4 py-2 border">Year of Revision</th>
                  <th className="px-4 py-2 border">PRC Content Added</th>
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
                      value={formData.programme_code}
                      onChange={(e) => handleChange("programme_code", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Programme Code"
                      required
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.programme_name}
                      onChange={(e) => handleChange("programme_name", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Programme Name"
                      required
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.year_of_introduction}
                      onChange={(e) => handleChange("year_of_introduction", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Year of Introduction"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.status_of_implementation_of_CBCS ? "YES" : "NO"}
                      onChange={(e) => handleChange("status_of_implementation_of_CBCS", e.target.value === "YES")}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.year_of_implementation_of_CBCS}
                      onChange={(e) => handleChange("year_of_implementation_of_CBCS", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Year of Implementation"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.year_of_revision}
                      onChange={(e) => handleChange("year_of_revision", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Year of Revision"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.prc_content_added ? "YES" : "NO"}
                      onChange={(e) => handleChange("prc_content_added", e.target.value === "YES")}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`px-3 py-1 rounded text-white ${
                          submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {submitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
                      </button>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              slNo: '',
                              programme_code: "",
                              programme_name: "",
                              year_of_introduction: "",
                              status_of_implementation_of_CBCS: false,
                              year_of_implementation_of_CBCS: "",
                              year_of_revision: "",
                              prc_content_added: false,
                              year: currentYear,
                              supportLinks: [],
                            });
                            setEditKey(null);
                            setIsEditMode(false);
                          }}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
                    "criteria1_2_1",
                    file,
                    "1.2.1",
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
    


  {formData.supportLinks.length > 0 && (
    <ul className="list-disc pl-5 text-gray-700">
      {formData.supportLinks.map((link, index) => (
        <li key={index} className="flex justify-between items-center mb-1">
          <a
            href={`http://localhost:3000${link}`} // prefix with backend base URL
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
              removeFile("criteria1_2_1", link);
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

  {availableSessions.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 !text-gray-800 px-4 py-2">
                Year: {year}
              </h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Programme Code</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Programme Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of Introduction</th>
                      <th className="border border-black px-4 py-2 text-gray-800">CBCS Implemented</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of CBCS Implementation</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of Revision</th>
                      <th className="border border-black px-4 py-2 text-gray-800">PRC Content Added</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={`${entry.programme_name}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.programme_code}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.programme_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.year_of_introduction}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          {entry.status_of_implementation_of_CBCS === 'YES' || entry.status_of_implementation_of_CBCS === true ? 'YES' : 'NO'}
                        </td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.year_of_implementation_of_CBCS}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.year_of_revision}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          {entry.prc_content_added === 'YES' || entry.prc_content_added === true ? 'YES' : 'NO'}
                        </td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                setFormData({
                                  slNo: entry.sl_no || entry.slNo,
                                  programme_code: entry.programme_code,
                                  programme_name: entry.programme_name,
                                  year_of_introduction: entry.year_of_introduction,
                                  status_of_implementation_of_CBCS: entry.status_of_implementation_of_CBCS,
                                  year_of_implementation_of_CBCS: entry.year_of_implementation_of_CBCS,
                                  year_of_revision: entry.year_of_revision,
                                  prc_content_added: entry.prc_content_added,
                                  year: entry.year,
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
                                if (window.confirm('Are you sure you want to delete this entry?')) {
                                  handleDelete(entry.sl_no || entry.slNo, entry.year);
                                }
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
                <p className="px-4 py-2 text-gray-500">No data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Status Messages */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
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

export default Criteria1_2_1;