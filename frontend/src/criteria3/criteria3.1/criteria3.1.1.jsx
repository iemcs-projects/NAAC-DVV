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

const Criteria3_1_1 = () => {
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
    name_of_project: "",
    name_of_principal_investigator: "",
    department_of_principal_investigator: "",
    amount_sanctioned: "",
    duration_of_project: "",
    name_of_funding_agency: "",
    type: "",
    year_of_award: "",
    supportLinks: []
  });

  const [submittedData, setSubmittedData] = useState([]);
  const navigate = useNavigate();

  const convertToPaddedFormat = (code) => {
    return '030101010101';
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
        "/criteria2/getResponse/3.1.1", 
        { 
          params: { 
            session: yearToSend,
            criteriaCode: '030101010101'
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
        if (item.slNo) {
          localStorage.setItem(`criteria3.1.1_slNo_${item.id}`, item.slNo);
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
    
    const cachedScore = localStorage.getItem(`criteria311_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria311_score_${currentYear}`);
      }
    }
    
    try {
      const response = await api.get(`/criteria3/score311`);
      setProvisionalScore(response.data);
      
      if (response.data) {
        const cacheData = {
          data: response.data,
          timestamp: Date.now()
        };
        localStorage.setItem(
          `criteria311_score_${currentYear}`, 
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
        name_of_project: formDataToSubmit.name_of_project,
        name_of_principal_investigator: formDataToSubmit.name_of_principal_investigator,
        department_of_principal_investigator: formDataToSubmit.department_of_principal_investigator,
        amount_sanctioned: parseFloat(formDataToSubmit.amount_sanctioned),
        duration_of_project: formDataToSubmit.duration_of_project,
        name_of_funding_agency: formDataToSubmit.name_of_funding_agency,
        type: formDataToSubmit.type,
        year_of_award: formDataToSubmit.year_of_award || yearToSend,
        session: parseInt(yearToSend),
      };
      
      console.log('Sending request with payload:', payload);
      const response = await api.post('/criteria3/createResponse311', payload);
      console.log('Response received:', response);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Request was successful, showing alert');
        
        alert('Data submitted successfully!');
        
        if (response.data?.data?.sl_no) {
          localStorage.setItem(
            `criteria311_${formDataToSubmit.name_of_project}_${yearToSend}`, 
            response.data.data.sl_no
          );
        }
        
        const updatedData = await fetchResponseData(currentYear);
        
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
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
          name_of_project: "",
          name_of_principal_investigator: "",
          department_of_principal_investigator: "",
          amount_sanctioned: "",
          duration_of_project: "",
          name_of_funding_agency: "",
          type: "",
          year_of_award: "",
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
        sl_no: entryId, // Include sl_no in the payload
        name_of_project: formDataToSubmit.name_of_project,
        name_of_principal_investigator: formDataToSubmit.name_of_principal_investigator,
        department_of_principal_investigator: formDataToSubmit.department_of_principal_investigator,
        amount_sanctioned: parseFloat(formDataToSubmit.amount_sanctioned) || 0,
        duration_of_project: formDataToSubmit.duration_of_project,
        name_of_funding_agency: formDataToSubmit.name_of_funding_agency,
        type: formDataToSubmit.type,
        year_of_award: formDataToSubmit.year_of_award || yearToSend,
        session: parseInt(yearToSend),
        year: yearToSend, // Make sure year is included as the backend expects it
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put(`/criteria3/updateResponse311_312/${entryId}`, payload);
      
      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.message || "Failed to update entry";
        throw new Error(errorMsg);
      }
      
      // Update the local state with the updated data
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
    if (!checkStringField(dataToSubmit.name_of_project)) missingFields.push("Project Name");
    if (!checkStringField(dataToSubmit.name_of_principal_investigator)) missingFields.push("Principal Investigator");
    if (!dataToSubmit.amount_sanctioned || isNaN(parseFloat(dataToSubmit.amount_sanctioned))) missingFields.push("Valid Amount Sanctioned");
    if (!dataToSubmit.duration_of_project) missingFields.push("Duration");
    if (!checkStringField(dataToSubmit.name_of_funding_agency)) missingFields.push("Funding Agency");
    if (!checkStringField(dataToSubmit.type)) missingFields.push("Type");
    
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
    // Ensure all required fields are set with default values if missing
    const formData = {
      slNo: '',
      name_of_project: '',
      name_of_principal_investigator: '',
      department_of_principal_investigator: '',
      amount_sanctioned: '',
      duration_of_project: '',
      name_of_funding_agency: '',
      type: '',
      year_of_award: currentYear,
      supportLinks: [],
      year: currentYear,
      // Override with entry data
      ...entry,
      // Ensure these fields are set from the entry or use defaults
      id: entry.id || entry.slNo,
      year: entry.year || currentYear,
      year_of_award: entry.year_of_award || entry.year || currentYear
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
      const response = await api.delete(`/criteria3/deleteResponse311_312/${slNo}`);
      
      if (response.status === 200) {
        // Update the local state to remove the deleted entry
        setYearData(prev => ({
          ...prev,
          [year]: (prev[year] || []).filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        }));
        
        // Also update the submittedData state
        setSubmittedData(prev => 
          prev.filter(entry => 
            (entry.sl_no !== slNo && entry.slNo !== slNo) || 
            entry.year !== year
          )
        );
        
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

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare form data with proper defaults
      const formDataWithYear = { 
        ...formData,
        year: formData.year?.toString() || currentYear.toString(),
        year_of_award: (formData.year_of_award || formData.year || currentYear).toString(),
        // Ensure numeric fields are properly formatted
        amount_sanctioned: formData.amount_sanctioned ? 
          parseFloat(formData.amount_sanctioned) : 0
      };
      
      console.log('Submitting form data:', formDataWithYear);
      
      // Validate form data
      validateFormData(formDataWithYear);
      
      // Process the form
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
        name_of_project: "",
        name_of_principal_investigator: "",
        department_of_principal_investigator: "",
        amount_sanctioned: "",
        duration_of_project: "",
        name_of_funding_agency: "",
        type: "",
        year_of_award: currentYear,
        supportLinks: [],
        year: currentYear
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error is already set by handleUpdate/handleCreate
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    try {
      // Refresh data after successful operation
      const data = await fetchResponseData(currentYear);
      setSubmittedData(data || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Non-critical error, just log it
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
    navigate('/criteria3/3.2.1');
  };

  const goToPreviousPage = () => {
    navigate('/criteria3/3.1.2');
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Project Name',
      'Principal Investigator',
      'Department',
      'Amount Sanctioned',
      'Duration',
      'Funding Agency',
      'Type',
      'Year of Award'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.name_of_project || ''}"`,
        `"${entry.name_of_principal_investigator || ''}"`,
        `"${entry.department_of_principal_investigator || ''}"`,
        entry.amount_sanctioned || '',
        `"${entry.duration_of_project || ''}"`,
        `"${entry.name_of_funding_agency || ''}"`,
        `"${entry.type || ''}"`,
        entry.year_of_award || ''
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_3.1.1_data_${new Date().toISOString().split('T')[0]}.csv`);
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
            <h2 className="text-xl font-medium text-gray-800">Criteria 3: Research, Innovations and Extension</h2>
            <div className="text-sm text-gray-600">3.1 - Resource Mobilization for Research</div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">3.1.1 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Total Grants from Government and non-governmental agencies for research projects / endowments in the institution during the last five years (INR in Lakhs)
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Any additional information</li>
              <li className="mb-1">e-copies of the grant award letters for sponsored research projects / endowments</li>
              <li className="mb-1">List of endowments / projects with details of grants (Data Template)</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Research Grants Entry</h2>

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
                  Provisional Score (3.1.1): {provisionalScore.data.score_sub_sub_criteria || provisionalScore.data.score || 0} Lakhs
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
              Research Grants - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">Project Name</th>
                    <th className="px-4 py-2 border">Principal Investigator</th>
                    <th className="px-4 py-2 border">Department</th>
                    <th className="px-4 py-2 border">Amount Sanctioned</th>
                    <th className="px-4 py-2 border">Duration</th>
                    <th className="px-4 py-2 border">Funding Agency</th>
                    <th className="px-4 py-2 border">Type</th>
                    <th className="px-4 py-2 border">Year of Award</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.name_of_project}
                        onChange={(e) => handleChange("name_of_project", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Project Name"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.name_of_principal_investigator}
                        onChange={(e) => handleChange("name_of_principal_investigator", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Principal Investigator"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.department_of_principal_investigator}
                        onChange={(e) => handleChange("department_of_principal_investigator", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Department"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        value={formData.amount_sanctioned}
                        onChange={(e) => handleChange("amount_sanctioned", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Amount"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.duration_of_project}
                        onChange={(e) => handleChange("duration_of_project", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Duration"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.name_of_funding_agency}
                        onChange={(e) => handleChange("name_of_funding_agency", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Funding Agency"
                        required
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <select
                        value={formData.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Government">Government</option>
                        <option value="Non-government">Non Government</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="2000"
                        max={new Date().getFullYear()}
                        value={formData.year_of_award}
                        onChange={(e) => handleChange("year_of_award", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Year"
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
                                name_of_project: "",
                                name_of_principal_investigator: "",
                                department_of_principal_investigator: "",
                                amount_sanctioned: "",
                                duration_of_project: "",
                                name_of_funding_agency: "",
                                type: "",
                                year_of_award: "",
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
                          "criteria3_1_1",
                          file,
                          "3.1.1",
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
                        removeFile("criteria3_1_1", link);
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

          {/* Submitted Data Table */}
          

          {/* Year-wise Data Display */}
          {availableSessions?.map((session) => (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {session}</h3>
              {yearData[session] && yearData[session].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Project Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Principal Investigator</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Department</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Amount</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Duration</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Funding Agency</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Type</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Year</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.name_of_project}-${entry.year}-${index}`}>
                        <td className="border border-black !text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.name_of_project}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.name_of_principal_investigator}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.department_of_principal_investigator}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.amount_sanctioned}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.duration_of_project}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.name_of_funding_agency}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.type}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.year_of_award}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              onClick={() => {
                                setFormData({
                                  slNo: entry.sl_no || entry.slNo,
                                  name_of_project: entry.name_of_project,
                                  name_of_principal_investigator: entry.name_of_principal_investigator,
                                  department_of_principal_investigator: entry.department_of_principal_investigator,
                                  amount_sanctioned: entry.amount_sanctioned,
                                  duration_of_project: entry.duration_of_project,
                                  name_of_funding_agency: entry.name_of_funding_agency,
                                  type: entry.type,
                                  year_of_award: entry.year_of_award,
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
                <p className="px-4 py-2 text-gray-500">No data submitted for this year.</p>
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

          {/* Bottom Navigation */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_1_1;