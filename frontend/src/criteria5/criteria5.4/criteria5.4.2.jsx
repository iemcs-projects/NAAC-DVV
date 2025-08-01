import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
const Criteria5_4_2 = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [department, setDepartment] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [files, setFiles] = useState([]);

  const handleRadioChange = (value) => {
    setSelectedOption(value);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  const navigate = useNavigate();
  const goToNextPage = () => {
    navigate("/criteria5.4.2");
  };
  const goToPreviousPage = () => {
    navigate("/criteria5.4.1");
  };
  return (
    <div className="min-h-screen w-[1520px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col p-4">
          {/* Page Title */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Criteria 5: Student Support and Progression
            </h2>
            <div className="text-sm text-gray-600">
              5.4 Alumni Engagement <i className="fas fa-chevron-down ml-2"></i>
            </div>
          </div>

          {/* Metric Description */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-blue-600 font-medium mb-2">5.4.2 Metric Information</h3>
            <p className="text-sm text-gray-700">
              Alumni contribution during the last five years (INR in Lakhs): <br />
              1. ≥ 5 Lakhs <br />
              2. 4 Lakhs - 5 Lakhs <br />
              3. 3 Lakhs - 4 Lakhs <br />
              4. 1 Lakhs - 3 Lakhs <br />
              5. &lt; 1 Lakhs
            </p>

             <div className="bg-white mb-6">
            <h3 className="text-blue-600 font-medium mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
               <li>Year-wise data: Alumni association / Name of alumnus</li>
                <li>Year-wise data: Quantum of contribution</li>
                <li>Audited statement of accounts reflecting receipts</li>
                <li>Upload any additional information</li>
            </ul>
          </div>
          </div>

    
         

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
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
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                placeholder="Enter faculty ID"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Faculty Name</label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="Enter faculty name"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Radio Buttons */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-blue-600 font-medium mb-4">Select Contribution Bracket</h3>
            <div className="space-y-3">
              {[
                "≥ 5 Lakhs",
                "4 Lakhs - 5 Lakhs",
                "3 Lakhs - 4 Lakhs",
                "1 Lakhs - 3 Lakhs",
                "< 1 Lakhs"
              ].map((label, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option${index}`}
                    name="alumniContribution"
                    className="h-4 w-4 text-blue-600 mr-3"
                    checked={selectedOption === label}
                    onChange={() => handleRadioChange(label)}
                  />
                  <label htmlFor={`option${index}`} className="text-sm text-gray-800">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-4 text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Year-wise data: Alumni association / Name of alumnus</li>
                <li>Year-wise data: Quantum of contribution</li>
                <li>Audited statement of accounts reflecting receipts</li>
                <li>Upload any additional information</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center gap-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
                <i className="fas fa-upload mr-2"></i> Choose Files
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              <span className="text-sm text-gray-600">
                {files.length > 0 ? `${files.length} file(s) selected` : "No file chosen"}
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
           <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria5_4_2;
