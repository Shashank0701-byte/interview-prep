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
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                    Create an Account
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 transition-colors duration-300">
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
                    <div className='bg-red-50 border border-red-200 rounded-xl p-4 mb-6'>
                        <p className='text-red-600 text-sm font-medium text-center'>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl mb-6"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <button
                            type="button"
                            className="font-semibold text-green-600 hover:text-green-700 transition-colors duration-200 underline decoration-2 underline-offset-2"
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