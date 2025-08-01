import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria3_1_3 = () => {
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

  const [formData, setFormData] = useState({
    year: "",
    name: "",
    no: "",
    date: "",
    link: "",
  });

  const navigate = useNavigate();

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const allFilled = Object.values(formData).every((val) => val.trim() !== "");
    if (!allFilled) {
      alert("Please fill in all fields.");
      return;
    }
    setYearData((prev) => {
      const updated = { ...prev };
      if (!updated[selectedYear]) updated[selectedYear] = [];
      updated[selectedYear].push(formData);
      return updated;
    });
    setFormData({ year: "", name: "", no: "", date: "", link: "" });
  };

  const goToNextPage = () => navigate("/criteria3.2.1");
  const goToPreviousPage = () => navigate("/criteria3.1.2");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-black">
              Criteria 3 - Research, Innovations and Extension
            </h2>
            <span className="text-sm text-black">
              3.1 – Resource Mobilization for Research
            </span>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-lg font-medium text-green-500 bg-[#bee7c7] w-full h-[50px] pt-[10px] rounded-lg">
                Provisional Score: 18.75
              </div>
            </div>
          </div>

          {/* Metric Info & Requirements (blue) */}
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
          <div className="flex justify-end mb-4">
            <label className="mr-2 font-medium text-black">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border px-3 py-1 rounded text-black"
            >
              {pastFiveYears.map((yr) => (
                <option key={yr} value={yr} className="text-black">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Form Input (black text) */}
          <div className="overflow-auto border rounded mb-6">
            <table className="min-w-full border text-black text-sm">
              <thead className="bg-gray-100 font-semibold">
                <tr>
                  <th className="border px-2">Year</th>
                  <th className="border px-2">Name of Seminar/Workshop/Conference</th>
                  <th className="border px-2">Number of Participants</th>
                  <th className="border px-2">Date (From–To)</th>
                  <th className="border px-2">Link to Activity Report</th>
                  <th className="border px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.keys(formData).map((key) => (
                    <td key={key} className="border px-2">
                      <input
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full border px-2 py-1 text-black"
                      />
                    </td>
                  ))}
                  <td className="border px-2">
                    <button
                      onClick={handleSubmit}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Year-wise Data (black text year and entries) */}
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

          {/* Calculation Table (black text) */}
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

          {/* Navigation Buttons */}
          <div className="bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onPrevious={goToPreviousPage} onNext={goToNextPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_1_3;
