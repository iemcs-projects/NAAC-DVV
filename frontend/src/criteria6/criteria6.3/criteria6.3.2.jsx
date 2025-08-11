import React, { useState, useMemo, useContext, useEffect } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria6_3_2 = () => {
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  
  const pastFiveYears = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) =>
        `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
      ),
    []
  );

  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    year: "",
    name: "",
    conf: "",
    name_body: "",
    amt: "",
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [calculationData, setCalculationData] = useState({
    2020: 0,
    2021: 0,
    2022: 0,
    2023: 0,
    2024: 0
  });

  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]); // Default to most recent session
    }
  }, [availableSessions]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score632");
      console.log('API Response:', response.data);
      setProvisionalScore(response.data.data);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { year, name, conf, name_body, amt } = formData;
    const session = currentYear;

    // Basic validation
    if (!year || !name || !conf || !name_body || !amt) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria6/createResponse632",
        {
          session: parseInt(session.split("-")[0], 10),
          year: year,
          teacher_name: name.trim(),
          conference_name: conf.trim(),
          professional_body: name_body.trim(),
          amt_of_spt_received: parseFloat(amt) || 0,
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
        year,
        name: name.trim(),
        conf: conf.trim(),
        name_body: name_body.trim(),
        amt: parseFloat(amt) || 0,
      };

      setSubmittedData(prev => [...prev, newEntry]);
      
      // Update yearData for year-wise display
      setYearData(prev => ({
        ...prev,
        [newEntry.year]: [...(prev[newEntry.year] || []), {
          name: newEntry.name,
          conf: newEntry.conf,
          name_body: newEntry.name_body,
          amt: newEntry.amt,
        }],
      }));
      
      // Reset form but keep the current year
      setFormData({
        year: currentYear,
        name: "",
        conf: "",
        name_body: "",
        amt: "",
      });

      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

  const calculateScore = () => {
    // Placeholder calculation logic
    const newCalculationData = { ...calculationData };
    
    // Group submitted data by year and calculate percentages
    pastFiveYears.forEach(yearRange => {
      const year = parseInt(yearRange.split('-')[0]);
      const yearEntries = submittedData.filter(entry => entry.year === yearRange);
      // This is a simplified calculation - you'll need to implement actual logic
      // based on total number of teachers and those who received support
      newCalculationData[year] = yearEntries.length; // Placeholder
    });
    
    setCalculationData(newCalculationData);
    alert("Score calculated successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          {/* Page Header */}
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
                  Provisional Score (6.3.2): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Metric Information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-600 font-medium mb-2">6.3.2 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-4">
              Average percentage of teachers provided with financial support to attend conferences/workshop and towards membership fee of professional bodies during the last five years
            </p>

            <h4 className="text-blue-600 font-medium mb-2">Calculation Formula</h4>
            <p className="text-sm text-gray-700 mb-4">
              Percentage = (Number of teachers provided with financial support to attend conferences, workshops and towards membership fee of professional bodies / Number of full time teachers) × 100
            </p>

            <h4 className="text-blue-600 font-medium mb-2">Required Documents:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">Minutes of relevant Academic Council/ BOS meetings</li>
              <li className="mb-1">Any additional information</li>
              <li>Details of teachers provided with financial support to attend conference, workshops etc during the last five years (Data Template)</li>
            </ul>
          </div>

          {/* Year Selection */}
          <div className="mb-6">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border border-gray-300 px-3 py-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
            >
              {availableSessions && availableSessions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Data Entry Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Faculty Financial Support Entry</h2>

            {/* Input Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Entry</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Year
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Name of Teacher
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Conference/Workshop Name
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Professional Body Name
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Amount (INR)
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="px-2 py-2 border border-gray-300">
                        <input
                          type="text"
                          value={formData.year}
                          onChange={(e) => handleChange("year", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={currentYear}
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter teacher name"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        <input
                          type="text"
                          value={formData.conf}
                          onChange={(e) => handleChange("conf", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter conference/workshop name"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        <input
                          type="text"
                          value={formData.name_body}
                          onChange={(e) => handleChange("name_body", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter professional body name"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        <input
                          type="number"
                          value={formData.amt}
                          onChange={(e) => handleChange("amt", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        <button
                          onClick={handleSubmit}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          Add Entry
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submitted Data Display */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Submitted Entries</h3>
              {submittedData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-white">
                          S.No.
                        </th>
                        <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-white">
                          Year
                        </th>
                        <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-white">
                          Teacher Name
                        </th>
                        <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-white">
                          Conference/Workshop
                        </th>
                        <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-white">
                          Professional Body
                        </th>
                        <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-white">
                          Amount (INR)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedData.map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                            {entry.year}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                            {entry.name}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                            {entry.conf}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                            {entry.name_body}
                          </td>
                          <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                            ₹{entry.amt.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No entries submitted yet.</p>
                  <p className="text-sm text-gray-400">Add your first entry using the form above.</p>
                </div>
              )}
            </div>

            {/* Year-wise Data Display */}
            {availableSessions && availableSessions.map((year) => (
              <div key={year} className="mb-8 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-3 rounded-t-lg">
                  Year: {year}
                </h3>
                {yearData[year] && yearData[year].length > 0 ? (
                  <div className="p-4">
                    <table className="w-full text-sm border-collapse border border-gray-300">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-gray-800 text-left">#</th>
                          <th className="border border-gray-300 px-4 py-2 text-gray-800 text-left">Teacher Name</th>
                          <th className="border border-gray-300 px-4 py-2 text-gray-800 text-left">Conference/Workshop</th>
                          <th className="border border-gray-300 px-4 py-2 text-gray-800 text-left">Professional Body</th>
                          <th className="border border-gray-300 px-4 py-2 text-gray-800 text-left">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearData[year].map((entry, index) => (
                          <tr key={index} className="even:bg-gray-50">
                            <td className="border border-gray-300 px-2 py-1 text-gray-700">{index + 1}</td>
                            <td className="border border-gray-300 px-2 py-1 text-gray-700">{entry.name}</td>
                            <td className="border border-gray-300 px-2 py-1 text-gray-700">{entry.conf}</td>
                            <td className="border border-gray-300 px-2 py-1 text-gray-700">{entry.name_body}</td>
                            <td className="border border-gray-300 px-2 py-1 text-gray-700">₹{entry.amt.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 px-4 py-3">No data submitted for this year.</p>
                )}
              </div>
            ))}

            {/* Calculation Table */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Calculation Table (Last 5 Years)
                </h3>
                <button
                  onClick={calculateScore}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  Calculate Score
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium text-gray-700">
                        YEAR
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-center text-sm font-medium text-gray-700">
                        2020
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-center text-sm font-medium text-gray-700">
                        2021
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-center text-sm font-medium text-gray-700">
                        2022
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-center text-sm font-medium text-gray-700">
                        2023
                      </th>
                      <th className="px-4 py-3 border border-gray-300 text-center text-sm font-medium text-gray-700">
                        2024
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="px-4 py-3 border border-gray-300 font-medium text-gray-700">
                        Calculated Score
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center text-gray-900">
                        {calculationData[2020] || 0}
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center text-gray-900">
                        {calculationData[2021] || 0}
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center text-gray-900">
                        {calculationData[2022] || 0}
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center text-gray-900">
                        {calculationData[2023] || 0}
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center text-gray-900">
                        {calculationData[2024] || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Total number of years considered: 5</p>
                <p className="mt-1">
                  <strong>Average Score:</strong> {
                    (Object.values(calculationData).reduce((sum, val) => sum + val, 0) / 5).toFixed(2)
                  }%
                </p>
              </div>
            </div>
          </div>

          <Bottom />
        </div>
      </div>
    </div>
  );
};

export default Criteria6_3_2;