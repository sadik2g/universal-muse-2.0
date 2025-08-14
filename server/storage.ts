import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, models, contests, contestEntries, votes, votePackages, contactSubmissions, complaints, prizeRequests } from "@shared/schema";
import { eq, desc, and, sql, or, isNull, not, ne } from "drizzle-orm";
import type {
  User,
  Model,
  Contest,
  ContestEntry,
  Vote,
  VotePackage,
  ContactSubmission,
  InsertUser,
  InsertModel,
  InsertContest,
  InsertContestEntry,
  InsertVote,
  InsertContactSubmission,
  RegisterModel,
  PrizeRequest,
  InsertPrizeRequest
} from "@shared/schema";

export interface IStorage {
  // Authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;

  // Models
  getModel(id: number): Promise<Model | undefined>;
  getModelByEmail(email: string): Promise<Model | undefined>;
  getModelByUserId(userId: number): Promise<Model | undefined>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: number, model: Partial<InsertModel>): Promise<Model | undefined>;
  getTopModels(limit?: number): Promise<Model[]>;
  updateModelVotes(id: number, votes: number): Promise<void>;

  // Registration
  registerModel(data: RegisterModel): Promise<{ user: User; model: Model }>;

  // Contests
  getContest(id: number): Promise<Contest | undefined>;
  getActiveContests(): Promise<Contest[]>;
  createContest(contest: InsertContest): Promise<Contest>;
  getContestWithEntries(id: number): Promise<{ contest: Contest; entries: (ContestEntry & { model: Model })[] } | undefined>;

  // Contest Entries
  createContestEntry(entry: InsertContestEntry): Promise<ContestEntry>;
  getContestEntries(contestId: number): Promise<(ContestEntry & { model: Model })[]>;
  updateEntryVotes(id: number, votes: number): Promise<void>;
  updateContestEntryVotes(entryId: number, votes: number): Promise<void>;
  getSubmissionsByModelId(modelId: number): Promise<any[]>;
  getSubmissionsByModelIdPaginated(modelId: number, status: string | null, limit: number, offset: number): Promise<{ submissions: any[], total: number }>;
  getModelActiveContestEntry(modelId: number): Promise<any>;

  // Votes
  createVote(vote: InsertVote): Promise<Vote>;
  hasUserVoted(contestId: number, modelId: number, voterIp: string): Promise<boolean>;
  getVotesByContest(contestId: number): Promise<Vote[]>;

  // Vote Packages
  getVotePackages(): Promise<VotePackage[]>;

  // Contact
  createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(status?: string): Promise<ContactSubmission[]>;
  updateContactSubmissionStatus(id: number, status: string): Promise<void>;

  // Complaints
  createComplaint(complaint: any): Promise<any>;

  // Prize Requests
  createPrizeRequest(request: InsertPrizeRequest): Promise<PrizeRequest>;

  // Admin - Paginated methods
  getAdminSubmissionsPaginated(status: string, limit: number, offset: number): Promise<{ submissions: any[], total: number }>;
  getPrizeRequestsPaginated(status: string, limit: number, offset: number): Promise<{ requests: any[], total: number }>;
  getWinnersPaginated(limit: number, offset: number): Promise<{ winners: any[], total: number }>;
  getPrizeRequestsByModel(modelId: number): Promise<PrizeRequest[]>;
  getPrizeRequests(status?: string): Promise<PrizeRequest[]>;
  updatePrizeRequestStatus(id: number, status: string, adminNotes?: string): Promise<PrizeRequest | undefined>;

  // Winners Management
  getContestWinners(): Promise<any[]>;
  removeContestWinner(contestId: number): Promise<boolean>;
  updatePrizeRequestStatus(id: number, status: string, adminNotes?: string): Promise<PrizeRequest | undefined>;
  hasPrizeRequest(contestId: number, modelId: number): Promise<boolean>;

  // Leaderboard
  getLeaderboard(timeframe?: 'daily' | 'weekly' | 'all'): Promise<Model[]>;

  // Admin methods
  getAdminStats(): Promise<any>;
  getAdminContests(): Promise<any[]>;
  getAdminSubmissions(status: string): Promise<any[]>;
  updateSubmissionStatus(id: string, status: string, modelId?: string): Promise<void>;
  getAdminAnalytics(timeRange: string): Promise<any>;
  getAdminComplaints(status: string, priority: string, page?: number, limit?: number): Promise<{ complaints: any[]; total: number; page: number; totalPages: number }>;
  updateComplaint(id: string, status: string, adminNotes?: string): Promise<void>;
  getAdminProfile(userId: number): Promise<any>;
  updateAdminProfile(userId: number, data: any): Promise<any>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Authentication methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Registration method
  async registerModel(data: RegisterModel): Promise<{ user: User; model: Model }> {
    const hashedPassword = await this.hashPassword(data.password);

    // Create user account
    const [newUser] = await db.insert(users).values({
      email: data.email,
      password: hashedPassword,
      userType: "model",
      isVerified: false,
    }).returning();

    // Create model profile
    const [newModel] = await db.insert(models).values({
      userId: newUser.id,
      name: data.name,
      stageName: data.stageName,
      bio: data.bio,
      instagramHandle: data.instagramHandle,
      location: data.location,
      dateOfBirth: data.dateOfBirth,
      profileImage: data.profileImage || "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    }).returning();

    return { user: newUser, model: newModel };
  }

  // Models
  async getModel(id: number): Promise<Model | undefined> {
    const [model] = await db.select().from(models).where(eq(models.id, id));
    return model;
  }

  async getModelByEmail(email: string): Promise<Model | undefined> {
    // Join users and models tables to find model by email
    const result = await db.select({
      id: models.id,
      userId: models.userId,
      name: models.name,
      stageName: models.stageName,
      bio: models.bio,
      profileImage: models.profileImage,
      instagramHandle: models.instagramHandle,
      location: models.location,
      dateOfBirth: models.dateOfBirth,
      totalVotes: models.totalVotes,
      contestsWon: models.contestsWon,
      contestsJoined: models.contestsJoined,
      currentRanking: models.currentRanking,
      isActive: models.isActive,
      createdAt: models.createdAt,
      updatedAt: models.updatedAt,
    })
      .from(models)
      .innerJoin(users, eq(models.userId, users.id))
      .where(eq(users.email, email));

    return result[0];
  }

  async getModelByUserId(userId: number): Promise<Model | undefined> {
    const [model] = await db.select().from(models).where(eq(models.userId, userId));
    return model;
  }

  async createModel(model: InsertModel): Promise<Model> {
    const [newModel] = await db.insert(models).values(model).returning();
    return newModel;
  }

  async updateModel(id: number, model: Partial<InsertModel>): Promise<Model | undefined> {
    const [updatedModel] = await db.update(models)
      .set({ ...model, updatedAt: new Date() })
      .where(eq(models.id, id))
      .returning();
    return updatedModel;
  }

  async incrementContestsJoined(id: number): Promise<void> {
    await db.update(models)
      .set({
        contestsJoined: sql`${models.contestsJoined} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(models.id, id));
  }


  async getTopModels(limit: number = 10): Promise<Model[]> {
    return db.select().from(models)
      .where(eq(models.isActive, true))
      .orderBy(desc(models.totalVotes))
      .limit(limit);
  }

  async updateModelVotes(id: number, votes: number, allVotes: number): Promise<void> {
    await db.update(models)
      .set({ activeContestVotes: votes, totalVotes: allVotes + votes, updatedAt: new Date() })
      .where(eq(models.id, id));
  }

  // Contests
  async getContest(id: number): Promise<Contest | undefined> {
    const [contest] = await db.select().from(contests).where(eq(contests.id, id));
    return contest;
  }

  // async getContestById(id: string): Promise<Contest | undefined> {
  //   const contestId = parseInt(id);
  //   if (isNaN(contestId)) return undefined;
  //   return this.getContest(contestId);
  // }

  async getAllContests(): Promise<Contest[]> {
    return db.select().from(contests)
      .orderBy(contests.endDate);
  }

  async getActiveContests(): Promise<Contest[]> {
    return db.select().from(contests)
      .where(eq(contests.status, "active"))
      .orderBy(contests.endDate);
  }

  async getContestWithEntries(id: number): Promise<{ contest: Contest; entries: (ContestEntry & { model: Model })[] } | undefined> {
    try {
      console.log("Getting contest with ID:", id);
      const contest = await this.getContest(id);
      console.log("Contest found:", contest ? "Yes" : "No");

      if (!contest) return undefined;

      console.log("Getting contest entries for contest:", id);
      const entries = await this.getContestEntries(id);
      console.log("Entries found:", entries.length);

      return { contest, entries };
    } catch (error) {
      console.error("Error in getContestWithEntries:", error);
      throw error;
    }
  }

  // Contest Entries - Enhanced with proper submission data
  async createContestEntry(entry: InsertContestEntry): Promise<ContestEntry> {
    const entryData = {
      ...entry,
      votes: 0,
      submittedAt: new Date(),
      status: entry.status || "pending"
    };
    const [newEntry] = await db.insert(contestEntries).values(entryData).returning();
    return newEntry;
  }

  async getSubmissionsByModelId(modelId: number): Promise<any[]> {
    const results = await db.select({
      id: contestEntries.id,
      contestId: contestEntries.contestId,
      contestTitle: contests.title,
      photoUrl: contestEntries.photoUrl,
      title: contestEntries.title,
      description: contestEntries.description,
      votes: contestEntries.votes,
      ranking: contestEntries.ranking,
      status: contestEntries.status,
      submittedAt: contestEntries.submittedAt,
      approvedAt: contestEntries.approvedAt,
      contestEndDate: contests.endDate,
    })
      .from(contestEntries)
      .innerJoin(contests, eq(contestEntries.contestId, contests.id))
      .where(eq(contestEntries.modelId, modelId))
      .orderBy(desc(contestEntries.submittedAt));

    return results;
  }

  async getSubmissionsByModelIdPaginated(modelId: number, status: string | null, limit: number, offset: number): Promise<{ submissions: any[], total: number }> {
    // Build where condition
    let whereCondition = eq(contestEntries.modelId, modelId);
    if (status && status !== "all") {
      whereCondition = and(whereCondition, eq(contestEntries.status, status)) as any;
    }

    // Get total count
    const [countResult] = await db.select({ count: sql<number>`cast(count(*) as int)` })
      .from(contestEntries)
      .innerJoin(contests, eq(contestEntries.contestId, contests.id))
      .where(whereCondition);

    const total = countResult.count;

    // Get paginated results
    const results = await db.select({
      id: contestEntries.id,
      contestId: contestEntries.contestId,
      contestTitle: contests.title,
      photoUrl: contestEntries.photoUrl,
      title: contestEntries.title,
      description: contestEntries.description,
      votes: contestEntries.votes,
      ranking: contestEntries.ranking,
      status: contestEntries.status,
      submittedAt: contestEntries.submittedAt,
      approvedAt: contestEntries.approvedAt,
      contestEndDate: contests.endDate,
    })
      .from(contestEntries)
      .innerJoin(contests, eq(contestEntries.contestId, contests.id))
      .where(whereCondition)
      .orderBy(desc(contestEntries.submittedAt))
      .limit(limit)
      .offset(offset);

    // Transform to match expected format
    const submissions = results.map(result => ({
      id: result.id,
      contestId: result.contestId,
      contestTitle: result.contestTitle,
      photoUrl: result.photoUrl,
      caption: result.description || result.title || '',
      votes: result.votes,
      ranking: result.ranking,
      status: result.status,
      submittedAt: result.submittedAt?.toISOString() || new Date().toISOString(),
      approvedAt: result.approvedAt?.toISOString() || null,
      contestEndDate: result.contestEndDate?.toISOString() || new Date().toISOString(),
    }));

    return { submissions, total };
  }

  async getContestEntries(contestId: number): Promise<(ContestEntry & { model: Model })[]> {
    const results = await db.select({
      id: contestEntries.id,
      contestId: contestEntries.contestId,
      modelId: contestEntries.modelId,
      photoUrl: contestEntries.photoUrl,
      title: contestEntries.title,
      description: contestEntries.description,
      votes: contestEntries.votes,
      ranking: contestEntries.ranking,
      status: contestEntries.status,
      submittedAt: contestEntries.submittedAt,
      approvedAt: contestEntries.approvedAt,
      model: {
        id: models.id,
        userId: models.userId,
        name: models.name,
        stageName: models.stageName,
        bio: models.bio,
        profileImage: models.profileImage,
        instagramHandle: models.instagramHandle,
        location: models.location,
        dateOfBirth: models.dateOfBirth,
        totalVotes: models.totalVotes,
        contestsWon: models.contestsWon,
        contestsJoined: models.contestsJoined,
        currentRanking: models.currentRanking,
        isActive: models.isActive,
        createdAt: models.createdAt,
        updatedAt: models.updatedAt,
      }
    })
      .from(contestEntries)
      .innerJoin(models, eq(contestEntries.modelId, models.id))
      .where(and(
        eq(contestEntries.contestId, contestId),
        eq(contestEntries.status, "approved") // Only show approved entries
      ))
      .orderBy(desc(contestEntries.votes));

    return results.map(result => ({
      ...result,
      model: result.model
    }));
  }

  async updateEntryVotes(id: number, votes: number): Promise<void> {
    await db.update(contestEntries)
      .set({ votes })
      .where(eq(contestEntries.id, id));
  }

  // Votes
  async createVote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async hasUserVoted(contestId: number, modelId: number, voterIp: string): Promise<boolean> {
    const result = await db.select().from(votes)
      .innerJoin(contestEntries, eq(votes.entryId, contestEntries.id))
      .where(and(
        eq(contestEntries.contestId, contestId),
        eq(votes.voterIp, voterIp)
      ))
      .limit(1);

    return result.length > 0;
  }

  async hasUserVotedInContest(contestId: number, voterIp: string): Promise<boolean> {
    const result = await db.select().from(votes)
      .innerJoin(contestEntries, eq(votes.entryId, contestEntries.id))
      .where(and(
        eq(contestEntries.contestId, contestId),
        eq(votes.voterIp, voterIp)
      ))
      .limit(1);

    return result.length > 0;
  }

  async getUserVoteInContest(contestId: number, voterIp: string): Promise<{ modelId: number; entryId: number } | null> {
    const result = await db.select({
      modelId: contestEntries.modelId,
      entryId: contestEntries.id
    })
      .from(votes)
      .innerJoin(contestEntries, eq(votes.entryId, contestEntries.id))
      .where(and(
        eq(contestEntries.contestId, contestId),
        eq(votes.voterIp, voterIp)
      ))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async getVotesByContest(contestId: number): Promise<Vote[]> {
    const results = await db.select({
      id: votes.id,
      entryId: votes.entryId,
      voterIp: votes.voterIp,
      voteType: votes.voteType,
      packageId: votes.packageId,
      createdAt: votes.createdAt,
    })
      .from(votes)
      .innerJoin(contestEntries, eq(votes.entryId, contestEntries.id))
      .where(eq(contestEntries.contestId, contestId));

    return results;
  }

  async getContestTotalVotes(contestId: number): Promise<number> {
    const results = await db.select({
      totalVotes: sql<number>`COUNT(*)`.as('totalVotes')
    })
      .from(votes)
      .innerJoin(contestEntries, eq(votes.entryId, contestEntries.id))
      .where(eq(contestEntries.contestId, contestId));

    return results[0]?.totalVotes || 0;
  }

  // Vote Packages
  async getVotePackages(): Promise<VotePackage[]> {
    return db.select().from(votePackages).where(eq(votePackages.isActive, true));
  }

  // Contact Submissions
  async createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db.insert(contactSubmissions).values(contact).returning();
    return newSubmission;
  }

  async getContactSubmissions(status?: string): Promise<ContactSubmission[]> {
    let query = db.select().from(contactSubmissions);

    if (status && status !== "all") {
      query = query.where(eq(contactSubmissions.status, status));
    }

    return query.orderBy(desc(contactSubmissions.createdAt));
  }

  async updateContactSubmissionStatus(id: number, status: string): Promise<void> {
    await db.update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id));
  }

  // Leaderboard - Calculate based on actual contest entries and votes from active contests
  async getLeaderboard(timeframe: 'daily' | 'weekly' | 'all' = 'all'): Promise<any[]> {
    // Get models with their votes only from active contests
    const results = await db.select({
      id: models.id,
      name: models.name,
      stageName: models.stageName,
      profileImage: models.profileImage,
      location: models.location,
      bio: models.bio,
      isActive: models.isActive,
      totalVotes: sql<number>`COALESCE(SUM(${contestEntries.votes}), 0)`.as('totalVotes'),
      contestsJoined: sql<number>`COUNT(DISTINCT ${contestEntries.contestId})`.as('contestsJoined'),
      contestsWon: models.contestsWon,
    })
      .from(models)
      .leftJoin(contestEntries, and(
        eq(models.id, contestEntries.modelId),
        eq(contestEntries.status, "approved")
      ))
      .leftJoin(contests, eq(contestEntries.contestId, contests.id))
      .where(and(
        eq(models.isActive, true),
        or(
          isNull(contests.id), // Include models without entries
          eq(contests.status, "active") // Only include active contests
        )
      ))
      .groupBy(models.id)
      .orderBy(desc(sql`COALESCE(SUM(${contestEntries.votes}), 0)`))
      .limit(50);

    return results;
  }

  // Get active contest leaderboard with top 3 positions
  async getActiveContestLeaderboard(): Promise<any[]> {
    // Get models with their votes only from active contests, limited to top 3
    const results = await db.select({
      id: models.id,
      name: models.name,
      stageName: models.stageName,
      profileImage: models.profileImage,
      location: models.location,
      bio: models.bio,
      isActive: models.isActive,
      totalVotes: sql<number>`COALESCE(SUM(${contestEntries.votes}), 0)`.as('totalVotes'),
      activeContests: sql<number>`COUNT(DISTINCT CASE WHEN ${contests.status} = 'active' THEN ${contestEntries.contestId} END)`.as('activeContests'),
      latestContestTitle: sql<string>`MAX(CASE WHEN ${contests.status} = 'active' THEN ${contests.title} END)`.as('latestContestTitle'),
    })
      .from(models)
      .innerJoin(contestEntries, and(
        eq(models.id, contestEntries.modelId),
        eq(contestEntries.status, "approved")
      ))
      .innerJoin(contests, and(
        eq(contestEntries.contestId, contests.id),
        eq(contests.status, "active")
      ))
      .where(eq(models.isActive, true))
      .groupBy(models.id)
      .having(sql`COALESCE(SUM(${contestEntries.votes}), 0) > 0`)
      .orderBy(desc(sql`COALESCE(SUM(${contestEntries.votes}), 0)`))
      .limit(3);

    return results;
  }

  async updateContestVoteCounts(contestId: number): Promise<void> {
    // Calculate and update vote counts for all entries in a contest
    const entries = await db.select({
      id: contestEntries.id,
      modelId: contestEntries.modelId
    })
      .from(contestEntries)
      .where(and(
        eq(contestEntries.contestId, contestId),
        eq(contestEntries.status, "approved")
      ));

    for (const entry of entries) {
      const voteCount = await db.select({
        count: sql<number>`COUNT(*)`.as('count')
      })
        .from(votes)
        .where(eq(votes.entryId, entry.id));

      const totalVotes = voteCount[0]?.count || 0;

      // Update contest entry vote count
      await db.update(contestEntries)
        .set({ votes: totalVotes })
        .where(eq(contestEntries.id, entry.id));

      // Update model total votes
      const modelTotalVotes = await db.select({
        total: sql<number>`COALESCE(SUM(${contestEntries.votes}), 0)`.as('total')
      })
        .from(contestEntries)
        .where(and(
          eq(contestEntries.modelId, entry.modelId),
          eq(contestEntries.status, "approved")
        ));

      await db.update(models)
        .set({ totalVotes: modelTotalVotes[0]?.total || 0 })
        .where(eq(models.id, entry.modelId));
    }
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    const totalContests = (await db.select().from(contests)).length;
    const totalSubmissions = (await db.select().from(contestEntries)).length;
    const totalVotes = (await db.select().from(votes)).length;
    const activeContests = (await db.select().from(contests).where(eq(contests.status, "active"))).length;
    const pendingSubmissions = (await db.select().from(contestEntries).where(eq(contestEntries.status, "pending"))).length;
    const approvedSubmissions = (await db.select().from(contestEntries).where(eq(contestEntries.status, "approved"))).length;
    const rejectedSubmissions = (await db.select().from(contestEntries).where(eq(contestEntries.status, "rejected"))).length;
    // Exclude admin users from total user count
    const totalUsers = (await db.select().from(users).where(ne(users.userType, "admin"))).length;

    return {
      totalContests,
      totalSubmissions,
      totalVotes,
      activeContests,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      totalUsers,
    };
  }

  async createContest(contestData: any): Promise<Contest> {
    // Check if we're trying to create an active contest
    if (contestData.status === "active") {
      // Deactivate all existing active contests before creating new one
      await this.deactivateAllContests();
    }
    const inserted = await db.insert(contests).values({
      title: contestData.title,
      description: contestData.description,
      startDate: new Date(contestData.startDate),
      endDate: new Date(contestData.endDate),
      prizeAmount: contestData.prizeAmount.toString(),
      prizeCurrency: contestData.prizeCurrency || "USD",
      bannerImage: contestData.bannerImage,
      status: contestData.status || "upcoming",
      maxParticipants: contestData.maxParticipants,
    }).returning() as Contest[];

    const newContest = inserted[0];

    return newContest;
  }

  async getAdminContests(): Promise<any[]> {
    const contestsData = await db.select().from(contests).orderBy(desc(contests.createdAt));

    const contestsWithCounts = await Promise.all(contestsData.map(async (contest) => {
      const submissionCount = (await db.select().from(contestEntries).where(eq(contestEntries.contestId, contest.id))).length;

      return {
        id: contest.id.toString(),
        title: contest.title,
        description: contest.description,
        startDate: contest.startDate.toISOString(),
        endDate: contest.endDate.toISOString(),
        prizeAmount: Number(contest.prizeAmount),
        submissionCount,
        status: contest.status,
        createdAt: contest.createdAt?.toISOString() || new Date().toISOString(),
      };
    }));

    return contestsWithCounts;
  }

  async updateContest(contestId: string, contestData: any): Promise<Contest> {
    const id = parseInt(contestId);

    // Check if we're trying to set this contest to active
    if (contestData.status === "active") {
      // Deactivate all other contests first (excluding current one)
      await this.deactivateAllContests(id);
    }

    const [updatedContest] = await db.update(contests)
      .set({
        title: contestData.title,
        description: contestData.description,
        startDate: new Date(contestData.startDate),
        endDate: new Date(contestData.endDate),
        prizeAmount: contestData.prizeAmount.toString(),
        prizeCurrency: contestData.prizeCurrency || "USD",
        bannerImage: contestData.bannerImage,
        status: contestData.status,
        maxParticipants: contestData.maxParticipants,
        updatedAt: new Date(),
      })
      .where(eq(contests.id, id))
      .returning();

    return updatedContest;
  }

  // Helper method to deactivate all contests (except optionally one)
  async deactivateAllContests(excludeId?: number): Promise<void> {
    let query = db.update(contests)
      .set({
        status: "completed",
        updatedAt: new Date()
      })
      .where(eq(contests.status, "active"));

    // If we need to exclude a specific contest ID, modify the base query
    if (excludeId) {
      await db.update(contests)
        .set({
          status: "completed",
          updatedAt: new Date()
        })
        .where(and(
          eq(contests.status, "active"),
          not(eq(contests.id, excludeId))
        ));
    } else {
      await query;
    }
  }

  async getContestEntryByModelAndContest(modelId: number, contestId: number): Promise<any> {
    const [entry] = await db.select()
      .from(contestEntries)
      .where(
        and(
          eq(contestEntries.modelId, modelId),
          eq(contestEntries.contestId, contestId)
        )
      );

    return entry;
  }

  async getPendingSubmissions(): Promise<any[]> {
    const submissions = await db.select({
      id: contestEntries.id,
      title: contestEntries.title,
      description: contestEntries.description,
      photoUrl: contestEntries.photoUrl,
      status: contestEntries.status,
      submittedAt: contestEntries.submittedAt,
      contestTitle: contests.title,
      modelName: models.name,
      modelEmail: users.email,
    })
      .from(contestEntries)
      .innerJoin(contests, eq(contestEntries.contestId, contests.id))
      .innerJoin(models, eq(contestEntries.modelId, models.id))
      .innerJoin(users, eq(models.userId, users.id))
      .where(eq(contestEntries.status, "pending"))
      .orderBy(desc(contestEntries.submittedAt));

    return submissions;
  }

  async getContestById(contestId: string): Promise<any> {
    const id = parseInt(contestId);
    const [contest] = await db.select().from(contests).where(eq(contests.id, id));
    return contest;
  }
 
  async updateSubmissionStatus(submissionId: string, status: string, modelId?: string): Promise<any> {
    const id = parseInt(submissionId);

    if (status === "approved") {
      const [updatedSubmission] = await db.update(contestEntries)
        .set({
          status,
          approvedAt: new Date(),
          votes: 0,
        })
        .where(eq(contestEntries.id, id))
        .returning();
      return updatedSubmission;
    } else {
      const [updatedSubmission] = await db.update(contestEntries)
        .set({
          status,
          approvedAt: status === "approved" ? new Date() : null,
        })
        .where(eq(contestEntries.id, id))
        .returning();

      return updatedSubmission;
    }
  }

  async deleteContest(contestId: string): Promise<void> {
    const id = parseInt(contestId);

    // First, get all contest entries for this contest
    const entries = await db.select({ id: contestEntries.id })
      .from(contestEntries)
      .where(eq(contestEntries.contestId, id));

    // Delete all votes for these entries first
    if (entries.length > 0) {
      const entryIds = entries.map(entry => entry.id);
      for (const entryId of entryIds) {
        await db.delete(votes).where(eq(votes.entryId, entryId));
      }
    }

    // Delete any prize requests for this contest
    await db.delete(prizeRequests).where(eq(prizeRequests.contestId, id));

    // Clear winner references in the contest table
    await db.update(contests)
      .set({
        winnerModelId: null,
        winnerEntryId: null,
        updatedAt: new Date()
      })
      .where(eq(contests.id, id));

    // Delete all contest entries
    await db.delete(contestEntries).where(eq(contestEntries.contestId, id));

    // Finally delete the contest
    await db.delete(contests).where(eq(contests.id, id));
  }

  async getAdminSubmissions(status: string): Promise<any[]> {
    const entries = await db.select({
      id: contestEntries.id,
      photoUrl: contestEntries.photoUrl,
      title: contestEntries.title,
      description: contestEntries.description,
      submittedAt: contestEntries.submittedAt,
      status: contestEntries.status,
      contestId: contestEntries.contestId,
      modelId: contestEntries.modelId,
    })
      .from(contestEntries)
      .where(eq(contestEntries.status, status))
      .orderBy(desc(contestEntries.submittedAt));

    const submissionsWithDetails = await Promise.all(entries.map(async (entry) => {
      const [model] = await db.select().from(models).where(eq(models.id, entry.modelId));
      const [contest] = await db.select().from(contests).where(eq(contests.id, entry.contestId));

      return {
        id: entry.id.toString(),
        modelName: model?.name || "Unknown",
        contestTitle: contest?.title || "Unknown Contest",
        photoUrl: entry.photoUrl,
        title: entry.title,
        description: entry.description,
        submittedAt: entry.submittedAt?.toISOString() || new Date().toISOString(),
        modelId: entry.modelId,
        contestId: entry.contestId,
        status: entry.status,
      };
    }));

    return submissionsWithDetails;
  }

  async getAdminSubmissionsPaginated(status: string, limit: number, offset: number): Promise<{ submissions: any[], total: number }> {
    // Get total count first
    const [countResult] = await db.select({ count: sql<number>`cast(count(*) as int)` })
      .from(contestEntries)
      .where(eq(contestEntries.status, status));

    const total = countResult.count;

    // Get paginated entries
    const entries = await db.select({
      id: contestEntries.id,
      photoUrl: contestEntries.photoUrl,
      title: contestEntries.title,
      description: contestEntries.description,
      submittedAt: contestEntries.submittedAt,
      status: contestEntries.status,
      contestId: contestEntries.contestId,
      modelId: contestEntries.modelId,
    })
      .from(contestEntries)
      .where(eq(contestEntries.status, status))
      .orderBy(desc(contestEntries.submittedAt))
      .limit(limit)
      .offset(offset);

    const submissionsWithDetails = await Promise.all(entries.map(async (entry) => {
      const [model] = await db.select().from(models).where(eq(models.id, entry.modelId));
      const [contest] = await db.select().from(contests).where(eq(contests.id, entry.contestId));

      return {
        id: entry.id.toString(),
        modelName: model?.name || "Unknown",
        contestTitle: contest?.title || "Unknown Contest",
        photoUrl: entry.photoUrl,
        title: entry.title,
        description: entry.description,
        submittedAt: entry.submittedAt?.toISOString() || new Date().toISOString(),
        modelId: entry.modelId,
        contestId: entry.contestId,
        status: entry.status,
      };
    }));

    return { submissions: submissionsWithDetails, total };
  }



  async getAdminAnalytics(timeRange: string): Promise<any> {
    const totalVotes = (await db.select().from(votes)).length;
    const contests = await this.getAdminContests();

    return {
      totalVotes,
      dailyVotes: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        votes: Math.floor(Math.random() * 100) + 50
      })),
      topContests: contests.slice(0, 5),
      trafficSources: [
        { source: "direct", visitors: 1250, percentage: 45 },
        { source: "social", visitors: 820, percentage: 30 },
        { source: "search", visitors: 490, percentage: 18 },
        { source: "referral", visitors: 190, percentage: 7 }
      ],
      userGrowth: Array.from({ length: 7 }, (_, i) => ({
        period: `Day ${i + 1}`,
        users: Math.floor(Math.random() * 20) + 10
      })),
      votesTrend: 18,
      submissionsTrend: 23,
      usersTrend: 8
    };
  }

  async getAdminComplaints(status: string, priority: string, page = 1, limit = 10): Promise<{ complaints: any[]; total: number; page: number; totalPages: number }> {
    let query = db.select().from(complaints);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(complaints);

    // Build WHERE conditions
    const conditions = [];

    // Apply status filter
    if (status && status !== "all") {
      conditions.push(eq(complaints.status, status));
    }

    // Apply priority filter
    if (priority && priority !== "all") {
      conditions.push(eq(complaints.priority, priority));
    }

    // Apply conditions to both queries
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }

    // Get total count for pagination with same filters
    const totalResult = await countQuery;
    const total = totalResult[0]?.count || 0;

    // Apply pagination
    const offset = (page - 1) * limit;
    const allComplaints = await query
      .orderBy(desc(complaints.createdAt))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    return {
      complaints: allComplaints,
      total,
      page,
      totalPages
    };
  }

  async createComplaint(complaint: any): Promise<any> {
    const [newComplaint] = await db.insert(complaints).values({
      reporterName: complaint.reporterName,
      reporterEmail: complaint.reporterEmail,
      type: complaint.type,
      subject: complaint.subject,
      description: complaint.description,
      targetType: complaint.targetType,
      targetId: complaint.targetId,
      targetName: complaint.targetName,
      status: complaint.status || "new",
      priority: complaint.priority || "medium",
    }).returning();

    return newComplaint;
  }

  async updateComplaint(id: string, status: string, adminNotes?: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await db.update(complaints)
      .set(updateData)
      .where(eq(complaints.id, parseInt(id)));
  }

  async getAdminProfile(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    return {
      id: userId,
      email: user?.email,
      name: "Admin User",
      role: "Administrator",
      notifications: {
        emailNotifications: true,
        newSubmissions: true,
        contestUpdates: true,
        systemAlerts: true,
      }
    };
  }

  async updateAdminProfile(userId: number, data: any): Promise<any> {
    // Update user table
    await db.update(users)
      .set({
        email: data.email,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // For now, return the updated profile with the new data
    return {
      id: userId,
      email: data.email,
      name: data.name || "Admin User",
      role: "Administrator",
      bio: data.bio,
      phone: data.phone,
    };
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Contest Winner Methods
  async determineContestWinner(contestId: number): Promise<{ winner: any; winningEntry: any } | null> {
    // Get the entry with the highest votes in this contest
    const winningEntry = await db.select({
      id: contestEntries.id,
      contestId: contestEntries.contestId,
      modelId: contestEntries.modelId,
      photoUrl: contestEntries.photoUrl,
      title: contestEntries.title,
      description: contestEntries.description,
      votes: contestEntries.votes,
      status: contestEntries.status,
      model: {
        id: models.id,
        name: models.name,
        stageName: models.stageName,
        profileImage: models.profileImage,
        userId: models.userId,
      }
    })
      .from(contestEntries)
      .innerJoin(models, eq(contestEntries.modelId, models.id))
      .where(and(
        eq(contestEntries.contestId, contestId),
        eq(contestEntries.status, "approved")
      ))
      .orderBy(desc(contestEntries.votes))
      .limit(1);

    if (winningEntry.length === 0) {
      return null;
    }

    const winner = winningEntry[0];
    return {
      winner: winner.model,
      winningEntry: {
        id: winner.id,
        contestId: winner.contestId,
        modelId: winner.modelId,
        photoUrl: winner.photoUrl,
        title: winner.title,
        description: winner.description,
        votes: winner.votes,
        status: winner.status,
      }
    };
  }

  async setContestWinner(contestId: number): Promise<void> {
    const result = await this.determineContestWinner(contestId);

    if (!result) {
      return;
    }

    const { winner, winningEntry } = result;

    // Update contest with winner information
    await db.update(contests)
      .set({
        winnerId: winner.id,
        winnerEntryId: winningEntry.id,
        winningVotes: winningEntry.votes,
        status: "completed",
        updatedAt: new Date()
      })
      .where(eq(contests.id, contestId));

    // Update model's contests won count
    await db.update(models)
      .set({
        contestsWon: sql`${models.contestsWon} + 1`,
        updatedAt: new Date()
      })
      .where(eq(models.id, winner.id));
  }

  async getContestWinner(contestId: number): Promise<any | null> {
    const result = await db.select({
      contest: {
        id: contests.id,
        title: contests.title,
        prizeAmount: contests.prizeAmount,
        prizeCurrency: contests.prizeCurrency,
        winningVotes: contests.winningVotes,
        status: contests.status,
      },
      winner: {
        id: models.id,
        name: models.name,
        stageName: models.stageName,
        profileImage: models.profileImage,
        userId: models.userId,
      },
      winningEntry: {
        id: contestEntries.id,
        photoUrl: contestEntries.photoUrl,
        title: contestEntries.title,
        description: contestEntries.description,
        votes: contestEntries.votes,
      }
    })
      .from(contests)
      .leftJoin(models, eq(contests.winnerId, models.id))
      .leftJoin(contestEntries, eq(contests.winnerEntryId, contestEntries.id))
      .where(eq(contests.id, contestId))
      .limit(1);

    if (result.length === 0 || !result[0].winner) {
      return null;
    }

    return result[0];
  }

  async getModelWinnings(modelId: number): Promise<any[]> {
    const winnings = await db.select({
      contestId: contests.id,
      contestTitle: contests.title,
      prizeAmount: contests.prizeAmount,
      prizeCurrency: contests.prizeCurrency,
      winningVotes: contests.winningVotes,
      contestEndDate: contests.endDate,
      winningPhoto: contestEntries.photoUrl,
      winningPhotoTitle: contestEntries.title,
      prizeRequestId: prizeRequests.id,
      prizeRequestStatus: prizeRequests.status,
    })
      .from(contests)
      .innerJoin(contestEntries, eq(contests.winnerEntryId, contestEntries.id))
      .leftJoin(prizeRequests, and(
        eq(prizeRequests.contestId, contests.id),
        eq(prizeRequests.modelId, modelId)
      ))
      .where(eq(contests.winnerId, modelId))
      .orderBy(desc(contests.endDate));

    return winnings;
  }

  // Prize Request Methods
  async createPrizeRequest(request: InsertPrizeRequest): Promise<PrizeRequest> {
    const [newRequest] = await db.insert(prizeRequests).values({
      contestId: request.contestId,
      modelId: request.modelId,
      userId: request.userId,
      requestMessage: request.requestMessage,
      contactInfo: request.contactInfo,
      status: "pending",
    }).returning();

    return newRequest;
  }

  async getPrizeRequestsByModel(modelId: number): Promise<PrizeRequest[]> {
    return await db.select().from(prizeRequests)
      .where(eq(prizeRequests.modelId, modelId))
      .orderBy(desc(prizeRequests.createdAt));
  }

  async getPrizeRequests(status?: string): Promise<PrizeRequest[]> {
    let query = db.select({
      id: prizeRequests.id,
      contestId: prizeRequests.contestId,
      modelId: prizeRequests.modelId,
      userId: prizeRequests.userId,
      requestMessage: prizeRequests.requestMessage,
      contactInfo: prizeRequests.contactInfo,
      status: prizeRequests.status,
      adminNotes: prizeRequests.adminNotes,
      createdAt: prizeRequests.createdAt,
      updatedAt: prizeRequests.updatedAt,
      contestTitle: contests.title,
      modelName: models.name,
      userEmail: users.email,
      prizeAmount: contests.prizeAmount,
      prizeCurrency: contests.prizeCurrency,
    })
      .from(prizeRequests)
      .innerJoin(contests, eq(prizeRequests.contestId, contests.id))
      .innerJoin(models, eq(prizeRequests.modelId, models.id))
      .innerJoin(users, eq(prizeRequests.userId, users.id));

    if (status && status !== "all") {
      query = query.where(eq(prizeRequests.status, status));
    }

    return await query.orderBy(desc(prizeRequests.createdAt));
  }

  async updatePrizeRequestStatus(id: number, status: string, adminNotes?: string): Promise<PrizeRequest | undefined> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const [updatedRequest] = await db.update(prizeRequests)
      .set(updateData)
      .where(eq(prizeRequests.id, id))
      .returning();

    return updatedRequest;
  }

  async hasPrizeRequest(contestId: number, modelId: number): Promise<boolean> {
    const result = await db.select({ id: prizeRequests.id })
      .from(prizeRequests)
      .where(and(
        eq(prizeRequests.contestId, contestId),
        eq(prizeRequests.modelId, modelId)
      ))
      .limit(1);

    return result.length > 0;
  }

  // Winners Management Methods
  async getContestWinners(): Promise<any[]> {
    const winners = await db.select({
      id: contests.id,
      contestTitle: contests.title,
      contestId: contests.id,
      modelName: models.name,
      stageName: models.stageName,
      email: users.email,
      instagramHandle: models.instagramHandle,
      location: models.location,
      winningVotes: contests.winningVotes,
      prizeAmount: contests.prizeAmount,
      prizeCurrency: contests.prizeCurrency,
      contestEndDate: contests.endDate,
      profileImage: models.profileImage,
      bio: models.bio,
      dateOfBirth: models.dateOfBirth,
    })
      .from(contests)
      .innerJoin(models, eq(contests.winnerId, models.id))
      .innerJoin(users, eq(models.userId, users.id))
      .where(not(isNull(contests.winnerId)))
      .orderBy(desc(contests.endDate));

    return winners;
  }

  async removeContestWinner(contestId: number): Promise<boolean> {
    try {
      const [updatedContest] = await db.update(contests)
        .set({
          winnerId: null,
          winnerEntryId: null,
          winningVotes: 0,
          updatedAt: new Date()
        })
        .where(eq(contests.id, contestId))
        .returning();

      return !!updatedContest;
    } catch (error) {
      console.error("Error removing contest winner:", error);
      return false;
    }
  }

  // Get model's active contest entry (for vote purchasing)
  async getModelActiveContestEntry(modelId: number): Promise<any> {
    const activeEntry = await db.select({
      id: contestEntries.id,
      contestId: contestEntries.contestId,
      votes: contestEntries.votes,
      contestTitle: contests.title,
      contestStatus: contests.status,
    })
      .from(contestEntries)
      .innerJoin(contests, eq(contestEntries.contestId, contests.id))
      .where(and(
        eq(contestEntries.modelId, modelId),
        eq(contestEntries.status, "approved"),
        eq(contests.status, "active")
      ))
      .limit(1);

    return activeEntry[0];
  }

  // Update contest entry votes (for vote purchasing)
  async updateContestEntryVotes(entryId: number, votes: number): Promise<void> {
    await db.update(contestEntries)
      .set({ votes })
      .where(eq(contestEntries.id, entryId));
  }
}

export const storage = new DatabaseStorage();