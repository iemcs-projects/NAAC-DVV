import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../../components/header";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../../contextprovider/sessioncontext";

const Criteria3_2_2 = () => {

  const pastFiveYears = Array.from(
    { length: 5 },
    (_, i) => `${2024 - i}-${(2024 - i + 1).toString().slice(-2)}`
  );
  const [selectedYear, setSelectedYear] = useState(pastFiveYears[0]);
  const [yearData, setYearData] = useState({});
  const { sessions, isLoading: sessionLoading, error: sessionError } = useContext(SessionContext);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",        // teacher_name
    title: "",       // book_chapter_title
    paper: "",       // paper_title
    conf: "",        // conference_title
    year: "",        // year_of_publication
    issn: "",        // isbn_issn_number
    yes: "",         // institution_affiliated
    pub: "",         // publisher_name
  });
  const [submittedData, setSubmittedData] = useState([]);

    const [provisionalScore, setProvisionalScore] = useState(null);
    const [yearScores, setYearScores] = useState(
      pastFiveYears.reduce((acc, y) => ({ ...acc, [y]: 0 }), {})
    );
    const [yearCount, setYearCount] = useState(5);
    const [averageScore, setAverageScore] = useState(null);


    useEffect(() => {
      console.log("Session Context:", {
        sessions,
        sessionLoading,
        sessionError,
        currentYear
      });
      
      if (!sessionLoading && sessions?.length > 0) {
        console.log("Available sessions from context:", sessions);
        setAvailableSessions(sessions);
        if (!currentYear) {
          console.log("Setting current year to first available session:", sessions[0]);
          setCurrentYear(sessions[0]);
        }
      }
    }, [sessions, sessionLoading, currentYear]);
  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    console.log('Fetching score...');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/v1/criteria3/score322");
      console.log('API Response:', response);
      
      // Check if response has data and the expected score property
      if (response.data && response.data.data && response.data.data.entry) {
        console.log('Score data:', response.data.data.entry);
        setProvisionalScore(response.data.data.entry);
      } else {
        console.log('No score data found in response');
        setProvisionalScore(null);
      }
    } catch (error) {
      console.error("Error fetching provisional score:", error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError(error.message || "Failed to fetch score");
      setProvisionalScore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleChange = (field, value, index = null) => {
    if (field === "supportLinks" && index !== null) {
      setFormData(prev => {
        const newLinks = [...prev.supportLinks];
        newLinks[index] = value;
        return { ...prev, supportLinks: newLinks };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    const teacher_name = formData.name.trim();
    const book_chapter_title = formData.title.trim();
    const paper_title = formData.paper.trim();
    const conference_title = formData.conf.trim();
    const year_of_publication = formData.year.trim();
    const publisher_name = formData.pub.trim();
    const isbn_issn_number = formData.issn.trim();
    const institution_affiliated = formData.yes.trim();
    const sessionFull = currentYear;
    const session = sessionFull.split("-")[0];
    const sno = submittedData.length + 1;
  
    // Validate required fields
    if (!teacher_name || !book_chapter_title || !paper_title || !conference_title || 
        !year_of_publication || !publisher_name || !isbn_issn_number || !institution_affiliated) {
      alert("Please fill in all required fields");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3000/api/v1/criteria3/createResponse322", {
        session: parseInt(session),
        teacher_name,
        book_chapter_title,
        paper_title,
        conference_title,
        year_of_publication,
        publisher_name,
        isbn_issn_number,
        institution_affiliated
      });
  
      const resp = response?.data?.data || {};
      const newEntry = {
        sno,  // Add the auto-generated sno
        year: resp.year || currentYear,
        teacher_name: resp.teacher_name || teacher_name,
        book_chapter_title: resp.book_chapter_title || book_chapter_title,
        paper_title: resp.paper_title || paper_title,
        conference_title: resp.conference_title || conference_title,
        year_of_publication: resp.year_of_publication || year_of_publication,
        publisher_name: resp.publisher_name || publisher_name,
        isbn_issn_number: resp.isbn_issn_number || isbn_issn_number,
        institution_affiliated: resp.institution_affiliated || institution_affiliated
      };
  
      setSubmittedData((prev) => [...prev, newEntry]);
      
      // Reset form
      setFormData({ 
        name: "",
        title: "",
        paper: "",
        conf: "",
        year: "",
        issn: "",
        yes: "",
        pub: ""
      });

      fetchScore();
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(error.response?.data?.message || error.message || "Failed to submit data");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          {/* Score Section */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            {loading ? (
              <p className="text-gray-600">Loading provisional score...</p>
            ) : provisionalScore?.data?.score_sub_sub_criteria !== undefined || provisionalScore?.score_sub_sub_criteria !== undefined ? (
              <p className="text-lg font-semibold text-green-800">
                Provisional Score (3.2.2): {typeof (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria) === 'number'
                  ? (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria).toFixed(2)
                  : (provisionalScore.data?.score_sub_sub_criteria ?? provisionalScore.score_sub_sub_criteria)} %
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Last updated: {new Date(provisionalScore.timestamp || Date.now()).toLocaleString()})
                </span>
              </p>
            ) : (
              <p className="text-gray-600">No score data available. Submit data to see your score.</p>
            )}
          </div>

          {/* Metric Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-blue-600 font-medium mb-2">3.2.2 Metric Information</h3>
            <p className="text-sm text-gray-700">
              3.2.2.1. Total number of books and chapters in edited volumes/books published and papers
              in national/international conference proceedings year-wise during last five years
            </p>
            <h3 className="text-blue-600 font-medium mt-4 mb-2">Requirements</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>Any additional information</li>
              <li>List of books/chapters in edited volumes/books published (Data Template)</li>
            </ul>
          </div>

          {/* Input Section */}
          <h2 className="text-xl font-bold text-gray-500 mb-4">
            Books, Chapters and Papers Published
          </h2>
          <div className="flex justify-end mb-4">
            <label className="mr-2 font-medium text-gray-700">Select Year:</label>
            <select
  value={currentYear}
  onChange={(e) => {
    console.log("Selected session changed to:", e.target.value);
    setCurrentYear(e.target.value);
  }}
  className="mt-1 block w-1/4 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
>
  {availableSessions.map((session) => (
    <option key={session} value={session}>
      {session}
    </option>
  ))}
</select>
          </div>

          <div className="overflow-auto border rounded mb-6">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100 text-black">
                <tr>
                  {["Sl. No.", "Name", "Book/Chapter Title", "Paper Title", "Conference", "Year", "ISSN", "Affiliated Institution", "Publisher"].map((heading) => (
                    <th key={heading} className="px-4 py-2 border">{heading}</th>
                  ))}
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border">
                    <div className="w-full px-2 py-1 text-center text-gray-600 bg-gray-100 rounded">
                      {submittedData.length + 1}
                    </div>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.paper}
                      onChange={(e) => handleChange("paper", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.conf}
                      onChange={(e) => handleChange("conf", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.issn}
                      onChange={(e) => handleChange("issn", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    />
                  </td>
                  <td className="px-2 py-2 border">
                    <select
                      value={formData.yes}
                      onChange={(e) => handleChange("yes", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    >
                      <option value="">Select...</option>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <input
                      type="text"
                      value={formData.pub}
                      onChange={(e) => handleChange("pub", e.target.value)}
                      className="w-full px-2 py-1 border rounded border-black"
                    />
                  </td>
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

          {/* Submitted Data */}
          <div className="overflow-auto border rounded mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-950">Submitted Entries</h3>
            {submittedData.length > 0 ? (
              <table className="min-w-full text-sm border border-black">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 border">#</th>
                    {["Teacher", "Book/Chapter Title", "Paper Title", "Conference", "Year", "ISSN", "Affiliated Institution", "Publisher"].map((heading) => (
                      <th key={heading} className="px-4 py-2 border">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map((entry, i) => (
                    <tr key={i} className="even:bg-gray-50">
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

          {/* File Upload & Additional Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <ul className="list-disc pl-5 text-sm text-gray-700">
                <li>Upload Additional Information</li>
                <li>Link for Additional Information</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
            <div className="flex items-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer">
                Choose Files
                <input type="file" className="hidden" multiple />
              </label>
              <span className="ml-3 text-gray-600">No file chosen</span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Paste Link for Additional Information</label>
            <input
              type="text"
              placeholder="Enter URL here"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <Bottom />
        </div>
      </div>
    </div>
  );
};

export default Criteria3_2_2;