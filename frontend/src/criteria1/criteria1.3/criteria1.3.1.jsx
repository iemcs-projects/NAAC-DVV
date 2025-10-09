import { useState, useEffect, useRef } from 'react';
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from 'react-router-dom';
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import { FaTrash } from "react-icons/fa";

const Criteria1_3_1 = () => {
  const { user } = useAuth();
  const { uploads, uploading, uploadFile, error: uploadError } = useUpload(); 
  const [useupload, setUseupload] = useState(false);
  const [currentYear, setCurrentYear] = useState("");
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    supportLinks: [],
  })
  const [metrics, setMetrics] = useState([
    {
      id: '1.3.1',
      description: 'Number of value-added courses for imparting transferable and life skills offered during the year',
      response: '',
      wordCount: 0,
      isComplete: false,
      isExpanded: true,
      files: [],
      mandatory: false,
      lastSaved: null
    }
  ]);
  
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const textareaRefs = useRef({});
  const autoSaveTimerRef = useRef(null);
  

  useEffect(() => {
    // Set current year in YYYY-YYYY format (e.g., 2023-2024)
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const academicYear = `${currentYear}-${nextYear}`;
    setCurrentYear(academicYear);
    
    // If you need to fetch existing uploads, you can do it here
    // Example: fetchExistingUploads("1.1.1", academicYear);
  }, []);

  const handleResponseChange = (id, value) => {
    setSaving(true);
    const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
    setMetrics(prev =>
      prev.map(metric =>
        metric.id === id
          ? { ...metric, response: value, wordCount, isComplete: wordCount >= 100 }
          : metric
      )
    );

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => saveMetric(id), 3000);
  };

  const saveMetric = id => {
    setSaving(true);
    setTimeout(() => {
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMetrics(prev =>
        prev.map(metric =>
          metric.id === id ? { ...metric, lastSaved: timeString } : metric
        )
      );
      setSaving(false);
      setAutoSaveTimestamp(timeString);
    }, 800);
  };

  const handleFileUpload = (id, e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setMetrics(prev =>
      prev.map(metric =>
        metric.id === id
          ? { ...metric, files: [...metric.files, ...newFiles] }
          : metric
      )
    );
    saveMetric(id);
  };

  const removeFile = (metricId, fileId) => {
    setMetrics(prev =>
      prev.map(metric =>
        metric.id === metricId
          ? { ...metric, files: metric.files.filter(f => f.id !== fileId) }
          : metric
      )
    );
    saveMetric(metricId);
  };

  const handleSubmit = () => {
    const incomplete = metrics.filter(m => !m.isComplete && m.mandatory);
    if (incomplete.length > 0) {
      alert(`Please complete all mandatory metrics: ${incomplete.map(m => m.id).join(', ')}`);
      return;
    }
    alert('All metrics submitted successfully!');
  };

  const saveAllAsDraft = () => {
    metrics.forEach(m => saveMetric(m.id));
    alert('All metrics saved as draft.');
  };

  useEffect(() => {
    const handleBlur = id => saveMetric(id);
    Object.keys(textareaRefs.current).forEach(id => {
      const textarea = textareaRefs.current[id];
      if (textarea) {
        textarea.addEventListener('blur', () => handleBlur(id));
      }
    });
    return () => {
      Object.keys(textareaRefs.current).forEach(id => {
        const textarea = textareaRefs.current[id];
        if (textarea) {
          textarea.removeEventListener('blur', () => handleBlur(id));
        }
      });
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [metrics]);

  const goToNextPage = () => {
    navigate('/criteria1.3.2'); 
  };

  const goToPreviousPage = () => {
    navigate('/criteria1.2.3'); 
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
                <p className="text-2xl font-bold text-gray-800">Criteria 1 - Curricular Planning and Implementation</p>
                <p className="text-gray-600 text-sm">1.3 Curriculum Enrichment</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4" />
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">1.3.1 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Number of value-added courses for imparting transferable and life skills offered during the year
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">e-copies of award letters and certificates</li>
              <li className="mb-1">Number of awards/medals for outstanding performance in sports/cultural activities</li>
              <li className="mb-1">Any additional information</li>
            </ul>
          </div>

          {/* Metrics Section */}
          <div className="flex-1">
            {metrics.map(metric => (
              <div key={metric.id} className="bg-white rounded-lg shadow-md mb-6 w-full">
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer ${metric.isExpanded ? 'bg-indigo-50' : 'bg-white'}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-950">{metric.id}: {metric.description}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {metric.mandatory ? <span className="text-red-600">Mandatory</span> : <span></span>}
                      {metric.lastSaved && (
                        <span className="ml-4">Last saved at {metric.lastSaved}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {metric.wordCount}/500 words {metric.wordCount >= 500 ? '✓' : ''}
                  </div>
                </div>

                {metric.isExpanded && (
                  <div className="p-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualitative Response <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={el => (textareaRefs.current[metric.id] = el)}
                      value={metric.response}
                      onChange={e => handleResponseChange(metric.id, e.target.value)}
                      placeholder="Enter your qualitative response here (minimum 500 words required)..."
                      className={`w-full min-h-[200px] text-gray-950 p-4 border rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 ${metric.wordCount >= 100 ? 'border-green-300' : 'border-gray-300'}`}
                    ></textarea>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>
                        {metric.wordCount < 100 ? (
                          <span className="text-amber-600">
                            <i className="fas fa-exclamation-triangle mr-1"></i> Please write at least 500 words
                          </span>
                        ) : (
                          <span className="text-green-600">
                            <i className="fas fa-check-circle mr-1"></i> Minimum word count met
                          </span>
                        )}
                      </span>
                      <span>
                        {saving ? (
                          <span><i className="fas fa-sync-alt fa-spin mr-1"></i> Saving...</span>
                        ) : metric.lastSaved ? (
                          <span>Saved at {metric.lastSaved}</span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6 flex justify-between items-center">

          <div className="mb-6">
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
                    "1.3.1",  // Metric ID
                    file,
                    "1.3.1",  // Criteria code
                    yearToUse,
                    user?.session
                  );

                  // Add the uploaded file info to the form data
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

        {/* Status Messages */}
        {uploading && <span className="text-gray-600">Uploading...</span>}
        {error && <span className="text-red-600">{error}</span>}
      </div>
      <div className="text-sm text-gray-500 flex items-center">
        <i className="fas fa-sync-alt fa-spin mr-2"></i>
        Changes will be auto-saved
      </div>
      {formData.supportLinks.length > 0 && (
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
                  // Remove from local formData
                  setFormData(prev => {
                    const newLinks = prev.supportLinks.filter(l => l.id !== link.id);
                    // Show success message
                    if (newLinks.length < prev.supportLinks.length) {
                      alert('File deleted successfully!');
                    }
                    return {
                      ...prev,
                      supportLinks: newLinks
                    };
                  });
                  // Also remove from context
                  removeFile("1.3.1", link.id);
                }}
                className="text-red-600 hover:text-red-800 !bg-white hover:bg-gray-100 ml-2 p-1 rounded transition-colors duration-200"
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
        
          <div className="mt-auto mb-6 bg-white border-t border-gray-200 shadow-inner py-4 px-6">
  <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
</div>
        </div>
      </div>
    </div>
 
  );
};

export default Criteria1_3_1;
