import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import { useEffect } from "react";

const Criteria4_1_4 = () => {
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [currentYear, setCurrentYear] = useState(pastFiveYears[0]);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { sessions: availableSessions } = useContext(SessionContext);
  
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    year: "",
    budget: "",
    expen: "",
    total: "",
    academic: "",
    physical: "",
    supportLinks: [""], // Initialize with one empty link
  });

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
      const response = await axios.get("http://localhost:3000/api/v1/criteria4/score414");
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

  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);

  const navigate = useNavigate();
  const years = pastFiveYears;

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
    const { year, budget, expen, total, academic, physical } = formData;

    if (!budget || !expen || !total || !academic || !physical) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/v1/api/criteria4/createResponse414",
        {
          session: parseInt(year, 10),
          year: year,
          budget_allocated_infra_aug: parseFloat(budget) || 0,
          expenditure_infra_aug: parseFloat(expen) || 0,
          total_expenditure_excl_salary: parseFloat(total) || 0,
          expenditure_academic_maint: parseFloat(academic) || 0,
          expenditure_physical_maint: parseFloat(physical) || 0
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      const newEntry = {
        year: year,
        budget: budget,
        expen: expen,
        total: total,
        academic: academic,
        physical: physical
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      setYearData((prev) => ({
        ...prev,
        [year]: [...(prev[year] || []), newEntry],
      }));

      // Reset form
      setFormData({
        year: "",
        budget: "",
        expen: "",
        total: "",
        academic: "",
        physical: "",
        supportLinks: [""],
      });
      
      fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

  const goToNextPage = () => navigate("/criteria4.4.2");
  const goToPreviousPage = () => navigate("/criteria4.3.3s");

  const totalPrograms = years.reduce((acc, year) => acc + (yearData[year]?.length || 0), 0);
  const averagePrograms = (totalPrograms / years.length).toFixed(2);

  return (
    <div className="w-[1690px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            {/* --- Intro Section --- */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800">
                Criterion 4 - Infrastructure and Learning Resources
              </h2>
              <div className="text-sm text-gray-600">4.1 Physical Facilities</div>
            </div>
            
            {/* --- Metric Info --- */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.1.4 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Average percentage of expenditure, excluding salary for infrastructure
                augmentation during last five years(INR in Lakhs)
              </p>
              <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Expenditure for infrastructure augmentation</li>
                <li>Total expenditure excluding salary</li>
              </ul>
            </div>

            {/* Provisional Score */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              {loading ? (
                <p className="text-gray-600">Loading provisional score...</p>
              ) : provisionalScore?.data ? (
                <div>
                  <p className="text-lg font-semibold text-green-800">
                    Provisional Score (4.1.4): {provisionalScore.data.score}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">No score data available.</p>
              )}
            </div>

            {/* --- Year Selection & Entry Form --- */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
              
              {/* Input Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100 text-gray-950">
                    <tr>
                      <th className="border px-2 py-2">Year</th>
                      <th className="border px-2 py-2">Budget allocated for infrastructure
                      augmentation(INR in Lakh)</th>
                      <th className="border px-2 py-2">Expenditure for infrastructure
augmentation(INR in Lakh)
</th>
                      <th className="border px-2 py-2">Total expenditure
excluding Salary (INR
in Lakh)</th>
                      <th className="border px-2 py-2">Expenditure on maintenance of academic
facilities (excluding salary for human
resources) (INR in Lakh)
</th>
                      <th className="border px-2 py-2">Expenditure on maintenance of physical
facilities (excluding salary for human
resources) (INR in Lakh)
</th>
                      <th className="border px-2 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          min="2000"
                          max="2100"
                          step="1"
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="YYYY"
                          value={formData.year}
                          onChange={(e) => handleChange("year", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Budget"
                          value={formData.budget}
                          onChange={(e) => handleChange("budget", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Expenditure"
                          value={formData.expen}
                          onChange={(e) => handleChange("expen", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Total"
                          value={formData.total}
                          onChange={(e) => handleChange("total", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Academic"
                          value={formData.academic}
                          onChange={(e) => handleChange("academic", e.target.value)}
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          className="w-full border text-gray-950 border-black rounded px-2 py-1"
                          placeholder="Physical"
                          value={formData.physical}
                          onChange={(e) => handleChange("physical", e.target.value)}
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

              {/* Support Links */}
              <div>
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
            </div>

            {/* Display Table Per Year */}
            {years.map((year) => (
              <div key={year} className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
                {yearData[year]?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border text-gray-900 px-2 py-1">#</th>
                          <th className="border text-gray-900 px-2 py-1">Year</th>
                          <th className="border text-gray-900 px-2 py-1">Budget allocated for infrastructure
                          augmentation(INR in Lakh)</th>
                          <th className="border text-gray-900 px-2 py-1">Expenditure</th>
                          <th className="border text-gray-900 px-2 py-1">Total</th>
                          <th className="border text-gray-900 px-2 py-1">Academic</th>
                          <th className="border text-gray-900 px-2 py-1">Physical</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearData[year].map((entry, idx) => (
                          <tr key={idx} className="even:bg-gray-50">
                            <td className="border text-gray-900 border-black px-2 py-1">{idx + 1}</td>
                            <td className="border text-gray-900 border-black px-2 py-1">{entry.year}</td>
                            <td className="border text-gray-900 border-black px-2 py-1">{entry.budget}</td>
                            <td className="border text-gray-900 border-black px-2 py-1">{entry.expen}</td>
                            <td className="border text-gray-900 border-black px-2 py-1">{entry.total}</td>
                            <td className="border text-gray-900 border-black px-2 py-1">{entry.academic}</td>
                            <td className="border text-gray-900 border-black px-2 py-1">{entry.physical}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 p-4">No data available for {year}.</p>
                )}
              </div>
            ))}

            {/* Average Calculator */}
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
                      <td className="border px-4 py-2 font-medium text-gray-600">Calculated Score</td>
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

export default Criteria4_1_4;