import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import axios from "axios";
import {SessionContext} from "../../contextprovider/sessioncontext";
import { useContext } from "react";

const Criteria6_3_4 = () => {
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  const [currentSession, setCurrentSession] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  
  // Set default session when availableSessions loads
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentSession(availableSessions[0]);
    }
  }, [availableSessions]);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    dateFrom: "",
    dateTo: "",
  });
  const [submittedData, setSubmittedData] = useState([]);

  const fetchScore = async () => {
    console.log('Starting to fetch score for 6.3.4...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score634");
      console.log('API Response:', response);
      console.log('Response data:', response.data); // Add this line
      setProvisionalScore(response.data);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
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

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const { name, title, dateFrom, dateTo } = formData;
    const session = currentSession;
    const sessionYear = session.split("-")[0];

    // Basic validation
    if (!name || !title || !dateFrom || !dateTo) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate date formats
    const dateFromRegex = /^\d{2}-\d{2}-\d{4}$/;
    const dateToRegex = /^\d{2}-\d{2}-\d{4}$/;

    if (!dateFromRegex.test(dateFrom)) {
      alert("Please enter date from in DD-MM-YYYY format");
      return;
    }

    if (!dateToRegex.test(dateTo)) {
      alert("Please enter date to in DD-MM-YYYY format");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria6/createResponse634",
        {
          session: parseInt(sessionYear, 10),
          teacher_name: name.trim(),
          program_title: title.trim(),
          date_from: dateFrom.trim(),
          date_to: dateTo.trim()
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
        name: name.trim(),
        title: title.trim(),
        dateFrom: dateFrom.trim(),
        dateTo: dateTo.trim()
      };

      setSubmittedData(prev => [...prev, newEntry]);
      
      // Reset form
      setFormData({
        name: "",
        title: "",
        dateFrom: "",
        dateTo: "",
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
              <span className="text-gray-600">6.3-Faculty Empowerment Strategies</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          {/* Provisional Score Section */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : error ? (
              <p className="text-red-600">Error loading score: {error}</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (6.3.4): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Metric Information Section */}
          <div className="mb-6">
            <h3 className="text-blue-600 font-medium mb-2">6.3.4 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Average percentage of teachers undergoing online/face-to-face 
              Faculty development Programmes (FDP) during the last five years
            </p>
          </div>

          {/* Calculation Formula Section */}
          <div className="mb-6">
            <h3 className="text-blue-600 font-medium mb-2">Calculation Formula</h3>
            <p className="text-sm text-gray-700">
              Formula = (Total number of teaching staffs attending such programmes/number of full time teachers)
            </p>
          </div>

          {/* Required Documents Section */}
          <div className="mb-6">
            <h3 className="text-blue-600 font-medium mb-2">Required Documents:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Minutes of relevant Academic Council/ BOS meetings</li>
              <li>IQAC report summary</li>
              <li>Reports of the Human Resource Development Centres (UGC 
              ASC or other relevant centers).</li>
              <li>Upload any additional information</li>
              <li>Details of teachers attending professional development 
              programmes during the last five years (Data Template).</li>
            </ul>
          </div>

          {/* Entry Section Title */}
          <h2 className="text-xl font-bold text-gray-500 mb-4">CBCS / Elective Course System Entry</h2>

          {/* Session Selection */}
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
                  <th className="px-4 py-2 border">Name of teacher who attended</th>
                  <th className="px-4 py-2 border">Title of the program</th>
                  <th className="px-4 py-2 border">Date From (DD-MM-YYYY)</th>
                  <th className="px-4 py-2 border">Date To (DD-MM-YYYY)</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Teacher Name"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Program Title"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.dateFrom}
                      onChange={(e) => handleChange('dateFrom', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="DD-MM-YYYY"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.dateTo}
                      onChange={(e) => handleChange('dateTo', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="DD-MM-YYYY"
                    />
                  </td>
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

          {/* Submitted Data Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <div className="w-full max-w-full">
              <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
              {submittedData.length > 0 ? (
                <table className="min-w-full text-sm border max-w-full border-black">
                  <thead className="bg-gray-100 font-semibold text-gray-950">
                    <tr>
                      <th className="px-4 py-2 border text-gray-950">#</th>
                      <th className="px-4 py-2 border text-gray-950">Teacher Name</th>
                      <th className="px-4 py-2 border text-gray-950">Program Title</th>
                      <th className="px-4 py-2 border text-gray-950">Date From</th>
                      <th className="px-4 py-2 border text-gray-950">Date To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedData.map((entry, i) => (
                      <tr key={i} className="even:bg-gray-50 text-gray-950">
                        <td className="px-2 py-2 border border-black">{i + 1}</td>
                        <td className="px-2 py-2 border border-black">{entry.name}</td>
                        <td className="px-2 py-2 border border-black">{entry.title}</td>
                        <td className="px-2 py-2 border border-black">{entry.dateFrom}</td>
                        <td className="px-2 py-2 border border-black">{entry.dateTo}</td>
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
                    <th className="border border-gray-400 px-4 py-2">YEAR</th>
                    <th className="border border-gray-400 px-4 py-2">2020</th>
                    <th className="border border-gray-400 px-4 py-2">2021</th>
                    <th className="border border-gray-400 px-4 py-2">2022</th>
                    <th className="border border-gray-400 px-4 py-2">2023</th>
                    <th className="border border-gray-400 px-4 py-2">2024</th>
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

export default Criteria6_3_4;