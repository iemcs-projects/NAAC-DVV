// import React, { useState } from "react";
// import Header from "../../components/header";
// import Navbar from "../../components/navbar";
// import Sidebar from "../../components/sidebar";
// import Bottom from "../../components/bottom";
// import { useNavigate } from "react-router-dom";
// const Criteria5_1_3= () => {
//   const [selectedOption, setSelectedOption] = useState("");
//   const [rows, setRows] = useState([]);
//   const [nextId, setNextId] = useState(1);

//   const handleRadioChange = (option) => {
//     setSelectedOption(option);
//   };
 
//   const addRow = () => {
//     setRows([...rows, { id: nextId, name: "" }]);
//     setNextId(nextId + 1);
//   };

//   const handleRowNameChange = (id, name) => {
//     setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
//   };
//   const navigate = useNavigate();
//   const goToNextPage = () => {
//     navigate("/criteria5.1.4");
//   };

//   const goToPreviousPage = () => {
//     navigate("/criteria5.1.2");
//   };
//   return (
//     <div className="min-h-screen w-[1520px] bg-gray-50 flex flex-col">
//       <Header />
//       <Navbar />

//       <div className="flex flex-1">
//         <Sidebar />

//         <div className="flex-1 flex flex-col p-2 mt-[20px]">
//           {/* Page Title and Score */}
           
//           <div className="flex justify-between items-center mb-3 ">
//             <h2 className="text-xl font-medium text-gray-800">
//               Criteria 5: Student Support and Progression
//             </h2>
//             <div className="text-sm">
//               <span className="text-gray-600">5.1 Student Support</span>
//               <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <div className="flex justify-center mb-4">
//               <div className="text-center">
                
//               </div>
//             </div>

//             <div className="mb-6">
//               <h3 className="text-blue-600 font-medium mb-2">5.1.3 Metric Information</h3>
//               <p className="text-sm text-gray-700">
//                Capacity building and skills enhancement initiatives taken by the institution include the following: <br/>      
// 1. Soft skills <br/>  
// 2. Language and communication skills  <br/>  
// 3. Life skills (Yoga, physical fitness, health and hygiene)  <br/>
// 4. ICT/computing skills
//               </p>
//             </div>

            

//             <div className="mb-6">
//               <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
//               <ul className="list-disc pl-5 text-sm text-gray-700">
//                 <li className="mb-1">Number of teachers participated </li>
// <li>Name of the body in which full time teacher participated </li>
// <li>Total number of teachers </li>
               
                
//               </ul>
//             </div>
//           </div>


//           {/* Inputs Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//             <div>
//               <label className="block text-gray-700 mb-2">Department</label>
//               <select className="w-full border text-gray-950 border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option value="">Select department</option>
//                 <option value="computer-science">Computer Science</option>
//                 <option value="mathematics">Mathematics</option>
//                 <option value="physics">Physics</option>
//                 <option value="chemistry">Chemistry</option>
//                 <option value="biology">Biology</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">Faculty ID</label>
//               <input
//                 type="text"
//                 placeholder="Enter faculty ID"
//                 className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">Faculty Name</label>
//               <input
//                 type="text"
//                 placeholder="Enter faculty name"
//                 className=" text-gray-950 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           {/* Radio Buttons */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <h3 className="text-blue-600 font-medium mb-4">
//               Select the Options <br/> 
// 1. Soft skills <br/>  
// 2. Language and communication skills  <br/>  
// 3. Life skills (Yoga, physical fitness, health and hygiene)  <br/>
// 4. ICT/computing skills
//             </h3>
//             <div className="space-y-3">
//               {[
//                 "All of the above",
//                 "Any 3 of the above",
//                 "Any 2 of the above",
//                 "Any 1 of the above",
//                 "None of the above"
//               ].map((label, index) => {
//                 const optionKey = `option${index + 1}`;
//                 return (
//                   <div key={optionKey} className="flex items-center">
//                     <input
//                       type="radio"
//                       id={optionKey}
//                       name="participation"
//                       className="mr-3 h-4 w-4 text-blue-600"
//                       checked={selectedOption === optionKey}
//                       onChange={() => handleRadioChange(optionKey)}
//                     />
//                     <label htmlFor={optionKey} className="text-sm text-gray-800">{label}</label>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* File Upload */}
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="bg-blue-50 p-4 rounded-md mb-6">
//             <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              
//               <li>Data Requirement: (As per Data Template):Name of the capability building and skills enhancement initiatives </li>
//               <li>Data Requirement: (As per Data Template): Year of implementation </li>
//               <li>Data Requirement: (As per Data Template): Number of students enrolled </li>
// <li>Data Requirement: (As per Data Template):Name of the agencies involved with contact details </li>

//             </ul>
//           </div>

//             <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
//             <div className="flex items-center mb-4">
//               <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
//                 <i className="fas fa-upload mr-2"></i> Choose Files
//                 <input type="file" className="hidden" multiple />
//               </label>
//               <span className="ml-3 text-gray-600">No file chosen</span>
//             </div>
            
//           </div>

//            <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
//             <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
//           </div>
          
        
          
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Criteria5_1_3;



import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria5_1_3 = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState({
    programName: "",
    date: "",
    studentsEnrolled: "",
    agency: "",
  });
  const [submittedData, setSubmittedData] = useState([]);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
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
              4. ICT/computing skills
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

          

          {/* Input Table */}
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
                    <input
                      type="text"
                      value={formData.programName}
                      onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-gray-950"
                      placeholder="Enter program name"
                    />
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
                  <td className="px-2 py-2 border">
                    <button
                      onClick={() => {
                        if (formData.programName && formData.date && formData.studentsEnrolled && formData.agency) {
                          setSubmittedData([...submittedData, formData]);
                          setFormData({ programName: "", date: "", studentsEnrolled: "", agency: "" });
                        } else {
                          alert("Please fill all fields");
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
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

          {/* MCQs Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">Select the Options</h3>
            <div className="space-y-3">
              {["All of the above", "Any 3 of the above", "Any 2 of the above", "Any 1 of the above", "None of the above"].map((label, index) => {
                const optionKey = `option${index + 1}`;
                return (
                  <div key={optionKey} className="flex items-center">
                    <input
                      type="radio"
                      id={optionKey}
                      name="participation"
                      className="mr-3 h-4 w-4 text-blue-600"
                      checked={selectedOption === optionKey}
                      onChange={() => handleRadioChange(optionKey)}
                    />
                    <label htmlFor={optionKey} className="text-sm text-gray-800">{label}</label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Details of capability building and skills enhancement initiatives </li>
                <li>Any additional information</li>
                <li>Link to Institutional website
</li>
               
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
