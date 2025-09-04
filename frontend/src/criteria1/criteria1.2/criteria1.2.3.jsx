import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LandingNavbar from "../../components/landing-navbar";  
import { SessionContext } from "../../contextprovider/sessioncontext";

// Fallback static list if SessionContext not loaded
const fallbackYears = ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];

const Criteria1_2_3 = () => {
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
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 1: Curricular Aspects</h2>
            <div className="text-sm">
              <span className="text-gray-600">1.2-Academic Flexibility</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
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
