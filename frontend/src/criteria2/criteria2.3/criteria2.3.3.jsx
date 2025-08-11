import React, { useState, useEffect, useContext, useCallback } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import LandingNavbar from "../../components/landing-navbar";

const Criteria2_3_3 = () => {
  const { sessions: sessionYears, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    if (!isLoadingSessions && sessionYears && sessionYears.length > 0) {
      setSelectedYear(sessionYears[0]);
    }
  }, [sessionYears, isLoadingSessions]);

  const [formData, setFormData] = useState({
    mentors: "",
    mentees: "",
  });

  const [ratio, setRatio] = useState(null);
  const [uploads, setUploads] = useState({
    yearwiseData: null,
    circulars: null,
    ratioDoc: null,
  });

  const [provisionalScore, setProvisionalScore] = useState({
    score: {
      score_sub_sub_criteria: 0,
      score_sub_criteria: 0,
      score_criteria: 0
    },
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const goToNextPage = () => navigate("/criteria2.4.1");
  const goToPreviousPage = () => navigate("/criteria2.3.2");

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field, file) => {
    setUploads({ ...uploads, [field]: file });
  };

  // Define fetchScore with useCallback to prevent recreation on every render
  const fetchScore = useCallback(async () => {
    console.log('fetchScore called for criteria 2.3.3');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/criteria2/score233",
        { withCredentials: true }
      );
      console.log("Fetched score data:", response.data);
      
      // Handle the actual response structure
      const responseData = response.data;
      const scoreData = responseData.data; // The scores are in the data property
      
      console.log('Score data:', {
        sub_sub_criteria: scoreData.score_sub_sub_criteria,
        sub_criteria: scoreData.score_sub_criteria,
        criteria: scoreData.score_criteria,
        grade: scoreData.sub_sub_cr_grade
      });
      
      // Format the scores to match the component's expected structure
      const parsedScore = {
        score_sub_sub_criteria: parseFloat(scoreData.score_sub_sub_criteria) || 0,
        score_sub_criteria: parseFloat(scoreData.score_sub_criteria) || 0,
        score_criteria: parseFloat(scoreData.score_criteria) || 0,
        grade: scoreData.sub_sub_cr_grade || 0
      };
  
      setProvisionalScore({
        score: parsedScore,
        message: responseData.message || "Score loaded successfully"
      });
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch provisional score");
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  // Fetch provisional score on mount and when selectedYear changes
  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  const handleSubmit = async () => {
    const { mentors, mentees } = formData;
    if (!mentors || !mentees || isNaN(mentors) || isNaN(mentees)) {
      alert("Please enter valid numbers for both mentors and mentees.");
      return;
    }
    const ratioString = `${mentors} : ${mentees}`;
    setRatio(ratioString);

    const sessionStartYear = parseInt(selectedYear.split("-")[0], 10);

    const dataToSend = {
      session: sessionStartYear,
      numberOfMentors: parseInt(mentors),
      numberOfMentees: parseInt(mentees),
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria2/createResponse233",
        dataToSend
      );

      console.log("Response created:", response.data);
      if (response.data.message) {
        alert(response.data.message);
      } else {
        alert("Data submitted successfully!");
      }
      setFormData({ mentors: "", mentees: "" });
      // Refresh the score after successful submission
      await fetchScore();
    } catch (error) {
      console.error("Error submitting:", error);
      if (error.response && error.response.data) {
        alert("Submission failed: " + error.response.data.message);
      } else {
        alert("Submission failed due to network/server error.");
      }
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden text-black">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">
            2.3.3.1 Mentor to Student Ratio
          </h2>

          {/* Session Year Dropdown */}
          <div className="mb-6">
            <label className="block font-medium mb-1">Select Session Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? (
                <option>Loading sessions...</option>
              ) : sessionError ? (
                <option>Error loading sessions</option>
              ) : sessionYears && sessionYears.length > 0 ? (
                sessionYears.map((year, idx) => (
                  <option key={idx} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option>No sessions available</option>
              )}
            </select>
          </div>

          {/* Provisional Score Display */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <span className="font-semibold text-gray-700">Provisional Score:&nbsp;</span>
                {loading ? (
                  <div className="text-center">
                    <span className="text-gray-500">Loading...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mt-2"></div>
                  </div>
                ) : error ? (
                  <div className="text-center">
                    <span className="text-red-500">Error: {error}</span>
                    {/* <button
                      onClick={fetchScore}
                      className="text-blue-500 hover:text-blue-700 mt-2"
                    >
                      Try again
                    </button> */}
                  </div>
                ) : provisionalScore?.score ? (
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="text-blue-600 text-lg font-bold">
                        {typeof provisionalScore.score.score_sub_sub_criteria === 'number' 
                          ? provisionalScore.score.score_sub_sub_criteria.toFixed(2) 
                          : '0.00'}
                      </span>
                    </div>
                    {provisionalScore.message && (
                      <span className="block text-gray-600 mt-1">
                        {provisionalScore.message}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-gray-500">Score not available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metric Info Section */}
          <div className="bg-white text-black p-4 mb-6">
            <h3 className="text-blue-700 text-lg font-semibold mb-2">
              2.3.3 Metric Information
            </h3>
            <p className="mb-4">
              Ratio of mentor to students for academic and other related issues (Data for the latest completed academic year)
            </p>
            <h4 className="text-blue-700 font-semibold mb-2">Data Requirement:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Number of mentors</li>
              <li>Number of students assigned to each Mentor</li>
            </ul>
          </div>

          {/* Input Table */}
          <table className="w-full border text-sm mb-6">
            <thead className="bg-blue-100 font-semibold">
              <tr>
                <th className="border px-2 py-1">No. of Mentors</th>
                <th className="border px-2 py-1">No. of Mentees</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-black"
                    placeholder="mentors"
                    value={formData.mentors}
                    onChange={(e) => handleChange("mentors", e.target.value)}
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-black"
                    placeholder="mentees"
                    value={formData.mentees}
                    onChange={(e) => handleChange("mentees", e.target.value)}
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

          {/* Ratio Display */}
          {ratio && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded">
              <h3 className="text-lg font-semibold text-blue-800">Current Ratio:</h3>
              <p className="text-xl font-bold text-gray-800">{ratio}</p>
            </div>
          )}

          {/* File Upload Section */}
          <div className="mt-10 border-t pt-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              File Description (Upload)
            </h3>

            {["yearwiseData", "circulars", "ratioDoc"].map((field, idx) => (
              <div key={idx} className="mb-4">
                <label className="block font-medium mb-1 capitalize">{field}:</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(field, e.target.files[0])}
                  className="w-full border rounded px-3 py-2"
                />
                {uploads[field] && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {uploads[field].name}</p>
                )}
              </div>
            ))}
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

export default Criteria2_3_3;
