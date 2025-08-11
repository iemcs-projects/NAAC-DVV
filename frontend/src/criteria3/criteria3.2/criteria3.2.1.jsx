import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { SessionContext } from "../../contextprovider/sessioncontext";
import { useContext } from "react";

const Criteria3_2_1 = () => {

  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
  );
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const[submittedData, setSubmittedData] = useState([]);
  const [yearData, setYearData] = useState({});
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    proj: '',           // paper_title
    name: '',           // author_names
    dept: '',           // department
    journal: '',        // journal_name
    year: '',           // year_of_publication
    issn: '',           // issn_number
    indexation: '',     // indexation_status
    supportLinks: ["", "", ""]  // Add this line
  });
  const [provisionalScore, setProvisionalScore] = useState(null);
  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, y) => ({ ...acc, [y]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAvailableSessions(sessions);
      if (!currentYear && sessions.length > 0) {
        setCurrentYear(sessions[0]);
      }
    } else {
      setAvailableSessions(pastFiveYears);
      if (!currentYear) {
        setCurrentYear(pastFiveYears[0]);
      }
    }
  }, [sessions, currentYear, pastFiveYears]);


  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks" && index !== null) {
      setFormData(prev => {
        const newLinks = [...prev.supportLinks];
        newLinks[index] = value;
        return { ...prev, supportLinks: newLinks };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score321");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paper_title = formData.proj.trim();
    const author_names = formData.name.trim();
    const department = formData.dept.trim();
    const journal_name = formData.journal.trim();
    const year_of_publication = formData.year.trim();
    const issn_number = formData.issn.trim();
    const inputYear = formData.year.trim();
    const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    const year = inputYear || sessionFull;

    if (!paper_title || !author_names || !department || !journal_name || !year_of_publication || !issn_number ) {
      alert("Please fill in all required fields: Paper Title, Author Names, Department, Journal Name, Year of Publication, ISSN Number");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse321", {
        session: parseInt(session),
        year,
        paper_title,
        author_names,
        department,
        journal_name,
        year_of_publication,
        issn_number,

      });

      const resp = response?.data?.data || {};
      const newEntry = {
        year: resp.year || year,
        paper_title: resp.paper_title || paper_title,
        author_names: resp.author_names || author_names,
        department: resp.department || department,
        journal_name: resp.journal_name || journal_name,
        year_of_publication: resp.year_of_publication || year_of_publication,
        issn_number: resp.issn_number || issn_number,
       
      };

      setSubmittedData((prev) => [...prev, newEntry]);
      setYearData((prev) => ({
        ...prev,
        [newEntry.year]: [...(prev[newEntry.year] || []), {
          paper_title: newEntry.paper_title,
          author_names: newEntry.author_names,
          department: newEntry.department,
          journal_name: newEntry.journal_name,
          year_of_publication: newEntry.year_of_publication,
          issn_number: newEntry.issn_number,
         
        }],
      }));

      setFormData({ 
        proj: "",
        name: "",
        dept: "",
        journal: "",
        year: "",
        issn: "",
      
      });
      fetchScore();
      alert("Paper data submitted successfully!");
    } catch (error) {
      console.error("Error submitting paper data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit paper data");
    }
  };

  const goPrev = () => navigate("/criteria3.1.1");
  const goNext = () => navigate("/criteria3.1.3");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header /><Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
          {/* Metric Info */}
          <section className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.2.1): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
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

            <h3 className="text-blue-600 font-medium mb-2">3.2.1 Metric Information</h3>
            <p className="text-gray-700 mb-2">
             3.2.1.1. Number of research papers in the Journals notified on UGC
website during the last five years
            </p>
            <h4 className="font-semibold mb-1">Requirements:</h4>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Any additional information</li>
              <li>List of research papers by title, author, department, name and
year of publication (Data Template) </li>
              
            </ul>
          </section>

          {/* Input Table */}
          <section className="bg-white rounded-lg shadow mb-6">
  <div className="mb-4">
    <label className="font-medium text-gray-700 mr-2">Select Year:</label>
    <select
  className="border px-3 py-1 rounded text-black"
  value={currentYear}
  onChange={(e) => setCurrentYear(e.target.value)}
>
  {(availableSessions || []).map((year) => (
    <option key={year} value={year}>{year}</option>
  ))}
</select>
  </div>
  <div className="overflow-x-auto relative">
    <table className="min-w-full table-auto border text-sm">
      <thead className="text-black bg-gray-100 sticky top-0">
        <tr>
          {[
            "Title of paper",
            "Name of the author/s",
            "Department",
            "Journal name",
            "Year of publication",
            "ISSN number",
          ].map((header) => (
            <th key={header} className="text-black border px-2 py-2 text-left font-medium">
              {header}
            </th>
          ))}
          <th className="text-black border px-2 py-2 text-left font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="text-black border px-2 py-1">
            <input
              className="text-black w-full border rounded px-2 py-1"
              placeholder="Paper Title"
              value={formData.proj}
              onChange={e => handleChange("proj", e.target.value)}
            />
          </td>
          <td className="text-black border px-2 py-1">
            <input
              className="text-black w-full border rounded px-2 py-1"
              placeholder="Author Names"
              value={formData.name}
              onChange={e => handleChange("name", e.target.value)}
            />
          </td>
          <td className="text-black border px-2 py-1">
            <input
              className="text-black w-full border rounded px-2 py-1"
              placeholder="Department"
              value={formData.dept}
              onChange={e => handleChange("dept", e.target.value)}
            />
          </td>
          <td className="text-black border px-2 py-1">
            <input
              className="text-black w-full border rounded px-2 py-1"
              placeholder="Journal Name"
              value={formData.journal}
              onChange={e => handleChange("journal", e.target.value)}
            />
          </td>
          <td className="text-black border px-2 py-1">
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              className="text-black w-full border rounded px-2 py-1"
              placeholder="Year"
              value={formData.year}
              onChange={e => handleChange("year", e.target.value)}
            />
          </td>
          <td className="text-black border px-2 py-1">
            <input
              className="text-black w-full border rounded px-2 py-1"
              placeholder="ISSN Number"
              value={formData.issn}
              onChange={e => handleChange("issn", e.target.value)}
            />
          </td>
        
          <td className="text-black border px-2 py-1 text-center">
            <button
              className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

          {/* Support Links */}
    {/* Support Links */}
<section className="text-black bg-white rounded-lg shadow p-4 mb-6">
  <label className="block text-gray-700 font-medium mb-2">
    Support Links (Journal | UGC | Article):
  </label>
  <div className="flex gap-2">
    {(formData.supportLinks || []).map((link, i) => (
      <input
        key={i}
        type="url"
        placeholder={["Journal", "UGC", "Article"][i]}
        className="flex-1 border rounded px-3 py-2"
        value={link}
        onChange={e => handleChange("supportLinks", e.target.value, i)}
      />
    ))}
  </div>
</section>

          {/* Year-wise Data */}
          {pastFiveYears.map(year => (
            <section key={year} className="text-black bg-white rounded-lg shadow mb-6">
              <h5 className="bg-gray-100 px-4 py-2 font-semibold rounded-t-lg ">
                Year: {year}
              </h5>
              <div className="overflow-x-auto relative">
                <table className="min-w-full table-auto border text-sm">
                  <thead className="bg-gray-200 sticky top-0 ">
                    <tr>
                      {["#", "Project", "PI/Co-PI", "Dept", "Amount", "Duration", "Agency", "Type", "Links"].map(h => (
                        <th key={h} className="border px-2 py-1 font-medium  border-black p-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year]?.length ?
                      yearData[year].map((e, i) => (
                        <tr key={i} className="even:bg-gray-50 ">
                          <td className=" px-2 py-1 border border-black p-4">{i + 1}</td>
                          {["proj", "name", "dept", "amt", "duration", "agency", "type"].map(k => (
                            <td key={k} className=" px-2 py-1 border border-black p-4">{e[k]}</td>
                          ))}
                          <td className="border px-2 py-1">
                            <div className="flex gap-2">
                              {e.supportLinks.map((url, idx) => url && (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  {["Journal", "UGC", "Article"][idx]}
                                </a>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )) :
                      <tr>
                        <td colSpan={9} className=" py-4 text-center text-gray-600 border-black p-4">
                          No data for {year}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {/* Calculation Section */}
          <section className="text-black bg-white rounded-lg shadow p-6 mb-6 overflow-x-auto relative">
            <h4 className="font-semibold mb-2">Calculation Table (Last 5 Years)</h4>
            <table className="min-w-full table-auto border text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-4 py-2">Year</th>
                  {pastFiveYears.map(y => (
                    <th key={y} className="border px-4 py-2">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-medium">Calculated Score</td>
                  {pastFiveYears.map(y => (
                    <td key={y} className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        value={yearScores[y]}
                        onChange={e => setYearScores({ ...yearScores, [y]: parseFloat(e.target.value) || 0 })}
                        className="w-20 border rounded px-1 text-center"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="mt-4 flex items-center gap-2">
              <label className="font-medium">Average over last</label>
              <input
                type="number"
                value={yearCount}
                min="1"
                max="5"
                className="w-20 border rounded px-2 py-1 text-center"
                onChange={e => setYearCount(parseInt(e.target.value) || 1)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  const vals = pastFiveYears.slice(0, yearCount).map(y => yearScores[y]);
                  const avg = (vals.reduce((a, b) => a + b, 0) / yearCount).toFixed(2);
                  setAverageScore(avg);
                }}
              >
                Calculate
              </button>
            </div>
            {averageScore !== null && (
              <div className="mt-3 font-semibold text-blue-700">
                Average Score: {averageScore}
              </div>
            )}
          </section>

          {/* Navigation Buttons */}
          <footer className="bg-white pt-4 border-t">
            <Bottom onPrevious={goPrev} onNext={goNext} />
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Criteria3_2_1;
