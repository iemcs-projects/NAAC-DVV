import React, { useState, useEffect, useContext } from "react"; 
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Bottom from "../../components/bottom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import LandingNavbar from "../../components/landing-navbar";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import api from "../../api";
import { FaTrash, FaEdit } from "react-icons/fa";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";


const Criteria2_1_2 = () => {
  const { user } = useAuth();
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const [useupload, setUseupload] = useState(false);
  const navigate = useNavigate();

  // Get sessions from context
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);

  const categories = ["SC", "ST", "OBC", "Divyangjan", "Gen", "Others"];
  const formData = {
    supportLinks: []
  }

  // State declarations
  const [currentYear, setCurrentYear] = useState("");
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState([]);

  // Fetch score when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching score...');
    fetchScore();
  }, []); // Empty dependency array means this runs once on mount
  const [dataRows, setDataRows] = useState({});

  // Initialize currentYear and dataRows when sessions load
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]);

      if (!dataRows[availableSessions[0]]) {
        setDataRows({
          [availableSessions[0]]: [
            {
              seats: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
              students: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
              year: ""
            },
          ],
        });
      }
    }
  }, [availableSessions]);

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

  // Fetch data for all available years
  useEffect(() => {
    const loadAllYearsData = async () => {
      setLoading(true);
      try {
        const promises = availableSessions.map(year => fetchResponseData(year));
        const data = await Promise.all(promises);
        
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
      loadAllYearsData();
    }
  }, [availableSessions]);

  // Fetch response data from backend
  const fetchResponseData = async (year) => {
    console.log('Fetching data for year:', year);
    if (!year) {
      console.log('No year provided, returning empty array');
      return [];
    }
    
    try {
      const yearToSend = year.split("-")[0];
      console.log('Sending request with session:', yearToSend);
      
      const response = await api.get(
        `/criteria2/getResponse/2.1.2`, 
        { 
          params: { 
            session: yearToSend
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
          localStorage.setItem(`criteria212_${item.year}_${yearToSend}`, item.sl_no);
        }
      });
      
      return data.map(item => ({
        slNo: item.sl_no,
        year: item.year || year,
        session: item.session || year,
        seats: item.number_of_seats_earmarked_for_reserved_category_as_per_GOI || 0,
        students: item.number_of_students_admitted_from_the_reserved_category || 0
      }));
    } catch (err) {
      console.error("Error fetching response data:", err);
      return [];
    }
  };

  // Handle year/session dropdown change
  const handleYearChange = (year) => {
    setCurrentYear(year);
    if (!dataRows[year]) {
      setDataRows(prev => ({
        ...prev,
        [year]: [
          {
            seats: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
            students: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
            year: ""
          },
        ],
      }));
    }
    setIsEditMode(false);
    setEditKey(null);
  };

  // Fetch provisional score
  const fetchScore = async () => {
    console.log('fetchScore called');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria2/score212", {
        withCredentials: true
      });
      console.log("Fetched score data:", response.data);
      
      // Debug: Log the full response structure
      console.log('Full response structure:', JSON.stringify(response.data, null, 2));
      
      // Handle the response structure correctly
      const scoreData = response.data.data || response.data;
      console.log('scoreData:', scoreData);
      
      const scoreValue = scoreData.score_sub_sub_criteria || 
                        (scoreData.score?.score_sub_sub_criteria) || 0;
      console.log('Extracted score value:', scoreValue);
      
      setProvisionalScore({
        data: {
          score_sub_sub_criteria: scoreValue
        },
        message: response.data.message || "Score loaded successfully"
      });
    } catch (err) {
      console.error("Error fetching provisional score:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch provisional score");
    } finally {
      setLoading(false);
    }
  };

  // Handle seat/student data changes
  const handleChange = (year, rowIndex, type, category, value) => {
    const updatedRows = [...(dataRows[year] || [])];
    updatedRows[rowIndex][type][category] = value;
    setDataRows({ ...dataRows, [year]: updatedRows });
  };

  // Handle year cell input change in table
  const handleYearCellChange = (session, rowIndex, value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    const updated = [...(dataRows[session] || [])];
    updated[rowIndex].year = numericValue ? parseInt(numericValue, 10) : "";
    setDataRows({ ...dataRows, [session]: updated });
  };

  // Add new row for current session
  const addRow = () => {
    const updated = [...(dataRows[currentYear] || [])];
    updated.push({
      seats: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
      students: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
      year: ""
    });
    setDataRows({ ...dataRows, [currentYear]: updated });
  };

  // Handle edit entry
  const handleEdit = (entry) => {
    // Convert the entry back to the format expected by dataRows
    const editData = {
      seats: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
      students: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
      year: entry.year
    };

    setDataRows({
      ...dataRows,
      [currentYear]: [editData]
    });
    
    setIsEditMode(true);
    setEditKey({ slNo: entry.slNo, year: entry.year });
  };

  // Handle update entry
  const handleUpdate = async () => {
    if (!editKey?.slNo) {
      setError("No entry selected for update");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const sessionYear = parseInt(currentYear.split("-")[0], 10);
      const rows = dataRows[currentYear] || [];
      const yearInput = rows[0]?.year ? Number(rows[0].year) : sessionYear;

      if (isNaN(sessionYear) || sessionYear < 2000 || sessionYear > 2099) {
        throw new Error("Invalid session year. Must be between 2000 and 2099.");
      }
      if (isNaN(yearInput) || yearInput < 2000 || yearInput > 2099) {
        throw new Error("Invalid year input. Must be between 2000 and 2099.");
      }
      if (!rows || rows.length === 0) {
        throw new Error("No data to submit. Please add at least one row.");
      }

      // Calculate totals
      const totalSeats = rows.reduce((sumRows, row) => {
        return sumRows + Object.values(row.seats || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
      }, 0);
      const totalStudents = rows.reduce((sumRows, row) => {
        return sumRows + Object.values(row.students || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
      }, 0);

      // Prepare request data for update
      const requestData = {
        session: sessionYear,
        year: yearInput,
        number_of_seats_earmarked_for_reserved_category_as_per_GOI: Math.round(Number(totalSeats) || 0),
        number_of_students_admitted_from_the_reserved_category: Math.round(Number(totalStudents) || 0),
      };

      console.log("Updating data:", requestData, "SlNo:", editKey.slNo);

      const response = await api.put(
        `/criteria2/updateResponse212/${editKey.slNo}`,
        requestData
      );

      console.log("Response updated:", response.data);

      // Refresh score and data
      await fetchScore();
      const updatedData = await fetchResponseData(currentYear);
      setYearData(prev => ({
        ...prev,
        [currentYear]: updatedData
      }));

      // Clear form and exit edit mode
      setDataRows(prev => ({
        ...prev,
        [currentYear]: []
      }));
      
      setIsEditMode(false);
      setEditKey(null);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      alert("Data updated successfully!");
      
    } catch (error) {
      console.error("Error updating:", error);
      setError(error.response?.data?.message || "Failed to update entry");
    } finally {
      setSubmitting(false);
    }
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
      const response = await api.delete(`/criteria2/deleteResponse212/${slNo}`, {
        params: { year }
      });
      
      if (response.status === 200) {
        // Update the local state to remove the deleted entry
        setYearData(prevData => {
          const updatedData = { ...prevData };
          if (updatedData[currentYear]) {
            updatedData[currentYear] = updatedData[currentYear].filter(entry => 
              entry.slNo !== slNo || entry.year !== year
            );
          }
          return updatedData;
        });
        
        // Show success message
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        alert('Entry deleted successfully!');
        
        // Refresh score
        await fetchScore();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError(error.response?.data?.message || 'Failed to delete entry. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit form data to backend
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    
    // If in edit mode, call update instead
    if (isEditMode) {
      await handleUpdate();
      return;
    }
    
    try {
      const sessionYear = parseInt(currentYear.split("-")[0], 10);
      const rows = dataRows[currentYear] || [];
      const yearInput = rows[0]?.year ? Number(rows[0].year) : sessionYear;

      if (isNaN(sessionYear) || sessionYear < 2000 || sessionYear > 2099) {
        throw new Error("Invalid session year. Must be between 2000 and 2099.");
      }
      if (isNaN(yearInput) || yearInput < 2000 || yearInput > 2099) {
        throw new Error("Invalid year input. Must be between 2000 and 2099.");
      }
      if (!rows || rows.length === 0) {
        throw new Error("No data to submit. Please add at least one row.");
      }

      // Calculate totals
      const totalSeats = rows.reduce((sumRows, row) => {
        return sumRows + Object.values(row.seats || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
      }, 0);
      const totalStudents = rows.reduce((sumRows, row) => {
        return sumRows + Object.values(row.students || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
      }, 0);

      // Prepare request data
      const requestData = {
        session: sessionYear,
        year: yearInput,
        number_of_seats_earmarked_for_reserved_category_as_per_GOI: Math.round(Number(totalSeats) || 0),
        number_of_students_admitted_from_the_reserved_category: Math.round(Number(totalStudents) || 0),
      };

      console.log("Sending data to backend:", requestData);

      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria2/createResponse212",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      console.log("Response created for year totals:", response.data);

      console.log('Before fetchScore call');
      await fetchScore().then(() => {
        console.log('After fetchScore completed');
      }).catch(err => {
        console.error('Error in fetchScore:', err);
      });

      // Refresh the data
      const updatedData = await fetchResponseData(currentYear);
      setYearData(prev => ({
        ...prev,
        [currentYear]: updatedData
      }));

      // Clear the data entry fields completely
      setDataRows(prev => ({
        ...prev,
        [currentYear]: []
      }));

      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      if (error.response && error.response.data) {
        alert("Submission failed: " + error.response.data.message);
      } else {
        alert("Submission failed due to network/server error.");
      }
    }
  };

  const handleDraft = () => {
    console.log("Draft saved", dataRows[currentYear]);
    alert("Draft saved.");
  };

  const goToNextPage = () => navigate("/criteria2.1.3");
  const goToPreviousPage = () => navigate("/criteria2.1.1");
  
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
              <p className="text-gray-600 text-sm">2.1 Student Enrollment</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          

          {/* Metric Info */}
          <div className="bg-white text-black p-4 mb-6">
            <h3 className="text-blue-700 text-lg font-semibold mb-2">2.1.2 Metric Information</h3>
            <p className="mb-4">
              Average percentage of seats filled against seats reserved for various categories (SC, ST, OBC, Divyangjan, etc. as per applicable reservation policy during the last five years (exclusive of supernumerary seats).
            </p>
            <h4 className="text-blue-700 font-semibold mb-2">Data Requirement for last five years: (As per Data Template)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Number of students admitted from the reserved category</li>
              <li>Total number of seats earmarked for reserved category as per GOI or State government rule</li>
            </ul>
          </div>

          {/* Provisional Score */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (2.1.2): {typeof provisionalScore.data.score_sub_sub_criteria === 'number'
                  ? provisionalScore.data.score_sub_sub_criteria.toFixed(2)
                  : provisionalScore.data.score_sub_sub_criteria} %
              </p>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Session Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Session:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={(e) => handleYearChange(e.target.value)}
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? (
                <option>Loading sessions...</option>
              ) : sessionError ? (
                <option>Error loading sessions</option>
              ) : availableSessions && availableSessions.length > 0 ? (
                availableSessions.map((sess) => (
                  <option key={sess} value={sess}>
                    {sess}
                  </option>
                ))
              ) : (
                <option>No sessions available</option>
              )}
            </select>
          </div>

          {/* Data Entry Table */}
          <div className="border rounded mb-4">
            <h3 className="text-lg font-semibold bg-blue-100 text-gray-800 px-4 py-2">
              Data Entry - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h3>
            <table className="w-full border border-black mb-4 text-sm text-black">
              <thead>
                <tr className="bg-gray-100">
                  <th rowSpan="2" className="border border-black px-2 py-1">Year</th>
                  <th colSpan={categories.length} className="border border-black px-2 py-1">
                    Number of seats earmarked for reserved category
                  </th>
                  <th colSpan={categories.length} className="border border-black px-2 py-1">
                    Number of students admitted from reserved category
                  </th>
                  <th rowSpan="2" className="border border-black px-2 py-1">Action</th>
                </tr>
                <tr className="bg-gray-100">
                  {categories.map((cat) => (
                    <th key={`seat-${cat}`} className="border border-black px-2 py-1">{cat}</th>
                  ))}
                  {categories.map((cat) => (
                    <th key={`student-${cat}`} className="border border-black px-2 py-1">{cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(dataRows[currentYear] || []).map((row, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="border border-black px-1">
                      <input
                        type="number"
                        min="2000"
                        max="2099"
                        step="1"
                        className="w-full p-1 border border-gray-300 rounded"
                        value={row.year ?? ""}
                        onChange={(e) => handleYearCellChange(currentYear, index, e.target.value)}
                        placeholder="YYYY"
                      />
                    </td>
                    {categories.map((cat) => (
                      <td key={`seats-${index}-${cat}`} className="border border-black px-1">
                        <input
                          type="number"
                          className="w-full p-1 border border-gray-300 rounded text-black"
                          value={row.seats[cat] ?? ""}
                          onChange={(e) =>
                            handleChange(currentYear, index, "seats", cat, e.target.value)
                          }
                        />
                      </td>
                    ))}
                    {categories.map((cat) => (
                      <td key={`students-${index}-${cat}`} className="border border-black px-1">
                        <input
                          type="number"
                          className="w-full p-1 border border-gray-300 rounded text-black"
                          value={row.students[cat] ?? ""}
                          onChange={(e) =>
                            handleChange(currentYear, index, "students", cat, e.target.value)
                          }
                        />
                      </td>
                    ))}
                    <td className="border border-black px-2 py-1">
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
                              setDataRows(prev => ({
                                ...prev,
                                [currentYear]: []
                              }));
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <button
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 mb-6"
            onClick={addRow}
          >
            Add Row
          </button>

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
            href={`http://localhost:3000${link}`} // ✅ prefix with backend base URL
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

          {/* Display Submitted Year Data with Edit/Delete buttons */}
          {availableSessions && availableSessions.map((year) => (
            <div key={year} className="border border-gray-400 rounded mb-4">
              <h3 className="bg-gray-200 text-lg font-semibold px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full border border-black text-black">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black px-2 py-1">#</th>
                      <th className="border border-black px-2 py-1">Year</th>
                      <th className="border border-black px-2 py-1">Total Seats</th>
                      <th className="border border-black px-2 py-1">Total Students</th>
                      <th className="border border-black px-2 py-1 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, idx) => (
                      <tr key={idx}>
                        <td className="border border-black px-2 py-1">{idx + 1}</td>
                        <td className="border border-black px-2 py-1">{entry.year}</td>
                        <td className="border border-black px-2 py-1">{entry.seats}</td>
                        <td className="border border-black px-2 py-1">{entry.students}</td>
                        <td className="border border-black px-2 py-1 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                              onClick={() => handleEdit(entry)}
                              title="Edit"
                            >
                              <FaEdit className="mr-1" />
                            </button>
                            <button
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(entry.slNo, entry.year);
                              }}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-2 text-gray-600">No data submitted for this year.</p>
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

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria2_1_2;