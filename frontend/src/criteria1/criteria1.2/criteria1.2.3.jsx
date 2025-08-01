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

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <span className="font-semibold text-gray-700">Provisional Score:&nbsp;</span>
                {scoreLoading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : scoreError ? (
                  <span className="text-red-500">Error: {scoreError}</span>
                ) : provisionalScore ? (
                  <div className="text-center">
                    <div className="text-blue-600 text-lg font-bold">
                      Score: {provisionalScore.data?.score || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Score not available</span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
            <p className="font-semibold">
              Fill in the inputs in 2.4.1 to get the corresponding results.
            </p>
          </div>

          {/* Data entry
          <div className="border rounded mb-8">
            <div className="flex items-center justify-between bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">
                Add On Programs
              </h2>
              <div>
                <label className="text-gray-700 font-medium mr-2">Select Year:</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded text-gray-950"
                >
                  {(sessions?.length ? sessions : fallbackYears).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Program Name</th>
                  <th className="border px-2 py-2">Program Code</th>
                  <th className="border px-2 py-2">Year of Offering</th>
                  <th className="border px-2 py-2">Times Offered</th>
                  <th className="border px-2 py-2">Duration</th>
                  <th className="border px-2 py-2">Students Enrolled</th>
                  <th className="border px-2 py-2">Students Completed</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Program Name"
                      value={formData.program_name}
                      onChange={(e) => handleChange("program_name", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Program Code"
                      value={formData.course_code}
                      onChange={(e) => handleChange("course_code", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Year of Offering"
                      value={formData.year_of_offering}
                      onChange={(e) => handleChange("year_of_offering", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Times Offered"
                      value={formData.no_of_times_offered}
                      onChange={(e) => handleChange("no_of_times_offered", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Duration"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Students Enrolled"
                      value={formData.no_of_students_enrolled}
                      onChange={(e) => handleChange("no_of_students_enrolled", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Students Completed"
                      value={formData.no_of_students_completed}
                      onChange={(e) => handleChange("no_of_students_completed", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="!bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={handleSubmit}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div> */}

          {/* Submitted rows
          {(sessions?.length ? sessions : Object.keys(yearData)).map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-950 px-4 py-2">#</th>
                      <th className="border text-gray-950 px-4 py-2">Program Name</th>
                      <th className="border text-gray-950 px-4 py-2">Code</th>
                      <th className="border text-gray-950 px-4 py-2">Year</th>
                      <th className="border text-gray-950 px-4 py-2">Times</th>
                      <th className="border text-gray-950 px-4 py-2">Duration</th>
                      <th className="border text-gray-950 px-4 py-2">Students Enrolled</th>
                      <th className="border text-gray-950 px-4 py-2">Students Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.program_name}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.course_code}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year_of_offering}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.no_of_times_offered}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.duration}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.no_of_students_enrolled}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.no_of_students_completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))} */}

          {/* Calculation Table */}
          <div className="overflow-auto border rounded p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Calculation Table (Last 5 Years)
            </h2>
            <table className="table-auto border-collapse w-full ">
              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold">
                  <th className="border px-4 py-2">Year</th>
                  {Object.keys(yearScores).map((year) => (
                    <th key={year} className="border px-4 py-2">{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-medium text-gray-600">
                    Calculated Score
                  </td>
                  {Object.keys(yearScores).map((year) => (
                    <td key={year} className="border px-4 py-2 text-center border-black text-gray-950">
                      <input
                        type="number"
                        value={yearScores[year]}
                        onChange={(e) =>
                          setYearScores({ ...yearScores, [year]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 text-center border px-1 rounded"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-medium text-gray-700">
                Enter number of years for average:
              </label>
              <input
                type="number"
                value={yearCount}
                min={1}
                max={5}
                onChange={(e) => setYearCount(parseInt(e.target.value) || 1)}
                className="w-20 border px-2 py-1 rounded text-center text-gray-950"
              />
              <button
                className="ml-4 px-4 py-2 !bg-blue-600 text-white rounded hover:bg-green-700"
                onClick={() => {
                  const values = Object.values(yearScores).slice(0, yearCount);
                  const sum = values.reduce((acc, val) => acc + val, 0);
                  setAverageScore((sum / yearCount).toFixed(2));
                }}
              >
                Calculate Average
              </button>
            </div>
            {averageScore !== null && (
              <div className="mt-4 text-blue-700 font-semibold">
                Average Score for last {yearCount} year(s): {averageScore}%
              </div>
            )}
          </div>

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria1_2_3;
