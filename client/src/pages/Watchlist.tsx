import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WatchlistPlayer {
  id: number;
  playerId: number;
  userId: number;
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
  }
}

export default function Watchlist() {
  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["/api/watchlist"],
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRemoveFromWatchlist = async (playerId: number) => {
    try {
      await apiRequest("DELETE", `/api/watchlist/${playerId}`);
      toast({
        title: "Player removed",
        description: "Player has been removed from your watchlist",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    } catch (error) {
      toast({
        title: "Failed to remove player",
        description: "There was an error removing the player from your watchlist",
        variant: "destructive",
      });
    }
  };

  const filteredWatchlist = watchlist 
    ? watchlist.filter((item: WatchlistPlayer) => 
        item.player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.player.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.player.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Watchlist</h1>
          <p className="text-gray-600 mt-1">
            Keep track of players you're interested in acquiring
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="max-w-md">
          <Label htmlFor="search" className="sr-only">
            Search Watchlist
          </Label>
          <Input
            id="search"
            placeholder="Search by player name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {watchlist && watchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWatchlist.map((item: WatchlistPlayer) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={item.player.imageUrl}
                  alt={item.player.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{item.player.username}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.player.realName} • Level {item.player.level}
                    </p>
                    <p className="text-xs text-primary-600 font-medium mt-1">
                      {item.player.specialty}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{item.player.rating}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Win Rate</p>
                      <p className="font-medium">{item.player.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="font-medium">{item.player.experience} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Accuracy</p>
                      <p className="font-medium">{item.player.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Strategy</p>
                      <p className="font-medium">{item.player.strategy}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4 flex justify-between">
                <Button 
                  variant="destructive" 
                  className="text-xs"
                  onClick={() => handleRemoveFromWatchlist(item.player.id)}
                >
                  Remove
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => window.location.href = "/live-auctions"}
                >
                  Find Auctions
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium">Your watchlist is empty</h3>
          <p className="mt-2 text-gray-600">
            Add players to your watchlist to keep track of them.
          </p>
          <Button 
            className="mt-4"
            onClick={() => window.location.href = "/live-auctions"}
          >
            Browse Live Auctions
          </Button>
        </div>
      )}
    </div>
  );
}
