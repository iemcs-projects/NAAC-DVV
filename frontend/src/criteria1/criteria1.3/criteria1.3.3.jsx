import React, { useEffect, useState, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../../components/landing-navbar";
import axios from "axios";

import { SessionContext } from "../../contextprovider/sessioncontext";
const Criteria1_3_3 = () => {
 const { sessions, availableSessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const pastFiveYears=Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`)
  {/*const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${(currentYear - i + 1).toString().slice(-2)}`);*/}

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    students: "",
    supportLinks: [] // Initialize as empty array
  });
  const [submittedData, setSubmittedData] = useState([]);

  // Additional state variables for API handling and session management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [currentYear, setCurrentYear] = useState("");

  const navigate = useNavigate();
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
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score133");
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      setProvisionalScore(response.data);
      console.log('provisionalScore after set:', provisionalScore);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleChange = (field, value, index = null) => {
  if (field === "supportLinks") {
    const updatedLinks = [...formData.supportLinks];
    updatedLinks[index] = value;
    setFormData({ ...formData, supportLinks: updatedLinks });
  } else {
    setFormData({ ...formData, [field]: value });
  }
};
  const handleSubmit = async () => {
  const code=formData.code 
  const name=formData.name 
  const students=formData.students ;

  const session = selectedYear.split("-")[0];
  try {
    const response =await axios.post("http://localhost:3000/api/v1/criteria1/createResponse133", {
      session,
      program_code:code,
      program_name:name,
      student_name:students,
    });

    const resp = response?.data?.data || {};
    const newEntry = {
      year: resp.year || selectedYear,
      name: resp.name || name,
      students: resp.students || students,
      code: resp.code || code,
      
    };

    setSubmittedData((prev) => [...prev, newEntry]);
      
    
    setFormData({ code: "", name: "", students: "" });

    fetchScore();
    alert("Data submitted successfully!");
  } catch (error) {
    console.error("Error submitting:", error);
    alert(error.response?.data?.message || error.message || "Submission failed due to server error");
  }
};

  const goToNextPage = () => {
    navigate("/criteria1.4.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.3.2");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />

        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Criteria 1: Curricular Aspects</h2>
            <div className="text-sm text-gray-600">1.3 - Curriculum Enrichment</div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (1.3.3): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">1.3.3 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Percentage of students undertaking project work/field work/internship
            </p>
            <h4 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li className="mb-1">List of programmes and number of students undertaking project work/field work/internships</li>
            </ul>
          </div>

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

          <div className="overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  <th className="px-4 py-2 border">Programme Code</th>
                  <th className="px-4 py-2 border">Programme Name</th>
                  <th className="px-4 py-2 border">Name of the Students</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleChange("code", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Programme Code"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Programme Name"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.students}
                      onChange={(e) => handleChange("students", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Student Names"
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

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Support Document Links (Add as many as required):
            </label>
            <div className="space-y-2">
              {(formData.supportLinks || []).map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder={`Enter support link ${index + 1}`}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-gray-900"
                    value={link}
                    onChange={(e) => handleChange("supportLinks", e.target.value, index)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  supportLinks: formData.supportLinks ? [...formData.supportLinks, ""] : [""] 
                })}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                + Add Another Link
              </button>
            </div>
          </div>


          {submittedData.length > 0 && (
            <div className="overflow-auto border rounded mb-6">
              <h3 className="text-lg font-semibold mb-2 p-2 bg-gray-100 border-b">Submitted Entries</h3>
              <table className="min-w-full text-sm border text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Programme Code</th>
                    <th className="px-4 py-2 border">Programme Name</th>
                    <th className="px-4 py-2 border">Name of Students</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map((entry, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="px-2 py-2 border border-black">{i + 1}</td>
                      <td className="px-2 py-2 border border-black">{entry.year || selectedYear}</td>
                      <td className="px-2 py-2 border border-black">{entry.code}</td>
                      <td className="px-2 py-2 border border-black">{entry.name}</td>
                      <td className="px-2 py-2 border border-black">{entry.students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {submittedData.length === 0 && (
            <p className="text-gray-600 mb-6">No data submitted yet.</p>
          )}

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Calculation Table (Last 5 Years)</h3>
            <div className="overflow-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">YEAR</th>
                    {pastFiveYears.map((year) => (
                      <th key={year} className="border border-gray-300 px-4 py-2">
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      Calculated Score
                    </td>
                    {pastFiveYears.map((year) => (
                      <td key={`score-${year}`} className="border border-gray-300 px-4 py-2 text-center">
                        -
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                onClick={fetchScore}
              >
                Calculate Score
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Total number of years considered: {pastFiveYears.length}</p>
          </div>

          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
      </div>
    
  );
};

export default Criteria1_3_3;
