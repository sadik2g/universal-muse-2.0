import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertModelSchema, insertVoteSchema, insertContactSchema, registerModelSchema, createContestSchema, models, contests, contestEntries } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { desc, eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51NLQZGBKoaPytA6MAfUfzE2TCDqSTyuKQ09WeqWaGdAHMmQajN46rhByQYencihzGluT1unfxXJZMMKDkAGMA8Gj00XsLqjQWG" as string, {
  apiVersion: "2025-07-30.basil",
});

export function setupWebhookRoute(app: express.Express) {
  app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    if (typeof sig !== "string") {
      console.error("Missing or invalid Stripe signature header");
      return res.status(400).send("Missing or invalid Stripe signature header");
    }

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (!session.metadata) {
        return res.status(400).send("Session metadata is missing");
      }

      const packageId = session.metadata.packageId;
      const userId = session.metadata.userId;

      const model = await storage.getModelByUserId(userId);
      if (!model) return res.status(404).send("Model not found");

      const activeContestEntry = await storage.getModelActiveContestEntry(model.id);
      if (!activeContestEntry) return res.status(404).send("Active contest entry not found");

      const packageDetails = getPackageDetails(packageId);
      if (!packageDetails) return res.status(400).send("Invalid package ID");

      const currentEntryVotes = activeContestEntry.votes || 0;
      const newEntryVotes = currentEntryVotes + packageDetails.totalVotes;
      await storage.updateContestEntryVotes(activeContestEntry.id, newEntryVotes);
      const fullVotes = model.totalVotes || 0
      const currentModelVotes = model.activeContestVotes || 0;
      const newModelVotes = currentModelVotes + packageDetails.totalVotes;
      await storage.updateModelVotes(model.id, newModelVotes, fullVotes);

      console.log(`Votes updated for model ${model.id}`);
    }

    res.status(200).json({ received: true });
  });
}

// Session middleware
const PgSession = connectPg(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });


  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Configure session middleware
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false, // Table already exists from schema
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerModelSchema.parse(req.body);

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const { user, model } = await storage.registerModel(validatedData);
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).modelId = model.id;

      res.status(201).json({
        message: "Registration successful",
        user: { id: user.id, email: user.email, userType: user.userType },
        model: { id: model.id, name: model.name, profileImage: model.profileImage }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // For admin users, don't require a model profile
      let model = null;
      if (user.userType !== "admin") {
        model = await storage.getModelByUserId(user.id);
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).modelId = model?.id;

      res.json({
        message: "Login successful",
        user: { id: user.id, email: user.email, userType: user.userType },
        model: model ? { id: model.id, name: model.name, profileImage: model.profileImage } : null
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For admin users, don't require a model profile
      if (user.userType === "admin") {
        return res.json({
          user: { id: userId, email: user.email, userType: user.userType },
          model: null
        });
      }

      // For regular users, require a model profile
      const model = await storage.getModelByUserId(Number(userId));
      if (!model) {
        return res.status(404).json({ message: "Model profile not found" });
      }

      res.json({
        user: { id: userId, email: user.email, userType: user.userType },
        model: {
          id: model.id,
          name: model.name,
          stageName: model.stageName,
          profileImage: model.profileImage,
          bio: model.bio,
          location: model.location,
          instagramHandle: model.instagramHandle,
          totalVotes: model.totalVotes,
          activeContestVotes: model.activeContestVotes,
          contestsWon: model.contestsWon,
          contestsJoined: model.contestsJoined,
          currentRanking: model.currentRanking,
          createdAt: model.createdAt,
        }
      });
    } catch (error) {
      console.error("Auth me error:", error);
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // File upload endpoints
  app.post("/api/upload/banner", requireAuth, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return the URL path to the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  app.post("/api/upload/profile", requireAuth, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      // Return the URL path to the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Profile upload error:", error);
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  });

  // Profile update endpoint
  app.put("/api/profile/update", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const model = await storage.getModelByUserId(userId);

      if (!model) {
        return res.status(404).json({ message: "Model profile not found" });
      }

      const { name, stageName, bio, location, instagramHandle, profileImage } = req.body;

      const updatedModel = await storage.updateModel(model.id, {
        name,
        stageName,
        bio,
        location,
        instagramHandle,
        profileImage,
      });

      res.json({
        message: "Profile updated successfully",
        model: updatedModel
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // My submissions endpoint with pagination
  app.get("/api/my-submissions", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const model = await storage.getModelByUserId(userId);

      if (!model) {
        return res.status(404).json({ message: "Model profile not found" });
      }

      const { status = null, page = "1", limit = "6" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const result = await storage.getSubmissionsByModelIdPaginated(
        model.id,
        status as string | null,
        limitNum,
        offset
      );

      res.json({
        submissions: result.submissions,
        total: result.total,
        page: pageNum,
        totalPages: Math.ceil(result.total / limitNum)
      });
    } catch (error) {
      console.error("Get submissions error:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  // Models
  app.get("/api/models/top", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const models = await storage.getTopModels(limit);
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top models" });
    }
  });

  app.get("/api/models/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const model = await storage.getModel(id);
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch model" });
    }
  });

  app.post("/api/models", async (req, res) => {
    try {
      const validatedData = insertModelSchema.parse(req.body);

      // Check if email already exists
      const existingModel = await storage.getModelByEmail(validatedData.email);
      if (existingModel) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const model = await storage.createModel(validatedData);
      res.status(201).json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create model" });
    }
  });

  // Contests
  app.get("/api/contests", async (req, res) => {
    try {
      const status = req.query.status as string;
      let contests;

      if (status === 'active') {
        contests = await storage.getActiveContests();
      } else {
        contests = await storage.getAllContests();
      }

      // Add entry count and other calculated fields for each contest
      const contestsWithCounts = await Promise.all(contests.map(async (contest) => {
        const entryCount = (await storage.getContestEntries(contest.id)).length;
        const totalVotes = await storage.getContestTotalVotes(contest.id);

        return {
          ...contest,
          entryCount: entryCount || 0,
          totalVotes: totalVotes || 0,
          image: contest.bannerImage || "https://images.unsplash.com/photo-1594736797933-d0ef5d2fe9c2?w=800&h=400&fit=crop"
        };
      }));

      res.json(contestsWithCounts);
    } catch (error) {
      console.error("Contests fetch error:", error);
      res.status(500).json({ message: "Failed to fetch contests" });
    }
  });

  app.get("/api/contests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Fetching contest with ID:", id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }

      const contestData = await storage.getContestWithEntries(id);
      console.log("Contest data retrieved:", contestData ? "Found" : "Not found");

      if (!contestData) {
        return res.status(404).json({ message: "Contest not found" });
      }
      res.json(contestData);
    } catch (error) {
      console.error("Contest fetch error:", error);
      res.status(500).json({ message: "Failed to fetch contest" });
    }
  });

  // Voting
  app.post("/api/votes", async (req, res) => {
    try {
      const voterIp = req.ip || req.connection.remoteAddress || "unknown";
      const { contestId, modelId } = req.body;

      // First check if user has already voted in this contest
      const hasVotedInContest = await storage.hasUserVotedInContest(contestId, voterIp);

      if (hasVotedInContest) {
        // Get which model they voted for
        const existingVote = await storage.getUserVoteInContest(contestId, voterIp);
        if (existingVote && existingVote.modelId === modelId) {
          return res.status(400).json({ message: "You have already voted for this model in this contest" });
        } else {
          return res.status(400).json({
            message: "You have already voted in this contest. You can only vote for one model per contest."
          });
        }
      }

      // Find the contest entry for this model
      const contestEntries = await storage.getContestEntries(contestId);
      const entry = contestEntries.find(e => e.modelId === modelId);

      if (!entry) {
        return res.status(404).json({ message: "Model entry not found in this contest" });
      }

      const voteData = {
        entryId: entry.id,
        voterIp,
        voteType: req.body.voteType || 'free',
        voteWeight: req.body.voteWeight || 1,
      };

      const validatedData = insertVoteSchema.parse(voteData);

      // Create the vote
      const vote = await storage.createVote(validatedData);

      // Update vote counts for the entire contest
      await storage.updateContestVoteCounts(contestId);

      res.status(201).json({
        message: "Vote cast successfully",
        vote,
        effect: validatedData.voteType
      });
    } catch (error) {
      console.error("Vote error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to cast vote" });
    }
  });

  // Check voting status for a contest
  app.get("/api/contests/:id/vote-status", async (req, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const voterIp = req.ip || req.connection.remoteAddress || "unknown";

      const hasVoted = await storage.hasUserVotedInContest(contestId, voterIp);
      const votedFor = hasVoted ? await storage.getUserVoteInContest(contestId, voterIp) : null;

      res.json({
        hasVoted,
        votedModelId: votedFor?.modelId || null
      });
    } catch (error) {
      console.error("Vote status error:", error);
      res.status(500).json({ message: "Failed to check vote status" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as 'daily' | 'weekly' | 'all' || 'all';
      const leaderboard = await storage.getLeaderboard(timeframe);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Active Contest Leaderboard - Top 3 from current active contests
  app.get("/api/leaderboard/active", async (req, res) => {
    try {
      const leaderboard = await storage.getActiveContestLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Active leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch active contest leaderboard" });
    }
  });

  // Vote Packages
  app.get("/api/vote-packages", async (req, res) => {
    try {
      const packages = await storage.getVotePackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vote packages" });
    }
  });

  // Purchase vote package (models only - must be actively participating in ongoing contest)
  app.post("/api/vote-packages/purchase", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { packageId } = req.body;

      // Verify user is a model
      const model = await storage.getModelByUserId(userId);
      if (!model) {
        return res.status(403).json({ message: "Only models can purchase vote packages" });
      }

      // Check if model is actively participating in any ongoing contest
      const activeContestEntry = await storage.getModelActiveContestEntry(model.id);
      if (!activeContestEntry) {
        return res.status(403).json({
          message: "You must be actively participating in an ongoing contest to purchase vote packages"
        });
      }

      // Get package details based on frontend package ID
      const packageDetails = getPackageDetails(packageId);
      if (!packageDetails) {
        return res.status(400).json({ message: "Invalid package selected" });
      }

      // For demo purposes, we'll simulate the purchase and add votes directly to contest entry
      // In a real app, this would integrate with a payment processor like Stripe

      // Add votes to the model's active contest entry
      const currentEntryVotes = activeContestEntry.votes || 0;
      const newEntryVotes = currentEntryVotes + packageDetails.totalVotes;

      await storage.updateContestEntryVotes(activeContestEntry.id, newEntryVotes);

      // Also update model's total votes for display purposes
      const currentModelVotes = model.totalVotes || 0;
      const newModelVotes = currentModelVotes + packageDetails.totalVotes;

      // If totalVotes is not a valid property, remove it from the update object
      await storage.updateModel(model.id, {});
      // If you want to update totalVotes, ensure your updateModel method and its type definition allow 'totalVotes'
      // Example: await storage.updateModelVotes(model.id, newModelVotes);

      res.json({
        message: "Vote package purchased successfully!",
        packageName: packageDetails.name,
        votesAdded: packageDetails.totalVotes,
        contestTitle: activeContestEntry.contestTitle,
        newContestVotes: newEntryVotes,
        newTotalVotes: newModelVotes
      });

    } catch (error) {
      console.error("Vote package purchase error:", error);
      res.status(500).json({ message: "Failed to purchase vote package" });
    }
  });
  // POST /api/create-checkout-session
  app.post("/api/create-checkout-session", requireAuth, async (req, res) => {
    const { packageId } = req.body;
    const userId = (req.session as any).userId;

    // Verify user is a model
    const model = await storage.getModelByUserId(userId);
    if (!model) {
      return res.status(403).json({ message: "Only models can purchase vote packages" });
    }

    // Check if model is actively participating in any ongoing contest
    const activeContestEntry = await storage.getModelActiveContestEntry(model.id);
    if (!activeContestEntry) {
      return res.status(403).json({
        message: "You must be actively participating in an ongoing contest to purchase vote packages"
      });
    }

    // Get package details based on frontend package ID
    const packageDetails = getPackageDetails(packageId);
    if (!packageDetails) {
      return res.status(400).json({ message: "Invalid package selected" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: Math.round(packageDetails.price * 100),
          product_data: {
            name: packageDetails.name,
          },
        },
        quantity: 1,
      }],
      metadata: {
        userId,
        packageId,
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/fail`,
    });

    // Otherwise, just call updateModel with an empty object or only allowed properties
    res.json({ url: session.url });
  });

  app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    console.log("Received webhook event:", sig);
    if (typeof sig !== "string") {
      console.error("Missing or invalid Stripe signature header");
      return res.status(400).send("Missing or invalid Stripe signature header");
    }
    console.log("prcoess.env.STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET);
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error("Webhook signature verification failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (!session.metadata) {
        return res.status(400).send("Session metadata is missing");
      }
      const packageId = session.metadata.packageId;
      const userId = (session.metadata as any).userId;

      const model = await storage.getModelByUserId(userId);
      if (!model) return res.status(404).send("Model not found");

      const activeContestEntry = await storage.getModelActiveContestEntry(model.id);
      if (!activeContestEntry) return res.status(404).send("Active contest entry not found");

      const packageDetails = getPackageDetails(packageId);
      if (!packageDetails) return res.status(400).send("Invalid package ID");

      const currentEntryVotes = activeContestEntry.votes || 0;
      const newEntryVotes = currentEntryVotes + packageDetails.totalVotes;
      await storage.updateContestEntryVotes(activeContestEntry.id, newEntryVotes);

      const currentModelVotes = model.totalVotes || 0;
      const newModelVotes = currentModelVotes + packageDetails.totalVotes;
      await storage.updateModelVotes(model.id, newModelVotes);

      console.log(`Votes successfully updated for model ${model.id}`);
    }

    res.status(200).json({ received: true });
  });

  // Submit contest entry
 app.post(
  "/api/contest-entries",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { contestId, title, description } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      if (!contestId || !title || !description) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const userId = (req.session as any).userId;
      const model = await storage.getModelByUserId(userId);
      if (!model) {
        return res.status(404).json({ message: "Model profile not found" });
      }

      const contest = await storage.getContestById(contestId.toString());
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }

      const existingEntry =
        await storage.getContestEntryByModelAndContest(
          model.id,
          Number(contestId)
        );

      if (existingEntry) {
        return res
          .status(400)
          .json({ message: "Already submitted to this contest" });
      }

        type ContestEntryInsert = {
  contestId: number;
  modelId: number;
  title: string;
  description: string;
  photoUrl: string;
  status: string;
};

      // ✅ CORRECT image path
      const photoUrl = `/uploads/${req.file.filename}`;

      const entry = await storage.createContestEntry({
        contestId: Number(contestId),
        modelId: model.id,
        title,
        description,
        photoUrl,
        status: "pending",
      });
        // 🔥 ADD THIS LINE RIGHT HERE
      console.log("🎯 Saved entry:", entry);
      
      // ✅ ONE-LINE PROOF
console.log("📸 DB INSERT CONFIRMED → id:", entry.id, "| photo_url:", entry.photoUrl);
      
      res.json({
        message: "Photo submitted successfully",
        entry: {
          id: entry.id,
          title: entry.title,
          status: entry.status,
          submittedAt: entry.submittedAt?.toISOString(),
          photoUrl, // frontend (camelCase)
        },
      });
    } catch (error) {
      console.error("Submit entry error:", error);
      res.status(500).json({ message: "Failed to submit photo" });
    }
  }
);


  // Contact form - creates complaints
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);

      // Create complaint from contact form submission
      const complaint = await storage.createComplaint({
        reporterName: validatedData.name,
        reporterEmail: validatedData.email,
        type: "other",
        subject: validatedData.subject,
        description: validatedData.message,
        targetType: "general",
        targetId: "contact-form",
        targetName: "Contact Form Submission",
        status: "new",
        priority: "medium",
      });

      res.status(201).json({
        message: "Message sent successfully",
        complaintId: complaint.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      console.error("Contact submission error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Admin middleware - require admin user type
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || user.userType !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Authorization check failed" });
    }
  };

  // Admin Complaint Management
  app.put("/api/admin/complaints/:id", requireAdmin, async (req, res) => {
    try {
      const { status, adminNotes } = req.body;

      await storage.updateComplaint(req.params.id, status, adminNotes);
      res.json({ message: "Complaint updated successfully" });
    } catch (error) {
      console.error("Update complaint error:", error);
      res.status(500).json({ message: "Failed to update complaint" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/admin/contests", requireAdmin, async (req, res) => {
    try {
      const contests = await storage.getAdminContests();
      res.json(contests);
    } catch (error) {
      console.error("Admin contests error:", error);
      res.status(500).json({ message: "Failed to fetch contests" });
    }
  });

  app.post("/api/admin/contests", requireAdmin, async (req, res) => {
    try {
      const validatedData = createContestSchema.parse(req.body);
      const contest = await storage.createContest(validatedData);

      let message = "Contest created successfully";
      if (validatedData.status === "active") {
        message = "Contest created and activated successfully. All other active contests have been automatically deactivated.";
      }

      res.status(201).json({
        message,
        contest: {
          id: contest.id.toString(),
          title: contest.title,
          description: contest.description,
          startDate: contest.startDate.toISOString(),
          endDate: contest.endDate.toISOString(),
          prizeAmount: Number(contest.prizeAmount),
          status: contest.status,
          createdAt: contest.createdAt?.toISOString(),
        }
      });
    } catch (error) {
      console.error("Create contest error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid contest data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create contest" });
    }
  });

  app.put("/api/admin/contests/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = createContestSchema.parse(req.body);
      const contest = await storage.updateContest(req.params.id, validatedData);

      let message = "Contest updated successfully";
      if (validatedData.status === "active") {
        message = "Contest activated successfully. All other active contests have been automatically deactivated to ensure only one contest is active at a time.";
      }

      res.json({
        message,
        contest: {
          id: contest.id.toString(),
          title: contest.title,
          description: contest.description,
          startDate: contest.startDate.toISOString(),
          endDate: contest.endDate.toISOString(),
          prizeAmount: Number(contest.prizeAmount),
          status: contest.status,
          createdAt: contest.createdAt?.toISOString(),
        }
      });
    } catch (error) {
      console.error("Update contest error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid contest data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update contest" });
    }
  });

  app.delete("/api/admin/contests/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteContest(req.params.id);
      res.json({ message: "Contest deleted successfully" });
    } catch (error) {
      console.error("Delete contest error:", error);
      res.status(500).json({ message: "Failed to delete contest" });
    }
  });

  // Admin - Get pending submissions for review
  app.get("/api/admin/submissions/pending", requireAdmin, async (req, res) => {
    try {
      const pendingSubmissions = await storage.getPendingSubmissions();
      res.json(pendingSubmissions);
    } catch (error) {
      console.error("Get pending submissions error:", error);
      res.status(500).json({ message: "Failed to fetch pending submissions" });
    }
  });

  // Admin - Approve/reject submission
  app.put("/api/admin/submissions/:id", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }

      const submission = await storage.updateSubmissionStatus(req.params.id, status);
      res.json({
        message: `Submission ${status} successfully`,
        submission
      });
    } catch (error) {
      console.error("Update submission error:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  app.get("/api/admin/submissions", requireAdmin, async (req, res) => {
    try {
      const { status = "pending", page = "1", limit = "12" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const result = await storage.getAdminSubmissionsPaginated(
        status as string,
        limitNum,
        offset
      );

      res.json({
        submissions: result.submissions,
        total: result.total,
        page: pageNum,
        totalPages: Math.ceil(result.total / limitNum)
      });
    } catch (error) {
      console.error("Admin submissions error:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/admin/submissions/:id/approve", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { modelId } = req.body;
      console.log("Approve submission request received:", { id, modelId });
      if (!modelId) {
        return res.status(400).json({ message: "modelId is required" });
      }

      console.log("Approving submission with ID:", id, "and Model ID:", modelId);

      // Approve the submission
      await storage.updateSubmissionStatus(id, "approved", modelId);

      // Increment contestsJoined by 1 for the model
      await storage.incrementContestsJoined(modelId);

      res.json({ message: "Submission approved" });
    } catch (error) {
      console.error("Approve submission error:", error);
      res.status(500).json({ message: "Failed to approve submission" });
    }
  });

  app.post("/api/admin/submissions/:id/reject", requireAdmin, async (req, res) => {
    try {
      await storage.updateSubmissionStatus(req.params.id, "rejected");
      res.json({ message: "Submission rejected" });
    } catch (error) {
      console.error("Reject submission error:", error);
      res.status(500).json({ message: "Failed to reject submission" });
    }
  });

  app.get("/api/admin/analytics/:timeRange?", requireAdmin, async (req, res) => {
    try {
      const timeRange = req.params.timeRange || "7d";
      const analytics = await storage.getAdminAnalytics(timeRange);
      res.json(analytics);
    } catch (error) {
      console.error("Admin analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Contest winner routes
  // app.post("/api/admin/contests/:id/set-winner", requireAdmin, async (req, res) => {
  //   try {
  //     const contestId = parseInt(req.params.id);
  //     await storage.setContestWinner(contestId);
  //     res.json({ message: "Contest winner set successfully" });
  //   } catch (error) {
  //     console.error("Set contest winner error:", error);
  //     res.status(500).json({ message: "Failed to set contest winner" });
  //   }
  // });

  app.get("/api/contests/:id/winner", async (req, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const winner = await storage.getContestWinner(contestId);
      res.json(winner);
    } catch (error) {
      console.error("Get contest winner error:", error);
      res.status(500).json({ message: "Failed to fetch contest winner" });
    }
  });

  app.get("/api/my-winnings", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const model = await storage.getModelByUserId(userId);

      if (!model) {
        return res.status(404).json({ message: "Model profile not found" });
      }

      const winnings = await storage.getModelWinnings(model.id);
      res.json(winnings);
    } catch (error) {
      console.error("Get model winnings error:", error);
      res.status(500).json({ message: "Failed to fetch winnings" });
    }
  });

  app.get("/api/admin/complaints", requireAdmin, async (req, res) => {
    try {
      const { status = "new", priority = "all", page = "1", limit = "10" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const result = await storage.getAdminComplaints(
        status as string,
        priority as string,
        pageNum,
        limitNum
      );
      res.json(result);
    } catch (error) {
      console.error("Admin complaints error:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  // Prize Request Routes
  app.post("/api/prize-requests", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const model = await storage.getModelByUserId(userId);

      if (!model) {
        return res.status(404).json({ message: "Model profile not found" });
      }

      const { contestId, requestMessage, contactInfo } = req.body;

      if (!contestId || !contactInfo) {
        return res.status(400).json({ message: "Contest ID and contact info are required" });
      }

      // Check if model already has a prize request for this contest
      const hasExistingRequest = await storage.hasPrizeRequest(contestId, model.id);
      if (hasExistingRequest) {
        return res.status(400).json({ message: "Prize request already submitted for this contest" });
      }

      const prizeRequest = await storage.createPrizeRequest({
        contestId: parseInt(contestId),
        modelId: model.id,
        userId: userId,
        requestMessage,
        contactInfo,
      });

      res.status(201).json({ message: "Prize request submitted successfully", request: prizeRequest });
    } catch (error) {
      console.error("Create prize request error:", error);
      res.status(500).json({ message: "Failed to submit prize request" });
    }
  });

  app.get("/api/my-prize-requests", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const model = await storage.getModelByUserId(userId);

      if (!model) {
        return res.status(404).json({ message: "Model profile not found" });
      }

      const requests = await storage.getPrizeRequestsByModel(model.id);
      res.json(requests);
    } catch (error) {
      console.error("Get prize requests error:", error);
      res.status(500).json({ message: "Failed to fetch prize requests" });
    }
  });

  app.get("/api/admin/prize-requests", requireAdmin, async (req, res) => {
    try {
      const { status = "all" } = req.query;
      const requests = await storage.getPrizeRequests(status as string);
      console.log("Fetched prize requests:", requests, "requests found");
      res.json(requests);
    } catch (error) {
      console.error("Admin prize requests error:", error);
      res.status(500).json({ message: "Failed to fetch prize requests" });
    }
  });

  app.put("/api/admin/prize-requests/:id", requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedRequest = await storage.updatePrizeRequestStatus(requestId, status, adminNotes);

      if (!updatedRequest) {
        return res.status(404).json({ message: "Prize request not found" });
      }

      res.json({ message: "Prize request updated successfully", request: updatedRequest });
    } catch (error) {
      console.error("Update prize request error:", error);
      res.status(500).json({ message: "Failed to update prize request" });
    }
  });

  // Winners management routes

  app.get("/api/admin/winners", requireAdmin, async (req, res) => {
    try {
      const completedContests = await db
        .select({
          id: contests.id,
          title: contests.title,
          status: contests.status,
          winnerId: contests.winnerId,
          winnerEntryId: contests.winnerEntryId,
          winningVotes: contests.winningVotes,
          winnerAnnouced: contests.winnerAnnouced,
          endDate: contests.endDate,
        })
        .from(contests)
        .where(eq(contests.status, "completed"))
        .orderBy(desc(contests.endDate));

      const result = [];

      for (const contest of completedContests) {
        const entries = await db
          .select({
            id: contestEntries.id,
            modelId: contestEntries.modelId,
            title: contestEntries.title,
            //photoUrl: entry.photo_url, // ✅ map DB field
            photoUrl: contestEntries.photo_url, // ✅ correct
            votes: contestEntries.votes,
          })
          .from(contestEntries)
          .where(eq(contestEntries.contestId, contest.id));

        // Update votes from model.activeContestVotes
        for (const entry of entries) {
          const [model] = await db
            .select({ activeContestVotes: models.activeContestVotes })
            .from(models)
            .where(eq(models.id, entry.modelId));

          if (model) {
            entry.votes = model.activeContestVotes;

            await db
              .update(contestEntries)
              .set({ votes: model.activeContestVotes })
              .where(eq(contestEntries.id, entry.id));
          }
        }

        // Sort and rank
        const sortedEntries = entries.sort((a, b) => b.votes - a.votes);

        for (let i = 0; i < sortedEntries.length; i++) {
          const rank = i + 1;

          await db
            .update(contestEntries)
            .set({ ranking: rank })
            .where(eq(contestEntries.id, sortedEntries[i].id));
        }

        const topEntry = sortedEntries[0];
        const tiedTopEntries = sortedEntries.filter(e => e.votes === topEntry.votes);

        // If winner not set and single top entry exists
        if (!contest.winnerId && tiedTopEntries.length === 1) {
          const winnerEntry = topEntry;

          await db
            .update(contests)
            .set({
              winnerId: winnerEntry.modelId,
              winnerEntryId: winnerEntry.id,
              winningVotes: winnerEntry.votes,
            })
            .where(eq(contests.id, contest.id));

          result.push({
            contestId: contest.id,
            contestTitle: contest.title,
            status: contest.status,
            winnerAnnouced: contest.winnerAnnouced,
            winner: {
              modelId: winnerEntry.modelId,
              entryId: winnerEntry.id,
              title: winnerEntry.title,
              photoUrl: winnerEntry.photo_url, // ✅ use DB column
              votes: winnerEntry.votes,
              ranking: 1,
            },
          });
        } else {
          result.push({
            contestId: contest.id,
            contestTitle: contest.title,
            status: contest.status,
            winnerAnnouced: contest.winnerAnnouced,
            topVotedModels: tiedTopEntries.map((entry) => ({
              modelId: entry.modelId,
              entryId: entry.id,
              title: entry.title,
              photoUrl: entry.photo_url,
              votes: entry.votes,
            })),
          });
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Get winners error:", error);
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  // POST: Set contest winner(s) manually
  app.post("/api/admin/contests/:id/set-winner", requireAdmin, async (req, res) => {
    try {
      const contestId = parseInt(req.params.id);

      const entries = await db
        .select()
        .from(contestEntries)
        .where(eq(contestEntries.contestId, contestId))
        .orderBy(desc(contestEntries.votes));

      if (entries.length === 0) {
        return res.status(400).json({ message: "No entries for this contest" });
      }

      const topVotes = entries[0].votes;
      const topEntries = entries.filter((e) => e.votes === topVotes);

      // Mark each top model as winner
      for (const entry of topEntries) {
        await db.update(models)
          .set({ contestsWon: sql`${models.contestsWon} + 1`, activeContestVotes: 0 }) // Reset to 1
          .where(eq(models.id, entry.modelId));
      }

      // Store winner info in contest
      await db.update(contests)
        .set({
          winnerId: topEntries[0].modelId,
          winnerEntryId: topEntries[0].id,
          winningVotes: topVotes,
          status: 'completed',
          winnerAnnouced: true,
        })
        .where(eq(contests.id, contestId));

      // Reset votes for all entries
      await db.update(contestEntries)
        .set({ votes: 0 })
        .where(eq(contestEntries.contestId, contestId));

      res.json({ message: "Winner(s) set successfully" });
    } catch (error) {
      console.error("Set contest winner error:", error);
      res.status(500).json({ message: "Failed to set contest winner" });
    }
  });

  app.delete("/api/admin/winners/:id", requireAdmin, async (req, res) => {
    try {
      const winnerId = parseInt(req.params.id);

      // This deletes the winner record by setting the winner fields to null in the contest
      const result = await storage.removeContestWinner(winnerId);

      if (!result) {
        return res.status(404).json({ message: "Winner not found" });
      }

      res.json({ message: "Winner record deleted successfully" });
    } catch (error) {
      console.error("Delete winner error:", error);
      res.status(500).json({ message: "Failed to delete winner" });
    }
  });

  // Admin profile management routes
  app.put("/api/admin/profile", requireAdmin, async (req, res) => {
    try {
      const { name, email, bio, phone } = req.body;

      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.session.userId;

      const updatedProfile = await storage.updateAdminProfile(userId, {
        name,
        email,
        bio,
        phone,
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error("Update admin profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/admin/password", requireAdmin, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.session.userId;

      // Get current user to verify password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await storage.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      await storage.updateUserPassword(userId, newPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to get package details by ID
function getPackageDetails(packageId: string) {
  const packages = {
    bronze: {
      name: "Bronze Package",
      price: 9.99,
      votes: 50,
      bonus: 5,
      totalVotes: 55
    },
    silver: {
      name: "Silver Package",
      price: 19.99,
      votes: 120,
      bonus: 15,
      totalVotes: 135
    },
    gold: {
      name: "Gold Package",
      price: 39.99,
      votes: 300,
      bonus: 50,
      totalVotes: 350
    },
    diamond: {
      name: "Diamond Package",
      price: 79.99,
      votes: 750,
      bonus: 150,
      totalVotes: 900
    },
    platinum: {
      name: "Platinum Package",
      price: 149.99,
      votes: 1500,
      bonus: 400,
      totalVotes: 1900
    }
  };

  return packages[packageId as keyof typeof packages];
}
