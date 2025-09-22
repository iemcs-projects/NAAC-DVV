import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria7_1_6 = () => {
  const { sessions, isLoading: isSessionLoading } = useContext(SessionContext);
  const [selectedYear, setSelectedYear] = useState("");
  const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });
  const [reportLink, setReportLink] = useState("");
  const [certification, setCertification] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Set default selected year when sessions are loaded
  useEffect(() => {
    if (sessions.length > 0 && !selectedYear) {
      setSelectedYear(sessions[0]);
    }
  }, [sessions, selectedYear]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    // Return the count, but cap it at 4
    return Math.min(selectedCount, 4);
  };

  // Function to get the display grade text
  const getGradeText = () => {
    const count = getGrade();
    if (count >= 5) return 'A. All of the above';
    if (count >= 3) return 'B. Any 3 of the above';
    if (count >= 2) return 'C. Any 2 of the above';
    if (count >= 1) return 'D. Any 1 of the above';
    return 'E. None of the above';
  };

  // Fetch score on mount
  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/v1/criteria7/score716",
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        if (response.status === 200 && response.data) {
          setScore(response.data.score || 0);
        }
      } catch (err) {
        console.error('Error fetching score:', err);
        setError(`Failed to fetch score: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage("");

    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount === 0) {
      setError("Please select at least one option.");
      return;
    }

    // Calculate the grade (1-4, with 4 being the maximum)
    const grade = Math.min(selectedCount, 4);

    try {
      setLoading(true);
      
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria7/createResponse716",
        {
          session: selectedYear,
          audit_type: grade,
          report_link: reportLink,
          certification: certification,
          additional_info: additionalInfo,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        const successMessage = "Data submitted successfully!";
        setSuccessMessage(successMessage);
        alert(successMessage);
        
        // Clear form after success
        setSelectedOptions({
          option1: false,
          option2: false,
          option3: false,
          option4: false,
          option5: false,
        });
        setReportLink("");
        setCertification("");
        setAdditionalInfo("");
        
        // Fetch updated score
        const scoreRes = await axios.get(
          "http://localhost:3000/api/v1/criteria7/score716",
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        
        if (scoreRes.status === 200 && scoreRes.data) {
          setScore(scoreRes.data.score || 0);
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save response. Please try again.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    navigate("/criteria7.1.7");
  };

  const goToPreviousPage = () => {
    navigate("/criteria7.1.5");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex">
    <Sidebar onCollapse={setIsSidebarCollapsed} />
    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 pt-4`}>
        <div className="flex-1 p-6">
          {/* Page Title */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 7: Institutional Values and Best Practices
            </h2>
            <div className="text-sm text-gray-600">
              7.1 - Institutional Values and Social Responsibilities
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="mb-6">
            <label className="font-medium text-gray-700 mr-2">
              Select Academic Year:
            </label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {sessions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Info */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">
              7.1.6 Metric Information
            </h3>
            <p className="text-sm text-gray-700">
              Quality audits on environment and energy are regularly undertaken
              by the institution:
              <br />
              1. Green audit
              <br />
              2. Energy audit
              <br />
              3. Environment audit
              <br />
              4. Clean and green campus recognitions/awards
              <br />
              5. Beyond the campus environmental promotional activities
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            {[
              'Green audit',
              'Energy audit',
              'Environment audit',
              'Clean and green campus recognitions/awards',
              'Beyond the campus environmental promotional activities'
            ].map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`option${index + 1}`}
                  checked={selectedOptions[`option${index + 1}`]}
                  onChange={() => handleCheckboxChange(`option${index + 1}`)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor={`option${index + 1}`} className="ml-2 text-gray-700">
                  {option}
                </label>
              </div>
            ))}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">Selected Grade: {getGradeText()}</p>
            </div>
          </div>

          {/* File/Links Section */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Link
            </label>
            <input
              type="text"
              placeholder="Enter report link"
              value={reportLink}
              onChange={(e) => setReportLink(e.target.value)}
              className="w-full px-4 py-2 border rounded text-gray-900 mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certification
            </label>
            <input
              type="text"
              placeholder="Enter certification details or link"
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
              className="w-full px-4 py-2 border rounded text-gray-900 mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Info
            </label>
            <input
              type="text"
              placeholder="Enter URL or info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full px-4 py-2 border rounded text-gray-900"
            />
          </div>

          {/* Score Display */}
          {score !== null && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <strong>Score:</strong> {score}
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-6">
            <Bottom 
              onPrevious={goToPreviousPage} 
              onNext={goToNextPage} 
              onSubmit={handleSubmit}
              isSubmitting={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria7_1_6;
