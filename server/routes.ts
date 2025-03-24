import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCategorySchema, insertExpenseSchema, insertLocationSchema, insertSettlementSchema } from "@shared/schema";
import passport from "passport";

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
    passport.authenticate('local', (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        return res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username
          }
        });
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
  
  app.get(`${API_PREFIX}/auth/status`, (req, res) => {
    if (req.isAuthenticated()) {
      return res.status(200).json({
        isAuthenticated: true,
        user: {
          id: (req.user as any).id,
          username: (req.user as any).username
        }
      });
    }
    res.status(200).json({ isAuthenticated: false });
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
    } catch (error) {
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
    } catch (error) {
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
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch(`${API_PREFIX}/expenses/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExpenseSchema.partial().parse(req.body);
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
      const validatedData = insertSettlementSchema.parse(req.body);
      const settlement = await storage.createSettlement(validatedData);
      res.status(201).json(settlement);
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
