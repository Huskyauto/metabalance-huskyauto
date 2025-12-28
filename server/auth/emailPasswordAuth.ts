import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    name: "metabalance.sid",
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: sessionTtl,
    },
  });
}

export async function setupEmailPasswordAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ message: "Database not available" });
      }

      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      const [newUser] = await db.insert(users).values({
        email,
        name: name || email.split("@")[0],
        passwordHash,
        loginMethod: "email",
      }).returning();

      (req.session as any).userId = newUser.id;
      req.session.save((err) => {
        if (err) {
          console.error("[Auth] Session save error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        console.log("[Auth] Registration successful for user:", newUser.id);
        res.json({ 
          id: newUser.id, 
          email: newUser.email, 
          name: newUser.name 
        });
      });
    } catch (error) {
      console.error("[Auth] Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ message: "Database not available" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      await db.update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      (req.session as any).userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("[Auth] Session save error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        console.log("[Auth] Login successful for user:", user.id);
        res.json({ 
          id: user.id, 
          email: user.email, 
          name: user.name 
        });
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("[Auth] Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("metabalance.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ message: "Database not available" });
      }

      const [user] = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("[Auth] Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ message: "Database not available" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("[Auth] Auth check error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};
