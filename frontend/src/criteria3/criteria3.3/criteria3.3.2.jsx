import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { useContext } from "react";

const Criteria3_3_2 = () => {
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [currentYear, setCurrentYear] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const [formData, setFormData] = useState({
    session: "",
    activity_name: "",
    awarding_body: "",
    year: "",
    supportLinks: []
  });
  const [availableSessions, setAvailableSessions] = useState([]);
  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]); // Default to most recent session
    }
  }, [availableSessions]);

  const navigate = useNavigate();
  const { sessions, isLoading: sessionLoading } = useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!sessionLoading && sessions?.length > 0) {
      setAvailableSessions(sessions);
      setSelectedYear(sessions[0]);
    }
  }, [sessionLoading, sessions]);  
  const [provisionalScore, setProvisionalScore] = useState(null);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score332");
      console.log('API Response:', response);
      
      // Check if response has data and the expected score property
      if (response.data && response.data.data && response.data.data.entry) {
        console.log('Score data:', response.data.data.entry);
        setProvisionalScore(response.data.data.entry);
      } else {
        console.log('No score data found in response');
        setProvisionalScore(null);
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
      setProvisionalScore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);


 
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const activity_name = formData.activity_name.trim();
    const awarding_body = formData.awarding_body.trim();
    const sessionFull = currentYear;
    const year = sessionFull.split("-")[0];
    const session = sessionFull.split("-")[0];

    if (!activity_name || !awarding_body || !year) {
      alert("Please fill in all required fields: Activity Name, Awarding Body, and Year");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse332", {
        session: parseInt(session),
        activity_name,
        awarding_body,
        year
      });

      const resp = response?.data?.data || {};
      const newEntry = {
        activity_name: resp.activity_name || activity_name,
        awarding_body: resp.awarding_body || awarding_body,
        year_of_award: resp.year_of_award || year
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      setYearData((prev) => ({
        ...prev,
        [newEntry.year_of_award]: [...(prev[newEntry.year_of_award] || []), {
          activity_name: newEntry.activity_name,
          awarding_body: newEntry.awarding_body,
          year_of_award: newEntry.year_of_award
        }],
      }));

      setFormData({ 
        activity_name: "",
        awarding_body: "",
        year: ""
      });
      fetchScore();
      alert("Award data submitted successfully!");
    } catch (error) {
      console.error("Error submitting award data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit award data");
    }
  };

  const goToNextPage = () => navigate("/criteria3.3.3");
  const goToPreviousPage = () => navigate("/criteria3.3.1");

  return (
    <div className="w-[1690px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 3: Research, Innovation and Extension</h2>
            <div className="text-sm">
              <span className="text-gray-600">3.3 – Student Support</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">3.3.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Total number of awards and recognition received for extension activities from Government/ government recognised bodies year-wise during the last five years.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Upload self-attested letter with the list of students sanctioned scholarship</li>
                <li>Total number of awards/recognitions received from Government bodies during the last five years</li>
              </ul>
            </div>
          </div>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.3.2): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
                  ? (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria).toFixed(2)
                  : (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria)} %
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                </span>
              </p>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Awards and Recognitions Received</h2>
              <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
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
                  <th className="border px-4 py-2">Name of the activity</th>
                  <th className="border px-4 py-2">Award/ Recognition</th>
                  <th className="border px-4 py-2">Awarding Government/ Body</th>
                  <th className="border px-4 py-2">Year of award</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {["names", "name_award", "name_gov", "year"].map((key) => (
                    <td key={key} className="border px-2 py-1">
                      <input
                        className="w-full border border-black rounded px-2 py-1 text-gray-950"
                        placeholder={key.replace(/_/g, " ")}
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

          <div className="flex flex-col gap-2">
  {(formData.supportLinks || []).map((link, index) => (
    <input
      key={index}
      type="url"
      placeholder={`Enter document link ${index + 1}`}
      className="px-3 py-1 border border-gray-300 rounded text-gray-950"
      value={link}
      onChange={(e) => handleChange("supportLinks", e.target.value, index)}
    />
  ))}
  <button
    type="button"
    onClick={() => setFormData(prev => ({
      ...prev,
      supportLinks: [...(prev.supportLinks || []), ""]
    }))}
    className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
  >
    + Add Another Link
  </button>
</div>

          {pastFiveYears.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-4 py-2">Name of the activity</th>
                      <th className="border px-4 py-2">Award/ Recognition</th>
                      <th className="border px-4 py-2">Awarding Government/ Body</th>
                      <th className="border px-4 py-2">Year of award</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border px-2 py-1 text-gray-950">{entry.names}</td>
                        <td className="border px-2 py-1 text-gray-950">{entry.name_award}</td>
                        <td className="border px-2 py-1 text-gray-950">{entry.name_gov}</td>
                        <td className="border px-2 py-1 text-gray-950">{entry.year}</td>
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
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Calculation Table (Last 5 Years)</h2>
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

export default Criteria3_3_2;