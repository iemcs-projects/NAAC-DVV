import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LandingNavbar from "../../components/landing-navbar";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria2_4_3 = () => {
  const { sessions, isLoading: sessionsLoading, error: sessionsError } = useContext(SessionContext);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState({
    score: null,
    message: "",
    yearly_data: [],
    score_entry: null
  });

  const navigate = useNavigate();
  const goToNextPage = () => navigate("/criteria2.5.1");
  const goToPreviousPage = () => navigate("/criteria2.4.2");

  // Initialize currentYear when sessions load
  useEffect(() => {
    if (sessions && sessions.length > 0 && !currentYear) {
      setCurrentYear(sessions[0]);
    }
  }, [sessions]);

  // Fetch score data when currentYear changes
  useEffect(() => {
    async function fetchScoreData() {
      if (!currentYear) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/criteria2/score243`);
        const data = response.data.data;
        
        setScoreData({
          score: data?.score_entry?.score_sub_sub_criteria || "N/A",
          message: response.data.message,
          yearly_data: data?.yearly_data || [],
          average_ratio: data?.average_ratio,
          score_entry: data?.score_entry
        });
      } catch (err) {
        console.error("Error fetching score data:", err);
        setError("Failed to fetch score data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchScoreData();
  }, [currentYear]);

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden text-black">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            2.4.3 Average teaching experience of full-time teachers in the same institution
          </h2>

          {/* Metric Info */}
          <div className="bg-white p-4 rounded shadow mb-6 text-sm leading-relaxed">
            <p className="text-blue-900 font-semibold mb-2">2.4.3 Metric Information</p>
            <p className="text-black mb-1">
              Average teaching experience of full time teachers in the same institution
              (Data for the latest completed academic year in number of years)
            </p>
            <p className="text-blue-900 font-semibold mb-1">
              Data Requirement for last five years (As per Data Template)
            </p>
            <ul className="list-disc ml-6 text-black">
              <li>
                Name and Number of full time teachers with years of teaching experiences
              </li>
            </ul>
          </div>

          {/* Session Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-800 mr-2">Select Session:</label>
            {sessionsLoading ? (
              <span>Loading sessions...</span>
            ) : sessionsError ? (
              <span className="text-red-500">{sessionsError}</span>
            ) : (
              <select
                className="border px-3 py-1 rounded text-gray-900"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
              >
                {sessions?.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Info Message */}
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-900 p-3 rounded mb-6 text-sm">
            This section displays the calculated score based on data from <strong>2.4.1</strong>.
            The score is automatically calculated based on the average teaching experience of full-time teachers.
          </div>

          {/* Score Display Section */}
          <div className="mt-10 border-t pt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Score Information
            </h3>
            
            {/* Score Display */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              {loading ? (
                <p className="text-gray-600">Loading provisional score...</p>
              ) : scoreData?.score !== undefined ? (
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (2.4.3): {scoreData.score} %
                </p>
              ) : (
                <p className="text-gray-600">No score data available.</p>
              )}
            </div>

            {scoreData.yearly_data.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Yearly Data:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-3 py-2 text-left">Year</th>
                        <th className="border px-3 py-2 text-left">Total Experience (years)</th>
                        <th className="border px-3 py-2 text-left">Teacher Count</th>
                        <th className="border px-3 py-2 text-left">Average Experience</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreData.yearly_data.map((yearData, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border px-3 py-2">{yearData.year}</td>
                          <td className="border px-3 py-2">{yearData.total_experience}</td>
                          <td className="border px-3 py-2">{yearData.teacher_count}</td>
                          <td className="border px-3 py-2">
                            {yearData.average_experience !== null && yearData.average_experience !== undefined 
                              ? yearData.average_experience.toFixed(2) 
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

export default Criteria2_4_3;
