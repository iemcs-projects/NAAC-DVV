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

const Criteria4_1_3 = () => {
  const { sessions: availableSessions } = useContext(SessionContext);
  const pastFiveYears = availableSessions || [];
  const [selectedYear, setSelectedYear] = useState(availableSessions?.[0] || "");
  const [currentYear, setCurrentYear] = useState(availableSessions?.[0] || "");

  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    room_identifier: "",
    typeict_facility: "",
    ict_facilities_count: "",
    supportLinks: [""]
  });

  // Initialize supportLinks if they become undefined
  useEffect(() => {
    if (!formData.supportLinks) {
      setFormData(prev => ({
        ...prev,
        supportLinks: [""]
      }));
    }
  }, [formData.supportLinks]);

  const [submittedData, setSubmittedData] = useState([]);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);

  const navigate = useNavigate();
  const years = pastFiveYears;

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
      const response = await axios.get("http://localhost:3000/api/v1/criteria4/score413");
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

  const addSupportLink = () => {
    setFormData(prev => ({
      ...prev,
      supportLinks: [...prev.supportLinks, ""]
    }));
  };

  const removeSupportLink = (index) => {
    const updatedLinks = formData.supportLinks.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      supportLinks: updatedLinks
    }));
  };

  const handleSubmit = async () => {
    const { room_identifier, typeict_facility, ict_facilities_count } = formData;
    const session = currentYear.split("-")[0];

    if (!room_identifier || !typeict_facility || !ict_facilities_count) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria4/createResponse413",
        {
          session: parseInt(session, 10),
          criteria_code: "4.1.3",
          room_identifier: room_identifier.trim(),
          typeict_facility: typeict_facility.trim(),
          ict_facilities_count: parseInt(ict_facilities_count, 10),
          
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      const newEntry = {
        year: currentYear,
        room_identifier: room_identifier.trim(),
        typeict_facility: typeict_facility.trim(),
        ict_facilities_count: parseInt(ict_facilities_count, 10),
       
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      setYearData((prev) => ({
        ...prev,
        [currentYear]: [...(prev[currentYear] || []), newEntry],
      }));

      // Reset form
      setFormData({
        room_identifier: "",
        typeict_facility: "",
        ict_facilities_count: "",
       
      });
      
      fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

  const goToNextPage = () => navigate("/criteria4.1.4");
  const goToPreviousPage = () => navigate("/criteria4.1.2");

  const totalPrograms = years.reduce((acc, year) => acc + (yearData[year]?.length || 0), 0);
  const averagePrograms = (totalPrograms / years.length).toFixed(2);

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      
      <div className="flex w-full">
        <Sidebar />
        
        <div className="flex-1 p-6 flex flex-col min-h-screen">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criterion 4 - Infrastructure and Learning Resources
            </h2>
            <div className="text-sm text-gray-600">– 4.1 Physical Facilities</div>
          </div>

          {/* Metric Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">4.1.3 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Percentage of classrooms and seminar halls with ICT- enabled
              facilities such as smart class, LMS, etc. 
            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>Number of classrooms with LCD facilities</li>
              <li>Number of classrooms with Wi-Fi/LAN facilities</li>
              <li>Number of smart classrooms</li>
              <li>Number of classrooms with LMS facilities</li>
              <li>Number of seminar halls with ICT facilities</li>
            </ul>
          </div>

          {/* Provisional Score Section */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (4.1.3): {provisionalScore.data.score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>

          {/* Main Form Section */}
          <div className="border rounded mb-6">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">
                Percentage of classrooms and seminar halls with ICT- enabled
                facilities such as smart class, LMS, etc. 
              </h2>
              <div>
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
            </div>

            {/* ICT Facilities Count Input */}
            <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">
                  No. of classrooms with ICT facilities:
                </label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-gray-950"
                  placeholder="Enter count"
                  min="0"
                  value={formData.ict_facilities_count}
                  onChange={(e) => handleChange("ict_facilities_count", e.target.value)}
                />
              </div>
            </div>

            {/* Data Entry Table */}
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Room number or Name of Classrooms and Seminar halls with ICT-enabled facilities</th>
                  <th className="border px-2 py-2">Type of ICT facility</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Room Identifier"
                      value={formData.room_identifier}
                      onChange={(e) => handleChange("room_identifier", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Type ICT Facility"
                      value={formData.typeict_facility}
                      onChange={(e) => handleChange("typeict_facility", e.target.value)}
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

          {/* Support Document Links Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Support Document Links:
            </label>
            <div className="flex flex-col gap-2">
              {Array.isArray(formData.supportLinks) ? formData.supportLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder={`Enter support link ${index + 1}`}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-gray-950"
                    value={link}
                    onChange={(e) => handleChange("supportLinks", e.target.value, index)}
                  />
                  {formData.supportLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSupportLink(index)}
                      className="px-3 py-1 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )) : null}
              <button
                type="button"
                onClick={addSupportLink}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          {/* Year-wise Data Display */}
          {years.map((year) => (
            <div key={year} className="mb-6 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year]?.length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-900 px-2 py-1">#</th>
                      <th className="border px-2 py-2">Room number or Name of Classrooms and Seminar halls with ICT-enabled facilities</th>
                      <th className="border px-2 py-2">Type of ICT facility</th>
                      <th className="border px-2 py-2">Link to geo tagged photos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        <td className="border text-gray-900 border-black px-2 py-1">{idx + 1}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.room_identifier}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.typeict_facility}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">
                          {entry.supportLinks && entry.supportLinks.length > 0 ? (
                            <div className="space-y-1">
                              {entry.supportLinks.map((link, linkIdx) => (
                                <div key={linkIdx}>
                                  <a 
                                    href={link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline block break-all"
                                  >
                                    Link {linkIdx + 1}
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">No links provided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 p-4">No data available for {year}.</p>
              )}
            </div>
          ))}

          {/* Calculation Table Section */}
          <div className="border rounded p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Calculation Table (Last 5 Years)
            </h2>
            <div className="overflow-auto">
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
            
            <div className="flex items-center gap-2 mt-4">
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

          {/* Bottom Navigation - Fixed at bottom */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_1_3;