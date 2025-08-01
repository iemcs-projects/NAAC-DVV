import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from 'axios';
import LandingNavbar from "../../components/landing-navbar";

const Criteria1_2_1= () => {
  const currentYear = new Date().getFullYear();
  const [currentYearState, setCurrentYearState] = useState(currentYear);
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);

  const pastFiveYears=Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`)
  {/*const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${(currentYear - i + 1).toString().slice(-2)}`);*/}

  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [formData, setFormData] = useState({
    programme_code: "",
    programme_name: "",
    year_of_introduction: "",
    status_of_implementation_of_CBCS: "", // boolean
    year_of_implementation_of_CBCS: "",
    year_of_revision: "",
    prc_content_added: "", // New field
    supportLinks: [""] // Initialize with one empty string
  });
  
  const cbcsOptions = ["YES", "NO"]; // CBCS status options
  const [submittedData, setSubmittedData] = useState([]);
  // States for provisional score
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYearState(availableSessions[0]); // Default to most recent session
    }
  }, [availableSessions]);

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria1/score121");
      console.log('Score response:', response.data); // Debug log
      
      // Make sure we have the expected data structure
      if (response.data && response.data.data) {
        setProvisionalScore({
          data: response.data.data,
          message: response.data.message || 'Score calculated successfully',
        });
      } else {
        console.warn('Unexpected response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  // Manual refresh handler
  const handleCalculateScore = () => {
    fetchScore();
  };

  const handleChange = (field, value, index = null) => {
  if (field === "supportLinks") {
    const updatedLinks = [...formData.supportLinks];
    updatedLinks[index] = value;
    setFormData({ ...formData, supportLinks: updatedLinks });
  } else {
    setFormData({ ...formData, [field]: value });
  }
};
 const handleSubmit = async () => {
  if (
    formData.programme_code &&
    formData.programme_name &&
    formData.year_of_introduction &&
    formData.year_of_implementation_of_CBCS &&
    formData.year_of_revision
  ) {
    try {
      // Construct request payload with correct field names and types
      const payload = {
        session: parseInt(selectedYear.split('-')[0]), // Extract year from YYYY-YY format
        programme_code: formData.programme_code,
        programme_name: formData.programme_name,
        year_of_introduction: formData.year_of_introduction,
        status_of_implementation_of_CBCS: formData.status_of_implementation_of_CBCS === 'YES' || formData.status_of_implementation_of_CBCS === true ? 'YES' : 'NO',
        year_of_implementation_of_CBCS: formData.year_of_implementation_of_CBCS,
        year_of_revision: formData.year_of_revision,
        prc_content_added: formData.prc_content_added === 'YES' || formData.prc_content_added === true ? 'YES' : 'NO',
     
      };

      // Call backend API with properly formatted payload
      const response = await axios.post('http://localhost:3000/api/v1/criteria1/createResponse121', payload);

      console.log("Response created:", response.data);

      // Update submitted data table with front-end friendly object
      setSubmittedData([...submittedData, {
        ...formData,
        year: selectedYear,
        // Map backend field names to frontend display names if needed
        code: formData.programme_code,
        name: formData.programme_name,
        yearIntro: formData.year_of_introduction,
        cbcsStatus: formData.status_of_implementation_of_CBCS === 'YES' || formData.status_of_implementation_of_CBCS === true ? 'YES' : 'NO',
        yearImplemented: formData.year_of_implementation_of_CBCS,
        yearRevision: formData.year_of_revision
      }]);

      // Reset form after successful submission
      setFormData({
        programme_code: "",
        programme_name: "",
        year_of_introduction: "",
        status_of_implementation_of_CBCS: false,
        year_of_implementation_of_CBCS: "",
        year_of_revision: "",
        prc_content_added: false,
        supportLinks: [""], // Ensure supportLinks is always an array with one empty string
      });

      alert("Data submitted successfully!");
      // Refresh provisional score after successful submission
      fetchScore();

    } catch (error) {
      console.error("Error submitting:", error);
      if (error.response && error.response.data) {
        alert("Submission failed: " + error.response.data.message);
      } else {
        alert("Submission failed due to network/server error.");
      }
    }

  } else {
    alert("Please fill in all required fields.");
  }
};


  const goToNextPage = () => {
    navigate("/criteria1.2.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria1.1.3");
  };

  return (
    <div className="min-h-screen w-screen mt-6 bg-gray-50 flex flex-col">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 1: Curricular Aspects
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">1.2 - Academic Flexibility</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <span className="font-semibold text-gray-700">Provisional Score:&nbsp;</span>
                {loading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : error ? (
                  <span className="text-red-500">Error: {error}</span>
                ) : provisionalScore ? (
                  <div className="text-center">
                    <div className="text-blue-600 text-lg font-bold">
                      Score: {provisionalScore.data?.score || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Score not available</span>
                )}
              </div>
            </div>
          

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">1.2.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Percentage of Programmes in which Choice Based Credit System (CBCS)/ elective course system
                has been implemented
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Minutes of relevant Academic Council/ BOS meetings</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">CBCS / Elective Course System Entry</h2>

          {/* Year Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Select Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-950"
                required
              >
                {pastFiveYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

          {/* Input Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  <th className="px-4 py-2 border">Programme Code</th>
                  <th className="px-4 py-2 border">Programme Name</th>
                  <th className="px-4 py-2 border">Year of Introduction</th>
                  <th className="px-4 py-2 border">CBCS Implemented</th>
                  <th className="px-4 py-2 border">Year of CBCS Implementation</th>
                  <th className="px-4 py-2 border">Year of Revision</th>
                  <th className="px-4 py-2 border">PRC Content Added</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Programme Code */}
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.programme_code}
                      onChange={(e) => handleChange("programme_code", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Programme Code"
                      required
                    />
                  </td>
                  
                  {/* Programme Name */}
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.programme_name}
                      onChange={(e) => handleChange("programme_name", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Programme Name"
                      required
                    />
                  </td>
                  
                  {/* Year of Introduction */}
                  <td className="px-2 py-2 border">
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.year_of_introduction}
                      onChange={(e) => handleChange("year_of_introduction", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Year of Introduction"
                      required
                    />
                  </td>
                  
                  {/* CBCS Status */}
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.status_of_implementation_of_CBCS ? "YES" : "NO"}
                      onChange={(e) => handleChange("status_of_implementation_of_CBCS", e.target.value === "YES")}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      required
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                  </td>
                  
                  {/* Year of Implementation of CBCS */}
                  <td className="px-2 py-2 border">
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.year_of_implementation_of_CBCS}
                      onChange={(e) => handleChange("year_of_implementation_of_CBCS", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Year of Implementation"
                      required
                    />
                  </td>
                  
                  {/* Year of Revision */}
                  <td className="px-2 py-2 border">
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.year_of_revision}
                      onChange={(e) => handleChange("year_of_revision", e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Year of Revision"
                      required
                    />
                  </td>
                  
                  {/* PRC Content Added */}
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.prc_content_added ? "YES" : "NO"}
                      onChange={(e) => handleChange("prc_content_added", e.target.value === "YES")}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      required
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <button
                      onClick={handleSubmit}
                      className="px-3 py-1 !bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dynamic Support Links Input */}
<div className="mb-6">
  <label className="block text-gray-700 font-medium mb-2">
   Link to relevant documents
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
      onClick={() => setFormData({ ...formData, supportLinks: [...formData.supportLinks, ""] })}
      className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
    >
      + Add Another Link
    </button>
  </div>
</div>


          {/* Submitted Data Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <div className="w-full max-w-full">
              <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
              {submittedData.length > 0 ? (
                <table className="min-w-full text-sm border max-w-full border-black">
                  <thead className="bg-white font-semibold text-gray-950">
                    <tr>
                      <th className="px-4 py-2 border text-gray-750">#</th>
                      <th className="px-4 py-2 border text-gray-950">Year</th>
                      {[
                        "Programme Code",
                        "Programme Name",
                        "Year of Introduction",
                        "CBCS Status",
                        "Implementation Year",
                        "Revision Year",
                        "Content Changed (%)",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-2 border text-gray-950">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submittedData.map((entry, i) => (
                      <tr key={i} className="even:bg-gray-50 text-gray-950">
                        <td className="px-2 py-2 border border-black">{i + 1}</td>
                        <td className="px-2 py-2 border border-black">{entry.year}</td>
                        <td className="px-2 py-2 border border-black">{entry.code}</td>
                        <td className="px-2 py-2 border border-black">{entry.name}</td>
                        <td className="px-2 py-2 border border-black">{entry.yearIntro}</td>
                        <td className="px-2 py-2 border border-black">{entry.cbcsStatus}</td>
                        <td className="px-2 py-2 border border-black">{entry.yearImplemented}</td>
                        <td className="px-2 py-2 border border-black">{entry.yearRevision || "-"}</td>
                        <td className="px-2 py-2 border border-black">{entry.percentChanged || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No data submitted yet.</p>
              )}
            </div>
          </div>

          {/* Year-wise Data Display */}
          {availableSessions && availableSessions.map((year) => {
            const yearEntries = submittedData.filter(entry => entry.year.startsWith(year));
            return (
              <div key={year} className="mb-8 border rounded">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
                {yearEntries.length > 0 ? (
                  <div className="overflow-auto">
                    <table className="min-w-full text-sm border border-black">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border border-black px-4 py-2 text-gray-800">#</th>
                          <th className="border border-black px-4 py-2 text-gray-800">Programme Code</th>
                          <th className="border border-black px-4 py-2 text-gray-800">Programme Name</th>
                          <th className="border border-black px-4 py-2 text-gray-800">Year of Introduction</th>
                          <th className="border border-black px-4 py-2 text-gray-800">CBCS Implemented</th>
                          <th className="border border-black px-4 py-2 text-gray-800">Year of CBCS Implementation</th>
                          <th className="border border-black px-4 py-2 text-gray-800">Year of Revision</th>
                          <th className="border border-black px-4 py-2 text-gray-800">PRC Content Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearEntries.map((entry, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-black px-2 py-1 text-gray-700">{idx + 1}</td>
                            <td className="border border-black px-2 py-1 text-gray-700">{entry.code}</td>
                            <td className="border border-black px-2 py-1 text-gray-700">{entry.name}</td>
                            <td className="border border-black px-2 py-1 text-gray-700">{entry.yearIntro}</td>
                            <td className="border border-black px-2 py-1 text-gray-700">{entry.cbcsStatus}</td>
                            <td className="border border-black px-2 py-1 text-gray-700">{entry.yearImplemented}</td>
                            <td className="border border-black px-2 py-1 text-gray-700">{entry.yearRevision}</td>
                            <td className="border border-black px-2 py-1 text-gray-700">{entry.prc_content_added === 'YES' || entry.prc_content_added === true ? 'YES' : 'NO'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
                )}
              </div>
            );
          })}

          {/* Calculation Table */}
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
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">
                      Calculated Score
                    </td>
                    {pastFiveYears.map((year) => (
                      <td key={year} className="border border-black px-4 py-2 text-center">
                        -
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 !bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleCalculateScore}>
                  Calculate Score
                </button>
              </div>
              <p className="text-gray-600 mt-2">Total number of years considered: 5</p>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} onExport={handleExport} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria1_2_1;
