import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineSquares2X2,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineBeaker,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineTrophy,
  HiOutlineCog6Tooth,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineVideoCamera,
} from "react-icons/hi2";
import Header from "@/components/ui/Header";
import { signOutSuccess } from "../redux/user/userSlice";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: HiOutlineSquares2X2 },
  { name: "My Courses", path: "/dashboard/my-courses", icon: HiOutlineBookOpen },
  { name: "AI Study Assistant", path: "/dashboard/ai-study-assistant", icon: HiOutlineChatBubbleLeftRight },
  { name: "Case Study Assistant", path: "/dashboard/case-study-assistant", icon: HiOutlineDocumentText },
  { name: "Clinical Practice", path: "/dashboard/clinical-practice", icon: HiOutlineBeaker },
  { name: "Live Classes", path: "/dashboard/live-classes", icon: HiOutlineVideoCamera },
  { name: "Assignments", path: "/dashboard/assignments", icon: HiOutlineClipboardDocumentList },
  { name: "Study Groups", path: "/dashboard/study-groups", icon: HiOutlineUsers },
  { name: "Leaderboard", path: "/dashboard/leaderboard", icon: HiOutlineTrophy },
  { name: "Settings", path: "/dashboard/settings", icon: HiOutlineCog6Tooth },
];

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-10 h-10 rounded-xl bg-[#42A889] flex items-center justify-center shadow-sm">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 6c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2H8V6z" fill="white" />
        <path d="M7 20c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
    <div>
      <p className="font-bold text-white text-lg leading-tight tracking-tight">NurseHub</p>
      <p className="text-[10px] text-[#DDF3E8]/80 leading-tight tracking-wide">Learn. Care. Lead.</p>
    </div>
  </div>
);

const GhanaFlag = () => (
  <div className="flex items-center gap-2 text-[#DDF3E8]/90">
    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
      <div className="h-1/3 bg-[#CE1126]" />
      <div className="h-1/3 bg-[#FCD116]" />
      <div className="h-1/3 bg-[#006B3F]" />
    </div>
    <span className="text-[10px] leading-tight">Made for Nursing Students in Ghana</span>
  </div>
);

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "GET", credentials: "include" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(signOutSuccess());
      navigate("/");
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-[230px] bg-[#103B46] text-white transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-[72px] px-5 border-b border-white/10">
          <Logo />
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B95D]"
            aria-label="Close navigation menu"
          >
            <HiOutlineXMark className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 py-5" aria-label="Dashboard">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B95D] ${
                      isActive
                        ? "bg-[#164E56] text-white shadow-sm"
                        : "text-[#DDF3E8]/80 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <GhanaFlag />
          {currentUser && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs font-medium text-white truncate">{currentUser.name || currentUser.username}</p>
              <p className="text-[10px] text-[#DDF3E8]/70 truncate">{currentUser.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-[#DDF3E8]/80 hover:bg-red-500/20 hover:text-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B95D]"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#F7FAF9] font-['Inter']">
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-[#E4EBE8] text-[#103B46] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
        aria-label="Open navigation menu"
      >
        <HiOutlineBars3 className="w-6 h-6" aria-hidden="true" />
      </button>

      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 md:ml-[230px] min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
