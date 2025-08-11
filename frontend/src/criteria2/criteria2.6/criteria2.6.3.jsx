import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import LandingNavbar from "../../components/landing-navbar";

const Criteria2_6_3 = () => {
  const { sessions } = useContext(SessionContext);
  const [yearData, setYearData] = useState({});
  const [currentYear, setCurrentYear] = useState(sessions[0] || "");
  const [formData, setFormData] = useState({
    programme_code: "",
    programme_name: "",
    number_of_students_appeared_in_the_final_year_examination: "",
    number_of_students_passed_in_the_final_year_examination: "",
  });

  const [fileDescriptions, setFileDescriptions] = useState({
    dataTemplate: null,
    additionalInfo: null,
    annualReportLink: "",
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

  const goToNextPage = () => navigate("/criteria2.7.1");
  const goToPreviousPage = () => navigate("/criteria2.6.2");

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const fields = Object.values(formData);
    if (fields.every((v) => v.toString().trim() !== "")) {
      try {
        const sessionYear = Number(currentYear.split("-")[0]);

        const submissionData = {
          session: sessionYear,
          year: sessionYear,
          programme_code: formData.programme_code,
          programme_name: formData.programme_name,
          number_of_students_appeared_in_the_final_year_examination: Number(
            formData.number_of_students_appeared_in_the_final_year_examination
          ),
          number_of_students_passed_in_the_final_year_examination: Number(
            formData.number_of_students_passed_in_the_final_year_examination
          ),
        };

        console.log("Submitting data:", submissionData);

        await axios.post(
          "http://localhost:3000/api/v1/criteria2/createResponse263",
          submissionData
        );

        const updatedYearData = {
          ...yearData,
          [currentYear]: [...(yearData[currentYear] || []), formData],
        };
        setYearData(updatedYearData);
        setFormData({
          programme_code: "",
          programme_name: "",
          number_of_students_appeared_in_the_final_year_examination: "",
          number_of_students_passed_in_the_final_year_examination: "",
        });

        // ✅ Fetch updated score after submission
        await fetchScore();

        alert("Data submitted successfully!");
      } catch (error) {
        console.error("Error submitting data:", error);
        const errMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to submit data. Please try again.";
        alert(`Error: ${errMsg}`);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleFileChange = (field, file) => {
    setFileDescriptions({ ...fileDescriptions, [field]: file });
  };

  const fetchScore = async () => {
    try {
      setLoadingScore(true);
      const response = await axios.get(
        "http://localhost:3000/api/v1/criteria2/score263",
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
          <div className="bg-white border rounded p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              2.6.3 Metric Information
            </h2>
            <p className="text-black">
              Average pass percentage of Students during last five years
            </p>
            <h3 className="text-blue-800 font-semibold mt-4">
              Data Requirement (As per Data Template)
            </h3>
            <ul className="list-disc pl-6 text-black mt-2 space-y-1">
              <li>Programme code</li>
              <li>Name of the Programme</li>
              <li>Number of Students appeared</li>
              <li>Number of Students passed</li>
              <li>Pass percentage</li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            2.6.3 Average pass percentage of Students during last five years
          </h2>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loadingScore ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore.score.score_sub_sub_criteria > 0 ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (2.6.3): {provisionalScore.score.score_sub_sub_criteria.toFixed(2)} %
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
              className="border px-3 py-1 rounded text-black"
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
                <th className="border px-2 py-1">Program Code</th>
                <th className="border px-2 py-1">Program Name</th>
                <th className="border px-2 py-1">No. Appeared</th>
                <th className="border px-2 py-1">No. Passed</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-black"
                    value={formData.programme_code}
                    onChange={(e) =>
                      handleChange("programme_code", e.target.value)
                    }
                    placeholder="Program Code"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-black"
                    value={formData.programme_name}
                    onChange={(e) =>
                      handleChange("programme_name", e.target.value)
                    }
                    placeholder="Program Name"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-black"
                    value={
                      formData.number_of_students_appeared_in_the_final_year_examination
                    }
                    onChange={(e) =>
                      handleChange(
                        "number_of_students_appeared_in_the_final_year_examination",
                        e.target.value
                      )
                    }
                    placeholder="Number Appeared"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-black"
                    value={
                      formData.number_of_students_passed_in_the_final_year_examination
                    }
                    onChange={(e) =>
                      handleChange(
                        "number_of_students_passed_in_the_final_year_examination",
                        e.target.value
                      )
                    }
                    placeholder="Number Passed"
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
                      <th className="border px-2 py-1">Program Code</th>
                      <th className="border px-2 py-1">Program Name</th>
                      <th className="border px-2 py-1">Appeared</th>
                      <th className="border px-2 py-1">Passed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50 text-black">
                        <td className="border px-2 py-1">{index + 1}</td>
                        <td className="border px-2 py-1">{entry.programme_code}</td>
                        <td className="border px-2 py-1">{entry.programme_name}</td>
                        <td className="border px-2 py-1">
                          {
                            entry.number_of_students_appeared_in_the_final_year_examination
                          }
                        </td>
                        <td className="border px-2 py-1">
                          {
                            entry.number_of_students_passed_in_the_final_year_examination
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">
                  No data submitted for this year.
                </p>
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

export default Criteria2_6_3;
