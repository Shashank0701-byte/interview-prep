import React from 'react';

const Modal = ({ children, isOpen, onClose, title, hideHeader }) => {

  // CRITICAL: This ensures the modal doesn't render when it's closed.
  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/40 p-2 sm:p-4'>
      {/* Editorial modal */}
      <div
        className={`relative flex flex-col bg-white border-2 border-charcoal rounded-md overflow-hidden w-full max-w-md mx-auto transform transition-all duration-200 max-h-[95vh] sm:max-h-[90vh] min-h-0`}
      >
        {!hideHeader && (
          <div className='flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b-2 border-charcoal/10'>
            <h3 className='text-lg sm:text-xl font-display text-charcoal pr-8'>{title}</h3>
          </div>
        )}

        <button
          type='button'
          className='text-charcoal/40 bg-transparent hover:bg-charcoal/5 hover:text-charcoal rounded-md text-sm w-10 h-10 flex justify-center items-center absolute top-2 right-2 sm:top-4 sm:right-4 cursor-pointer transition-all duration-200 z-10 touch-manipulation'
          onClick={onClose}
        >
          <svg
            className='w-3 h-3 sm:w-4 sm:h-4'
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
        <div className='flex-1 overflow-y-auto custom-scrollbar'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;