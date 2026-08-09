import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';
import AuthLayout from '../../components/layouts/AuthLayout';
import TerminalLoader from '../../components/TerminalLoader';

const SignUp = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        let profileImageUrl = "";
 
        if (!fullName) {
            setError("Please enter full name.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!password) {
            setError("Please enter the password.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            if (profilePic) {
                const imgUploadRes = await uploadImage(profilePic);
                profileImageUrl = imgUploadRes.imageUrl || "";
            }

            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
                name: fullName,
                email,
                password,
                profileImageUrl,
            });

            const { token } = response.data;

            if (token) {
                sessionStorage.setItem("token", token);
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
                setError("System failure. Could not initialize workspace.");
            }
        }
    };

    return (
        <AuthLayout>
            <div className="w-full bg-white border-4 border-charcoal rounded-sm p-8 sm:p-10 shadow-[8px_8px_0px_0px_#1A1A1A]">
                
                {isLoading ? (
                    <TerminalLoader text="INITIALIZING WORKSPACE..." />
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-display font-bold text-charcoal tracking-wide mb-3">
                                Initialize Workspace
                            </h2>
                            <p className="text-charcoal/70 font-mono text-xs tracking-wider font-bold">
                                Create an account to access the interview engine.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 border-4 border-charcoal bg-red-50 rounded-sm flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                                <span className="text-red-500 font-bold bg-white px-2 border-2 border-charcoal">ERR</span>
                                <p className="text-charcoal text-xs font-mono font-bold mt-1">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSignUp} className="space-y-6">
                            
                            {/* Profile Photo */}
                            <div className='flex justify-center mb-6'>
                                <input
                                    type='file'
                                    accept='image/*'
                                    ref={inputRef}
                                    onChange={handleImageChange}
                                    className='hidden'
                                />

                                {!profilePic ? (
                                    <div 
                                        className='w-20 h-20 flex items-center justify-center bg-cream border-4 border-charcoal rounded-sm relative cursor-pointer group hover:bg-white hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all' 
                                        onClick={() => inputRef.current.click()}
                                    >
                                        <span className='text-3xl font-bold text-charcoal/30 group-hover:text-charcoal transition-colors'>+</span>
                                        <div className='absolute -bottom-3 -right-3 bg-charcoal text-cream text-[10px] font-bold px-2 border-2 border-cream'>
                                            UP
                                        </div>
                                    </div>
                                ) : (
                                    <div className='relative'>
                                        <img
                                            src={preview}
                                            alt="profile photo"
                                            className='w-20 h-20 rounded-sm object-cover border-4 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]'
                                        />
                                        <button
                                            type='button'
                                            className='absolute -bottom-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 border-2 border-charcoal hover:bg-red-600 transition-colors'
                                            onClick={() => {
                                                setProfilePic(null);
                                                setPreview(null);
                                            }}
                                        >
                                            DEL
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Full Name Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">Developer Identity</label>
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-cream border-4 border-charcoal rounded-sm py-4 px-4 text-charcoal font-mono text-sm placeholder:text-charcoal/30 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all"
                                />
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">Email Address</label>
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
                                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">Secure Protocol</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 Characters"
                                    className="w-full bg-cream border-4 border-charcoal rounded-sm py-4 px-4 text-charcoal font-mono text-sm placeholder:text-charcoal/30 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit"
                                className="w-full bg-charcoal text-cream font-bold tracking-widest uppercase text-xs py-4 rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] transition-all mt-6 cursor-pointer"
                            >
                                Initialize Architecture
                            </button>

                            <div className="text-center pt-6 border-t-4 border-charcoal mt-6">
                                <p className="text-xs font-bold text-charcoal">
                                    Session active?{' '}
                                    <Link to="/login" className="underline hover:bg-charcoal hover:text-cream transition-colors px-1">Resume Workspace</Link>
                                </p>
                            </div>
                        </form>
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

export default SignUp;