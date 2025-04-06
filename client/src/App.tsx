import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect, createContext } from "react";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import LiveAuctions from "@/pages/LiveAuctions";
import MyTeam from "@/pages/MyTeam";
import Watchlist from "@/pages/Watchlist";
import AuctionRules from "@/pages/AuctionRules";
import MyBids from "@/pages/MyBids";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import { apiRequest } from "./lib/queryClient";

export interface User {
  id: number;
  username: string;
  teamName: string;
  balance: number;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {},
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user, setUser }}>
        {!user ? (
          <Switch>
            <Route path="/register" component={Register} />
            <Route path="*" component={Login} />
          </Switch>
        ) : (
          <Layout>
            <Switch>
              {user.isAdmin ? (
                <Route path="/" component={AdminDashboard} />
              ) : (
                <Route path="/" component={Dashboard} />
              )}
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/live-auctions" component={LiveAuctions} />
              <Route path="/my-team" component={MyTeam} />
              <Route path="/my-bids" component={MyBids} />
              <Route path="/watchlist" component={Watchlist} />
              <Route path="/auction-rules" component={AuctionRules} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
        <Toaster />
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
