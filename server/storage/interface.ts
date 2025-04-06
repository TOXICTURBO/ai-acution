import { 
  User, InsertUser, Player, InsertPlayer, UpdatePlayer, 
  Auction, InsertAuction, Bid, InsertBid, WatchlistItem, 
  InsertWatchlistItem, AdminCreateAuction 
} from "@shared/schema";
import session from "express-session";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
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