import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../../components/landing-navbar";
import api from "../../api";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { FaTrash, FaEdit } from 'react-icons/fa';

const Criteria5_2_2 = () => {
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const { sessions: availableSessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [currentYear, setCurrentYear] = useState(availableSessions?.[0] || "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    slNo: '',
    studentname: "",
    programme: "",
    institution: "",
    pname: "",
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);
  const navigate = useNavigate();

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
        "/criteria2/getResponse/5.2.2", 
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
      
      // Map the response data to match our form fields
      const data = response.data.data.map(item => ({
        id: item.id,
        slNo: item.sl_no || item.slNo,
        studentname: item.student_name || item.studentname || '',
        programme: item.program_graduated_from || item.programme || '',
        institution: item.institution_joined || item.institution || '',
        pname: item.program_admitted_to || item.pname || '',
        year: item.year || year,
        supportLinks: item.support_links || []
      }));
      
      console.log('Mapped data:', data);
      
      // Store the SL numbers in localStorage for each entry
      data.forEach(item => {
        if (item.slNo) {
          localStorage.setItem(`criteria5.2.2_slNo_${item.id}`, item.slNo);
        }
      });
      
      return data;
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
    
    const cachedScore = localStorage.getItem(`criteria522_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria522_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria5/score522`);
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria522_score_${currentYear}`, 
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
        student_name: formDataToSubmit.studentname,
        program_graduated_from: formDataToSubmit.programme,
        institution_joined: formDataToSubmit.institution,
        program_admitted_to: formDataToSubmit.pname,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend),
        support_links: formDataToSubmit.supportLinks || []
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria5/createResponse522', payload);
      console.log('Response received:', response);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        alert('Higher education progression data submitted successfully!');
        
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria522_${formDataToSubmit.studentname}_${yearToSend}`, 
            response.data.data.sl_no
          );
        }
        
        // Refresh the data from the server
        const updatedData = await fetchResponseData(currentYear);
        
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSubmittedData(updatedData);
        
        // Reset form
        setFormData({
          slNo: '',
          studentname: "",
          programme: "",
          institution: "",
          pname: "",
          supportLinks: [],
          year: currentYear
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
    const entryId = formDataToSubmit.id || formDataToSubmit.slNo;
    if (!entryId) {
      const errorMsg = "No entry selected for update";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const yearToSend = formDataToSubmit.year?.split("-")[0] || new Date().getFullYear().toString();

      const payload = {
        sl_no: entryId,
        student_name: formDataToSubmit.studentname,
        program_graduated_from: formDataToSubmit.programme,
        institution_joined: formDataToSubmit.institution,
        program_admitted_to: formDataToSubmit.pname,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend),
        support_links: formDataToSubmit.supportLinks || []
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put(`/criteria5/updateResponse522/${entryId}`, payload);
      
      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.message || "Failed to update entry";
        throw new Error(errorMsg);
      }
      
      // Refresh the data from the server
      const updatedData = await fetchResponseData(currentYear);
      
      setYearData(prev => ({
        ...prev,
        [currentYear]: updatedData
      }));
      setSubmittedData(updatedData);
      
      setSuccess('Entry updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      return true;
    } catch (err) {
      console.error("Error updating entry:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to update entry";
      setError(errorMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Validate form data
  const validateFormData = (dataToSubmit) => {
    const yearInput = dataToSubmit.year || currentYear;
    const yearToSend = yearInput.split("-")[0];
    const session = parseInt(yearToSend);
    const currentYearNum = new Date().getFullYear();
    const missingFields = [];

    // Helper function to check string fields
    const checkStringField = (value, fieldName) => {
      if (typeof value === 'string') return value.trim();
      if (value === null || value === undefined) return '';
      return String(value);
    };

    // Check each required field
    if (!checkStringField(dataToSubmit.studentname)) missingFields.push("Student Name");
    if (!checkStringField(dataToSubmit.programme)) missingFields.push("Programme Graduated From");
    if (!checkStringField(dataToSubmit.institution)) missingFields.push("Institution Joined");
    if (!checkStringField(dataToSubmit.pname)) missingFields.push("Programme Admitted To");
    
    if (missingFields.length > 0) {
      throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }
    
    if (isNaN(session) || session < 1990 || session > currentYearNum) {
      throw new Error(`Year must be between 1990 and ${currentYearNum}.`);
    }

    return true;
  };

  // Handle edit
  const handleEdit = (entry) => {
    const formData = {
      slNo: '',
      studentname: '',
      programme: '',
      institution: '',
      pname: '',
      supportLinks: [],
      year: currentYear,
      // Override with entry data
      ...entry,
      // Ensure these fields are set from the entry or use defaults
      id: entry.id || entry.slNo,
      year: entry.year || currentYear
    };
    
    setFormData(formData);
    setIsEditMode(true);
    setEditKey(entry.id || entry.slNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const response = await api.delete(`/criteria5/deleteResponse522/${slNo}`);
      
      if (response.status === 200) {
        setYearData(prev => ({
          ...prev,
          [year]: (prev[year] || []).filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        }));
        
        setSubmittedData(prev => 
          prev.filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        );
        
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

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataWithYear = { 
        ...formData,
        year: formData.year?.toString() || currentYear.toString()
      };
      
      console.log('Submitting form data:', formDataWithYear);
      
      validateFormData(formDataWithYear);
      
      if (isEditMode && (formData.id || formData.slNo)) {
        console.log('Updating entry:', formDataWithYear);
        await handleUpdate(formDataWithYear);
        setIsEditMode(false);
      } else {
        console.log('Creating new entry:', formDataWithYear);
        await handleCreate(formDataWithYear);
      }
      
      // Reset form after successful operation
      setFormData({
        slNo: '',
        studentname: "",
        programme: "",
        institution: "",
        pname: "",
        supportLinks: [],
        year: currentYear
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    try {
      const data = await fetchResponseData(currentYear);
      setSubmittedData(data || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Load data when component mounts or currentYear changes
  useEffect(() => {
    const loadData = async () => {
      if (currentYear) {
        const data = await fetchResponseData(currentYear);
        setSubmittedData(data || []);
      }
    };
    
    loadData();
  }, [currentYear]);

  // Load data for all sessions
  useEffect(() => {
    const loadData = async () => {
      if (availableSessions && availableSessions.length > 0) {
        const promises = availableSessions.map(year => fetchResponseData(year));
        const data = await Promise.all(promises);
        
        const newYearData = {};
        availableSessions.forEach((year, index) => {
          newYearData[year] = data[index];
        });
        
        setYearData(newYearData);
      }
    };

    loadData();
  }, [availableSessions]);

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

  // Navigation functions
  const goToNextPage = () => {
    navigate('/criteria5.2.3');
  };

  const goToPreviousPage = () => {
    navigate('/criteria5.2.1');
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Serial No.',
      'Student Name',
      'Programme Graduated From',
      'Institution Joined',
      'Programme Admitted To'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.studentname || ''}"`,
        `"${entry.programme || ''}"`,
        `"${entry.institution || ''}"`,
        `"${entry.pname || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_5.2.2_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main component render
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />

        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Criteria 5: Student Support and Progression</h2>
            <div className="text-sm text-gray-600">5.2 Student Progression</div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">5.2.2 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Average percentage of students progressing to higher education
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Details of student progression to higher education</li>
              <li className="mb-1">Upload supporting data for student/alumni</li>
              <li className="mb-1">Upload any additional information</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Students progressing to higher education</h2>

          {/* Year Dropdown */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={handleYearChange}
              disabled={sessionLoading}
            >
              {sessionLoading ? (
                <option>Loading sessions...</option>
              ) : (
                availableSessions?.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (5.2.2): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0}%
                </p>
                <p className="text-lg font-semibold text-green-800">
                  Grade: {provisionalScore.data.sub_sub_cr_grade || provisionalScore.data.grade || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Input Table */}
          <div className="overflow-auto border rounded mb-6">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Higher Education Progression Entry - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">Student Name</th>
                    <th className="px-4 py-2 border">Programme Graduated From</th>
                    <th className="px-4 py-2 border">Institution Joined</th>
                    <th className="px-4 py-2 border">Programme Admitted To</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.studentname}
                        onChange={(e) => handleChange("studentname", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Student Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.programme}
                        onChange={(e) => handleChange("programme", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Programme Graduated From"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => handleChange("institution", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Institution Joined"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.pname}
                        onChange={(e) => handleChange("pname", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Programme Admitted To"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
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
                              setFormData({
                                slNo: '',
                                studentname: "",
                                programme: "",
                                institution: "",
                                pname: "",
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
            </form>
          </div>

          {/* Upload Documents Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Documents (Admission Letters | Transcripts | Higher Education Records)
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
                          "criteria5_2_2",
                          file,
                          "5.2.2",
                          currentYear
                        );
                        setFormData(prev => ({
                          ...prev,
                          supportLinks: [...(prev.supportLinks || []), uploaded.file_url],
                        }));
                      } catch (err) {
                        console.error("Upload error:", err);
                        alert(err.message || "Upload failed");
                      }
                    }
                  }}
                />
              </label>
              {uploading && <span className="text-gray-600">Uploading...</span>}
              {uploadError && <span className="text-red-600">{uploadError}</span>}
            </div>
            
            {formData.supportLinks && formData.supportLinks.length > 0 && (
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
                        removeFile("criteria5_2_2", link);
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

          {/* Summary Statistics */}
          <div className="mb-6 bg-blue-50 p-4 rounded border">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Higher Education Progression Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(yearData).reduce((total, yearEntries) => total + (yearEntries?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Students in Higher Ed</div>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {availableSessions?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Years of Data</div>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const allEntries = Object.values(yearData).flat().filter(Boolean);
                    const uniqueInstitutions = new Set(allEntries.map(entry => entry.institution)).size;
                    return uniqueInstitutions;
                  })()}
                </div>
                <div className="text-sm text-gray-600">Institutions Joined</div>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <div className="text-2xl font-bold text-orange-600">
                  {(() => {
                    const allEntries = Object.values(yearData).flat().filter(Boolean);
                    const uniquePrograms = new Set(allEntries.map(entry => entry.pname)).size;
                    return uniquePrograms;
                  })()}
                </div>
                <div className="text-sm text-gray-600">Different Programmes</div>
              </div>
            </div>
          </div>

          {/* Year-wise Data Display */}
          {availableSessions?.map((session) => (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {session}</h3>
              {yearData[session] && yearData[session].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Student Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Programme Graduated From</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Institution Joined</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Programme Admitted To</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
  {yearData[session].map((entry, index) => (
    <tr key={`${entry.studentname}-${entry.year}-${index}`}>
      <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
      <td className="border border-black text-black px-4 py-2">{entry.studentname}</td>
      <td className="border border-black text-black px-4 py-2">{entry.programme}</td>
      <td className="border border-black text-black px-4 py-2">{entry.institution}</td>
      <td className="border border-black text-black px-4 py-2">{entry.pname}</td>
      <td className="border border-black text-black px-4 py-2 text-center">
        <div className="flex justify-center space-x-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
            onClick={() => {
              setFormData({
                slNo: entry.sl_no || entry.slNo,
                studentname: entry.studentname,
                programme: entry.programme,
                institution: entry.institution,
                pname: entry.pname,
                year: entry.year,
                supportLinks: entry.support_links || []
              });
              setEditKey(entry.sl_no || entry.slNo);
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
              handleDelete(entry.sl_no || entry.slNo, entry.year || currentYear);
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
                                                          <p className="px-4 py-2 text-gray-500">No scholarship data submitted for this year.</p>
                                                        )}
                                                      </div>
                                                    ))}
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
                    
                              {/* Bottom Navigation */}
                              <div className="mt-6">
                                <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    };
                    
                    export default Criteria5_2_2;
                    
