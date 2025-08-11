import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria3_3_3 = () => {
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
  const [provisionalScore, setProvisionalScore] = useState(null);

  const [formData, setFormData] = useState({
    year: currentYear ? currentYear.split('-')[0] : "",
    activity_name: "",
    collaborating_agency: "",
    scheme_name: "",
    student_count: "",
    supportLinks: []

  });

  useEffect(() => {
    if (currentYear) {
      setFormData(prev => ({
        ...prev,
        year: currentYear.split('-')[0]
      }));
    }
  }, [currentYear]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score333");
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

  const handleChange = (field, value, index = null) => {
    if (field === 'supportLinks') {
      const updated = [...formData.supportLinks];
      updated[index] = value;
      setFormData(prev => ({ ...prev, supportLinks: updated }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    const { activity_name, collaborating_agency, scheme_name, student_count, year } = formData;
    const session = currentYear.split("-")[0];

    if (!activity_name || !collaborating_agency || !scheme_name || !student_count || !year) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse333", {
        session: parseInt(session),
        activity_name,
        collaborating_agency,
        scheme_name,
        year,
        student_count: parseInt(student_count),
    
      });

      const resp = response?.data?.data || {};
      const newEntry = {
        activity_name: resp.activity_name || activity_name,
        collaborating_agency: resp.collaborating_agency || collaborating_agency,
        scheme_name: resp.scheme_name || scheme_name,
        year: resp.year || year,
        student_count: resp.student_count || student_count,
 
      };

      setYearData(prev => ({
        ...prev,
        [newEntry.year]: [...(prev[newEntry.year] || []), newEntry]
      }));

      setFormData(prev => ({
        ...prev,
        activity_name: "",
        collaborating_agency: "",
        scheme_name: "",
        student_count: "",
      
      }));

      await fetchScore();
      alert("Data submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Submission failed.");
    }
  };

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      setCurrentYear(sessions[0]);
    }
  }, [sessions]);

  const goToNextPage = () => navigate("/criteria3.3.4");
  const goToPreviousPage = () => navigate("/criteria3.3.2");

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
              3.3.3 – Extension Activities
            </span>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.3.3): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
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
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">3.3.3 Metric Information</h3>
            <p className="text-gray-700">
              Number of extension and outreach Programs conducted in collaboration with industry, community and NGOs through NSS/NCC/Red Cross/YRC, etc., during the last five years.
            </p>
          </div>

          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              disabled={sessionLoading || !availableSessions.length}
            >
              {sessionLoading ? (
                <option>Loading sessions...</option>
              ) : sessionError ? (
                <option>Error loading sessions</option>
              ) : (
                availableSessions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))
              )}
            </select>
          </div>

          <div className="overflow-auto border rounded mb-6">
            <table className="min-w-full border text-black text-sm">
              <thead className="bg-gray-100 font-semibold">
                <tr>
                  <th className="border px-2">Activity</th>
                  <th className="border px-2">Agency</th>
                  <th className="border px-2">Scheme</th>
                  <th className="border px-2">Year</th>
                  <th className="border px-2">Participants</th>
                  <th className="border px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                 { ["activity_name", "collaborating_agency", "scheme_name", "year", "student_count"].map((key) => (
                    <td key={key} className="border px-2">
                      <input
                        type={key === "student_count" ? "number" : "text"}
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
              Support Document Links:
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
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          {pastFiveYears.map((yr) => (
            <div key={yr} className="mb-6 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 px-4 py-2 text-black">Year: {yr}</h3>
              {yearData[yr]?.length ? (
                <table className="min-w-full border text-black text-sm">
                  <thead className="bg-gray-100 font-semibold">
                    <tr>
                      <th className="border px-2 py-1 text-center">#</th>
                      <th className="border px-2 py-1 text-center">Activity</th>
                      <th className="border px-2 py-1 text-center">Agency</th>
                      <th className="border px-2 py-1 text-center">Scheme</th>
                      <th className="border px-2 py-1 text-center">Year</th>
                      <th className="border px-2 py-1 text-center">Participants</th>
                      <th className="border px-2 py-1 text-center">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[yr].map((entry, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        <td className="border px-2 py-1 text-center">{idx + 1}</td>
                        <td className="border px-2 py-1">{entry.activity}</td>
                        <td className="border px-2 py-1">{entry.agency}</td>
                        <td className="border px-2 py-1">{entry.scheme}</td>
                        <td className="border px-2 py-1">{entry.year}</td>
                        <td className="border px-2 py-1">{entry.participants}</td>
                        <td className="border px-2 py-1">
                          {entry.supportLinks?.map((link, i) => (
                            <div key={i}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Link {i + 1}
                              </a>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-black px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          <div className="bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onPrevious={goToPreviousPage} onNext={goToNextPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_3_3;

