import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { useEffect } from "react";
import { useContext } from "react";

const Criteria5_1_3 = () => {
  const { sessions: availableSessions } = useContext(SessionContext);
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(
    availableSessions && availableSessions.length > 0 ? availableSessions[0] : pastFiveYears[0]
  );
  const [currentYear, setCurrentYear] = useState(selectedYear);
  const [years] = useState(pastFiveYears); // Fixed: Added missing state initialization
  
  // Fixed: Initialize yearData state
  const [yearData, setYearData] = useState({});

  // Add this with your other state declarations at the top of your component
const [submittedData, setSubmittedData] = useState([]);
  
  // Fixed: Initialize yearScores properly
  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null); // Fixed: Added missing state
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for selected program
  const [selectedProgram, setSelectedProgram] = useState('');

  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    studentsEnrolled: "",
    agency: "",
  });

  // Handle program selection change
  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  // List of available programs
  const programs = [
    { id: '1', name: 'Soft skills' },
    { id: '2', name: 'Language and communication skills' },
    { id: '3', name: 'Life skills (Yoga, physical fitness, health and hygiene)' },
    { id: '4', name: 'ICT/computing skills' }
  ];

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria5/score513");
      console.log('API Response:', response);
      
      // Check if response has data and the expected score property
      if (response.data && response.data.data) {
        console.log('Score data:', response.data.data);
        setProvisionalScore(response.data.data);
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
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { date, studentsEnrolled, agency } = formData;
    const session = currentYear;
    
    if (!selectedProgram) {
      alert("Please select a program");
      return;
    }
    
    if (!date || !studentsEnrolled || !agency) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Convert date from DD-MM-YYYY to YYYY-MM-DD format for the database
      const [day, month, year] = date.split('-');
      const implementation_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const selectedProgramObj = programs.find(p => p.id === selectedProgram);
      
      // Extract just the first year from the session (e.g., '2024-25' -> '2024')
      const firstYear = session.split('-')[0];
      
      const requestBody = {
        session: firstYear, // Send only the first year as a string
        program_name: selectedProgramObj.name,
        implementation_date,
        students_enrolled: parseInt(studentsEnrolled, 10),
        agency_name: agency,
      };

      console.log('Submitting data:', requestBody);
      
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria5/createResponse513", 
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Response from server:', response.data);
      
      // Update local state
      setRows(prev => [...prev, { ...formData }]);
      
      // Show success message and reset form
      setFormData({
        date: "",
        studentsEnrolled: "",
        agency: "",
      });
      
      // Reset program selection
      setSelectedProgram('');
      
      fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

  const navigate = useNavigate();
  const goToNextPage = () => {
    navigate("/criteria5.1.4");
  };
  const goToPreviousPage = () => {
    navigate("/criteria5.1.2");
  };

  return (
    <div className="min-h-screen w-[1520px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 5: Student Support and Progression
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">5.1 Student Support</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          {/* Metric Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">5.1.3 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Capacity building and skills enhancement initiatives taken by the institution include the following:<br />
              1. Soft skills<br />
              2. Language and communication skills<br />
              3. Life skills (Yoga, physical fitness, health and hygiene)<br />
              4. ICT/computing skills<br />
              <br />
              Choose from the following<br />    
              A. All of the above<br />
              B. Any 3 of the above<br />
              C. Any 2 of the above<br />
              D. Any 1 of the above<br />
              E. None of the above<br />
            </p>

              <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Link to Institutional website</li>
                <li>Any additional information</li>
               <li>Details of capability building and skills enhancement initiatives </li>
                
              </ul>
            </div>
          </div>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              {loading ? (
                <p className="text-gray-600">Loading provisional score...</p>
              ) : provisionalScore ? (
                <div>
                  <p className="text-lg font-semibold text-green-800">
                    Provisional Score (5.1.3): {typeof provisionalScore.score_sub_sub_criteria === 'number' 
                      ? provisionalScore.score_sub_sub_criteria.toFixed(2) 
                      : provisionalScore.score_sub_sub_criteria}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Grade: {provisionalScore.sub_sub_cr_grade}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    (Last updated: {new Date(provisionalScore.updatedAt || Date.now()).toLocaleString()})
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">No score data available. Submit data to see your score.</p>
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

          
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

          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100 font-semibold">
                <tr>
                  <th className="px-4 py-2 border border-black text-gray-950">Program Name</th>
                  <th className="px-4 py-2 border border-black text-gray-950">Date (DD-MM-YYYY)</th>
                  <th className="px-4 py-2 border border-black text-gray-950">Students Enrolled</th>
                  <th className="px-4 py-2 border border-black text-gray-950">Agency/Consultants</th>
                  <th className="px-4 py-2 border border-black text-gray-950">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border">
                    <select
                      value={selectedProgram}
                      onChange={handleProgramChange}
                      className="w-full px-2 py-1 border rounded text-gray-950"
                      required
                    >
                      <option value="">-- Select program --</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-gray-950"
                      placeholder="DD-MM-YYYY"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="number"
                      value={formData.studentsEnrolled}
                      onChange={(e) => setFormData({ ...formData, studentsEnrolled: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-gray-950"
                      placeholder="No. of students"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.agency}
                      onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-gray-950"
                      placeholder="Agency details"
                    />
                  </td>
                  <td className="border px-2">
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
          </div>

          {submittedData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-950">Submitted Entries</h3>
              <table className="min-w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border border-black text-gray-950">#</th>
                    <th className="px-4 py-2 border border-black text-gray-950">Program Name</th>
                    <th className="px-4 py-2 border border-black text-gray-950">Date of Implementation</th>
                    <th className="px-4 py-2 border border-black text-gray-950">Students Enrolled</th>
                    <th className="px-4 py-2 border border-black text-gray-950">Agency/Consultants</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map((item, index) => (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="px-2 py-2 border border-black text-gray-950">{index + 1}</td>
                      <td className="px-2 py-2 border border-black text-gray-950">{item.programName}</td>
                      <td className="px-2 py-2 border border-black text-gray-950">{item.date}</td>
                      <td className="px-2 py-2 border border-black text-gray-950">{item.studentsEnrolled}</td>
                      <td className="px-2 py-2 border border-black text-gray-950">{item.agency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Details of capability building and skills enhancement initiatives </li>
                <li>Any additional information</li>
                <li>Link to Institutional website</li>
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
      </div>
    </div>
  );
};

export default Criteria5_1_3;