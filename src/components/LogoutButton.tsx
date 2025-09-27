import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import React from 'react';

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <button onClick={handleLogout} style={{ margin: '1rem' }}>
      Logout
    </button>
  );
};

export default LogoutButton;
