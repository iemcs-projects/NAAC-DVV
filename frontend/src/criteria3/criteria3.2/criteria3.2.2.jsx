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

const Criteria3_2_2 = () => {
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
    name: "",        // teacher_name
    title: "",       // book_chapter_title
    paper: "",       // paper_title
    conf: "",        // conference_title
    yearPub: "",     // year_of_publication
    issn: "",        // isbn_issn_number
    yes: "",         // institution_affiliated
    pub: "",         // publisher_name
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
      
      const response = await api.get(
        "/criteria2/getResponse/3.2.2", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '030202020001'
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
        name: item.teacher_name || item.name || '',
        title: item.book_chapter_title || item.title || '',
        paper: item.paper_title || item.paper || '',
        conf: item.conference_title || item.conf || '',
        yearPub: item.year_of_publication || item.yearPub || '',
        issn: item.isbn_issn_number || item.issn || '',
        yes: item.institution_affiliated || item.yes || '',
        pub: item.publisher_name || item.pub || '',
        session: item.session || yearToSend,
        // Include all original data for debugging
        _raw: item
      }));
      
      console.log('Formatted data:', formattedData);
      
      // Store the SL numbers in localStorage for each entry
      formattedData.forEach(item => {
        if (item.slNo) {
          localStorage.setItem(`criteria3.2.2_slNo_${item.id}`, item.slNo);
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
    const cachedScore = localStorage.getItem(`criteria322_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria322_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria3/score322`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria322_score_${currentYear}`, 
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
        teacher_name: formDataToSubmit.name.trim(),
        book_chapter_title: formDataToSubmit.title.trim(),
        paper_title: formDataToSubmit.paper.trim(),
        conference_title: formDataToSubmit.conf.trim(),
        year_of_publication: formDataToSubmit.yearPub.trim(),
        publisher_name: formDataToSubmit.pub.trim(),
        isbn_issn_number: formDataToSubmit.issn.trim(),
        institution_affiliated: formDataToSubmit.yes.trim(),
        session: parseInt(yearToSend),
        year: parseInt(yearToSend)
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria3/createResponse322', payload);
      console.log('Response received:', response);
      
      // Show success if we get any response (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        // Show success alert
        alert('Book/chapter/paper data submitted successfully!');
        
        // Store the SL number in localStorage if available
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria322_${formDataToSubmit.title}_${yearToSend}`, 
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
          name: "",
          title: "",
          paper: "",
          conf: "",
          yearPub: "",
          issn: "",
          yes: "",
          pub: "",
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

  // Handle delete entry
  const handleDelete = async (id) => {
    if (!id) {
      setError('No ID provided for deletion');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      // Convert ID to string to match backend expectations
      const response = await api.delete(`/criteria3/deleteResponse322/${String(id)}`);
      
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

  // Handle update entry
  const handleUpdate = async (formDataToSubmit) => {
    if (!formDataToSubmit.slNo) {
      setError("No entry selected for update");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Since we don't have a getResponse322 endpoint, we'll use the current form data
      // and trust the session that was loaded when the data was fetched
      const yearToSend = formDataToSubmit.year?.toString().split("-")[0] || new Date().getFullYear().toString();
      
      const payload = {
        teacher_name: formDataToSubmit.name?.toString().trim() || '',
        book_chapter_title: formDataToSubmit.title?.toString().trim() || '',
        paper_title: formDataToSubmit.paper?.toString().trim() || '',
        conference_title: formDataToSubmit.conf?.toString().trim() || '',
        year_of_publication: formDataToSubmit.yearPub?.toString().trim() || '',
        publisher_name: formDataToSubmit.pub?.toString().trim() || '',
        isbn_issn_number: formDataToSubmit.issn?.toString().trim() || '',
        institution_affiliated: formDataToSubmit.yes?.toString().trim() || 'No',
        session: formDataToSubmit.year || yearToSend, // Use the form's year as session
        year: parseInt(yearToSend, 10) || new Date().getFullYear()
      };
      
      console.log('Sending update payload:', payload);
      
      // Use the update endpoint we know exists
      const response = await api.put(`/criteria3/updateResponse322/${formDataToSubmit.slNo}`, payload);
      
      if (response.data?.success) {
        // Refresh the data
        const updatedData = await fetchResponseData(currentYear);
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        
        // Reset form and exit edit mode
        setFormData({
          slNo: '',
          year: currentYear,
          name: "",
          title: "",
          paper: "",
          conf: "",
          yearPub: "",
          pub: "",
          issn: "",
          yes: "",
          supportLinks: []
        });
        setIsEditMode(false);
        setEditKey(null);
      } else {
        throw new Error(response.data?.message || 'Update failed');
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
    const name = dataToSubmit.name?.toString()?.trim() || '';
    const title = dataToSubmit.title?.toString()?.trim() || '';
    const paper = dataToSubmit.paper?.toString()?.trim() || '';
    const conf = dataToSubmit.conf?.toString()?.trim() || '';
    const yearPub = dataToSubmit.yearPub?.toString()?.trim() || '';
    const pub = dataToSubmit.pub?.toString()?.trim() || '';
    const issn = dataToSubmit.issn?.toString()?.trim() || '';
    const yes = dataToSubmit.yes?.toString()?.trim() || '';
    const yearInput = dataToSubmit.year || currentYear;
    let session;
    
    try {
      const yearToSend = yearInput.toString().split("-")[0];
      session = parseInt(yearToSend, 10);
    } catch (e) {
      throw new Error("Invalid year format");
    }
    
    const currentYearNum = new Date().getFullYear();

    if (!name || !title || !paper || !conf || !yearPub || !pub || !issn || !yes) {
      throw new Error("Please fill in all required fields.");
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
        year: currentYear,
        name: "",
        title: "",
        paper: "",
        conf: "",
        yearPub: "",
        issn: "",
        yes: "",
        pub: "",
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
    navigate("/criteria3.2.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria3.2.1");
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
            <h3 className="text-blue-600 font-semibold mb-2">3.2.2 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              3.2.2.1. Total number of books and chapters in edited volumes/books published and papers
              in national/international conference proceedings year-wise during last five years
            </p>
            <h4 className="font-semibold mb-1">Requirements:</h4>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Any additional information</li>
              <li>List of books/chapters in edited volumes/books published (Data Template)</li>
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
                  Provisional Score (3.2.2): {provisionalScore.data.score || provisionalScore.data.score_sub_sub_criteria || 0}%
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          <div className="border rounded mb-8">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Books, Chapters and Papers Data - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="w-full border text-sm">
                <thead className="bg-gray-50 text-black">
                  <tr>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Teacher Name</th>
                    <th className="px-4 py-2 border">Book/Chapter Title</th>
                    <th className="px-4 py-2 border">Paper Title</th>
                    <th className="px-4 py-2 border">Conference Title</th>
                    <th className="px-4 py-2 border">Year of Publication</th>
                    <th className="px-4 py-2 border">ISBN/ISSN</th>
                    <th className="px-4 py-2 border">Institution Affiliated</th>
                    <th className="px-4 py-2 border">Publisher</th>
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
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Teacher Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Book/Chapter Title"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.paper}
                        onChange={(e) => handleChange("paper", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Paper Title"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.conf}
                        onChange={(e) => handleChange("conf", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Conference Title"
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
                        placeholder="ISBN/ISSN"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <select
                        value={formData.yes}
                        onChange={(e) => handleChange("yes", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        required
                      >
                        <option value="">Select...</option>
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.pub}
                        onChange={(e) => handleChange("pub", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Publisher"
                        required
                      />
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
                              name: "",
                              title: "",
                              paper: "",
                              conf: "",
                              yearPub: "",
                              issn: "",
                              yes: "",
                              pub: "",
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
              Upload Documents:
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
                          "criteria3_2_2",
                          file,
                          "3.2.2",
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
                        removeFile("criteria3_2_2", link);
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
                      <th className="border border-black px-4 py-2 text-gray-800">Teacher Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Book/Chapter Title</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Paper Title</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Conference Title</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of Publication</th>
                      <th className="border border-black px-4 py-2 text-gray-800">ISBN/ISSN</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Institution Affiliated</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Publisher</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={`${entry.title}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.title}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.paper}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.conf}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.yearPub}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.issn}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.yes}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.pub}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => {
                                setFormData({
                                  slNo: entry.slNo || entry.id,
                                  year: entry.session || currentYear,
                                  name: entry.teacher_name || entry.name || '',
                                  title: entry.book_chapter_title || entry.title || '',
                                  paper: entry.paper_title || entry.paper || '',
                                  conf: entry.conference_title || entry.conf || '',
                                  yearPub: entry.year_of_publication || entry.yearPub || '',
                                  issn: entry.isbn_issn_number || entry.issn || '',
                                  yes: entry.institution_affiliated || entry.yes || '',
                                  pub: entry.publisher_name || entry.pub || '',
                                  supportLinks: entry.supportLinks || []
                                });
                                setEditKey({ 
                                  slNo: entry.slNo || entry.id, 
                                  year: entry.session || currentYear 
                                });
                                setIsEditMode(true);
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
                <p className="px-4 py-2 text-gray-500">No books/chapters/papers submitted for this year.</p>
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

export default Criteria3_2_2;