import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";

const Criteria4_2_3 = () => {
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const navigate = useNavigate();
  
  // Handle sessions from context
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      setCurrentYear(sessions[0]);
    }
  }, [sessions]);
  
  // Set default year if no sessions available
  useEffect(() => {
    if (availableSessions.length === 0) {
      const pastFiveYears = Array.from(
        { length: 5 },
        (_, i) => `${new Date().getFullYear() - i}-${(new Date().getFullYear() - i + 1).toString().slice(-2)}`
      );
      setAvailableSessions(pastFiveYears);
      setCurrentYear(pastFiveYears[0]);
    }
  }, []);
  const [yearData, setYearData] = useState({});
  const [selectedOption, setSelectedOption] = useState("");
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [provisionalScore, setProvisionalScore] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };
 
  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleRowNameChange = (id, name) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
  };

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria4/score423");
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      setProvisionalScore(response.data);
      console.log('provisionalScore after set:', provisionalScore);
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const libraryResources = [
    "Books",
    "Journals",
    "e-journals",
    "e-books",
    "e-ShodhSindhu",
    "Shodhganga",
    "Databases",
  ];

  // Single row data for library resources
  const [resourceData, setResourceData] = useState({
    resource: "",
    membershipDetails: "",
    expenditure: "",
    totalExpenditure: "",
  });

  const [submittedResources, setSubmittedResources] = useState([]);

  const handleResourceChange = (field, value) => {
    setResourceData({ ...resourceData, [field]: value });
  };

  const handleResourceSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const removeResource = (index) => {
    const updated = submittedResources.filter((_, i) => i !== index);
    setSubmittedResources(updated);
  };

  const [formData, setFormData] = useState({
    resource: "",
    membershipDetails: "",
    expenditure: "",
    totalExpenditure: "",
  });
  const [submittedData, setSubmittedData] = useState([]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { resource, membershipDetails, expenditure, totalExpenditure, link } = formData;
    if (!currentYear) {
      alert("Please select a valid session");
      return;
    }
    const session = currentYear.split("-")[0];

    if (!resource || !membershipDetails || !expenditure || !totalExpenditure) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria4/createResponse423",
        {
          session: parseInt(session, 10),
          resource_type: resource,
          subscription_detail: membershipDetails,  // Changed from membership_details to subscription_detail
          expenditure_lakhs: parseFloat(expenditure),  // Changed from expenditure to expenditure_lakhs
          total_expenditure: parseFloat(totalExpenditure),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      const newEntry = {
        year: currentYear,
        resource,
        membershipDetails,
        expenditure: parseFloat(expenditure),
        totalExpenditure: parseFloat(totalExpenditure),
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      setYearData((prev) => ({
        ...prev,
        [currentYear]: [...(prev[currentYear] || []), newEntry],
      }));

      // Reset form
      setFormData({
        resource: "",
        membershipDetails: "",
        expenditure: "",
        totalExpenditure: "",
      });
      
      // Refresh any scores if needed
      // await fetchScore();
      alert("Library resource data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      setError(error.response?.data?.message || error.message || "Submission failed due to server error");
      alert(error.response?.data?.message || error.message || "Failed to submit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    navigate("/criteria4.2.4");
  };

  const goToPreviousPage = () => {
    navigate("/criteria4.2.2");
  };

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
              Criteria 4: Infrastructure and Learning Resources
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">4.2 IT Infrastructure</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.2.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
               Average annual expenditure for purchase of books/e-books and
subscription to journals/e- journals during the last five years (INR in
Lakhs) 
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Data Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Expenditure on the purchase of books/e-books<br/>
Expenditure on the purchase of journals/e-journals in ith year<br/>
Year of Expenditure:  </li>
               </ul>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.1.3): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
                  ? (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria).toFixed(2)
                  : (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria)} %
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                </span>
              </p>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

         <div className="mt-8 flex justify-center overflow-auto border rounded p-4">
            <div className="w-full max-w-4xl">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                Calculation Table (Last 5 Years)
              </h2>
              <table className="table-auto border-collapse w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-semibold">
                    <th className="border border-[gray] px-4 py-2">YEAR</th>
                    <th className="border border-[gray] px-4 py-2">2020</th>
                    <th className="border border-[gray] px-4 py-2">2021</th>
                    <th className="border border-[gray] px-4 py-2">2022</th>
                    <th className="border border-[gray] px-4 py-2">2023</th>
                    <th className="border border-[gray] px-4 py-2">2024</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">
                      Calculated Score
                    </td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                    <td className="border border-black px-4 py-2 text-center">-</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-blue-600">
                  Calculate Score
                </button>
              </div>
              <p className="text-gray-600 mt-2">Total number of years considered: 5</p>
            </div>
          </div>

          <div className="p-6 bg-white shadow rounded-md max-w-full overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Add Library Resource
              </h2>
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Session:</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sessionLoading}
                >
                  {availableSessions.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Library Resource
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.resource}
                    onChange={(e) => handleChange("resource", e.target.value)}
                    required
                  >
                    <option value="">Select Resource</option>
                    {libraryResources.map((resource, index) => (
                      <option key={index} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership/Subscription Details
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.membershipDetails}
                    onChange={(e) => handleChange("membershipDetails", e.target.value)}
                    placeholder="Enter details"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expenditure (in Lakhs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.expenditure}
                    onChange={(e) => handleChange("expenditure", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Expenditure
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.totalExpenditure}
                    onChange={(e) => handleChange("totalExpenditure", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end mb-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {loading ? 'Submitting...' : 'Submit Resource'}
                </button>
              </div>

              {/* Document Link Input - Moved after submit button and made optional */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link to Document (Supporting evidence for the above data) - Optional
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.link || ''}
                    onChange={(e) => handleChange("link", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Display Submitted Resources */}
              {submittedData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Added Library Resources
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm text-left">
                      <thead className="bg-gray-100 font-semibold text-gray-950">
                        <tr>
                          <th className="border px-3 py-2">Library Resources</th>
                          <th className="border px-3 py-2">Membership/Subscription</th>
                          <th className="border px-3 py-2">Expenditure (Lakhs)</th>
                          <th className="border px-3 py-2">Total (Lakhs)</th>
                          <th className="border px-3 py-2">Document Link</th>
                          <th className="border px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submittedData.map((resource, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border px-3 py-2">{resource.resource}</td>
                            <td className="border px-3 py-2">{resource.membershipDetails}</td>
                            <td className="border px-3 py-2 text-right">{parseFloat(resource.expenditure).toFixed(2)}</td>
                            <td className="border px-3 py-2 text-right">{parseFloat(resource.totalExpenditure).toFixed(2)}</td>
                            <td className="border px-3 py-2">
                              <a 
                                href={resource.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline break-all"
                              >
                                View Document
                              </a>
                            </td>
                            <td className="border px-3 py-2">
                              <button
                                onClick={() => removeResource(index)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Upload any additional information</li>
            <li>Details of subscriptions like e-journals, e-ShodhSindhu, Shodhganga Membership etc (Data Template)</li>
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

      <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
        <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
      </div>
    </div>
  );
};

export default Criteria4_2_3;