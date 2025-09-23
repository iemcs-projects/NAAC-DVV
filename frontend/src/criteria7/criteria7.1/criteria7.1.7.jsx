import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria7_1_7 = () => {
  const { user } = useAuth();
  const { sessions, isLoading: isSessionLoading } = useContext(SessionContext);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });
  const [department, setDepartment] = useState("");
  const [isSidebarCollapsed,setIsSidebarCollapsed]=useState(false);
  const [facultyId, setFacultyId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [score, setScore] = useState(null);
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
    return Math.min(selectedCount, 4); // Cap at 4
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
          "http://localhost:3000/api/v1/criteria7/score717",
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

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage("");

    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount === 0) {
      setError("Please select at least one option.");
      return;
    }

    const formData = new FormData();
    formData.append('session', selectedYear);
    formData.append('grade', getGrade());
    formData.append('department', department);
    formData.append('faculty_id', facultyId);
    formData.append('faculty_name', facultyName);
    formData.append('additional_info', additionalInfo);
    
    // Append each file
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    try {
      setLoading(true);
      
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria7/createResponse717",
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data' 
          },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        const successMsg = "Data submitted successfully!";
        setSuccessMessage(successMsg);
        alert(successMsg);
        
        // Clear form after success
        setSelectedOptions({
          option1: false,
          option2: false,
          option3: false,
          option4: false,
          option5: false,
        });
        setDepartment("");
        setFacultyId("");
        setFacultyName("");
        setAdditionalInfo("");
        setFiles([]);
        
        // Fetch updated score
        const scoreRes = await axios.get(
          "http://localhost:3000/api/v1/criteria7/score717",
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
    navigate("/criteria7.1.8");
  };

  const goToPreviousPage = () => {
    navigate("/criteria7.1.6");
  };

  const departments = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology"
  ];

  const accessibilityOptions = [
    "Built environment with ramps/lifts for easy access to classrooms",
    "Disabled-friendly washrooms",
    "Signage including tactile path, lights, display boards and signposts",
    "Assistive technology and facilities for persons with disabilities",
    "Provision for enquiry and information"
  ];

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
          
          {/* Year Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Academic Year
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={isSessionLoading}
            >
              {isSessionLoading ? (
                <option>Loading sessions...</option>
              ) : (
                sessions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Score Display */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">
              Current Score: {score !== null ? score : 'Loading...'}
            </h3>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p>{successMessage}</p>
            </div>
          )}

          {/* Department and Faculty Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty ID
              </label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter faculty ID" 
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty Name
              </label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter faculty name" 
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
              />
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select the accessibility options available (Select all that apply):
            </h3>
            <div className="space-y-3">
              {accessibilityOptions.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`option${index + 1}`}
                    checked={selectedOptions[`option${index + 1}`]}
                    onChange={() => handleCheckboxChange(`option${index + 1}`)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`option${index + 1}`} className="ml-2 text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="font-medium text-blue-800">Selected Grade: {getGradeText()}</p>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upload Supporting Documents
            </h3>
            <ul className="list-disc text-sm text-gray-700 mb-4 pl-5 space-y-1">
              <li>Geotagged Photographs / videos of the facilities</li>
              <li>Policy documents and information brochures on the support to be provided</li>
              <li>Details of the Software procured for providing the assistance</li>
              <li>Any other relevant information</li>
            </ul>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="flex items-center">
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="fas fa-upload mr-2"></i>Choose Files
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={handleFileChange}
                  />
                </label>
                <span className="ml-3 text-sm text-gray-600">
                  {files.length > 0 ? `${files.length} file(s) selected` : 'No files chosen'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information (Link or Notes)
              </label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional information or links"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>
          </div>

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

export default Criteria7_1_7;
