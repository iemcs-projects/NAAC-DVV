import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingNavbar = () => {
  const navigate = useNavigate();

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <>
      <header className="flex justify-between items-center px-5 py-2.5 bg-white shadow-sm h-16">
      <div className="flex items-center">
        <h1 className="text-sm font-bold text-[#5D6096] text-[15px]">NAAC DVV System</h1>
      </div>

      <nav className="hidden md:flex space-x-2">
        <button 
          onClick={() => scrollToSection('features')}
          className="!text-[#1F2937] !bg-white hover:text-[#5D6096] transition-colors cursor-pointer bg-transparent border-none"
        >
          Features
        </button>
        <button 
          onClick={() => scrollToSection('solutions')}
          className="!text-[#1F2937] !bg-white hover:text-[#5D6096] transition-colors cursor-pointer bg-transparent border-none"
        >
          Solutions
        </button>
        <button 
          onClick={() => scrollToSection('how-it-works')}
          className="!text-[#1F2937] !bg-white hover:text-[#5D6096] transition-colors cursor-pointer bg-transparent border-none"
        >
          How It Works
        </button>
        <button 
          onClick={() => scrollToSection('contact')}
          className="!text-[#1F2937] !bg-white hover:text-[#5D6096] transition-colors cursor-pointer bg-transparent border-none"
        >
          Contact
        </button>
      </nav>

      <div className="flex space-x-2 pl-4">
        <button
          className="pl-4 py-2 !text-[#1F2937] border rounded-lg !bg-white hover:!bg-[#5d6096] hover:text-white transition-all duration-300 cursor-pointer shadow-sm"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
        <button
          className="px-4 py-2 !bg-[#F4A261] text-white rounded-lg hover:bg-[#F4A261]/90 transition-all duration-300 cursor-pointer shadow-md"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div>
    </header>
    </>
  );
};

export default LandingNavbar;
