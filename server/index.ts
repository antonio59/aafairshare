
import bcrypt from "bcrypt";
import express, { type Request, Response, NextFunction } from "express";
import { Storage } from "./storage";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage, IStorage } from "./storage"; 
import { db, initializeDatabase } from "./db";
import MemoryStore from 'memorystore';
import cors from 'cors';

const app = express();

// Determine environment - on Replit, we'll consider it production
const isReplit = !!process.env.REPL_ID || !!process.env.REPLIT_ENVIRONMENT;
const isProduction = app.get('env') === 'production' || isReplit;
const isDevelopment = !isProduction;

console.log(`Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
console.log(`Detected Replit environment: ${isReplit ? 'Yes' : 'No'}`);

// For Replit, cookies must be secure because it uses HTTPS for access
const forceSecureCookies = true; // Always use secure cookies in Replit

// Log all requests to help with debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'no-origin'}, Protocol: ${req.protocol}`);
  next();
});

// Enhanced CORS configuration to improve cross-origin cookie handling
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins that include replit.dev or localhost
    if (origin.includes('replit.dev') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all origins for now
  },
  credentials: true, // Critical for allowing cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Set-Cookie']
}));

// Add specific header to ensure cookies are accepted in the browser
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create memory store for sessions
const MemoryStoreSession = MemoryStore(session);
const store = new MemoryStoreSession({
  checkPeriod: 86400000 // prune expired entries every 24h
});

// Updated Cookie configuration to ensure proper cross-origin behavior
// The critical part: in Replit's environment, cookies need proper configuration
const cookieConfig = {
  // Always true for production/deployment or when using HTTPS
  secure: forceSecureCookies,
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  path: '/',
  httpOnly: true,
  // sameSite must be 'none' when secure is true for cross-site requests
  sameSite: forceSecureCookies ? 'none' as const : 'lax' as const,
  // Adding domain configuration for cookie persistence
  domain: undefined // Allow browser to automatically set cookie domain
};

console.log('Session cookie configuration:', cookieConfig);

// Enhanced session setup with additional options for cross-origin support
app.use(session({
  secret: 'expense-app-secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: cookieConfig,
  name: 'sessionId', // Custom name for better tracking
  proxy: true // Trust the reverse proxy when determining secure connections
}));

// Use the storage instance exported from storage.ts

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Configure passport local strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    console.log(`Auth attempt with email: ${email}`);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return done(null, false, { message: "Incorrect email" });
    }

    console.log(`User found: ${user.username}, checking password...`);
    
    // Use bcrypt to compare passwords
    if (!user.password) {
      console.log('User has no password');
      return done(null, false, { message: "Invalid credentials" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      return done(null, false, { message: "Invalid credentials" });
    }

    const { password: _, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);
  } catch (error) {
    console.error('Auth error:', error);
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
  console.log("Request headers:", req.headers);
  console.log("Request session:", req.session);
  console.log("Is authenticated:", req.isAuthenticated());

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
  try {
    log("Initializing database connection...");
    // Initialize database
    await initializeDatabase();
    log("Database initialized successfully");
    
    log("Database initialization completed successfully");
  } catch (error) {
    log(`CRITICAL ERROR: Failed to initialize database: ${error}`);
    throw error; // Don't continue without database
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
  const port = 5000;
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server is running and accessible at http://0.0.0.0:${port}`);
    log(`Local access URL: http://localhost:${port}`);
    log(`The app is now running and should be accessible via Replit`);
    log(`If you're accessing from outside Replit, use http://0.0.0.0:${port}`);
  }).on('error', (err) => {
    console.error('Server error:', err);
    throw err;
  });
})();