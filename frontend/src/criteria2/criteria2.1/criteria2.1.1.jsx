import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import LandingNavbar from "../../components/landing-navbar";

const Criteria2_1_1 = () => {
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
    name: "",
    code: "",
    seats: 0,
    totalstudents: 0,
    year: "",
    supportLinks: [],
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
        `/criteria2/getResponse/2.1.1`, 
        { params: { session: yearToSend } }
      );
      
      const data = response.data?.data || [];
      
      // Store the SL numbers in localStorage for each entry
      data.forEach(item => {
        if (item.sl_no) {
          localStorage.setItem(`criteria211_${item.programme_code}_${yearToSend}`, item.sl_no);
        }
      });
      
      return data.map(item => ({
        slNo: item.sl_no,
        year: year,
        name: item.programme_name,
        code: item.programme_code,
        seats: item.no_of_seats,
        totalstudents: item.no_of_students,
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
    const cachedScore = localStorage.getItem(`criteria211_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        // Only use cached score if it's not too old (e.g., less than 1 hour old)
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria211_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria2/score211`);
      
      // Save to state
      setProvisionalScore(response.data);
      
      // Cache the response in localStorage with a timestamp
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria211_score_${currentYear}`, 
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
        programme_name: formDataToSubmit.name.trim(),
        programme_code: formDataToSubmit.code.trim(),
        no_of_seats: Number(formDataToSubmit.seats),
        no_of_students: Number(formDataToSubmit.totalstudents),
        session: parseInt(yearToSend),
        year: parseInt(yearToSend)
      };
      
      const response = await api.post('/criteria2/createResponse211', payload);
      
      if (response.data.success) {
        // Store the SL number in localStorage
        if (response.data.data.sl_no) {
          localStorage.setItem(
            `criteria211_${payload.programme_code}_${yearToSend}`, 
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
          name: "",
          code: "",
          seats: 0,
          totalstudents: 0,
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
        programme_name: formDataToSubmit.name.trim(),
        programme_code: formDataToSubmit.code.trim(),
        no_of_seats: Number(formDataToSubmit.seats),
        no_of_students: Number(formDataToSubmit.totalstudents),
        session: parseInt(yearToSend),
        year: parseInt(yearToSend)
      };
      
      const response = await api.put(`/criteria2/updateResponse211/${formDataToSubmit.slNo}`, payload);
      
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
    const programme_name = dataToSubmit.name.trim();
    const programme_code = dataToSubmit.code.trim();
    const no_of_seats = Number(dataToSubmit.seats);
    const no_of_students = Number(dataToSubmit.totalstudents);
    const yearInput = dataToSubmit.year || currentYear;
    const yearToSend = yearInput.split("-")[0];
    const session = parseInt(yearToSend);
    const currentYearNum = new Date().getFullYear();

    if (!programme_name || !programme_code || !no_of_seats || !no_of_students) {
      throw new Error("Please fill in all required fields.");
    }
    
    if (no_of_seats <= 0 || no_of_students < 0) {
      throw new Error("Seats and student counts must be positive numbers.");
    }

    if (no_of_seats < no_of_students) {
      throw new Error("Number of seats cannot be less than number of students.");
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
          entry => entry.code === editKey?.code && entry.year === editKey?.year
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

  const goToNextPage = () => navigate("/criteria2.1.2");
  const goToPreviousPage = () => navigate("/criteria2.1.1");
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
              Criteria 2: Teaching-Learning and Evaluation
            </h2>
            <div className="text-sm text-gray-600">
              2.1-Student Enrolment and Profile
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4">
          

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">2.1.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Average enrolment Percentage (Average of last five years)
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
                Provisional Score (2.1.1): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
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
              Average Enrolment Percentage - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-gray-800">Programme Name</th>
                  <th className="border px-4 py-2 text-gray-800">Programme Code</th>
                  <th className="border px-4 py-2 text-gray-800">Seats Sanctioned</th>
                  <th className="border px-4 py-2 text-gray-800">Students Admitted</th>
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
                      placeholder="Program Name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Program Code"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Seats Sanctioned"
                      value={formData.seats}
                      onChange={(e) => handleChange('seats', Number(e.target.value))}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-gray-600"
                      placeholder="Students Admitted"
                      value={formData.totalstudents}
                      onChange={(e) => handleChange('totalstudents', Number(e.target.value))}
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
                              name: "",
                              code: "",
                              seats: 0,
                              totalstudents: 0,
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

          {/* Support Links */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Link to relevant documents
            </label>
            <div className="flex flex-col gap-2">
              {(formData.supportLinks || []).map((link, index) => (
                <input
                  key={index}
                  type="url"
                  placeholder={`Enter support link ${index + 1}`}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-950"
                  value={link}
                  onChange={(e) => handleChange('supportLinks', e.target.value, index)}
                />
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, supportLinks: [...formData.supportLinks, ''] })
                }
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
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
                      <th className="border border-black px-4 py-2 text-gray-800">Program Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Program Code</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Seats Sanctioned</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Students Admitted</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={entry.code + year}>
                        <td className="border border-black text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.code}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.seats}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.totalstudents}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => {
                              setFormData({
                                slNo: entry.slNo,
                                name: entry.name,
                                code: entry.code,
                                seats: entry.seats,
                                totalstudents: entry.totalstudents,
                                year: entry.year,
                                supportLinks: [],
                              });
                              setEditKey({ code: entry.code, year: entry.year });
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

export default Criteria2_1_1;