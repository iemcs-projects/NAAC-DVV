import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria7_1_2 = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024-25");

  const navigate = useNavigate();

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };

  const goToNextPage = () => {
    navigate("/criteria7.1.3");
  };

  const goToPreviousPage = () => {
    navigate("/criteria7.1.1");
  };

  const years = ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];

  return (
    <div className="min-h-screen w-[1690px] bg-gray-50 flex flex-col">
      <Header />
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Page Title */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">
              Criteria 7: Institutional Values and Best Practices
            </h2>
            <div className="text-sm text-gray-600">
              7.1 - Institutional Values and Social Responsibilities
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="mb-6">
            <label className="font-medium text-gray-700 mr-2">Select Academic Year:</label>
            <select
              className="border px-3 py-1 rounded text-black"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Info */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">7.1.2 Metric Information</h3>
            <p className="text-sm text-gray-700">
              The Institution has facilities for alternate sources of energy and energy conservation measures...<br />
              1. Solar energy<br />
              2. Biogas plant<br />
              3. Wheeling to the Grid<br />
              4. Sensor-based energy conservation<br />
              5. Use of LED bulbs/ power efficient equipment
            </p>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-1">Department</label>
              <select className="w-full px-4 py-2 border rounded text-gray-950">
                <option value="">Select department</option>
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Faculty ID</label>
              <input className="w-full px-4 py-2 border rounded text-gray-950" placeholder="Enter faculty ID" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Faculty Name</label>
              <input className="w-full px-4 py-2 border rounded text-gray-950" placeholder="Enter faculty name" />
            </div>
          </div>

          {/* Radio Buttons */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-blue-600 font-semibold mb-2">Select the Options</h3>
            {[
              "All of the above",
              "Any 3 of the above",
              "Any 2 of the above",
              "Any 1 of the above",
              "None of the above",
            ].map((label, index) => {
              const optionKey = `option${index + 1}`;
              return (
                <div key={optionKey} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={optionKey}
                    name="participation"
                    className="mr-2"
                    checked={selectedOption === optionKey}
                    onChange={() => handleRadioChange(optionKey)}
                  />
                  <label htmlFor={optionKey} className="text-sm text-gray-800">
                    {label}
                  </label>
                </div>
              );
            })}
          </div>

          {/* File Upload Section */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <ul className="list-disc text-sm text-gray-700 mb-4 pl-5">
              <li>Upload: Geotagged Photographs</li>
              <li>Upload: Any other relevant information</li>
            </ul>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
                <i className="fas fa-upload mr-2"></i>Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Info (Link)</label>
            <input
              type="text"
              placeholder="Enter URL here"
              className="w-full px-4 py-2 border rounded text-gray-900"
            />
          </div>

          {/* Bottom Buttons */}
          <div className="mt-6">
            <Bottom onNext={goToNextPage} onPrevious={goToPreviousPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria7_1_2;
