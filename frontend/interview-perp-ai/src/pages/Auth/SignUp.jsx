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
        }
    };

    return (
        <div className="w-full p-6 sm:p-7 flex flex-col justify-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-black dark:text-white text-center mb-2 transition-colors duration-300">Create an Account</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 text-center mb-6 transition-colors duration-300">
                Join us today by entering your details below.
            </p>
      <form onSubmit={handleSignUp} className="mt-6">
        <ProfilePhotoSelector
          image={profilePic}
          setImage={setProfilePic}
          preview={preview}
          setPreview={setPreview}
        />

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
          type="text"
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 Characters"
          type="password"
        />

        {error && <p className="text-red-500 text-xs text-center pb-2">{error}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg font-semibold mt-1 cursor-pointer"
        >
          Sign Up
        </button>

        <p className="text-sm text-center mt-6">
          Already have an account?{" "}
          <span
            className="font-medium text-orange-600 underline cursor-pointer"
            onClick={() => setCurrentPage("login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;