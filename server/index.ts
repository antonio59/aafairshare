import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage, IStorage } from "./storage"; 
import { db, executeSqlFileWithPostgres, initializeDatabase } from "./db";

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
  try {
    log("Initializing database connection...");
    // Initialize database
    await initializeDatabase();
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
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  let port = 5000;

  // Enhanced logging for server start
  const startServer = () => {
    const startWithPort = (retryPort) => {
      server.listen({
        port: retryPort,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
      log(`Server is running and accessible at http://0.0.0.0:${port}`);
      log(`Local access URL: http://localhost:${port}`);

      // Simplify logging for Replit environment
      log(`The app is now running and should be accessible via Replit`);
      log(`If you're accessing from outside Replit, use http://0.0.0.0:${port}`);

      // Show appropriate storage message
      if (storageImplementation instanceof MemStorage) {
        log("Data will be stored in-memory only (will be lost on restart).");
      }
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${retryPort} is busy, trying ${retryPort + 1}...`);
          startWithPort(retryPort + 1);
        } else {
          throw err;
        }
      });
    };

    startWithPort(port);
  };

  startServer();
})();