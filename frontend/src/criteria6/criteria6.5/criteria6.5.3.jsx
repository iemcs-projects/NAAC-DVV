import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria6_5_3 = () => {
  const navigate = useNavigate();
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const [currentYear, setCurrentYear] = useState("");
  
  // Changed to handle multiple selections like in Criteria 4.2.2
  const [selectedOptions, setSelectedOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
  });
  
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [yearOfImplementation, setYearOfImplementation] = useState("");
  const [session, setSession] = useState("2023");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);

  // Single row data for the table - user only inputs the year
  const [qualityData, setQualityData] = useState({
    year: "",
    iqacMeetings: "",
    conferences: "",
    collaborativeInitiatives: "",
    nirfParticipation: "",
    orientationProgramme: "",
    qualityAudit: "",
  });

  const handleQualityDataChange = (field, value) => {
    setQualityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Updated to handle checkbox changes like in Criteria 4.2.2
  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Function to get grade based on selected options count
  const getGrade = () => {
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount >= 4) return 'A. All of the above';
    if (selectedCount === 3) return 'B. Any 3 of the above';
    if (selectedCount === 2) return 'C. Any 2 of the above';
    if (selectedCount === 1) return 'D. Any 1 of the above';
    return 'E. None of the above';
  };

  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleRowNameChange = (id, name) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
  };

  const handleSubmit = async () => {
    try {
      const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
      const implimentationValue = selectedCount >= 4 ? 4 : selectedCount;

      const requestBody = {
        session,
        implimentation: implimentationValue,
        area_of_e_governance: [
          "Regular meeting of Internal Quality Assurance Cell (IQAC); Feedback collected, analysed and used for improvements",
          "Collaborative quality intitiatives with other institution(s) and Accounts",
          "Participation in NIRF",
          "any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)",
        ],
        year_of_implementation: yearOfImplementation,
      };

      const response = await axios.post("http://localhost:3000/api/v1/criteria6/createResponse623", requestBody);
      console.log("Submission successful:", response.data);
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed!");
    }
  };

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const firstYear = sessions[0].split("-")[0];
      setSession(firstYear);
      setCurrentYear(firstYear);
    }
  }, [sessions]);

  const fetchScore = async () => {
    console.log("Fetching score...");
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score653");
      console.log("API Response:", response);
      setProvisionalScore(response.data);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          {/* Page Title and Score */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 6: Governance, Leadership and Management
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">6.5-Internal Quality Assurance System</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                {loading ? (
                  <span className="text-gray-500">Loading provisional score...</span>
                ) : error ? (
                  <span className="text-red-500">Error: {error}</span>
                ) : provisionalScore ? (
                  <div className="text-blue-600 text-lg font-bold">
                    Provisional Score: {provisionalScore.data?.score || "N/A"}
                  </div>
                ) : (
                  <span className="text-gray-500">Score not available</span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">6.5.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Quality assurance initiatives of the institution include:
                <br/>
                1. Regular meeting of Internal Quality Assurance Cell (IQAC); Feedback collected, analysed and used for improvements<br/>
                2. Collaborative quality intitiatives with other institution(s)<br/>
                3. Participation in NIRF<br/>
                4. Any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)<br/>
                <br/>
                Choose from the following<br/>    
                A. All of the above<br/>
                B. Any 3 of the above<br/>
                C. Any 2 of the above<br/>
                D. Any 1 of the above<br/>
                E. None of the above <br/>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Data Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">AQARs prepared/ submitted</li>
                <li>Collaborative quality initiatives with other institution(s)</li>
                <li>Participation in NIRF</li>
                <li>Any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)</li>
              </ul>
            </div>
          </div>

          {/* Multiple Selection Checkboxes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the Quality Assurance Initiatives Available (Multiple selections allowed)
            </h3>
            <div className="space-y-3">
              {[
                { key: "option1", label: "1. Regular meeting of Internal Quality Assurance Cell (IQAC); Feedback collected, analysed and used for improvements" },
                { key: "option2", label: "2. Collaborative quality intitiatives with other institution(s)" },
                { key: "option3", label: "3. Participation in NIRF" },
                { key: "option4", label: "4. Any other quality audit recognized by state, national or international agencies (ISO Certification, NBA)" }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedOptions[key]}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  <label htmlFor={key} className="text-sm text-gray-800">{label}</label>
                </div>
              ))}
            </div>
            
            {/* Grade Display */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
                Option Selected: {getGrade()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Selected: {Object.values(selectedOptions).filter(Boolean).length} out of 4 quality initiatives
              </p>
            </div>
          </div>

          {/* Data Entry Table - Single Row */}
          <div className="p-6 bg-white shadow rounded-md max-w-full overflow-x-auto mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Quality Assurance Initiatives Data
            </h2>

            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  <th className="border text-gray-950 px-3 py-2">Year</th>
                  <th className="border text-gray-950 px-3 py-2">Regular meetings of the IQAC held</th>
                  <th className="border text-gray-950 px-3 py-2">Conferences, Seminars, Workshops on quality conducted</th>
                  <th className="border text-gray-950 px-3 py-2">Collaborative quality initiatives with other institution(s) (Provide name of the institution and activity</th>
                  <th className="border text-gray-950 px-3 py-2">Participation in NIRF along with Status</th>
                  <th className="border text-gray-950 px-3 py-2">Orientation programme on quality issues for teachers and students, Date (From-To) (DD-MM-YYYY)</th>
                  <th className="border text-gray-950 px-3 py-2">Any other quality audit as recognized by the State, National or International agencies (ISO certification, NBA and such others</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border text-gray-950 px-3 py-2">
                    <input
                      type="text"
                      className="w-full border rounded text-gray-950 px-2 py-1"
                      value={qualityData.year}
                      onChange={(e) => handleQualityDataChange("year", e.target.value)}
                      placeholder="Enter year (e.g., 2023-24)"
                    />
                  </td>
                  <td className="border text-gray-950 px-3 py-2">
                    <input
                      type="text"
                      className="w-full border rounded text-gray-950 px-2 py-1"
                      value={qualityData.iqacMeetings}
                      onChange={(e) => handleQualityDataChange("iqacMeetings", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={qualityData.conferences}
                      onChange={(e) => handleQualityDataChange("conferences", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={qualityData.collaborativeInitiatives}
                      onChange={(e) => handleQualityDataChange("collaborativeInitiatives", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={qualityData.nirfParticipation}
                      onChange={(e) => handleQualityDataChange("nirfParticipation", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={qualityData.orientationProgramme}
                      onChange={(e) => handleQualityDataChange("orientationProgramme", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={qualityData.qualityAudit}
                      onChange={(e) => handleQualityDataChange("qualityAudit", e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Paste web link of Annual reports of Institution</li>
                <li>Upload e-copies of the accreditations and certifications</li>
                <li>Upload any additional information</li>
                <li>Upload details of Quality assurance initiatives of the institution(Data Template) (Data Template)</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
                <i className="fas fa-upload mr-2"></i> Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Submit
              </button>
              <Bottom />
              <button
                onClick={() => navigate("/criteria1.2.1")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria6_5_3;