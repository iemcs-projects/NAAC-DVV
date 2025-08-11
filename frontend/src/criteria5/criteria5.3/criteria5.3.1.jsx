import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { useEffect } from "react";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria5_3_1 = () => {
 const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
   const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
   const [yearData, setYearData] = useState({});
   const [provisionalScore, setProvisionalScore] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [currentYear, setCurrentYear] = useState(pastFiveYears[0]);
   const { sessions: availableSessions } = useContext(SessionContext);
   useEffect(() => {
     if (availableSessions && availableSessions.length > 0) {
       setCurrentYear(availableSessions[0]);
       setSelectedYear(availableSessions[0]);
     }
   }, [availableSessions]);

  const [formData, setFormData] = useState({
    name: "",  // Award Name
    studentname: "",  // Student Name
    team_or_individual: "",  // Team/Individual
    level: "",  // Level
    activity_type: "",  // Activity Type
    supportLinks: [""]
  });
  const [submittedData, setSubmittedData] = useState([]);

  const teamOptions = [
    { value: 'Team', label: 'Team' },
    { value: 'Individual', label: 'Individual' }
  ];

  const levelOptions = [
    { value: 'University', label: 'University' },
    { value: 'State', label: 'State' },
    { value: 'National', label: 'National' },
    { value: 'International', label: 'International' }
  ];

  const activityOptions = [
    { value: 'Sports', label: 'Sports' },
    { value: 'Cultural', label: 'Cultural' }
  ];

  const navigate = useNavigate();

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria5/score531");
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

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...formData.supportLinks];
      updatedLinks[index] = value;
      setFormData({ ...formData, supportLinks: updatedLinks });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const award_name = formData.name;
    const student_name = formData.studentname;
    const team_or_individual = formData.team_or_individual;
    const level = formData.level;
    const activity_type = formData.activity_type;
    const year = currentYear.split("-")[0];

    if (!award_name || !student_name || !team_or_individual || !level || !activity_type) {
      alert("Please fill in all required fields (Award Name, Student Name, Team/Individual, Level, and Activity Type).\n\nCurrent values:\nAward Name: " + award_name + "\nStudent Name: " + student_name + "\nTeam/Individual: " + team_or_individual + "\nLevel: " + level + "\nActivity Type: " + activity_type);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria5/createResponse531", {
        session: currentYear,
        year: currentYear,
        award_name,
        student_name,
        team_or_individual,
        level,
        activity_type,
        
      });

      if (response.status === 200) {
        alert("Data submitted successfully!");
        setSubmittedData(prev => [...prev, {
          award_name,
          student_name,
          team_or_individual,
          level,
          activity_type,
          
        }]);
        setFormData({
          name: "",
          studentname: "",
          team_or_individual: "",
          level: "",
          activity_type: "",
       
        });
      } else {
        alert("Failed to submit data. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred while submitting data. Please try again.");
    }
  };

  const goToNextPage = () => {
    navigate("/criteria5.3.2");
  };

  const goToPreviousPage = () => {
    navigate("/criteria5.2.3");
  };

  return (
    <div className="min-h-screen w-[1520px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 5: Student Support and Progression
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">5.3-Student Participation and Activities</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* <div className="flex justify-center mb-4">
              <div className="text-center">
                <div className="text-lg font-medium text-green-500 bg-[#bee7c7] !w-[1000px] h-[50px] pt-[10px] rounded-lg">
                  Provisional Score: 18.75
                </div>
              </div>
            </div> */}

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">5.3.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Number of awards/medals for outstanding performance in sports/cultural activities at university/state/national / international level (award for a team event should be counted as one)
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">e-copies of award letters and certificates</li>
                <li>Number of awards/medals for outstanding performance in
sports/cultural activities at university/state/national/international
level</li>
<li>Any additional information</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Number of awards/medals for outstanding performance in sports/cultural activities at university/state/national / international level</h2>

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

          {/* Year Dropdown */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
            >
              {availableSessions && availableSessions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Input Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  {[
                    "Year",
                    "Name of the award",
                    "Team/Individual",
                    "Level",
                    "Activity Type",
                    "Name of the student",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-2 border">
                      {heading}
                    </th>
                  ))}
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={currentYear ? currentYear.split('-')[0] : ''}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                      placeholder="Enter year"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Award Name"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.team_or_individual}
                      onChange={(e) => handleChange('team_or_individual', e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    >
                      {teamOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.level}
                      onChange={(e) => handleChange('level', e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    >
                      {levelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.activity_type}
                      onChange={(e) => handleChange('activity_type', e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    >
                      {activityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.studentname}
                      onChange={(e) => handleChange('studentname', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                      placeholder="Student Name"
                    />
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
                        "Year",
                        "Name of the award",
                        "Team/Individual",
                        "University/State/National/ International ",
                        "Sports/ Cultural ",
                        "Name of the student",
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
                        <td className="px-2 py-2 border border-black">{entry.name}</td>
                        <td className="px-2 py-2 border border-black">{entry.team}</td>
                        <td className="px-2 py-2 border border-black">{entry.uni}</td>
                        <td className="px-2 py-2 border border-black">{entry.sports}</td>
                        <td className="px-2 py-2 border border-black">{entry.name}</td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No data submitted yet.</p>
              )}
            </div>
          </div>

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
                <button className="px-4 py-2 !bg-blue-600 text-white rounded hover:bg-blue-700">
                  Calculate Score
                </button>
              </div>
              <p className="text-gray-600 mt-2">Total number of years considered: 5</p>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_3_1;
