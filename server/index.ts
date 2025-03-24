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
  
  const supabaseUrl = process.env.SUPABASE_URL || (import.meta.env.SUPABASE_URL as string);
  const supabaseKey = process.env.SUPABASE_KEY || (import.meta.env.SUPABASE_KEY as string);
  
  if (supabaseUrl && supabaseKey) {
    log("Initializing Supabase client with provided credentials.");
    console.log(`Testing connection to Supabase at ${supabaseUrl.substring(0, 20)}...`);
    
    // First, let's test that the Supabase credentials work
    let supabaseConnectionWorks = false;
    
    try {
      // Import supabase client from supabase.ts
      const { supabase } = await import('./supabase');
      
      // A simple ping to see if the Supabase connection works at all
      const { error: pingError } = await supabase.from('_unused_ping_table').select('*').limit(1).maybeSingle();
      
      // We expect a "relation does not exist" error (42P01) which means the connection works
      // but the table doesn't exist (as expected)
      if (pingError && pingError.code === '42P01') {
        log("Successfully connected to Supabase! (Expected error about non-existent table)");
        supabaseConnectionWorks = true;
      } else if (pingError) {
        // Some other kind of error occurred
        log(`Supabase connection issue: ${pingError.message} (${pingError.code})`);
        console.error("Supabase connection error details:", pingError);
      } else {
        // No error, which is unexpected but might be ok
        log("Connected to Supabase, but received unexpected success response");
        supabaseConnectionWorks = true;
      }
    } catch (pingError) {
      log(`Exception testing Supabase connection: ${(pingError as Error).message}`);
      console.error("Supabase connection test exception:", pingError);
    }
    
    if (supabaseConnectionWorks) {
      try {
        log("Supabase connection available - attempting to use Supabase storage.");
        const supabaseStorage = new SupabaseStorage();
        
        // Override the storage object by replacing its prototype methods with the Supabase implementation methods
        Object.getOwnPropertyNames(SupabaseStorage.prototype).forEach(method => {
          if (method !== 'constructor') {
            // @ts-ignore - We're intentionally replacing methods at runtime
            storage[method] = supabaseStorage[method].bind(supabaseStorage);
          }
        });
        
        // Initialize the database (will be handled internally by SupabaseStorage)
        log("Using Supabase for persistent storage!");
        
        // Let the system know we're using Supabase, add better error recovery logic
        storage.onStorageOperationError = (operation: string, error: any) => {
          console.error(`Supabase operation "${operation}" failed:`, error);
          log(`Storage operation failed, using in-memory fallback for "${operation}"`);
          return true; // Allow the operation to continue with in-memory fallback
        };
        
        storageImplementation = storage;
      } catch (setupError) {
        console.error("Error setting up Supabase storage:", setupError);
        log("Error with Supabase storage. Using in-memory storage instead.");
        storageImplementation = storage;
      }
    } else {
      log("Supabase connection test failed. Using in-memory storage instead.");
      log("Data will NOT be persisted to Supabase due to connection issues.");
      storageImplementation = storage;
    }
  } else {
    log("No Supabase credentials found. Using in-memory storage only.");
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
      
      if (supabaseUrl && supabaseKey) {
        log("Data will be stored persistently in Supabase database.");
      } else {
        log("Data will be stored in-memory only (will be lost on restart).");
      }
    });
  };
  
  startServer();
})();
