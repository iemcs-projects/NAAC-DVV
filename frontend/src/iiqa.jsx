import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { navItems } from './config/navigation';
import {
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaChartLine,
  FaPaperPlane,
  FaDownload,
  FaQuestionCircle,
  FaCog,
  FaSignOutAlt,
  FaBell
} from 'react-icons/fa';
import { useAuth } from './auth/authProvider';
import axios from 'axios';
import Sidebar from './components/iqac-sidebar';
import UserDropdown from './components/UserDropdown';


export default function IIQA() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  // const navItems = [
  //   { icon: FaTachometerAlt, text: 'Dashboard', path: '/iqac-dashboard' },
  //   { icon: FaUsers, text: 'User Management', path: '/user-management' },
  //   { icon: FaFileAlt, text: 'Data Entry Forms', path: '/iiqa' },
  //   { icon: FaChartLine, text: 'GPA Analysis', path: '/gpa-analysis' },
  //   { icon: FaPaperPlane, text: 'IIQA form', path: '/iiqa' },
  //   { icon: FaDownload, text: 'Extended Profile', path: '/extendedprofile' },
  //   { icon: FaQuestionCircle, text: 'Help and Support', path: '/helpsupport' },
  //   { icon: FaCog, text: 'Configuration', path: '/configuration' },
  //   { icon: FaSignOutAlt, text: 'Logout', path: '/logout' }
  // ];

  // Programs
  const [programs, setPrograms] = useState([
    { id: 1, department: '', program: '', university: '', sra: '', status: '', specialization: '' }
  ]);

  // Session & Year
  const [sessionStart, setSessionStart] = useState('');
  const [desiredGrade, setDesiredGrade] = useState('');
  const [hasMou, setHasMou] = useState(false);
  const [mouFileUrl, setMouFileUrl] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Program counts (editable)
  const [programCounts, setProgramCounts] = useState([
    { label: 'UG', value: 7 },
    { label: 'PG', value: 3 },
    { label: "Post Master's (DM,Ayurveda Vachaspathi,M.Ch)", value: 0 },
    { label: 'Pre Doctoral (M.Phil)', value: 0 },
    { label: 'Doctoral (Ph.D)', value: 1 },
    { label: 'Post Doctoral (D.Sc., D.Litt., LLD)', value: 0 },
    { label: 'PG Diploma recognised by statutory authority including university', value: 0 },
    { label: 'Diploma', value: 5 },
    { label: 'Certificate', value: 8 }
  ]);

  // Staff & Student counts
  const [staffCounts, setStaffCounts] = useState({
    perm_male: 0, perm_female: 0, perm_trans: 0,
    other_male: 0, other_female: 0, other_trans: 0,
    non_male: 0, non_female: 0, non_trans: 0
  });

  const handleStaffChange = (prefix, gender, value) => {
    setStaffCounts(prev => ({
      ...prev,
      [`${prefix}_${gender}`]: value === '' ? 0 : parseInt(value, 10) || 0
    }));
  };

  const [studentCounts, setStudentCounts] = useState({
    regular_male: 0,
    regular_female: 0,
    regular_trans: 0
  });

  const handleStudentChange = (gender, value) => {
    setStudentCounts(prev => ({
      ...prev,
      [`regular_${gender}`]: value === '' ? 0 : parseInt(value, 10) || 0
    }));
  };


  const addProgram = () => {
    setPrograms([...programs, {
      id: programs.length + 1,
      department: '',
      program: '',
      university: '',
      sra: '',
      status: '',
      specialization: ''
    }]);
  };

  const updateProgram = (id, field, value) => {
    setPrograms(programs.map(prog =>
      prog.id === id ? { ...prog, [field]: value } : prog
    ));
  };

  const handleSubmit = async () => {
    try {
      // Construct programmeCount object from your programCounts state
      const programmeCount = {
        ug: programCounts.find(item => item.label === 'UG')?.value || 0,
        pg: programCounts.find(item => item.label === 'PG')?.value || 0,
        post_masters: programCounts.find(item => item.label.includes("Post Master's"))?.value || 0,
        pre_doctoral: programCounts.find(item => item.label.includes('Pre Doctoral'))?.value || 0,
        doctoral: programCounts.find(item => item.label.includes('Doctoral'))?.value || 0,
        post_doctoral: programCounts.find(item => item.label.includes('Post Doctoral'))?.value || 0,
        pg_diploma: programCounts.find(item => item.label.toLowerCase().includes('pg diploma'))?.value || 0,
        diploma: programCounts.find(item => item.label === 'Diploma')?.value || 0,
        certificate: programCounts.find(item => item.label === 'Certificate')?.value || 0
      };

      // Construct departments array from programs state
      const departments = programs.map(prog => ({
        department: prog.department,
        program: prog.program,
        university: prog.university,
        sra: prog.sra,
        affiliation_status: prog.status,
        specialization: prog.specialization
      }));

      // Get staff and student details from component state
      const staffDetails = staffCounts;
      const studentDetails = studentCounts;

      // Front-end validation for required fields
      if (!sessionStart || !selectedYear || !desiredGrade) {
        alert('Please enter session start year, select year filled and desired grade.');
        return;
      }
      if (departments.length === 0 || departments.some(d => !d.department || !d.program || !d.university || !d.affiliation_status)) {
        alert('Please fill all mandatory department fields.');
        return;
      }

      if (hasMou && !mouFileUrl) {
        alert('Please upload MoU document or mark "No".');
        return;
      }

      // Construct final payload
      const payload = {
        institution_id: 1, // replace with your institution state if dynamic
        session_start_year: sessionStart,
        session_end_year: sessionStart ? String(parseInt(sessionStart) + 5) : '',
        year_filled: selectedYear,
        naac_cycle: 1, // replace with actual value if dynamic
        desired_grade: desiredGrade,
        has_mou: hasMou,
        mou_file_url: hasMou ? mouFileUrl : null,
        programmeCount,
        departments,
        staffDetails,
        studentDetails
      };

      console.log("Submitting IIQA form data:", payload);

      // API call
      const response = await axios.post('http://localhost:3000/api/v1/iiqa/createIIQAForm', payload);

      if (response.status === 200 || response.status === 201) {
        alert('Form submitted successfully!');
        navigate('/extendedprofile');
      } else {
        console.error('Unexpected response status:', response.status);
        alert('Form submission failed. Please try again.');
      }

    } catch (error) {
      console.error('Error submitting IIQA form:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      if (error.response) {
        alert(`Submission failed: ${error.response.data.message || 'Server Error'}`);
      } else if (error.request) {
        alert('No response from server. Please check your network connection.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleProgramCountChange = (index, newValue) => {
    const updatedCounts = [...programCounts];
    updatedCounts[index].value = newValue === '' ? '' : parseInt(newValue, 10) || 0;
    setProgramCounts(updatedCounts);
  };

  // Year dropdown
  const yearOptions = [];
  if (sessionStart && !isNaN(sessionStart)) {
    const start = parseInt(sessionStart);
    for (let i = 0; i < 5; i++) {
      yearOptions.push(start + i);
    }
  }

  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-screen bg-gray-100">
      <Sidebar
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        navItems={navItems}
        navigate={navigate}
      />
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center h-[50px] w-[350px] shadow border border-black/10 rounded-2xl">
              <a href="#" className="text-gray-500 hover:text-gray-700 mr-2">
                <i className="fas fa-arrow-left"></i>
              </a>
              <p className="text-2xl font-bold text-gray-800">IIQA Form</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* <div className="relative cursor-pointer group">
                <FaBell className="text-gray-600 text-xl transform transition-transform duration-200 group-hover:scale-110"/>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">1</span>
              </div> */}
              <UserDropdown user={user} className="ml-2" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">Academic Information</h2>
          </div>

          <div className="bg-white text-black p-6">
            {/* Session, Grade & Year */}
            <div className="mb-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Session */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Session (5 Years)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={sessionStart}
                      onChange={(e) => {
                        setSessionStart(e.target.value);
                        setSelectedYear('');
                      }}
                      placeholder="YYYY"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <span className="text-gray-700">to</span>
                    <input
                      type="text"
                      value={sessionStart ? parseInt(sessionStart) + 5 : ''}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>
                </div>

                {/* Desired Grade */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Desired NAAC Grade</label>
                  <select
                    value={desiredGrade}
                    onChange={(e) => setDesiredGrade(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Grade</option>
                    <option value="A++">A++</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B++">B++</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                {/* Year Dropdown */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Select Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map((year, idx) => (
                      <option key={idx} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Program Counts */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <span className="text-gray-700 font-medium">Number of Programmes offered</span>
                <span className="ml-2 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">?</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {programCounts.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">{item.label}</span>
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => handleProgramCountChange(index, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Program Details */}
            <div className="border border-gray-300 rounded mb-8">
              <div className="bg-gray-200 px-4 py-3 flex items-center">
                <span className="text-gray-700 font-medium">Program</span>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <button
                  onClick={addProgram}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 flex items-center"
                >
                  <span className="mr-2">+</span> Add Department
                </button>
              </div>
              <div className="bg-blue-200 grid grid-cols-6 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
                <div>Department</div>
                <div>Program</div>
                <div>University</div>
                <div>SRA</div>
                <div>Status</div>
                <div></div>
              </div>
              {programs.map((program) => (
                <div key={program.id}>
                  <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-gray-200">
                    <select
                      value={program.department}
                      onChange={(e) => updateProgram(program.id, 'department', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">--Department--</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medicine">Medicine</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Enter program"
                      value={program.program}
                      onChange={(e) => updateProgram(program.id, 'program', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <select
                      value={program.university}
                      onChange={(e) => updateProgram(program.id, 'university', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">--University--</option>
                      <option value="University A">University A</option>
                      <option value="University B">University B</option>
                    </select>
                    <select
                      value={program.sra}
                      onChange={(e) => updateProgram(program.id, 'sra', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">--SRA--</option>
                      <option value="SRA1">SRA1</option>
                      <option value="SRA2">SRA2</option>
                    </select>
                    <select
                      value={program.status}
                      onChange={(e) => updateProgram(program.id, 'status', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">--Status--</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Permanent">Permanent</option>
                    </select>
                  </div>
                  {/* Specialization */}
                  <div className="bg-red-500 px-4 py-2">
                    <span className="text-white font-medium">Specialization</span>
                  </div>
                  <div className="px-4 py-3 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Enter Specialization"
                      value={program.specialization}
                      onChange={(e) => updateProgram(program.id, 'specialization', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Staff Details */}
            <div className="border border-gray-300 rounded mb-8">
              <div className="bg-gray-200 px-4 py-3">
                <h3 className="text-gray-700 font-medium">Details of Staff</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div className="font-medium text-gray-700">Categories</div>
                  <div className="font-medium text-gray-700">Male</div>
                  <div className="font-medium text-gray-700">Female</div>
                  <div className="font-medium text-gray-700">Transgender</div>
                  <div className="font-medium text-gray-700">Total</div>
                </div>
                {[
                  { label: 'Number of Permanent Teaching staff', prefix: 'perm' },
                  { label: 'Number of Other Teaching staff', prefix: 'other' },
                  { label: 'Number of Non Teaching staff', prefix: 'non' }
                ].map(({ label, prefix }) => (
                  <div key={prefix} className="grid grid-cols-5 gap-4 mb-4 items-center">
                    <div className="text-gray-700">{label}</div>
                    <input type="number" value={staffCounts[`${prefix}_male`]} onChange={e => handleStaffChange(prefix, 'male', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                    <input type="number" value={staffCounts[`${prefix}_female`]} onChange={e => handleStaffChange(prefix, 'female', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                    <input type="number" value={staffCounts[`${prefix}_trans`]} onChange={e => handleStaffChange(prefix, 'trans', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                    <input type="number" readOnly value={(staffCounts[`${prefix}_male`] || 0) + (staffCounts[`${prefix}_female`] || 0) + (staffCounts[`${prefix}_trans`] || 0)} className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Students Details */}
            <div className="border border-gray-300 rounded mb-8">
              <div className="bg-gray-200 px-4 py-3">
                <h3 className="text-gray-700 font-medium">Details of Students</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div className="font-medium text-gray-700">Categories</div>
                  <div className="font-medium text-gray-700">Male</div>
                  <div className="font-medium text-gray-700">Female</div>
                  <div className="font-medium text-gray-700">Transgender</div>
                  <div className="font-medium text-gray-700">Total</div>
                </div>
                <div className="grid grid-cols-5 gap-4 mb-4 items-center">
                  <div className="text-gray-700">Number of Regular Face to Face Students</div>
                  <input type="number" value={studentCounts.regular_male} onChange={e => handleStudentChange('male', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                  <input type="number" value={studentCounts.regular_female} onChange={e => handleStudentChange('female', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                  <input type="number" value={studentCounts.regular_trans} onChange={e => handleStudentChange('trans', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                  <input type="number" readOnly value={(studentCounts.regular_male || 0) + (studentCounts.regular_female || 0) + (studentCounts.regular_trans || 0)} className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100" />
                </div>
              </div>
            </div>

            {/* MoU Section */}
            <div className="border border-gray-300 rounded mb-8 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-700">
                  Does the college have an academic MoU with any foreign institution? If so attach the MoU (Upload document)
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="mou" value="yes" checked={hasMou} onChange={()=>setHasMou(true)} className="mr-2" />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="mou" value="no" checked={!hasMou} onChange={()=>setHasMou(false)} className="mr-2" />
                    <span className="text-gray-700">No</span>
                  </label>
                  <input type="file" accept="application/pdf" onChange={e=>{
                        if(e.target.files[0]){
                          setMouFileUrl(URL.createObjectURL(e.target.files[0]));
                          setHasMou(true);
                        }
                      }} className="text-sm" />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Save and Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
