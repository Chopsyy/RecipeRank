import { useRouter } from "next/navigation";
import React from "react";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} style={{ margin: "1rem" }}>
      Logout
    </button>
  );
};

export default LogoutButton;
