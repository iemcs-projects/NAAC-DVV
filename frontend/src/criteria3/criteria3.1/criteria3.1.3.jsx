import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria3_1_3 = () => {
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
  );

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [submittedData, setSubmittedData] = useState([]);

  const [formData, setFormData] = useState({
    year: currentYear ? currentYear.split('-')[0] : "",
    workshop_name: "",
    participants: "",
    date_from: "",
    date_to: "",
    supportLinks: []
  });
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      setCurrentYear(sessions[0]);
      setSelectedYear(sessions[0]);
      setFormData(prev => ({
        ...prev,
        year: sessions[0].split('-')[0]
      }));
    }
  }, [sessions]);

  useEffect(() => {
    const yearToUse = availableSessions?.length > 0 ? availableSessions[0] : pastFiveYears[0];
    if (yearToUse && currentYear !== yearToUse) {
      setCurrentYear(yearToUse);
      setSelectedYear(yearToUse);
      setFormData(prev => ({
        ...prev,
        year: yearToUse.split('-')[0]
      }));
    }
  }, [availableSessions, pastFiveYears, currentYear]);

  useEffect(() => {
    if (!availableSessions?.length && pastFiveYears.length > 0) {
      setCurrentYear(pastFiveYears[0]);
      setSelectedYear(pastFiveYears[0]);
      setFormData(prev => ({
        ...prev,
        year: pastFiveYears[0].split('-')[0]
      }));
    }
  }, [availableSessions, pastFiveYears]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score313");
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

  const navigate = useNavigate();

  const handleChange = (field, value, index) => {
    if (field === 'supportLinks') {
      const newSupportLinks = [...formData.supportLinks];
      newSupportLinks[index] = value;
      setFormData(prev => ({ ...prev, supportLinks: newSupportLinks }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };
  console.log(formData);

  const handleSubmit = async () => {
    const workshop_name = formData.workshop_name.trim();
    const participants = formData.participants.trim();
    const date_from = formData.date_from.trim();
    const date_to = formData.date_to.trim();
    console.log("Current Year:", currentYear); // Add this line
    const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    const year = sessionFull.split("-")[0]; 
    console.log("Session:", year); // This is already correct
  
    if (!workshop_name || !participants || !date_from || !date_to) {
      alert("Please fill in all required fields: Workshop Name, Participants, Date From, and Date To");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse313", {
        session: parseInt(session),
        year: year,  // Make sure this is included in the request
        workshop_name,
        participants: parseInt(participants),
        date_from,
        date_to,
      });

      const resp = response?.data?.data || {};
      const newEntry = {
        year: resp.year || year,
        workshop_name: resp.workshop_name || workshop_name,
        participants: resp.participants || participants,
        date_from: resp.date_from || date_from,
        date_to: resp.date_to || date_to,
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      setYearData((prev) => ({
        ...prev,
        [newEntry.year]: [...(prev[newEntry.year] || []), {
          workshop_name: newEntry.workshop_name,
          participants: newEntry.participants,
          date_from: newEntry.date_from,
          date_to: newEntry.date_to,
        }],
      }));

      // Add the new entry to submittedData
      setSubmittedData(prevData => [...prevData, newEntry]);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        workshop_name: "",
        participants: "",
        date_from: "",
        date_to: ""
      }));
      
      // Fetch updated score
      await fetchScore();
      alert("Workshop data submitted successfully!");
    } catch (error) {
      console.error("Error submitting workshop data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit workshop data");
    }
  };
// Replace these two useEffects with this single one:

  

  const goToNextPage = () => navigate("/criteria3.2.1");
  const goToPreviousPage = () => navigate("/criteria3.1.2");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-black">
              Criteria 3 - Research, Innovations and Extension
            </h2>
            <span className="text-sm text-black">
              3.1 – Resource Mobilization for Research
            </span>
          </div>

          {/* Provisional Score */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.1.3): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
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

          {/* Metric Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">3.1.3 Metric Information</h3>
            <p className="text-gray-700">
              Number of seminars/conferences/workshops conducted by the institution during the last five years
            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Report of the event</li>
              <li>Any additional information</li>
              <li>List of workshops/seminars during last 5 years (Data Template)</li>
            </ul>
          </div>

          {/* Year Selector */}
         
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
  value={currentYear}
  onChange={(e) => {
    setCurrentYear(e.target.value);
    setSelectedYear(e.target.value);
  }}
  className="px-3 py-1 border border-gray-300 rounded text-gray-950"
>
  {availableSessions.map((session) => (
    <option key={session} value={session}>
      {session}
    </option>
  ))}
</select>
          </div>

          {/* Form Input */}
          <div className="overflow-auto border rounded mb-6">
            <table className="min-w-full border text-black text-sm">
              <thead className="bg-gray-100 font-semibold">
                <tr>
                  <th className="border px-2">Year</th>
                  <th className="border px-2">Name of Seminar/Workshop/Conference</th>
                  <th className="border px-2">Number of Participants</th>
                  <th className="border px-2">Date From (YYYY)</th>
                  <th className="border px-2">Date To (YYYY)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2">
                    <input
                      type="text"
                      value={formData.year}
                      readOnly
                      className="w-full border px-2 py-1 bg-gray-100"
                    />
                  </td>
                  {['workshop_name', 'participants', 'date_from', 'date_to'].map((key) => (
                    <td key={key} className="border px-2">
                      <input
                        type={key.includes('date') ? 'number' : 'text'}
                        placeholder={key.includes('date') ? 'YYYY' : ''}
                        min={key === 'date_from' || key === 'date_to' ? '1900' : undefined}
                        max={new Date().getFullYear()}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full border px-2 py-1 text-black"
                      />
                    </td>
                  ))}
                  <td className="border px-2">
                    <button
                      onClick={handleSubmit}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-full"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
            Link to Activity Report:
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
                className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          {/* Year-wise Data */}
          {pastFiveYears.map((yr) => (
            <div key={yr} className="mb-6 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 px-4 py-2 text-black">Year: {yr}</h3>
              {yearData[yr]?.length ? (
                <table className="min-w-full border text-black text-sm">
                  <thead className="bg-gray-100 font-semibold">
                    <tr>
                      <th className="border px-2 py-1 text-center">#</th>
                      {Object.keys(formData).map((key) => (
                        <th key={key} className="border px-2 py-1 text-center capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[yr].map((entry, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        <td className="border px-2 py-1 text-center">{idx + 1}</td>
                        {Object.values(entry).map((val, i) => (
                          <td key={i} className="border px-2 py-1">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-black px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Calculation Table */}
          <div className="overflow-auto border rounded p-4">
            <h2 className="text-lg font-semibold mb-2 text-black">
              Calculation Table (Last 5 Years)
            </h2>
            <table className="table-auto border-collapse w-full text-black">
              <thead>
                <tr className="bg-gray-100 font-semibold">
                  <th className="border px-4 py-2">Year</th>
                  {pastFiveYears.map((yr) => (
                    <th key={yr} className="border px-4 py-2">{yr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-medium text-black">Calculated Score</td>
                  {pastFiveYears.map((yr) => (
                    <td key={yr} className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        value={yearScores[yr]}
                        onChange={(e) =>
                          setYearScores({ ...yearScores, [yr]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 rounded border px-1 text-center text-black"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-medium text-black">
                Enter number of years for average:
              </label>
              <input
                type="number"
                value={yearCount}
                min={1}
                max={5}
                onChange={(e) => setYearCount(parseInt(e.target.value) || 1)}
                className="w-20 border px-2 py-1 rounded text-center text-black"
              />
              <button
                onClick={() => {
                  const vals = Object.values(yearScores).slice(0, yearCount);
                  const sum = vals.reduce((acc, v) => acc + v, 0);
                  setAverageScore((sum / yearCount).toFixed(2));
                }}
                className="ml-4 bg-blue-600 px-4 py-2 text-white rounded hover:bg-green-700"
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

          {/* Navigation */}
          <div className="bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onPrevious={goToPreviousPage} onNext={goToNextPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_1_3;

