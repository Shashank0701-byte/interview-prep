import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import AuthLayout from '../../components/layouts/AuthLayout';
import TerminalLoader from '../../components/TerminalLoader';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otp, setOtp] = useState("");

  const { updateUser } = useContext(UserContext);
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
      setError("System handshake pending. Please try again in a moment.");
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
        setIsLoading(false);
      } else {
        const { token } = response.data;
        if (token) {
          localStorage.setItem("token", token);
          updateUser(response.data);
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        }
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Connection refused. Invalid credentials or network error.");
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Invalid security token.");
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
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Token verification failed.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="w-full bg-white border-4 border-charcoal rounded-sm p-8 sm:p-10 shadow-[8px_8px_0px_0px_#1A1A1A]">
        
        {isLoading ? (
          <TerminalLoader text="AUTHENTICATING..." />
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display font-bold text-charcoal tracking-wide mb-3">
                {requiresOTP ? "Verify Session" : "Resume Session"}
              </h2>
              <p className="text-charcoal/70 font-mono text-xs tracking-wider">
                {requiresOTP ? "Enter security token from email." : "Initialize session to resume work on active architectures."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 border-4 border-charcoal bg-red-50 rounded-sm flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                <span className="text-red-500 font-bold bg-white px-2 border-2 border-charcoal">ERR</span>
                <p className="text-charcoal text-xs font-mono font-bold mt-1">{error}</p>
              </div>
            )}

            {!requiresOTP ? (
              <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-cream border-4 border-charcoal rounded-sm py-4 px-4 text-charcoal font-mono text-sm placeholder:text-charcoal/30 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">Password</label>
                    <Link to="#" className="text-[10px] font-bold text-charcoal hover:underline">Forgot password?</Link>
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-cream border-4 border-charcoal rounded-sm py-4 px-4 text-charcoal font-mono text-sm placeholder:text-charcoal/30 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  className="w-full bg-charcoal text-cream font-bold tracking-widest uppercase text-xs py-4 rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] transition-all mt-6 cursor-pointer"
                >
                  Authenticate
                </button>

                <div className="text-center pt-8 border-t-4 border-charcoal mt-8">
                  <p className="text-xs font-bold text-charcoal">
                    New to Interview Prep AI?{' '}
                    <Link to="/signUp" className="underline hover:bg-charcoal hover:text-cream transition-colors px-1">Create a workspace</Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">Security Token</label>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="w-full bg-cream border-4 border-charcoal rounded-sm py-4 px-4 text-charcoal font-mono text-lg tracking-[0.5em] font-bold placeholder:text-charcoal/30 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all text-center"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  className="w-full bg-charcoal text-cream font-bold tracking-widest uppercase text-xs py-4 rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] transition-all mt-6 cursor-pointer"
                >
                  Verify Protocol
                </button>
                
                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setRequiresOTP(false);
                      setOtp("");
                      setError("");
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-colors cursor-pointer"
                  >
                    Abort & Return
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      
      {/* Footer Links */}
      <div className="flex justify-center items-center gap-6 mt-8 text-[10px] font-bold text-charcoal/60 font-mono tracking-widest uppercase">
        <Link to="#" className="hover:text-charcoal transition-colors">Terms of Service</Link>
        <Link to="#" className="hover:text-charcoal transition-colors">Privacy Policy</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
