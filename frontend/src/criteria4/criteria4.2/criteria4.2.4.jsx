import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria4_2_4 = () => {
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const years = ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];

  const [formData, setFormData] = useState({
    number: "",
    total: "",
    supportLinks: [""],
  });

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [submittedData, setSubmittedData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const newLinks = [...formData.supportLinks];
      newLinks[index] = value;
      setFormData({ ...formData, supportLinks: newLinks });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = () => {
    const parsedNumber = parseFloat(formData.number);
    const parsedTotal = parseFloat(formData.total);

    if (
      formData.number !== "" &&
      formData.total !== "" &&
      !isNaN(parsedNumber) &&
      !isNaN(parsedTotal) &&
      parsedTotal > 0
    ) {
      const entryWithYear = {
        ...formData,
        number: parsedNumber,
        total: parsedTotal,
        year: selectedYear, // ✅ Include year
      };
      setSubmittedData([...submittedData, entryWithYear]);
      setFormData({
        number: "",
        total: "",
        supportLinks: [""],
      });
    } else {
      alert("Please fill in all required numeric fields correctly.");
    }
  };

  const navigate = useNavigate();

  const goToNextPage = () => {
    navigate("/criteria1.2.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.1.3");
  };

  // ✅ Generate year-wise grouped data
  const yearData = years.reduce((acc, year) => {
    acc[year] = submittedData.filter((entry) => entry.year === year);
    return acc;
  }, {});

  return (
    <div className="min-h-screen w-[1254px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 4: Infrastructure and Learning Resources
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">4.2 Library as a learning Resource</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.2.4 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Percentage per day usage of library by teachers and students (foot falls and login data for online access) (Data for the latest completed academic year)
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Upload last page of accession register details</li>
                <li>Method of computing per day usage of library</li>
                <li>Number of users using library through e-access</li>
                <li>Number of physical users accessing library</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Per day usage of library by teachers and students</h2>

          <div className="mb-4">
            <label className="text-gray-700 font-medium mr-2">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 px-3 py-1 rounded text-gray-950"
            >
              {pastFiveYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  <th className="px-4 py-2 border">Number of teachers and students using library per day</th>
                  <th className="px-4 py-2 border">Total number of teachers and students</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {["number", "total"].map((field) => (
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
                      className="px-3 py-1 !bg-blue-600 text-white rounded hover:!bg-blue-600"
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
                onClick={() =>
                  setFormData({
                    ...formData,
                    supportLinks: [...formData.supportLinks, ""],
                  })
                }
                className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:!bg-blue-600 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
            {years.map((year) => (
              <div key={year} className="mb-8 border rounded">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
                {yearData[year] && yearData[year].length > 0 ? (
                  <table className="min-w-full text-sm border max-w-full border-black">
                    <thead className="bg-white font-semibold text-gray-950">
                      <tr>
                        <th className="px-4 py-2 border text-gray-750">#</th>
                        <th className="px-4 py-2 border text-gray-950">Number of teachers and students using library per day</th>
                        <th className="px-4 py-2 border text-gray-950">Total number of teachers and students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearData[year].map((entry, index) => (
                        <tr key={index} className="even:bg-gray-50 text-gray-950">
                          <td className="px-2 py-2 border border-black">{index + 1}</td>
                          <td className="px-2 py-2 border border-black">{entry.number}</td>
                          <td className="px-2 py-2 border border-black">{entry.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600 px-4 py-2">No data submitted yet.</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center overflow-auto border rounded p-4">
            <div className="w-full max-w-4xl">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Calculation Table (Last 5 Years)</h2>
              <table className="table-auto border-collapse w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-semibold">
                    <th className="border border-[gray] px-4 py-2">YEAR</th>
                    {pastFiveYears.map((year) => (
                      <th key={year} className="border border-[gray] px-4 py-2">
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">Calculated Score</td>
                    {pastFiveYears.map((year) => {
                      const entry = submittedData.find((data) => data.year === year);
                      const score = entry && entry.total > 0 ? ((entry.number / entry.total) * 100).toFixed(2) : "-";
                      return (
                        <td key={year} className="border border-black px-4 py-2 text-center">
                          {score}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-blue-600">Calculate Score</button>
              </div>
              <p className="text-gray-600 mt-2">Total number of years considered: 5</p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2 mt-6">Upload Documents</label>
          <div className="flex items-center mb-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
              <i className="fas fa-upload mr-2"></i> Choose Files
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => setUploadedFiles([...e.target.files])}
              />
            </label>
            <span className="ml-3 text-gray-600">
              {uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.name).join(", ") : "No file chosen"}
            </span>
          </div>

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_2_4;
