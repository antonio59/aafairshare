# Setting Up Supabase Type Generation in CI/CD

This document explains how to configure the necessary secrets for automatic Supabase TypeScript type generation in your CI/CD pipeline.

## Overview

Our CI/CD pipeline includes a job that:
1. Generates TypeScript types from the Supabase database schema
2. Commits these types to the repository if they have changed
3. This ensures our type definitions always stay in sync with the actual database structure

## Required GitHub Secrets

To set up this workflow, you need to configure the following secret in your GitHub repository:

### `SUPABASE_ACCESS_TOKEN`

This token allows the CI/CD pipeline to access your Supabase project.

**How to generate:**
1. Go to [app.supabase.com](https://app.supabase.com/)
2. Login to your account
3. Navigate to Account > Access Tokens
4. Click "Generate new token"
5. Give it a descriptive name like "GitHub CI/CD"
6. Copy the generated token

## Adding the Secret to GitHub

1. Go to your GitHub repository
2. Click on "Settings"
3. Navigate to "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Name: `SUPABASE_ACCESS_TOKEN`
6. Value: [Your Supabase access token]
7. Click "Add secret"

## About Repository Write Permissions

The workflow uses GitHub's built-in token (`github.token`) to commit changes to your repository. This token automatically has the necessary permissions because we've set `contents: write` in the workflow's permissions section.

## Testing the Setup

After adding the secret, you can manually trigger the CI/CD workflow:

1. Go to the "Actions" tab in your repository
2. Select the "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Choose the branch and trigger the workflow

If everything is set up correctly, the workflow will:
- Generate Supabase types
- Compare them to the existing types
- Commit any changes to your repository

## Troubleshooting

If the workflow fails, check:

1. **Secret Value**: Ensure your SUPABASE_ACCESS_TOKEN is correct
2. **Permissions**: Check that the workflow has `contents: write` permission
3. **Supabase Project ID**: Confirm the project ID in your `gen:types` script matches your Supabase project

## Maintenance

- Rotate your SUPABASE_ACCESS_TOKEN periodically for security 