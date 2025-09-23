import React, { useState, useEffect, useContext } from "react";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria7_1_2 = () => {
  const { user } = useAuth();
  const { sessions: availableSessions } = useContext(SessionContext);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });
  const [photoLink, setPhotoLink] = useState("");
  const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false);
  const [year, setYear] = useState("");
   const [currentYear, setCurrentYear] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [formData, setFormData] = useState({
    year: ""
  });

  useEffect(() => {
        if (currentYear) {
          const year = currentYear.split('-')[0];
          setFormData(prev => ({
            ...prev,
            year: year
          }));
          // Also update the selectedYear
          setSelectedYear(currentYear);
        }
      }, [currentYear]);

  const navigate = useNavigate();

  // Set initial selected year when availableSessions changes
  useEffect(() => {
    if (availableSessions.length > 0) {
      setSelectedYear(availableSessions[0]);
    }
  }, [availableSessions]);
  useEffect(() => {
    if (availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]); // This will trigger the other useEffect
    }
  }, [availableSessions]);
  

  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount >= 4) return 'A. Any 4 or more of the above';
    if (selectedCount === 3) return 'B. Any 3 of the above';
    if (selectedCount === 2) return 'C. Any 2 of the above';
    if (selectedCount === 1) return 'D. Any 1 of the above';
    return 'E. None of the above';
  };

  const getFacilityTypeText = (type) => {
    const types = [
      'A. Any 4 or more of the above',
      'B. Any 3 of the above',
      'C. Any 2 of the above',
      'D. Any 1 of the above',
      'E. None of the above'
    ];
    return types[type] || 'E. None of the above';
  };

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria7/score712");
      console.log('Score response:', response.data);
      setProvisionalScore(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  // Fetch score on mount
  useEffect(() => {
    fetchScore();
  }, [currentYear]);

  // Fetch score on mount
  useEffect(() => {
    const fetchScore = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("http://localhost:3000/api/v1/criteria7/score712", {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true // Include if using cookies/sessions
        });
        
        console.log('Score API Response:', response); // Debug log
        
        if (response.status === 200 && response.data) {
          setScore(response.data.score || 0); // Default to 0 if score is not provided
        } else {
          throw new Error('Invalid response format');
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

  const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    const year_of_award = year || sessionFull.split("-")[0];

  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous messages
    setError(null);
    setSuccessMessage("");

    // Get count of selected options
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    
    // Validate at least one option is selected
    if (selectedCount === 0) {
      setError("Please select at least one option.");
      return;
    }

    const body = {
      session: parseInt(session),
      facility_type: selectedCount,
      photo_link: null,
      additional_info: null,
    };

    try {
      setLoading(true);
      console.log('Submitting form data:', body);
      
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria7/createResponse712",
        body,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      
      console.log('Submit response:', response);
      
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Data submitted successfully!");
        // Reset form
        setSelectedOptions({
          option1: false,
          option2: false,
          option3: false,
          option4: false,
          option5: false,
        });
        setPhotoLink("");
        setAdditionalInfo("");
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to submit response. Please try again.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    navigate("/criteria7.1.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria7.1.1");
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
              <p className="text-2xl font-bold text-gray-800">Criteria 7 - Institutional Values and Best Practices</p>
              <p className="text-gray-600 text-sm">7.1 Institutional Values and Social Responsibilities</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          {/* Provisional Score */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (7.1.2): {provisionalScore?.score_sub_sub_criteria || provisionalScore?.data?.score_sub_sub_criteria || provisionalScore?.score || provisionalScore?.data?.score || 0}
                </p>
                <p className="text-lg font-semibold text-green-800">
                  Grade: {provisionalScore?.sub_sub_cr_grade || provisionalScore?.data?.sub_sub_cr_grade || provisionalScore?.grade || provisionalScore?.data?.grade || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Show Score */}
          <div className="mb-4">
            {loading && <p className="text-blue-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {score !== null && (
              <p className="text-green-700 font-medium">Current Score: {score}</p>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="mb-6">
            <label className="font-medium text-gray-700 mr-2">Select Academic Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!availableSessions || availableSessions.length === 0}
            >
              {availableSessions && availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
            {(!availableSessions || availableSessions.length === 0) && (
              <p className="text-red-500 text-sm mt-1">No sessions available</p>
            )}
          </div>

          {/* Metric Info */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">7.1.2 Metric Information</h3>
            <p className="text-sm text-gray-700">
              The Institution has facilities for alternate sources of energy and energy
              conservation measures...<br />
              1. Solar energy<br />
              2. Biogas plant<br />
              3. Wheeling to the Grid<br />
              4. Sensor-based energy conservation<br />
              5. Use of LED bulbs/ power efficient equipment
            </p>
          </div>

          {/* Checkboxes */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-4">
              Select the Energy Conservation Measures Available (Multiple selections allowed)
            </h3>
            <div className="space-y-3">
              {[
                { key: "option1", label: "1. Solar energy" },
                { key: "option2", label: "2. Biogas plant" },
                { key: "option3", label: "3. Wheeling to the Grid" },
                { key: "option4", label: "4. Sensor-based energy conservation" },
                { key: "option5", label: "5. Use of LED bulbs/ power efficient equipment" }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedOptions[key]}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  <label htmlFor={key} className="text-sm text-gray-800">
                    {label}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="font-medium text-gray-700">Selected Grade: <span className="text-blue-600">{getGrade()}</span></p>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geotagged Photos Link
            </label>
            <input
              type="text"
              placeholder="Enter URL here"
              className="w-full px-4 py-2 border rounded text-gray-900 mb-4"
              value={photoLink}
              onChange={(e) => setPhotoLink(e.target.value)}
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Info (Link)
            </label>
            <input
              type="text"
              placeholder="Enter URL here"
              className="w-full px-4 py-2 border rounded text-gray-900"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="mb-6">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Response"}
            </button>
            {successMessage && (
              <p className="text-green-600 mt-2">{successMessage}</p>
            )}
          </div>

          {/* Bottom Buttons */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria7_1_2;
