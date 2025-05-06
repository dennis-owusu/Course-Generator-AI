import { CiHome } from "react-icons/ci";
import { HiOutlineSquare3Stack3D } from "react-icons/hi2";
import { HiOutlineLogout } from "react-icons/hi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { HiMenuAlt2 } from "react-icons/hi";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = window.innerWidth < 768;
  
  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="flex relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
          aria-label="Toggle menu"
        >
          <HiMenuAlt2 size={24} className="text-indigo-600" />
        </button>
      )}

      {/* Sidebar - responsive */}
      <div className={`${isMobile ? 'fixed left-0 top-0 z-40' : 'w-56 fixed'} h-full border-r border-gray-100 bg-white transition-all duration-300 ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}>
        <div className="flex justify-between items-center">
          <img className="w-10 h-10 m-4" src="/logo.png" alt="Logo" />
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 m-4"
              aria-label="Close menu"
            >
              <span className="text-2xl">&times;</span>
            </button>
          )}
        </div>
        <hr />
        <div className="mt-5">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (item.url === "logout") {
                  handleLogout();
                } else {
                  navigate(`/dashboard?tab=${item.url}`);
                  if (isMobile) setSidebarOpen(false);
                }
              }}
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

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content - responsive */}
      <div className={`${isMobile ? 'ml-0' : 'ml-56'} flex-1 transition-all duration-300`}>
        <Header />
        <div className="p-4">
          {tab === "home" && <DashboardHome />}
          {tab === "explore" && <Explore />}
          {tab === "upgrade" && <Upgrade />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
