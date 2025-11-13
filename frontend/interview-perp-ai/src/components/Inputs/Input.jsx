import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Input = ({ value, onChange, label, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-6">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
        {label}
      </label>
      <div className={`flex items-center border-2 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 transition-all duration-300 ${
        isFocused 
          ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
      }`}>
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder-gray-500 transition-colors duration-300"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="ml-2 sm:ml-3 p-1 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex-shrink-0"
          >
            {showPassword ? (
              <FaRegEye
                size={16}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 sm:w-[18px] sm:h-[18px]"
              />
            ) : (
              <FaRegEyeSlash
                size={16}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 sm:w-[18px] sm:h-[18px]"
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;