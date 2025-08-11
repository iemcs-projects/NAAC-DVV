import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria3_3_4 = () => {
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [yearData, setYearData] = useState({});
  const [submittedData, setSubmittedData] = useState([]);
  
  // Generate past five years array
  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
  );

  const [formData, setFormData] = useState({
    names: "",
    org: "",
    name_sch: "",
    year: "",
    num: "",
    no_of_teacher: ""
  });

  const navigate = useNavigate();
  
  // Initialize available sessions and current year from session context
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      setCurrentYear(sessions[0]);
      setFormData(prev => ({
        ...prev,
        year: sessions[0].split('-')[0]  // Set initial year from session
      }));
    }
  }, [sessions]);

  // Fallback to past five years if no sessions available
  useEffect(() => {
    const yearToUse = availableSessions?.length > 0 ? availableSessions[0] : pastFiveYears[0];
    if (yearToUse && currentYear !== yearToUse) {
      setCurrentYear(yearToUse);
      setFormData(prev => ({
        ...prev,
        year: yearToUse.split('-')[0]
      }));
    }
  }, [availableSessions, pastFiveYears, currentYear]);

  useEffect(() => {
    if (!availableSessions?.length && pastFiveYears.length > 0) {
      setCurrentYear(pastFiveYears[0]);
      setFormData(prev => ({
        ...prev,
        year: pastFiveYears[0].split('-')[0]
      }));
    }
  }, [availableSessions, pastFiveYears]);

  // Fetch provisional score
  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score334");
      console.log('API Response:', response);
      
      if (response.data?.data) {
        console.log('Score data:', response.data.data);
        setProvisionalScore({
          data: {
            score_sub_sub_criteria: response.data.data.score_sub_sub_criteria || response.data.data.score_criteria,
            total_students: response.data.data.total_students,
            total_participants: response.data.data.total_participants,
            participation_percentage: response.data.data.participation_percentage
          },
          timestamp: response.data.data.computed_at || response.data.data.updated_at || new Date().toISOString()
        });
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

  // Update form data
  const handleChange = (field, value) => {
    if (field === 'year') {
      value = value.toString();
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const { names, org, name_sch, year, num, no_of_teacher } = formData;
    
    if (!validateYear(year)) {
      alert("Please enter a valid year between 2000 and " + new Date().getFullYear());
      return;
    }
    
    if (!names.trim() || !org.trim() || !name_sch.trim() || !year || !num.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Current Year:", currentYear);
    const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    
    try {
      const sessionYear = parseInt(currentYear.split('-')[0]);
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse334", {
        session: sessionYear,
        activity_name: names.trim(),
        activity_year: year,
        no_of_teacher: no_of_teacher ? parseInt(no_of_teacher) : 0,
        no_of_student: parseInt(num) || 0,
        scheme_name: name_sch.trim(),
      });

      const resp = response?.data?.data || {};
      const newEntry = {
        year: year,
        names: resp.activity_name || names.trim(),
        org: org.trim(), // Keep org as is since it's not used in backend
        name_sch: resp.scheme_name || name_sch.trim(),
        num: resp.no_of_student || parseInt(num) || 0,
        no_of_teacher: resp.no_of_teacher || parseInt(no_of_teacher) || 0,
      };

      // Update submitted data
      setSubmittedData((prev) => [...prev, newEntry]);
      
      // Update year data
      setYearData((prev) => ({
        ...prev,
        [newEntry.year]: [...(prev[newEntry.year] || []), {
          names: newEntry.names,
          org: newEntry.org,
          name_sch: newEntry.name_sch,
          num: newEntry.num,
          no_of_teacher: newEntry.no_of_teacher,
        }],
      }));

      // Reset form
      setFormData({
        names: "",
        org: "",
        name_sch: "",
        year: currentYear.split('-')[0],
        num: "",
        no_of_teacher: ""
      });
      
      // Fetch updated score
      await fetchScore();
      alert("Extension activity data submitted successfully!");
    } catch (error) {
      console.error("Error submitting activity data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit activity data");
    }
  };

  const goToNextPage = () => navigate("/criteria3.4.1");
  const goToPreviousPage = () => navigate("/criteria3.3.3");
  
  // Validate year input
  const validateYear = (year) => {
    if (!year) return false;
    const yearNum = parseInt(year, 10);
    return !isNaN(yearNum) && yearNum >= 2000 && yearNum <= new Date().getFullYear();
  };

  return (
    <div className="w-[1470px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 p-6">

          {/* Title */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 3: Research, Innovations and Extension</h2>
            <div className="text-sm text-gray-600">3.3 – Extension Activities</div>
          </div>

          {/* Provisional Score */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (3.3.4): {typeof provisionalScore.data.score_sub_sub_criteria === 'number'
                    ? provisionalScore.data.score_sub_sub_criteria.toFixed(2) + '%'
                    : provisionalScore.data.score_sub_sub_criteria}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                  </span>
                </p>
                {provisionalScore.data.participation_percentage !== undefined && (
                  <p className="mt-2 text-sm text-gray-700">
                    Participation: {typeof provisionalScore.data.participation_percentage === 'number'
                      ? provisionalScore.data.participation_percentage.toFixed(2) + '%'
                      : provisionalScore.data.participation_percentage}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">3.3.4 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Number of extension and outreach Programs conducted in collaboration with industry, community and Non-Government Organizations through NSS/NCC/Red Cross/YRC etc., year-wise during the last five years.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Reports of the event organized</li>
                <li>Any additional information</li>
              </ul>
            </div>
          </div>

          {/* Year Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  year: e.target.value.split('-')[0]
                }));
              }}
              className="px-3 py-1 border border-gray-300 rounded text-gray-950"
            >
              {availableSessions.length > 0 ? (
                availableSessions.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))
              ) : (
                pastFiveYears.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">
                  No. of teachers participated:
                </label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-gray-950"
                  placeholder="Enter count"
                  min="0"
                  value={formData.no_of_teacher}
                  onChange={(e) => handleChange("no_of_teacher", e.target.value)}
                />
              </div>
            </div>


          {/* Input Section */}
          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Extension and Outreach Programs</h2>
              <div className="flex items-center">
                <label className="mr-2 font-medium">Current Year: {currentYear}</label>
              </div>
            </div>

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Year</th>
                  <th className="border px-2 py-2">Name of the activity</th>
                  <th className="border px-2 py-2">Organising unit/ agency/ collaborating agency</th>
                  <th className="border px-2 py-2">Name of the scheme</th>
                  <th className="border px-2 py-2">Number of students participated</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1 bg-gray-100"
                      value={formData.year}
                      readOnly
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.names}
                      onChange={(e) => handleChange("names", e.target.value)}
                      placeholder="Activity Name"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.org}
                      onChange={(e) => handleChange("org", e.target.value)}
                      placeholder="Organising Agency"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.name_sch}
                      onChange={(e) => handleChange("name_sch", e.target.value)}
                      placeholder="Scheme Name"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.num}
                      onChange={(e) => handleChange("num", e.target.value)}
                      placeholder="No. of Students"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={handleSubmit}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Year-wise Data Display */}
          {(availableSessions.length > 0 ? availableSessions : pastFiveYears).map((yr) => (
            <div key={yr} className="mb-6 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 px-4 py-2 text-black">Year: {yr}</h3>
              {yearData[yr.split('-')[0]]?.length ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-950 px-4 py-2">#</th>
                      <th className="border text-gray-950 px-4 py-2">Activity</th>
                      <th className="border text-gray-950 px-4 py-2">Agency</th>
                      <th className="border text-gray-950 px-4 py-2">Scheme</th>
                      <th className="border text-gray-950 px-4 py-2">Participants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[yr.split('-')[0]].map((entry, index) => (
                      <tr key={`${yr}-${index}`} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.names}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.org}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.name_sch}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.num}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Footer Navigation */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_3_4;