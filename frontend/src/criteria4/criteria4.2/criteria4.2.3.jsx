import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";

const Criteria4_2_3 = () => {
  const currentYear = new Date().getFullYear();
  const pastFiveYears = Array.from({ length: 5 }, (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`);
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
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

  const libraryResources = [
    "Books",
    "Journals",
    "e-journals",
    "e-books",
    "e-ShodhSindhu",
    "Shodhganga",
    "Databases",
  ];

  // Single row data for library resources
  const [resourceData, setResourceData] = useState({
    resource: "",
    membershipDetails: "",
    expenditure: "",
    totalExpenditure: "",
    link: "",
  });

  const [submittedResources, setSubmittedResources] = useState([]);

  const handleResourceChange = (field, value) => {
    setResourceData({ ...resourceData, [field]: value });
  };

  const handleResourceSubmit = () => {
    if (
      resourceData.resource &&
      resourceData.membershipDetails &&
      resourceData.expenditure &&
      resourceData.totalExpenditure &&
      resourceData.link
    ) {
      setSubmittedResources([...submittedResources, resourceData]);
      setResourceData({
        resource: "",
        membershipDetails: "",
        expenditure: "",
        totalExpenditure: "",
        link: "",
      });
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const removeResource = (index) => {
    const updated = submittedResources.filter((_, i) => i !== index);
    setSubmittedResources(updated);
  };

  const [formData, setFormData] = useState({
    roomno: "",
    type: "",
    link: "",
  });
  const [submittedData, setSubmittedData] = useState([]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (
      formData.roomno &&
      formData.type &&
      formData.link 
    ) {
      setSubmittedData([...submittedData, formData]);
      setFormData({
        roomno: "",
        type: "",
        link: "",
      });
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const navigate = useNavigate()
  const goToNextPage = () => {
    navigate("/criteria4.2.4");
  };

  const goToPreviousPage = () => {
    navigate("/criteria4.2.2");
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
              <span className="text-gray-600">4.2  IT Infrastructure</span>
              <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="text-center">
                
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">4.2.3 Metric Information</h3>
              <p className="text-sm text-gray-700">
               Average annual expenditure for purchase of books/e-books and
subscription to journals/e- journals during the last five years (INR in
Lakhs) 
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-blue-600 font-medium mb-2">Data Requirements:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li className="mb-1">Expenditure on the purchase of books/e-books<br/>
Expenditure on the purchase of journals/e-journals in ith year<br/>
Year of Expenditure:  </li>
               </ul>
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
                    <th className="border border-[gray] px-4 py-2">2020</th>
                    <th className="border border-[gray] px-4 py-2">2021</th>
                    <th className="border border-[gray] px-4 py-2">2022</th>
                    <th className="border border-[gray] px-4 py-2">2023</th>
                    <th className="border border-[gray] px-4 py-2">2024</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-4 py-2 font-medium text-gray-600">
                      Calculated Score
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

          <div className="p-6 bg-white shadow rounded-md max-w-full overflow-x-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add Library Resource
            </h2>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Library Resource
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={resourceData.resource}
                  onChange={(e) => handleResourceChange("resource", e.target.value)}
                >
                  <option value="">Select Resource</option>
                  {libraryResources.map((resource, index) => (
                    <option key={index} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membership/Subscription Details
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={resourceData.membershipDetails}
                  onChange={(e) => handleResourceChange("membershipDetails", e.target.value)}
                  placeholder="Enter details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expenditure (in Lakhs)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={resourceData.expenditure}
                  onChange={(e) => handleResourceChange("expenditure", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Expenditure
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={resourceData.totalExpenditure}
                  onChange={(e) => handleResourceChange("totalExpenditure", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link to Document
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={resourceData.link}
                  onChange={(e) => handleResourceChange("link", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button
                onClick={handleResourceSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Resource
              </button>
            </div>

            {/* Display Submitted Resources */}
            {submittedResources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Added Library Resources
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm text-left">
                    <thead className="bg-gray-100 font-semibold text-gray-950">
                      <tr>
                        <th className="border text-gray-950 px-3 py-2">Library Resources</th>
                        <th className="border text-gray-950 px-3 py-2">Membership/Subscription Details</th>
                        <th className="border text-gray-950 px-3 py-2">Expenditure (in Lakhs)</th>
                        <th className="border text-gray-950 px-3 py-2">Total Expenditure</th>
                        <th className="border text-gray-950 px-3 py-2">Link to Document</th>
                        <th className="border text-gray-950 px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedResources.map((resource, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border text-gray-950 px-3 py-2">{resource.resource}</td>
                          <td className="border text-gray-950 px-3 py-2">{resource.membershipDetails}</td>
                          <td className="border text-gray-950 px-3 py-2">{resource.expenditure}</td>
                          <td className="border text-gray-950 px-3 py-2">{resource.totalExpenditure}</td>
                          <td className="border text-gray-950 px-3 py-2">
                            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View Document
                            </a>
                          </td>
                          <td className="border text-gray-950 px-3 py-2">
                            <button
                              onClick={() => removeResource(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Upload any additional information</li>
                <li>Details of subscriptions like e-journals, e-ShodhSindhu, Shodhganga Membership etc (Data Template)</li>
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

export default Criteria4_2_3;