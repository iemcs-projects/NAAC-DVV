import React, { useState, useMemo, useContext, useEffect } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { FaTrash, FaEdit } from 'react-icons/fa';
import api from "../../api";

const Criteria6_5_3 = () => {
  const navigate = useNavigate();
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  
  const [currentYear, setCurrentYear] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [yearData, setYearData] = useState({});
  const [submittedData, setSubmittedData] = useState([]);

  const pastFiveYears = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) =>
        `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
      ),
    []
  );

  // Form data for single entry
  const [formData, setFormData] = useState({
    year: "",
    reg_meetings_of_the_IQAC_head: "",
    conf_seminar_workshops_on_quality_edu: "",
    collab_quality_initiatives: "",
    participation_in_NIRF: "",
    orientation_program: "",
    from_date: "",
    to_date: "",
    other_quality_audit: "",
    supportLinks: []
  });

  // Checkbox options for quality initiatives
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
  });

  // Set default year when sessions are loaded
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0 && !currentYear) {
      const firstYear = availableSessions[0];
      setCurrentYear(firstYear);
      setFormData(prev => ({ ...prev, year: firstYear }));
    }
  }, [availableSessions, currentYear]);

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount >= 4) return 'A. All of the above';
    if (selectedCount === 3) return 'B. Any 3 of the above';
    if (selectedCount === 2) return 'C. Any 2 of the above';
    if (selectedCount === 1) return 'D. Any 1 of the above';
    return 'E. None of the above';
  };

  // Handle checkbox changes
  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Fetch response data for a specific year
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
        "/criteria2/getResponse/6.5.3", 
        { 
          params: { 
            session: yearToSend
          }
        }
      );
      
      console.log('Full API Response:', JSON.stringify(response, null, 2));
      
      if (!response.data) {
        console.warn('No data in response');
        return [];
      }
      
      // Handle both response.data and response.data.data
      let data = response.data.data || response.data;
      
      // If data is not an array but is an object, convert it to an array
      console.log('Data before processing:', data);
      if (data) {
        if (!Array.isArray(data)) {
          console.log('Converting single object to array');
          data = [data];
        }
      } else {
        console.warn('Data is null or undefined');
        return [];
      }
      
      if (!data) {
        console.warn('No data array in response');
        return [];
      }
      
      // Map the data to ensure consistent structure
      const mappedData = data.map(item => {
        console.log('Raw database item:', item);
        
        const mappedItem = {
          id: item.id || item.sl_no,
          sl_no: item.sl_no || item.id,
          year: item.year || year,
          options: item.options || 0,
          reg_meetings_of_the_IQAC_head: item.reg_meetings_of_the_IQAC_head || 'N/A',
          conf_seminar_workshops_on_quality_edu: item.conf_seminar_workshops_on_quality_edu || 'N/A',
          collab_quality_initiatives: item.collab_quality_initiatives || 'N/A',
          participation_in_NIRF: item.participation_in_NIRF || 'N/A',
          orientation_program: item.orientation_program || 'N/A',
          from_date: item.from_date || 'N/A',
          to_date: item.to_date || 'N/A',
          other_quality_audit: item.other_quality_audit || 'N/A',
          ...item
        };
        
        console.log('Mapped item:', mappedItem);
        return mappedItem;
      });
      
      console.log('Final mapped data:', mappedData);
      
      // Store the SL numbers in localStorage for each entry
      mappedData.forEach(item => {
        if (item.sl_no) {
          localStorage.setItem(`criteria6.5.3_slNo_${item.id || item.sl_no}`, item.sl_no);
        }
      });
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching response data:', error);
      setError('Failed to fetch data. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch score
  const fetchScore = async () => {
    if (!currentYear) return;
    
    const cachedScore = localStorage.getItem(`criteria653_score_${currentYear}`);
    if (cachedScore) {
      try {
        const parsedScore = JSON.parse(cachedScore);
        if (Date.now() - parsedScore.timestamp < 60 * 60 * 1000) {
          setProvisionalScore(parsedScore.data);
        }
      } catch (e) {
        console.warn("Error parsing cached score:", e);
        localStorage.removeItem(`criteria653_score_${currentYear}`);
      }
    }
    
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score653");
      console.log('API Response:', response);
      
      const scoreData = response.data?.data?.entry || response.data?.data || response.data;
      
      if (scoreData) {
        console.log('Score data:', scoreData);
        setProvisionalScore(scoreData);
        
        if (scoreData) {
          const cacheData = {
            data: scoreData,
            timestamp: Date.now()
          };
          localStorage.setItem(
            `criteria653_score_${currentYear}`, 
            JSON.stringify(cacheData)
          );
        }
      } else {
        console.log('No score data found in response');
        setProvisionalScore(null);
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
      setProvisionalScore(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle create new entry
  const handleCreate = async (formDataToSubmit) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const yearToSend = formDataToSubmit.year.split("-")[0];
      const selectedCount = Object.values(selectedOptions).filter(Boolean).length;

      const payload = {
        session: parseInt(yearToSend, 10),
        year: yearToSend,
        options: selectedCount,
        reg_meetings_of_the_IQAC_head: formDataToSubmit.reg_meetings_of_the_IQAC_head.trim(),
        conf_seminar_workshops_on_quality_edu: formDataToSubmit.conf_seminar_workshops_on_quality_edu.trim(),
        collab_quality_initiatives: formDataToSubmit.collab_quality_initiatives.trim(),
        participation_in_NIRF: formDataToSubmit.participation_in_NIRF.trim(),
        orientation_program: formDataToSubmit.orientation_program.trim(),
        from_date: formDataToSubmit.from_date.trim(),
        to_date: formDataToSubmit.to_date.trim(),
        other_quality_audit: formDataToSubmit.other_quality_audit.trim(),
        support_links: JSON.stringify(formDataToSubmit.supportLinks || []),
        criteria: '6.5.3'
      };
      
      console.log('Sending request with payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria6/createResponse653", 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true,
          validateStatus: (status) => status < 500
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Request was successful');
        setSuccess('Quality assurance data submitted successfully!');
        
        // Refresh the data from the server
        const updatedData = await fetchResponseData(currentYear);
        
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSubmittedData(updatedData);
        
        // Reset form
        setFormData({
          year: currentYear,
          reg_meetings_of_the_IQAC_head: "",
          conf_seminar_workshops_on_quality_edu: "",
          collab_quality_initiatives: "",
          participation_in_NIRF: "",
          orientation_program: "",
          from_date: "",
          to_date: "",
          other_quality_audit: "",
          supportLinks: []
        });
        
        // Reset checkboxes
        setSelectedOptions({
          option1: false,
          option2: false,
          option3: false,
          option4: false
        });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        
        // Refresh score
        await fetchScore();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      let errorMessage = "Submission failed!";
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        console.error('Error:', error.message);
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update entry
  const handleUpdate = async (formDataToSubmit) => {
    const entryId = formDataToSubmit.id;
    if (!entryId) {
      const errorMsg = "No entry selected for update";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const yearToSend = formDataToSubmit.year?.split("-")[0] || new Date().getFullYear().toString();
      const selectedCount = Object.values(selectedOptions).filter(Boolean).length;

      const payload = {
        session: parseInt(yearToSend, 10),
        year: yearToSend,
        options: selectedCount,
        reg_meetings_of_the_IQAC_head: formDataToSubmit.reg_meetings_of_the_IQAC_head.trim(),
        conf_seminar_workshops_on_quality_edu: formDataToSubmit.conf_seminar_workshops_on_quality_edu.trim(),
        collab_quality_initiatives: formDataToSubmit.collab_quality_initiatives.trim(),
        participation_in_NIRF: formDataToSubmit.participation_in_NIRF.trim(),
        orientation_program: formDataToSubmit.orientation_program.trim(),
        from_date: formDataToSubmit.from_date.trim(),
        to_date: formDataToSubmit.to_date.trim(),
        other_quality_audit: formDataToSubmit.other_quality_audit.trim(),
        support_links: JSON.stringify(formDataToSubmit.supportLinks || []),
        criteria: '6.5.3'
      };
      
      console.log('Sending update payload:', payload);
      const response = await api.put(
        `/criteria2/updateResponse/${entryId}`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      
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

  // Handle edit entry
  const handleEdit = (entry) => {
    console.log('Editing entry:', entry);
    setFormData({
      id: entry.id,
      year: entry.year || currentYear,
      reg_meetings_of_the_IQAC_head: entry.reg_meetings_of_the_IQAC_head || "",
      conf_seminar_workshops_on_quality_edu: entry.conf_seminar_workshops_on_quality_edu || "",
      collab_quality_initiatives: entry.collab_quality_initiatives || "",
      participation_in_NIRF: entry.participation_in_NIRF || "",
      orientation_program: entry.orientation_program || "",
      from_date: entry.from_date || "",
      to_date: entry.to_date || "",
      other_quality_audit: entry.other_quality_audit || "",
      supportLinks: entry.support_links ? JSON.parse(entry.support_links) : []
    });

    // Set checkboxes based on options count
    const optionsCount = entry.options || 0;
    setSelectedOptions({
      option1: optionsCount >= 1,
      option2: optionsCount >= 2,
      option3: optionsCount >= 3,
      option4: optionsCount >= 4
    });

    setIsEditMode(true);
    setEditKey(entry.id);
  };

  // Handle delete entry
  const handleDelete = async (entryId) => {
    if (!entryId) {
      console.error('No entry ID provided for deletion');
      setError('Error: No entry selected for deletion');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.delete(
        `/criteria2/deleteResponse/${entryId}`,
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        // Remove from current display
        setSubmittedData(prev => prev.filter(entry => entry.id !== entryId));
        
        // Update year data
        setYearData(prev => ({
          ...prev,
          [currentYear]: (prev[currentYear] || []).filter(entry => entry.id !== entryId)
        }));
        
        setSuccess('Entry deleted successfully!');
        
        // Refresh data and score
        const updatedData = await fetchResponseData(currentYear);
        setSubmittedData(updatedData || []);
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

  // Validate form data before submission
  const validateFormData = (data) => {
    const errors = [];
    
    if (!data.year || data.year.trim() === '') {
      errors.push('Year is required');
    }
    
    if (!data.reg_meetings_of_the_IQAC_head || data.reg_meetings_of_the_IQAC_head.trim() === '') {
      errors.push('IQAC meetings information is required');
    }
    
    // Validate date formats if provided (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (data.from_date && !dateRegex.test(data.from_date)) {
      errors.push('From date must be in DD-MM-YYYY format');
    }
    
    if (data.to_date && !dateRegex.test(data.to_date)) {
      errors.push('To date must be in DD-MM-YYYY format');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const formDataWithYear = { 
        ...formData,
        year: formData.year?.toString() || currentYear.toString()
      };
      
      console.log('Submitting form data:', formDataWithYear);
      
      // Validate form data
      validateFormData(formDataWithYear);
      
      // Submit data
      if (isEditMode && formData.id) {
        console.log('Updating entry:', formDataWithYear);
        await handleUpdate(formDataWithYear);
        setIsEditMode(false);
      } else {
        console.log('Creating new entry:', formDataWithYear);
        await handleCreate(formDataWithYear);
      }
      
      // Reset form after successful operation
      setFormData({
        year: currentYear,
        reg_meetings_of_the_IQAC_head: "",
        conf_seminar_workshops_on_quality_edu: "",
        collab_quality_initiatives: "",
        participation_in_NIRF: "",
        orientation_program: "",
        from_date: "",
        to_date: "",
        other_quality_audit: "",
        supportLinks: []
      });
      
      // Refresh data
      const updatedData = await fetchResponseData(currentYear);
      setSubmittedData(updatedData || []);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit form';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSubmitting(false);
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

  // Handle year change
  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setCurrentYear(selectedYear);
    setFormData(prev => ({ ...prev, year: selectedYear }));
    setIsEditMode(false);
    setEditKey(null);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Navigation functions
  const goToNextPage = () => navigate("/criteria7.1.1");
  const goToPreviousPage = () => navigate("/criteria6.5.2");

  // Handle export to CSV
  const handleExport = async () => {
    if (!submittedData || submittedData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Serial No.',
      'Year',
      'Options Selected',
      'IQAC Meetings',
      'Conferences/Seminars',
      'Collaborative Initiatives',
      'NIRF Participation',
      'Orientation Program',
      'From Date',
      'To Date',
      'Other Quality Audit'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));
    
    submittedData.forEach((entry, index) => {
      const row = [
        index + 1,
        `"${entry.year || ''}"`,
        entry.options || 0,
        `"${entry.reg_meetings_of_the_IQAC_head || ''}"`,
        `"${entry.conf_seminar_workshops_on_quality_edu || ''}"`,
        `"${entry.collab_quality_initiatives || ''}"`,
        `"${entry.participation_in_NIRF || ''}"`,
        `"${entry.orientation_program || ''}"`,
        `"${entry.from_date || ''}"`,
        `"${entry.to_date || ''}"`,
        `"${entry.other_quality_audit || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `criteria_6.5.3_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-4">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 6: Governance, Leadership and Management
            </h2>
            <div className="text-sm text-gray-600">
              6.5-Internal Quality Assurance System
            </div>
          </div>

          {/* Metric Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">6.5.3 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-4">
              Quality assurance initiatives of the institution include:
            </p>
            <ol className="list-decimal pl-5 text-sm text-gray-700 mb-4">
              <li>Regular meeting of Internal Quality Assurance Cell (IQAC); Feedback collected, analysed and used for improvements</li>
              <li>Collaborative quality initiatives with other institution(s)</li>
              <li>Participation in NIRF</li>
              <li>Any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)</li>
            </ol>

            <h4 className="text-blue-600 font-medium mb-2">Choose from the following:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700 mb-4">
              <li>A. All of the above</li>
              <li>B. Any 3 of the above</li>
              <li>C. Any 2 of the above</li>
              <li>D. Any 1 of the above</li>
              <li>E. None of the above</li>
            </ul>

            <h4 className="text-blue-600 font-medium mb-2">Data Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">AQARs prepared/submitted</li>
              <li className="mb-1">Collaborative quality initiatives with other institution(s)</li>
              <li className="mb-1">Participation in NIRF</li>
              <li>Any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)</li>
            </ul>
          </div>

          {/* Session Selection */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Session:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={handleYearChange}
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? (
                <option>Loading sessions...</option>
              ) : availableSessions ? (
                availableSessions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option>No sessions available</option>
              )}
            </select>
            {sessionError && <p className="text-red-500 text-sm mt-1">{sessionError}</p>}
          </div>

          {/* Provisional Score Section */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score !== undefined || provisionalScore?.score !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (6.5.3): {typeof (provisionalScore.data?.score ?? provisionalScore.score) === 'number'
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

          {/* Multiple Selection Checkboxes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the Quality Assurance Initiatives Available (Multiple selections allowed)
            </h3>
            <div className="space-y-3">
              {[
                { key: "option1", label: "1. Regular meeting of Internal Quality Assurance Cell (IQAC); Feedback collected, analysed and used for improvements" },
                { key: "option2", label: "2. Collaborative quality initiatives with other institution(s)" },
                { key: "option3", label: "3. Participation in NIRF" },
                { key: "option4", label: "4. Any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)" }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedOptions[key]}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  <label htmlFor={key} className="text-sm text-gray-800">{label}</label>
                </div>
              ))}
            </div>
            
            {/* Grade Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                Option Selected: {getGrade()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Selected: {Object.values(selectedOptions).filter(Boolean).length} out of 4 quality initiatives
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Quality Assurance Initiatives Entry</h2>

          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {isEditMode ? 'Edit Quality Assurance Entry' : 'Add Quality Assurance Entry'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., 2023-24"
                      required
                    />
                  </div>

                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Regular meetings of the IQAC held *
                    </label>
                    <input
                      type="text"
                      value={formData.reg_meetings_of_the_IQAC_head}
                      onChange={(e) => handleChange("reg_meetings_of_the_IQAC_head", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="IQAC meetings information"
                      required
                    />
                  </div>

                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Conferences, Seminars, Workshops on quality conducted
                    </label>
                    <input
                      type="text"
                      value={formData.conf_seminar_workshops_on_quality_edu}
                      onChange={(e) => handleChange("conf_seminar_workshops_on_quality_edu", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Conference/seminar details"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Collaborative quality initiatives with other institution(s)
                    </label>
                    <input
                      type="text"
                      value={formData.collab_quality_initiatives}
                      onChange={(e) => handleChange("collab_quality_initiatives", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Collaborative initiatives details"
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Participation in NIRF along with Status
                    </label>
                    <input
                      type="text"
                      value={formData.participation_in_NIRF}
                      onChange={(e) => handleChange("participation_in_NIRF", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="NIRF participation details"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Orientation programme on quality issues
                    </label>
                    <input
                      type="text"
                      value={formData.orientation_program}
                      onChange={(e) => handleChange("orientation_program", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Orientation program details"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      From Date (DD-MM-YYYY)
                    </label>
                    <input
                      type="text"
                      value={formData.from_date}
                      onChange={(e) => handleChange("from_date", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="DD-MM-YYYY"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      To Date (DD-MM-YYYY)
                    </label>
                    <input
                      type="text"
                      value={formData.to_date}
                      onChange={(e) => handleChange("to_date", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="DD-MM-YYYY"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Any other quality audit
                    </label>
                    <input
                      type="text"
                      value={formData.other_quality_audit}
                      onChange={(e) => handleChange("other_quality_audit", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Other quality audit details"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setEditKey(null);
                      setFormData({
                        year: currentYear,
                        reg_meetings_of_the_IQAC_head: "",
                        conf_seminar_workshops_on_quality_edu: "",
                        collab_quality_initiatives: "",
                        participation_in_NIRF: "",
                        orientation_program: "",
                        from_date: "",
                        to_date: "",
                        other_quality_audit: "",
                        supportLinks: []
                      });
                      setSelectedOptions({
                        option1: false,
                        option2: false,
                        option3: false,
                        option4: false
                      });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 text-white rounded-md ${
                    isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  } ${submitting ? 'opacity-50' : ''} transition-colors`}
                >
                  {submitting ? 'Saving...' : (isEditMode ? 'Update Entry' : 'Add Entry')}
                </button>
              </div>
            </form>
          </div>

          {/* Upload Documents Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">Supporting Documents</h3>
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Paste web link of Annual reports of Institution</li>
                <li>Upload e-copies of the accreditations and certifications</li>
                <li>Upload any additional information</li>
                <li>Upload details of Quality assurance initiatives of the institution (Data Template)</li>
              </ul>
            </div>
            
            <div className="mb-4">
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
                          "criteria6_5_3",
                          file,
                          "6.5.3",
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
              {uploading && <span className="ml-2 text-gray-600">Uploading...</span>}
              {uploadError && <span className="ml-2 text-red-600">{uploadError}</span>}
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
                        removeFile("criteria6_5_3", link);
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
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-black">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border border-black px-2 py-2 text-gray-800">S.No.</th>
                        <th className="border border-black px-2 py-2 text-gray-800">Year</th>
                        <th className="border border-black px-2 py-2 text-gray-800">Options</th>
                        <th className="border border-black px-2 py-2 text-gray-800">IQAC Meetings</th>
                        <th className="border border-black px-2 py-2 text-gray-800">Quality Programs</th>
                        <th className="border border-black px-2 py-2 text-gray-800">Collaborative Initiatives</th>
                        <th className="border border-black px-2 py-2 text-gray-800">NIRF Participation</th>
                        <th className="border border-black px-2 py-2 text-gray-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearData[session].map((entry, index) => (
                        <tr key={`${entry.id}-${index}`}>
                          <td className="border border-black text-black px-2 py-2 text-center">{index + 1}</td>
                          <td className="border border-black text-black px-2 py-2">{entry.year}</td>
                          <td className="border border-black text-black px-2 py-2 text-center">{entry.options}</td>
                          <td className="border border-black text-black px-2 py-2">{entry.reg_meetings_of_the_IQAC_head}</td>
                          <td className="border border-black text-black px-2 py-2">{entry.conf_seminar_workshops_on_quality_edu}</td>
                          <td className="border border-black text-black px-2 py-2">{entry.collab_quality_initiatives}</td>
                          <td className="border border-black text-black px-2 py-2">{entry.participation_in_NIRF}</td>
                          <td className="border border-black text-black px-2 py-2 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                onClick={() => handleEdit(entry)}
                                title="Edit entry"
                              >
                                <FaEdit className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(entry.id);
                                }}
                                disabled={submitting}
                                title="Delete entry"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-4 py-2 text-gray-500">No quality assurance data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Summary Statistics */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Quality Assurance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-2">Total Entries</h4>
                <div className="text-2xl font-bold text-blue-700">
                  {Object.values(yearData).reduce((total, yearEntries) => 
                    total + (yearEntries ? yearEntries.length : 0), 0
                  )}
                </div>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                <h4 className="font-medium text-green-800 mb-2">Average Options Selected</h4>
                <div className="text-2xl font-bold text-green-700">
                  {(() => {
                    const allEntries = Object.values(yearData).flat();
                    const totalOptions = allEntries.reduce((sum, entry) => sum + (entry?.options || 0), 0);
                    const avgOptions = allEntries.length > 0 ? (totalOptions / allEntries.length) : 0;
                    return avgOptions.toFixed(1);
                  })()}
                </div>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50">
                <h4 className="font-medium text-purple-800 mb-2">Years with Data</h4>
                <div className="text-2xl font-bold text-purple-700">
                  {Object.values(yearData).filter(yearEntries => 
                    yearEntries && yearEntries.length > 0
                  ).length} / {availableSessions?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Actions */}
          <div className="flex justify-center mb-6">
            <button 
              onClick={fetchScore}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate Score'}
            </button>
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

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria6_5_3;