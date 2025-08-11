import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { useContext } from "react";

const Criteria6_4_2 = () => {
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  const [currentSession, setCurrentSession] = useState("");
  const [currentyear, setCurrentYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);

  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentSession(availableSessions[0]);
    }
  }, [availableSessions]);

  const [formData, setFormData] = useState({
    year: "",
    name: "",
    purpose: "",
    funds: "",
    links: [""] // Initialize with one empty string
  });
  const [submittedData, setSubmittedData] = useState([]);

  const fetchScore = async () => {
    console.log('Starting to fetch score for 6.4.2...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score642");
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      setProvisionalScore(response.data);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleChange = (field, value, index) => {
    if (field === 'links') {
      const newLinks = [...formData.links];
      newLinks[index] = value;
      setFormData({ ...formData, links: newLinks });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async () => {
    const { year, name, purpose, funds, links } = formData;
    const session = currentSession;
    const sessionYear = session.split("-")[0];

    // Basic validation
    if (!year || !name || !purpose || !funds) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria6/createResponse642",
        {
          session: parseInt(sessionYear, 10),
          year: year.trim(),
          donor_name: name.trim(),
          grant_amount_lakhs: parseFloat(funds),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      // Update local state with the new entry
      const newEntry = {
        year: year.trim(),
        name: name.trim(),
        purpose: purpose.trim(),
        funds: funds.trim(),
      };

      setSubmittedData(prev => [...prev, newEntry]);
      
      // Reset form
      setFormData({
        year: "",
        name: "",
        purpose: "",
        funds: "",
        links: [""] // Reset links to one empty string
      });

      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 6: Governance, Leadership and Management
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">6.4-Financial Management and Resource Mobilization</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">6.4.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Funds / Grants received from non-government bodies, individuals, 
                philanthropers during the last five years (not covered in Criterion III)
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Required Documents:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Minutes of relevant Academic Council/ BOS meetings</li>
                <li>Annual statements of accounts</li>
                <li>Any additional information</li>
                <li>Details of Funds / Grants received from of the non-government 
                bodies, individuals, Philanthropers during the last five years 
                (Data Template)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Funds / Grants received from non-government bodies, individuals, philanthropists during the last five years</h2>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : error ? (
              <p className="text-red-600">Error loading score: {error}</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (6.4.2): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="mb-4">
              <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
                Select Academic Year:
              </label>
              {isLoadingSessions ? (
                <p className="text-sm text-gray-600">Loading sessions...</p>
              ) : sessionError ? (
                <p className="text-sm text-red-600">Error loading sessions: {sessionError}</p>
              ) : availableSessions && availableSessions.length > 0 ? (
                <select
                  id="session"
                  value={currentSession}
                  onChange={(e) => setCurrentSession(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {availableSessions.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-600">No sessions available</p>
              )}
            </div>
          </div>

          {/* Input Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  {[
                    "Year",
                    "Name of the non government funding agencies/ individuals",
                    "Purpose of the Grant",
                    "Funds/ Grants received (INR in lakhs)",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-2 border">
                      {heading}
                    </th>
                  ))}
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[
                    "year",
                    "name",
                    "purpose",
                    "funds"
                  ].map((field) => (
                    <td key={field} className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                        placeholder={field}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 border">
                    <button
                      onClick={handleSubmit}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Links Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Supporting Document Links</h3>
            {Array.isArray(formData.links) && formData.links.map((link, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-gray-900"
                  value={link}
                  onChange={(e) => handleChange('links', e.target.value, index)}
                  placeholder={`Supporting link #${index + 1}`}
                />
                {formData.links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newLinks = [...formData.links];
                      newLinks.splice(index, 1);
                      setFormData({ ...formData, links: newLinks });
                    }}
                    className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, links: [...formData.links, ''] })}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
            >
              + Add Another Link
            </button>
          </div>

          {/* Submitted Data Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <div className="w-full max-w-full">
              <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
              {submittedData.length > 0 ? (
                <table className="min-w-full text-sm border max-w-full border-black">
                  <thead className="bg-gray-100 font-semibold">
                    <tr>
                      <th className="px-4 py-2 border text-gray-950">#</th>
                      {[
                        "Year",
                        "Name",
                        "Purpose",
                        "Funds",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-2 border text-gray-950">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submittedData.map((entry, i) => (
                      <tr key={i} className="even:bg-gray-50 text-gray-950">
                        <td className="px-2 py-2 border border-black">{i + 1}</td>
                        <td className="px-2 py-2 border border-black">{entry.year}</td>
                        <td className="px-2 py-2 border border-black">{entry.name}</td>
                        <td className="px-2 py-2 border border-black">{entry.purpose}</td>
                        <td className="px-2 py-2 border border-black">{entry.funds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No data submitted yet.</p>
              )}
            </div>
          </div>

          {/* Calculation Table */}
          <div className="mt-8 flex justify-center overflow-auto border rounded p-4">
            <div className="w-full max-w-4xl">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                Calculation Table (Last 5 Years)
              </h2>
              <table className="table-auto border-collapse w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-semibold">
                    <th className="border border-gray-500 px-4 py-2">YEAR</th>
                    <th className="border border-gray-500 px-4 py-2">2020</th>
                    <th className="border border-gray-500 px-4 py-2">2021</th>
                    <th className="border border-gray-500 px-4 py-2">2022</th>
                    <th className="border border-gray-500 px-4 py-2">2023</th>
                    <th className="border border-gray-500 px-4 py-2">2024</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">
                      Calculated Score
                    </td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Calculate Score
                </button>
              </div>
              <p className="text-gray-600 mt-2">Total number of years considered: 5</p>
            </div>
          </div>

          <Bottom />
        </div>
      </div>
    </div>
  );
};

export default Criteria6_4_2;