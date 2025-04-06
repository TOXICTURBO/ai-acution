import { 
  User, InsertUser, Player, InsertPlayer, UpdatePlayer, 
  Auction, InsertAuction, Bid, InsertBid, WatchlistItem, 
  InsertWatchlistItem, AdminCreateAuction
} from "@shared/schema";
import { db } from "../db";
import { 
  users, players, auctions, bids, watchlist
} from "@shared/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import type { IStorage } from "./interface";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;

// Connection pool for session store
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Session store with PostgreSQL
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, balance: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ balance })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllAdmins(): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true));
  }

  async getAllUsers(): Promise<User[]> {
    return db
      .select()
      .from(users);
  }

  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id));
    return player;
  }

  async getAllPlayers(): Promise<Player[]> {
    return db
      .select()
      .from(players);
  }

  async getPlayersByUserId(userId: number): Promise<Player[]> {
    return db
      .select()
      .from(players)
      .where(eq(players.userId, userId));
  }

  async createPlayer(playerData: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(playerData)
      .returning();
    return player;
  }

  async updatePlayerOwner(id: number, userId: number | null): Promise<Player | undefined> {
    const [updatedPlayer] = await db
      .update(players)
      .set({ userId })
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer;
  }

  async updatePlayer(id: number, updates: UpdatePlayer): Promise<Player | undefined> {
    const [updatedPlayer] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer;
  }

  async getReleasedPlayers(): Promise<Player[]> {
    return db
      .select()
      .from(players)
      .where(eq(players.isReleased, true));
  }

  async releasePlayer(playerId: number): Promise<Player | undefined> {
    const [updatedPlayer] = await db
      .update(players)
      .set({ isReleased: true, userId: null })
      .where(eq(players.id, playerId))
      .returning();
    return updatedPlayer;
  }

  async setPlayerAuctionAvailability(playerId: number, available: boolean): Promise<Player | undefined> {
    const [updatedPlayer] = await db
      .update(players)
      .set({ availableForAuction: available })
      .where(eq(players.id, playerId))
      .returning();
    return updatedPlayer;
  }

  // Auction methods
  async getAuction(id: number): Promise<Auction | undefined> {
    const [auction] = await db
      .select()
      .from(auctions)
      .where(eq(auctions.id, id));
    return auction;
  }

  async getAllAuctions(status?: string): Promise<Auction[]> {
    if (status) {
      return db
        .select()
        .from(auctions)
        .where(eq(auctions.status, status));
    }
    return db.select().from(auctions);
  }

  async getLiveAuctions(): Promise<Auction[]> {
    const now = new Date();
    return db
      .select()
      .from(auctions)
      .where(
        and(
          eq(auctions.status, "active"),
          sql`${auctions.endTime} > ${now}`
        )
      );
  }

  async createAuction(auctionData: InsertAuction): Promise<Auction> {
    const [auction] = await db
      .insert(auctions)
      .values({
        ...auctionData,
        status: "active", 
        startTime: new Date() 
      })
      .returning();
    return auction;
  }

  async updateAuction(id: number, updates: Partial<Auction>): Promise<Auction | undefined> {
    const [updatedAuction] = await db
      .update(auctions)
      .set(updates)
      .where(eq(auctions.id, id))
      .returning();
    return updatedAuction;
  }

  async adminCreateAuction(auctionData: AdminCreateAuction): Promise<Auction> {
    const [auction] = await db
      .insert(auctions)
      .values({
        playerId: auctionData.playerId,
        startingPrice: auctionData.startingPrice,
        currentPrice: auctionData.startingPrice,
        endTime: new Date(auctionData.endTime),
        startTime: new Date(),
        status: "active"
      })
      .returning();
    return auction;
  }

  async updateAuctionStatus(auctionId: number, status: string): Promise<Auction | undefined> {
    const [updatedAuction] = await db
      .update(auctions)
      .set({ status })
      .where(eq(auctions.id, auctionId))
      .returning();
    return updatedAuction;
  }

  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, id));
    return bid;
  }

  async getBidsByAuctionId(auctionId: number): Promise<Bid[]> {
    return db
      .select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId));
  }

  async getBidsByUserId(userId: number): Promise<Bid[]> {
    return db
      .select()
      .from(bids)
      .where(eq(bids.userId, userId));
  }

  async createBid(bidData: InsertBid): Promise<Bid> {
    const [bid] = await db
      .insert(bids)
      .values({
        ...bidData,
        timestamp: new Date()
      })
      .returning();
    return bid;
  }

  async getHighestBidForAuction(auctionId: number): Promise<Bid | undefined> {
    const [highestBid] = await db
      .select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId))
      .orderBy(desc(bids.amount))
      .limit(1);
    return highestBid;
  }

  // Watchlist methods
  async getWatchlistItemsByUserId(userId: number): Promise<WatchlistItem[]> {
    return db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, userId));
  }

  async addToWatchlist(itemData: InsertWatchlistItem): Promise<WatchlistItem> {
    // Check if already exists
    const [existing] = await db
      .select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, itemData.userId),
          eq(watchlist.playerId, itemData.playerId)
        )
      );
    
    if (existing) return existing;

    // Otherwise create new
    const [item] = await db
      .insert(watchlist)
      .values(itemData)
      .returning();
    return item;
  }

  async removeFromWatchlist(userId: number, playerId: number): Promise<boolean> {
    const result = await db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.playerId, playerId)
        )
      );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getWatchlistWithPlayers(userId: number): Promise<(WatchlistItem & {player: Player})[]> {
    // Get watchlist items
    const watchlistItems = await this.getWatchlistItemsByUserId(userId);
    
    // Get player details for each item
    const result = [];
    for (const item of watchlistItems) {
      const player = await this.getPlayer(item.playerId);
      if (player) {
        result.push({ ...item, player });
      }
    }
    
    return result;
  }

  // Combined data methods
  async getAuctionsWithPlayerDetails(): Promise<(Auction & {player: Player})[]> {
    // Get all auctions
    const allAuctions = await this.getAllAuctions();
    
    // Get player details for each auction
    const result = [];
    for (const auction of allAuctions) {
      const player = await this.getPlayer(auction.playerId);
      if (player) {
        result.push({ ...auction, player });
      }
    }
    
    return result;
  }

  async getAuctionHistory(): Promise<(Auction & {player: Player, winner: User | null})[]> {
    // Get completed auctions
    const completedAuctions = await this.getAllAuctions("completed");
    
    // Get player and winner details for each auction
    const result = [];
    for (const auction of completedAuctions) {
      const player = await this.getPlayer(auction.playerId);
      let winner = null;
      
      if (auction.currentWinnerId) {
        winner = await this.getUser(auction.currentWinnerId);
      }
      
      if (player) {
        result.push({ ...auction, player, winner });
      }
    }
    
    return result;
  }

  async getUserBidsWithDetails(userId: number): Promise<(Bid & {auction: Auction, player: Player})[]> {
    // Get all bids for user
    const userBids = await this.getBidsByUserId(userId);
    
    // Get auction and player details for each bid
    const result = [];
    for (const bid of userBids) {
      const auction = await this.getAuction(bid.auctionId);
      
      if (auction) {
        const player = await this.getPlayer(auction.playerId);
        
        if (player) {
          result.push({ ...bid, auction, player });
        }
      }
    }
    
    return result;
  }
}