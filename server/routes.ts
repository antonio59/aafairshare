import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, IStorage } from "./storage";
import { z } from "zod";
import { insertCategorySchema, insertExpenseSchema, insertLocationSchema, insertSettlementSchema, insertUserSchema } from "@shared/schema";
import passport from "passport";
import bcrypt from 'bcrypt';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const API_PREFIX = "/api";

  // Error handler helper function
  const handleError = (res: any, error: any) => {
    console.error("API Error:", error);
    res.status(500).json({ message: error.message || "An error occurred" });
  };

  // Authentication middleware to protect routes
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized. Please log in." });
  };

  // Authentication routes
  app.post(`${API_PREFIX}/auth/login`, (req, res, next) => {
    console.log("Login request received:", { email: req.body.email });
    
    // Determine the client's preference for JSON or HTML response
    const wantsJson = req.headers['content-type']?.includes('application/json') || 
                     req.headers['accept']?.includes('application/json') ||
                     req.headers['x-requested-with'] === 'XMLHttpRequest';
    
    passport.authenticate('local', async (err: Error, user: any, info: any) => { //async added
      console.log("Passport authenticate result:", { error: err, userFound: !!user, info });
      
      // Handle authentication errors
      if (err) {
        console.error("Login authentication error:", err);
        return wantsJson 
          ? res.status(500).json({ message: "Authentication error" }) 
          : res.redirect('/login?error=server');
      }

      // Handle invalid credentials
      if (!user) {
        console.log("Login failed - invalid credentials");
        return wantsJson 
          ? res.status(401).json({ message: "Invalid credentials" }) 
          : res.redirect('/login?error=credentials');
      }

      // Log user in
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("req.logIn error:", loginErr);
          return wantsJson 
            ? res.status(500).json({ message: "Login error" }) 
            : res.redirect('/login?error=session');
        }

        console.log("Login successful, session created:", { 
          userId: user.id, 
          username: user.username,
          sessionID: req.sessionID,
          authenticated: req.isAuthenticated()
        });
        
        // For direct browser submission (form POST), redirect to dashboard
        // For API calls, return JSON as before
        if (wantsJson) {
          return res.status(200).json({
            message: "Login successful",
            user: {
              id: user.id,
              username: user.username
            }
          });
        } else {
          // For form submissions, set a stronger cookie and redirect
          // This helps browsers that might block third-party cookies
          res.cookie('auth_success', 'true', { 
            maxAge: 10000, // Short lived - just for display purposes
            httpOnly: false // Allow JS to read this cookie
          });
          
          // Redirect to dashboard
          return res.redirect('/');
        }
      });
    })(req, res, next);
  });

  app.post(`${API_PREFIX}/auth/logout`, (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  });

  // Enhanced auth status endpoint with detailed diagnostic information
  app.get(`${API_PREFIX}/auth/status`, (req, res) => {
    console.log("Auth status check - Headers:", req.headers);
    console.log("Auth status check - Session ID:", req.sessionID);
    console.log("Auth status check - User:", req.user);
    console.log("Auth status check - Is authenticated:", req.isAuthenticated());
    console.log("Auth status check - Session:", req.session);
    
    if (req.isAuthenticated() && req.user) {
      console.log("User is authenticated, returning user data");
      return res.status(200).json({
        isAuthenticated: true,
        user: {
          id: (req.user as any).id,
          username: (req.user as any).username,
          email: (req.user as any).email
        },
        sessionID: req.sessionID
      });
    }
    
    // If we have a sessionID but no authenticated user, log this anomaly
    if (req.sessionID && !req.isAuthenticated()) {
      console.log("WARNING: Session exists but user is not authenticated");
    }
    
    res.status(200).json({ 
      isAuthenticated: false,
      sessionID: req.sessionID || null,
      sessionExists: !!req.session,
      // Debug info to help diagnose issues
      debug: {
        hasUser: !!req.user,
        cookiesReceived: !!req.headers.cookie
      }
    });
  });

  // Registration route - Disabled for closed application
  app.post(`${API_PREFIX}/auth/register`, (req, res) => {
    // Return 403 Forbidden to indicate registration is not allowed
    return res.status(403).json({ 
      message: "Registration is disabled. This is a closed application." 
    });
  });
  
  // Password reset route
  app.post(`${API_PREFIX}/auth/reset-password`, async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the user's password in the database
      await storage.updateUserPassword(user.id, hashedPassword);
      
      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Categories routes
  app.get(`${API_PREFIX}/categories`, isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${API_PREFIX}/categories`, isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch(`${API_PREFIX}/categories/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, validatedData);

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(updatedCategory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete(`${API_PREFIX}/categories/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);

      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      if (error.message?.includes('in use')) {
        return res.status(400).json({ message: error.message });
      }
      handleError(res, error);
    }
  });

  // Locations routes
  app.get(`${API_PREFIX}/locations`, isAuthenticated, async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${API_PREFIX}/locations`, isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch(`${API_PREFIX}/locations/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLocationSchema.partial().parse(req.body);
      const updatedLocation = await storage.updateLocation(id, validatedData);

      if (!updatedLocation) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.json(updatedLocation);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete(`${API_PREFIX}/locations/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLocation(id);

      if (!success) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      if (error.message?.includes('in use')) {
        return res.status(400).json({ message: error.message });
      }
      handleError(res, error);
    }
  });

  // Expenses routes
  app.get(`${API_PREFIX}/expenses`, isAuthenticated, async (req, res) => {
    try {
      const month = req.query.month as string;
      let expenses;

      if (month) {
        expenses = await storage.getExpensesByMonth(month);
      } else {
        expenses = await storage.getAllExpenses();
      }

      res.json(expenses);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get(`${API_PREFIX}/expenses/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${API_PREFIX}/expenses`, isAuthenticated, async (req, res) => {
    try {
      // Handle type conversions before validation
      const expenseData = {
        ...req.body,
        // Convert amount to string if it's a number
        amount: typeof req.body.amount === 'number' ? req.body.amount.toString() : req.body.amount,
        // Ensure date is properly parsed if it's a string
        date: req.body.date instanceof Date ? req.body.date : new Date(req.body.date)
      };

      const validatedData = insertExpenseSchema.parse(expenseData);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch(`${API_PREFIX}/expenses/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // Handle type conversions before validation
      const expenseData = { ...req.body };

      // Handle amount conversion if present
      if (expenseData.amount !== undefined) {
        expenseData.amount = typeof expenseData.amount === 'number' 
          ? expenseData.amount.toString() 
          : expenseData.amount;
      }

      // Handle date conversion if present
      if (expenseData.date !== undefined) {
        expenseData.date = expenseData.date instanceof Date 
          ? expenseData.date 
          : new Date(expenseData.date);
      }

      const validatedData = insertExpenseSchema.partial().parse(expenseData);
      const updatedExpense = await storage.updateExpense(id, validatedData);

      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(updatedExpense);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete(`${API_PREFIX}/expenses/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);

      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Settlements routes
  app.get(`${API_PREFIX}/settlements`, isAuthenticated, async (req, res) => {
    try {
      const month = req.query.month as string;
      let settlements;

      if (month) {
        settlements = await storage.getSettlementsByMonth(month);
      } else {
        settlements = await storage.getAllSettlements();
      }

      res.json(settlements);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${API_PREFIX}/settlements`, isAuthenticated, async (req, res) => {
    try {
      // Check if settlement already exists for this month
      const existingSettlements = await storage.getSettlementsByMonth(req.body.month);
      if (existingSettlements.length > 0) {
        return res.status(400).json({ message: "Settlement already exists for this month" });
      }

      // Handle type conversions before validation
      const settlementData = {
        ...req.body,
        // Convert amount to string if it's a number
        amount: typeof req.body.amount === 'number' ? req.body.amount.toString() : req.body.amount,
        // Convert date string to Date object
        date: req.body.date ? new Date(req.body.date) : undefined
      };

      const validatedData = insertSettlementSchema.parse(settlementData);
      const settlement = await storage.createSettlement(validatedData);
      res.status(201).json(settlement);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete(`${API_PREFIX}/settlements/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSettlement(id);

      if (!success) {
        return res.status(404).json({ message: "Settlement not found" });
      }

      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Summary route
  app.get(`${API_PREFIX}/summary/:month`, isAuthenticated, async (req, res) => {
    try {
      const month = req.params.month;
      const summary = await storage.getMonthSummary(month);
      res.json(summary);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Trend Analysis route
  app.get(`${API_PREFIX}/trends`, isAuthenticated, async (req, res) => {
    try {
      const monthsCount = req.query.months ? parseInt(req.query.months as string) : 6;
      const trendData = await storage.getTrendData(monthsCount);
      res.json(trendData);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Users route - just to get all users
  app.get(`${API_PREFIX}/users`, isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}