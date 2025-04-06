import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import MemoryStore from "memorystore";
import {
  loginSchema,
  insertUserSchema,
  placeBidSchema,
  insertWatchlistSchema
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    teamName: string;
    isAdmin: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Use session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "gamedraft-secret",
    })
  );

  // Player release endpoint
  app.post("/api/players/:id/release", async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Check if player exists and belongs to the user
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      if (player.userId !== userId) {
        return res.status(403).json({ message: "You don't own this player" });
      }
      
      // Release the player
      const releasedPlayer = await storage.releasePlayer(playerId);
      
      res.status(200).json(releasedPlayer);
    } catch (err) {
      res.status(500).json({ message: "Failed to release player" });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.teamName = user.teamName;
      
      return res.status(201).json({
        id: user.id,
        username: user.username,
        teamName: user.teamName,
        balance: user.balance,
        avatarUrl: user.avatarUrl
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(credentials.username);
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.teamName = user.teamName;
      req.session.isAdmin = user.isAdmin || false;
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        teamName: user.teamName,
        balance: user.balance,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    storage.getUser(req.session.userId)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json({
          id: user.id,
          username: user.username,
          teamName: user.teamName,
          balance: user.balance,
          avatarUrl: user.avatarUrl,
          isAdmin: user.isAdmin
        });
      })
      .catch(err => {
        return res.status(500).json({ message: "Failed to fetch user data" });
      });
  });

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  
  // Middleware to check admin permissions
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: "Admin permissions required" });
    }
    next();
  };
  
  // Admin Routes
  
  // Get all teams
  app.get("/api/admin/teams", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Get all users that are not admins
      const users = await storage.getAllUsers();
      const nonAdminUsers = users.filter(user => !user.isAdmin);
      
      // Get player counts for each team
      const teamsWithPlayerCounts = await Promise.all(
        nonAdminUsers.map(async (user) => {
          const teamPlayers = await storage.getPlayersByUserId(user.id);
          return {
            ...user,
            playerCount: teamPlayers.length
          };
        })
      );
      
      res.status(200).json(teamsWithPlayerCounts);
    } catch (err) {
      console.error("Error fetching teams:", err);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get released players
  app.get("/api/admin/players/released", requireAdmin, async (req: Request, res: Response) => {
    try {
      const releasedPlayers = await storage.getReleasedPlayers();
      res.status(200).json(releasedPlayers);
    } catch (err) {
      console.error("Error fetching released players:", err);
      res.status(500).json({ message: "Failed to fetch released players" });
    }
  });

  // Add funds to a team
  app.post("/api/admin/teams/add-funds", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, amount } = req.body;
      
      if (!userId || typeof userId !== 'number' || !amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid user ID or amount" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = user.balance + amount;
      const updatedUser = await storage.updateUserBalance(userId, newBalance);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user balance" });
      }
      
      res.status(200).json({ 
        message: "Funds added successfully", 
        user: updatedUser 
      });
    } catch (err) {
      console.error("Error adding funds:", err);
      res.status(500).json({ message: "Failed to add funds" });
    }
  });

  // Create a new auction
  app.post("/api/admin/auctions/create", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { playerId, startingPrice, duration } = req.body;
      
      if (!playerId || typeof playerId !== 'number' || 
          !startingPrice || typeof startingPrice !== 'number' || startingPrice <= 0 ||
          !duration || typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({ message: "Invalid auction parameters" });
      }
      
      // Check if player exists and is released
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      if (player.userId !== null) {
        return res.status(400).json({ message: "Player is not available for auction" });
      }
      
      // Create auction with current time as start time and calculated end time
      const now = new Date();
      const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000); // Convert hours to milliseconds
      
      const auction = await storage.adminCreateAuction({
        playerId,
        startingPrice,
        endTime: endTime.toISOString(),
      });
      
      // Update player to mark as in auction
      await storage.setPlayerAuctionAvailability(playerId, true);
      
      res.status(201).json(auction);
    } catch (err) {
      console.error("Error creating auction:", err);
      res.status(500).json({ message: "Failed to create auction" });
    }
  });

  // End an auction
  app.post("/api/admin/auctions/end", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { auctionId } = req.body;
      
      if (!auctionId || typeof auctionId !== 'number') {
        return res.status(400).json({ message: "Invalid auction ID" });
      }
      
      // Get auction
      const auction = await storage.getAuction(auctionId);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Check if auction is active
      if (auction.status !== "active") {
        return res.status(400).json({ message: "Auction is not active" });
      }
      
      // Update auction status to "completed"
      const updatedAuction = await storage.updateAuctionStatus(auctionId, "completed");
      
      // If there's a winner, assign player to them and deduct balance
      if (auction.currentWinnerId && auction.currentWinnerId > 0) {
        // Get the player
        const player = await storage.getPlayer(auction.playerId);
        if (!player) {
          return res.status(500).json({ message: "Player not found" });
        }
        
        // Update player owner
        await storage.updatePlayerOwner(auction.playerId, auction.currentWinnerId);
        
        // Update user balance
        const winner = await storage.getUser(auction.currentWinnerId);
        if (winner) {
          const newBalance = winner.balance - auction.currentPrice;
          await storage.updateUserBalance(auction.currentWinnerId, newBalance);
        }
        
        // Set player auction availability to false
        await storage.setPlayerAuctionAvailability(auction.playerId, false);
      }
      
      res.status(200).json({ 
        message: "Auction ended successfully", 
        auction: updatedAuction 
      });
    } catch (err) {
      console.error("Error ending auction:", err);
      res.status(500).json({ message: "Failed to end auction" });
    }
  });

  // Player routes
  app.get("/api/players", async (req: Request, res: Response) => {
    try {
      const players = await storage.getAllPlayers();
      res.status(200).json(players);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.get("/api/players/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.status(200).json(player);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  // Team routes
  app.get("/api/teams/my-team", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const players = await storage.getPlayersByUserId(userId);
      res.status(200).json(players);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Auction routes
  app.get("/api/auctions", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const auctionsWithDetails = await storage.getAuctionsWithPlayerDetails();
      
      if (status) {
        const filteredAuctions = auctionsWithDetails.filter(auction => auction.status === status);
        return res.status(200).json(filteredAuctions);
      }
      
      res.status(200).json(auctionsWithDetails);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch auctions" });
    }
  });

  app.get("/api/auctions/live", async (req: Request, res: Response) => {
    try {
      const liveAuctions = await storage.getLiveAuctions();
      
      // Get player details for each auction
      const liveAuctionsWithDetails = await Promise.all(
        liveAuctions.map(async (auction) => {
          const player = await storage.getPlayer(auction.playerId);
          return { ...auction, player };
        })
      );
      
      res.status(200).json(liveAuctionsWithDetails);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch live auctions" });
    }
  });

  app.get("/api/auctions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const auction = await storage.getAuction(id);
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      const player = await storage.getPlayer(auction.playerId);
      const bids = await storage.getBidsByAuctionId(id);
      
      res.status(200).json({
        ...auction,
        player,
        bids
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch auction" });
    }
  });

  app.get("/api/auctions/history", async (req: Request, res: Response) => {
    try {
      const history = await storage.getAuctionHistory();
      if (!history || history.length === 0) {
        // Return empty array instead of error when no history exists
        return res.status(200).json([]);
      }
      res.status(200).json(history);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch auction history" });
    }
  });

  // Bid routes
  app.post("/api/bids", requireAuth, async (req: Request, res: Response) => {
    try {
      const { auctionId, amount } = placeBidSchema.parse(req.body);
      const userId = req.session.userId!;
      
      // Get auction
      const auction = await storage.getAuction(auctionId);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Check if auction is active
      if (auction.status !== "active") {
        return res.status(400).json({ message: "Auction is not active" });
      }
      
      // Check if auction has ended
      const now = new Date();
      if (new Date(auction.endTime) < now) {
        return res.status(400).json({ message: "Auction has ended" });
      }
      
      // Check if bid is higher than current price
      if (amount <= auction.currentPrice) {
        return res.status(400).json({ message: "Bid must be higher than current price" });
      }
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user || user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Check if team has space for another player (max 5 players)
      const team = await storage.getPlayersByUserId(userId);
      if (team.length >= 5) {
        return res.status(400).json({ message: "Your team is full (max 5 players)" });
      }
      
      // Create bid
      const bid = await storage.createBid({
        auctionId,
        userId,
        amount
      });
      
      // Update auction with new price and winner
      await storage.updateAuction(auctionId, {
        currentPrice: amount,
        currentWinnerId: userId
      });
      
      res.status(201).json(bid);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Failed to place bid" });
    }
  });

  app.get("/api/bids/my-bids", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const bids = await storage.getUserBidsWithDetails(userId);
      res.status(200).json(bids);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const watchlist = await storage.getWatchlistWithPlayers(userId);
      res.status(200).json(watchlist);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { playerId } = insertWatchlistSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      const watchlistItem = await storage.addToWatchlist({
        userId,
        playerId
      });
      
      res.status(201).json(watchlistItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:playerId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const playerId = parseInt(req.params.playerId);
      
      const removed = await storage.removeFromWatchlist(userId, playerId);
      if (!removed) {
        return res.status(404).json({ message: "Watchlist item not found" });
      }
      
      res.status(200).json({ message: "Removed from watchlist" });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Dashboard stats
  app.get("/api/stats/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get team players
      const teamPlayers = await storage.getPlayersByUserId(userId);
      
      // Get active bids
      const bids = await storage.getBidsByUserId(userId);
      const activeBids = [];
      
      for (const bid of bids) {
        const auction = await storage.getAuction(bid.auctionId);
        if (auction && auction.status === "active") {
          activeBids.push(bid);
        }
      }
      
      // Get auction win rate
      const userBids = await storage.getUserBidsWithDetails(userId);
      const completedAuctions = userBids.filter(bid => bid.auction.status === "completed");
      const wonAuctions = completedAuctions.filter(bid => bid.auction.currentWinnerId === userId);
      const winRate = completedAuctions.length > 0
        ? (wonAuctions.length / completedAuctions.length) * 100
        : 0;
      
      res.status(200).json({
        balance: user.balance,
        teamPlayers: {
          current: teamPlayers.length,
          max: 5
        },
        activeBids: activeBids.length,
        performance: Math.round(winRate * 10) / 10 // rounded to 1 decimal place
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin - Create New Player
  app.post("/api/admin/players/create", requireAdmin, async (req: Request, res: Response) => {
    try {
      const playerData = req.body;
      
      // Set defaults for optional fields
      const newPlayerData = {
        ...playerData,
        isActive: true,
        isReleased: true, // Making it released by default so it can be auctioned
        availableForAuction: true,
        leadership: playerData.leadership || null,
        teamCoordination: playerData.teamCoordination || null,
        mapAwareness: playerData.mapAwareness || null,
        survivalSkills: playerData.survivalSkills || null,
        resourceManagement: playerData.resourceManagement || null,
        combat: playerData.combat || null,
        userId: null // Not owned by any team initially
      };
      
      const player = await storage.createPlayer(newPlayerData);
      res.status(201).json(player);
    } catch (err: any) {
      console.error("Error creating player:", err);
      res.status(500).json({ message: err.message || "Failed to create player" });
    }
  });
  
  // Get team players by team ID for admin use
  app.get("/api/admin/teams/:teamId/players", requireAdmin, async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      
      // Validate team exists
      const team = await storage.getUser(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const players = await storage.getPlayersByUserId(teamId);
      res.status(200).json(players);
    } catch (err) {
      console.error("Error fetching team players:", err);
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });
  
  // Admin - Force release player from team
  app.post("/api/admin/players/:id/force-release", requireAdmin, async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.id);
      
      // Check if player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      // Force release the player
      const updatedPlayer = await storage.releasePlayer(playerId);
      
      if (!updatedPlayer) {
        return res.status(500).json({ message: "Failed to release player" });
      }
      
      res.status(200).json({
        message: "Player released from team successfully",
        player: updatedPlayer
      });
    } catch (err) {
      console.error("Error releasing player:", err);
      res.status(500).json({ message: "Failed to release player" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
