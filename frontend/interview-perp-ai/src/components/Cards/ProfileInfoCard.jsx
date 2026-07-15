import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';

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
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=F5F0E8&color=1A1A1A`;
    }
    return user.profileImageUrl;
  };

  return (
    user && (
      <div className='flex items-center gap-3.5'>
        <img
          src={getProfileImage()}
          alt={user.name}
          onError={() => setImgError(true)}
          className='w-10 h-10 rounded-sm object-cover border-3 border-charcoal dark:border-cream/40 shadow-[2px_2px_0px_0px_var(--color-shadow)]'
        />
        <div className="flex flex-col">
          <div className='text-xs font-bold text-charcoal dark:text-cream leading-none uppercase tracking-wider font-mono'>
            {user.name || "User"}
          </div>
          <button
            className='text-crimson hover:text-crimson/80 text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer hover:underline text-left mt-1.5'
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