import { useState, useEffect } from "react";
import BidDialog from "./BidDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useContext } from "react";
import { UserContext } from "../App";
import { apiRequest } from "@/lib/queryClient";

interface Auction {
  id: number;
  startingPrice: number;
  currentPrice: number;
  currentWinnerId: number;
  startTime: string;
  endTime: string;
  status: string;
  player: {
    id: number;
    username: string;
    realName: string;
    specialty: string;
    level: number;
    accuracy: number;
    reactionTime: number;
    strategy: number;
    leadership?: number;
    teamCoordination?: number;
    mapAwareness?: number;
    survivalSkills?: number;
    resourceManagement?: number;
    combat?: number;
    winRate: number;
    experience: number;
    imageUrl: string;
    rating: number;
  };
}

interface AuctionCardProps {
  auction: Auction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isBidDialogOpen, setBidDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  const { data: isWatchlisted } = useQuery({
    queryKey: ["/api/watchlist"],
    select: (data: any) => data.some((item: any) => item.playerId === auction.player.id),
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime]);

  const handleToggleWatchlist = async () => {
    try {
      if (isWatchlisted) {
        await apiRequest("DELETE", `/api/watchlist/${auction.player.id}`);
        toast({
          title: "Removed from watchlist",
          description: `${auction.player.username} has been removed from your watchlist`,
        });
      } else {
        await apiRequest("POST", "/api/watchlist", {
          playerId: auction.player.id,
        });
        toast({
          title: "Added to watchlist",
          description: `${auction.player.username} has been added to your watchlist`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive",
      });
    }
  };

  // Define which stats to show based on specialty
  const getStatsToDIsplay = () => {
    const stats = [
      { name: "Accuracy", value: auction.player.accuracy },
      { name: "Reaction Time", value: auction.player.reactionTime },
      { name: "Strategy", value: auction.player.strategy },
    ];

    if (auction.player.specialty === "MOBA Captain") {
      return [
        { name: "Leadership", value: auction.player.leadership || 0 },
        { name: "Team Coordination", value: auction.player.teamCoordination || 0 },
        { name: "Map Awareness", value: auction.player.mapAwareness || 0 },
      ];
    } else if (auction.player.specialty === "Battle Royale") {
      return [
        { name: "Survival Skills", value: auction.player.survivalSkills || 0 },
        { name: "Resource Management", value: auction.player.resourceManagement || 0 },
        { name: "Combat", value: auction.player.combat || 0 },
      ];
    }

    return stats;
  };

  return (
    <div className="rounded-xl overflow-hidden transition-all player-card">
      <div className="relative">
        <img
          src={auction.player.imageUrl}
          alt={auction.player.username}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-neon-cyan/90 text-darkest-teal text-xs px-2 py-1 rounded-full font-semibold">
          {auction.player.specialty}
        </div>
        <button 
          className="absolute top-4 left-4 p-2 rounded-full bg-darkest-teal/80 backdrop-blur-sm border border-neon-cyan/30"
          onClick={handleToggleWatchlist}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isWatchlisted ? "text-neon-cyan fill-neon-cyan" : "text-light-cyan"}`}
            viewBox="0 0 20 20"
            fill={isWatchlisted ? "currentColor" : "none"}
            stroke="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="auction-timer absolute bottom-0 left-0 right-0 text-light-cyan py-2 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-neon-cyan"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{timeLeft}</span>
          </div>
          <div className="bg-neon-cyan text-darkest-teal px-2 py-0.5 rounded text-xs font-semibold pulse-animation">
            LIVE NOW
          </div>
        </div>
      </div>
      <div className="p-5 relative">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-light-cyan">{auction.player.username}</h3>
            <p className="text-neon-cyan/80 text-sm">
              {auction.player.realName} • Level {auction.player.level}
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-darkest-teal/80 px-2 py-1 rounded-lg border border-card-border">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-neon-cyan"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold text-light-cyan">{auction.player.rating}</span>
          </div>
        </div>

        {getStatsToDIsplay().map((stat, index) => (
          <div className="mb-4" key={index}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-light-cyan">{stat.name}</span>
              <span className="text-neon-cyan">{stat.value}%</span>
            </div>
            <div className="stat-bar">
              <div
                style={{ width: `${stat.value}%` }}
              ></div>
            </div>
          </div>
        ))}

        <div className="border-t border-card-border pt-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-neon-cyan/70">Current Bid</p>
            <p className="text-lg font-bold text-neon-cyan glow-text">
              ${auction.currentPrice.toLocaleString()}
            </p>
          </div>
          <button
            className="cyber-btn px-4 py-2 rounded-lg text-sm font-medium"
            onClick={() => setBidDialogOpen(true)}
            disabled={!user}
          >
            Place Bid
          </button>
        </div>
      </div>

      <BidDialog
        isOpen={isBidDialogOpen}
        onClose={() => setBidDialogOpen(false)}
        auction={auction}
        minBid={Math.ceil(auction.currentPrice * 1.05)}
      />
    </div>
  );
}
