import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
const Criteria5_1_5= () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [rows, setRows] = useState([]);
  const [nextId, setNextId] = useState(1);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };
 
  const addRow = () => {
    setRows([...rows, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleRowNameChange = (id, name) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, name } : row)));
  };
  const navigate = useNavigate();
  const goToNextPage = () => {
    navigate("/criteria5.2.1");
  };

  const goToPreviousPage = () => {
    navigate("/criteria5.1.4");
  };
  return (
    <div className="min-h-screen w-[1520px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col p-2 mt-[20px]">
          {/* Page Title and Score */}
           
          <div className="flex justify-between items-center mb-3 ">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 5: Student Support and Progression
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">5.1 Student Support</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">5.1.5 Metric Information</h3>
              <p className="text-sm text-gray-700">
              The Institution has a transparent mechanism for timely redressal of student grievances including sexual harassment and ragging cases: <br/>      
1. Implementation of guidelines of statutory/regulatory bodies <br/>  
2. Organisation wide awareness and undertakings on policies with zero tolerance  <br/>  
3. Mechanisms for submission of online/offline students’ grievances  <br/>
4. Timely redressal of the grievances through appropriate committees
              </p>
            </div>

            

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                 <li>Upload the grievance redressal policy document with reference to prevention of sexual harassment committee and anti ragging committee, constitution of various committees for addressing the issues, minutes of the meetings of the committees, number of cases received and redressed. </li>
              <li>Minutes of the meetings of student redressal committee, prevention of sexual harassment committee and Anti Ragging committee </li>
              <li>Upload any additional information </li>
<li>Details of student grievances including sexual harassment and ragging cases </li>
               
                
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
1. Implementation of guidelines of statutory/regulatory bodies <br/>  
2. Organisation wide awareness and undertakings on policies with zero tolerance  <br/>  
3. Mechanisms for submission of online/offline students’ grievances  <br/>
4. Timely redressal of the grievances through appropriate committees
            </h3>
            <div className="space-y-3">
              {[
                "All of the above",
                "Any 3 of the above",
                "Any 2 of the above",
                "Any 1 of the above",
                "None of the above"
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
              
              <li>Upload the grievance redressal policy document with reference to prevention of sexual harassment committee and anti ragging committee, constitution of various committees for addressing the issues, minutes of the meetings of the committees, number of cases received and redressed. </li>
              <li>Minutes of the meetings of student redressal committee, prevention of sexual harassment committee and Anti Ragging committee </li>
              <li>Upload any additional information </li>
<li>Details of student grievances including sexual harassment and ragging cases </li>

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

export default Criteria5_1_5;