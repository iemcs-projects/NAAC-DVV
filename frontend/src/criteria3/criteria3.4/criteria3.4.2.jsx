import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria3_4_2 = () => {
  const currentYear = new Date().getFullYear();
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${(currentYear - i + 1).toString().slice(-2)}`);

  const [yearData, setYearData] = useState({});
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);

  const [formData, setFormData] = useState({
    name: "",
    year: "",
    dur: "",
    list: ""
  });

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    const { name, year, dur, list } = formData;
    if (name && year && dur && list) {
      const updatedYearData = {
        ...yearData,
        [year]: [...(yearData[year] || []), formData],
      };
      setYearData(updatedYearData);
      setFormData({
        name: "",
        year: "",
        dur: "",
        list: ""
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goToNextPage = () => {
    navigate("/criteria3.4.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria3.4.1");
  };

  return (
    <div className="w-[1470px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 3: Research, Innovations and Extension</h2>
            <div className="text-sm text-gray-600">3.4 - Collaboration</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">3.4.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Number of functional MoUs with National and International institutions, universities, industries, corporate houses etc. during the last five years
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>e-Copies of the MoUs with institution/industry/corporate houses</li>
                <li>Any additional information</li>
                <li>Details of functional MoUs with institutions of national/international importance, other universities etc during the last five years</li>
              </ul>
            </div>
          </div>

          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Add MoUs - {currentYear}</h2>
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
                  <th className="border px-2 py-2">Name of the Institution/Industry</th>
                  <th className="border px-2 py-2">Year of Signing MoU</th>
                  <th className="border px-2 py-2">Duration</th>
                  <th className="border px-2 py-2">List of Activities & Web-links</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Institution/Industry Name"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                    >
                      <option value="">Select Year</option>
                      {pastFiveYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.dur}
                      onChange={(e) => handleChange("dur", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Duration"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.list}
                      onChange={(e) => handleChange("list", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Activities & Links"
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

          {pastFiveYears.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-950 px-4 py-2">#</th>
                      <th className="border text-gray-950 px-4 py-2">Institution/Industry</th>
                      <th className="border text-gray-950 px-4 py-2">Year</th>
                      <th className="border text-gray-950 px-4 py-2">Duration</th>
                      <th className="border text-gray-950 px-4 py-2">Activities & Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.name}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.dur}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.list}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_4_2;
