import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria3_1_1 = () => {
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);

  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState([]);

  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
  );

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);


  const [formData, setFormData] = useState({
    name_of_project: "",
    name_of_principal_investigator: "",
    department_of_principal_investigator: "",
    amount_sanctioned: "",
    duration_of_project: "",
    name_of_funding_agency: "",
    type: "",
    supportLinks: [""],
  });

    useEffect(() => {
      if (currentYear) {
        const year = currentYear.split('-')[0];
        setFormData(prev => ({
          ...prev,
          year: year
        }));
        // Also update the selectedYear
        setSelectedYear(currentYear);
      }
    }, [currentYear]);

  const navigate = useNavigate();

  const handleChange = (field, value, index) => {
    if (field === 'supportLinks') {
      const newSupportLinks = [...formData.supportLinks];
      newSupportLinks[index] = value;
      setFormData(prev => ({ ...prev, supportLinks: newSupportLinks }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };
  console.log(formData);

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the latest IIQA session from the context
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score311", {
      });
      console.log('Score response:', response.data.data);
      setProvisionalScore(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentYear) {
      fetchScore();
    }
  }, [currentYear]);


  const handleSubmit = async () => {
    const {
      name_of_project,
      name_of_principal_investigator,
      department_of_principal_investigator,
      amount_sanctioned,
      duration_of_project,
      name_of_funding_agency,
      type,
      year,
    } = formData;
  
    const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    const year_of_award = year || sessionFull.split("-")[0]; // Use form year if provided, otherwise fallback to session year
  
    if (!name_of_project || !name_of_principal_investigator || 
        !amount_sanctioned || !duration_of_project || !name_of_funding_agency || !year) {
      alert("Please fill in all required fields:");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse311_312", {
        session: parseInt(session),
        year,
        name_of_project,
        name_of_principal_investigator,
        department_of_principal_investigator,
        amount_sanctioned: parseFloat(amount_sanctioned),
        duration_of_project,
        name_of_funding_agency,
        type,  // This will be either "Government" or "Non-government"
        year_of_award
        
      });
  
      const resp = response?.data?.data || {};
      const newEntry = {
        ...resp,
        year: year_of_award,
        name_of_project: resp.name_of_project || name_of_project,
        name_of_principal_investigator: resp.name_of_principal_investigator || name_of_principal_investigator,
        department_of_principal_investigator: resp.department_of_principal_investigator || department_of_principal_investigator,
        amount_sanctioned: resp.amount_sanctioned || amount_sanctioned,
        duration_of_project: resp.duration_of_project || duration_of_project,
        name_of_funding_agency: resp.name_of_funding_agency || name_of_funding_agency,
        type: resp.type || type
      };
  
      // Update state with new entry
      setSubmittedData(prev => [...prev, newEntry]);
      setYearData(prev => ({
        ...prev,
        [year_of_award]: [...(prev[year_of_award] || []), newEntry]
      }));
  
      // Reset form
      setFormData({
        name_of_project: "",
        name_of_principal_investigator: "",
        department_of_principal_investigator: "",
        amount_sanctioned: "",
        duration_of_project: "",
        name_of_funding_agency: "",
        type: "",
        year:""
      });
      
      // Fetch updated score
      await fetchScore();
      alert("Project data submitted successfully!");
    } catch (error) {
      console.error("Error submitting project data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit project data");
    }
  };
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      // Optionally set the current year to the first available session
      setCurrentYear(sessions[0]);
    }
  }, [sessions]);


  const goToNextPage = () => navigate("/criteria3.1.2");
  const goToPreviousPage = () => navigate("/criteria2.7.1");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-black">
              Criteria 3 - Research, Innovations and Extension
            </h2>
            <span className="text-sm text-black">
              3.1 – Resource Mobilization for Research
            </span>
          </div>

          {/* Provisional Score */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore ? (
              <div>
                <p className="text-lg font-semibold text-green-800">
                  Provisional Score (3.1.1): {provisionalScore?.score_sub_sub_criteria || provisionalScore?.data?.score_sub_sub_criteria || provisionalScore?.score || provisionalScore?.data?.score || 0} Lakhs
                </p>
                <p className="text-lg font-semibold text-green-800">
                  Grade: {provisionalScore?.sub_sub_cr_grade || provisionalScore?.data?.sub_sub_cr_grade || provisionalScore?.grade || provisionalScore?.data?.grade || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No score data available.</p>
            )}
          </div>


          {/* Metric Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">3.1.1 Metric Information</h3>
            <p className="text-gray-700">
              Total Grants from Government and non-governmental agencies for research projects / endowments in the institution during the last five years (INR in Lakhs)
            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Any additional information</li>
              <li>e-copies of the grant award letters for sponsored research projects / endowments</li>
              <li>List of endowments / projects with details of grants (Data Template)</li>
            </ul>
          </div>

          {/* Year Selector */}
          <div className="flex justify-end mb-4">
            <label className="mr-2 font-medium text-black">Select Year:</label>
            <select
  className="border px-3 py-1 rounded text-black"
  value={currentYear}
  onChange={(e) => setCurrentYear(e.target.value)}
  disabled={sessionLoading || !availableSessions.length}
>
  {sessionLoading ? (
    <option>Loading sessions...</option>
  ) : sessionError ? (
    <option>Error loading sessions</option>
  ) : (
    availableSessions.map((year) => (
      <option key={year} value={year}>{year}</option>
    ))
  )}
</select>
          </div>

          {/* Data Entry Table */}
          <div className="overflow-auto border rounded mb-6">
            <table className="min-w-full border text-black text-sm">
              <thead className="bg-gray-100 font-semibold">
                <tr>
                  <th className="border px-2">Project Name</th>
                  <th className="border px-2">Principal Investigator</th>
                  <th className="border px-2">Department</th>
                  <th className="border px-2">Amount Sanctioned</th>
                  <th className="border px-2">Duration</th>
                  <th className="border px-2">Funding Agency</th>
                  <th className="border px-2">Type</th>
                  <th className="border px-2">Year</th>
                  <th className="border px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2">
                    <input value={formData.name_of_project} onChange={(e) => handleChange("name_of_project", e.target.value)} className="w-full border px-2 py-1 text-black" />
                  </td>
                  <td className="border px-2">
                    <input value={formData.name_of_principal_investigator} onChange={(e) => handleChange("name_of_principal_investigator", e.target.value)} className="w-full border px-2 py-1 text-black" />
                  </td>
                  <td className="border px-2">
                    <input value={formData.department_of_principal_investigator} onChange={(e) => handleChange("department_of_principal_investigator", e.target.value)} className="w-full border px-2 py-1 text-black" />
                  </td>
                  <td className="border px-2">
                    <input type="number" value={formData.amount_sanctioned} onChange={(e) => handleChange("amount_sanctioned", e.target.value)} className="w-full border px-2 py-1 text-black" />
                  </td>
                  <td className="border px-2">
                    <input value={formData.duration_of_project} onChange={(e) => handleChange("duration_of_project", e.target.value)} className="w-full border px-2 py-1 text-black" />
                  </td>
                  <td className="border px-2">
                    <input value={formData.name_of_funding_agency} onChange={(e) => handleChange("name_of_funding_agency", e.target.value)} className="w-full border px-2 py-1 text-black" />
                  </td>
                  <td className="border px-2">
  <select
    value={formData.type}
    onChange={(e) => handleChange("type", e.target.value)}
    className="w-full border px-2 py-1 text-black"
  >
    <option value="">Select Type</option>
    <option value="Government">Government</option>
    <option value="Non-government">Non Government</option>
  </select>
</td>
                  <td className="border px-2">
                    <input 
                      type="number" 
                      min="2000"
                      max={new Date().getFullYear()}
                      value={formData.year} 
                      onChange={(e) => handleChange("year", e.target.value)} 
                      className="w-full border px-2 py-1 text-black"
                      placeholder="Year"
                    />
                  </td>
                  <td className="border px-2">
                    <button onClick={handleSubmit} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Add</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Links Section */}
      

          {/* Year-wise Data */}
          {pastFiveYears.map((yr) => (
            <div key={yr} className="mb-6 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 px-4 py-2 text-black">Year: {yr}</h3>
              {yearData[yr]?.length ? (
                <table className="min-w-full border text-black text-sm">
                  <thead className="bg-gray-100 font-semibold">
                    <tr>
                      <th className="border px-2 py-1">#</th>
                      <th className="border px-2 py-1">Project Name</th>
                      <th className="border px-2 py-1">Principal Investigator</th>
                      <th className="border px-2 py-1">Department</th>
                      <th className="border px-2 py-1">Amount Sanctioned</th>
                      <th className="border px-2 py-1">Duration</th>
                      <th className="border px-2 py-1">Funding Agency</th>
                      <th className="border px-2 py-1">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[yr].map((entry, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{idx + 1}</td>
                        <td className="border px-2 py-1">{entry.name_of_project}</td>
                        <td className="border px-2 py-1">{entry.name_of_principal_investigator}</td>
                        <td className="border px-2 py-1">{entry.department_of_principal_investigator}</td>
                        <td className="border px-2 py-1">{entry.amount_sanctioned}</td>
                        <td className="border px-2 py-1">{entry.duration_of_project}</td>
                        <td className="border px-2 py-1">{entry.name_of_funding_agency}</td>
                        <td className="border px-2 py-1">{entry.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-black px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Calculation Table */}
          <div className="overflow-auto border rounded p-4">
            <h2 className="text-lg font-semibold mb-2 text-black">Calculation Table (Last 5 Years)</h2>
            <table className="table-auto border-collapse w-full text-black">
              <thead>
                <tr className="bg-gray-100 font-semibold">
                  <th className="border px-4 py-2">Year</th>
                  {pastFiveYears.map((yr) => (
                    <th key={yr} className="border px-4 py-2">{yr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-medium">Calculated Score</td>
                  {pastFiveYears.map((yr) => (
                    <td key={yr} className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        value={yearScores[yr]}
                        onChange={(e) => setYearScores({ ...yearScores, [yr]: parseFloat(e.target.value) || 0 })}
                        className="w-20 rounded border px-1 text-center text-black"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-medium text-black">Enter number of years for average:</label>
              <input
                type="number"
                value={yearCount}
                min={1}
                max={5}
                onChange={(e) => setYearCount(parseInt(e.target.value) || 1)}
                className="w-20 border px-2 py-1 rounded text-center text-black"
              />
              <button
                onClick={() => {
                  const vals = Object.values(yearScores).slice(0, yearCount);
                  const sum = vals.reduce((acc, v) => acc + v, 0);
                  setAverageScore((sum / yearCount).toFixed(2));
                }}
                className="ml-4 bg-blue-600 px-4 py-2 text-white rounded hover:bg-green-700"
              >
                Calculate Average
              </button>
            </div>
            {averageScore !== null && (
              <div className="mt-4 text-blue-700 font-semibold">
                Average Score for last {yearCount} year(s): {averageScore}%
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onPrevious={goToPreviousPage} onNext={goToNextPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_1_1;