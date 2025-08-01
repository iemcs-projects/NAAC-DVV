import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import LandingNavbar from "../../components/landing-navbar";

// Mapping between body options and their numbers (server expects numeric option_selected)
const bodyOptions = {
  "Academic council/BoS of Affiliating university": 1,
  "Setting of question papers for UG/PG programs": 2,
  "Design and Development of Curriculum for Add on/certificate/ Diploma Courses": 3,
  "Assessment /evaluation process of the affiliating University": 4,
};

const Criteria1_1_3 = () => {
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);

  const [currentYear, setCurrentYear] = useState("");
  const [yearData, setYearData] = useState({});
  const [selectedOption, setSelectedOption] = useState("");
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState(null);

  const [formData, setFormData] = useState({
    year: "",
    name: "",
    body: "",
  });

  const [submittedData, setSubmittedData] = useState([]);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score113");
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const name = formData.name.trim();
    const body = formData.body;
    const inputYear = formData.year.trim();
    const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    const year = inputYear || sessionFull;

    if (!name || !body) {
      alert("Please fill in both Name of Teacher and select a Body.");
      return;
    }

    const option_selected = bodyOptions[body];
    if (!option_selected) {
      alert("Please select a valid body option.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria1/createResponse113", {
        session,
        year,
        teacher_name: name,
        body_name: body,
        option_selected,
      });

      const resp = response?.data?.data || {};
      const newEntry = {
        year: resp.year || year,
        name: resp.teacher_name || name,
        body: resp.body_name || body,
        option: option_selected,
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      setYearData((prev) => ({
        ...prev,
        [newEntry.year]: [...(prev[newEntry.year] || []), {
          name: newEntry.name,
          body: newEntry.body,
          option: newEntry.option,
        }],
      }));

      setFormData({ year: "", name: "", body: "" });
      setSelectedOption("");
      fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };

  const goToNextPage = () => {
    navigate("/criteria1.2.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.1.2");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
    
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />

        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Criteria 1: Curricular Aspects</h2>
            <div className="text-sm text-gray-600">1.1 - Curricular Planning and Implementation</div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (1.1.3): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">1.1.3 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-2">
              Teachers of the Institution participate in the following activities:<br />
              1. Academic council/BoS of Affiliating university<br />
              2. Setting of question papers for UG/PG programs<br />
              3. Design and Development of Curriculum<br />
              4. Evaluation process of the affiliating University
            </p>
          </div>

          <div className="mb-4">
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

          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  <th className="px-4 py-2 border">Year</th>
                  <th className="px-4 py-2 border">Name of Teacher</th>
                  <th className="px-4 py-2 border">Name of the Body</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder={currentYear}
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                      placeholder="Name of Teacher"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.body}
                      onChange={(e) => handleChange("body", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900"
                    >
                      <option value="">Select Body</option>
                      {Object.keys(bodyOptions).map((key) => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
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

          {submittedData.length > 0 && (
            <div className="overflow-auto border rounded mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
              <table className="min-w-full text-sm border text-left">
                <thead className="bg-gray-100 font-semibold text-gray-950">
                  <tr>
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Name of Teacher</th>
                    <th className="px-4 py-2 border">Name of the Body</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map((entry, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="px-2 py-2 border border-black text-gray-950">{i + 1}</td>
                      <td className="px-2 py-2 border border-black text-gray-950">{entry.year}</td>
                      <td className="px-2 py-2 border border-black text-gray-950">{entry.name}</td>
                      <td className="px-2 py-2 border border-black text-gray-950">{entry.body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {availableSessions && availableSessions.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border border-black">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-black px-4 py-2 text-gray-800">#</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Name of Teacher</th>
                      <th className="border border-black px-4 py-2 text-gray-800">Name of the Body</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border border-black px-2 py-1 text-gray-700">{index + 1}</td>
                        <td className="border border-black px-2 py-1 text-gray-700">{entry.name}</td>
                        <td className="border border-black px-2 py-1 text-gray-700">{entry.body}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria1_1_3;
