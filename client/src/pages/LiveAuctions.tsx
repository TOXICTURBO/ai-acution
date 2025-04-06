import { useQuery, useMutation } from "@tanstack/react-query";
import AuctionCard from "@/components/AuctionCard";
import { useState, useContext, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "../App";

export default function LiveAuctions() {
  const { data: auctions, isLoading } = useQuery({
    queryKey: ["/api/auctions/live"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [currentAuctionIndex, setCurrentAuctionIndex] = useState(0);
  const { toast } = useToast();
  const { user } = useContext(UserContext);

  // Filter auctions based on search and specialty
  const filteredAuctions = auctions
    ? auctions.filter((auction: any) => {
        // Filter by search term (player username or real name)
        const matchesSearch = searchTerm === "" || 
          auction.player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.player.realName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by specialty
        const matchesSpecialty = filterSpecialty === "all" || 
          auction.player.specialty === filterSpecialty;
        
        return matchesSearch && matchesSpecialty;
      })
    : [];

  // Get unique specialties for filter dropdown
  const specialties = auctions && auctions.length > 0
    ? [...new Set(auctions.map((auction: any) => auction.player.specialty))]
    : [];

  // Reset current auction index when filtered auctions change
  useEffect(() => {
    if (filteredAuctions.length > 0 && currentAuctionIndex >= filteredAuctions.length) {
      setCurrentAuctionIndex(0);
    }
  }, [filteredAuctions, currentAuctionIndex]);

  // Function to move to the next auction
  const goToNextAuction = () => {
    if (filteredAuctions.length > 0) {
      setCurrentAuctionIndex((prev) => (prev + 1) % filteredAuctions.length);
    }
  };

  // Function to move to the previous auction
  const goToPrevAuction = () => {
    if (filteredAuctions.length > 0) {
      setCurrentAuctionIndex((prev) => (prev - 1 + filteredAuctions.length) % filteredAuctions.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center text-light-cyan">
            Live Auctions
            <span className="ml-3 bg-neon-cyan text-darkest-teal text-xs px-2 py-0.5 rounded-full pulse-animation">
              LIVE
            </span>
          </h1>
          <p className="text-neon-cyan/70 mt-1">
            Bid on professional players to build your ultimate gaming team
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-container p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="search" className="mb-2 block text-light-cyan">Search Players</Label>
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-darkest-teal/80 border-card-border focus:border-neon-cyan focus:ring-neon-cyan"
            />
          </div>
          <div>
            <Label htmlFor="specialty" className="mb-2 block text-light-cyan">Filter by Specialty</Label>
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger id="specialty" className="bg-darkest-teal/80 border-card-border text-light-cyan focus:border-neon-cyan focus:ring-neon-cyan">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent className="bg-darkest-teal border-card-border text-light-cyan">
                <SelectItem value="all" className="focus:bg-dark-teal focus:text-neon-cyan">All Specialties</SelectItem>
                {specialties.map((specialty: string) => (
                  <SelectItem key={specialty} value={specialty} className="focus:bg-dark-teal focus:text-neon-cyan">
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Current Auction Display */}
      {filteredAuctions && filteredAuctions.length > 0 ? (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl mx-auto">
            <AuctionCard auction={filteredAuctions[currentAuctionIndex]} />
          </div>
          
          <div className="flex items-center justify-center mt-8 space-x-4">
            <Button 
              onClick={goToPrevAuction}
              className="cyber-btn px-4 py-2"
            >
              Previous Player
            </Button>
            <div className="px-4 py-2 rounded-lg bg-darkest-teal border border-card-border">
              <span className="text-neon-cyan">{currentAuctionIndex + 1}</span>
              <span className="text-light-cyan mx-1">/</span>
              <span className="text-light-cyan">{filteredAuctions.length}</span>
            </div>
            <Button 
              onClick={goToNextAuction}
              className="cyber-btn px-4 py-2"
            >
              Next Player
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center border border-card-border" style={{ background: 'rgba(0, 15, 15, 0.6)' }}>
          <h3 className="text-lg font-medium text-light-cyan">No live auctions available</h3>
          <p className="mt-2 text-neon-cyan/70">
            {searchTerm || filterSpecialty !== "all"
              ? "No auctions match your current filters. Try adjusting your search criteria."
              : "Check back later for new player auctions."}
          </p>
        </div>
      )}
    </div>
  );
}
