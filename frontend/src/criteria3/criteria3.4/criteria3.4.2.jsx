import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import api from "../../api";


const Criteria3_4_2 = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const [formData, setFormData] = useState({
    slNo: '',
    year: "",
    institution_name: "",
    year_of_mou: "",
    duration: "",
    activities_list: ""
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
        "/criteria2/getResponse/3.4.2", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '030401040201'
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

  // Validate form data
  const validateFormData = (dataToSubmit) => {
    const institution_name = dataToSubmit.institution_name?.toString()?.trim();
    const year_of_mou = dataToSubmit.year_of_mou?.toString()?.trim();
    const duration = dataToSubmit.duration;
    const activities_list = dataToSubmit.activities_list?.toString()?.trim();
    
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

    if (!institution_name || !year_of_mou || duration === undefined || duration === '' || !activities_list) {
      throw new Error("Please fill in all required fields: Institution Name, Year of MOU, Duration, and Activities List.");
    }
    
    // Ensure year_of_mou is a valid year
    const mouYear = parseInt(year_of_mou);
    if (isNaN(mouYear) || mouYear < 1990 || mouYear > currentYearNum) {
      throw new Error(`Year of MOU must be a valid year between 1990 and ${currentYearNum}.`);
    }
    
    // Ensure duration is a valid number
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      throw new Error(`Duration must be a valid positive number.`);
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
        institution_name: formDataToSubmit.institution_name?.toString().trim() || '',
        year_of_mou: formDataToSubmit.year_of_mou?.toString().trim() || '',
        duration: parseInt(formDataToSubmit.duration) || 0,
        activities_list: formDataToSubmit.activities_list?.toString().trim() || '',
        session: parseInt(yearToSend, 10) || new Date().getFullYear(),
        year: parseInt(yearToSend, 10) || new Date().getFullYear()
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria3/createResponse342', payload);
      console.log('Response received:', response);
      
      // Show success if we get any response (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        // Show success alert
        alert('Awards and recognition data submitted successfully!');
        
        // Store the SL number in localStorage if available
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria342_${formDataToSubmit.institution_name}_${yearToSend}`, 
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
          institution_name: '',
          year_of_mou: currentYear.split('-')[0],
          duration: '',
          activities_list: ''
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
        institution_name: formDataToSubmit.institution_name?.toString().trim() || '',
        year_of_mou: formDataToSubmit.year_of_mou?.toString().trim() || '',
        duration: parseInt(formDataToSubmit.duration) || 0,
        activities_list: formDataToSubmit.activities_list?.toString().trim() || ''
      };

      console.log('Updating entry with ID:', formDataToSubmit.slNo);
      console.log('Update payload:', payload);
      
      const response = await api.put(`/criteria3/updateResponse342/${formDataToSubmit.slNo}`, payload);
      
      if (response.status >= 200 && response.status < 300) {
        alert('Awards and recognition data updated successfully!');
        
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
          institution_name: '',
          year_of_mou: currentYear.split('-')[0],
          duration: '',
          activities_list: ''
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
      const response = await api.delete(`/criteria3/deleteResponse342/${String(id)}`);
      
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
        institution_name: formData.institution_name?.toString() || '',
        year_of_mou: formData.year_of_mou?.toString() || currentYear.split('-')[0],
        duration: formData.duration?.toString() || '',
        activities_list: formData.activities_list?.toString() || ''
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
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goToNextPage = () => {
    navigate("/criteria3.4.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria3.4.1");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex">
    <Sidebar onCollapse={setIsSidebarCollapsed} />
    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 pt-4`}>
        <div className="flex-1 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-black">
              Criteria 3 - Research, Innovations and Extension
            </h2>
            <span className="text-sm text-black">
              3.4 – Extension Activities & Recognition
            </span>
          </div>

          {/* Metric Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">3.4.2 Metric Information</h3>
            <p className="text-gray-700">
              Number of awards and recognitions received for extension activities from government/recognised bodies during the last five years.
            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Supportive Documents:</h3>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Award letters</li>
              <li>Any additional relevant information</li>
            </ul>
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
                  Provisional Score (3.4.2): {provisionalScore.data.score || provisionalScore.data.score_sub_sub_criteria || 0}%
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          {/* Entry Form */}
          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Awards and Recognition - {isEditMode ? 'Edit Mode' : 'Add New'}</h2>
              <div className="flex items-center">
                <label className="mr-2 font-medium">Current Year: {currentYear}</label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <table className="w-full border text-sm border-black">
                <thead className="bg-gray-100 text-gray-950">
                  <tr>
                    <th className="border px-2 py-2">Institution Name</th>
                    <th className="border px-2 py-2">Year of MOU</th>
                    <th className="border px-2 py-2">Duration</th>
                    <th className="border px-2 py-2">Activities List</th>
                    <th className="border px-2 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.institution_name}
                        onChange={(e) => handleChange('institution_name', e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Institution Name"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="1990"
                        max={new Date().getFullYear()}
                        value={formData.year_of_mou}
                        onChange={(e) => handleChange('year_of_mou', e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Year"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => handleChange('duration', e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Duration (months/years)"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={formData.activities_list}
                        onChange={(e) => handleChange('activities_list', e.target.value)}
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder="Activities List"
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
                                institution_name: '',
                                year_of_mou: currentYear.split('-')[0],
                                duration: '',
                                activities_list: ''
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
                      <th className="border border-black px-4 py-2 text-gray-800">Institution Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year of MOU</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Duration</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Activities List</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={`${entry.id || entry.slNo}-${year}-${index}`} className="even:bg-gray-50">
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.institution_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.year_of_mou}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.duration}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.activities_list}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              setFormData({
                                slNo: entry.slNo || entry.id,
                                year: entry.session || currentYear.split('-')[0],
                                institution_name: entry.institution_name || '',
                                year_of_mou: entry.year_of_mou || '',
                                duration: entry.duration || '',
                                activities_list: entry.activities_list || ''
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
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            title="Delete entry"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-2 text-gray-500">No awards and recognition data submitted for this year.</p>
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