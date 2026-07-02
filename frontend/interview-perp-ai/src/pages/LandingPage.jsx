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

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  // Made the "Get Started" button open the modal
  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="bg-cream text-charcoal overflow-x-hidden font-body">
      <div className='w-full min-h-full bg-cream relative'>
        <div className='w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0 pointer-events-none' />
        <div className='container mx-auto px-4 pt-6 pb-[200px] relative z-10'>
          {/* Header */}
          <header className='flex justify-between items-center mb-12 md:mb-16'>
            <div className='text-xl md:text-3xl font-display font-bold text-charcoal'>
              Interview Prep AI
            </div>
            {/* Auth button */}
            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                className='bg-charcoal text-white px-5 py-2 md:px-7 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer border-2 border-charcoal'
                onClick={() => setOpenAuthModal(true)}
              >
                Login / Sign Up
              </button>
            )}
          </header>
          {/* Hero Content */}
          <div className='flex flex-col md:flex-row items-center'>
            <div className='w-full md:w-1/2 pr-0 md:pr-4 mb-8 md:mb-0 text-center md:text-left'>
              <div className='flex items-center justify-center md:justify-start mb-4'>
                <div className='flex items-center gap-2 text-xs md:text-[13px] text-charcoal font-bold bg-white px-3 py-1 rounded-sm border-2 border-charcoal uppercase tracking-wider'>
                  <LuSparkles />AI Powered
                </div>
              </div>
              <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-charcoal leading-tight mb-6'>
                Ace Interviews with <br />
                <span className='text-crimson'>
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
            </div>
            <div className='w-full md:w-1/2 text-center md:text-left'>
              <p className='text-base md:text-lg mr-0 md:mr-20 mb-8 text-charcoal/80'>
                Get role-specific questions, expand answers when you need them,
                dive deeper into concepts and organise everything your way.
                From preparation to mastery - your ultimate interview toolkit is
                here.
              </p>
              <button
                className='bg-white text-charcoal text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-sm border-2 border-charcoal hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all cursor-pointer'
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
          <section className='flex items-center justify-center mt-8 md:-mt-36 px-4'>
            <img
              src={HERO_IMG}
              alt='Hero Image'
              className='w-full md:w-[80vw] rounded-sm border-4 border-charcoal shadow-[8px_8px_0px_0px_#1A1A1A]'
            />
          </section>
        </div>

        <div className='w-full min-h-full bg-cream mt-10'>
          <div className='container mx-auto px-4 pt-10 pb-20'>
            <section className='mt-5'>
              <h2 className='text-3xl md:text-4xl font-display font-bold text-center mb-12 text-charcoal'>
                Features That Make You Shine
              </h2>
              <div className='flex flex-col items-center gap-8'>
                {/* First 3 Cards */}
                <div className='grid grid-cols-1 md:grid-cols-3 w-full gap-8'>
                  {APP_FEATURES.slice(0, 3).map((feature) => (
                    <div
                      key={feature.id}
                      className='card-editorial p-6 flex flex-col'
                    >
                      <h3 className='text-lg font-bold mb-3 uppercase tracking-wider text-charcoal'>
                        {feature.title}
                      </h3>
                      <p className="text-charcoal/80">{feature.description}</p>
                    </div>
                  ))}
                </div>
                {/* Remaining 2 cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                  {APP_FEATURES.slice(3).map((feature) => (
                    <div
                      key={feature.id}
                      className='card-editorial p-6 flex flex-col'
                    >
                      <h3 className='text-lg font-bold mb-3 uppercase tracking-wider text-charcoal'>
                        {feature.title}
                      </h3>
                      <p className="text-charcoal/80">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
        {/* Footer */}
        <div className='text-xs font-bold uppercase tracking-widest bg-charcoal text-white text-center p-6 border-t-2 border-charcoal'>
          Made with ❤️... Happy Coding
        </div>
      </div>
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader={false}
        title="Welcome"
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