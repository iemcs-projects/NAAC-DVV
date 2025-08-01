import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
const Criteria4_3_3= () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };
 const navigate = useNavigate();
  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleRowNameChange = (id, name) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          {/* Page Title and Score */}
           
          <div className="flex justify-between items-center mb-3 ">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 4: Infrastructure and Learning Resources
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">- 4.3 IT Infrastructure</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.3.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
               Bandwidth of internet connection in the Institution  <br/>      
A. ≥ 50 MBPS <br/>  
B. 30 - 50 MBPS  <br/>  
C. 10 - 30 MBPS<br/>
D. 10 - 5 MBPS<br/>
E. less than 50 MBPS<br/>
              </p>
            </div>

            

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Data Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Available internet bandwidth </li>

               
               </ul>
            </div>
          </div>


          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Department</label>
              <select className="w-full border text-gray-950 border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select department</option>
                <option value="computer-science">Computer Science</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Faculty ID</label>
              <input
                type="text"
                placeholder="Enter faculty ID"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Faculty Name</label>
              <input
                type="text"
                placeholder="Enter faculty name"
                className=" text-gray-950 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Radio Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-4">
              Select the Options <br/> 
A. ≥ 50 MBPS<br/> 
B. 30 - 50 MBPS<br/> 
C. 10 - 30 MBPS<br/> 
D. 10 - 5 MBPS<br/> 
E. less than 5 MBPS<br/> 
            </h3>
            <div className="space-y-3">
              {[
                " ≥ 50 MBPS" ,
                "30 - 50 MBPS",
                "10 - 30 MBPS" ,
                "10 - 5 MBPS" ,
                "less than 5 MBPS"
              ].map((label, index) => {
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
              
              <li>Upload any additional Information</li>
<li>Details of available bandwidth of internet connection in the
Institution </li>


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
          <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
                      <Bottom />
                    </div>
        
         
        </div>
      </div>
    </div>
  );
};

export default Criteria4_3_3;
