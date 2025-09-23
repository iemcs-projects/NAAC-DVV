import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../../components/UserDropdown";
import { useAuth } from "../../auth/authProvider";

const Criteria2_7_1 = () => {
  const { user } = useAuth();
  const years = [2020, 2021, 2022, 2023, 2024];
  const [currentYear, setCurrentYear] = useState(2020);
  const [yearData, setYearData] = useState({});
  const [formData, setFormData] = useState({
    studentName: "",
    gender: "",
    category: "",
    state: "",
    nationality: "",
    email: "",
    programName: "",
    enrolmentId: "",
    mobile: "",
    joiningYear: "",
  });

  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const goToNextPage = () => {
    navigate("/criteria7.1.1");
  };
   const goToPreviousPage = () => {
    navigate("/criteria2.6.3");
  };


  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    const requiredFields = Object.values(formData).every((val) => val !== "");
    if (requiredFields) {
      const updatedYearData = {
        ...yearData,
        [currentYear]: [...(yearData[currentYear] || []), formData],
      };
      setYearData(updatedYearData);
      setFormData({
        studentName: "",
        gender: "",
        category: "",
        state: "",
        nationality: "",
        email: "",
        programName: "",
        enrolmentId: "",
        mobile: "",
        joiningYear: "",
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
    <div className="flex flex-1 overflow-hidden pt-8">
      <div className={`fixed top-8 left-0 bottom-0 z-40 ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white shadow-md`}>
        <Sidebar onCollapse={setIsSidebarCollapsed} />
      </div>
      <div className={`flex-1 transition-all duration-300 overflow-y-auto ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pl-6 pr-6 `}>
        {/* Page Header with Title and User Dropdown */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center h-[70px] w-[700px] shadow border border-black/10 rounded-2xl hover:shadow-lg transition-shadow duration-300">
            <a href="#" className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200 px-4">
              <i className="fas fa-arrow-left"></i>
            </a>
            <div>
              <p className="text-2xl font-bold text-gray-800">Criteria 2 - Teaching, Learning and Evaluation</p>
              <p className="text-gray-600 text-sm">2.7 Student Performance and Learning Outcome</p>
            </div>
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} className="ml-2 mr-4 " />
          </div>
        </div>

          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-blue-600 font-medium mb-2">2.7.1 Metric Information</h3>
              <p className="text-sm text-gray-700">
                Online student satisfaction survey regarding teaching-learning process (all currently enrolled students)
              </p>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-300 rounded p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Data Requirement: (As per Data Template)</h4>
              <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                <li>Name / Class / Gender</li>
                <li>Student ID Number / Aadhar ID Number</li>
                <li>Mobile Number</li>
                <li>Email ID</li>
                <li>Degree Programme</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">
                (Database of all currently enrolled students needs to be prepared and shared with NAAC along with the online submission of QIF)
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="font-medium text-gray-700 mr-2">Select Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="border rounded mb-8 overflow-x-auto">
            <h2 className="text-xl font-bold bg-blue-100 text-gray-800 px-4 py-2">
              Student Satisfaction Survey - {currentYear}
            </h2>
            <table className="w-full border text-sm border-black">
              <thead className="bg-gray-100 text-black">
                <tr>
                  <th className="border px-2 py-2">Name of the student</th>
                  <th className="border px-2 py-2">Gender</th>
                  <th className="border px-2 py-2">Category</th>
                  <th className="border px-2 py-2">State of Domicile</th>
                  <th className="border px-2 py-2">Nationality</th>
                  <th className="border px-2 py-2">Email ID</th>
                  <th className="border px-2 py-2">Program name</th>
                  <th className="border px-2 py-2">Enrolment ID</th>
                  <th className="border px-2 py-2">Mobile Number</th>
                  <th className="border px-2 py-2">Year of joining</th>
                  <th className="border px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[
                    "studentName", "gender", "category", "state", "nationality",
                    "email", "programName", "enrolmentId", "mobile", "joiningYear"
                  ].map((field, index) => (
                    <td key={index} className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 text-black placeholder:text-gray-500"
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={field === "joiningYear" ? "YYYY" : field}
                      />
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={handleSubmit}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {years.map((year) => (
            <div key={year} className="mb-8 border rounded overflow-x-auto">
              <h3 className="text-lg font-semibold bg-gray-100 text-gray-800 px-4 py-2">
                Year: {year}
              </h3>
              {yearData[year] && yearData[year].length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-2 py-2">#</th>
                      <th className="border px-2 py-2">Name</th>
                      <th className="border px-2 py-2">Gender</th>
                      <th className="border px-2 py-2">Category</th>
                      <th className="border px-2 py-2">State</th>
                      <th className="border px-2 py-2">Nationality</th>
                      <th className="border px-2 py-2">Email</th>
                      <th className="border px-2 py-2">Program</th>
                      <th className="border px-2 py-2">Enrolment ID</th>
                      <th className="border px-2 py-2">Mobile</th>
                      <th className="border px-2 py-2">Joining Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData[year].map((entry, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        <td className="border px-2 py-1">{idx + 1}</td>
                        {Object.values(entry).map((val, i) => (
                          <td key={i} className="border px-2 py-1">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 px-4 py-2">No data submitted for this year.</p>
              )}
            </div>
          ))}

          {/* File Uploads */}
          <div className="mt-6 bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">File Description (Upload)</h3>
            <div className="space-y-4 text-black">
              <div>
                <label className="block font-medium mb-1">
                  Upload any additional information
                </label>
                <input type="file" className="w-full border px-3 py-1 rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Upload database of all currently enrolled students (Data Template)
                </label>
                <input type="file" className="w-full border px-3 py-1 rounded" />
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
         <div className="mt-auto bg-white border-t border-gray-200 shadow-inner py-4 px-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria2_7_1;

