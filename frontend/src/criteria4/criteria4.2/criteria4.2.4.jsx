import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria4_2_4 = () => {
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [submittedData, setSubmittedData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    number: "",
    supportLinks: [""],
  });

  // Session initialization effects
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      const initialSession = sessions[0];
      setCurrentYear(initialSession);
    }
  }, [sessions]);
  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria4/score424");
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
      const newLinks = [...formData.supportLinks];
      newLinks[index] = value;
      setFormData({ ...formData, supportLinks: newLinks });
    } else if (field === 'year') {
      setFormData(prev => ({
        ...prev,
        year: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    const number = formData.number.trim();
    const year = currentYear.split('-')[0]; // Get year from selected session
    console.log("Selected Session Year:", year);

    const parsedNumber = parseFloat(number);

    if (!number || isNaN(parsedNumber) || parsedNumber <= 0) {
      alert("Please enter a valid number of users.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria4/createResponse424", {
        session: parseInt(year),
        no_of_teachers_stds: parsedNumber
      });

      const resp = response?.data?.data || {};
      const newEntry = {
        number: resp.no_of_teachers_stds || parsedNumber,
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        number: "",
      }));
      
      // Fetch updated score
      await fetchScore();
      alert("Library usage data submitted successfully!");
    } catch (error) {
      console.error("Error submitting library usage data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit library usage data");
    }
  };

  const navigate = useNavigate();

  const goToNextPage = () => {
    navigate("/criteria1.2.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.1.3");
  };

  // Generate year-wise grouped data using availableSessions
  const yearData = availableSessions.length > 0 ? 
    availableSessions.reduce((acc, session) => {
      const yearKey = session.split('-')[0];
      acc[session] = submittedData.filter((entry) => entry.year === yearKey);
      return acc;
    }, {}) : 
    pastFiveYears.reduce((acc, year) => {
      const yearKey = year.split('-')[0];
      acc[year] = submittedData.filter((entry) => entry.year === yearKey);
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

          {/* Provisional Score */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (4.2.4): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
                  ? (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria).toFixed(2)
                  : (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria)} %
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                </span>
              </p>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
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

          {/* Year Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              value={currentYear}
              onChange={(e) => {
                const newSession = e.target.value;
                setCurrentYear(newSession);
                setSelectedYear(newSession);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-gray-950"
            >
              {availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  <th className="px-4 py-2 border">Number of teachers and students using library per day</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>

                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => handleChange("number", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Number of users"
                    />
                  </td>
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
            {pastFiveYears.map((year) => (
              <div key={year} className="mb-8 border rounded">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
                {yearData[year] && yearData[year].length > 0 ? (
                  <table className="min-w-full text-sm border max-w-full border-black">
                    <thead className="bg-white font-semibold text-gray-950">
                      <tr>
                        <th className="px-4 py-2 border text-gray-750">#</th>
                        <th className="px-4 py-2 border text-gray-950">Number of teachers and students using library per day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearData[year].map((entry, index) => (
                        <tr key={index} className="even:bg-gray-50 text-gray-950">
                          <td className="px-2 py-2 border border-black">{index + 1}</td>
                          <td className="px-2 py-2 border border-black">{entry.number} users per day</td>
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
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">Users per Day</td>
                    {pastFiveYears.map((year) => {
                      const yearKey = year.split('-')[0];
                      const entry = submittedData.find((data) => data.year === yearKey);
                      return (
                        <td key={year} className="border border-black px-4 py-2 text-center">
                          {entry ? `${entry.number} users` : "-"}
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