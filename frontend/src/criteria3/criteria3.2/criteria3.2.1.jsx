import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria3_2_1 = () => {
  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
  );
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    proj: "", name: "", princ: "", dept: "", amt: "", duration: "", agency: "", type: "",
    supportLinks: ["", "", ""],
  });
  const [yearScores, setYearScores] = useState(
    pastFiveYears.reduce((acc, y) => ({ ...acc, [y]: 0 }), {})
  );
  const [yearCount, setYearCount] = useState(5);
  const [averageScore, setAverageScore] = useState(null);

  const navigate = useNavigate();
  const handleChange = (f, v, idx = null) => {
    if (f === "supportLinks") {
      const tmp = [...formData.supportLinks];
      tmp[idx] = v;
      setFormData({ ...formData, supportLinks: tmp });
    } else setFormData({ ...formData, [f]: v });
  };
  const handleSubmit = () => {
    const { proj, name, princ, dept, amt, duration, agency, type } = formData;
    if (proj && name && princ && dept && amt && duration && agency && type) {
      const entry = { ...formData, year: selectedYear };
      setYearData(p => ({
        ...p,
        [selectedYear]: [...(p[selectedYear] || []), entry],
      }));
      setFormData({
        proj: "", name: "", princ: "", dept: "", amt: "", duration: "", agency: "", type: "",
        supportLinks: ["", "", ""],
      });
    } else alert("Please fill in all fields.");
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
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <div className="text-lg font-medium text-green-500 bg-[#bee7c7] !w-[1000px] h-[50px] pt-[10px] rounded-lg">
                  Provisional Score: 18.75
                </div>
              </div>
              </div></div>
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
            <div className="text-black flex justify-between items-center bg-blue-50 p-4 rounded-t-lg">
              <h4 className="font-semibold">Year-wise Funded Research Projects</h4>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {pastFiveYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto relative">
              <table className="min-w-full table-auto border text-sm">
                <thead className="text-black bg-gray-100 sticky top-0 ">
                  <tr>
                    {[
                      "Title of paper",
                      "Name of the author/s", "Department of the teacher", "Name of journal",
                      "Year of publication", "ISSN number",
                      
                    ].map(h => (
                      <th key={h} className="text-black border px-2 py-2 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {["proj", "name", "dept", "year", "amt", "duration"].map(key => (
                      <td key={key} className="text-black border px-2 py-1">
                        <input
                          className="text-black w-full border rounded px-2 py-1"
                          placeholder={key}
                          value={formData[key]}
                          onChange={e => handleChange(key, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="text-black border px-2 py-1 text-center">
                      <button
                        className="text-black bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
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
          <section className=" text-black bg-white rounded-lg shadow p-4 mb-6">
            <label className=" block text-gray-700 font-medium mb-2">
              Support Links (Journal | UGC | Article):
            </label>
            <div className="flex gap-2">
              {formData.supportLinks.map((link, i) => (
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
