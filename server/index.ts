import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage, MemStorage, IStorage } from "./storage"; 
import { SupabaseStorage } from "./supabaseStorage";
import { initializeSupabaseDatabase } from "./initSupabase";
import { createSupabaseFunctions } from "./createSupabaseFunctions";
import { executeSqlFile } from "./sqlExecutor";
import { executeSqlFileWithPostgres } from "./db";
import { DatabaseStorage } from "./storage";

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
    // Try to initialize the database using direct PostgreSQL access
    log("Initializing database with direct PostgreSQL access...");
    
    // Create the database tables using our SQL script
    const result = await executeSqlFileWithPostgres();
    if (result.success) {
      log("Successfully created database tables with direct PostgreSQL");
      
      // Use DatabaseStorage implementation with Drizzle ORM
      storageImplementation = new DatabaseStorage();
      log("Using direct PostgreSQL database storage");
    } else {
      log(`Error creating database tables: ${result.message}`);
      
      // Fall back to trying Supabase
      const supabaseUrl = process.env.SUPABASE_URL || (import.meta.env.SUPABASE_URL as string);
      const supabaseKey = process.env.SUPABASE_KEY || (import.meta.env.SUPABASE_KEY as string);
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || (import.meta.env.SUPABASE_SERVICE_KEY as string);
      
      // Try to use Supabase with service key if available
      if (supabaseUrl && supabaseServiceKey) {
        log("Supabase service key found - using Supabase for persistent storage");
        try {
          // Initialize the SupabaseStorage
          storageImplementation = new SupabaseStorage();
          // Execute createSupabaseFunctions to create any required SQL functions 
          await createSupabaseFunctions();
          log("Successfully initialized Supabase storage with service key");
        } catch (error) {
          log(`Error initializing Supabase storage: ${error}`);
          log("Falling back to in-memory storage");
          storageImplementation = storage;
        }
      } else if (supabaseUrl && supabaseKey) {
        log("Supabase API key found but no service key - attempting to use Supabase for storage");
        try {
          // Initialize the SupabaseStorage
          storageImplementation = new SupabaseStorage();
          log("Successfully initialized Supabase storage with regular API key");
        } catch (error) {
          log(`Error initializing Supabase storage: ${error}`);
          log("Falling back to in-memory storage");
          storageImplementation = storage;
        }
      } else {
        log("No Supabase credentials found. Using in-memory storage only.");
        storageImplementation = storage;
      }
    }
  } catch (error) {
    log(`Error during database initialization: ${error}`);
    log("Falling back to in-memory storage");
    storageImplementation = storage;
  }
  
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
        log("Data will be stored persistently in Supabase.");
        // Check environment variables directly
        if (process.env.SUPABASE_SERVICE_KEY) {
          log("Using service key with admin privileges for database operations.");
        } else {
          log("Using regular API key for database operations.");
        }
      } else if (storageImplementation instanceof DatabaseStorage) {
        log("Data will be stored persistently in PostgreSQL database.");
      } else {
        log("Data will be stored in-memory only (will be lost on restart).");
        // Check environment variables directly
        if (process.env.SUPABASE_URL && (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY)) {
          log("Note: Database connection failed, falling back to in-memory storage.");
        }
      }
    });
  };
  
  startServer();
})();
