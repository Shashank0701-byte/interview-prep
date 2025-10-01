import React, { useContext } from 'react';
import HERO_IMG from "../assets/hero-img.png";
import { APP_FEATURES } from "../utils/data";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LuSparkles } from 'react-icons/lu';
import Modal from '../components/Modal';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import { UserContext } from '../context/userContext';
import ProfileInfoCard from '../components/Cards/ProfileInfoCard';

const LandingPage = () => {

  const {user} = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  // Made the "Get Started" button open the modal
  const handleCTA = () => {
    if(!user){
    setOpenAuthModal(true);
    } else{
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className='w-full min-h-full bg-[#FFFCEF]'>
        <div className='w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0' />
        <div className='container mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12 sm:pb-24 relative z-10'>
          {/* Header */}
          {/* Mobile responsive header */}
          <header className='flex justify-between items-center mb-8 sm:mb-16'>
            <div className='text-lg sm:text-xl text-black font-bold'>
              Interview Prep AI
            </div>
            {/* Mobile responsive button */}
            {user ? (<ProfileInfoCard />):(<button
              className='bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-xs sm:text-sm font-semibold text-white px-4 sm:px-7 py-2 sm:py-2.5 rounded-full hover:bg-black hover:text-white border border-white transition-colors cursor-pointer'
              onClick={() => setOpenAuthModal(true)}
            >
              <span className="hidden sm:inline">Login / Sign Up</span>
              <span className="sm:hidden">Login</span>
            </button>)}
          </header>
          {/* Hero Content */}
          <div className='flex flex-col lg:flex-row items-center gap-8 lg:gap-12'>
            <div className='w-full lg:w-1/2 space-y-6'>
              <div className='flex items-center justify-left'>
                <div className='flex items-center gap-2 text-[13px] text-amber-600 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300'>
                  <LuSparkles />AI Powered
                </div>
              </div>
              <h1 className='text-3xl sm:text-4xl md:text-5xl text-black font-medium leading-tight'>
                Ace Interviews with <br />
                <span className='text-transparent bg-clip-text bg-[radial-gradient(circle,_#FF9324_0%,_#FCD760_100%)] bg-[length:200%_200%] animate-text-shine font-semibold'>
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
              <p className='text-base sm:text-lg text-gray-900 leading-relaxed'>Get role-specific questions, expand answers when you need them,
                dive deeper into concepts and organise everything your way.
                From preparation to mastery - your ultimate interview toolkit is
                here.
              </p>
              <button
                className='w-full sm:w-auto bg-black text-sm sm:text-base font-semibold text-white px-8 py-3 sm:px-7 sm:py-2.5 rounded-full hover:bg-yellow-100 hover:text-black border border-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer'
                onClick={handleCTA}
              >
                Get Started
              </button>
            </div>
            <div className='w-full lg:w-1/2'>
              <img
                src={HERO_IMG}
                alt='Hero Image'
                className='w-full rounded-lg shadow-lg'
              />
            </div>
          </div>
        </div>
      </div>
      <div className='w-full min-h-full relative z-10'>

        <div className='w-full min-h-full bg-[#FFFCEF] mt-6 sm:mt-10'>
          <div className='container mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 sm:pb-20'>
            <section className='mt-5'>
              <h2 className='text-xl sm:text-2xl font-medium text-center mb-8 sm:mb-12'>
                Features That Make You Shine
              </h2>
              <div className='flex flex-col items-center gap-6 sm:gap-8'>
                {/* First 3 Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6 sm:gap-8'>
                  {APP_FEATURES.slice(0, 3).map((feature) => (
                    <div
                      key={feature.id}
                      className='bg-[#FFFEF8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100'
                    >
                      <h3 className='text-base font-semibold mb-3'>
                        {feature.title}
                      </h3>
                      <p className='text-gray-600'>{feature.description}</p>
                    </div>
                  ))}
                </div>
                {/* Remaining 2 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-6 sm:gap-8 max-w-4xl">
                  {APP_FEATURES.slice(3).map((feature) => (
                    <div
                      key={feature.id}
                      className='bg-[#FFFEF8] p-6 rounded-xl hover:shadow-lg shadow-amber-100 transition border border-amber-100'
                    >
                      <h3 className='text-base font-semibold mb-3'>
                        {feature.title}
                      </h3>
                      <p className='text-gray-600'>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
        {/* Corrected: "Coding" */}
        <div className='text-sm bg-gray-50 text-secondary text-center p-5 mt-5'>Made with ❤️... Happy Coding</div>
      </div>

      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader={false} // Set to false if you want to see a title, true to hide
        title="Welcome" // Example title
      >
        <div>
          {currentPage === "login" && (
            <Login setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "signup" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;