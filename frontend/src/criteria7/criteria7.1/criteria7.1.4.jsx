import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria7_1_4 = () => {
  const { sessions: availableSessions } = useContext(SessionContext);
  const [selectedYear, setSelectedYear] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });
  const [photoLink, setPhotoLink] = useState("");
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
      setSelectedYear(currentYear);
    }
  }, [currentYear]);

  const navigate = useNavigate();

  // Set initial selected year when availableSessions changes
  useEffect(() => {
    if (availableSessions.length > 0) {
      setSelectedYear(availableSessions[0]);
      setCurrentYear(availableSessions[0]);
    }
  }, [availableSessions]);

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount >= 4) return 'A. Any 4 or more of the above';
    if (selectedCount === 3) return 'B. Any 3 of the above';
    if (selectedCount === 2) return 'C. Any 2 of the above';
    if (selectedCount === 1) return 'D. Any 1 of the above';
    return 'E. None of the above';
  };

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria7/score714");
      console.log('Score response:', response.data);
      setProvisionalScore(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  // Fetch score on mount and when currentYear changes
  useEffect(() => {
    fetchScore();
  }, [currentYear]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSubmit = async () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    const session = selectedYear ? selectedYear.split('-')[0] : '';
    
    if (!session) {
      setError("Please select a valid session");
      return;
    }

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
        "http://localhost:3000/api/v1/criteria7/createResponse714",
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
        // Refresh the score after submission
        await fetchScore();
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to submit response. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    navigate("/criteria7.1.5");
  };

  const goToPreviousPage = () => {
    navigate("/criteria7.1.3");
  };

  return (
    <div className="min-h-screen w-[1690px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
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

          {/* Status / Score */}
          <div className="mb-4">
            {loading && <p className="text-blue-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {provisionalScore && (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (7.1.4): {provisionalScore?.score_sub_sub_criteria || provisionalScore?.data?.score_sub_sub_criteria || provisionalScore?.score || provisionalScore?.data?.score || 0}
                </p>
                <p className="text-lg font-semibold text-green-800">
                  Grade: {provisionalScore?.sub_sub_cr_grade || provisionalScore?.data?.sub_sub_cr_grade || provisionalScore?.grade || provisionalScore?.data?.grade || 'N/A'}
                </p>
              </div>
            )}
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
              {availableSessions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Info */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">
              7.1.4 Metric Information
            </h3>
            <p className="text-sm text-gray-700">
              Water conservation facilities available in the Institution:
              <br />
              1. Rain water harvesting
              <br />
              2. Bore well / recharge pits
              <br />
              3. Construction of tanks and bunds
              <br />
              4. Waste water recycling
              <br />
              5. Maintenance of water bodies and distribution system
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            {[
              'Rain water harvesting',
              'Bore well / recharge pits',
              'Construction of tanks and bunds',
              'Waste water recycling',
              'Maintenance of water bodies and distribution system'
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
              <p className="font-medium">Selected Grade: {getGrade()}</p>
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

export default Criteria7_1_4;
