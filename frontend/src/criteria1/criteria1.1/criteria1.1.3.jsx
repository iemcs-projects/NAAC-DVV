import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import api from "../../api";
import LandingNavbar from "../../components/landing-navbar";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";

// Mapping between body options and their numbers (server expects numeric option_selected)
const bodyOptions = {
  "Academic council/BoS of Affiliating university": 1,
  "Setting of question papers for UG/PG programs": 2,
  "Design and Development of Curriculum for Add on/certificate/ Diploma Courses": 3,
  "Assessment /evaluation process of the affiliating University": 4,
};

const Criteria1_1_3 = () => {
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
    year: "",
    name: "",
    body: "",
    supportLinks: []
  });

  const navigate = useNavigate();

  // Fetch data for the current year
  const fetchResponseData = async (year) => {
    if (!year) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const yearToSend = year.split("-")[0];
      const response = await api.get(
        `/api/v1/criteria1/getResponsesByCriteriaCode/1.1.3`, 
        { params: { session: yearToSend } }
      );
      
      const data = response.data?.data || [];
      
      // Store the SL numbers in localStorage for each entry
      data.forEach(item => {
        if (item.sl_no) {
          localStorage.setItem(`criteria113_${item.teacher_name}_${yearToSend}`, item.sl_no);
        }
      });
      
      return data.map(item => ({
        slNo: item.sl_no,
        year: year,
        name: item.teacher_name,
        body: item.body_name,
        option: item.option_selected,
        session: item.session
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
    const cachedScore = localStorage.getItem(`criteria113_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria113_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria1/score113`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria113_score_${currentYear}`, 
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
      const option_selected = bodyOptions[formDataToSubmit.body];
      
      if (!option_selected) {
        throw new Error("Please select a valid body option.");
      }
      
      const payload = {
        teacher_name: formDataToSubmit.name.trim(),
        body_name: formDataToSubmit.body.trim(),
        option_selected: option_selected,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend)
      };
      
      const response = await api.post('/api/v1/criteria1/createResponse113', payload);
      
      if (response.data.success) {
        // Store the SL number in localStorage
        if (response.data.data.sl_no) {
          localStorage.setItem(
            `criteria113_${payload.teacher_name}_${yearToSend}`, 
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
          year: currentYear,
          name: "",
          body: "",
          supportLinks: []
        });
        
        setSuccess('Data submitted successfully!');
        setTimeout(() => setSuccess(''), 3000);
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
      const option_selected = bodyOptions[formDataToSubmit.body];
      
      if (!option_selected) {
        throw new Error("Please select a valid body option.");
      }
      
      const payload = {
        teacher_name: formDataToSubmit.name.trim(),
        body_name: formDataToSubmit.body.trim(),
        option_selected: option_selected,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend)
      };
      
      const response = await api.put(`/criteria1/updateResponse113/${formDataToSubmit.slNo}`, payload);
      
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
    const teacher_name = dataToSubmit.name.trim();
    const body_name = dataToSubmit.body.trim();
    const yearInput = dataToSubmit.year || currentYear;
    const yearToSend = yearInput.split("-")[0];
    const session = parseInt(yearToSend);
    const currentYearNum = new Date().getFullYear();

    if (!teacher_name || !body_name) {
      throw new Error("Please fill in all required fields.");
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
          entry => entry.name === editKey?.name && entry.year === editKey?.year
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
      
      // Refresh score after successful submission
      fetchScore();
      
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

  const goToNextPage = () => navigate("/criteria1.2.1");
  const goToPreviousPage = () => navigate("/criteria1.1.2");
  const handleExport = () => {
    window.open("http://localhost:8000/download-excel", "_blank");
  };

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      <LandingNavbar />
    
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 1: Curricular Aspects
            </h2>
            <div className="text-sm text-gray-600">
              1.1-Curricular Planning and Implementation
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">1.1.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Teachers of the Institution participate in the following activities:
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Required Documents:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Any additional information</li>
                <li>Institutional data in prescribed format</li>
              </ul>
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
            ) : provisionalScore?.data?.score !== undefined || provisionalScore?.score !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (1.1.3): {typeof (provisionalScore.data?.score ?? provisionalScore.score) === 'number'
                  ? (provisionalScore.data?.score ?? provisionalScore.score).toFixed(2)
                  : (provisionalScore.data?.score ?? provisionalScore.score)}
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
              Teacher Participation - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-gray-800">Year</th>
                  <th className="border px-4 py-2 text-gray-800">Name of Teacher</th>
                  <th className="border px-4 py-2 text-gray-800">Name of the Body</th>
                  <th className="border px-4 py-2 text-gray-800">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
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
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Name of Teacher"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={formData.body}
                      onChange={(e) => handleChange('body', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-gray-600"
                    >
                      <option value="">Select Body</option>
                      {Object.keys(bodyOptions).map((key) => (
                        <option key={key} value={key}>{key}</option>
                      ))}
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
                              year: currentYear,
                              name: "",
                              body: "",
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
                          "criteria1_1_3",
                          file,
                          "1.1.3",
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
                        setFormData(prev => ({
                          ...prev,
                          supportLinks: prev.supportLinks.filter(l => l !== link)
                        }));
                        removeFile("criteria1_1_3", link);
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
                      <th className="border border-black px-4 py-2 text-gray-800">Name of Teacher</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Name of the Body</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={entry.name + year}>
                        <td className="border border-black text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.body}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => {
                              setFormData({
                                slNo: entry.slNo,
                                name: entry.name,
                                body: entry.body,
                                year: entry.year,
                                supportLinks: [],
                              });
                              setEditKey({ name: entry.name, year: entry.year });
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
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md z-50">
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                <span>{success}</span>
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

export default Criteria1_1_3;