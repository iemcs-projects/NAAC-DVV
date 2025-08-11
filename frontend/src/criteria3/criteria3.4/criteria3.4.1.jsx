import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria3_4_1 = () => {
  const { sessions: availableSessions = [], isLoading: sessionLoading = false, error: sessionError = null } = useContext(SessionContext) || {};
  const navigate = useNavigate();

  const [currentYear, setCurrentYear] = useState('');
  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${new Date().getFullYear() - i}-${(new Date().getFullYear() - i + 1).toString().slice(-2)}`
  );
  const yearsToShow = availableSessions?.length > 0 ? availableSessions : pastFiveYears;
  const [selectedYear, setSelectedYear] = useState('');

  const [formData, setFormData] = useState({
    title_of_activity: "",
    collaborating_agency: "",
    participant_name: "",
    year_of_collaboration: "",
    duration: "",
    supportLinks: []
  });
  const [yearData, setYearData] = useState({});
  const [score, setScore] = useState(null);
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (availableSessions?.length > 0) {
      const firstYear = availableSessions[0];
      setCurrentYear(firstYear);
      setSelectedYear(firstYear);
    } else if (pastFiveYears.length > 0) {
      const firstYear = pastFiveYears[0];
      setCurrentYear(firstYear);
      setSelectedYear(firstYear);
    }
  }, [availableSessions, pastFiveYears]);

  useEffect(() => {
    if (currentYear) {
      const year = currentYear.split('-')[0];
      setFormData(prev => ({
        ...prev,
        year_of_collaboration: year
      }));
    }
  }, [currentYear]);

  const handleChange = (field, value, index = null) => {
    if (field === 'supportLinks') {
      const updated = [...formData.supportLinks];
      updated[index] = value;
      setFormData(prev => ({ ...prev, supportLinks: updated }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    const session = selectedYear.split("-")[0];
    const title_of_activity = (formData.title_of_activity || '').trim();
    const collaborating_agency = (formData.collaborating_agency || '').trim();
    const participant_name = (formData.participant_name || '').trim();
    const year_of_collaboration = (formData.year_of_collaboration || '').trim();
    const duration = (formData.duration || '').trim();
    const document_link = formData.supportLinks?.filter(link => link?.trim() !== '').join(', ') || '';

    if (!title_of_activity || !collaborating_agency || !participant_name || !year_of_collaboration || !duration || !document_link) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse341", {
        session: parseInt(session),
        title_of_activity: formData.title_of_activity.trim(),
        collaborating_agency: formData.collaborating_agency.trim(),
        participant_name: formData.participant_name.trim(),
        year_of_collaboration: formData.year_of_collaboration.trim(),
        duration: formData.duration.trim(),
        document_link: formData.supportLinks.filter(link => link.trim() !== '').join(', ')
      });

      const resp = response?.data?.data || {};
      const newEntry = {
        title_of_activity: formData.title_of_activity.trim(),
        collaborating_agency: formData.collaborating_agency.trim(),
        participant_name: formData.participant_name.trim(),
        year_of_collaboration: formData.year_of_collaboration.trim(),
        duration: formData.duration.trim(),
        document_link: formData.supportLinks.filter(link => link.trim() !== '').join(', ')
      };

      setYearData(prev => ({
        ...prev,
        [newEntry.year_of_collaboration]: [...(prev[newEntry.year_of_collaboration] || []), newEntry]
      }));

      setFormData({
        title_of_activity: "",
        collaborating_agency: "",
        participant_name: "",
        year_of_collaboration: currentYear ? currentYear.split('-')[0] : "",
        duration: "",
        supportLinks: []
      });

      await fetchScore();
      alert("Data submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Submission failed.");
    }
  };

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score341");
      console.log('API Response:', response);
      
      // Check if response has data and the expected score property
      if (response.data && response.data.data && response.data.data.entry) {
        console.log('Score data:', response.data.data.entry);
        setProvisionalScore(response.data.data.entry);
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

  const goToNextPage = () => navigate("/criteria3.4.2");
  const goToPreviousPage = () => navigate("/criteria3.3.4");

  return (
    <div className="w-[1470px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 3: Research, Innovations and Extension</h2>
            <div className="text-sm text-gray-600">3.4 - Collaboration</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">3.4.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                The Institution has several collaborations/linkages for Faculty exchange, Student exchange, Internship, Field trip, On-the-job training, research etc during the last five years.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>e-copies of linkage related documents</li>
                <li>Any additional information</li>
                <li>Details of linkages with institutions/industries for internship (Data Template)</li>
              </ul>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.4.1): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
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

          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Add Collaborative Programs</h2>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-medium">Select Year:</label>
                <select
                  className="border px-3 py-1 rounded text-black"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  disabled={sessionLoading || !availableSessions.length}
                >
                  {sessionLoading ? (
                    <option>Loading sessions...</option>
                  ) : sessionError ? (
                    <option>Error loading sessions - using default years</option>
                  ) : null}
                  {yearsToShow.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Title</th>
                  <th className="border px-2 py-2">Agency</th>
                  <th className="border px-2 py-2">Participant</th>
                  <th className="border px-2 py-2">Year</th>
                  <th className="border px-2 py-2">Duration</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.title_of_activity}
                      onChange={(e) => handleChange("title_of_activity", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Title of Activity"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.collaborating_agency}
                      onChange={(e) => handleChange("collaborating_agency", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Collaborating Agency"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.participant_name}
                      onChange={(e) => handleChange("participant_name", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Participant Name"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.year_of_collaboration}
                      onChange={(e) => handleChange("year_of_collaboration", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Year of Collaboration"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
                      className="w-full border text-gray-950 border-black rounded px-2 py-1"
                      placeholder="Duration"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={handleSubmit}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-full"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Supporting Links Section */}
            <div className="p-4 border-t">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Links:
                </label>
                {formData.supportLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleChange('supportLinks', e.target.value, index)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Enter supporting document link"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.supportLinks.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, supportLinks: updated }));
                      }}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  supportLinks: [...prev.supportLinks, '']
                }))}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Supporting Link
              </button>
            </div>
          </div>

          {/* Display submitted data for each year */}
          {pastFiveYears.map((year) => {
            const yearKey = year.split('-')[0]; // Extract first year from range like "2024-25"
            return (
              <div key={year} className="mb-8 border rounded">
                <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
                {yearData[yearKey] && yearData[yearKey].length > 0 ? (
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border text-gray-950 px-4 py-2">#</th>
                        <th className="border text-gray-950 px-4 py-2">Title</th>
                        <th className="border text-gray-950 px-4 py-2">Agency</th>
                        <th className="border text-gray-950 px-4 py-2">Participant</th>
                        <th className="border text-gray-950 px-4 py-2">Year</th>
                        <th className="border text-gray-950 px-4 py-2">Duration</th>
                        <th className="border text-gray-950 px-4 py-2">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearData[yearKey].map((entry, index) => (
                        <tr key={index} className="even:bg-gray-50">
                          <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                          <td className="border text-gray-950 px-2 py-1">{entry.title_of_activity}</td>
                          <td className="border text-gray-950 px-2 py-1">{entry.collaborating_agency}</td>
                          <td className="border text-gray-950 px-2 py-1">{entry.participant_name}</td>
                          <td className="border text-gray-950 px-2 py-1">{entry.year_of_collaboration}</td>
                          <td className="border text-gray-950 px-2 py-1">{entry.duration}</td>
                          <td className="border text-gray-950 px-2 py-1">
                            {entry.document_link && (
                              <a 
                                href={entry.document_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 underline"
                              >
                                View
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
                )}
              </div>
            );
          })}

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria3_4_1;