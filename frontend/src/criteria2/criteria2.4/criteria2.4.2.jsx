import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import LandingNavbar from "../../components/landing-navbar";
const Criteria2_4_2 = () => {
  const { sessions = ["2023-24", "2024-25"] } = useContext(SessionContext);

  const [yearData, setYearData] = useState({});
  const [currentYear, setCurrentYear] = useState(sessions[0] || "");

  const [formData, setFormData] = useState({
    teacherName: "",
    qualification: "",
    qualificationYear: "",
    isResearchGuide: "",
    recognitionYear: "",
  });

  const [provisionalScore, setProvisionalScore] = useState({
    score: {
      score_sub_sub_criteria: 0,
      score_sub_criteria: 0,
      score_criteria: 0,
      grade: 0,
      weighted_cr_score: 0
    },
    message: ''
  });
  const [loadingScore, setLoadingScore] = useState(true);
  const navigate = useNavigate();

  const qualificationOptions = [
    "Ph.D.",
    "D.M.",
    "M.Ch.",
    "D.N.B Super speciality",
    "D.Sc.",
    "D.Litt.",
  ];

  const goToNextPage = () => navigate("/criteria2.4.3");
  const goToPreviousPage = () => navigate("/criteria2.4.1");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.teacherName.trim()) throw new Error("Teacher name is required");
      if (!formData.qualification) throw new Error("Qualification is required");
      if (!formData.qualificationYear || isNaN(Number(formData.qualificationYear)))
        throw new Error("Valid qualification year is required");
      if (!formData.isResearchGuide) throw new Error("Please specify if the teacher is a research guide");

      if (formData.isResearchGuide.toUpperCase() === "YES") {
        if (!formData.recognitionYear || isNaN(Number(formData.recognitionYear)))
          throw new Error("Valid recognition year is required for research guides");
      }

      if (!currentYear) throw new Error("Please select a session year before submitting.");

      // Extract first year if format is "YYYY-YY" or "YYYY-YYYY"
      const sessionYear = currentYear.split("-")[0];

      const submissionData = {
        session: sessionYear,
        number_of_full_time_teachers: 1, // static value for now
        qualification: formData.qualification,
        year_of_obtaining_the_qualification: Number(formData.qualificationYear),
        whether_recognised_as_research_guide:
          formData.isResearchGuide.toUpperCase() === "YES" ? 1 : 0,
        year_of_recognition_as_research_guide:
          formData.isResearchGuide.toUpperCase() === "YES"
            ? Number(formData.recognitionYear)
            : null,
      };

      console.log("Submitting data:", submissionData);

      await axios.post(
        "http://localhost:3000/api/v1/criteria2/createResponse242",
        submissionData
      );

      const updatedYearData = {
        ...yearData,
        [currentYear]: [...(yearData[currentYear] || []), formData],
      };
      setYearData(updatedYearData);

      // Reset form
      setFormData({
        teacherName: "",
        qualification: "",
        qualificationYear: "",
        isResearchGuide: "",
        recognitionYear: "",
      });

      // Re-fetch score
      await fetchScore();

      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      const errMsg =
        error.response?.data?.message || error.message || "Failed to save data. Please try again.";
      alert(`Error: ${errMsg}`);
    }
  };

  const fetchScore = async () => {
    try {
      setLoadingScore(true);
      const response = await axios.get(
        "http://localhost:3000/api/v1/criteria2/score242",
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
        grade: scoreData.sub_sub_cr_grade,
        weighted_score: scoreData.weighted_cr_score
      });
      
      // Format the scores to match the component's expected structure
      const parsedScore = {
        score_sub_sub_criteria: parseFloat(scoreData.score_sub_sub_criteria) || 0,
        score_sub_criteria: parseFloat(scoreData.score_sub_criteria) || 0,
        score_criteria: parseFloat(scoreData.score_criteria) || 0,
        grade: scoreData.sub_sub_cr_grade || 0,
        weighted_cr_score: scoreData.weighted_cr_score || 0
      };
  
      setProvisionalScore({
        score: parsedScore,
        message: responseData.message || "Score loaded successfully"
      });
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      setProvisionalScore({
        score: {
          score_sub_sub_criteria: 0,
          score_sub_criteria: 0,
          score_criteria: 0,
          grade: 0,
          weighted_cr_score: 0
        },
        message: error.response?.data?.message || "Failed to fetch provisional score"
      });
    } finally {
      setLoadingScore(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden text-black">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            2.4.2 Average percentage of full time teachers with Ph.D./D.M./M.Ch./D.N.B Super speciality/D.Sc./D.Litt. during the last five years
          </h2>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loadingScore ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore.score.score_sub_sub_criteria > 0 ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (2.4.2): {provisionalScore.score.score_sub_sub_criteria.toFixed(2)} %
                </p>
                <p className="text-sm text-gray-600">
                  Sub-criteria Score: {provisionalScore.score.score_sub_criteria.toFixed(2)} %
                </p>
                <p className="text-sm text-gray-600">
                  Overall Criteria Score: {provisionalScore.score.score_criteria.toFixed(2)} %
                </p>
                <p className="text-sm text-gray-600">
                  Grade: {provisionalScore.score.grade}
                </p>
                <p className="text-sm text-gray-600">
                  Weighted Score: {provisionalScore.score.weighted_cr_score}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Please submit data to calculate score.</p>
            )}
            {provisionalScore.message && !loadingScore && (
              <p className="text-sm mt-2 text-blue-600">{provisionalScore.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="font-medium text-black mr-2">Select Year:</label>
            <select
              className="border rounded px-3 py-1"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
            >
              <option value="" disabled>Select Year</option>
              {sessions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <table className="w-full border text-sm mb-6">
            <thead className="bg-gray-200">
              <tr className="text-black font-semibold">
                <th className="border px-2 py-1">Name of full time teacher</th>
                <th className="border px-2 py-1">Highest Qualification</th>
                <th className="border px-2 py-1">Year of Qualification</th>
                <th className="border px-2 py-1">Recognised as Research Guide</th>
                <th className="border px-2 py-1">Year of Recognition</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-black"
                    value={formData.teacherName}
                    onChange={(e) => handleChange("teacherName", e.target.value)}
                    placeholder="Teacher Name"
                  />
                </td>
                <td className="border px-2 py-1">
                  <select
                    className="w-full border rounded px-2 py-1 text-black"
                    value={formData.qualification}
                    onChange={(e) => handleChange("qualification", e.target.value)}
                  >
                    <option value="">Select Qualification</option>
                    {qualificationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-black"
                    value={formData.qualificationYear}
                    onChange={(e) => handleChange("qualificationYear", e.target.value)}
                    placeholder="Qualification Year"
                  />
                </td>
                <td className="border px-2 py-1">
                  <select
                    className="w-full border rounded px-2 py-1 text-black"
                    value={formData.isResearchGuide}
                    onChange={(e) => handleChange("isResearchGuide", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-black"
                    value={formData.recognitionYear}
                    onChange={(e) => handleChange("recognitionYear", e.target.value)}
                    placeholder="Recognition Year"
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

          {sessions.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="bg-blue-100 px-4 py-2 font-semibold text-black">
                Year: {year}
              </h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200 text-black font-semibold">
                    <tr>
                      <th className="border px-2 py-1">#</th>
                      <th className="border px-2 py-1">Teacher Name</th>
                      <th className="border px-2 py-1">Qualification</th>
                      <th className="border px-2 py-1">Year of Qualification</th>
                      <th className="border px-2 py-1">Research Guide</th>
                      <th className="border px-2 py-1">Year of Recognition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50 text-black">
                        <td className="border px-2 py-1">{index + 1}</td>
                        <td className="border px-2 py-1">{entry.teacherName}</td>
                        <td className="border px-2 py-1">{entry.qualification}</td>
                        <td className="border px-2 py-1">{entry.qualificationYear}</td>
                        <td className="border px-2 py-1">{entry.isResearchGuide}</td>
                        <td className="border px-2 py-1">{entry.recognitionYear}</td>
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

export default Criteria2_4_2;
