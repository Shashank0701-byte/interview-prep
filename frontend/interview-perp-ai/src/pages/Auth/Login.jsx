import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
// import AuthLayout from '../../components/layouts/AuthLayout';
const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otp, setOtp] = useState("");

  const {updateUser} = useContext(UserContext);

  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter the password.");
      return;
    }
    
    if (!executeRecaptcha) {
      setError("reCAPTCHA is still loading. Please try again in a moment.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha("login");
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
        captchaToken
      });

      if (response.data.requiresOTP) {
        setRequiresOTP(true);
      } else {
        const { token } = response.data;
        if (token) {
          localStorage.setItem("token", token);
          updateUser(response.data);
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.VERIFY_OTP, {
        email,
        otp
      });

      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred during OTP verification.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
      {/* Header Section */}
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-charcoal mb-2 sm:mb-3 transition-colors duration-300">
          {requiresOTP ? "Verify Login OTP" : "Welcome Back"}
        </h3>
        <p className="text-sm sm:text-base font-body text-charcoal/80 transition-colors duration-300">
          {requiresOTP ? `We've sent a code to ${email}` : "Please enter your details to log in"}
        </p>
      </div>

      {!requiresOTP ? (
        <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="email"
          />
          
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 Characters"
            type="password"
          />

          {error && (
            <div className='bg-red-50 border-2 border-red-500 rounded-sm p-3 sm:p-4 mb-4 sm:mb-6'>
              <p className='text-red-600 text-sm font-bold'>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-charcoal text-white font-bold uppercase tracking-wider text-sm py-3 sm:py-4 px-4 sm:px-6 rounded-sm border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none mb-4 sm:mb-6" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center pt-4">
            <p className='text-sm text-charcoal/80 font-body'>
              Don't have an account?{" "}
              <button
                type="button"
                className='font-bold text-charcoal hover:underline transition-colors duration-200 underline decoration-2 underline-offset-2'
                onClick={() => setCurrentPage("signup")}
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-3 sm:space-y-4">
          <Input
            value={otp}
            onChange={({ target }) => setOtp(target.value)}
            label="6-Digit OTP"
            placeholder="Enter the code from your email"
            type="text"
            maxLength={6}
          />

          {error && (
            <div className='bg-red-50 border-2 border-red-500 rounded-sm p-3 sm:p-4 mb-4 sm:mb-6'>
              <p className='text-red-600 text-sm font-bold'>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-charcoal text-white font-bold uppercase tracking-wider text-sm py-3 sm:py-4 px-4 sm:px-6 rounded-sm border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none mb-4 sm:mb-6" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify OTP"
            )}
          </button>
          
          <div className="text-center pt-4">
            <button
              type="button"
              className='text-sm font-bold text-charcoal/80 hover:text-charcoal transition-colors duration-200'
              onClick={() => {
                setRequiresOTP(false);
                setOtp("");
                setError("");
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
