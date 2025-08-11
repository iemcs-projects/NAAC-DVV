import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { SessionContext } from "../../contextprovider/sessioncontext";
import axios from "axios";
import { useEffect } from "react";

const Criteria5_1_4= () => {
  const { sessions: availableSessions } = useContext(SessionContext);

  const [selectedYear, setSelectedYear] = useState(
    availableSessions && availableSessions.length > 0 ? availableSessions[0] : pastFiveYears[0]
  );
  const [currentYear, setCurrentYear] = useState(selectedYear);
  
  const [yearData, setYearData] = useState({});
  const [submittedData, setSubmittedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Add this with your other state declarations at the top of the component
const [provisionalScore, setProvisionalScore] = useState(null);


  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);


  const [formData, setFormData] = useState({
    year: "",
    activityname: "",
    students: "",
    students_benefitted: "",
   
   
    
    supportLinks: [""],
  });
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]);
      setSelectedYear(availableSessions[0]);
    }
  }, [availableSessions]);


  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria5/score514");
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

  const navigate = useNavigate();
  const years = pastFiveYears;

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
    
    const {
      year: inputYear,
      activityname: activity_name,
      students: students_participated,
      students_benefitted
    } = formData;
  
    const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    const year = inputYear || sessionFull;
  
    // Convert and validate numeric inputs
    const studentsParticipated = parseInt(students_participated);
    const studentsBenefitted = parseInt(students_benefitted);
    
    if (isNaN(studentsParticipated) || isNaN(studentsBenefitted)) {
      alert("Please enter valid numbers for both 'Students Participated' and 'Students Benefitted' fields.");
      return;
    }
    
    if (studentsParticipated <= 0 || studentsBenefitted <= 0) {
      alert("Number of students must be greater than 0.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria5/createResponse514",
        {
          session: parseInt(session, 10),
          year,
          activity_name,
          students_participated: studentsParticipated,
          students_benefitted: studentsBenefitted
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
  
      const resp = response?.data?.data || {};
      const newEntry = {
        year: resp.year || year,
        activity_name: resp.activity_name || activity_name,
        students_participated: resp.students_participated || students_participated,
      };
  
      setSubmittedData(prev => [...prev, newEntry]);
      
      // Update yearData
      setYearData(prev => ({
        ...prev,
        [newEntry.year]: [...(prev[newEntry.year] || []), {
          activity_name: newEntry.activity_name,
          students_participated: newEntry.students_participated,
        }],
      }));
  
      // Reset form
      setFormData({
        year: "",
        activityname: "",
        students: "",
        students_benefitted: "",
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
    navigate("/criteria5.1.5");
  };

  const goToPreviousPage = () => {
    navigate("/criteria5.1.3");
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
              <span className="text-gray-600">5.1-Student Support</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">5.1.4 Metric Information</h3>
              <p className="text-sm text-gray-700">
               Average percentage of students benefitted by guidance for competitive examinations and career counseling offered by the institution
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Number of students benefited by guidance for competitive
examinations and career counselling</li>

<li>Any additional information</li> 
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
          <div className="border rounded mb-8">
            <div className=" items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold"> Students benefitted by guidance for competitive examinations and career counseling offered by the institution  </h2>
              <div className="mb-1">
  <label className="text-gray-700 font-medium mr-2 ml-[70px]">Select Year:</label>
  <select
    value={currentYear}
    onChange={(e) => setCurrentYear(e.target.value)}
    className="border border-gray-300 px-3 py-1 rounded text-gray-950"
  >
    {availableSessions && availableSessions.length > 0 ? (
      availableSessions.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))
    ) : (
      pastFiveYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))
    )}
  </select>
</div>

<div className="px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">
                  Number of students benefited by guidance for competitive examinations and career counselling
                </label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-gray-950"
                  placeholder="Enter count"
                  min="0"
                  value={formData.students_benefitted}
                  onChange={(e) => handleChange("students_benefitted", e.target.value)}
                />
              </div>
            </div>



            </div>

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th  className="border px-2 py-2"> Year</th>
                  <th  className="border px-2 py-2">Name of the Activity conducted by the HEI to offer guidance for competitive
examinations/ career counseling offered by the institution during the last five years</th>
                  <th  className="border px-2 py-2">Number of students attended / participated  </th>
                  
                <th className="border px-2 py-2">Action</th>
                </tr>
                  
              </thead>
              <tbody>
                <tr>
                  {["year", "activityname", "students"].map((key) => (
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
                      <th  className="border text-gray-950 px-4 py-2">#</th>
                      <th  className="border text-gray-950 px-4 py-2">Year</th>
                      <th  className="border text-gray-950 px-4 py-2">Name of the Activity conducted by the HEI to offer guidance for competitive
examinations/ career counseling offered by the institution during the last five years</th>
                      <th  className="border text-gray-950 px-4 py-2">  Number of students attended / participated                             
</th>
                     </tr>
                               
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.activityname}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.students}</td>
                       
                   
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

export default Criteria5_1_4;
