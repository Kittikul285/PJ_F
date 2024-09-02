import axios from "axios";
import { useEffect, useState } from "react";

// Function to get the token from local storage
const getToken = () => {
  return localStorage.getItem("token"); // Replace "token" with the correct key if needed
};

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = getToken(); // Retrieve the token
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("http://localhost:8000/auth/userById/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(response.data); // Set the retrieved profile data
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    getProfile();
  }, []);

  if (!profile) {
    return <div>Loading...</div>; // Show a loading state while fetching data
  }

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <div className="flex flex-col items-center">
          {/* <img
            className="w-24 h-24 rounded-full shadow-md"
            src="https://via.placeholder.com/150"
            alt="Profile"
          /> */}
          <h1 className="text-2xl font-semibold text-gray-800 mt-4">ชื่อ: {profile.name} นามสกุล: {profile.lastName}</h1>
          <p className="text-gray-600 mt-2 text-center">
            Email: {profile.email}
          </p>
          <p className="text-gray-600 mt-2 text-center">
            Phone: {profile.phone}
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default Profile;
