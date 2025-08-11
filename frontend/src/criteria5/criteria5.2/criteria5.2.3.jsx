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

const Criteria5_2_3= () => {
   const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
   const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
   const [yearData, setYearData] = useState({});
   const [provisionalScore, setProvisionalScore] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [currentYear, setCurrentYear] = useState(pastFiveYears[0]);
   const { sessions: availableSessions } = useContext(SessionContext);
   const [studentsAppearing, setStudentsAppearing] = useState("");
   
   useEffect(() => {
     if (availableSessions && availableSessions.length > 0) {
       setCurrentYear(availableSessions[0]);
       setSelectedYear(availableSessions[0]);
     }
   }, [availableSessions]);

  const [formData, setFormData] = useState({
    year: "",
    registration: "",
    NET:"", SLET:"",GATE:"" ,GMAT:"", CAT:"", GRE:"", JAM:"", IELTS:"", TOEFL:"", Civil:"",
    State:"",
    Other :"",
    supportLinks: [""],
  });

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria5/score523");
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


  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, year) => ({ ...acc, [year]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);
  const [submittedData, setSubmittedData] = useState([]);

  const navigate = useNavigate();
  const years = pastFiveYears;

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks") {
      const updatedLinks = [...formData.supportLinks];
      updatedLinks[index] = value;
      setFormData({ ...formData, supportLinks: updatedLinks });
    } else {
      // Ensure we're storing strings for exam fields
      const newValue = field.startsWith('exam_') ? value.toUpperCase() : value;
      setFormData({ ...formData, [field]: newValue });
    }
  };
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const {
      registration: registeration_number,
      NET: exam_net,
      SLET: exam_slet,
      GATE: exam_gate,
      GMAT: exam_gmat,
      CAT: exam_cat,
      GRE: exam_gre,
      JAM: exam_jam,
      IELTS: exam_ielts,
      TOEFL: exam_toefl,
      Civil: exam_civil_services,
      State: exam_state_services,
      Other: exam_other
    } = formData;
    const sessionYear = currentYear.split('-')[0]; // Extract first year from session
  
    // Convert numbers to "YES"/"NO"
    const exams = {
      exam_net: exam_net ? "YES" : "NO",
      exam_slet: exam_slet ? "YES" : "NO",
      exam_gate: exam_gate ? "YES" : "NO",
      exam_gmat: exam_gmat ? "YES" : "NO",
      exam_cat: exam_cat ? "YES" : "NO",
      exam_gre: exam_gre ? "YES" : "NO",
      exam_jam: exam_jam ? "YES" : "NO",
      exam_ielts: exam_ielts ? "YES" : "NO",
      exam_toefl: exam_toefl ? "YES" : "NO",
      exam_civil_services: exam_civil_services ? "YES" : "NO",
      exam_state_services: exam_state_services ? "YES" : "NO",
      exam_other: exam_other ? "YES" : "NO"
    };
  
    if (!registeration_number) {
      alert("Please fill in registration number.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria5/createResponse523",
        {
          session: sessionYear,
          year: sessionYear,
          registeration_number,
          ...exams
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      
  
      // Update local state with the new entry
      const newEntry = {
        year,
        registeration_number,
        exam_net,
        exam_slet,
        exam_gate,
        exam_gmat,
        exam_cat,
        exam_gre,
        exam_jam,
        exam_ielts,
        exam_toefl,
        exam_civil_services,
        exam_state_services,
        exam_other
      };
  
      setSubmittedData(prev => [...prev, newEntry]);
      
      // Update yearData
      setYearData(prev => ({
        ...prev,
        [year]: [...(prev[year] || []), newEntry]
      }));
      
      // Reset form
      setFormData({
        year: "",
        registration: "",
        NET:"", SLET:"",GATE:"" ,GMAT:"", CAT:"", GRE:"", JAM:"", IELTS:"", TOEFL:"", Civil:"",
        State:"",
        Other :"",
        supportLinks: [""],
      });
  
      // Refresh the score
      fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || error.message || "Submission failed due to server error");
    }
  };

const goToNextPage = () => {
    navigate("/criteria5.3.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria5.2.2");
  };

  const totalPrograms = years.reduce((acc, year) => acc + (yearData[year]?.length || 0), 0);
  const averagePrograms = (totalPrograms / years.length).toFixed(2);

  return (
    <div className="w-[1520px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">Criteria 5: Student Support and Progression </h2>
            <div className="text-sm">
              <span className="text-gray-600">5.2-Student Progression</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">5.2.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
              Average percentage of students qualifying in state/national/ international level examinations 
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Number of students qualifying in state/ national/ international
level examinations</li>
                <li>Upload supporting data for the same</li> 
                <li>Upload any additional information</li>
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

          {/* Number of Students Appearing Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Number of Students Appearing in Examinations
            </h3>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Total number of students appearing in state/national/international level examinations:
              </label>
              <input
                type="number"
                placeholder="Enter number of students"
                className="w-40 border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                value={studentsAppearing}
                onChange={(e) => setStudentsAppearing(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Students qualifying in state/national/international level examinations</h2>
              <div>
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
            </div>

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th rowSpan="2" className="border px-2 py-2">Year</th>
                  <th rowSpan="2" className="border px-2 py-2">Registration number/roll number for the exam</th>
                  <th colSpan="12" className="border px-2 py-2">Names of students selected/qualified</th>
                  <th rowSpan="2" className="border px-2 py-2">Action</th>
                </tr>
                <tr>
                  <th className="border px-2 py-1">NET</th>
                  <th className="border px-2 py-1">SLET</th>
                  <th className="border px-2 py-1">GATE</th>
                  <th className="border px-2 py-1">GMAT</th>
                  <th className="border px-2 py-1">CAT</th>
                  <th className="border px-2 py-1">GRE</th>
                  <th className="border px-2 py-1">JAM</th>
                  <th className="border px-2 py-1">IELTS</th>
                  <th className="border px-2 py-1">TOEFL</th>
                  <th className="border px-2 py-1">Civil</th>
                  <th className="border px-2 py-1">State</th>
                  <th className="border px-2 py-1">Other</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {["year", "registration","NET", "SLET", "GATE", "GMAT", "CAT", "GRE", "JAM", "IELTS", "TOEFL", "Civil", "State", "Other"].map((key) => (
                    <td key={key} className="border px-2 py-1">
                      <input
                        className="w-full border text-gray-950 border-black rounded px-2 py-1"
                        placeholder={key.replace(/([A-Z])/g, " $1")}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="!bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={handleSubmit}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
             Links to relevant documents:
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

          {years.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th rowSpan="2" className="border text-gray-950 px-4 py-2">#</th>
                      <th rowSpan="2" className="border text-gray-950 px-4 py-2">Year</th>
                      <th rowSpan="2" className="border text-gray-950 px-4 py-2">Registration number/roll number for the exam</th>
                      <th colSpan="12" className="border text-gray-950 px-4 py-2">Names of students selected/qualified</th>
                    </tr>
                    <tr>
                      <th className="border text-gray-950 px-4 py-2">NET</th>
                      <th className="border text-gray-950 px-4 py-2">SLET</th>
                      <th className="border text-gray-950 px-4 py-2">GATE</th>
                      <th className="border text-gray-950 px-4 py-2">GMAT</th>
                      <th className="border text-gray-950 px-4 py-2">CAT</th>
                      <th className="border text-gray-950 px-4 py-2">GRE</th>
                      <th className="border text-gray-950 px-4 py-2">JAM</th>
                      <th className="border text-gray-950 px-4 py-2">IELTS</th>
                      <th className="border text-gray-950 px-4 py-2">TOEFL</th>
                      <th className="border text-gray-950 px-4 py-2">Civil</th>
                      <th className="border text-gray-950 px-4 py-2">State</th>
                      <th className="border text-gray-950 px-4 py-2">Other</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.registration}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.NET}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.SLET}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.GATE}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.GMAT}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.CAT}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.GRE}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.JAM}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.IELTS}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.TOEFL}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.Civil}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.State}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.Other}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}
         
          <div className="overflow-auto border rounded p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Calculation Table (Last 5 Years)
            </h2>
            <table className="table-auto border-collapse w-full ">
              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold">
                  <th className="border px-4 py-2">Year</th>
                  {Object.keys(yearScores).map((year) => (
                    <th key={year} className="border px-4 py-2">{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-medium text-gray-600">
                    Calculated Score
                  </td>
                  {Object.keys(yearScores).map((year) => (
                    <td key={year} className="border px-4 py-2 text-center border-black text-gray-950">
                      <input
                        type="number"
                        value={yearScores[year]}
                        onChange={(e) =>
                          setYearScores({ ...yearScores, [year]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 text-center border px-1 rounded"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-medium text-gray-700">
                Enter number of years for average:
              </label>
              <input
                type="number"
                value={yearCount}
                min={1}
                max={5}
                onChange={(e) => setYearCount(parseInt(e.target.value) || 1)}
                className="w-20 border px-2 py-1 rounded text-center text-gray-950"
              />
              <button
                className="ml-4 px-4 py-2 !bg-blue-600 text-white rounded hover:bg-green-700"
                onClick={() => {
                  const values = Object.values(yearScores).slice(0, yearCount);
                  const sum = values.reduce((acc, val) => acc + val, 0);
                  setAverageScore((sum / yearCount).toFixed(2));
                }}
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

          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_2_3;