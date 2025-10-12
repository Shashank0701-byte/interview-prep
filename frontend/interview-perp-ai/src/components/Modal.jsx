import React from 'react';

const Modal = ({ children, isOpen, onClose, title, hideHeader }) => {

  // CRITICAL: This ensures the modal doesn't render when it's closed.
  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/50 backdrop-blur-sm p-4'>
      {/* Enhanced modal with better sizing and spacing */}
      <div
        className={`relative flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md mx-auto transform transition-all duration-300 ease-out`}
      >
        {!hideHeader && (
          <div className='flex items-center justify-between px-6 py-5 border-b border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-900'>{title}</h3>
          </div>
        )}

        <button
          type='button'
          className='text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-600 rounded-full text-sm w-10 h-10 flex justify-center items-center absolute top-4 right-4 cursor-pointer transition-all duration-200 ease-in-out'
          onClick={onClose}
        >
          <svg
            className='w-4 h-4'
            aria-hidden="true"
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 14 14'
          >
            <path
              stroke='currentColor'
              strokeLinecap='round'
              strokeWidth="2"
              d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
        <div className='flex-1 overflow-y-auto custom-scrollbar max-h-[80vh]'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;