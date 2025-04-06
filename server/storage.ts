import { 
  users, type User, type InsertUser,
  players, type Player, type InsertPlayer, type UpdatePlayer,
  auctions, type Auction, type InsertAuction, type AdminCreateAuction, type UpdateAuctionStatus,
  bids, type Bid, type InsertBid,
  watchlist, type WatchlistItem, type InsertWatchlistItem,
  type ReleasePlayer
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: number): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllAdmins(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
  getPlayersByUserId(userId: number): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerOwner(id: number, userId: number | null): Promise<Player | undefined>;
  updatePlayer(id: number, updates: UpdatePlayer): Promise<Player | undefined>;
  getReleasedPlayers(): Promise<Player[]>;
  releasePlayer(playerId: number): Promise<Player | undefined>;
  setPlayerAuctionAvailability(playerId: number, available: boolean): Promise<Player | undefined>;
  
  // Auction methods
  getAuction(id: number): Promise<Auction | undefined>;
  getAllAuctions(status?: string): Promise<Auction[]>;
  getLiveAuctions(): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuction(id: number, updates: Partial<Auction>): Promise<Auction | undefined>;
  adminCreateAuction(auction: AdminCreateAuction): Promise<Auction>;
  updateAuctionStatus(auctionId: number, status: string): Promise<Auction | undefined>;
  
  // Bid methods
  getBid(id: number): Promise<Bid | undefined>;
  getBidsByAuctionId(auctionId: number): Promise<Bid[]>;
  getBidsByUserId(userId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  getHighestBidForAuction(auctionId: number): Promise<Bid | undefined>;
  
  // Watchlist methods
  getWatchlistItemsByUserId(userId: number): Promise<WatchlistItem[]>;
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: number, playerId: number): Promise<boolean>;
  getWatchlistWithPlayers(userId: number): Promise<(WatchlistItem & {player: Player})[]>;
  
  // Combined data methods
  getAuctionsWithPlayerDetails(): Promise<(Auction & {player: Player})[]>;
  getAuctionHistory(): Promise<(Auction & {player: Player, winner: User | null})[]>;
  getUserBidsWithDetails(userId: number): Promise<(Bid & {auction: Auction, player: Player})[]>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private playersData: Map<number, Player>;
  private auctionsData: Map<number, Auction>;
  private bidsData: Map<number, Bid>;
  private watchlistData: Map<number, WatchlistItem>;
  
  // Method to get all users
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }
  
  private nextUserId: number;
  private nextPlayerId: number;
  private nextAuctionId: number;
  private nextBidId: number;
  private nextWatchlistId: number;
  
  constructor() {
    this.usersData = new Map();
    this.playersData = new Map();
    this.auctionsData = new Map();
    this.bidsData = new Map();
    this.watchlistData = new Map();
    
    this.nextUserId = 1;
    this.nextPlayerId = 1;
    this.nextAuctionId = 1;
    this.nextBidId = 1;
    this.nextWatchlistId = 1;
    
    // Add some initial data
    this.seedData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    
    // Ensure required fields have default values
    const user: User = { 
      ...userData, 
      id, 
      balance: userData.balance || 10000, // Default starting balance
      avatarUrl: userData.avatarUrl || null,
      isAdmin: userData.isAdmin || null,
      createdAt: new Date()
    };
    
    this.usersData.set(id, user);
    return user;
  }
  
  async updateUserBalance(id: number, balance: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllAdmins(): Promise<User[]> {
    return Array.from(this.usersData.values()).filter(
      (user) => user.isAdmin === true
    );
  }
  
  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.playersData.get(id);
  }
  
  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.playersData.values());
  }
  
  async getPlayersByUserId(userId: number): Promise<Player[]> {
    return Array.from(this.playersData.values()).filter(
      (player) => player.userId === userId
    );
  }
  
  async createPlayer(playerData: InsertPlayer): Promise<Player> {
    const id = this.nextPlayerId++;
    
    // Ensure required fields have default values
    const player: Player = {
      ...playerData,
      id,
      userId: playerData.userId || null,
      leadership: playerData.leadership || null,
      teamCoordination: playerData.teamCoordination || null,
      mapAwareness: playerData.mapAwareness || null,
      survivalSkills: playerData.survivalSkills || null,
      resourceManagement: playerData.resourceManagement || null,
      combat: playerData.combat || null,
      isActive: playerData.isActive ?? true,
      isReleased: playerData.isReleased ?? false,
      availableForAuction: playerData.availableForAuction ?? null
    };
    
    this.playersData.set(id, player);
    return player;
  }
  
  async updatePlayerOwner(id: number, userId: number | null): Promise<Player | undefined> {
    const player = await this.getPlayer(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, userId };
    this.playersData.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  async updatePlayer(id: number, updates: UpdatePlayer): Promise<Player | undefined> {
    const player = await this.getPlayer(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.playersData.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  async getReleasedPlayers(): Promise<Player[]> {
    return Array.from(this.playersData.values()).filter(
      (player) => player.isReleased === true
    );
  }
  
  async releasePlayer(playerId: number): Promise<Player | undefined> {
    const player = await this.getPlayer(playerId);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, isReleased: true, userId: null };
    this.playersData.set(playerId, updatedPlayer);
    return updatedPlayer;
  }
  
  async setPlayerAuctionAvailability(playerId: number, available: boolean): Promise<Player | undefined> {
    const player = await this.getPlayer(playerId);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, availableForAuction: available };
    this.playersData.set(playerId, updatedPlayer);
    return updatedPlayer;
  }
  
  // Auction methods
  async getAuction(id: number): Promise<Auction | undefined> {
    return this.auctionsData.get(id);
  }
  
  async getAllAuctions(status?: string): Promise<Auction[]> {
    let auctions = Array.from(this.auctionsData.values());
    if (status) {
      auctions = auctions.filter(auction => auction.status === status);
    }
    return auctions;
  }
  
  async getLiveAuctions(): Promise<Auction[]> {
    const now = new Date();
    return Array.from(this.auctionsData.values()).filter(
      (auction) => auction.status === "active" && new Date(auction.endTime) > now
    );
  }
  
  async createAuction(auctionData: InsertAuction): Promise<Auction> {
    const id = this.nextAuctionId++;
    const auction: Auction = { 
      ...auctionData, 
      id, 
      startTime: new Date(),
      status: "active",
      currentWinnerId: auctionData.currentWinnerId || null
    };
    this.auctionsData.set(id, auction);
    return auction;
  }
  
  async updateAuction(id: number, updates: Partial<Auction>): Promise<Auction | undefined> {
    const auction = await this.getAuction(id);
    if (!auction) return undefined;
    
    const updatedAuction = { ...auction, ...updates };
    this.auctionsData.set(id, updatedAuction);
    return updatedAuction;
  }
  
  async adminCreateAuction(auctionData: AdminCreateAuction): Promise<Auction> {
    const id = this.nextAuctionId++;
    const auction: Auction = { 
      playerId: auctionData.playerId,
      startingPrice: auctionData.startingPrice,
      currentPrice: auctionData.startingPrice,
      endTime: new Date(auctionData.endTime), 
      id, 
      startTime: new Date(),
      status: "active",
      currentWinnerId: null 
    };
    this.auctionsData.set(id, auction);
    return auction;
  }
  
  async updateAuctionStatus(auctionId: number, status: string): Promise<Auction | undefined> {
    return this.updateAuction(auctionId, { status });
  }
  
  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    return this.bidsData.get(id);
  }
  
  async getBidsByAuctionId(auctionId: number): Promise<Bid[]> {
    return Array.from(this.bidsData.values()).filter(
      (bid) => bid.auctionId === auctionId
    );
  }
  
  async getBidsByUserId(userId: number): Promise<Bid[]> {
    return Array.from(this.bidsData.values()).filter(
      (bid) => bid.userId === userId
    );
  }
  
  async createBid(bidData: InsertBid): Promise<Bid> {
    const id = this.nextBidId++;
    const bid: Bid = { ...bidData, id, timestamp: new Date() };
    this.bidsData.set(id, bid);
    return bid;
  }
  
  async getHighestBidForAuction(auctionId: number): Promise<Bid | undefined> {
    const bids = await this.getBidsByAuctionId(auctionId);
    if (bids.length === 0) return undefined;
    
    return bids.reduce((highest, current) => 
      current.amount > highest.amount ? current : highest
    );
  }
  
  // Watchlist methods
  async getWatchlistItemsByUserId(userId: number): Promise<WatchlistItem[]> {
    return Array.from(this.watchlistData.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async addToWatchlist(itemData: InsertWatchlistItem): Promise<WatchlistItem> {
    // Check if already exists
    const existing = Array.from(this.watchlistData.values()).find(
      item => item.userId === itemData.userId && item.playerId === itemData.playerId
    );
    
    if (existing) return existing;
    
    // Otherwise create new
    const id = this.nextWatchlistId++;
    const item: WatchlistItem = { ...itemData, id };
    this.watchlistData.set(id, item);
    return item;
  }
  
  async removeFromWatchlist(userId: number, playerId: number): Promise<boolean> {
    const item = Array.from(this.watchlistData.values()).find(
      (i) => i.userId === userId && i.playerId === playerId
    );
    
    if (!item) return false;
    
    this.watchlistData.delete(item.id);
    return true;
  }
  
  async getWatchlistWithPlayers(userId: number): Promise<(WatchlistItem & {player: Player})[]> {
    const watchlistItems = await this.getWatchlistItemsByUserId(userId);
    return Promise.all(
      watchlistItems.map(async (item) => {
        const player = await this.getPlayer(item.playerId);
        return { ...item, player: player! };
      })
    );
  }
  
  // Combined data methods
  async getAuctionsWithPlayerDetails(): Promise<(Auction & {player: Player})[]> {
    const auctions = await this.getAllAuctions();
    return Promise.all(
      auctions.map(async (auction) => {
        const player = await this.getPlayer(auction.playerId);
        return { ...auction, player: player! };
      })
    );
  }
  
  async getAuctionHistory(): Promise<(Auction & {player: Player, winner: User | null})[]> {
    const completedAuctions = await this.getAllAuctions("completed");
    return Promise.all(
      completedAuctions.map(async (auction) => {
        const player = await this.getPlayer(auction.playerId);
        const winner = auction.currentWinnerId 
          ? await this.getUser(auction.currentWinnerId)
          : null;
        
        return { 
          ...auction, 
          player: player!, 
          winner 
        };
      })
    );
  }
  
  async getUserBidsWithDetails(userId: number): Promise<(Bid & {auction: Auction, player: Player})[]> {
    const userBids = await this.getBidsByUserId(userId);
    return Promise.all(
      userBids.map(async (bid) => {
        const auction = await this.getAuction(bid.auctionId);
        const player = auction ? await this.getPlayer(auction.playerId) : null;
        
        if (!auction || !player) {
          throw new Error("Auction or player not found");
        }
        
        return { 
          ...bid, 
          auction, 
          player 
        };
      })
    );
  }
  
  // Seed some initial data for testing
  private seedData() {
    // Create users/team leaders
    const user1: User = {
      id: this.nextUserId++,
      username: "alexmorgan",
      password: "password123",
      teamName: "Team Apex",
      balance: 24500,
      avatarUrl: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80",
      isAdmin: false,
      createdAt: new Date()
    };
    this.usersData.set(user1.id, user1);
    
    const user2: User = {
      id: this.nextUserId++,
      username: "sarahkim",
      password: "password123",
      teamName: "Team Titans",
      balance: 28000,
      avatarUrl: "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
      isAdmin: false,
      createdAt: new Date()
    };
    this.usersData.set(user2.id, user2);
    
    const user3: User = {
      id: this.nextUserId++,
      username: "mikejohnson",
      password: "password123",
      teamName: "Phoenix Gaming",
      balance: 30000,
      avatarUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
      isAdmin: false,
      createdAt: new Date()
    };
    
    // Create an admin user
    const adminUser: User = {
      id: this.nextUserId++,
      username: "admin",
      password: "admin123",
      teamName: "Game Admin",
      balance: 0,
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
      isAdmin: true,
      createdAt: new Date()
    };
    this.usersData.set(user3.id, user3);
    this.usersData.set(adminUser.id, adminUser);
    
    // Create players
    const players: Partial<Player>[] = [
      {
        id: this.nextPlayerId++,
        username: "DarkKnight",
        realName: "Alex Wong",
        specialty: "Team Captain",
        level: 82,
        accuracy: 85,
        reactionTime: 90,
        strategy: 85,
        leadership: 95,
        teamCoordination: 92,
        winRate: 72,
        experience: 5,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1561518776-e76a5e48f731?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user1.id,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "NeonBlade",
        realName: "Emily Chen",
        specialty: "Support",
        level: 65,
        accuracy: 78,
        reactionTime: 80,
        strategy: 92,
        teamCoordination: 95,
        mapAwareness: 85,
        winRate: 68,
        experience: 3,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user1.id,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "PhoenixFire",
        realName: "James Wilson",
        specialty: "DPS",
        level: 78,
        accuracy: 92,
        reactionTime: 88,
        strategy: 75,
        combat: 94,
        winRate: 75,
        experience: 4,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user1.id,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "ShadowStrike",
        realName: "Sofia Martinez",
        specialty: "Flanker",
        level: 56,
        accuracy: 85,
        reactionTime: 90,
        strategy: 70,
        combat: 88,
        winRate: 62,
        experience: 2,
        rating: 4.2,
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user1.id,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "Sniper42",
        realName: "Marcus Chen",
        specialty: "FPS Expert",
        level: 68,
        accuracy: 92,
        reactionTime: 88,
        strategy: 78,
        combat: 90,
        winRate: 70,
        experience: 3,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        userId: null,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "LegendaryTank",
        realName: "Sarah Kim",
        specialty: "MOBA Captain",
        level: 75,
        accuracy: 83,
        reactionTime: 80,
        strategy: 94,
        leadership: 95,
        teamCoordination: 90,
        mapAwareness: 98,
        winRate: 85,
        experience: 5,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        userId: null,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "VictoryRoyale",
        realName: "Michael Johnson",
        specialty: "Battle Royale",
        level: 70,
        survivalSkills: 94,
        resourceManagement: 85,
        combat: 91,
        accuracy: 87,
        reactionTime: 82,
        strategy: 88,
        winRate: 72,
        experience: 4,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1627240349996-49e08a093aa2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        userId: null,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "StealthNinja",
        realName: "Ryan Park",
        specialty: "Tactical FPS",
        level: 65,
        accuracy: 90,
        reactionTime: 92,
        strategy: 86,
        combat: 88,
        winRate: 78,
        experience: 3,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user2.id,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "BattleMage",
        realName: "Lisa Wang",
        specialty: "MOBA",
        level: 62,
        accuracy: 82,
        reactionTime: 80,
        strategy: 90,
        leadership: 88,
        mapAwareness: 85,
        winRate: 70,
        experience: 2,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1548449112-96a38a643324?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user1.id,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "FrostArcher",
        realName: "Emma Davis",
        specialty: "Battle Royale",
        level: 58,
        survivalSkills: 85,
        resourceManagement: 88,
        combat: 80,
        accuracy: 92,
        reactionTime: 78,
        strategy: 75,
        winRate: 65,
        experience: 2,
        rating: 4.3,
        imageUrl: "https://images.unsplash.com/photo-1567250671670-05e34d114ae4?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user3.id,
        isActive: true
      },
      {
        id: this.nextPlayerId++,
        username: "DigitalWizard",
        realName: "Daniel Lee",
        specialty: "RTS",
        level: 72,
        accuracy: 75,
        reactionTime: 90,
        strategy: 96,
        leadership: 85,
        mapAwareness: 92,
        winRate: 75,
        experience: 4,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80",
        userId: user1.id,
        isActive: true
      }
    ];
    
    // Add all players to the storage
    players.forEach(player => {
      this.playersData.set(player.id!, player as Player);
    });
    
    // Create active auctions
    const now = new Date();
    
    // Create active auctions for the unassigned players
    this.createAuction({
      playerId: 5, // Sniper42
      startingPrice: 5000,
      currentPrice: 8750,
      currentWinnerId: user1.id,
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    });
    
    this.createAuction({
      playerId: 6, // LegendaryTank
      startingPrice: 6000,
      currentPrice: 12350,
      currentWinnerId: user3.id,
      endTime: new Date(now.getTime() + 90 * 60 * 1000) // 1.5 hours from now
    });
    
    this.createAuction({
      playerId: 7, // VictoryRoyale
      startingPrice: 5500,
      currentPrice: 9875,
      currentWinnerId: user2.id,
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000) // 3 hours from now
    });
    
    // Create some completed auctions for history
    const completedAuction1 = this.createAuction({
      playerId: 8, // StealthNinja
      startingPrice: 7000,
      currentPrice: 14250,
      currentWinnerId: user2.id,
      endTime: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    });
    
    const completedAuction2 = this.createAuction({
      playerId: 9, // BattleMage
      startingPrice: 5000,
      currentPrice: 9750,
      currentWinnerId: user1.id,
      endTime: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
    });
    
    const completedAuction3 = this.createAuction({
      playerId: 10, // FrostArcher
      startingPrice: 6000,
      currentPrice: 11200,
      currentWinnerId: user3.id,
      endTime: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000) // 50 days ago
    });
    
    const completedAuction4 = this.createAuction({
      playerId: 11, // DigitalWizard
      startingPrice: 4000,
      currentPrice: 8500,
      currentWinnerId: user1.id,
      endTime: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
    });
    
    // Mark completed auctions
    [completedAuction1, completedAuction2, completedAuction3, completedAuction4].forEach(async auction => {
      this.updateAuction(auction.id, { status: "completed" });
    });
    
    // Create some bids for active auctions
    // Auction 1 bids
    this.createBid({
      auctionId: 1,
      userId: user1.id,
      amount: 6000
    });
    
    this.createBid({
      auctionId: 1,
      userId: user2.id,
      amount: 7500
    });
    
    this.createBid({
      auctionId: 1,
      userId: user1.id,
      amount: 8750
    });
    
    // Auction 2 bids
    this.createBid({
      auctionId: 2,
      userId: user3.id,
      amount: 8000
    });
    
    this.createBid({
      auctionId: 2,
      userId: user1.id,
      amount: 10000
    });
    
    this.createBid({
      auctionId: 2,
      userId: user3.id,
      amount: 12350
    });
    
    // Auction 3 bids
    this.createBid({
      auctionId: 3,
      userId: user2.id,
      amount: 7000
    });
    
    this.createBid({
      auctionId: 3,
      userId: user1.id,
      amount: 8500
    });
    
    this.createBid({
      auctionId: 3,
      userId: user2.id,
      amount: 9875
    });
    
    // Some bids for completed auctions
    this.createBid({
      auctionId: 4,
      userId: user1.id,
      amount: 13800
    });
    
    this.createBid({
      auctionId: 4,
      userId: user2.id,
      amount: 14250
    });
    
    this.createBid({
      auctionId: 5,
      userId: user1.id,
      amount: 9750
    });
    
    this.createBid({
      auctionId: 6,
      userId: user1.id,
      amount: 10500
    });
    
    this.createBid({
      auctionId: 6,
      userId: user3.id,
      amount: 11200
    });
    
    this.createBid({
      auctionId: 7,
      userId: user1.id,
      amount: 8500
    });
    
    // Add some watchlist items
    this.addToWatchlist({
      userId: user1.id,
      playerId: 5 // Sniper42
    });
    
    this.addToWatchlist({
      userId: user1.id,
      playerId: 6 // LegendaryTank
    });
  }
}

// Import storage from the storage/index.ts file 
export { storage } from "./storage/index";
