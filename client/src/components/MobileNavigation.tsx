import { Link, useLocation } from "wouter";
import { useContext } from "react";
import { UserContext } from "../App";
import { useQuery } from "@tanstack/react-query";

interface MobileNavigationProps {
  onClose: () => void;
}

export default function MobileNavigation({ onClose }: MobileNavigationProps) {
  const [location] = useLocation();
  const { user } = useContext(UserContext);
  
  const { data: activeBidsCount } = useQuery({
    queryKey: ["/api/bids/my-bids"],
    select: (data) => 
      data.filter((bid: any) => bid.auction.status === "active").length,
  });

  return (
    <nav className="flex flex-col space-y-2">
      <Link href="/">
        <a
          className={`px-4 py-2 flex items-center space-x-3 ${
            location === "/"
              ? "bg-gray-800 rounded-md text-white"
              : "text-gray-300 rounded-md"
          }`}
          onClick={onClose}
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
        </a>
      </Link>

      <Link href="/my-team">
        <a
          className={`px-4 py-2 flex items-center space-x-3 ${
            location === "/my-team"
              ? "bg-gray-800 rounded-md text-white"
              : "text-gray-300 rounded-md"
          }`}
          onClick={onClose}
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
        </a>
      </Link>

      <Link href="/my-bids">
        <a
          className={`px-4 py-2 flex items-center space-x-3 ${
            location === "/my-bids"
              ? "bg-gray-800 rounded-md text-white"
              : "text-gray-300 rounded-md"
          }`}
          onClick={onClose}
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
            <span className="ml-auto bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
              {activeBidsCount}
            </span>
          )}
        </a>
      </Link>

      <Link href="/live-auctions">
        <a
          className={`px-4 py-2 flex items-center space-x-3 ${
            location === "/live-auctions"
              ? "bg-gray-800 rounded-md text-white"
              : "text-gray-300 rounded-md"
          }`}
          onClick={onClose}
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
          <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full pulse-animation">
            LIVE
          </span>
        </a>
      </Link>

      <Link href="/watchlist">
        <a
          className={`px-4 py-2 flex items-center space-x-3 ${
            location === "/watchlist"
              ? "bg-gray-800 rounded-md text-white"
              : "text-gray-300 rounded-md"
          }`}
          onClick={onClose}
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
        </a>
      </Link>

      <Link href="/auction-rules">
        <a
          className={`px-4 py-2 flex items-center space-x-3 ${
            location === "/auction-rules"
              ? "bg-gray-800 rounded-md text-white"
              : "text-gray-300 rounded-md"
          }`}
          onClick={onClose}
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
        </a>
      </Link>

      <div className="mt-8 border-t border-gray-700 pt-4">
        <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3">
          <img
            src={user?.avatarUrl || "https://i.pravatar.cc/300"}
            alt="Team leader avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-medium text-white">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-gray-400">{user?.teamName || "Team"}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
