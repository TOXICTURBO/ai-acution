import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden text-white p-4 flex items-center justify-between" style={{ background: "rgba(0, 26, 26, 0.9)", borderBottom: "1px solid var(--neon-cyan)" }}>
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-darkest-teal border border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            <span className="text-neon-cyan font-bold text-xl glow-text">TS</span>
          </div>
          <h1 className="text-xl font-bold glow-text">TeamScout</h1>
        </div>
        <button
          className="p-2 rounded-md border border-neon-cyan text-neon-cyan"
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(0, 20, 20, 0.85)" }}>
          <div className="flex h-full">
            <div className="w-3/4 sidebar p-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-darkest-teal border border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                    <span className="text-neon-cyan font-bold text-xl glow-text">TS</span>
                  </div>
                  <h1 className="text-xl font-bold glow-text">TeamScout</h1>
                </div>
                <button
                  className="text-neon-cyan p-2 border border-neon-cyan rounded-md hover:bg-dark-teal transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation */}
              <MobileNavigation onClose={() => setMobileMenuOpen(false)} />
            </div>
            <div
              className="w-1/4 bg-transparent"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 px-4 py-3 border-t border-neon-cyan backdrop-blur-md" style={{ backgroundColor: "rgba(0, 26, 26, 0.9)" }}>
        <div className="flex justify-around items-center">
          <a
            href="/"
            className="flex flex-col items-center text-neon-cyan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </a>

          <a
            href="/live-auctions"
            className="flex flex-col items-center text-light-cyan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs mt-1">Auctions</span>
          </a>

          <a
            href="/my-team"
            className="flex flex-col items-center text-light-cyan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="text-xs mt-1">Team</span>
          </a>

          <a
            href="/watchlist"
            className="flex flex-col items-center text-light-cyan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs mt-1">Watchlist</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
