import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  serial,
  jsonb,
  index,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User accounts for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  userType: varchar("user_type", { length: 20 }).default("model"), // model, admin
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Models - individual content creators linked to user accounts
export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  name: varchar("name", { length: 100 }).notNull(),
  stageName: varchar("stage_name", { length: 100 }),
  bio: text("bio"),
  profileImage: varchar("profile_image", { length: 500 }),
  instagramHandle: varchar("instagram_handle", { length: 100 }),
  location: varchar("location", { length: 100 }),
  dateOfBirth: timestamp("date_of_birth"),
  totalVotes: integer("total_votes").default(0),
  activeContestVotes: integer("active_contest_votes").default(0),
  contestsWon: integer("contests_won").default(0),
  contestsJoined: integer("contests_joined").default(0),
  currentRanking: integer("current_ranking"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contests - voting competitions
export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  prizeAmount: decimal("prize_amount", { precision: 10, scale: 2 }),
  prizeCurrency: varchar("prize_currency", { length: 10 }).default("USD"),
  bannerImage: varchar("banner_image", { length: 500 }),
  status: varchar("status", { length: 20 }).default("upcoming"), // upcoming, active, completed
  winnerId: integer("winner_id").references(() => models.id),
  winnerEntryId: integer("winner_entry_id").references(() => contestEntries.id),
  winningVotes: integer("winning_votes").default(0),
  maxParticipants: integer("max_participants"),
  winnerAnnouced: boolean("winner_annouced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contest Entries - links models to contests with their submissions
export const contestEntries = pgTable("contest_entries", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").references(() => contests.id),
  modelId: integer("model_id").references(() => models.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  photoUrl: varchar("photo_url", { length: 500 }).notNull(),
  votes: integer("votes").default(0),
  ranking: integer("ranking"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

// Votes - individual vote records
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => contestEntries.id),
  voterIp: varchar("voter_ip", { length: 45 }), // Support IPv6
  voteType: varchar("vote_type", { length: 20 }).default("free"), // free, premium, bulk
  packageId: integer("package_id").references(() => votePackages.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vote Packages - purchasable voting credits
export const votePackages = pgTable("vote_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  voteCount: integer("vote_count").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("new"), // new, read, responded
  createdAt: timestamp("created_at").defaultNow(),
});

// Complaints and reports
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  reporterName: varchar("reporter_name", { length: 100 }).notNull(),
  reporterEmail: varchar("reporter_email", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // inappropriate_content, harassment, spam, other
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // submission, user, contest
  targetId: varchar("target_id", { length: 50 }).notNull(),
  targetName: varchar("target_name", { length: 200 }),
  status: varchar("status", { length: 20 }).default("new"), // new, investigating, resolved, dismissed
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prize requests for winners to claim their prizes
export const prizeRequests = pgTable("prize_requests", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull().references(() => contests.id, { onDelete: "cascade" }),
  modelId: integer("model_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  requestMessage: text("request_message"),
  contactInfo: text("contact_info").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, processing, completed, rejected
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
  totalVotes: true,
  contestsWon: true,
  contestsJoined: true,
  currentRanking: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContestSchema = createInsertSchema(contests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContestEntrySchema = createInsertSchema(contestEntries).omit({
  id: true,
  votes: true,
  ranking: true,
  status: true,
  submittedAt: true,
  approvedAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrizeRequestSchema = createInsertSchema(prizeRequests).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

// Registration schema with validation
export const registerModelSchema = insertModelSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  stageName: z.string().optional(),
  instagramHandle: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  dateOfBirth: z.date().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Create contest schema with validation
export const createContestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  prizeAmount: z.number().min(0, "Prize amount must be positive"),
  bannerImage: z.string(),
  maxParticipants: z.number().optional(),
  status: z.enum(["upcoming", "active", "completed"]).default("upcoming"),
  prizeCurrency: z.string().default("USD"),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type RegisterModel = z.infer<typeof registerModelSchema>;
export type Contest = typeof contests.$inferSelect;
export type InsertContest = z.infer<typeof insertContestSchema>;
export type ContestEntry = typeof contestEntries.$inferSelect;
export type InsertContestEntry = z.infer<typeof insertContestEntrySchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type VotePackage = typeof votePackages.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type PrizeRequest = typeof prizeRequests.$inferSelect;
export type InsertPrizeRequest = z.infer<typeof insertPrizeRequestSchema>;