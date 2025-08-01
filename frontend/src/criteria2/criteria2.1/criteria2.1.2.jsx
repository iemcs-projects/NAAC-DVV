import React, { useState, useEffect, useContext } from "react"; 
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SessionContext } from "../../contextprovider/sessioncontext";
import LandingNavbar from "../../components/landing-navbar";

const Criteria2_1_2 = () => {
  const navigate = useNavigate();

  // Get sessions from context
  const { sessions: availableSessions, isLoading: isLoadingSessions, error: sessionError } = useContext(SessionContext);

  const categories = ["SC", "ST", "OBC", "Divyangjan", "Gen", "Others"];

  // State declarations
  const [currentYear, setCurrentYear] = useState("");
  const [yearData, setYearData] = useState({});
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataRows, setDataRows] = useState({});

  // Initialize currentYear and dataRows when sessions load
  useEffect(() => {
    if (availableSessions && availableSessions.length > 0) {
      setCurrentYear(availableSessions[0]);

      if (!dataRows[availableSessions[0]]) {
        setDataRows({
          [availableSessions[0]]: [
            {
              seats: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
              students: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
              year: ""
            },
          ],
        });
      }
    }
  }, [availableSessions]);

  // Handle year/session dropdown change
  const handleYearChange = (year) => {
    setCurrentYear(year);
    if (!dataRows[year]) {
      setDataRows(prev => ({
        ...prev,
        [year]: [
          {
            seats: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
            students: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
            year: ""
          },
        ],
      }));
    }
  };

  // Fetch provisional score
  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria2/score212");
      console.log("Fetched score data:", response.data);
      // Update to handle both response structures
      setProvisionalScore({
        data: {
          score_sub_sub_criteria: response.data.data?.score_sub_sub_criteria || response.data?.score?.score_sub_sub_criteria || 0
        },
        message: response.data.message || "Score loaded successfully"
      });
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch provisional score");
    } finally {
      setLoading(false);
    }
  };

  // Handle seat/student data changes
  const handleChange = (year, rowIndex, type, category, value) => {
    const updatedRows = [...(dataRows[year] || [])];
    updatedRows[rowIndex][type][category] = value;
    setDataRows({ ...dataRows, [year]: updatedRows });
  };

  // Handle year cell input change in table
  const handleYearCellChange = (session, rowIndex, value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    const updated = [...(dataRows[session] || [])];
    updated[rowIndex].year = numericValue ? parseInt(numericValue, 10) : "";
    setDataRows({ ...dataRows, [session]: updated });
  };

  // Add new row for current session
  const addRow = () => {
    const updated = [...(dataRows[currentYear] || [])];
    updated.push({
      seats: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
      students: { SC: "", ST: "", OBC: "", Divyangjan: "", Gen: "", Others: "" },
      year: ""
    });
    setDataRows({ ...dataRows, [currentYear]: updated });
  };

  // Submit form data to backend
  const handleSubmit = async () => {
    try {
      const sessionYear = parseInt(currentYear.split("-")[0], 10);
      const rows = dataRows[currentYear] || [];
      const yearInput = rows[0]?.year ? Number(rows[0].year) : sessionYear;

      if (isNaN(sessionYear) || sessionYear < 2000 || sessionYear > 2099) {
        throw new Error("Invalid session year. Must be between 2000 and 2099.");
      }
      if (isNaN(yearInput) || yearInput < 2000 || yearInput > 2099) {
        throw new Error("Invalid year input. Must be between 2000 and 2099.");
      }
      if (!rows || rows.length === 0) {
        throw new Error("No data to submit. Please add at least one row.");
      }

      // Calculate totals
      const totalSeats = rows.reduce((sumRows, row) => {
        return sumRows + Object.values(row.seats || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
      }, 0);
      const totalStudents = rows.reduce((sumRows, row) => {
        return sumRows + Object.values(row.students || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
      }, 0);

      // Prepare request data
      const requestData = {
        session: sessionYear,
        year: yearInput,
        number_of_seats_earmarked_for_reserved_category_as_per_GOI: Math.round(Number(totalSeats) || 0),
        number_of_students_admitted_from_the_reserved_category: Math.round(Number(totalStudents) || 0),
      };

      console.log("Sending data to backend:", requestData);

      const response = await axios.post(
        "http://localhost:3000/api/v1/criteria2/createResponse212",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response created for year totals:", response.data);

      await fetchScore();

      // Update the year data with the submitted rows (only in the year-wise table)
      setYearData(prev => {
        const existingData = prev[currentYear] || [];
        // Check if we already have data for this year to avoid duplicates
        const newRows = rows.filter(newRow => 
          !existingData.some(existingRow => 
            JSON.stringify(existingRow) === JSON.stringify(newRow)
          )
        );
        
        return {
          ...prev,
          [currentYear]: [...existingData, ...newRows]
        };
      });

      // Clear the data entry fields completely
      setDataRows(prev => ({
        ...prev,
        [currentYear]: []
      }));

      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      if (error.response && error.response.data) {
        alert("Submission failed: " + error.response.data.message);
      } else {
        alert("Submission failed due to network/server error.");
      }
    }
  };

  const handleDraft = () => {
    console.log("Draft saved", dataRows[currentYear]);
    alert("Draft saved.");
  };

  return (
    <div className="w-screen min-h-screen bg-white text-black overflow-x-auto">
      <LandingNavbar />
      <div className="flex mt-6 flex-1">6
        <Sidebar />
        <div className="flex-1 mt-6 flex flex-col p-4">
          <h2 className="text-lg font-semibold mb-4">
            2.1.2 Average percentage of seats filled against seats reserved for various categories (SC, ST, OBC, Divyangjan, etc.) during the last five years
          </h2>

          {/* Metric Info */}
          <div className="bg-white text-black p-4 mb-6">
            <h3 className="text-blue-700 text-lg font-semibold mb-2">2.1.2 Metric Information</h3>
            <p className="mb-4">
              Average percentage of seats filled against seats reserved for various categories (SC, ST, OBC, Divyangjan, etc. as per applicable reservation policy during the last five years (exclusive of supernumerary seats).
            </p>
            <h4 className="text-blue-700 font-semibold mb-2">Data Requirement for last five years: (As per Data Template)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Number of students admitted from the reserved category</li>
              <li>Total number of seats earmarked for reserved category as per GOI or State government rule</li>
            </ul>
          </div>

          {/* Provisional Score */}
  
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
    {loading ? (
      <p className="text-gray-600">Loading provisional score...</p>
    ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined ? (
      <p className="text-lg font-semibold text-green-800">
        Provisional Score (2.1.2): {typeof provisionalScore.data.score_sub_sub_criteria === 'number'
          ? provisionalScore.data.score_sub_sub_criteria.toFixed(2)
          : provisionalScore.data.score_sub_sub_criteria} %
      </p>
    ) : (
      <p className="text-gray-600">No score data available.</p>
    )}
  </div>



          {/* Session Selector */}
          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Session:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={(e) => handleYearChange(e.target.value)}
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? (
                <option>Loading sessions...</option>
              ) : sessionError ? (
                <option>Error loading sessions</option>
              ) : availableSessions && availableSessions.length > 0 ? (
                availableSessions.map((sess) => (
                  <option key={sess} value={sess}>
                    {sess}
                  </option>
                ))
              ) : (
                <option>No sessions available</option>
              )}
            </select>
          </div>

          {/* Data Entry Table */}
          <table className="w-full border border-black mb-4 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan="2" className="border border-black px-2 py-1">Year</th>
                <th colSpan={categories.length} className="border border-black px-2 py-1">
                  Number of seats earmarked for reserved category
                </th>
                <th colSpan={categories.length} className="border border-black px-2 py-1">
                  Number of students admitted from reserved category
                </th>
              </tr>
              <tr className="bg-gray-100">
                {categories.map((cat) => (
                  <th key={`seat-${cat}`} className="border border-black px-2 py-1">{cat}</th>
                ))}
                {categories.map((cat) => (
                  <th key={`student-${cat}`} className="border border-black px-2 py-1">{cat}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(dataRows[currentYear] || []).map((row, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="border border-black px-1">
                    <input
                      type="number"
                      min="2000"
                      max="2099"
                      step="1"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={row.year ?? ""}
                      onChange={(e) => handleYearCellChange(currentYear, index, e.target.value)}
                      placeholder="YYYY"
                    />
                  </td>
                  {categories.map((cat) => (
                    <td key={`seats-${index}-${cat}`} className="border border-black px-1">
                      <input
                        type="number"
                        className="w-full p-1 border border-gray-300 rounded"
                        value={row.seats[cat] ?? ""}
                        onChange={(e) =>
                          handleChange(currentYear, index, "seats", cat, e.target.value)
                        }
                      />
                    </td>
                  ))}
                  {categories.map((cat) => (
                    <td key={`students-${index}-${cat}`} className="border border-black px-1">
                      <input
                        type="number"
                        className="w-full p-1 border border-gray-300 rounded"
                        value={row.students[cat] ?? ""}
                        onChange={(e) =>
                          handleChange(currentYear, index, "students", cat, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Row Button */}
          <button
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 mb-6"
            onClick={async () => {
              await handleSubmit();
              addRow();
            }}
          >
            Add Row
          </button>

          {/* Display Submitted Year Data */}
          {availableSessions && availableSessions.map((year) => (
            <div key={year} className="border border-gray-400 rounded mb-4">
              <h3 className="bg-gray-200 text-lg font-semibold px-4 py-2">Year: {year}</h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full border border-black text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black px-2 py-1">#</th>
                      {categories.map((cat) => (
                        <th key={`th-seat-${cat}`} className="border border-black px-2 py-1">{cat} Seats</th>
                      ))}
                      {categories.map((cat) => (
                        <th key={`th-stud-${cat}`} className="border border-black px-2 py-1">{cat} Students</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, idx) => (
                      <tr key={idx}>
                        <td className="border border-black px-2 py-1">{idx + 1}</td>
                        {categories.map((cat) => (
                          <td key={`td-seat-${idx}-${cat}`} className="border border-black px-2 py-1">{entry.seats[cat]}</td>
                        ))}
                        {categories.map((cat) => (
                          <td key={`td-stud-${idx}-${cat}`} className="border border-black px-2 py-1">{entry.students[cat]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-2 text-gray-600">No data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* Navigation and Save Buttons */}
          <div className="flex justify-between items-center mt-6 mb-10">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => navigate("/criteria2.1.1")}
            >
              ← Previous
            </button>
            <div className="space-x-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleDraft}
              >
                Save draft
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Submit entry
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigate("/criteria2.1.3")}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria2_1_2;
