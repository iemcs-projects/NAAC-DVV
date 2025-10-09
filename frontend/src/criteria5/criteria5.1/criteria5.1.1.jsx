import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useUpload } from "../../contextprovider/uploadsContext";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { FaTrash, FaEdit } from 'react-icons/fa';
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria5_1_1 = () => {
  const { user } = useAuth();
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
    supportLinks: [],
    year: ""
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
      
      const data = response.data.data.map(item => ({
        id: item.id,
        slNo: item.sl_no || item.slNo,
        scheme_name: item.scheme_name || '',
        gov_students_count: item.gov_students_count || 0,
        gov_amount: item.gov_amount || 0,
        non_gov_students_count: item.non_gov_students_count || 0,
        non_gov_amount: item.non_gov_amount || 0,
        inst_students_count: item.inst_students_count || 0,
        inst_amount: item.inst_amount || 0,
        year: item.year || year,
        supportLinks: item.support_links || []
      }));
      
      console.log('Mapped data:', data);
      
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
        
        const updatedData = await fetchResponseData(currentYear);
        
        setYearData(prev => ({
          ...prev,
          [currentYear]: updatedData
        }));
        
        setSubmittedData(updatedData);
        
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
          year: ""
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

      const currentRecord = await api.get(`/criteria2/getResponse/5.1.1`, {
        params: { sl_no: entryId }
      });
      
      if (!currentRecord.data || !currentRecord.data.data) {
        throw new Error('Failed to fetch current record for update');
      }
      
      const recordData = Array.isArray(currentRecord.data.data) 
        ? currentRecord.data.data[0] 
        : currentRecord.data.data;
      
      const payload = {
        scheme_name: formDataToSubmit.scheme_name || recordData.scheme_name,
        gov_students_count: parseInt(formDataToSubmit.gov_students_count) || 0,
        gov_amount: parseFloat(formDataToSubmit.gov_amount) || 0,
        non_gov_students_count: parseInt(formDataToSubmit.non_gov_students_count) || 0,
        non_gov_amount: parseFloat(formDataToSubmit.non_gov_amount) || 0,
        inst_students_count: parseInt(formDataToSubmit.inst_students_count) || 0,
        inst_amount: parseFloat(formDataToSubmit.inst_amount) || 0,
        total_students_count: total_students_count || recordData.total_students_count || 0,
        session: parseInt(yearToSend) || recordData.session,
        year: parseInt(yearToSend) || recordData.year
      };
      
      console.log('Update payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.put(`/criteria5/updateResponse511_512/${entryId}`, payload);
      
      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.message || "Failed to update entry";
        throw new Error(errorMsg);
      }
      
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

  const validateFormData = (dataToSubmit) => {
    const yearInput = dataToSubmit.year || currentYear;
    const yearToSend = yearInput.split("-")[0];
    const session = parseInt(yearToSend);
    const currentYearNum = new Date().getFullYear();
    const missingFields = [];

    const checkStringField = (value, fieldName) => {
      if (typeof value === 'string') return value.trim();
      if (value === null || value === undefined) return '';
      return String(value);
    };

    const checkNumericField = (value, fieldName) => {
      if (value === null || value === undefined || value === '') return false;
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue >= 0;
    };

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
      year: "",
      ...entry,
      id: entry.id || entry.slNo,
      year: entry.year || currentYear
    };
    
    setFormData(formData);
    setIsEditMode(true);
    setEditKey(entry.id || entry.slNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        year: ""
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

  useEffect(() => {
    const loadData = async () => {
      if (currentYear) {
        const data = await fetchResponseData(currentYear);
        setSubmittedData(data || []);
      }
    };
    
    loadData();
  }, [currentYear]);

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

  useEffect(() => {
    if (currentYear) {
      fetchScore();
    }
  }, [currentYear]);

  useEffect(() => {
    if (availableSessions && availableSessions.length > 0 && !currentYear) {
      const firstYear = availableSessions[0];
      setCurrentYear(firstYear);
    }
  }, [availableSessions, currentYear]);

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setCurrentYear(selectedYear);
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
    navigate('/criteria5.1.2');
  };

  const goToPreviousPage = () => {
    navigate('/criteria4.4.2');
  };

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

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <div className="flex flex-1 overflow-hidden pt-8">
        <div className={`fixed top-8 left-0 bottom-0 z-40 ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white shadow-md`}>
          <Sidebar onCollapse={setIsSidebarCollapsed} />
        </div>
        <div className={`flex-1 transition-all duration-300 overflow-y-auto ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6`}>
          {/* Page Header with Title and User Dropdown */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center h-[70px] w-[700px] shadow border border-black/10 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <a href="#" className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200 px-4">
                <i className="fas fa-arrow-left"></i>
              </a>
              <div>
                <p className="text-2xl font-bold text-gray-800">Criteria 5 - Student Support and Progression</p>
                <p className="text-gray-600 text-sm">5.1 Student Support</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4" />
            </div>
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
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Input Form Table */}
          <div className="border rounded mb-8">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Scholarship Entry - {isEditMode ? 'Edit Mode' : 'Add New'}
            </h2>
            <form onSubmit={handleSubmit}>
              <table className="w-full border text-sm">
                <thead className="bg-gray-50 text-black">
                  <tr>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Scheme Name</th>
                    <th className="px-4 py-2 border">Gov Students</th>
                    <th className="px-4 py-2 border">Gov Amount</th>
                    <th className="px-4 py-2 border">Inst Students</th>
                    <th className="px-4 py-2 border">Inst Amount</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          handleChange("year", value);
                        }}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="YYYY"
                        pattern="\d{4}"
                        title="Please enter a 4-digit year"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData.scheme_name}
                        onChange={(e) => handleChange("scheme_name", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Scheme Name"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="0"
                        value={formData.gov_students_count}
                        onChange={(e) => handleChange("gov_students_count", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Count"
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
                        placeholder="Amount"
                      />
                    </td>
                    <td className="px-2 py-2 border">
                      <input
                        type="number"
                        min="0"
                        value={formData.inst_students_count}
                        onChange={(e) => handleChange("inst_students_count", e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                        placeholder="Count"
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
                        placeholder="Amount"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <div className="flex gap-2">
                        <button
                          type="submit"
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
                                scheme_name: "",
                                gov_students_count: "",
                                gov_amount: "",
                                non_gov_students_count: "",
                                non_gov_amount: "",
                                inst_students_count: "",
                                inst_amount: "",
                                supportLinks: [],
                                year: ""
                              });
                              setEditKey(null);
                              setIsEditMode(false);
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
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
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6 flex justify-between items-center">
            <div className="mb-6 w-full">
              <label className="block text-gray-700 font-medium mb-2">
                Upload Documents
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="fas fa-upload mr-2"></i> Choose Files
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={async (e) => {
                      const filesArray = Array.from(e.target.files);
                      for (const file of filesArray) {
                        try {
                          console.log('Uploading file:', file.name);
                          const yearToUse = currentYear || new Date().getFullYear().toString();
                          console.log('Using year:', yearToUse);
                          
                          const uploaded = await uploadFile(
                            "criteria5_1_1",
                            file,
                            "5.1.1",
                            yearToUse,
                            user?.session
                          );

                          setFormData(prev => ({
                            ...prev,
                            supportLinks: [
                              ...prev.supportLinks, 
                              {
                                id: uploaded.id,
                                url: uploaded.fileUrl,
                                name: file.name
                              }
                            ]
                          }));
                        } catch (err) {
                          console.error('Upload error:', err);
                          console.error('Error details:', {
                            message: err.message,
                            response: err.response?.data,
                            status: err.response?.status
                          });
                          setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
                        }
                      }
                    }}
                  />
                </label>

                {uploading && <span className="text-gray-600">Uploading...</span>}
                {uploadError && <span className="text-red-600">{uploadError}</span>}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <i className="fas fa-sync-alt fa-spin mr-2"></i>
                Changes will be auto-saved
              </div>
              {formData.supportLinks && formData.supportLinks.length > 0 && (
                <ul className="list-disc pl-5 text-gray-700">
                  {formData.supportLinks.map((link, index) => (
                    <li key={index} className="flex justify-between items-center mb-1">
                      <a
                        href={`http://localhost:3000${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {link.name || link.url.split("/").pop()}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            const newLinks = prev.supportLinks.filter(l => l.id !== link.id);
                            if (newLinks.length < prev.supportLinks.length) {
                              alert('File deleted successfully!');
                            }
                            return {
                              ...prev,
                              supportLinks: newLinks
                            };
                          });
                          removeFile("criteria5_1_1", link.id);
                        }}
                        className="text-red-600 hover:text-red-800 bg-white hover:bg-gray-100 ml-2 p-1 rounded transition-colors duration-200"
                        title="Remove file"
                      >
                        <FaTrash size={16} className="text-red-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Submitted Entries Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Submitted Entries</h2>
          </div>

          {availableSessions?.map((session) => (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">
                Year: {session}
              </h3>
              {yearData[session] && yearData[session].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">S.No</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Scheme Name</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Gov Students</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Gov Amount</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Inst Students</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Inst Amount</th>
                      <th className="border border-black px-4 py-2 text-gray-800 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={`${entry.scheme_name}-${entry.year}-${index}`}>
                        <td className="border border-black text-black px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-black text-black px-4 py-2">{entry.scheme_name}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.gov_students_count}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">₹{entry.gov_amount}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">{entry.inst_students_count || 0}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">₹{entry.inst_amount || 0}</td>
                        <td className="border border-black text-black px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="p-2 bg-white text-blue-500 rounded-full hover:bg-blue-50 transition-colors duration-200 flex items-center"
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
                                  year: entry.year
                                });
                                setEditKey({ 
                                  slNo: entry.sl_no || entry.slNo, 
                                  year: entry.year 
                                });
                                setIsEditMode(true);
                              }}
                              title="Edit"
                            >
                              <FaEdit className="text-blue-500" size={16} />
                            </button>
                            <button
                              className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this entry?')) {
                                  handleDelete(entry.sl_no || entry.slNo, entry.year || currentYear);
                                }
                              }}
                              disabled={submitting}
                              title="Delete"
                            >
                              <FaTrash className="text-red-500" size={16} />
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
                    <th className="border border-gray-400 px-4 py-2">YEAR</th>
                    {availableSessions?.slice(0, 5).map((year) => (
                      <th key={year} className="border border-gray-400 px-4 py-2">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          <div className="mt-6 mb-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_1_1;