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

const Criteria5_1_1 = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    scheme_name: "",
    gov_students_count: "",
    gov_amount: "",
    non_gov_students_count: "",
    non_gov_amount: "",
    inst_students_count: "",
    inst_amount: "",
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
        "/criteria2/getResponse/5.1.1", 
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
        scheme_name: item.scheme_name || '',
        gov_students_count: item.gov_students_count || 0,
        gov_amount: item.gov_amount || 0,
        inst_students_count: item.inst_students_count || 0,
        inst_amount: item.inst_amount || 0,
        year: item.year || year,
        supportLinks: item.support_links || []
      }));
      
      console.log('Mapped data:', data);
      
      // Store the SL numbers in localStorage for each entry
      data.forEach(item => {
        if (item.slNo) {
          localStorage.setItem(`criteria5.1.1_slNo_${item.id}`, item.slNo);
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
    
    const cachedScore = localStorage.getItem(`criteria511_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria511_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria5/score511`);
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria511_score_${currentYear}`, 
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
      const total_students_count = 
        (parseInt(formDataToSubmit.gov_students_count) || 0) + 
        (parseInt(formDataToSubmit.non_gov_students_count) || 0) + 
        (parseInt(formDataToSubmit.inst_students_count) || 0);

      const payload = {
        scheme_name: formDataToSubmit.scheme_name,
        gov_students_count: parseInt(formDataToSubmit.gov_students_count) || 0,
        gov_amount: parseFloat(formDataToSubmit.gov_amount) || 0,
        non_gov_students_count: parseInt(formDataToSubmit.non_gov_students_count) || 0,
        non_gov_amount: parseFloat(formDataToSubmit.non_gov_amount) || 0,
        inst_students_count: parseInt(formDataToSubmit.inst_students_count) || 0,
        inst_amount: parseFloat(formDataToSubmit.inst_amount) || 0,
        total_students_count,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend),
        support_links: formDataToSubmit.supportLinks || []
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria5/createResponse511_512', payload);
      console.log('Response received:', response);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        alert('Scholarship data submitted successfully!');
        
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria511_${formDataToSubmit.scheme_name}_${yearToSend}`, 
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
          scheme_name: "",
          gov_students_count: "",
          gov_amount: "",
          non_gov_students_count: "",
          non_gov_amount: "",
          inst_students_count: "",
          inst_amount: "",
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
      const total_students_count = 
        (parseInt(formDataToSubmit.gov_students_count) || 0) + 
        (parseInt(formDataToSubmit.non_gov_students_count) || 0) + 
        (parseInt(formDataToSubmit.inst_students_count) || 0);

      const payload = {
        sl_no: entryId,
        scheme_name: formDataToSubmit.scheme_name,
        gov_students_count: parseInt(formDataToSubmit.gov_students_count) || 0,
        gov_amount: parseFloat(formDataToSubmit.gov_amount) || 0,
        non_gov_students_count: parseInt(formDataToSubmit.non_gov_students_count) || 0,
        non_gov_amount: parseFloat(formDataToSubmit.non_gov_amount) || 0,
        inst_students_count: parseInt(formDataToSubmit.inst_students_count) || 0,
        inst_amount: parseFloat(formDataToSubmit.inst_amount) || 0,
        total_students_count,
        session: parseInt(yearToSend),
        year: parseInt(yearToSend),
        support_links: formDataToSubmit.supportLinks || []
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put(`/criteria5/updateResponse511/${entryId}`, payload);
      
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

    // Helper function to check numeric fields
    const checkNumericField = (value, fieldName) => {
      if (value === null || value === undefined || value === '') return false;
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue >= 0;
    };

    // Check each required field
    if (!checkStringField(dataToSubmit.scheme_name)) missingFields.push("Scheme Name");
    if (!checkNumericField(dataToSubmit.gov_students_count)) missingFields.push("Valid Government Students Count");
    if (!checkNumericField(dataToSubmit.gov_amount)) missingFields.push("Valid Government Amount");
    
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
      scheme_name: '',
      gov_students_count: '',
      gov_amount: '',
      non_gov_students_count: '',
      non_gov_amount: '',
      inst_students_count: '',
      inst_amount: '',
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
      const response = await api.delete(`/criteria5/deleteResponse511/${slNo}`);
      
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
        year: formData.year?.toString() || currentYear.toString(),
        gov_students_count: formData.gov_students_count ? 
          parseInt(formData.gov_students_count) : 0,
        gov_amount: formData.gov_amount ? 
          parseFloat(formData.gov_amount) : 0,
        non_gov_students_count: formData.non_gov_students_count ? 
          parseInt(formData.non_gov_students_count) : 0,
        non_gov_amount: formData.non_gov_amount ? 
          parseFloat(formData.non_gov_amount) : 0,
        inst_students_count: formData.inst_students_count ? 
          parseInt(formData.inst_students_count) : 0,
        inst_amount: formData.inst_amount ? 
          parseFloat(formData.inst_amount) : 0
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
        scheme_name: "",
        gov_students_count: "",
        gov_amount: "",
        inst_students_count: "",
        inst_amount: "",
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
    navigate('/criteria5.1.2');
  };

  const goToPreviousPage = () => {
    navigate('/criteria4.4.2');
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Serial No.',
      'Scheme Name',
      'Gov Students Count',
      'Gov Amount',
      'Inst Students Count',
      'Inst Amount'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.scheme_name || ''}"`,
        entry.gov_students_count || '',
        entry.gov_amount || '',
        entry.inst_students_count || '',
        entry.inst_amount || ''
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_5.1.1_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main component render
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex">
    <Sidebar onCollapse={setIsSidebarCollapsed} />
    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 pt-4`}>

        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Criteria 5: Student Support and Progression</h2>
            <div className="text-sm text-gray-600">5.1 Student Support</div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">5.1.1 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Average percentage of students benefited by scholarships and freeships provided by the Government
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Upload self attested letter with the list of students sanctioned scholarship</li>
              <li className="mb-1">Average percentage of students benefited by scholarships and freeships provided by the Government during the last five years</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Students benefited by scholarships and freeships</h2>

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
                  Provisional Score (5.1.1): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0}%
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
              Scholarship Entry - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th rowSpan="2" className="px-4 py-2 border">Scheme Name</th>
                    <th colSpan="2" className="px-4 py-2 border">Government Scheme</th>
                    <th colSpan="2" className="px-4 py-2 border">Institution Scheme</th>
                    <th rowSpan="2" className="px-4 py-2 border">Action</th>
                  </tr>
                  <tr>
                    <th className="px-2 py-1 border">Students</th>
                    <th className="px-2 py-1 border">Amount</th>
                    <th className="px-2 py-1 border">Students</th>
                    <th className="px-2 py-1 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.scheme_name}
                        onChange={(e) => handleChange("scheme_name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Scheme Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="0"
                        value={formData.gov_students_count}
                        onChange={(e) => handleChange("gov_students_count", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Gov Students"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.gov_amount}
                        onChange={(e) => handleChange("gov_amount", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Gov Amount"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="0"
                        value={formData.inst_students_count}
                        onChange={(e) => handleChange("inst_students_count", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Inst Students"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.inst_amount}
                        onChange={(e) => handleChange("inst_amount", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Inst Amount"
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
                                scheme_name: "",
                                gov_students_count: "",
                                gov_amount: "",
                                non_gov_students_count: "",
                                non_gov_amount: "",
                                inst_students_count: "",
                                inst_amount: "",
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
              Upload Documents (Scholarship Lists | Sanction Letters | Payment Records)
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
                          "criteria5_1_1",
                          file,
                          "5.1.1",
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
                        removeFile("criteria5_1_1", link);
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

          {/* Year-wise Data Display */}
          {availableSessions?.map((session) => (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {session}</h3>
              {yearData[session] && yearData[session].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th rowSpan="2" className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th rowSpan="2" className="border border-black px-4 py-2 text-gray-800">Scheme Name</th>
                      <th colSpan="2" className="border border-black px-4 py-2 text-gray-800">Government</th>
                      <th colSpan="2" className="border border-black px-4 py-2 text-gray-800">Non-Government</th>
                      <th colSpan="2" className="border border-black px-4 py-2 text-gray-800">Institution</th>
                      <th rowSpan="2" className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                    <tr>
                      <th className="border border-black px-2 py-1 text-gray-800">Students</th>
                      <th className="border border-black px-2 py-1 text-gray-800">Amount</th>
                      <th className="border border-black px-2 py-1 text-gray-800">Students</th>
                      <th className="border border-black px-2 py-1 text-gray-800">Amount</th>
                      <th className="border border-black px-2 py-1 text-gray-800">Students</th>
                      <th className="border border-black px-2 py-1 text-gray-800">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.scheme_name}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.scheme_name}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.gov_students_count}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.gov_amount}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.non_gov_students_count || 0}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.non_gov_amount || 0}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.inst_students_count || 0}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.inst_amount || 0}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                setFormData({
                                  slNo: entry.sl_no || entry.slNo,
                                  scheme_name: entry.scheme_name,
                                  gov_students_count: entry.gov_students_count,
                                  gov_amount: entry.gov_amount,
                                  non_gov_students_count: entry.non_gov_students_count || '',
                                  non_gov_amount: entry.non_gov_amount || '',
                                  inst_students_count: entry.inst_students_count || '',
                                  inst_amount: entry.inst_amount || '',
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

          {/* Calculation Table */}
          <div className="mt-8 flex justify-center overflow-auto border rounded p-4 mb-6">
            <div className="w-full max-w-4xl">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Calculation Table (Last 5 Years)</h2>
              <table className="table-auto border-collapse w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-semibold">
                    <th className="border border-[gray] px-4 py-2">YEAR</th>
                    {availableSessions?.slice(0, 5).map((year) => (
                      <th key={year} className="border border-[gray] px-4 py-2">
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">Students Benefited</td>
                    {availableSessions?.slice(0, 5).map((year) => {
                      const yearEntries = yearData[year] || [];
                      const totalStudents = yearEntries.reduce((sum, entry) => 
                        sum + (parseInt(entry.gov_students_count) || 0) + 
                        (parseInt(entry.non_gov_students_count) || 0) + 
                        (parseInt(entry.inst_students_count) || 0), 0
                      );
                      return (
                        <td key={year} className="border border-black px-4 py-2 text-center">
                          {totalStudents > 0 ? `${totalStudents} students` : "-"}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">Total Amount</td>
                    {availableSessions?.slice(0, 5).map((year) => {
                      const yearEntries = yearData[year] || [];
                      const totalAmount = yearEntries.reduce((sum, entry) => 
                        sum + (parseFloat(entry.gov_amount) || 0) + 
                        (parseFloat(entry.non_gov_amount) || 0) + 
                        (parseFloat(entry.inst_amount) || 0), 0
                      );
                      return (
                        <td key={year} className="border border-black px-4 py-2 text-center">
                          {totalAmount > 0 ? `₹${totalAmount.toFixed(2)}` : "-"}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={fetchScore}
                  className="px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-blue-600"
                >
                  Calculate Score
                </button>
              </div>
              <p className="text-gray-600 mt-2">Total number of years considered: {availableSessions?.length || 5}</p>
            </div>
          </div>

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

          {/* Bottom Navigation */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_1_1;