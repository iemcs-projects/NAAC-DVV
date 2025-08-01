import React, { useState, useMemo } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";

const Criteria6_3_2 = () => {
  const pastFiveYears = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) =>
        `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
      ),
    []
  );

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [formData, setFormData] = useState({
    year: pastFiveYears[0],
    name: "",
    conf: "",
    name_body: "",
    amt: "",
  });
  const [submittedData, setSubmittedData] = useState([]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (
      formData.year &&
      formData.name &&
      formData.conf &&
      formData.name_body &&
      formData.amt
    ) {
      setSubmittedData([...submittedData, formData]);
      setFormData({
        year: selectedYear,
        name: "",
        conf: "",
        name_body: "",
        amt: "",
      });
    } else {
      alert("Please fill in all required fields.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
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

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <div className="text-lg font-medium text-green-500 bg-[#bee7c7] w-[1000px] h-[50px] pt-[10px] rounded-lg">
                  Provisional Score: 18.75
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">6.3.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Average percentage of teachers provided with financial support to attend conferences/workshop and towards membership fee of professional bodies during the last five years
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Calculation Formula</h3>
              <p className="text-sm text-gray-700">
                Percentage = (Number of teachers provided with financial support to attend conferences, workshops and towards membership fee of professional bodies /
                Number of full time teachers) × 100
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Required Documents:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Minutes of relevant Academic Council/ BOS meetings</li>
                <li>Any additional information</li>
                <li>Details of teachers provided with financial support to attend conference, workshops etc during the last five years (Data Template)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">CBCS / Elective Course System Entry</h2>

          {/* Select Year Dropdown */}
          <div className="mb-6 flex items-center gap-2">
            <label className="text-gray-700 font-medium">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                handleChange("year", e.target.value);
              }}
              className="border border-gray-300 px-3 py-1 rounded text-gray-950"
            >
              {pastFiveYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Input Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  {[
                    "Year",
                    "Name of teacher",
                    "Name of conference/ workshop attended for which financial support provided",
                    "Name of the professional body for which membership fee is provided",
                    "Amount of support received (in INR)",
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
                  {["year", "name", "conf", "name_body", "amt"].map((field) => (
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

          {/* Submitted Data Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <div className="w-full max-w-full">
              <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
              {submittedData.length > 0 ? (
                <table className="min-w-full text-sm border max-w-full border-black">
                  <thead className="bg-gray-950 font-semibold text-gray-950">
                    <tr>
                      <th className="px-4 py-2 border text-white">#</th>
                      {["year", "name", "conf", "name_body", "amt"].map((heading) => (
                        <th key={heading} className="px-4 py-2 border text-white">
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
                        <td className="px-2 py-2 border border-black">{entry.conf}</td>
                        <td className="px-2 py-2 border border-black">{entry.name_body}</td>
                        <td className="px-2 py-2 border border-black">{entry.amt}</td>
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
                    <th className="border border-[gray] px-4 py-2">YEAR</th>
                    <th className="border border-[gray] px-4 py-2">2020</th>
                    <th className="border border-[gray] px-4 py-2">2021</th>
                    <th className="border border-[gray] px-4 py-2">2022</th>
                    <th className="border border-[gray] px-4 py-2">2023</th>
                    <th className="border border-[gray] px-4 py-2">2024</th>
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

export default Criteria6_3_2;
