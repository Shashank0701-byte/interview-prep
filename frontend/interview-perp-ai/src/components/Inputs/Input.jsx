import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Input = ({ value, onChange, label, placeholder, type, maxLength }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-6">
      <label className="text-xs font-bold uppercase tracking-[0.15em] text-charcoal/60 dark:text-cream/60 transition-colors duration-300">
        {label}
      </label>
      <div className={`flex items-center border-2 rounded-md px-3 sm:px-4 py-3 sm:py-3.5 transition-all duration-200 ${
        isFocused 
          ? 'border-charcoal dark:border-cream/60 bg-white dark:bg-navy-input' 
          : 'border-charcoal/20 dark:border-cream/20 hover:border-charcoal/40 dark:hover:border-cream/40 bg-white dark:bg-navy-input'
      }`}>
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm sm:text-base text-charcoal dark:text-cream placeholder-charcoal/30 dark:placeholder-cream/30 transition-colors duration-300"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="ml-2 sm:ml-3 p-1 rounded-md hover:bg-charcoal/5 dark:hover:bg-cream/10 transition-colors duration-200 flex-shrink-0"
          >
            {showPassword ? (
              <FaRegEye
                size={16}
                className="text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors duration-200 sm:w-[18px] sm:h-[18px]"
              />
            ) : (
              <FaRegEyeSlash
                size={16}
                className="text-charcoal/30 dark:text-cream/30 hover:text-charcoal/60 dark:hover:text-cream/60 transition-colors duration-200 sm:w-[18px] sm:h-[18px]"
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;