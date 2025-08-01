import React, { useEffect, useState , useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LandingNavbar from "../../components/landing-navbar";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria1_3_2 = () => {
   const { sessions, availableSessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
   const [selectedSession, setSelectedSession] = useState("");
  // Loading and provisional score states for API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
   const [currentYear, setCurrentYear] = useState("");
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [averageScore, setAverageScore] = useState(null);

  const [formData, setFormData] = useState({
    names: "",
    code: "",
    coursename: "",
    coursecode: "",
    year: "",
    namestudents: "",
    supportLinks: [""],
  });

  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );

  const [yearCount, setYearCount] = useState(5);
  const navigate = useNavigate();

  // ✅ Fetch scores from backend on first load
  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0]);
      setCurrentYear(sessions[0]); // Default to most recent session
    }
  }, [sessions, selectedSession]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score132");
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
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...formData.supportLinks];
      updatedLinks[index] = value;
      setFormData({ ...formData, supportLinks: updatedLinks });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // ✅ Submit to backend via Axios
  const handleSubmit = async () => {
    const { names, code, coursename, coursecode, year, namestudents } = formData;

    if (names && code && coursename && coursecode && year && namestudents) {
      const session = selectedYear.split("-")[0]; // first year only

      try {
        await axios.post("http://localhost:3000/api/v1/criteria1/createResponse132", {
          session,
          year,
          program_name: names,
          program_code: code,
          course_name: coursename,
          course_code: coursecode,
          year_of_offering: year,
          student_name: namestudents,
        });

        const updatedYearData = {
          ...yearData,
          [selectedYear]: [...(yearData[selectedYear] || []), formData],
        };
        setYearData(updatedYearData);
        setFormData({
          names: "",
          code: "",
          coursename: "",
          coursecode: "",
          year: "",
          namestudents: "",
          supportLinks: [""],
        });
        alert("Submitted successfully.");
      } catch (err) {
        console.error("Submission error:", err);
        alert("Submission failed.");
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goToNextPage = () => navigate("/criteria1.3.3");
  const goToPreviousPage = () => navigate("/criteria1.3.1");

  const totalPrograms = pastFiveYears.reduce((acc, year) => acc + (yearData[year]?.length || 0), 0);
  const averagePrograms = (totalPrograms / pastFiveYears.length).toFixed(2);

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 1: Curricular Aspects</h2>
            <div className="text-sm">
              <span className="text-gray-600">1.3-Curriculum Enrichment</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">1.3.2 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Average percentage of courses that include experiential learning through project work/field work/internship
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <span className="font-semibold text-gray-700">Provisional Score:&nbsp;</span>
                {loading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : error ? (
                  <span className="text-red-500">Error: {error}</span>
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

          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Courses that include Experiential Learning</h2>
              <div className="size-7 mb-1">
                <label className="text-gray-700 font-medium mr-2 -ml-[330px]">Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded text-gray-950 mb-[200px]"
                >
                  {pastFiveYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Program Name</th>
                  <th className="border px-2 py-2">Program Code</th>
                  <th className="border px-2 py-2">Course Name</th>
                  <th className="border px-2 py-2">Course Code</th>
                  <th className="border px-2 py-2">Year of Offering</th>
                  <th className="border px-2 py-2">Student Name</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {["names", "code", "coursename", "coursecode", "year", "namestudents"].map((key) => (
                    <td key={key} className="border px-2 py-1">
                      <input
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder={key.replace(/([A-Z])/g, " $1")}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </td>
                  ))}
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
          </div>

          {/* Submitted rows */}
          {pastFiveYears.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-950 px-4 py-2">#</th>
                      <th className="border text-gray-950 px-4 py-2">Program Name</th>
                      <th className="border text-gray-950 px-4 py-2">Program Code</th>
                      <th className="border text-gray-950 px-4 py-2">Course Name</th>
                      <th className="border text-gray-950 px-4 py-2">Course Code</th>
                      <th className="border text-gray-950 px-4 py-2">Year of Offering</th>
                      <th className="border text-gray-950 px-4 py-2">Student Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{idx + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.names}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.code}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.coursename}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.coursecode}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.namestudents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}


          <div className="overflow-auto border rounded p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Calculation Table (Last 5 Years)
            </h2>
            <table className="table-auto border-collapse w-full">
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
                  <td className="border px-4 py-2 font-medium text-gray-600">Calculated Score</td>
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

export default Criteria1_3_2;
