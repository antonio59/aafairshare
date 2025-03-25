import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage as memStorage, MemStorage, IStorage } from "./storage"; 
import { SupabaseStorage } from "./supabaseStorage";
import { initializeSupabaseDatabase } from "./initSupabase";
import { createSupabaseFunctions } from "./createSupabaseFunctions";
import { executeSqlFileWithPostgres } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session setup
app.use(session({
  secret: 'expense-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Create a global storage variable that will be properly initialized later
let storage: IStorage;

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Configure passport local strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await storage.getUserByUsername(username);

    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }

    if (user.password !== password) {
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log all requests for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} (${req.headers['user-agent'] || 'no-ua'})`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Log all responses
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse && path.startsWith("/api")) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }

    log(logLine);
  });

  next();
});

(async () => {
  // Initialize appropriate storage based on available credentials
  let storageImplementation: IStorage;

  try {
    // First try to use Supabase as requested by the user
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    log("Checking Supabase credentials and database access...");
    console.log("SUPABASE_URL exists:", !!supabaseUrl);
    console.log("SUPABASE_KEY exists:", !!supabaseKey);
    console.log("SUPABASE_SERVICE_KEY exists:", !!supabaseServiceKey);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    // Require Supabase credentials - don't fall back to in-memory
    if (!supabaseUrl || (!supabaseServiceKey && !supabaseKey)) {
      log("ERROR: Missing Supabase credentials. The application requires Supabase for storage.");
      throw new Error("Missing required Supabase credentials");
    }

    log("Supabase credentials found - using Supabase for cloud storage");

    // Create database schema first using direct PostgreSQL connection
    log("Creating database schema using direct PostgreSQL connection...");
    const sqlResult = await executeSqlFileWithPostgres();
    if (sqlResult.success) {
      log("Successfully created database objects via direct SQL execution");
    } else {
      log(`Warning: SQL setup encountered an issue: ${sqlResult.message}`);
      log("Will continue with Supabase API for data access");
    }

    // Initialize the SupabaseStorage after creating schema
    log("Initializing Supabase connection...");
    storageImplementation = new SupabaseStorage();

    // Attempt to run any additional initialization
    try {
      log("Initializing database tables and default data...");
      await initializeSupabaseDatabase();
      log("Database initialization completed successfully");
    } catch (initError) {
      log(`Database initialization via API encountered an issue: ${initError}`);
      log("Database access will continue to use direct SQL when needed");
    }

    log("Successfully connected to Supabase cloud storage");
  } catch (error) {
    log(`CRITICAL ERROR: Failed to initialize database: ${error}`);
    throw error; // Don't continue without database
  }

  // Set the global storage to use the initialized implementation
  storage = storageImplementation;

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;

  // Enhanced logging for server start
  const startServer = () => {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server is running and accessible at http://0.0.0.0:${port}`);
      log(`Local access URL: http://localhost:${port}`);

      // Simplify logging for Replit environment
      log(`The app is now running and should be accessible via Replit`);
      log(`If you're accessing from outside Replit, use http://0.0.0.0:${port}`);

      // Show appropriate storage message
      if (storageImplementation instanceof SupabaseStorage) {
        log("Data will be stored persistently in Supabase cloud.");
        // Check environment variables directly
        if (process.env.SUPABASE_SERVICE_KEY) {
          log("Using service key with admin privileges for database operations.");
        } else {
          log("Using regular API key for database operations.");
        }
      } else {
        log("Data will be stored in-memory only (will be lost on restart).");
        // Check environment variables directly
        if (process.env.SUPABASE_URL && (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY)) {
          log("Note: Supabase connection failed, falling back to in-memory storage.");
          log("WARNING: This is not recommended for production use.");
        }
      }
    });
  };

  startServer();
})();