import { CiHome } from "react-icons/ci";
import { HiOutlineSquare3Stack3D } from "react-icons/hi2";
import { HiOutlineLogout } from "react-icons/hi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import Header from "@/components/ui/Header";
import DashboardHome from "./DashboardHome";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { signOutSuccess } from "../redux/user/userSlice";
import Explore from "./Explore";
import Upgrade from "./Upgrade";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tab, setTab] = useState("");

  // Set the active tab from the URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    
    // Handle logout action when the tab is set to logout
    if (tabFromUrl === "logout") {
      handleLogout();
      return;
    }
    
    setTab(tabFromUrl || "home"); // Default to "home" if no tab is present
  }, [location.search]);
  
  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint if needed
      await fetch('/api/auth/signout', {
        method: 'GET',
        credentials: 'include',
      });
      
      // Clear user from Redux store
      dispatch(signOutSuccess());
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const items = [
    {
      name: "Home",
      url: "home",
      icon: CiHome,
    },
    {
      name: "Explore",
      url: "explore",
      icon: HiOutlineSquare3Stack3D,
    },
    {
      name: "Upgrade",
      url: "upgrade",
      icon: IoShieldCheckmarkOutline,
    },
    {
      name: "Logout",
      url: "logout",
      icon: HiOutlineLogout,
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-56 fixed h-full border-r border-gray-100">
        <img className="w-10 h-10 m-4" src="/logo.png" alt="Logo" />
        <hr />
        <div className="mt-5">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => item.url === "logout" ? handleLogout() : navigate(`/dashboard?tab=${item.url}`)}
              className={`flex mt-1 ml-3 items-center gap-2 p-2 w-48 rounded-md cursor-pointer hover:bg-gray-100 ${
                tab === item.url ? "bg-gray-100" : ""
              }`}
            >
              <item.icon size={24} className="text-gray-700" />
              <p className="text-gray-800">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-56 flex-1">
        <Header />
        {/* Add other content here */}
        {tab === "home" && <DashboardHome />}
        {tab === "explore" && <Explore />}
        {tab === "upgrade" && <Upgrade />}
      </div>
    </div>
  );
};

export default Dashboard;
