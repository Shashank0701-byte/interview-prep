import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input'; // Assuming correct path
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector'; // Assuming correct path
import { validateEmail } from '../../utils/helper';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';
// import AuthLayout from '../../components/layouts/AuthLayout';

const SignUp = ({ setCurrentPage }) => {
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {updateUser} = useContext(UserContext);

    const navigate = useNavigate();

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

        setError(null); // Clear any previous errors if validation passes
        setIsLoading(true);

        // SignUp API Call
        try {
        // Upload image if present
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
            localStorage.setItem("token", token);
            updateUser(response.data);
            navigate("/dashboard");
        }
        } catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full px-8 py-10 flex flex-col justify-center min-h-[600px]">
            {/* Header Section */}
            <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-3 transition-colors duration-300">
                    Create an Account
                </h3>
                <p className="text-base font-body text-charcoal/80 transition-colors duration-300">
                    Join us today by entering your details below.
                </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-1">
                {/* Profile Photo Section */}
                <div className="mb-8">
                    <ProfilePhotoSelector
                        image={profilePic}
                        setImage={setProfilePic}
                        preview={preview}
                        setPreview={setPreview}
                    />
                </div>

                <Input
                    value={fullName}
                    onChange={({ target }) => setFullName(target.value)}
                    label="Full Name"
                    placeholder="John Doe"
                    type="text"
                />

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
                    <div className='bg-red-50 border-2 border-red-500 rounded-sm p-4 mb-6'>
                        <p className='text-red-600 text-sm font-bold text-center'>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-charcoal text-white font-bold uppercase tracking-wider text-sm py-4 px-6 rounded-sm border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none mb-6"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creating Account...
                        </div>
                    ) : (
                        "Sign Up"
                    )}
                </button>

                <div className="text-center pt-4">
                    <p className="text-sm font-body text-charcoal/80">
                        Already have an account?{" "}
                        <button
                            type="button"
                            className="font-bold text-charcoal hover:underline transition-colors duration-200 underline decoration-2 underline-offset-2"
                            onClick={() => setCurrentPage("login")}
                        >
                            Login
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignUp;