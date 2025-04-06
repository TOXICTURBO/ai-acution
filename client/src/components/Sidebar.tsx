import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { UserContext } from "../App";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, setUser } = useContext(UserContext);
  const { toast } = useToast();

  const { data: bidsData } = useQuery({
    queryKey: ["/api/bids/my-bids"],
  });
  
  // Safely get active bids count
  const activeBidsCount = Array.isArray(bidsData) 
    ? bidsData.filter((bid: any) => bid?.auction?.status === "active").length 
    : 0;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col sidebar text-white">
      <div className="p-6 flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-darkest-teal border border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]">
          <span className="text-neon-cyan font-bold text-2xl glow-text">TS</span>
        </div>
        <h1 className="text-2xl font-bold glow-text">TeamScout</h1>
      </div>

      <nav className="mt-6 flex flex-col flex-1">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-light-cyan font-semibold">
          Management
        </div>

        <div
          className={`nav-item px-6 py-3 flex items-center space-x-3 ${
            location === "/"
              ? "active"
              : ""
          }`}
          onClick={() => window.location.href = '/'}
          style={{ cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span>Dashboard</span>
        </div>

        <div
          className={`nav-item px-6 py-3 flex items-center space-x-3 ${
            location === "/my-team"
              ? "active"
              : ""
          }`}
          onClick={() => window.location.href = '/my-team'}
          style={{ cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span>My Team</span>
        </div>

        <div
          className={`nav-item px-6 py-3 flex items-center space-x-3 ${
            location === "/my-bids"
              ? "active"
              : ""
          }`}
          onClick={() => window.location.href = '/my-bids'}
          style={{ cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
          <span>My Bids</span>
          {activeBidsCount > 0 && (
            <span className="ml-auto bg-neon-cyan text-darkest-teal text-xs px-2 py-1 rounded-full font-bold">
              {activeBidsCount}
            </span>
          )}
        </div>

        <div className="px-4 py-2 mt-6 text-xs uppercase tracking-wider text-light-cyan font-semibold">
          Auction Area
        </div>

        <div
          className={`nav-item px-6 py-3 flex items-center space-x-3 ${
            location === "/live-auctions"
              ? "active"
              : ""
          }`}
          onClick={() => window.location.href = '/live-auctions'}
          style={{ cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
              clipRule="evenodd"
            />
          </svg>
          <span>Live Auctions</span>
          <span className="ml-auto bg-neon-cyan text-darkest-teal text-xs px-2 py-1 rounded-full pulse-animation font-bold">
            LIVE
          </span>
        </div>

        <div
          className={`nav-item px-6 py-3 flex items-center space-x-3 ${
            location === "/watchlist"
              ? "active"
              : ""
          }`}
          onClick={() => window.location.href = '/watchlist'}
          style={{ cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span>Watchlist</span>
        </div>

        <div
          className={`nav-item px-6 py-3 flex items-center space-x-3 ${
            location === "/auction-rules"
              ? "active"
              : ""
          }`}
          onClick={() => window.location.href = '/auction-rules'}
          style={{ cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Auction Rules</span>
        </div>

        <div className="mt-auto">
          <div className="px-6 py-4">
            <div className="backdrop-blur-sm bg-dark-teal/30 rounded-lg p-3 flex items-center space-x-3 border border-neon-cyan/30">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-darkest-teal border border-neon-cyan overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Team leader avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-neon-cyan font-bold">{user?.username?.charAt(0) || "U"}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-light-cyan">{user?.username || "User"}</p>
                <p className="text-xs text-neon-cyan">{user?.teamName || "Team"}</p>
              </div>
              <button 
                className="ml-auto p-2 rounded-full hover:bg-darkest-teal transition-colors" 
                onClick={handleLogout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-neon-cyan"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5.707-5.707A1 1 0 009.586 1H3zm7 2a1 1 0 01-1-1V1.414L13.586 6H10z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
