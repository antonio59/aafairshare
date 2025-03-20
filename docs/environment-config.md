# Environment Configuration Management

This document outlines how environment configuration is managed across different deployment environments in our application.

## Environment Structure

We use the following environments:

1. **Development** - Local development environment
2. **Staging** - Pre-production testing environment
3. **Production** - Live environment

## Environment Variables

### Core Variables

| Variable Name | Description | Required In |
|---------------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase instance URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | All |
| `NEXT_PUBLIC_API_URL` | Backend API URL | All |
| `NEXT_PUBLIC_ENVIRONMENT` | Current environment name | All |
| `NEXT_PUBLIC_FEATURE_FLAGS` | Feature flags (JSON string) | All |

### Environment-Specific Default Values

```
# Development (.env.development)
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_FEATURE_FLAGS={"enableExperimentalFeatures":true}

# Staging (.env.staging)
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_FEATURE_FLAGS={"enableExperimentalFeatures":true}

# Production (.env.production)
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_FEATURE_FLAGS={"enableExperimentalFeatures":false}
```

## Management Approach

### Local Development

1. Use `.env.local` for local overrides (gitignored)
2. Use `.env.development` for shared development defaults (committed to repo)
3. Use `.env.example` as a template for required variables (committed to repo)

### CI/CD Pipeline

Environment variables are managed in the CI/CD pipeline through:

1. **GitHub Secrets** - For sensitive values
2. **Environment Files** - Generated during deployment
3. **Environment-specific configurations** - Stored in GitHub Environments
4. **Test Configuration** - Unified test settings in `config/test/base.config.ts`
5. **Security Reports** - Consolidated reports in SARIF format and HTML summary

## Setting Up Environment Variables

### In GitHub Actions

1. Go to your repository settings
2. Navigate to Secrets and Variables → Actions
3. Add repository secrets for sensitive values
4. Navigate to Environments and create environments for staging and production
5. Add environment-specific secrets as needed

### Using Secrets in GitHub Actions

When creating GitHub Actions workflows:

1. Reference secrets using the syntax: `${{ secrets.SECRET_NAME }}`
2. Ensure workflows specify the correct environment: `environment: production`
3. Pass secrets to steps using environment variables or with parameters

### In Vercel

1. Go to your Vercel project settings
2. Navigate to Settings → Environment Variables
3. Add the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Choose the environments (Production, Preview, Development)
5. Click "Save" to apply the changes

## Runtime Configuration

The application uses a configuration service that:

1. Loads environment variables at build time
2. Provides runtime access to configuration values
3. Supports feature flags and environment-specific behaviors

## Security Considerations

1. Never commit sensitive environment variables to the repository
2. Use GitHub's environment protection rules for production secrets
3. Restrict access to environment variables to necessary team members only
4. Rotate secrets periodically, especially after team member departures