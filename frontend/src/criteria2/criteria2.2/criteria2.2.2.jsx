import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import Bottom from "../../components/bottom";
import axios from "axios";
import LandingNavbar from "../../components/landing-navbar";

const Criteria2_2_2 = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const goToNextPage = () => {
    navigate("/criteria2.3.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria2.2.1");
  };

  useEffect(() => {
    async function fetchScore() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:3000/api/v1/criteria2/score222");
        console.log("Fetched score222:", response.data);
        setScore(response.data.data);
      } catch (error) {
        console.error("Error fetching score222:", error);
        setError("Failed to load ratio. Please ensure data in 2.4.1 is filled.");
      } finally {
        setLoading(false);
      }
    }
    fetchScore();
  }, []);

  // Utility to get a valid score field from the response
  const getValidScore = (scoreObj) => {
    if (!scoreObj) return null;
    return (
      scoreObj.weighted_cr_score ||
      scoreObj.score_sub_sub_criteria ||
      scoreObj.score_sub_criteria ||
      scoreObj.score_criteria ||
      null
    );
  };

  const validScore = getValidScore(score);

  return (
    <div className="w-screen min-h-screen bg-white text-black overflow-x-auto">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <h2 className="text-2xl font-bold text-blue-900">
            2.2.2 Student - Full-time Teacher Ratio
          </h2>
          {/* Metric Info */}
          <div className="bg-white text-black p-4 border border-blue-200 rounded shadow">
            <h3 className="text-blue-700 text-lg font-semibold mb-2">
              2.2.2 Metric Information
            </h3>
            <p className="mb-4">
              Student-Full time teacher ratio (Data for the latest completed academic year)
            </p>
            <h4 className="text-blue-700 font-semibold mb-2">
              Data Requirement: (As per Data Template)
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Total number of Students enrolled in the Institution</li>
              <li>Total number of full time teachers in the Institution</li>
            </ul>
          </div>

          {/* Calculated Ratio */}
          <div className="bg-white text-black p-4 border border-green-300 rounded shadow">
            <h3 className="text-green-700 text-lg font-semibold mb-2">
              Calculated Student-Full time Teacher Ratio:
            </h3>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              {loading ? (
                <p className="text-gray-600">Loading provisional score...</p>
              ) : validScore !== null ? (
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (2.2.2): {parseFloat(validScore).toFixed(2)} %
                </p>
              ) : (
                <p className="text-gray-600">No score data available.</p>
              )}
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
            <p className="font-semibold">
              Fill in the inputs in 2.4.1 to get the corresponding results.
            </p>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              File Description (Upload)
            </h3>
            <label className="block font-medium mb-1">
              Any Additional Information:
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileChange}
              className="border border-blue-500 rounded px-3 py-2 w-full"
            />
            {file && (
              <p className="text-sm text-gray-700 mt-1">
                Selected file:{" "}
                <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs italic mt-6 text-gray-600">
            * Ratio is calculated based on latest completed academic year.
          </p>

          {/* Navigation */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria2_2_2;
