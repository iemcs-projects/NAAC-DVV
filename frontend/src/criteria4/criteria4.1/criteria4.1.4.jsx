// import React, { useState } from "react";
// import Header from "../../components/header";
// import Navbar from "../../components/navbar";
// import Sidebar from "../../components/sidebar";
// import Bottom from "../../components/bottom";

// const Criteria4_1_4 = () => {
//   const currentYear = new Date().getFullYear();
//             const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
//             const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
//             const [yearData, setYearData] = useState({});
//   const [formData, setFormData] = useState({
//     year: "",
//     budget: 0,
//     expen_infra: 0,
//     totexpen: 0,
//     expen_academic: 0,
//     expen_phy: 0,
//   });

//   const [submittedData, setSubmittedData] = useState([]);

//   const handleChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   const handleSubmit = () => {
//     if (
//       formData.year &&
//       formData.budget &&
//       formData.expen_infra &&
//       formData.totexpen &&
//       formData.expen_academic &&
//       formData.expen_phy
//     ) {
//       setSubmittedData([...submittedData, formData]);
//       setFormData({
//         year: "",
//         budget: 0,
//         expen_infra: 0,
//         totexpen: 0,
//         expen_academic: 0,
//         expen_phy: 0,
//       });
//     } else {
//       alert("Please fill in all required fields.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <Navbar />
//       <div className="flex min-h-screen">
//         <Sidebar />
//         <div className="flex-1 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-medium text-gray-800">
//               Criteria 4: - Infrastructure and Learning Resources
//             </h2>
//             <div className="text-sm">
//               <span className="text-gray-600"> 4.1 Physical Facilities</span>
//               <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <div className="flex justify-center mb-4">
//               <div className="text-center">
//                 <div className="text-lg font-medium text-green-500 bg-[#bee7c7] !w-[1000px] h-[50px] pt-[10px] rounded-lg">
//                   Provisional Score: 18.75
//                 </div>
//               </div>
//             </div>

//             <div className="mb-6">
//               <h3 className="text-blue-600 font-medium mb-2">
//                 4.1.4 Metric Information
//               </h3>
//               <p className="text-sm text-gray-700">
//                 Expenditure for infrastructure augmentation, excluding salary
//                 year wise during last five years (INR in lakhs)
//               </p>
//             </div>

//             {/* <div className="mb-6">
//               <h3 className="text-blue-600 font-medium mb-2">
//                 Calculation Formula
//               </h3>
//               <p className="text-sm text-gray-700">
//                 Percentage = (Expenditure for infrastructure augmentation
//                 excluding salary/Total expenditure excluding salary) × 100
//               </p>
//             </div> */}

//             <div className="mb-6">
//               <h3 className="text-blue-600 font-medium mb-2">
//                 Required Documents:
//               </h3>
//               <ul className="list-disc pl-5 text-sm text-gray-700">
//                 <li className="mb-1">Upload any additional information</li>
//                 <li>Upload audited utilization statements</li>
//                 <li>
//                   Upload Details of budget allocation, excluding salary during
//                   the last five years (Data Template)
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <h2 className="text-xl font-bold text-gray-500 mb-4">
//             4.1.4 Average percentage of expenditure, excluding salary for
//             infrastructure augmentation during last five years (INR in Lakhs)
//           </h2>

// <div className="flex justify-end mb-4">
//             <label className="mr-2 font-medium text-gray-700">Select Year:</label>
//             <select
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(e.target.value)}
//               className="border px-3 py-1 rounded text-gray-900"
//             >
//               {pastFiveYears.map((year) => (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               ))}
//             </select>
//           </div>
//           {/* Input Table */}
//           <div className="flex justify-center overflow-auto border rounded mb-6">
//             <table className="min-w-full border text-sm text-left max-w-full">
//               <thead className="bg-gray-100 font-semibold text-gray-950">
//                 <tr>
//                   {[
//                     "Year",
//                     "Budget allocated for infrastructure augmentation (INR in Lakh) ",
//                     "Expenditure for infrastructure augmentation (INR in Lakh)",
//                     "Total expenditure excluding Salary (INR in Lakh)",
//                     "Expenditure on maintenance of academic facilities (excluding salary for human resources) (INR in Lakh)",
//                     "Expenditure on maintenance of physical facilities (excluding salary for human resources) (INR in Lakh)",
//                   ].map((heading) => (
//                     <th key={heading} className="px-4 py-2 border">
//                       {heading}
//                     </th>
//                   ))}
//                   <th className="px-4 py-2 border">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   {/* Year Dropdown */}
//                   <td className="px-2 py-2 border">
//                     <select
//                       value={formData["year"]}
//                       onChange={(e) => handleChange("year", e.target.value)}
//                       className="w-full px-2 py-1 border rounded text-gray-900 border-black"
//                     >
//                       <option value="">select</option>
//                       {[2020, 2021, 2022, 2023, 2024].map((yr) => (
//                         <option key={yr} value={yr}>
//                           {yr}
//                         </option>
//                       ))}
//                     </select>
//                   </td>

//                   {/* Other Inputs */}
//                   {[
//                     "budget",
//                     "expen_infra",
//                     "totexpen",
//                     "expen_academic",
//                     "expen_phy",
//                   ].map((field) => (
//                     <td key={field} className="px-2 py-2 border">
//                       <input
//                         type="text"
//                         value={formData[field]}
//                         onChange={(e) => handleChange(field, e.target.value)}
//                         className="w-full px-2 py-1 border rounded text-gray-900 border-black"
//                         placeholder={field}
//                       />
//                     </td>
//                   ))}
//                   <td className="px-2 py-2 border">
//                     <button
//                       onClick={handleSubmit}
//                       className="px-3 py-1 !bg-blue-600 text-white rounded hover:1bg-blue-600"
//                     >
//                       Add
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           {/* Submitted Table */}
//           <div className="flex justify-center overflow-auto border rounded mb-6">
//             <div className="w-full max-w-full">
//               <h3 className="text-lg font-semibold mb-2 text-gray-950">
//                 Submitted Entries
//               </h3>
//               {submittedData.length > 0 ? (
//                 <table className="min-w-full text-sm border max-w-full border-black">
//                   <thead className="bg-gray-950 font-semibold text-gray-950">
//                     <tr>
//                       <th className="px-4 py-2 border text-gray-750">#</th>
//                       {[
//                         "year",
//                         "budget",
//                         "expen_infra",
//                         "totexpen",
//                         "expen_academic",
//                         "expen_phy",
//                       ].map((heading) => (
//                         <th
//                           key={heading}
//                           className="px-4 py-2 border text-gray-950"
//                         >
//                           {heading}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {submittedData.map((entry, i) => (
//                       <tr key={i} className="even:bg-gray-50 text-gray-950">
//                         <td className="px-2 py-2 border border-black">
//                           {i + 1}
//                         </td>
//                         <td className="px-2 py-2 border border-black">
//                           {entry.year}
//                         </td>
//                         <td className="px-2 py-2 border border-black">
//                           {entry.budget}
//                         </td>
//                         <td className="px-2 py-2 border border-black">
//                           {entry.expen_infra}
//                         </td>
//                         <td className="px-2 py-2 border border-black">
//                           {entry.totexpen}
//                         </td>
//                         <td className="px-2 py-2 border border-black">
//                           {entry.expen_academic}
//                         </td>
//                         <td className="px-2 py-2 border border-black">
//                           {entry.expen_phy || "-"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <p className="text-gray-600">No data submitted yet.</p>
//               )}
//             </div>
//           </div>

//           <div className="mt-8 flex justify-center overflow-auto border rounded p-4">
//             <div className="w-full max-w-4xl">
//               <h2 className="text-lg font-semibold mb-2 text-gray-700">
//                 Calculation Table (Last 5 Years)
//               </h2>
//               <table className="table-auto border-collapse w-full">
//                 <thead>
//                   <tr className="bg-gray-100 text-gray-600 font-semibold">
//                     <th className="border border-[gray] px-4 py-2">YEAR</th>
//                     <th className="border border-[gray] px-4 py-2">2020-21</th>
//                     <th className="border border-[gray] px-4 py-2">2021-22</th>
//                     <th className="border border-[gray] px-4 py-2">2022-23</th>
//                     <th className="border border-[gray] px-4 py-2">2023-24</th>
//                     <th className="border border-[gray] px-4 py-2">2024-25</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className="border border-black px-4 py-2 font-medium text-gray-600">
//                       Calculated Score
//                     </td>
//                     <td className="border border-black px-4 py-2 text-center">
//                       -
//                     </td>
//                     <td className="border border-black px-4 py-2 text-center">
//                       -
//                     </td>
//                     <td className="border border-black px-4 py-2 text-center">
//                       -
//                     </td>
//                     <td className="border border-black px-4 py-2 text-center">
//                       -
//                     </td>
//                     <td className="border border-black px-4 py-2 text-center">
//                       -
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//               <div className="flex justify-end mt-4">
//                 <button className="px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-blue-700">
//                   Calculate Score
//                 </button>
//               </div>
//               <p className="text-gray-600 mt-2">
//                 Total number of years considered: 5
//               </p>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="bg-blue-50 p-4 rounded-md mb-6">
//             <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
//               <li>Upload  Additional information
// </li>
              
// <li>Link for Additional information   </li>
//             </ul>
//           </div>

//             <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
// <div className="flex items-center mb-4">
//   <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
//     <i className="fas fa-upload mr-2"></i> Choose Files
//     <input type="file" className="hidden" multiple />
//   </label>
//   <span className="ml-3 text-gray-600">No file chosen</span>
// </div>

// <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Paste Link for Additional Information</label>
// <input
//   type="text"
//   placeholder="Enter URL here"
//   className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
// />

            
//           </div>

//           <Bottom />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Criteria4_1_4;

import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria4_1_4 = () => {
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);

  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    year: "",
    budget: "",
    total: "",
    academic: "",
    physical: "",
    supportLinks: [""], // ✅ Initialize with one empty link
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
    const {
      year,
    budget,
    total,
    academic,
    physical,
    } = formData;

    if (
      year &&
    budget &&
    total &&
    academic &&
    physical 
    ) {
      const updatedForm = { ...formData, year: selectedYear }; // ✅ Add year to form data

      const updatedYearData = {
        ...yearData,
        [selectedYear]: [...(yearData[selectedYear] || []), updatedForm],
      };

      setYearData(updatedYearData);
      setFormData({
        year: "",
    budget: "",
    expen:"",
    total: "",
    academic: "",
    physical: "",
    supportLinks: [""],
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  const goToNextPage = () => navigate("/criteria4.4.2");
  const goToPreviousPage = () => navigate("/criteria4.3.3s");

  const totalPrograms = years.reduce((acc, year) => acc + (yearData[year]?.length || 0), 0);
  const averagePrograms = (totalPrograms / years.length).toFixed(2);

  return (
    <div className="w-[1690px] min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 p-6">

          {/* --- Intro Section --- */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Criterion 4 - Infrastructure and Learning Resources
            </h2>
            <div className="text-sm text-gray-600">4.1 Physical Facilities</div>
          </div>

          {/* --- Metric Info --- */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">4.1.4 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Average percentage of expenditure, excluding salary for infrastructure
augmentation during last five years(INR in Lakhs)
            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>Expenditure for infrastructure augmentation</li>
<li>Total expenditure excluding salary</li>
            </ul>
          </div>

          {/* --- Year Selection & Entry Table --- */}
          <div className="border rounded mb-8">
            <div className="flex justify-between items-center bg-blue-100 text-gray-800 px-4 py-2">
              <h2 className="text-xl font-bold"></h2>
              <div>
                <label className="mr-2 font-medium">Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border px-3 py-1 rounded text-gray-950"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Row */}
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 text-gray-950">
                <tr>
                  <th className="border px-2 py-2">Year</th>
                  <th className="border px-2 py-2">budget</th>
                  <th className="border px-2 py-2">expen</th>
                  <th className="border px-2 py-2">total</th>
                  <th className="border px-2 py-2">academic</th>
                  <th className="border px-2 py-2">physical</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1 text-gray-900 text-center">{selectedYear}</td>
                  {["Year", "budget", "expen", "total", "academic","physical"].map((key) => (
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
                      className="!bg-blue-600 text-white px-3 py-1 rounded hover:!bg-blue-700"
                      onClick={handleSubmit}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Support Links */}
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
                className="mt-2 px-3 py-1 !bg-blue-600 text-white rounded hover:!bg-blue-700 w-fit"
              >
                + Add Another Link
              </button>
            </div>
          </div>

          {/* Display Table Per Year */}
          {years.map((year) => (
            <div key={year} className="mb-8 border rounded">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">Year: {year}</h3>
              {yearData[year]?.length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border text-gray-900 px-2 py-1">#</th>
                      <th className="border text-gray-900 px-2 py-1">Year</th>
                      <th className="border text-gray-900 px-2 py-1">budget</th>
                      <th className="border text-gray-900 px-2 py-1">expen</th>
                      <th className="border text-gray-900 px-2 py-1">total</th>
                      <th className="border text-gray-900 px-2 py-1">academic</th>
                      <th className="border text-gray-900 px-2 py-1">physical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        <td className="border text-gray-900 border-black px-2 py-1">{idx + 1}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.year}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.budget}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.expen}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.total}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.academic}</td>
                        <td className="border text-gray-900 border-black px-2 py-1">{entry.physical}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 p-4">No data available for {year}.</p>
              )}
            </div>
          ))}

          {/* Average Calculator */}
          <div className="overflow-auto border rounded p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Calculation Table (Last 5 Years)
            </h2>
            <table className="table-auto border-collapse w-full">
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
                  <td className="border px-4 py-2 font-medium text-gray-600">Calculated Score</td>
                  {Object.keys(yearScores).map((year) => (
                    <td key={year} className="border px-4 py-2 text-center">
                      <input
                        type="number"
                        value={yearScores[year]}
                        onChange={(e) =>
                          setYearScores({ ...yearScores, [year]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 text-center border px-1 rounded text-gray-950"
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
                className="ml-4 px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-green-700"
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

          {/* Navigation Footer */}
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria4_1_4;




