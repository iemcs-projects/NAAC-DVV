import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria4_4_1 = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const navigate = useNavigate();
   const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
    const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
    const [currentYear, setCurrentYear] = useState(pastFiveYears[0]);
    const [provisionalScore, setProvisionalScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submittedData, setSubmittedData] = useState([]);
    const { sessions: availableSessions } = useContext(SessionContext);

  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    year: "",
    budget: "",
    expen: "",
    total: "",
    academic: "",
    physical: "",
    supportLinks: [""],
  });
  
  const [yearScores, setYearScores] = useState({});
  const [yearCount, setYearCount] = useState(1);
  const [averageScore, setAverageScore] = useState(null);

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...formData.supportLinks];
      updatedLinks[index] = value;
      setFormData({ ...formData, supportLinks: updatedLinks });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const fetchScore = async () => {
    console.log('fetchScore called for criteria 4.4.1');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria4/score441");
      console.log("Fetched score data:", response.data);
      
      if (response.data && response.data.data) {
        const scoreData = response.data.data;
        
        // Format the scores with proper defaults
        const parsedScore = {
          score_sub_sub_criteria: parseFloat(scoreData.score_sub_sub_criteria) || 0,
          score_sub_criteria: parseFloat(scoreData.score_sub_criteria) || 0,
          score_criteria: parseFloat(scoreData.score_criteria) || 0,
          grade: scoreData.sub_sub_cr_grade || 'N/A'
        };
    
        setProvisionalScore({
          score: parsedScore,
          message: response.data.message || "Score loaded successfully"
        });
      } else {
        // Initialize with default values if no data
        setProvisionalScore({
          score: {
            score_sub_sub_criteria: 0,
            score_sub_criteria: 0,
            score_criteria: 0,
            grade: 'N/A'
          },
          message: "No score data available"
        });
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch provisional score");
      
      // Set default values on error
      setProvisionalScore({
        score: {
          score_sub_sub_criteria: 0,
          score_sub_criteria: 0,
          score_criteria: 0,
          grade: 'N/A'
        },
        message: "Error loading score"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);
  

    useEffect(() => {
      if (availableSessions && availableSessions.length > 0) {
        setCurrentYear(availableSessions[0]);
        setSelectedYear(availableSessions[0]);
      }
    }, [availableSessions]);


  const goToNextPage = () => navigate("/criteria4.4.2");
  const goToPreviousPage = () => navigate("/criteria4.3.3");

  const totalEntries = entries.length;

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
              <p className="text-2xl font-bold text-gray-800">Criteria 4 - Infrastructure and Learning Resources</p>
              <p className="text-gray-600 text-sm">4.4 Infrastructure</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>



          {/* --- Metric Info --- */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">4.4.1 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Average percentage of expenditure incurred on maintenance of
infrastructure (physical and academic support facilities) excluding
salary component during the last five years(INR in Lakhs)
            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>Non salary expenditure incurred </li>
              <li>Expenditure incurred on maintenance of campus infrastructure</li>
            </ul>
          </div>

          <div className="bg-white text-black p-4 border border-green-300 rounded shadow">
            <h3 className="text-green-700 text-lg font-semibold mb-2">
              Maintenance Expenditure Score:
            </h3>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              {loading ? (
                <p className="text-gray-600">Loading provisional score...</p>
              ) : provisionalScore?.score?.score_sub_sub_criteria > 0 ? (
                <div>
                  <p className="text-lg font-semibold text-green-800">
                    Provisional Score (4.4.1): {provisionalScore.score.score_sub_sub_criteria.toFixed(2)} %
                  </p>
                  <p className="text-sm text-gray-600">
                    Sub-criteria Score: {provisionalScore.score.score_sub_criteria.toFixed(2)} %
                  </p>
                  <p className="text-sm text-gray-600">
                    Overall Criteria Score: {provisionalScore.score.score_criteria.toFixed(2)} %
                  </p>
                  <p className="text-sm text-gray-600">
                    Grade: {provisionalScore.score.grade}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">No score data available.</p>
              )}
            </div>
          </div>


          {/* --- Year Selection & Entry Table --- */}
          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Average percentage of expenditure incurred on maintenance of
infrastructure (physical and academic support facilities) excluding
salary component (INR in Lakhs)</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="mb-4">
                <label className="font-medium text-gray-700 mr-2">Select Year:</label>
                <select
                  className="border px-3 py-1 rounded text-black"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                >
                  {availableSessions && availableSessions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              </div>

            {/* Input Row
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Year</th>
                  <th className="border px-2 py-2">Budget</th>
                  <th className="border px-2 py-2">Expenditure</th>
                  <th className="border px-2 py-2">Total</th>
                  <th className="border px-2 py-2">Academic</th>
                  <th className="border px-2 py-2">Physical</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-center"
                      placeholder="e.g., 2023-24"
                    />
                  </td>
                  {["budget", "expen", "total", "academic", "physical"].map((key) => (
                    <td key={key} className="border px-2 py-1">
                      <input
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="!bg-blue-600 text-white px-3 py-1 rounded hover:!bg-blue-700"
                      onClick={handleSubmit}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table> */}
          </div>

          {/* Support Links */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Links to relevant documents:
            </label>
            <div className="flex flex-col gap-2">
              {formData.supportLinks.map((link, index) => (
                <input
                  key={index}
                  type="url"
                  placeholder={`Enter support link ${index + 1}`}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-950"
                  value={link}
                  onChange={(e) => handleChange("supportLinks", e.target.value, index)}
                />
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, supportLinks: [...formData.supportLinks, ""] })}
                className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:!bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          {/* Display Entries */}
          {entries.length > 0 && (
            <div className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Entered Data</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border text-gray-900 px-2 py-1">#</th>
                    <th className="border text-gray-900 px-2 py-1">Year</th>
                    <th className="border text-gray-900 px-2 py-1">Budget</th>
                    <th className="border text-gray-900 px-2 py-1">Expenditure</th>
                    <th className="border text-gray-900 px-2 py-1">Total</th>
                    <th className="border text-gray-900 px-2 py-1">Academic</th>
                    <th className="border text-gray-900 px-2 py-1">Physical</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx} className="even:bg-gray-50">
                      <td className="border text-gray-900 border-black px-2 py-1">{idx + 1}</td>
                      <td className="border text-gray-900 border-black px-2 py-1">{entry.year}</td>
                      <td className="border text-gray-900 border-black px-2 py-1">{entry.budget}</td>
                      <td className="border text-gray-900 border-black px-2 py-1">{entry.expen}</td>
                      <td className="border text-gray-900 border-black px-2 py-1">{entry.total}</td>
                      <td className="border text-gray-900 border-black px-2 py-1">{entry.academic}</td>
                      <td className="border text-gray-900 border-black px-2 py-1">{entry.physical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Average Calculator */}
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
                    <td key={year} className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        value={yearScores[year]}
                        onChange={(e) =>
                          setYearScores({ ...yearScores, [year]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 text-center border px-1 rounded text-gray-950"
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
                className="ml-4 px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-green-700"
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

          {/* Navigation Footer */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_4_1;