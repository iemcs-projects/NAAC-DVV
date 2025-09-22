import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import api from "../../api";

const Criteria3_4_1 = () => {
  const { sessions: availableSessions, isLoading: isLoadingSessions } = useContext(SessionContext);
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    slNo: '',
    year: "",
    title_of_activity: "",
    collaborating_agency: "",
    participant_name: "",
    year_of_collaboration: "",
    duration: "",
    supportLinks: []
  });

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
        "/criteria2/getResponse/3.4.1", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '030401040101'
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
        title_of_activity: item.title_of_activity || '',
        collaborating_agency: item.collaborating_agency || '',
        participant_name: item.participant_name || '',
        year_of_collaboration: item.year_of_collaboration || '',
        duration: item.duration || '',
        document_link: item.document_link || '',
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
    const cachedScore = localStorage.getItem(`criteria341_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria341_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria3/score341`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria341_score_${currentYear}`, 
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
    const title_of_activity = dataToSubmit.title_of_activity?.toString()?.trim();
    const collaborating_agency = dataToSubmit.collaborating_agency?.toString()?.trim();
    const participant_name = dataToSubmit.participant_name?.toString()?.trim();
    const year_of_collaboration = dataToSubmit.year_of_collaboration;
    const duration = dataToSubmit.duration?.toString()?.trim();
    
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

    if (!title_of_activity || !collaborating_agency || !participant_name || 
        year_of_collaboration === undefined || year_of_collaboration === '' || !duration) {
      throw new Error("Please fill in all required fields: Title of Activity, Collaborating Agency, Participant Name, Year of Collaboration, and Duration.");
    }
    
    // Ensure year_of_collaboration is a number
    const yearCollabNum = Number(year_of_collaboration);
    if (isNaN(yearCollabNum) || yearCollabNum < 1990 || yearCollabNum > currentYearNum) {
      throw new Error(`Year of Collaboration must be a valid year between 1990 and ${currentYearNum}.`);
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
        title_of_activity: formDataToSubmit.title_of_activity?.toString().trim() || '',
        collaborating_agency: formDataToSubmit.collaborating_agency?.toString().trim() || '',
        participant_name: formDataToSubmit.participant_name?.toString().trim() || '',
        year_of_collaboration: formDataToSubmit.year_of_collaboration?.toString().trim() || '',
        duration: formDataToSubmit.duration?.toString().trim() || '',
        document_link: formDataToSubmit.supportLinks?.filter(link => link?.trim()).join(', ') || '',
        session: parseInt(yearToSend, 10) || new Date().getFullYear(),
        year: parseInt(yearToSend, 10) || new Date().getFullYear()
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria3/createResponse341', payload);
      console.log('Response received:', response);
      
      // Show success if we get any response (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        // Show success alert
        alert('Collaboration data submitted successfully!');
        
        // Store the SL number in localStorage if available
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria341_${formDataToSubmit.title_of_activity}_${yearToSend}`, 
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
          title_of_activity: '',
          collaborating_agency: '',
          participant_name: '',
          year_of_collaboration: currentYear.split('-')[0],
          duration: '',
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
        title_of_activity: formDataToSubmit.title_of_activity?.toString().trim() || '',
        collaborating_agency: formDataToSubmit.collaborating_agency?.toString().trim() || '',
        participant_name: formDataToSubmit.participant_name?.toString().trim() || '',
        year_of_collaboration: formDataToSubmit.year_of_collaboration?.toString().trim() || '',
        duration: formDataToSubmit.duration?.toString().trim() || '',
        document_link: formDataToSubmit.supportLinks?.filter(link => link?.trim()).join(', ') || ''
      };

      console.log('Updating entry with ID:', formDataToSubmit.slNo);
      console.log('Update payload:', payload);
      
      const response = await api.put(`/criteria3/updateResponse341/${formDataToSubmit.slNo}`, payload);
      
      if (response.status >= 200 && response.status < 300) {
        alert('Collaboration data updated successfully!');
        
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
          title_of_activity: '',
          collaborating_agency: '',
          participant_name: '',
          year_of_collaboration: currentYear.split('-')[0],
          duration: '',
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
      const response = await api.delete(`/criteria3/deleteResponse341/${String(id)}`);
      
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
        year: formData.year?.toString() || currentYear.split('-')[0],
        title_of_activity: formData.title_of_activity?.toString() || '',
        collaborating_agency: formData.collaborating_agency?.toString() || '',
        participant_name: formData.participant_name?.toString() || '',
        year_of_collaboration: formData.year_of_collaboration?.toString() || currentYear.split('-')[0],
        duration: formData.duration?.toString() || ''
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
      setFormData(prev => ({ 
        ...prev, 
        year: firstYear.split('-')[0],
        year_of_collaboration: firstYear.split('-')[0]
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
      year_of_collaboration: yearOnly
    }));
    setIsEditMode(false);
    setEditKey(null);
  };

  const handleChange = (field, value, index = null) => {
    if (field === 'supportLinks') {
      const updated = [...(formData.supportLinks || [])];
      updated[index] = value;
      setFormData(prev => ({ ...prev, supportLinks: updated }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const goToNextPage = () => {
    navigate("/criteria3.4.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria3.3.4");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex">
    <Sidebar onCollapse={setIsSidebarCollapsed} />
    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 pt-4`}>

        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 3: Research, Innovations and Extension</h2>
            <div className="text-sm text-gray-600">3.4 - Collaboration</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">3.4.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                The Institution has several collaborations/linkages for Faculty exchange, Student exchange, Internship, Field trip, On-the-job training, research etc during the last five years.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>e-copies of linkage related documents</li>
                <li>Any additional information</li>
                <li>Details of linkages with institutions/industries for internship (Data Template)</li>
              </ul>
            </div>
          </div>

          {/* Year Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              value={currentYear}
              onChange={handleYearChange}
              className="px-3 py-1 border border-gray-300 rounded text-gray-950"
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? (
                <option>Loading sessions...</option>
              ) : (
                availableSessions && availableSessions.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Provisional Score */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (3.4.1): {provisionalScore.data.score || provisionalScore.data.score_sub_sub_criteria || 0}%
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          {/* Input Section */}
          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Collaborative Programs - {isEditMode ? 'Edit Mode' : 'Add New'}</h2>
              <div className="flex items-center">
                <label className="mr-2 font-medium">Current Year: {currentYear}</label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <table className="w-full border text-sm border-black">
                <thead className="bg-gray-100 text-gray-950">
                  <tr>
                    <th className="border px-2 py-2">Title</th>
                    <th className="border px-2 py-2">Agency</th>
                    <th className="border px-2 py-2">Participant</th>
                    <th className="border px-2 py-2">Year</th>
                    <th className="border px-2 py-2">Duration</th>
                    <th className="border px-2 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.title_of_activity}
                        onChange={(e) => handleChange("title_of_activity", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Title of Activity"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.collaborating_agency}
                        onChange={(e) => handleChange("collaborating_agency", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Collaborating Agency"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.participant_name}
                        onChange={(e) => handleChange("participant_name", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Participant Name"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="1990"
                        max={new Date().getFullYear()}
                        value={formData.year_of_collaboration}
                        onChange={(e) => handleChange("year_of_collaboration", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Year"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => handleChange("duration", e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Duration"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
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
                              setEditKey(null);
                              setFormData({
                                slNo: '',
                                year: currentYear.split('-')[0],
                                title_of_activity: '',
                                collaborating_agency: '',
                                participant_name: '',
                                year_of_collaboration: currentYear.split('-')[0],
                                duration: '',
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

              {/* Supporting Links Section */}
              <div className="p-4 border-t">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Links:
                  </label>
                  {formData.supportLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleChange('supportLinks', e.target.value, index)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Enter supporting document link"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.supportLinks.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, supportLinks: updated }));
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    supportLinks: [...(prev.supportLinks || []), '']
                  }))}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Supporting Link
                </button>
              </div>
            </form>
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
                      <th className="border border-black px-4 py-2 text-gray-800">Title</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Agency</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Participant</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Duration</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Link</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={`${entry.id || entry.slNo}-${year}-${index}`} className="even:bg-gray-50">
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.title_of_activity}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.collaborating_agency}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.participant_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.year_of_collaboration}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.duration}</td>
                        <td className="border border-black text-black px-4 py-2">
                          {entry.document_link && (
                            <a 
                              href={entry.document_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 underline"
                            >
                              View
                            </a>
                          )}
                        </td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              setFormData({
                                slNo: entry.slNo || entry.id,
                                year: entry.session || currentYear.split('-')[0],
                                title_of_activity: entry.title_of_activity || '',
                                collaborating_agency: entry.collaborating_agency || '',
                                participant_name: entry.participant_name || '',
                                year_of_collaboration: entry.year_of_collaboration || '',
                                duration: entry.duration || '',
                                supportLinks: entry.document_link ? entry.document_link.split(', ').filter(link => link.trim()) : []
                              });
                              setIsEditMode(true);
                              setEditKey(entry.slNo || entry.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                          >
                            Edit
                          </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
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
                              }}
                              disabled={loading}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
                              title="Delete entry"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-2 text-gray-500">No collaboration data submitted for this year.</p>
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

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_4_1;