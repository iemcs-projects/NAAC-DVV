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
import { FaTrash, FaEdit } from "react-icons/fa";

// Mapping between body options and their numbers (server expects numeric option_selected)
const bodyOptions = {
  "Academic council/BoS of Affiliating university": 1,
  "Setting of question papers for UG/PG programs": 2,
  "Design and Development of Curriculum for Add on/certificate/ Diploma Courses": 3,
  "Assessment /evaluation process of the affiliating University": 4,
};

const Criteria1_1_3 = () => {
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

  const [formData, setFormData] = useState({
    slNo: '',
    year: "",
    name: "",
    body: "",
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
    // For criteria 1.1.3, we need to return '010101010103' based on the database
    return '010101010103';
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
        `/criteria2/getResponse/1.1.3`, 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '010101010103' // Pass the correct criteria code
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
          const name = item.teacher_name || item.name;
          localStorage.setItem(`criteria113_${name}_${yearToSend}`, item.sl_no);
        }
      });
      
      return data.map(item => ({
        slNo: item.sl_no,
        year: item.session || year,
        name: item.teacher_name || item.name,
        body: item.body_name || item.body,
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
        const payload = {
          teacher_name: formDataToSubmit.name.trim(),
          body_name: formDataToSubmit.body,
          session: parseInt(yearToSend),
          year: parseInt(yearToSend),
          option_selected: 1 // Default value, adjust as needed
        };
        
        console.log('Sending request with payload:', payload);
        const response = await api.post('/criteria1/createResponse113', payload);
        console.log('Response received:', response);
        
        // Show success if we get any response (status 200-299)
        if (response.status >= 200 && response.status < 300) {
          console.log('Request was successful, showing alert');
          
          // Show success alert
          alert('Data submitted successfully!');
          
          // Store the SL number in localStorage if available
          if (response.data?.data?.sl_no) {
            localStorage.setItem(
              `criteria113_${formDataToSubmit.name}_${yearToSend}`, 
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
            name: "",
            body: "",
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
        
        if (!formDataToSubmit.name || !formDataToSubmit.body) {
          throw new Error("Please fill in all required fields (Name and Body).");
        }
        
        if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear()) {
          throw new Error(`Year must be between 1990 and ${new Date().getFullYear()}.`);
        }

        // Rest of the update logic would go here
        // ...
        
      } catch (error) {
        console.error('Error updating entry:', error);
        setError(error.message);
      } finally {
        setSubmitting(false);
      }
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      try {
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
          name: "",
          body: "",
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
    navigate("/criteria1.2.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.1.2");
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
      const response = await api.delete(`/criteria1/deleteResponse113/${slNo}`, {
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
    <div className="min-h-screen w-screen bg-gray-50 flex">
    <Sidebar onCollapse={setIsSidebarCollapsed} />
    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 pt-4`}>
       

        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Criteria 1: Curricular Aspects</h2>
            <div className="text-sm text-gray-600">1.1 - Curricular Planning and Implementation</div>
          </div>

          

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">1.1.3 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Teachers of the Institution participate in the following activities:<br />
              1. Academic council/BoS of Affiliating university<br />
              2. Setting of question papers for UG/PG programs<br />
              3. Design and Development of Curriculum<br />
              4. Evaluation process of the affiliating University
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
                  Provisional Score (1.1.3): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          <div className="border rounded mb-8">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Average Enrolment Percentage - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-50 text-black">
                <tr>
                  <th className="px-4 py-2 border">Year</th>
                  <th className="px-4 py-2 border">Name of Teacher</th>
                  <th className="px-4 py-2 border">Name of the Body</th>
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
                      placeholder="Name of Teacher"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.body}
                      onChange={(e) => handleChange("body", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
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
                              name: "",
                              body: "",
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
                      <th className="border border-black px-4 py-2 text-gray-800">Body Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year</th>
                      <th className="border border-black px-4 py-2 text-gray-800 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => {
                      // Get the display text for the selected option
                      const optionText = Object.entries(bodyOptions).find(
                        ([text, value]) => value === entry.option_selected
                      )?.[0] || entry.option_selected;
                      
                      return (
                        <tr key={`${entry.teacher_name}-${entry.year}-${index}`}>
                          <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                          <td className="border border-black text-black px-4 py-2">{entry.teacher_name || entry.name}</td>
                          <td className="border border-black text-black px-4 py-2">{optionText || entry.body_name || entry.body}</td>
                          <td className="border border-black text-black px-4 py-2 text-center">{entry.year}</td>
                          <td className="border border-black text-black px-4 py-2 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                                onClick={() => {
                                  setFormData({
                                    slNo: entry.sl_no || entry.slNo,
                                    name: entry.teacher_name || entry.name,
                                    body: entry.body_name || entry.body,
                                    year: entry.year,
                                    supportLinks: [],
                                    option_selected: entry.option_selected || 1
                                  });
                                  setEditKey({ 
                                    slNo: entry.sl_no || entry.slNo, 
                                    year: entry.year 
                                  });
                                  setIsEditMode(true);
                                }}
                                title="Edit"
                              >
                                <FaEdit className="mr-1" />
                              </button>
                              <button
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this entry?')) {
                                    handleDelete(entry.sl_no || entry.slNo, entry.year);
                                  }
                                }}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

export default Criteria1_1_3;
