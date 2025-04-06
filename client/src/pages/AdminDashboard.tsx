import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("teams");
  
  // Team Management State
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [fundAmount, setFundAmount] = useState<number>(1000);
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<any[]>([]);
  
  // Auction Management State
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [startingPrice, setStartingPrice] = useState<number>(5000);
  const [auctionDuration, setAuctionDuration] = useState<number>(24);
  const [selectedAuction, setSelectedAuction] = useState<string>("");
  
  // Add Player State
  const [newPlayer, setNewPlayer] = useState({
    username: "",
    realName: "",
    specialty: "",
    level: 50,
    accuracy: 50,
    reactionTime: 50,
    strategy: 50,
    leadership: 50,
    teamCoordination: 50,
    winRate: 50,
    experience: 1,
    rating: 3.0,
    imageUrl: ""
  });
  
  // Fetch Teams
  const { data: teams } = useQuery({
    queryKey: ["/api/admin/teams"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/teams", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch teams");
        return await response.json();
      } catch (error) {
        // Return empty array as fallback for development
        console.error("Error fetching teams:", error);
        return [];
      }
    },
  });
  
  // Fetch team players when a team is selected
  const { data: teamPlayers } = useQuery({
    queryKey: ["/api/admin/teams", selectedTeam, "players"],
    queryFn: async () => {
      if (!selectedTeam) return [];
      
      try {
        const response = await fetch(`/api/admin/teams/${selectedTeam}/players`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch team players");
        return await response.json();
      } catch (error) {
        console.error("Error fetching team players:", error);
        return [];
      }
    },
    enabled: !!selectedTeam, // Only run the query when a team is selected
  });

  // Fetch Released Players
  const { data: releasedPlayers } = useQuery({
    queryKey: ["/api/admin/players/released"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/players/released", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch released players");
        return await response.json();
      } catch (error) {
        // Return empty array as fallback for development
        console.error("Error fetching released players:", error);
        return [];
      }
    },
  });

  // Fetch Active Auctions
  const { data: activeAuctions } = useQuery({
    queryKey: ["/api/auctions/live"],
  });

  // Add Funds Mutation
  const addFundsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTeam || fundAmount <= 0) {
        throw new Error("Invalid team or amount");
      }
      const response = await apiRequest("POST", "/api/admin/teams/add-funds", {
        userId: parseInt(selectedTeam),
        amount: fundAmount,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds Added",
        description: `$${fundAmount.toLocaleString()} added to the selected team.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      setSelectedTeam("");
      setFundAmount(1000);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create Auction Mutation
  const createAuctionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayer || startingPrice <= 0) {
        throw new Error("Invalid player or starting price");
      }
      const response = await apiRequest("POST", "/api/admin/auctions/create", {
        playerId: parseInt(selectedPlayer),
        startingPrice,
        duration: auctionDuration, // in hours
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Auction Created",
        description: "Player auction has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players/released"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/live"] });
      setSelectedPlayer("");
      setStartingPrice(5000);
      setAuctionDuration(24);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create auction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // End Auction Mutation
  const endAuctionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAuction) {
        throw new Error("No auction selected");
      }
      const response = await apiRequest("POST", "/api/admin/auctions/end", {
        auctionId: parseInt(selectedAuction),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Auction Ended",
        description: "The auction has been ended and player assigned to the winner.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/live"] });
      setSelectedAuction("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to end auction",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add New Player Mutation
  const addPlayerMutation = useMutation({
    mutationFn: async () => {
      // Validate required fields
      if (!newPlayer.username || !newPlayer.realName || !newPlayer.specialty) {
        throw new Error("Username, real name, and specialty are required");
      }
      
      const response = await apiRequest("POST", "/api/admin/players/create", newPlayer);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Player Created",
        description: "New player has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players/released"] });
      
      // Reset form
      setNewPlayer({
        username: "",
        realName: "",
        specialty: "",
        level: 50,
        accuracy: 50,
        reactionTime: 50,
        strategy: 50,
        leadership: 50,
        teamCoordination: 50,
        winRate: 50,
        experience: 1,
        rating: 3.0,
        imageUrl: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create player",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Force Release Player Mutation
  const forceReleasePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const response = await apiRequest("POST", `/api/admin/players/${playerId}/force-release`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Player Released",
        description: "Player has been forcefully released from the team.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams", selectedTeam, "players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players/released"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to release player",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-neon-cyan glow-text mb-6">Admin Control Panel</h1>
      
      <Tabs 
        defaultValue="teams" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="teams" 
            className="text-light-cyan data-[state=active]:text-neon-cyan data-[state=active]:glow-text"
          >
            Team Management
          </TabsTrigger>
          <TabsTrigger 
            value="auctions" 
            className="text-light-cyan data-[state=active]:text-neon-cyan data-[state=active]:glow-text"
          >
            Auction Control
          </TabsTrigger>
          <TabsTrigger 
            value="players" 
            className="text-light-cyan data-[state=active]:text-neon-cyan data-[state=active]:glow-text"
          >
            Player Management
          </TabsTrigger>
        </TabsList>
        
        {/* Team Management Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Funds Card */}
            <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Add Funds to Team</CardTitle>
                <CardDescription className="text-light-cyan/70">
                  Increase a team's balance to allow them to participate in auctions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-select" className="text-light-cyan">Select Team</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams && teams.length > 0 ? (
                        teams.map((team: any) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.teamName} ({team.username})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-teams" disabled>
                          No teams available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fund-amount" className="text-light-cyan">Amount ($)</Label>
                  <Input
                    id="fund-amount"
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(Number(e.target.value))}
                    min={1}
                    step={1000}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => addFundsMutation.mutate()}
                  disabled={!selectedTeam || fundAmount <= 0 || addFundsMutation.isPending}
                  className="cyber-btn w-full"
                >
                  {addFundsMutation.isPending ? "Processing..." : "Add Funds"}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Team List Card */}
            <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Registered Teams</CardTitle>
                <CardDescription className="text-light-cyan/70">
                  List of all registered teams and their current balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-card-border">
                  <div className="grid grid-cols-4 bg-darkest-teal/60 p-3 text-xs font-medium text-light-cyan">
                    <div>Team</div>
                    <div>Manager</div>
                    <div>Balance</div>
                    <div>Players</div>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {teams && teams.length > 0 ? (
                      teams.map((team: any) => (
                        <div 
                          key={team.id} 
                          className="grid grid-cols-4 p-3 text-sm border-t border-card-border hover:bg-dark-teal/20"
                        >
                          <div className="text-light-cyan">{team.teamName}</div>
                          <div className="text-light-cyan/70">{team.username}</div>
                          <div className="text-neon-cyan">${team.balance.toLocaleString()}</div>
                          <div className="text-light-cyan">{team.playerCount || 0}/5</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-light-cyan/50">
                        No teams registered
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Team Players Card */}
          {selectedTeam && (
            <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Team Players</CardTitle>
                <CardDescription className="text-light-cyan/70">
                  {teams && teams.find((team: any) => team.id.toString() === selectedTeam)?.teamName || "Selected Team"}'s players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-card-border">
                  <div className="grid grid-cols-6 bg-darkest-teal/60 p-3 text-xs font-medium text-light-cyan">
                    <div>Player</div>
                    <div>Specialty</div>
                    <div>Level</div>
                    <div>Accuracy</div>
                    <div>Rating</div>
                    <div>Actions</div>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {teamPlayers && teamPlayers.length > 0 ? (
                      teamPlayers.map((player: any) => (
                        <div 
                          key={player.id} 
                          className="grid grid-cols-6 p-3 text-sm border-t border-card-border hover:bg-dark-teal/20"
                        >
                          <div className="text-light-cyan">{player.username}</div>
                          <div className="text-light-cyan/70">{player.specialty}</div>
                          <div className="text-neon-cyan">{player.level}</div>
                          <div className="text-light-cyan">{player.accuracy}%</div>
                          <div className="text-light-cyan">{player.rating} ★</div>
                          <div>
                            <Button
                              onClick={() => forceReleasePlayerMutation.mutate(player.id)}
                              disabled={forceReleasePlayerMutation.isPending}
                              variant="destructive"
                              size="sm"
                            >
                              Release
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-light-cyan/50">
                        No players on this team
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Auction Control Tab */}
        <TabsContent value="auctions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Auction Card */}
            <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Create New Auction</CardTitle>
                <CardDescription className="text-light-cyan/70">
                  Select a released player and set up an auction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="player-select" className="text-light-cyan">Select Player</Label>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {releasedPlayers && releasedPlayers.length > 0 ? (
                        releasedPlayers.map((player: any) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.username} ({player.specialty})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-players" disabled>
                          No released players available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="starting-price" className="text-light-cyan">Starting Price ($)</Label>
                  <Input
                    id="starting-price"
                    type="number"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    min={100}
                    step={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auction-duration" className="text-light-cyan">Duration (hours)</Label>
                  <Input
                    id="auction-duration"
                    type="number"
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(Number(e.target.value))}
                    min={1}
                    max={72}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => createAuctionMutation.mutate()}
                  disabled={!selectedPlayer || startingPrice <= 0 || createAuctionMutation.isPending}
                  className="cyber-btn w-full"
                >
                  {createAuctionMutation.isPending ? "Processing..." : "Create Auction"}
                </Button>
              </CardFooter>
            </Card>
            
            {/* End Auction Card */}
            <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Manage Live Auctions</CardTitle>
                <CardDescription className="text-light-cyan/70">
                  End an active auction immediately and assign the player
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auction-select" className="text-light-cyan">Select Auction</Label>
                  <Select value={selectedAuction} onValueChange={setSelectedAuction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an auction" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAuctions && activeAuctions.length > 0 ? (
                        activeAuctions.map((auction: any) => (
                          <SelectItem key={auction.id} value={auction.id.toString()}>
                            {auction.player.username} - ${auction.currentPrice.toLocaleString()}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-auctions" disabled>
                          No active auctions
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  onClick={() => endAuctionMutation.mutate()}
                  disabled={!selectedAuction || endAuctionMutation.isPending}
                  className="cyber-btn-red w-full"
                >
                  {endAuctionMutation.isPending ? "Processing..." : "End Auction Now"}
                </Button>
                <p className="text-xs text-light-cyan/50 text-center">
                  This will immediately end the auction, assign the player to the highest bidder,
                  and deduct the bid amount from their balance.
                </p>
              </CardFooter>
            </Card>
          </div>
          
          {/* Active Auctions List */}
          <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-neon-cyan">Active Auctions</CardTitle>
              <CardDescription className="text-light-cyan/70">
                Currently running player auctions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-card-border">
                <div className="grid grid-cols-6 bg-darkest-teal/60 p-3 text-xs font-medium text-light-cyan">
                  <div>Player</div>
                  <div>Specialty</div>
                  <div>Current Bid</div>
                  <div>Current Winner</div>
                  <div>Start Time</div>
                  <div>End Time</div>
                </div>
                <div className="max-h-80 overflow-auto">
                  {activeAuctions && activeAuctions.length > 0 ? (
                    activeAuctions.map((auction: any) => (
                      <div 
                        key={auction.id} 
                        className="grid grid-cols-6 p-3 text-sm border-t border-card-border hover:bg-dark-teal/20"
                      >
                        <div className="text-light-cyan">{auction.player.username}</div>
                        <div className="text-light-cyan/70">{auction.player.specialty}</div>
                        <div className="text-neon-cyan">${auction.currentPrice.toLocaleString()}</div>
                        <div className="text-light-cyan">{auction.currentWinnerId ? `ID: ${auction.currentWinnerId}` : "No bids"}</div>
                        <div className="text-light-cyan/70">{new Date(auction.startTime).toLocaleString()}</div>
                        <div className="text-light-cyan/70">{new Date(auction.endTime).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-light-cyan/50">
                      No active auctions
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Player Management Tab */}
        <TabsContent value="players" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add New Player Card */}
            <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Add New Player</CardTitle>
                <CardDescription className="text-light-cyan/70">
                  Create a new player that can be included in auctions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="player-username" className="text-light-cyan">Username</Label>
                  <Input
                    id="player-username"
                    value={newPlayer.username}
                    onChange={(e) => setNewPlayer({...newPlayer, username: e.target.value})}
                    placeholder="e.g. ShadowSlayer"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player-realname" className="text-light-cyan">Real Name</Label>
                  <Input
                    id="player-realname"
                    value={newPlayer.realName}
                    onChange={(e) => setNewPlayer({...newPlayer, realName: e.target.value})}
                    placeholder="e.g. Alex Johnson"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player-specialty" className="text-light-cyan">Specialty</Label>
                  <Input
                    id="player-specialty"
                    value={newPlayer.specialty}
                    onChange={(e) => setNewPlayer({...newPlayer, specialty: e.target.value})}
                    placeholder="e.g. Sniper, Captain, Support"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-level" className="text-light-cyan">Level (1-100)</Label>
                    <Input
                      id="player-level"
                      type="number"
                      value={newPlayer.level}
                      onChange={(e) => setNewPlayer({...newPlayer, level: Number(e.target.value)})}
                      min={1}
                      max={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-rating" className="text-light-cyan">Rating (1-5)</Label>
                    <Input
                      id="player-rating"
                      type="number"
                      value={newPlayer.rating}
                      onChange={(e) => setNewPlayer({...newPlayer, rating: Number(e.target.value)})}
                      min={1}
                      max={5}
                      step={0.1}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-accuracy" className="text-light-cyan">Accuracy (1-100)</Label>
                    <Input
                      id="player-accuracy"
                      type="number"
                      value={newPlayer.accuracy}
                      onChange={(e) => setNewPlayer({...newPlayer, accuracy: Number(e.target.value)})}
                      min={1}
                      max={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-reaction" className="text-light-cyan">Reaction Time (1-100)</Label>
                    <Input
                      id="player-reaction"
                      type="number"
                      value={newPlayer.reactionTime}
                      onChange={(e) => setNewPlayer({...newPlayer, reactionTime: Number(e.target.value)})}
                      min={1}
                      max={100}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player-strategy" className="text-light-cyan">Strategy (1-100)</Label>
                    <Input
                      id="player-strategy"
                      type="number"
                      value={newPlayer.strategy}
                      onChange={(e) => setNewPlayer({...newPlayer, strategy: Number(e.target.value)})}
                      min={1}
                      max={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-win-rate" className="text-light-cyan">Win Rate (%)</Label>
                    <Input
                      id="player-win-rate"
                      type="number"
                      value={newPlayer.winRate}
                      onChange={(e) => setNewPlayer({...newPlayer, winRate: Number(e.target.value)})}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player-experience" className="text-light-cyan">Experience (years)</Label>
                  <Input
                    id="player-experience"
                    type="number"
                    value={newPlayer.experience}
                    onChange={(e) => setNewPlayer({...newPlayer, experience: Number(e.target.value)})}
                    min={0}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player-image" className="text-light-cyan">Image URL (optional)</Label>
                  <Input
                    id="player-image"
                    value={newPlayer.imageUrl || ""}
                    onChange={(e) => setNewPlayer({...newPlayer, imageUrl: e.target.value})}
                    placeholder="https://example.com/player-image.jpg"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => addPlayerMutation.mutate()}
                  disabled={!newPlayer.username || !newPlayer.realName || !newPlayer.specialty || addPlayerMutation.isPending}
                  className="cyber-btn w-full"
                >
                  {addPlayerMutation.isPending ? "Processing..." : "Add Player"}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Rules Management Card - Placeholder for future implementation */}
            <Card className="border-card-border bg-darkest-teal/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Auction Rules</CardTitle>
                <CardDescription className="text-light-cyan/70">
                  Configure global auction settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="min-bid-increment" className="text-light-cyan">Minimum Bid Increment ($)</Label>
                  <Input
                    id="min-bid-increment"
                    type="number"
                    defaultValue={100}
                    min={10}
                    step={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-duration" className="text-light-cyan">Default Auction Duration (hours)</Label>
                  <Input
                    id="default-duration"
                    type="number"
                    defaultValue={24}
                    min={1}
                    max={72}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-team-size" className="text-light-cyan">Maximum Team Size</Label>
                  <Input
                    id="max-team-size"
                    type="number"
                    defaultValue={5}
                    min={1}
                    max={10}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="cyber-btn w-full"
                  disabled={true}
                >
                  Save Rules (Coming Soon)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}