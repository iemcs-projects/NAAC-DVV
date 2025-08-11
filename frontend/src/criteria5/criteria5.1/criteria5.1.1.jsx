import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria5_1_1 = () => {
  const { sessions: availableSessions } = useContext(SessionContext);
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  
  const [selectedYear, setSelectedYear] = useState(
    availableSessions && availableSessions.length > 0 ? availableSessions[0] : pastFiveYears[0]
  );
  const [currentYear, setCurrentYear] = useState(selectedYear);
  const [years] = useState(pastFiveYears); // Fixed: Added missing state initialization
  
  // Fixed: Initialize yearData state
  const [yearData, setYearData] = useState({});
  
  // Fixed: Initialize yearScores properly
  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null); // Fixed: Added missing state
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState([]);

  const [formData, setFormData] = useState({
    year: "",
    scheme_name: "",
    gov_students_count: "",
    gov_amount: "",
    non_gov_students_count: "",
    non_gov_amount: "",
    inst_students_count: "",
    inst_amount: "",
    supportLinks: [""],
  });

  const navigate = useNavigate();

  // Update years and currentYear when availableSessions changes
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]);
      setSelectedYear(availableSessions[0]);
    }
  }, [availableSessions]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria5/score511");
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

  // Fixed: Handle supportLinks properly
  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...formData.supportLinks];
      updatedLinks[index] = value;
      setFormData(prev => ({ ...prev, supportLinks: updatedLinks }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const {
      scheme_name,
      gov_students_count,
      gov_amount,
      non_gov_students_count = "0",  // Default to "0" if not provided
      non_gov_amount = "0",          // Default to "0" if not provided
      inst_students_count = "0",     // Default to "0" if not provided
      inst_amount = "0"              // Default to "0" if not provided
    } = formData;
  
    const year = currentYear;
    const session = year.split("-")[0];
  
    // Calculate total students count
    const total_students_count = 
      (parseInt(gov_students_count) || 0) + 
      (parseInt(non_gov_students_count) || 0) + 
      (parseInt(inst_students_count) || 0);
  
    if (!scheme_name || !gov_students_count || !gov_amount) {
      alert("Please fill in all required fields (Scheme Name, Government Students Count, and Government Amount).");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria5/createResponse511_512",
        {
          session: parseInt(session, 10),
          year: parseInt(session, 10),
          scheme_name,
          gov_students_count: parseInt(gov_students_count) || 0,
          gov_amount: parseFloat(gov_amount) || 0,
          non_gov_students_count: parseInt(non_gov_students_count) || 0,
          non_gov_amount: parseFloat(non_gov_amount) || 0,
          total_students_count,
          inst_students_count: parseInt(inst_students_count) || 0,
          inst_amount: parseFloat(inst_amount) || 0,
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
        scheme_name,
        gov_students_count,
        gov_amount,
        non_gov_students_count,
        non_gov_amount,
        total_students_count,
        inst_students_count,
        inst_amount,
      };
  
      setSubmittedData(prev => [...prev, newEntry]);
      
      // Update yearData
      setYearData(prev => ({
        ...prev,
        [year]: [...(prev[year] || []), newEntry]
      }));
      
      // Reset form
      setFormData({
        scheme_name: "",
        gov_students_count: "",
        gov_amount: "",
        non_gov_students_count: "",
        non_gov_amount: "",
        inst_students_count: "",
        inst_amount: "",
        supportLinks: [""],
      });

      // Refresh the score
      fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

  const goToNextPage = () => {
    navigate("/criteria5.1.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria4.4.2");
  };

  const totalPrograms = years.reduce((acc, year) => acc + (yearData[year]?.length || 0), 0);
  const averagePrograms = (totalPrograms / years.length).toFixed(2);

  return (
    <div className="w-[1520px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800">Criteria 5: Student Support and Progression</h2>
              <div className="text-sm">
                <span className="text-gray-600">5.1 Student Support</span>
                <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="mb-4">
                <h3 className="text-blue-600 font-medium mb-2">5.1.1 Metric Information</h3>
                <p className="text-sm text-gray-700">
                  Average percentage of students benefited by scholarships and freeships provided by the Government
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Upload self attested letter with the list of students sanctioned scholarship</li>
                  <li>Average percentage of students benefited by scholarships and freeships provided by the Government during the last five years</li> 
                </ul>
              </div>
            </div>

            {/* Provisional Score Display */}
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

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Students benefited by scholarships and freeships provided by the Government
                </h2>
                <div>
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

              <div className="overflow-x-auto">
                <table className="w-full border text-sm border-black">
                  <thead className="bg-gray-100 text-gray-950">
                    <tr>
                      <th rowSpan="2" className="border px-2 py-2">Year</th>
                      <th rowSpan="2" className="border px-2 py-2">Name of the scheme</th>
                      <th colSpan="2" className="border px-2 py-2">Number of students benefited by government scheme and amount</th>
                      <th colSpan="2" className="border px-2 py-2">Number of students benefited by the institution's schemes and amount</th>
                      <th rowSpan="2" className="border px-2 py-2">Action</th>
                    </tr>
                    <tr>
                      <th className="border px-2 py-2">Number of students</th>
                      <th className="border px-2 py-2">Amount</th>
                      <th className="border px-2 py-2">Number of students</th>
                      <th className="border px-2 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                    <td className="border px-2 py-1">
                        <input
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Year"
                          value={formData.year}
                          onChange={(e) => handleChange("year", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Scheme Name"
                          value={formData.scheme_name}
                          onChange={(e) => handleChange("scheme_name", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Gov Students"
                          value={formData.gov_students_count}
                          onChange={(e) => handleChange("gov_students_count", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Gov Amount"
                          value={formData.gov_amount}
                          onChange={(e) => handleChange("gov_amount", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Inst Students"
                          value={formData.inst_students_count}
                          onChange={(e) => handleChange("inst_students_count", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Inst Amount"
                          value={formData.inst_amount}
                          onChange={(e) => handleChange("inst_amount", e.target.value)}
                        />
                      </td>
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
                </table>
              </div>
            </div>

            {/* Support Links */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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

            {/* Display submitted data by year */}
            {years.map((year) => (
              <div key={year} className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
                {yearData[year] && yearData[year].length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-200">
                        <tr>
                          <th rowSpan="2" className="border text-gray-950 px-4 py-2">#</th>
                          <th rowSpan="2" className="border text-gray-950 px-4 py-2">Year</th>
                          <th rowSpan="2" className="border text-gray-950 px-4 py-2">Name of the Scheme</th>
                          <th colSpan="2" className="border text-gray-950 px-4 py-2">Government Scheme</th>
                          <th colSpan="2" className="border text-gray-950 px-4 py-2">Institution Scheme</th>
                        </tr>
                        <tr>
                          <th className="border text-gray-950 px-2 py-2">Students</th>
                          <th className="border text-gray-950 px-2 py-2">Amount</th>
                          <th className="border text-gray-950 px-2 py-2">Students</th>
                          <th className="border text-gray-950 px-2 py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearData[year].map((entry, index) => (
                          <tr key={index} className="even:bg-gray-50">
                            <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                            <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
                            <td className="border text-gray-950 px-2 py-1">{entry.scheme_name}</td>
                            <td className="border text-gray-950 px-2 py-1">{entry.gov_students_count}</td>
                            <td className="border text-gray-950 px-2 py-1">{entry.gov_amount}</td>
                            <td className="border text-gray-950 px-2 py-1">{entry.inst_students_count}</td>
                            <td className="border text-gray-950 px-2 py-1">{entry.inst_amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
                )}
              </div>
            ))}

            {/* Calculation Table */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Calculation Table (Last 5 Years)
              </h2>
              <div className="overflow-x-auto mb-4">
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
                      <td className="border px-4 py-2 font-medium text-gray-600">
                        Calculated Score
                      </td>
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
              </div>
              <div className="flex items-center gap-2">
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
          </div>

          {/* Navigation Footer */}
          <div className="bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_1_1;