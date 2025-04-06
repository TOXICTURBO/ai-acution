import { pgTable, text, serial, integer, boolean, timestamp, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Team Leaders table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  teamName: text("team_name").notNull(),
  balance: doublePrecision("balance").notNull().default(25000), // Starting balance
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Player table
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  realName: text("real_name").notNull(),
  specialty: text("specialty").notNull(), // e.g., FPS Expert, MOBA Captain, etc.
  level: integer("level").notNull(),
  accuracy: integer("accuracy").notNull(),
  reactionTime: integer("reaction_time").notNull(),
  strategy: integer("strategy").notNull(),
  leadership: integer("leadership"),
  teamCoordination: integer("team_coordination"),
  mapAwareness: integer("map_awareness"),
  survivalSkills: integer("survival_skills"),
  resourceManagement: integer("resource_management"),
  combat: integer("combat"),
  winRate: integer("win_rate").notNull(),
  experience: integer("experience").notNull(), // in years
  imageUrl: text("image_url"),
  rating: real("rating").notNull(), // 1-5 stars
  userId: integer("user_id").references(() => users.id), // The team leader who owns this player
  isActive: boolean("is_active").default(true),
  basePrice: doublePrecision("base_price").default(5000), // Base price for auction
  isReleased: boolean("is_released").default(false), // When team releases a player
  availableForAuction: boolean("available_for_auction").default(false), // Admin selects if released player can be auctioned
});

// Auctions table
export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  startingPrice: doublePrecision("starting_price").notNull(),
  currentPrice: doublePrecision("current_price").notNull(),
  currentWinnerId: integer("current_winner_id").references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("active"), // active, completed, cancelled
});

// Bids table
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").notNull().references(() => auctions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  playerId: integer("player_id").notNull().references(() => players.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Define player schema with validation rules
export const insertPlayerSchema = createInsertSchema(players)
  .omit({ id: true })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username is too long"),
    realName: z.string().min(2, "Real name is required").max(50, "Name is too long"),
    specialty: z.string().min(2, "Specialty is required"),
    level: z.number().int().min(1, "Level must be at least 1").max(100, "Level cannot exceed 100"),
    accuracy: z.number().int().min(1, "Accuracy must be at least 1").max(100, "Accuracy cannot exceed 100"),
    reactionTime: z.number().int().min(1, "Reaction time must be at least 1").max(100, "Reaction time cannot exceed 100"),
    strategy: z.number().int().min(1, "Strategy must be at least 1").max(100, "Strategy cannot exceed 100"),
    winRate: z.number().int().min(0, "Win rate must be at least 0").max(100, "Win rate cannot exceed 100"),
    experience: z.number().int().min(0, "Experience must be at least 0"),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5")
  });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, startTime: true, status: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, timestamp: true });
export const insertWatchlistSchema = createInsertSchema(watchlist).omit({ id: true });

// Admin-specific schemas
export const releasePlayerSchema = z.object({
  playerId: z.number(),
});

export const updatePlayerSchema = createInsertSchema(players)
  .omit({ id: true, userId: true })
  .partial();

export const updateAuctionStatusSchema = z.object({
  auctionId: z.number(),
  status: z.enum(["active", "completed", "cancelled"]),
});

export const adminCreateAuctionSchema = z.object({
  playerId: z.number(),
  startingPrice: z.number().positive(),
  endTime: z.string().datetime(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type UpdatePlayer = z.infer<typeof updatePlayerSchema>;

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;
export type AdminCreateAuction = z.infer<typeof adminCreateAuctionSchema>;
export type UpdateAuctionStatus = z.infer<typeof updateAuctionStatusSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type WatchlistItem = typeof watchlist.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof insertWatchlistSchema>;

export type ReleasePlayer = z.infer<typeof releasePlayerSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Bid placement schema
export const placeBidSchema = z.object({
  auctionId: z.number(),
  amount: z.number().positive(),
});

export type PlaceBid = z.infer<typeof placeBidSchema>;
