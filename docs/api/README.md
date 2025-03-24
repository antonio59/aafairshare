# AAFairShare API Documentation

This directory contains documentation for the AAFairShare API endpoints.

## Available Endpoints

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories` - Update a category
- `DELETE /api/categories` - Delete a category

### Expenses

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get a specific expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Locations

- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create a new location
- `PUT /api/locations` - Update a location
- `DELETE /api/locations` - Delete a location

### Authentication

- `GET /api/auth/session` - Get the current user session
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/signin` - Sign in a user
- `POST /api/auth/signout` - Sign out a user
