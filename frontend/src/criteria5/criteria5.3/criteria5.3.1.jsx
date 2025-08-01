import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria5_3_1 = () => {
  const currentYear = new Date().getFullYear();

  const pastFiveYears=Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`)
  {/*const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${(currentYear - i + 1).toString().slice(-2)}`);*/}

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [formData, setFormData] = useState({
    year: "",
    name: "",
    team: "",
    uni: "",
    sports: "",
    studentname: "",
    
    supportLinks: [""],
  });
  const [submittedData, setSubmittedData] = useState([]);

  const navigate = useNavigate();

  const handleChange = (field, value, index = null) => {
  if (field === "supportLinks") {
    const updatedLinks = [...formData.supportLinks];
    updatedLinks[index] = value;
    setFormData({ ...formData, supportLinks: updatedLinks });
  } else {
    setFormData({ ...formData, [field]: value });
  }
};
  const handleSubmit = () => {
    if (
      formData.year &&
      formData.name &&
      formData.team &&
      formData.uni &&
      formData.sports &&
      formData.studentname 
    ) {
      const entryWithYear = { ...formData, year: selectedYear };
      setSubmittedData([...submittedData, entryWithYear]);
      setFormData({
        year: "",
        name: "",
        team: "",
        uni: "",
        sports: "",
        studentname: "",
        supportLinks: [""],
      });
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const goToNextPage = () => {
    navigate("/criteria5.3.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria5.2.3");
  };

  return (
    <div className="min-h-screen w-[1520px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 5: Student Support and Progression
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">5.3-Student Participation and Activities</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <div className="text-lg font-medium text-green-500 bg-[#bee7c7] !w-[1000px] h-[50px] pt-[10px] rounded-lg">
                  Provisional Score: 18.75
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">5.3.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Number of awards/medals for outstanding performance in sports/cultural activities at university/state/national / international level (award for a team event should be counted as one)
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">e-copies of award letters and certificates</li>
                <li>Number of awards/medals for outstanding performance in
sports/cultural activities at university/state/national/international
level</li>
<li>Any additional information</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Number of awards/medals for outstanding performance in sports/cultural activities at university/state/national / international level</h2>

          {/* Year Dropdown */}
          <div className="mb-4">
            <label className="text-gray-700 font-medium mr-2 ">Select Year:</label>
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

          {/* Input Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  {[
                    "Year",
                    "Name of the award",
                    "Team/Individual",
                    "University/State/National/ International ",
                    "Sports/ Cultural ",
                    "Name of the student",
                   
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
                  {[
                    "year",
                    "name",
                    "team",
                    "uni",
                    "sports",
                    "name",
                  ].map((field) => (
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
                      className="px-3 py-1 !bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dynamic Support Links Input */}
<div className="mb-6">
  <label className="block text-gray-700 font-medium mb-2">
   Link to relevant documents
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
      className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
    >
      + Add Another Link
    </button>
  </div>
</div>


          {/* Submitted Data Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <div className="w-full max-w-full">
              <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
              {submittedData.length > 0 ? (
                <table className="min-w-full text-sm border max-w-full border-black">
                  <thead className="bg-white font-semibold text-gray-950">
                    <tr>
                      <th className="px-4 py-2 border text-gray-750">#</th>
                      <th className="px-4 py-2 border text-gray-950">Year</th>
                      {[
                        "Year",
                        "Name of the award",
                        "Team/Individual",
                        "University/State/National/ International ",
                        "Sports/ Cultural ",
                        "Name of the student",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-2 border text-gray-950">
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
                        <td className="px-2 py-2 border border-black">{entry.team}</td>
                        <td className="px-2 py-2 border border-black">{entry.uni}</td>
                        <td className="px-2 py-2 border border-black">{entry.sports}</td>
                        <td className="px-2 py-2 border border-black">{entry.name}</td>
                        
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
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">
                      Calculated Score
                    </td>
                    {pastFiveYears.map((year) => (
                      <td key={year} className="border border-black px-4 py-2 text-center">
                        -
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 !bg-blue-600 text-white rounded hover:bg-blue-700">
                  Calculate Score
                </button>
              </div>
              <p className="text-gray-600 mt-2">Total number of years considered: 5</p>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_3_1;
