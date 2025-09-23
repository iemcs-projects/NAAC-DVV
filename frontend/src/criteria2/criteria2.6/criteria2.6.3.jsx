import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria2_6_3 = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
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
  const [formData, setFormData] = useState({
    slNo: '',
    programme_code: "",
    programme_name: "",
    number_of_students_appeared_in_the_final_year_examination: 0,
    number_of_students_passed_in_the_final_year_examination: 0,
    year: "",
    supportLinks: [],
  });

  const navigate = useNavigate();

  const goToNextPage = () => navigate("/criteria2.7.1");
  const goToPreviousPage = () => navigate("/criteria2.6.2");

  // Fetch data for the current year
  const fetchResponseData = async (year) => {
    if (!year) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const yearToSend = year.split("-")[0];
      console.log(`Fetching data for year: ${yearToSend}`);
      const response = await api.get(
        `/criteria2/getResponse/2.6.3`, 
        { params: { session: yearToSend } }
      );
      
      console.log('Raw API Response:', response.data); // Debug log
      const data = response.data?.data || [];
      
      // Store the SL numbers in localStorage for each entry
      data.forEach(item => {
        if (item.sl_no) {
          localStorage.setItem(`criteria263_${item.programme_code}_${yearToSend}`, item.sl_no);
        }
      });
      
      const processedData = data.map(item => {
        console.log('Processing item:', item); // Debug log
        return {
          slNo: item.sl_no || item.id || '',
          year: year,
          programme_code: item.programme_code || item['Program Code'] || '',
          programme_name: item.programme_name || item['Program Name'] || item.programName || 'Not Available',
          number_of_students_appeared_in_the_final_year_examination: 
            item.number_of_students_appeared_in_the_final_year_examination || 
            item.appeared || 
            item['No. Appeared'] || 
            0,
          number_of_students_passed_in_the_final_year_examination: 
            item.number_of_students_passed_in_the_final_year_examination || 
            item.passed || 
            item['No. Passed'] || 
            0,
          session: item.session || yearToSend
        };
      });
      
      console.log('Processed Data:', processedData); // Debug log
      return processedData;
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
    const cachedScore = localStorage.getItem(`criteria263_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria263_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria2/score263`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria263_score_${currentYear}`, 
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
        session: parseInt(yearToSend),
        year: parseInt(yearToSend),
        programme_code: formDataToSubmit.programme_code.trim(),
        programme_name: formDataToSubmit.programme_name.trim(),
        number_of_students_appeared_in_the_final_year_examination: Number(formDataToSubmit.number_of_students_appeared_in_the_final_year_examination),
        number_of_students_passed_in_the_final_year_examination: Number(formDataToSubmit.number_of_students_passed_in_the_final_year_examination),
      };
      
      const response = await api.post('/criteria2/createResponse263', payload);
      
      if (response.data.success) {
        // Store the SL number in localStorage
        if (response.data.data.sl_no) {
          localStorage.setItem(
            `criteria263_${payload.programme_code}_${yearToSend}`, 
            response.data.data.sl_no
          );
        }
        
        // Refresh the data
        const updatedData = await fetchResponseData(currentYear);
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        // Reset form
        setFormData({
          slNo: '',
          programme_code: "",
          programme_name: "",
          number_of_students_appeared_in_the_final_year_examination: 0,
          number_of_students_passed_in_the_final_year_examination: 0,
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
      const yearToSend = formDataToSubmit.year.split("-")[0];
      const payload = {
        session: parseInt(yearToSend),
        year: parseInt(yearToSend),
        programme_code: formDataToSubmit.programme_code.trim(),
        programme_name: formDataToSubmit.programme_name.trim(),
        number_of_students_appeared_in_the_final_year_examination: Number(formDataToSubmit.number_of_students_appeared_in_the_final_year_examination),
        number_of_students_passed_in_the_final_year_examination: Number(formDataToSubmit.number_of_students_passed_in_the_final_year_examination),
      };
      
      const response = await api.put(`/criteria2/updateResponse263/${formDataToSubmit.slNo}`, payload);
      
      if (response.data.success) {
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
    const programme_code = dataToSubmit.programme_code.trim();
    const programme_name = dataToSubmit.programme_name.trim();
    const appeared = Number(dataToSubmit.number_of_students_appeared_in_the_final_year_examination);
    const passed = Number(dataToSubmit.number_of_students_passed_in_the_final_year_examination);
    const yearInput = dataToSubmit.year || currentYear;
    const yearToSend = yearInput.split("-")[0];
    const session = parseInt(yearToSend);
    const currentYearNum = new Date().getFullYear();

    if (!programme_code || !programme_name || appeared === 0 || passed < 0) {
      throw new Error("Please fill in all required fields with valid data.");
    }
    
    if (appeared < 0 || passed < 0) {
      throw new Error("Student counts must be non-negative numbers.");
    }

    if (passed > appeared) {
      throw new Error("Number of students passed cannot be greater than number of students appeared.");
    }

    if (session < 1990 || session > currentYearNum) {
      throw new Error("Year must be between 1990 and current year.");
    }

    return true;
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      validateFormData(formData);
      
      if (isEditMode) {
        // Find the entry to update
        const entryToUpdate = yearData[currentYear]?.find(
          entry => entry.programme_code === editKey?.programme_code && entry.year === editKey?.year
        );
        
        if (entryToUpdate) {
          const updateData = { ...formData, slNo: entryToUpdate.slNo };
          await handleUpdate(updateData);
        } else {
          setError("Entry not found for update");
          return;
        }
      } else {
        await handleCreate(formData);
      }
      
      // Reset edit mode
      setIsEditMode(false);
      setEditKey(null);
      
    } catch (err) {
      setError(err.message);
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

  const handleExport = () => {
    window.open("http://localhost:8000/download-excel", "_blank");
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
              <p className="text-2xl font-bold text-gray-800">Criteria 2 - Teaching, Learning and Evaluation</p>
              <p className="text-gray-600 text-sm">2.6 Student Performance and Learning Outcome</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          

          <div className="flex-1 flex flex-col p-4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="mb-4">
                <h3 className="text-blue-600 font-medium mb-2">2.6.3 Metric Information</h3>
                <p className="text-sm text-gray-700">
                  Average pass percentage of Students during last five years
                </p>
              </div>
              <div className="mb-6">
                <h3 className="text-blue-600 font-medium mb-2">Data Requirement (As per Data Template):</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Programme code</li>
                  <li>Name of the Programme</li>
                  <li>Number of Students appeared</li>
                  <li>Number of Students passed</li>
                  <li>Pass percentage</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year:</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              value={currentYear}
              onChange={handleYearChange}
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? (
                <option>Loading sessions...</option>
              ) : availableSessions.length > 0 ? (
                availableSessions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))
              ) : (
                <option>No sessions available</option>
              )}
            </select>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (2.6.3): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
                  ? (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria).toFixed(2)
                  : (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria)} %
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                </span>
              </p>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          {/* Input Form */}
          <div className="border rounded mb-8">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Average Pass Percentage - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-gray-800">Program Code</th>
                  <th className="border px-4 py-2 text-gray-800">Program Name</th>
                  <th className="border px-4 py-2 text-gray-800">No. Appeared</th>
                  <th className="border px-4 py-2 text-gray-800">No. Passed</th>
                  <th className="border px-4 py-2 text-gray-800">Year (Entry)</th>
                  <th className="border px-4 py-2 text-gray-800">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Program Code"
                      value={formData.programme_code}
                      onChange={(e) => handleChange('programme_code', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Program Name"
                      value={formData.programme_name}
                      onChange={(e) => handleChange('programme_name', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Number Appeared"
                      value={formData.number_of_students_appeared_in_the_final_year_examination}
                      onChange={(e) => handleChange('number_of_students_appeared_in_the_final_year_examination', Number(e.target.value))}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Number Passed"
                      value={formData.number_of_students_passed_in_the_final_year_examination}
                      onChange={(e) => handleChange('number_of_students_passed_in_the_final_year_examination', Number(e.target.value))}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      className="w-full border rounded px-2 py-1 text-black"
                      value={formData.year}
                      onChange={(e) => handleChange('year', e.target.value)}
                    >
                      {isLoadingSessions ? (
                        <option>Loading sessions...</option>
                      ) : availableSessions.length > 0 ? (
                        availableSessions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))
                      ) : (
                        <option>No sessions available</option>
                      )}
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
                              number_of_students_appeared_in_the_final_year_examination: 0,
                              number_of_students_passed_in_the_final_year_examination: 0,
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
                          "criteria2_6_3",
                          file,
                          "2.6.3",
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
                        removeFile("criteria2_6_3", link);
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

          {/* Display Data for All Years */}
          {availableSessions.map((year) => {
            const yearDataForYear = yearData[year] || [];
            console.log(`Rendering year ${year} with data:`, yearDataForYear);
            return (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 !text-gray-800 px-4 py-2">
                Year: {year}
              </h3>
              {yearDataForYear.length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Program Code</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Program Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Appeared</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Passed</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearDataForYear.map((entry, index) => (
                      <tr key={entry.programme_code + year}>
                        <td className="border border-black text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.programme_code}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.programme_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.number_of_students_appeared_in_the_final_year_examination}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.number_of_students_passed_in_the_final_year_examination}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => {
                              setFormData({
                                slNo: entry.slNo,
                                programme_code: entry.programme_code,
                                programme_name: entry.programme_name,
                                number_of_students_appeared_in_the_final_year_examination: entry.number_of_students_appeared_in_the_final_year_examination,
                                number_of_students_passed_in_the_final_year_examination: entry.number_of_students_passed_in_the_final_year_examination,
                                year: entry.year,
                                supportLinks: [],
                              });
                              setEditKey({ programme_code: entry.programme_code, year: entry.year });
                              setIsEditMode(true);
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                ) : (
                <div className="p-4">
                  <p className="text-gray-500">No data available for this year.</p>
                  <button 
                    onClick={() => fetchResponseData(year).then(data => {
                      setYearData(prev => ({
                        ...prev,
                        [year]: data
                      }));
                    })}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Click to refresh data
                  </button>
                </div>
              )}
            </div>
          )})}

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

          {/* Navigation */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria2_6_3;