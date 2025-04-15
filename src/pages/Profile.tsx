
import React from "react";
import ProfilePanel from "@/components/Profile/ProfilePanel";

const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <ProfilePanel />
    </div>
  );
};

export default Profile;
