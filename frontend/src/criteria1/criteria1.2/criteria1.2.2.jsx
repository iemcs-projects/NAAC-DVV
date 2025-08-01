import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LandingNavbar from "../../components/landing-navbar";
import { SessionContext } from "../../contextprovider/sessioncontext"; 

const Criteria1_2_2 = () => {
  // sessions is ["2023-24",...]; only "2023" is sent as session
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  // This controls the year/session dropdown
  const [selectedSession, setSelectedSession] = useState("");

  // This controls the form for add-on/certificate programs
  const [formData, setFormData] = useState({
    program_name: "",
    course_code: "",
    year_of_offering: "",
    no_of_times_offered: "",
    duration: "",
    no_of_students_enrolled: "",
    no_of_students_completed: "",
    supportLinks: [""],
  });

  // This stores all data entries, grouped by session
  const [yearData, setYearData] = useState({});
  const [years, setYears] = useState([]);
  const [currentYear, setCurrentYear] = useState("");

  // Score states
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Set selectedSession default when sessions load
  useEffect(() => {
    if (!selectedSession && sessions && sessions.length > 0) {
      setSelectedSession(sessions[0]);
    }
  }, [sessions, selectedSession]);

  // Set default selected session on sessions load
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setCurrentYear(sessions[0]); // Default to most recent session
    }
  }, [sessions]);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score122");
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

  const handleCalculateScore = () => {
    fetchScore();
  };

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...formData.supportLinks];
      updatedLinks[index] = value;
      setFormData({ ...formData, supportLinks: updatedLinks });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
   
    if (
      formData.program_name &&
      formData.course_code &&
      formData.year_of_offering &&
      formData.no_of_times_offered &&
      formData.duration &&
      formData.no_of_students_enrolled &&
      formData.no_of_students_completed
    ) {
      try {
        // Extract the first year from the selected session string ('2023-24' => '2023')
        const session = selectedSession?.split("-")?.[0] || "";

        // Construct payload exactly as backend expects
        const payload = {
          session: session,
          program_name: formData.program_name,
          course_code: formData.course_code,
          year_of_offering: formData.year_of_offering,
          no_of_times_offered: formData.no_of_times_offered,
          duration: formData.duration,
          no_of_students_enrolled: formData.no_of_students_enrolled,
          no_of_students_completed: formData.no_of_students_completed,
          supportLinks: formData.supportLinks, // Include in body if backend accepts!
        };

        const response= await axios.post("http://localhost:3000/api/v1/criteria1/createResponse122_123", payload);
        console.log(response);

        // Table grouping: by session (e.g. "2023-24")
        const updatedYearData = {
          ...yearData,
          [selectedSession]: [...(yearData[selectedSession] || []), payload],
        };
        setYearData(updatedYearData);

        alert("Data submitted successfully!");
        fetchScore();
      } catch (error) {
        console.error("Error submitting:", error);
        if (error.response && error.response.data) {
          alert("Submission failed: " + error.response.data.message);
        } else {
          alert("Submission failed due to network/server error.");
        }
      }
      setFormData({
        program_name: "",
        course_code: "",
        year_of_offering: "",
        no_of_times_offered: "",
        duration: "",
        no_of_students_enrolled: "",
        no_of_students_completed: "",
        supportLinks: [""],
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goToNextPage = () => {
    navigate("/criteria1.2.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.2.1");
  };

  // For table display, use current sessions list; if not, fallback to those present in yearData
  const yearsToList = sessions?.length > 0
    ? sessions
    : Object.keys(yearData).sort().reverse();

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 1: Curricular Aspects
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">1.2-Academic Flexibility</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Provisional Score Banner */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <span className="font-semibold text-gray-700">Provisional Score:&nbsp;</span>
                {loading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : error ? (
                  <span className="text-red-500">Error: {error}</span>
                ) : provisionalScore ? (
                  <div className="text-center">
                    <div className="text-blue-600 text-lg font-bold">
                      Score: {provisionalScore.data?.score || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Score not available</span>
                )}
              </div>
            </div>
            </div>
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">1.2.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Number of Add on /Certificate programs offered during the last five years
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Brochure or any other document relating to Add on /Certificate programs</li>
                <li>List of Add on /Certificate programs</li>
              </ul>
            </div>
          </div>

          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Add On Programs</h2>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-medium">Select Year:</label>
                {sessionLoading ? (
                  <span className="text-gray-500">Loading sessions...</span>
                ) : sessionError ? (
                  <span className="text-red-500">Error: {sessionError}</span>
                ) : (
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="border border-gray-300 px-3 py-1 rounded text-gray-950"
                  >
                    {sessions.length === 0 ? (
                      <option value="">No sessions available</option>
                    ) : (
                      sessions.map((session) => (
                        <option key={session} value={session}>
                          {session}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Program Name</th>
                  <th className="border px-2 py-2">Program Code</th>
                  <th className="border px-2 py-2">Year of Offering</th>
                  <th className="border px-2 py-2">Times Offered</th>
                  <th className="border px-2 py-2">Duration</th>
                  <th className="border px-2 py-2">Students Enrolled</th>
                  <th className="border px-2 py-2">Students Completed</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Program Name"
                      value={formData.program_name}
                      onChange={(e) => handleChange("program_name", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Program Code"
                      value={formData.course_code}
                      onChange={(e) => handleChange("course_code", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Year of Offering"
                      value={formData.year_of_offering}
                      onChange={(e) => handleChange("year_of_offering", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Times Offered"
                      value={formData.no_of_times_offered}
                      onChange={(e) => handleChange("no_of_times_offered", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Duration"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Students Enrolled"
                      value={formData.no_of_students_enrolled}
                      onChange={(e) => handleChange("no_of_students_enrolled", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Students Completed"
                      value={formData.no_of_students_completed}
                      onChange={(e) => handleChange("no_of_students_completed", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="!bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={handleSubmit}
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
            <label className="block text-gray-700 font-medium mb-2">Links to relevant documents</label>
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
                className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          {/* Submitted entries, per session */}
          {yearsToList.map((session) => (
            <div key={session} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {session}</h3>
              {yearData[session] && yearData[session].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-950 px-4 py-2">#</th>
                      <th className="border text-gray-950 px-4 py-2">Program Name</th>
                      <th className="border text-gray-950 px-4 py-2">Code</th>
                      <th className="border text-gray-950 px-4 py-2">Year</th>
                      <th className="border text-gray-950 px-4 py-2">Times</th>
                      <th className="border text-gray-950 px-4 py-2">Duration</th>
                      <th className="border text-gray-950 px-4 py-2">Students Enrolled</th>
                      <th className="border text-gray-950 px-4 py-2">Students Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.program_name}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.course_code}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year_of_offering}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.no_of_times_offered}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.duration}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.no_of_students_enrolled}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.no_of_students_completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          <div className="flex justify-end mt-4 mb-6">
            <button
              className="px-4 py-2 !bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleCalculateScore}>
              Calculate Score
            </button>
          </div>
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria1_2_2;
