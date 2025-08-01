import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria5_1_2= () => {
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});

  const [formData, setFormData] = useState({
    year: "",
    schemename: "",
    govtstudents: "",
    govtamount: "",
    inststudents: "",
    instamount: "",
   
    
    supportLinks: [""],
  });

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

  const handleSubmit = () => {
  const { year,schemename, govtstudents, govtamount, inststudents, instamount } = formData;
  if (year&&schemename && govtstudents && govtamount && inststudents && instamount) {
    const updatedYearData = {
      ...yearData,
      [selectedYear]: [...(yearData[selectedYear] || []), formData],
    };
    setYearData(updatedYearData);
    setFormData({
      year: "",
      schemename: "", 
      govtstudents: "",
      govtamount: "",
      inststudents: "",
      instamount: "",
      supportLinks: [""],
    });
  } else {
    alert("Please fill in all fields.");
  }
};
const goToNextPage = () => {
    navigate("/criteria5.1.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria5.1.1");
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
              <h3 className="text-blue-600 font-medium mb-2">5.1.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
              Average percentage of students benefitted by scholarships, freeships
etc. provided by the institution / non- government agencies
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Number of students benefited by scholarships and freeships
institution / non- government agencies </li>

<li>Upload any additional information</li> 
                </ul>
            </div>
          </div>

          <div className="border rounded mb-8">
            <div className=" items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold">Students benefitted by scholarships, freeships
etc. provided by the institution / non- government agencies </h2>
              <div className=" mb-1">
                <label className="text-gray-700 font-medium mr-2 ml-[70px]">Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded text-gray-950 "
                >
                  {pastFiveYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th rowSpan="2" className="border px-2 py-2"> Year</th>
                  <th rowSpan="2" className="border px-2 py-2">Name of the scheme</th>
                  <th colSpan="2" className="border px-2 py-2">Number of students benefited by government scheme and amount </th>
                  <th  colSpan="2" className="border px-2 py-2">Number of students benefited by  the institution's schemes and 
amount </th>
                <th rowSpan="2" className="border px-2 py-2">Action</th>
                </tr>
                  <tr>
        <th className="border px-2 py-2">Number of students</th>
        <th className="border px-2 py-2">Amount</th>
        <th className="border px-2 py-2">Number of students</th>
        <th className="border px-2 py-2">Amount</th>
      </tr>
              </thead>
              <tbody>
                <tr>
                  {["year", "schemename", "govtstudents", "govtamount", "inststudents", "instamount"].map((key) => (
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
                      <th rowSpan="2" className="border text-gray-950 px-4 py-2">Name of the Scheme</th>
                      <th colSpan="2" className="border text-gray-950 px-4 py-2">Number of students benefited by government scheme and amount</th>
                      <th colSpan="2" className="border text-gray-950 px-4 py-2">Number of students benefited by the institution's schemes and amount</th>
                    </tr>
                                 <tr>
        <th className="border  text-gray-950 px-2 py-2">Number of students</th>
        <th className="border  text-gray-950 px-2 py-2">Amount</th>
        <th className="border  text-gray-950 px-2 py-2">Number of students</th>
        <th className="border  text-gray-950 px-2 py-2">Amount</th>
      </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border text-gray-950 px-2 py-1">{index + 1}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.year}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.schemename}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.govtstudents}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.govtamount}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.inststudents}</td>
                        <td className="border text-gray-950 px-2 py-1">{entry.instamount}</td>
                   
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

export default Criteria5_1_2;
