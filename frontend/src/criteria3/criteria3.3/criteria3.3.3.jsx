import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria3_3_3 = () => {
  const currentYear = new Date().getFullYear();
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${(currentYear - i + 1).toString().slice(-2)}`);

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    activity: "",
    agency: "",
    scheme: "",
    year: "",
    participants: "",
    supportLinks: []
  });

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
    const { activity, agency, scheme, year, participants, supportLinks } = formData;
    if (activity && agency && scheme && year && participants) {
      const dataToSubmit = {
        activity,
        agency,
        scheme,
        year,
        participants,
        supportLinks
      };

      const updatedYearData = {
        ...yearData,
        [year]: [...(yearData[year] || []), dataToSubmit]
      };
      setYearData(updatedYearData);

      setFormData({
        activity: "",
        agency: "",
        scheme: "",
        year: "",
        participants: "",
        supportLinks: []
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goToNextPage = () => navigate("/criteria3.3.4");
  const goToPreviousPage = () => navigate("/criteria3.3.2");

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
            <div className="text-sm text-gray-600">3.3 - Extension Activities</div>
          </div>

          {/* Info */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">3.3.3 Metric Information</h3>
            <p className="text-sm text-gray-700 mb-4">
              Number of extension and outreach Programs conducted in collaboration with industry, community and
              Non-Government Organizations through NSS/NCC/Red Cross/YRC etc., year-wise during the last five years.
            </p>
            <h4 className="text-blue-600 font-semibold mb-2">Requirements:</h4>
            <ul className="list-disc text-sm text-gray-700 pl-5 space-y-1">
              <li>Reports of the event organized</li>
              <li>Any additional information</li>
            </ul>
          </div>

          {/* Input Form Table */}
          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-lg font-semibold">Add Record</h2>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-medium">Select Year:</label>
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
            </div>

            

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Activity Name</th>
                  <th className="border px-2 py-2">Organising Agency</th>
                  <th className="border px-2 py-2">Scheme Name</th>
                  <th className="border px-2 py-2">Year</th>
                  <th className="border px-2 py-2">No. of Participants</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.activity}
                      onChange={(e) => handleChange("activity", e.target.value)}
                      placeholder="Activity"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.agency}
                      onChange={(e) => handleChange("agency", e.target.value)}
                      placeholder="Agency"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.scheme}
                      onChange={(e) => handleChange("scheme", e.target.value)}
                      placeholder="Scheme"
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
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      value={formData.participants}
                      onChange={(e) => handleChange("participants", e.target.value)}
                      placeholder="Participants"
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

          {/* Links to Relevant Documents */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Links to relevant documents:</label>
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
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          {/* Year-wise Records */}
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
                      <th className="border text-gray-950 px-4 py-2">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.activity}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.agency}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.scheme}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.participants}</td>
                        <td className="border text-gray-950 px-2 py-1">
                          {entry.supportLinks?.map((link, i) => (
                            <div key={i}>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                Link {i + 1}
                              </a>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Bottom Navigation */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_3_3;
