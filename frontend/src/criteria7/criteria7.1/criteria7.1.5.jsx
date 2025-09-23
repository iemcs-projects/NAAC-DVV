import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria7_1_5 = () => {
    const { user } = useAuth();
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
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false);
  const [photoLink, setPhotoLink] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [formData, setFormData] = useState({
    year: ""
  });

  const navigate = useNavigate();

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

  // Set initial selected year when availableSessions changes
  useEffect(() => {
    if (availableSessions.length > 0) {
      setSelectedYear(availableSessions[0]);
      setCurrentYear(availableSessions[0]);
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

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria7/score715");
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
      initiative: selectedCount,
      photo_link: null,
      additional_info: null,
    };

    try {
      setLoading(true);
      console.log('Submitting form data:', body);
      
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria7/createResponse715",
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
        setDocumentLink("");
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
    navigate("/criteria7.1.6");
  };

  const goToPreviousPage = () => {
    navigate("/criteria7.1.4");
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
              7.1.5 Metric Information
            </h3>
            <p className="text-sm text-gray-700">
              The institutional initiatives for greening the campus are as
              follows:
              <br />
              1. Restricted entry of automobiles
              <br />
              2. Use of Bicycles/ Battery powered vehicles
              <br />
              3. Pedestrian Friendly pathways
              <br />
              4. Ban on use of Plastic
              <br />
              5. Landscaping with trees and plants
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            {[
              'Restricted entry of automobiles',
              'Use of Bicycles/ Battery powered vehicles',
              'Pedestrian Friendly pathways',
              'Ban on use of Plastic',
              'Landscaping with trees and plants'
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

          {/* File Upload Section */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <ul className="list-disc text-sm text-gray-700 mb-4 pl-5">
              <li>
                Upload: Geotagged Photographs / videos of the facilities
              </li>
              <li>
                Upload: Various policy documents / decisions circulated for
                implementation
              </li>
              <li>Upload: Any other relevant information</li>
            </ul>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Link
            </label>
            <input
              type="text"
              placeholder="Enter photo link"
              value={photoLink}
              onChange={(e) => setPhotoLink(e.target.value)}
              className="w-full px-4 py-2 border rounded text-gray-900 mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Link
            </label>
            <input
              type="text"
              placeholder="Enter document link"
              value={documentLink}
              onChange={(e) => setDocumentLink(e.target.value)}
              className="w-full px-4 py-2 border rounded text-gray-900 mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Info (Link)
            </label>
            <input
              type="text"
              placeholder="Enter URL here"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full px-4 py-2 border rounded text-gray-900"
            />
          </div>

          {/* Score */}
          <div className="mb-4">
            {loading && <p className="text-blue-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {provisionalScore && (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (7.1.5): {provisionalScore?.score_sub_sub_criteria || provisionalScore?.data?.score_sub_sub_criteria || provisionalScore?.score || provisionalScore?.data?.score || 0}
                </p>
                <p className="text-lg font-semibold text-green-800">
                  Grade: {provisionalScore?.sub_sub_cr_grade || provisionalScore?.data?.sub_sub_cr_grade || provisionalScore?.grade || provisionalScore?.data?.grade || 'N/A'}
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
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

export default Criteria7_1_5;
