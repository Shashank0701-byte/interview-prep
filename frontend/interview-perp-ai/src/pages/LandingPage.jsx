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
    <div className="bg-[#FFFCEF] text-black" style={{ backgroundColor: '#FFFCEF', color: '#000000' }}>
      <div className='w-full min-h-full bg-[#FFFCEF]' style={{ backgroundColor: '#FFFCEF' }}>
        <div className='w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0' />
        <div className='container mx-auto px-4 pt-6 pb-[200px] relative z-10'>
          {/* Header */}
          {/* Corrected: "items-center" and "mb-16" */}
          <header className='flex justify-between items-center mb-16'>
            <div className='text-xl font-bold' style={{ color: '#000000' }}>
              Interview Prep AI
            </div>
            {/* Auth button */}
            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                className='bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white border border-white transition-colors cursor-pointer'
                style={{ 
                  background: 'linear-gradient(to right, #FF9324, #e99a4b)',
                  color: '#ffffff',
                  border: '1px solid #ffffff'
                }}
                onClick={() => setOpenAuthModal(true)}
              >
                Login / Sign Up
              </button>
            )}
          </header>
          {/* Hero Content */}
          <div className='flex flex-col md:flex-row items-center'>
            <div className='w-full md:w-1/2 pr-4 mb-8 md:mb-0'>
              <div className='flex items-center justify-left mb-2'>
                <div className='flex items-center gap-2 text-[13px] text-amber-600 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300'>
                  <LuSparkles />AI Powered
                </div>
              </div>
              <h1 className='text-5xl font-medium mb-6 leading-tight' style={{ color: '#000000' }}>
                Ace Interviews with <br />
                <span className='text-transparent bg-clip-text bg-[radial-gradient(circle,_#FF9324_0%,_#FCD760_100%)] bg-[length:200%_200%] animate-text-shine font-semibold'>
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
            </div>
            <div className='w-full md:w-1/2'>
              <p className='text-[17px] mr-0 md:mr-20 mb-6' style={{ color: '#111827' }}>Get role-specific questions, expand answers when you need them,
                dive deeper into concepts and organise everything your way.
                From preparation to mastery - your ultimate interview toolkit is
                here.
              </p>
              <button
                className='bg-black text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-yellow-100 hover:text-black border border-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer'
                onClick={handleCTA}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='w-full min-h-full relative z-10'>
        <div>
          <section className='flex items-center justify-center -mt-36'>
            <img
              src={HERO_IMG}
              alt='Hero Image'
              className='w-[80vw] rounded-lg'
            />
          </section>
        </div>

        <div className='w-full min-h-full bg-[#FFFCEF] mt-10' style={{ backgroundColor: '#FFFCEF' }}>
          <div className='container mx-auto px-4 pt-10 pb-20'>
            <section className='mt-5'>
              <h2 className='text-2xl font-medium text-center mb-12' style={{ color: '#000000' }}>
                Features That Make You Shine
              </h2>
              {/* Corrected: "items-center" */}
              <div className='flex flex-col items-center gap-8'>
                {/* First 3 Cards */}
                <div className='grid grid-cols-1 md:grid-cols-3 w-full gap-8'>
                  {APP_FEATURES.slice(0, 3).map((feature) => (
                    <div
                      key={feature.id}
                      className='bg-[#FFFEF8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100'
                      style={{ backgroundColor: '#FFFEF8' }}
                    >
                      <h3 className='text-base font-semibold mb-3' style={{ color: '#000000' }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: '#4B5563' }}>{feature.description}</p>
                    </div>
                  ))}
                </div>
                {/* Remaining 2 cards */}
                {/* Corrected: "md:grid-cols-2" */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {APP_FEATURES.slice(3).map((feature) => (
                    <div
                      key={feature.id}
                      className='bg-[#FFFEF8] p-6 rounded-xl hover:shadow-lg shadow-amber-100 transition border border-amber-100'
                      style={{ backgroundColor: '#FFFEF8' }}
                    >
                      <h3 className='text-base font-semibold mb-3' style={{ color: '#000000' }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: '#4B5563' }}>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
        {/* Footer */}
        <div className='text-sm bg-gray-50 text-center p-5 mt-5' style={{ backgroundColor: '#F9FAFB', color: '#6B7280' }}>
          Made with ❤️... Happy Coding
        </div>
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
    </div>
  );
};

export default LandingPage;