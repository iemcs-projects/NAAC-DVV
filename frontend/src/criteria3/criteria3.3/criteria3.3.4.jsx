import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria3_3_4 = () => {
  const currentYear = new Date().getFullYear();
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${(currentYear - i + 1).toString().slice(-2)}`);

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    names: "",
    org: "",
    name_sch: "",
    year: "",
    num: ""
  });

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    const { names, org, name_sch, year, num } = formData;
    if (names && org && name_sch && year && num) {
      const updatedYearData = {
        ...yearData,
        [year]: [...(yearData[year] || []), formData],
      };
      setYearData(updatedYearData);
      setFormData({
        names: "",
        org: "",
        name_sch: "",
        year: "",
        num: ""
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goToNextPage = () => navigate("/criteria3.4.1");
  const goToPreviousPage = () => navigate("/criteria3.3.3");

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

          {/* Input Section */}
          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Add On Programs</h2>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-medium">Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded text-gray-950"
                >
                  {pastFiveYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Name of the activity</th>
                  <th className="border px-2 py-2">Organising unit/ agency/ collaborating agency</th>
                  <th className="border px-2 py-2">Name of the scheme</th>
                  <th className="border px-2 py-2">Year of activity</th>
                  <th className="border px-2 py-2">Number of students participated</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
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
                    <select
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                    >
                      <option value="">Select Year</option>
                      {pastFiveYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
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

          {/* Display Data */}
          {pastFiveYears.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-950 px-4 py-2">#</th>
                      <th className="border text-gray-950 px-4 py-2">Activity</th>
                      <th className="border text-gray-950 px-4 py-2">Agency</th>
                      <th className="border text-gray-950 px-4 py-2">Scheme</th>
                      <th className="border text-gray-950 px-4 py-2">Year</th>
                      <th className="border text-gray-950 px-4 py-2">Participants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.names}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.org}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.name_sch}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
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
