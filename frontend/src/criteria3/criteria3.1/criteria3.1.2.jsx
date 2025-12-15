
import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { useContext } from "react";
import axios from "axios";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";
import { validateDocument, isValidationPassed, formatValidationErrors } from "../../services/validatorService";

const Criteria3_1_2 = () => {
  const [validating, setValidating] = useState(false);
const [validationResults, setValidationResults] = useState(null);
const [showValidationModal, setShowValidationModal] = useState(false);
const [currentValidationFile, setCurrentValidationFile] = useState(null);
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const [currentYear, setCurrentYear] = useState(sessions?.[0] || "");
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    proj: "",
    name: "",
    princ: "",
    dept: "",
    amt: "",
    duration: "",
    agency: "",
    type: "",
    supportLinks: [""],
  });

  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);

  const navigate = useNavigate();
  const years = pastFiveYears;

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...formData.supportLinks];
      updatedLinks[index] = value;
      setFormData({ ...formData, supportLinks: updatedLinks });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Add these state variables at the top with other state declarations
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [score, setScore] = useState(null);

// Update the fetchScore function to use the correct endpoint and handle the response
useEffect(() => {
  async function fetchScore() {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score312");
      console.log("Fetched score:", response.data);
      setScore(response.data);
    } catch (error) {
      console.error("Error fetching score:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  fetchScore();
}, []);

// Utility to get a valid score from the response
const getValidScore = (scoreObj) => {
  if (!scoreObj?.data) return null;
  return (
    scoreObj.data.weighted_cr_score ||
    scoreObj.data.score_sub_sub_criteria ||
    scoreObj.data.score_sub_criteria ||
    scoreObj.data.score_criteria ||
    null
  );
};

const validScore = getValidScore(score);

  // const handleSubmit = () => {
  //   const { proj, name, princ, dept, amt, duration, agency, type } = formData;

  //   if (proj && name && princ && dept && amt && duration && agency && type) {
  //     const updatedForm = { ...formData, year: selectedYear };

  //     const updatedYearData = {
  //       ...yearData,
  //       [selectedYear]: [...(yearData[selectedYear] || []), updatedForm],
  //     };

  //     setYearData(updatedYearData);
  //     setFormData({
  //       proj: "",
  //       name: "",
  //       princ: "",
  //       year: "",
  //       amt: "",
  //       duration: "",
  //       agency: "",
  //       type: "",
  //       supportLinks: [""],
  //     });
  //   } else {
  //     alert("Please fill in all fields.");
  //   }
  // };

  const goToNextPage = () => navigate("/criteria3.1.2");
  const goToPreviousPage = () => navigate("/criteria4.4.2");

  const totalPrograms = years.reduce((acc, year) => acc + (yearData[year]?.length || 0), 0);
  const averagePrograms = (totalPrograms / years.length).toFixed(2);

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 overflow-hidden pt-8">
        <div className={`fixed top-8 left-0 bottom-0 z-40 ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white shadow-md`}>
          <Sidebar onCollapse={setIsSidebarCollapsed} />
        </div>
        <div className={`flex-1 transition-all duration-300 overflow-y-auto ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 `}>
          {/* Page Header with Title and User Dropdown */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center h-[70px] w-[700px] shadow border border-black/10 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <a href="#" className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200 px-4">
                <i className="fas fa-arrow-left"></i>
              </a>
              <div>
                <p className="text-2xl font-bold text-gray-800">Criteria 3-Research, Innovations and Extension</p>
                <p className="text-gray-600 text-sm">3.1 Promotion of Research</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserDropdown user={user} className="ml-2 mr-4 " />
            </div>
          </div>

          

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">3.1.2*** Metric Information</h3>
            <p className="text-sm text-gray-700">
             3.1.2.1: Number of departments having Research projects funded by government and non-government agencies during the last five years

            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>List of research projects and funding details(Data Template)</li>
<li>Any additional information</li>
<li>Supporting document from Funding Agency</li>
<li>Paste link to funding agency website</li>
            </ul>

            
  <div className='pt-8'>
  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
    {loading ? (
      <p className="text-gray-600">Loading score...</p>
    ) : validScore !== null ? (
      <p className="text-lg font-semibold text-green-800">
        Provisional Score (3.1.2): {parseFloat(validScore).toFixed(2)} %
      </p>
    ) : (
      <p className="text-gray-600">No score data available.</p>
    )}
  </div>
    </div>



            
          </div>

          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">
                Grants received from Government and non-governmental agencies for
                research projects / endowments in the institution during the last five
                years (INR in Lakhs)
              </h2>
              <div className="flex justify-end mb-4">
  <label className="mr-2 font-medium">Select Year:</label>
  <select
    className="border px-3 py-1 rounded"
    value={currentYear}
    onChange={(e) => setCurrentYear(e.target.value)}
    disabled={sessionLoading || !sessions?.length}
  >
    {sessionLoading ? (
      <option>Loading sessions...</option>
    ) : sessionError ? (
      <option>Error loading sessions</option>
    ) : (
      sessions?.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))
    )}
  </select>
</div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
            <p className="font-semibold">
              Fill in the inputs in 2.4.1 to get the corresponding results.
            </p>
          </div>
          </div>

          

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_1_2;


