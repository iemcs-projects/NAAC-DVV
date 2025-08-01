import { useState, useEffect, useRef } from 'react';
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from 'react-router-dom';

const Criteria7_3_1 = () => {
  const [metrics, setMetrics] = useState([
    {
      id: '7.3.1',
      description: 'Portray the performance of the Institution in one area distinctive to its priority and thrust',
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
  const textareaRefs = useRef({});
  const autoSaveTimerRef = useRef(null);

  const handleResponseChange = (id, value) => {
    setSaving(true);
    const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
    setMetrics(prev =>
      prev.map(metric =>
        metric.id === id
          ? { ...metric, response: value, wordCount, isComplete: wordCount >= 1000 }
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

  useEffect(() => {
    const handlers = {};
    Object.keys(textareaRefs.current).forEach(id => {
      const handler = () => saveMetric(id);
      handlers[id] = handler;
      const el = textareaRefs.current[id];
      if (el) el.addEventListener('blur', handler);
    });
    return () => {
      Object.keys(textareaRefs.current).forEach(id => {
        const el = textareaRefs.current[id];
        if (el && handlers[id]) el.removeEventListener('blur', handlers[id]);
      });
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [metrics]);

  const goToNextPage = () => navigate('/criteria7.1.2');
  const goToPreviousPage = () => navigate('/criteria7.1.1');

  return (
    <div className="min-h-screen w-[1690px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Criteria 7: Institutional Values and Best Practices</h2>
            <div className="text-sm text-gray-600">
              <span className="text-gray-600 mr-6">7.3-Institutional Distinctiveness</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">7.3.1 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-4">
              Portray the performance of the Institution in one area distinctive to its priority and thrust
            </p>
            <h4 className="text-blue-600 font-medium mb-2">Requirements:</h4>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
              <li>Write description of initiatives in not more than 1000 words</li>
            </ul>
          </div>

          <div className="flex-1">
            {metrics.map(metric => (
              <div key={metric.id} className="bg-white rounded-lg shadow-md mb-6 w-full">
                <div className={`p-4 flex justify-between items-center cursor-pointer ${metric.isExpanded ? 'bg-indigo-50' : 'bg-white'}`}>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-950">{metric.id}: {metric.description}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {metric.mandatory && <span className="text-red-600">Mandatory</span>}
                      {metric.lastSaved && <span className="ml-4">Last saved at {metric.lastSaved}</span>}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {metric.wordCount}/1000 words {metric.wordCount >= 1000 ? '✓' : ''}
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
                      placeholder="Enter your qualitative response here (minimum 1000 words required)..."
                      className={`w-full min-h-[200px] text-gray-950 p-4 border rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 ${metric.wordCount >= 1000 ? 'border-green-300' : 'border-gray-300'}`}
                    ></textarea>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>
                        {metric.wordCount < 1000 ? (
                          <span className="text-amber-600">
                            <i className="fas fa-exclamation-triangle mr-1"></i> Please write at least 1000 words
                          </span>
                        ) : (
                          <span className="text-green-600">
                            <i className="fas fa-check-circle mr-1"></i> Word count met
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Provide web link to: Appropriate web page in the Institutional website</li>
                <li>Provide web link to: Any other relevant information</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Paste Link to Institutional Website</label>
            <input
              type="text"
              placeholder="Enter institutional website URL here"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">Paste Link to Additional Information</label>
            <input
              type="text"
              placeholder="Enter other relevant info URL here"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            />
          </div>

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {autoSaveTimestamp ? (
                <span><i className="fas fa-save mr-1"></i> Auto-saved at {autoSaveTimestamp}</span>
              ) : (
                <span>Changes will be auto-saved</span>
              )}
            </div>
          </div>

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria7_3_1;

