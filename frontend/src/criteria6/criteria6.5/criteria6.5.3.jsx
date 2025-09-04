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
  const[submittedData,setSubmittedData]=useState([]);
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [yearOfImplementation, setYearOfImplementation] = useState("");
  const [session, setSession] = useState("2023");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    year: "",
    reg_meetings_of_the_IQAC_head: "",
    conf_seminar_workshops_on_quality_edu: "",
    collab_quality_initiatives: "",
    participation_in_NIRF: "",
<<<<<<< Updated upstream
    from_date: "",
    to_date: "",
=======
    from_to_date: "",
>>>>>>> Stashed changes
    other_quality_audit: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
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
<<<<<<< Updated upstream
    // Get the count of selected options
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    const options = selectedCount;
=======
    // Get the initiative type based on selected options
    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    const initiative_type = 
      selectedCount >= 4 ? 'A' :
      selectedCount === 3 ? 'B' :
      selectedCount === 2 ? 'C' :
      selectedCount === 1 ? 'D' : 'E';
>>>>>>> Stashed changes

    // Prepare the request body
    const requestBody = {
      session: currentYear.split('-')[0],
<<<<<<< Updated upstream
      options,
=======
      initiative_type,
>>>>>>> Stashed changes
      year: formData.year,
      reg_meetings_of_the_IQAC_head: formData.reg_meetings_of_the_IQAC_head,
      conf_seminar_workshops_on_quality_edu: formData.conf_seminar_workshops_on_quality_edu,
      collab_quality_initiatives: formData.collab_quality_initiatives,
      participation_in_NIRF: formData.participation_in_NIRF,
<<<<<<< Updated upstream
      orientation_program: formData.orientation_program,
      from_date: formData.from_date,
      to_date: formData.to_date,
=======
      from_to_date: formData.from_to_date,
>>>>>>> Stashed changes
      other_quality_audit: formData.other_quality_audit
    };

    // Validate required fields
    if (!formData.year || !formData.reg_meetings_of_the_IQAC_head) {
      alert("Please fill in all required fields");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria6/createResponse653", 
        requestBody
      );

      console.log("Submission successful:", response.data);
      
      // Add to submitted data
<<<<<<< Updated upstream
      const newEntry = { ...formData, options };
=======
      const newEntry = { ...formData, initiative_type };
>>>>>>> Stashed changes
      setSubmittedData(prev => [...prev, newEntry]);
      
      // Reset form
      setFormData({
        year: "",
        reg_meetings_of_the_IQAC_head: "",
        conf_seminar_workshops_on_quality_edu: "",
        collab_quality_initiatives: "",
        participation_in_NIRF: "",
<<<<<<< Updated upstream
        orientation_program: "",
        from_date: "",
        to_date: "",
=======
        from_to_date: "",
>>>>>>> Stashed changes
        other_quality_audit: ""
      });
      
      // Reset checkboxes
      setSelectedOptions({
        option1: false,
        option2: false,
        option3: false,
        option4: false
      });
      
      // Fetch updated score
      await fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit data");
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
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria6/score653");
      console.log('API Response:', response);
      
      // Handle different possible response structures
      const scoreData = response.data?.data?.entry || response.data?.data || response.data;
      
      if (scoreData) {
        console.log('Score data:', scoreData);
        // Set the entire response data and let the display logic handle it
        setProvisionalScore(scoreData);
      } else {
        console.log('No score data found in response');
        setProvisionalScore(null);
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
      setProvisionalScore(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchScore();
  }, []);

  return (
    <div className="w-[1520px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />

      <div className="flex w-full">
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
<<<<<<< Updated upstream
            ) : provisionalScore?.data?.score !== undefined || provisionalScore?.score !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (6.2.3): {typeof (provisionalScore.data?.score ?? provisionalScore.score) === 'number'
                  ? (provisionalScore.data?.score ?? provisionalScore.score).toFixed(2)
                  : (provisionalScore.data?.score ?? provisionalScore.score)} %
=======
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (6.2.3): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
                  ? (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria).toFixed(2)
                  : (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria)} %
>>>>>>> Stashed changes
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                </span>
              </p>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
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
                  <th className="border text-gray-950 px-3 py-2">Orientation programme on quality issues for teachers and students</th>
                  <th className="border text-gray-950 px-3 py-2">From Date (DD-MM-YYYY)</th>
                  <th className="border text-gray-950 px-3 py-2">To Date (DD-MM-YYYY)</th>
                  <th className="border text-gray-950 px-3 py-2">Any other quality audit as recognized by the State, National or International agencies (ISO certification, NBA and such others</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border text-gray-950 px-3 py-2">
                    <input
                      type="text"
                      className="w-full border rounded text-gray-950 px-2 py-1"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      placeholder="Enter year (e.g., 2023-24)"
                      required
                    />
                  </td>
                  <td className="border text-gray-950 px-3 py-2">
                    <input
                      type="text"
                      className="w-full border rounded text-gray-950 px-2 py-1"
                      value={formData.reg_meetings_of_the_IQAC_head}
                      onChange={(e) => handleInputChange("reg_meetings_of_the_IQAC_head", e.target.value)}
                      required
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={formData.conf_seminar_workshops_on_quality_edu}
                      onChange={(e) => handleInputChange("conf_seminar_workshops_on_quality_edu", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={formData.collab_quality_initiatives}
                      onChange={(e) => handleInputChange("collab_quality_initiatives", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={formData.participation_in_NIRF}
                      onChange={(e) => handleInputChange("participation_in_NIRF", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
<<<<<<< Updated upstream
                      value={formData.orientation_program}
                      onChange={(e) => handleInputChange("orientation_program", e.target.value)}
                      placeholder="Enter program details"
=======
                      value={formData.from_to_date}
                      onChange={(e) => handleInputChange("from_to_date", e.target.value)}
                      placeholder="DD-MM-YYYY to DD-MM-YYYY"
>>>>>>> Stashed changes
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
<<<<<<< Updated upstream
                      value={formData.from_date}
                      onChange={(e) => handleInputChange("from_date", e.target.value)}
                      placeholder="DD-MM-YYYY"
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
                      value={formData.to_date}
                      onChange={(e) => handleInputChange("to_date", e.target.value)}
                      placeholder="DD-MM-YYYY"
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      className="w-full border text-gray-950 rounded px-2 py-1"
=======
>>>>>>> Stashed changes
                      value={formData.other_quality_audit}
                      onChange={(e) => handleInputChange("other_quality_audit", e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i> Add
              </button>
            </div>
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