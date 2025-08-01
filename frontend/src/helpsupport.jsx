import React, { useState } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaBell,
  FaSearch,
  FaUsers,
  FaEdit,
  FaSignInAlt,
  FaTachometerAlt,
  FaFileAlt,
  FaChartLine,
  FaPaperPlane,
  FaSignOutAlt,
  FaDownload,
  FaCog,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaCheck,
  FaCheckCircle,
  FaTimes,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaFileUpload,
  FaFilePdf,
  FaFileExcel,
  FaFileWord,
  FaCloudUploadAlt,
  FaEnvelope,
  FaPhone,
  FaChevronRight
} from 'react-icons/fa';

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeCriteria, setActiveCriteria] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    message: '',
    file: null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        category: '',
        subject: '',
        message: '',
        file: null
      });
    }, 3000);
  };

  const tabs = [
    { id: 0, name: 'Getting Started', icon: FaSignInAlt },
    { id: 1, name: 'Video Tutorials', icon: FaPlay },
    { id: 2, name: 'Contact Support', icon: FaPaperPlane }
  ];

  const criteriaData = [
    {
      id: 1,
      title: 'Criteria 1: Curricular Aspects',
      color: 'bg-blue-50 border-blue-200',
      requiredData: [
        'Academic flexibility metrics',
        'Curriculum enrichment details',
        'Feedback system documentation'
      ],
      documents: [
        'Syllabus revision records',
        'Value-added course certificates',
        'Stakeholder feedback analysis'
      ],
      mistakes: [
        'Incomplete feedback analysis',
        'Missing certificate attachments',
        'Incorrect data period selection'
      ],
      templates: [
        { name: 'Curriculum Enrichment Template', format: 'XLSX' },
        { name: 'Feedback Analysis Format', format: 'DOCX' }
      ]
    },
    {
      id: 2,
      title: 'Criteria 2: Teaching-Learning and Evaluation',
      color: 'bg-emerald-50 border-emerald-200',
      requiredData: [
        'Student enrollment statistics',
        'Teaching-learning process details',
        'Student performance metrics'
      ],
      documents: [
        'Student satisfaction survey results',
        'Learning outcome attainment records',
        'Faculty profile documentation'
      ],
      mistakes: [
        'Inconsistent enrollment data',
        'Incomplete faculty profiles',
        'Missing learning outcome assessments'
      ],
      templates: [
        { name: 'Student Satisfaction Survey Template', format: 'XLSX' },
        { name: 'Learning Outcome Assessment Format', format: 'DOCX' }
      ]
    },
    {
      id: 3,
      title: 'Criteria 3: Research, Innovations and Extension',
      color: 'bg-purple-50 border-purple-200',
      requiredData: [
        'Research publication metrics',
        'Innovation ecosystem details',
        'Extension activities documentation'
      ],
      documents: [
        'Research paper citations',
        'Patent documentation',
        'Extension activity reports'
      ],
      mistakes: [
        'Duplicate research entries',
        'Incomplete citation information',
        'Missing extension activity evidence'
      ],
      templates: [
        { name: 'Research Publication Template', format: 'XLSX' },
        { name: 'Extension Activity Report Format', format: 'DOCX' }
      ]
    },
    {
      id: 4,
      title: 'Criteria 4: Infrastructure and Learning Resources',
      color: 'bg-orange-50 border-orange-200',
      requiredData: [
        'Physical facility metrics',
        'Library resource details',
        'IT infrastructure documentation'
      ],
      documents: [
        'Infrastructure photographs',
        'Library acquisition records',
        'IT facility usage statistics'
      ],
      mistakes: [
        'Outdated infrastructure data',
        'Incomplete library records',
        'Missing IT facility documentation'
      ],
      templates: [
        { name: 'Infrastructure Documentation Template', format: 'XLSX' },
        { name: 'Library Resources Format', format: 'DOCX' }
      ]
    },
    {
      id: 5,
      title: 'Criteria 5: Student Support and Progression',
      color: 'bg-cyan-50 border-cyan-200',
      requiredData: [
        'Student support metrics',
        'Student progression details',
        'Student participation documentation'
      ],
      documents: [
        'Scholarship disbursement records',
        'Placement statistics',
        'Student achievement evidence'
      ],
      mistakes: [
        'Incomplete scholarship data',
        'Missing progression evidence',
        'Inconsistent achievement records'
      ],
      templates: [
        { name: 'Student Progression Template', format: 'XLSX' },
        { name: 'Scholarship Documentation Format', format: 'DOCX' }
      ]
    },
    {
      id: 6,
      title: 'Criteria 6: Governance, Leadership and Management',
      color: 'bg-indigo-50 border-indigo-200',
      requiredData: [
        'Institutional vision metrics',
        'Strategy development details',
        'Faculty empowerment documentation'
      ],
      documents: [
        'E-governance implementation records',
        'Faculty development program reports',
        'Institutional quality assurance initiatives'
      ],
      mistakes: [
        'Incomplete governance documentation',
        'Missing faculty development evidence',
        'Inconsistent quality assurance data'
      ],
      templates: [
        { name: 'Governance Documentation Template', format: 'XLSX' },
        { name: 'Faculty Development Report Format', format: 'DOCX' }
      ]
    },
    {
      id: 7,
      title: 'Criteria 7: Institutional Values and Best Practices',
      color: 'bg-pink-50 border-pink-200',
      requiredData: [
        'Gender equity promotion metrics',
        'Environmental consciousness details',
        'Best practices documentation'
      ],
      documents: [
        'Gender sensitization program reports',
        'Green campus initiative evidence',
        'Best practice implementation records'
      ],
      mistakes: [
        'Incomplete best practice documentation',
        'Missing environmental initiative evidence',
        'Inconsistent gender equity data'
      ],
      templates: [
        { name: 'Best Practices Documentation Template', format: 'XLSX' },
        { name: 'Environmental Initiative Report Format', format: 'DOCX' }
      ]
    }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I reset my password if I forget it?',
      answer: 'Click on the "Forgot Password" link on the login page. Enter your registered email address, and you will receive a password reset link. Follow the instructions in the email to create a new password.',
      category: 'Authentication'
    },
    {
      id: 2,
      question: 'What file formats are accepted for document uploads?',
      answer: 'The system accepts PDF, DOCX, XLSX, JPG, and PNG formats. For best results, we recommend using PDF for text documents, XLSX for data spreadsheets, and JPG/PNG for images. Maximum file size is 10MB per upload.',
      category: 'File Upload'
    },
    {
      id: 3,
      question: 'How can I track my criteria submission progress?',
      answer: 'Your dashboard displays a progress tracker for each criteria. Completed sections are marked in green, partially completed in yellow, and pending sections in gray. Click on any criteria to see detailed completion status.',
      category: 'Progress Tracking'
    },
    {
      id: 4,
      question: 'What should I do if I encounter an error during data submission?',
      answer: 'First, take a screenshot of the error message. Then, check your data for any formatting issues or required fields that might be missing. If the problem persists, contact support through the "Contact Support" section with the error details.',
      category: 'Troubleshooting'
    },
    {
      id: 5,
      question: 'Can I save my progress and continue later?',
      answer: 'Yes, the system automatically saves your progress as you work. You can click the "Save Draft" button at any time to manually save your current progress. When you log back in, you can continue from where you left off.',
      category: 'Data Management'
    },
    {
      id: 6,
      question: 'How do I know if my submission is complete?',
      answer: 'After completing all required fields and uploading necessary documents, click the "Review Submission" button. The system will check for any missing information. If everything is complete, you\'ll see a confirmation message and can proceed to final submission.',
      category: 'Submission'
    },
    {
      id: 7,
      question: 'Can I edit my submission after it\'s been submitted?',
      answer: 'Once a criteria is fully submitted, you cannot edit it directly. If you need to make changes, you must contact your institution\'s NAAC coordinator who can request an unlock for that specific criteria section.',
      category: 'Submission'
    },
    {
      id: 8,
      question: 'What happens if I miss the submission deadline?',
      answer: 'The system automatically closes access to data entry after the deadline. If you have extenuating circumstances, your institution\'s NAAC coordinator can request a deadline extension through the administrative portal.',
      category: 'Deadlines'
    }
  ];

  const videoTutorials = [
    {
      id: 1,
      title: 'Getting Started with NAAC DVV System',
      duration: '5:23',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop&crop=center',
      description: 'Learn the basics of navigating the NAAC DVV system and understanding the dashboard.',
      difficulty: 'Beginner'
    },
    {
      id: 2,
      title: 'How to Upload Documents Correctly',
      duration: '4:17',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop&crop=center',
      description: 'Step-by-step guide on uploading various document types and ensuring they meet requirements.',
      difficulty: 'Beginner'
    },
    {
      id: 3,
      title: 'Completing Criteria 1 Submission',
      duration: '8:45',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop&crop=center',
      description: 'Detailed walkthrough of all requirements for Criteria 1 submission.',
      difficulty: 'Intermediate'
    },
    {
      id: 4,
      title: 'Understanding Data Validation Process',
      duration: '6:32',
      thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=225&fit=crop&crop=center',
      description: 'Learn how the DVV validation process works and how to respond to queries.',
      difficulty: 'Advanced'
    },
    {
      id: 5,
      title: 'Troubleshooting Common Issues',
      duration: '7:19',
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=225&fit=crop&crop=center',
      description: 'Solutions for the most common problems faced during data submission.',
      difficulty: 'Intermediate'
    },
    {
      id: 6,
      title: 'Best Practices for Document Organization',
      duration: '5:51',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop&crop=center',
      description: 'Tips and tricks for organizing your documents before uploading to the system.',
      difficulty: 'Beginner'
    }
  ];

  const getStartedSteps = [
    {
      icon: FaSignInAlt,
      title: 'Login & Authentication',
      description: 'Access the system using your institutional email and password. First-time users should complete profile setup.',
      color: 'bg-blue-500'
    },
    {
      icon: FaTachometerAlt,
      title: 'Navigate Dashboard',
      description: 'Familiarize yourself with the dashboard layout, criteria sections, and progress indicators.',
      color: 'bg-emerald-500'
    },
    {
      icon: FaEdit,
      title: 'Begin Data Entry',
      description: 'Select a criteria to start working on. Follow the guided process to enter data and upload documents.',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                  <FaQuestionCircle className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Help & Support Center
                  </h1>
                  <p className="mt-2 text-lg text-gray-600">
                    Welcome to the NAAC DVV System support portal. Find guidance, tutorials, and assistance for faculty members.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  className="w-full lg:w-80 pl-12 pr-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="mt-6">
            <nav className="flex items-center space-x-2 text-sm">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Home</a>
              <FaChevronRight className="text-gray-400 text-xs" />
              <span className="text-blue-600 font-medium">Help & Support</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto py-4 space-x-2">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center whitespace-nowrap px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Getting Started */}
        {activeTab === 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Getting Started Guide</h2>
              <p className="text-gray-600 mb-8">Follow these simple steps to begin your NAAC accreditation journey</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {getStartedSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={index} className="relative">
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center mb-4">
                          <div className={`${step.color} text-white rounded-xl w-12 h-12 flex items-center justify-center mr-4 shadow-lg`}>
                            <IconComponent className="text-xl" />
                          </div>
                          <div className="bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center group">
                          Learn More 
                          <FaChevronRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Requirements */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-blue-900 mb-6">System Requirements & Best Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  'Use modern browsers like Chrome, Firefox, or Edge for optimal experience',
                  'Enable JavaScript and cookies for all system features',
                  'Minimum screen resolution of 1280×720 recommended',
                  'Stable internet connection for document uploads'
                ].map((requirement, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaCheckCircle className="text-green-500 text-lg" />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 font-medium">{requirement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Tutorials */}
        {activeTab === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Video Tutorials</h2>
            <p className="text-gray-600 mb-8">
              Watch step-by-step video guides to master the NAAC DVV system and complete your submissions efficiently.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoTutorials.map((video) => (
                <div key={video.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white bg-opacity-90 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                        <FaPlay className="text-blue-600 text-xl ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        video.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        video.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {video.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg transition-colors font-medium">
                View All Tutorials
              </button>
            </div>
          </div>
        )}

        {/* Contact Support */}
        {activeTab === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Support</h2>
            <p className="text-gray-600 mb-8">
              Need personalized assistance? Our support team is here to help you with any questions or issues.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {isSubmitted ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <FaCheck className="text-green-600 text-2xl" />
                    </div>
                    <h3 className="text-2xl font-semibold text-green-800 mb-3">Query Submitted Successfully!</h3>
                    <p className="text-green-700 text-lg">
                      Thank you for reaching out. Our support team will respond to your query within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                          Issue Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select a category</option>
                          <option value="login">Login & Authentication</option>
                          <option value="upload">Document Upload Issues</option>
                          <option value="data">Data Entry Problems</option>
                          <option value="criteria">Criteria Specific Questions</option>
                          <option value="technical">Technical Difficulties</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleFormChange}
                          placeholder="Brief description of your issue"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleFormChange}
                        rows={6}
                        placeholder="Please provide detailed information about your issue or question..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        required
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Attachments (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <FaCloudUploadAlt className="text-gray-400 text-4xl mb-4 mx-auto" />
                        <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                        <p className="text-sm text-gray-500 mb-4">Maximum file size: 10MB (PDF, DOCX, JPG, PNG)</p>
                        <input type="file" className="hidden" />
                        <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                          Browse Files
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg flex items-center justify-center"
                      >
                        <FaPaperPlane className="mr-2" />
                        Submit Query
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Support Hours */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <FaCog className="text-blue-600" />
                      </div>
                      Support Hours
                    </h3>
                    <div className="space-y-3">
                      {[
                        { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
                        { day: 'Saturday', hours: '10:00 AM - 2:00 PM' },
                        { day: 'Sunday', hours: 'Closed' }
                      ].map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <span className="text-gray-600 font-medium">{schedule.day}:</span>
                          <span className="text-gray-900 font-semibold">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alternative Contact */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Alternative Contact</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <FaEnvelope className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-blue-900 font-semibold">Email Support</p>
                          <p className="text-blue-700 text-sm">naac.support@university.edu</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <FaPhone className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-blue-900 font-semibold">Phone Support</p>
                          <p className="text-blue-700 text-sm">+91 123-456-7890</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 border border-emerald-200">
                    <h3 className="text-xl font-semibold text-emerald-900 mb-4">Response Time</h3>
                    <p className="text-emerald-800 leading-relaxed">
                      We aim to respond to all queries within <span className="font-bold">24 hours</span> during business days. 
                      For urgent matters, please contact phone support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                  <FaQuestionCircle className="text-white" />
                </div>
                <h3 className="text-2xl font-bold">NAAC DVV System</h3>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                A comprehensive platform for faculty members to submit and manage data for NAAC accreditation 
                with integrated support and guidance systems.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {['User Manual', 'Video Tutorials', 'FAQs', 'Contact Support'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                      <FaChevronRight className="mr-2 text-xs" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Data Security'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                      <FaChevronRight className="mr-2 text-xs" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} NAAC DVV System. All rights reserved. Built with ❤️ for educational excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpSupport;