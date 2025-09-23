import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";
import { SessionContext } from "../../contextprovider/sessioncontext";

// Fallback static list if SessionContext not loaded
const fallbackYears = ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];

const Criteria1_2_3 = () => {
  const { user } = useAuth();
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [selectedSession, setSelectedSession] = useState("");

  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    program_name: "",
    course_code: "",
    year_of_offering: "",
    no_of_times_offered: "",
    duration: "",
    no_of_students_enrolled: "",
    no_of_students_completed: "",
  });

  const [currentYear, setCurrentYear] = useState("");
  const [yearCount, setYearCount] = useState(5);
  const [yearScores, setYearScores] = useState({
    "2024-25": 0,
    "2023-24": 0,
    "2022-23": 0,
    "2021-22": 0,
    "2020-21": 0,
  });
  const [averageScore, setAverageScore] = useState(null);

  const [score, setScore] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigate = useNavigate();

  // Fetch score from backend on mount and after successful submit
  // Default to most recent session once sessions load
  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0]);
      setCurrentYear(sessions[0]);
    }
  }, [sessions, selectedSession]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setScoreLoading(true);
    setScoreError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score123");
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      setProvisionalScore(response.data);
      console.log('provisionalScore after set:', provisionalScore);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setScoreError(error.message || "Failed to fetch score");
    } finally {
      setScoreLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const {
      program_name,
      course_code,
      year_of_offering,
      no_of_times_offered,
      duration,
      no_of_students_enrolled,
      no_of_students_completed,
    } = formData;

    // Validate
    if (
      formData.program_name &&
      formData.course_code &&
      formData.year_of_offering &&
      formData.no_of_times_offered &&
      formData.duration &&
      formData.no_of_students_enrolled &&
      no_of_students_completed
    ) {
      try {
        // Get first year from session string, eg "2023-24" => "2023"
        const session = selectedSession.split("-")[0] || selectedSession;

        const payload = {
          session: session,
          program_name: formData.program_name,
          course_code: formData.course_code,
          year_of_offering: formData.year_of_offering,
          no_of_times_offered: formData.no_of_times_offered,
          duration: formData.duration,
          no_of_students_enrolled,
          no_of_students_completed,
          supportLinks: formData.supportLinks,
        };

        const response= await axios.post("http://localhost:3000/api/v1/criteria1/createResponse122_123", payload);
        console.log(response);

        // Update frontend table
        const updatedYearData = {
          ...yearData,
          [selectedSession]: [...(yearData[selectedSession] || []), payload],
        }; 
        setYearData(updatedYearData);
        setFormData({
          program_name: "",
          course_code: "",
          year_of_offering: "",
          no_of_times_offered: "",
          duration: "",
          no_of_students_enrolled: "",
          no_of_students_completed: "",
        });

        alert("Data submitted successfully!");
        fetchScore();
      } catch (err) {
        alert("Submission failed. " + (err?.response?.data?.message || err.message));
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goToNextPage = () => {
    navigate("/criteria1.3.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.2.2");
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
              <p className="text-2xl font-bold text-gray-800">Criteria 1-Curricular Planning and Implementation</p>
              <p className="text-gray-600 text-sm">1.2 Academic Flexibility</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>
          {/* Score display */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div>
              <h3 className="text-blue-600 font-medium mb-2">
                1.2.3 Metric Information
              </h3>
              
              <p className="text-sm text-gray-700">
                Average percentage of students enrolled in Certificate/Add-on programs as against the total number of students during the last five years
              </p>
            </div>
            
            <div className="mb-6 mt-4">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Details of the students enrolled in Subjects related to certificate/Add-on programs </li>
              </ul>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {averageScore !== null ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Average Score: {averageScore}%
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Please enter scores and calculate the average.</p>
            )}
          </div>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-900 p-3 rounded mb-6 text-sm">
            This section displays the calculated score based on data from <strong>1.2.2</strong>.
            The score is automatically calculated based on the average teaching experience of full-time teachers.
          </div>


        

          {/* Calculation Table */}

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
   
  );
};

export default Criteria1_2_3;
