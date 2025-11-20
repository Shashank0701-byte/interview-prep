import React, { useContext, useState } from 'react'; // Assuming useContext is needed
import { UserContext } from '../../context/userContext'; // Assuming path
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom


const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/");
  };

  const getProfileImage = () => {
    if (!user.profileImageUrl || imgError) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff`;
    }
    return user.profileImageUrl;
  };

  return (
    user && (
      <div className='flex items-center gap-3'>
        <img
          src={getProfileImage()}
          alt={user.name}
          onError={() => setImgError(true)}
          className='w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700'
        />
        <div className="flex flex-col">
          <div
            className='text-sm font-bold text-slate-900 dark:text-white leading-tight'
          >
            {user.name || "User"}
          </div>
          <button
            className='text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 text-xs font-semibold cursor-pointer hover:underline text-left mt-0.5'
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default ProfileInfoCard;