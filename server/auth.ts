import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "../db";
import { users, User as UserType } from "@shared/schema";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const scryptAsync = promisify(scrypt);

// Extended user type without password
type UserProfile = Omit<UserType, 'password'> & {
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  theme?: string | null;
  totalPoints?: number | null;
  totalSessions?: number | null;
  totalCompletedSessions?: number | null;
  averageScore?: number | null;
  currentStreak?: number | null;
  longestStreak?: number | null;
  joinedAt?: Date | null;
  lastLoginAt?: Date | null;
};

declare global {
  namespace Express {
    interface User extends UserProfile {}
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  const sessionStore = new PostgresSessionStore({
    createTableIfMissing: true,
    conObject: {
      connectionString: process.env.DATABASE_URL,
    },
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "learning-app-session-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.username, username),
        });

        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect username or password" });
        } else {
          return done(null, { id: user.id, username: user.username });
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      
      if (!user) {
        return done(null, false);
      }

      // Return selected user information - exclude password
      done(null, {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
        totalPoints: user.totalPoints,
        totalSessions: user.totalSessions,
        totalCompletedSessions: user.totalCompletedSessions,
        averageScore: user.averageScore,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        joinedAt: user.joinedAt,
        lastLoginAt: user.lastLoginAt
      });
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, displayName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if username already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new user with extended profile
      const [user] = await db.insert(users)
        .values({
          username,
          password: await hashPassword(password),
          email: email || null,
          displayName: displayName || username,
          joinedAt: new Date(),
          totalPoints: 0,
          totalSessions: 0,
          totalCompletedSessions: 0,
          currentStreak: 0,
          longestStreak: 0,
        })
        .returning();

      // Log user in
      req.login({ id: user.id, username: user.username }, (err) => {
        if (err) return next(err);
        return res.status(201).json({ id: user.id, username: user.username });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: Express.User | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      
      // Update last login time
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));
      
      req.login(user, (err: any) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Error logging out:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
  });
}