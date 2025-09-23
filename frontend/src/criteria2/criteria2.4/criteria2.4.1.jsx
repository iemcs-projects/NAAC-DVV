import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../../components/landing-navbar";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";
import { UploadProvider, useUpload } from "../../contextprovider/uploadsContext";

const Criteria2_4_1 = () => {
  const { user } = useAuth();
  const { uploads, uploading, uploadFile, removeFile, error: uploadError } = useUpload();
  const [useupload, setUseupload] = useState(false);
  const [file, setFile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const error = uploadError;
  const { sessions, isLoading: sessionsLoading, error: sessionsError } = useContext(SessionContext);

  const [currentYear, setCurrentYear] = useState("");
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    name_of_the_full_time_teacher: "",
    designation: "",
    year_of_appointment: "",
    nature_of_appointment: "",
    name_of_department: "",
    total_number_of_years_of_experience_in_the_same_institution: "",
    isServing: false,
    supportLinks: [],
  });
 
  const [provisionalScore, setProvisionalScore] = useState({
    score: {
      score_sub_sub_criteria: 0,
      score_sub_criteria: 0,
      score_criteria: 0,
      grade: 0
    },
    message: '',
    yearly_data: null,
    ratio_array: null,
    average_ratio: null,
    score_entry: null
  });
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const navigate = useNavigate();

  // Initialize currentYear when sessions load
  useEffect(() => {
    if (sessions && sessions.length > 0 && !currentYear) {
      setCurrentYear(sessions[0]);
    }
  }, [sessions, currentYear]);

  // Function to fetch provisional score
  const fetchScore = async () => {
    if (!currentYear) return;
    console.log('fetchScore called for criteria 2.4.1');
    setScoreLoading(true);
    setScoreError(null);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/criteria2/score241",
        { withCredentials: true }
      );
      
      console.log("Fetched score data:", response.data);
      
      // Handle the actual response structure
      const responseData = response.data;
      const scoreData = responseData.data; // The scores are in the data property
      const scoreEntry = scoreData.score_entry || {};
      
      console.log('Score entry data:', scoreEntry);
      console.log('Additional data:', {
        yearly_data: scoreData.yearly_data,
        ratio_array: scoreData.ratio_array,
        average_ratio: scoreData.average_ratio
      });
      
      // Format the scores to match the component's expected structure
      const parsedScore = {
        score_sub_sub_criteria: parseFloat(scoreEntry.score_sub_sub_criteria) || 0,
        score_sub_criteria: parseFloat(scoreEntry.score_sub_criteria) || 0,
        score_criteria: parseFloat(scoreEntry.score_criteria) || 0,
        grade: scoreEntry.sub_sub_cr_grade || 0,
        weighted_cr_score: scoreEntry.weighted_cr_score || 0
      };
      
      // Calculate average ratio if not provided
      const averageRatio = scoreData.average_ratio || 
                         (scoreData.ratio_array && scoreData.ratio_array.length > 0 ? 
                          (scoreData.ratio_array.reduce((a, b) => a + b, 0) / scoreData.ratio_array.length).toFixed(2) : 
                          0);
      
      setProvisionalScore({
        score: parsedScore,
        message: responseData.message || "Score loaded successfully",
        yearly_data: scoreData.yearly_data || {},
        ratio_array: scoreData.ratio_array || [],
        average_ratio: parseFloat(averageRatio) || 0,
        score_entry: scoreEntry
      });
    } catch (error) {
      console.error("Score fetch error:", error);
      setScoreError(error.response?.data?.message || "Failed to fetch provisional score");
    } finally {
      setScoreLoading(false);
    }
  };

  // Fetch score on currentYear change
  useEffect(() => {
    fetchScore();
  }, [currentYear]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setUploads((prev) => ({ ...prev, [field]: file }));
  };

  const goToNextPage = () => navigate("/criteria2.4.2");
  const goToPreviousPage = () => navigate("/criteria2.3.3");

  const handleSubmit = async () => {
    // Validate inputs
    const {
      name,
      designation,
      yearOfAppointment,
      appointmentNature,
      department,
      experience,
    } = formData;

    if (
      !name ||
      !designation ||
      !yearOfAppointment ||
      !appointmentNature ||
      !department ||
      !experience
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate yearOfAppointment
    const yearNum = parseInt(yearOfAppointment, 10);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear()) {
      alert("Year of Appointment must be between 1990 and current year.");
      return;
    }

    // Use only the first year from the session string
    const sessionYear = parseInt(currentYear.split("-")[0], 10);

    const payload = {
      session: sessionYear,
      name_of_the_full_time_teacher: name,
      designation,
      year_of_appointment: yearNum,
      nature_of_appointment: appointmentNature,
      name_of_department: department,
      total_number_of_years_of_experience_in_the_same_institution: Number(experience),
      is_the_teacher_still_serving_the_institution: formData.isServing ? "Yes" : "No",
    };

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      console.log(payload)
      // Call backend API to save data
      await axios.post("http://localhost:3000/api/v1/criteria2/createResponse222_241_243", payload);

      // Update local state to show submitted data in table
      setYearData((prev) => ({
        ...prev,
        [currentYear]: [...(prev[currentYear] || []), formData],
      }));

      // Clear form
      setFormData({
        name: "",
        designation: "",
        yearOfAppointment: "",
        appointmentNature: "",
        department: "",
        experience: "",
        isServing: false,
      });

      // Refetch score after submission
      await fetchScore();

      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Submission failed";
      setSubmitError(errMsg);
      alert(`Submission failed: ${errMsg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

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
              <p className="text-2xl font-bold text-gray-800">Criteria 2-Teaching-Learning and Evaluation</p>
              <p className="text-gray-600 text-sm">2.4 Teacher Profile and Quality</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          

          {/* Score Display */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {scoreLoading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore.score ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (2.4.1): {provisionalScore.score.score_sub_sub_criteria.toFixed(2)} %
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
              </div>
            ) : (
              <p className="text-gray-600">No score data available. Please submit data to calculate score.</p>
            )}
            {scoreError && (
              <p className="text-red-500 text-sm mt-2">Error: {scoreError}</p>
            )}
          </div>

          {/* Session Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-800 mr-2">Select Session:</label>
            {sessionsLoading ? (
              <span>Loading sessions...</span>
            ) : sessionsError ? (
              <span className="text-red-500">{sessionsError}</span>
            ) : (
              <select
                className="border px-3 py-1 rounded text-gray-900"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
              >
                {sessions?.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Data Entry Table */}
          <table className="w-full border text-sm mb-6">
            <thead className="bg-blue-100 font-semibold">
              <tr>
                <th className="border px-2 py-1">Full-time Teacher</th>
                <th className="border px-2 py-1">Designation</th>
                <th className="border px-2 py-1">Year of Appointment</th>
                <th className="border px-2 py-1">Appointment Nature</th>
                <th className="border px-2 py-1">Department</th>
                <th className="border px-2 py-1">Years of Experience</th>
                <th className="border px-2 py-1">Still Serving</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                {[
                  "name",
                  "designation",
                  "yearOfAppointment",
                  "appointmentNature",
                  "department",
                  "experience",
                  "isServing",
                ].map((field, i) => (
                  <td key={i} className="border px-2 py-1">
                    {field === "isServing" ? (
                      <input
                        type="checkbox"
                        className="mx-auto block"
                        checked={formData[field]}
                        onChange={(e) => handleChange(field, e.target.checked)}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        placeholder={field}
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="border px-2 py-1 text-center">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Submitting..." : "Add"}
                  </button>
                </td>
              </tr>
              {yearData[currentYear]?.map((record, index) => (
                <tr key={index} className="bg-gray-50">
                  <td className="border px-2 py-1">{record.name}</td>
                  <td className="border px-2 py-1">{record.designation}</td>
                  <td className="border px-2 py-1">{record.yearOfAppointment}</td>
                  <td className="border px-2 py-1">{record.appointmentNature}</td>
                  <td className="border px-2 py-1">{record.department}</td>
                  <td className="border px-2 py-1">{record.experience}</td>
                  <td className="border px-2 py-1">
                    {record.isServing ? "Yes" : "No"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => {
                        const updatedData = { ...yearData };
                        updatedData[currentYear] = updatedData[currentYear].filter((_, i) => i !== index);
                        setYearData(updatedData);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Submitted Data per session */}
          {sessions?.map((session) => (
            <div key={session} className="mb-8 border rounded overflow-x-auto">
              <h3 className="bg-blue-100 px-4 py-2 font-semibold text-blue-800">
                Session: {session}
              </h3>
              {yearData[session]?.length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="border px-2 py-1">#</th>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Designation</th>
                      <th className="border px-2 py-1">Year of Appointment</th>
                      <th className="border px-2 py-1">Appointment Nature</th>
                      <th className="border px-2 py-1">Department</th>
                      <th className="border px-2 py-1">Experience</th>
                      <th className="border px-2 py-1">Still Serving</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[session].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border px-2 py-1">{index + 1}</td>
                        <td className="border px-2 py-1">{entry.name}</td>
                        <td className="border px-2 py-1">{entry.designation}</td>
                        <td className="border px-2 py-1">{entry.yearOfAppointment}</td>
                        <td className="border px-2 py-1">{entry.appointmentNature}</td>
                        <td className="border px-2 py-1">{entry.department}</td>
                        <td className="border px-2 py-1">{entry.experience}</td>
                        <td className="border px-2 py-1">{entry.isServing ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this session.</p>
              )}
            </div>
          ))}

          {/* File Upload Section */}
          <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        Upload Documents
      </label>
      <div className="flex items-center gap-4 mb-2">
        <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
          <i className="fas fa-upload mr-2"></i> Choose Files
          <input
            type="file"
            className="hidden"
            multiple
            onChange={async (e) => {
              const filesArray = Array.from(e.target.files);
              for (const file of filesArray) {
                try {
                  const uploaded = await uploadFile(
                    "criteria1_1_3",
                    file,
                    "1.1.3",
                    currentYear
                  );
                  setFormData((prev) => ({
                    ...prev,
                    supportLinks: [...prev.supportLinks, uploaded.file_url],
                  }));
                } catch (err) {
                  alert(err.message || "Upload failed");
                }
              }
            }}
          />
        </label>

        {/* Status Messages */}
        {uploading && <span className="text-gray-600">Uploading...</span>}
        {error && <span className="text-red-600">{error}</span>}
      </div>
    


  {formData.supportLinks.length > 0 && (
    <ul className="list-disc pl-5 text-gray-700">
      {formData.supportLinks.map((link, index) => (
        <li key={index} className="flex justify-between items-center mb-1">
          <a
            href={`http://localhost:3000${link}`} // ✅ prefix with backend base URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {link.split("/").pop()}
          </a>
          <button
            type="button"
            onClick={() => {
              // Remove from local formData
              setFormData(prev => ({
                ...prev,
                supportLinks: prev.supportLinks.filter(l => l !== link)
              }));
              // Also remove from context
              removeFile("criteria1_1_3", link);
            }}
            className="text-red-600 ml-2"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )}
</div>
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria2_4_1;
