import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
const Criteria3_2_2 = () => {
  const currentYear = new Date().getFullYear();
          const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
          const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
          const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    sno: "",
    name: "",
    title: "",
    paper: "",
    conf: "",
    year: "",
    issn: "",
  yes: "",
  pub:"",
  });
  const [submittedData, setSubmittedData] = useState([]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (
      formData.sno &&
      formData.name &&
      formData.title &&
      formData.paper &&
      formData.conf &&
      formData.year &&
      formData.issn &&
      formData.yes &&
      formData.pub
       
      
    ) {
      setSubmittedData([...submittedData, formData]);
      setFormData({
       sno: "",
  name: "",
  title: "",
  paper: "",
  conf: "",
  year: "",
  issn: "",
  yes: "",
  pub: "",
      });n
    } else {
      alert("Please fill in all required fields.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 3- Research, Innovations and Extension 
            </h2>
            <div className="text-sm">
              <span className="text-gray-600"> 3.2- Research Publication and Awards</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <div className="text-lg font-medium text-green-500 bg-[#bee7c7] !w-[1000px] h-[50px] pt-[10px] rounded-lg">
                  Provisional Score: 18.75
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">3.2.2 Metric Information</h3>
              <p className="text-sm text-gray-700">
               3.2.2.1. Total number of books and chapters in edited volumes/books
published and papers in national/ international conference proceedings
year wise during last five years
              </p>
            </div>

            

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">
                Any additional information</li>
<li>List books and chapters edited volumes/ books published (Data
Template)</li>

              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-500 mb-4">Number of books and chapters in edited volumes/books published and
papers published in national/ international conference proceedings
per teacher during last five years

</h2>
<div className="flex justify-end mb-4">
            <label className="mr-2 font-medium text-gray-700">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border px-3 py-1 rounded text-gray-900"
            >
              {pastFiveYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>


          {/* Input Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm text-left max-w-full">
              <thead className="bg-gray-100 font-semibold text-gray-950">
                <tr>
                  {[
                    "Sl. No.",
                    "Name of the teacher",
                    "Title of the book/chapters  published ",
                    "Title of the paper",
                    "Title of the proceedings of the conference",
                    "Year of publication",
                    "ISBN/ISSN number of the proceeding",
                    "Whether at the time of publication Affiliating InstitutionWas same Yes/NO",
                    "Name of the publisher",
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
                  {[
                   "sno",
   "name",
   "title",
   "paper",
   "conf",
   "year",
   "issn",
   "yes",
   "pub",
                  ].map((field) => (
                    <td key={field} className="px-2 py-2 border">
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-gray-900 border-black"
                        placeholder={field}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 border">
                    <button
                      onClick={handleSubmit}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Appended Data Table */}
          <div className="flex justify-center overflow-auto border rounded mb-6">
            <div className="w-full max-w-full">
              <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
              {submittedData.length > 0 ? (
                <table className="min-w-full text-sm border max-w-full border-black">
                  <thead className="bg-gray-950 font-semibold text-gray-950">
                    <tr>
                      <th className="px-4 py-2 border text-gray-750 !bg-white">#</th>
                      {[
                        "Name of the Project/ Endowments, Chairs",
                    "Name of the Principal Investigator/Co-Investigator",
                    "Department of Principal Investigator ",
                    "Year of Award",
                    "Amount Sanctioned",
                    "Duration of the project",
                    "Name of the Funding Agency ",
                    "Type  (Government/non-Government)",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-2 border text-gray-950 !bg-white">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submittedData.map((entry, i) => (
                      <tr key={i} className="even:bg-gray-50 text-gray-950">
                        <td className="px-2 py-2 border border-black">{i + 1}</td>
                        <td className="px-2 py-2 border border-black">{entry.sno}</td>
<td className="px-2 py-2 border border-black">{entry.name}</td>
<td className="px-2 py-2 border border-black">{entry.title}</td>
<td className="px-2 py-2 border border-black">{entry.paper}</td>
<td className="px-2 py-2 border border-black">{entry.conf}</td>
<td className="px-2 py-2 border border-black">{entry.year}</td>
<td className="px-2 py-2 border border-black">{entry.issn}</td>
<td className="px-2 py-2 border border-black">{entry.yes}</td>
<td className="px-2 py-2 border border-black">{entry.pub}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No data submitted yet.</p>
              )}
            </div>
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
                    <th className="border border-[gray] px-4 py-2">2020-21</th>
                    <th className="border border-[gray] px-4 py-2">2021-22</th>
                    <th className="border border-[gray] px-4 py-2">2022-23</th>
                    <th className="border border-[gray] px-4 py-2">2023-24</th>
                    <th className="border border-[gray] px-4 py-2">2024-25</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">
                      Number
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>Upload  Additional information
</li>
              
<li>Link for Additional information   </li>
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

<label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Paste Link for Additional Information</label>
<input
  type="text"
  placeholder="Enter URL here"
  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
/>

            
          </div>

          <Bottom />
           {/* <button>Next</button> */}
        </div>
      </div>
    </div>
  );
};

export default Criteria3_2_2;
