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
| `VITE_SUPABASE_URL` | Supabase instance URL | All |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | All |
| `VITE_API_URL` | Backend API URL | All |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | Staging, Production |
| `VITE_ENVIRONMENT` | Current environment name | All |
| `VITE_FEATURE_FLAGS` | Feature flags (JSON string) | All |

### Environment-Specific Default Values

```
# Development (.env.development)
VITE_ENVIRONMENT=development
VITE_FEATURE_FLAGS={"enableExperimentalFeatures":true}

# Staging (.env.staging)
VITE_ENVIRONMENT=staging
VITE_FEATURE_FLAGS={"enableExperimentalFeatures":true}

# Production (.env.production)
VITE_ENVIRONMENT=production
VITE_FEATURE_FLAGS={"enableExperimentalFeatures":false}
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

## Setting Up Environment Variables

### In GitHub Actions

1. Go to your repository settings
2. Navigate to Secrets and Variables → Actions
3. Add repository secrets for sensitive values
4. Navigate to Environments and create environments for staging and production
5. Add environment-specific secrets as needed

#### Required Secrets for Database Backup Workflow

The database backup workflow (`.github/workflows/db-backup.yml`) requires the following secrets to be configured in GitHub:

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | Database backup script |
| `SUPABASE_SERVICE_KEY` | Supabase service key with admin access | Database backup script |
| `DB_HOST` | Database host address | Database backup script |
| `DB_PORT` | Database port | Database backup script |
| `DB_NAME` | Database name | Database backup script |
| `DB_USER` | Database username | Database backup script |
| `SUPABASE_DB_PASSWORD` | Database password | Database backup script |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 access | S3 upload step |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 access | S3 upload step |
| `AWS_REGION` | AWS region for S3 bucket | S3 upload step |
| `BACKUP_BUCKET` | S3 bucket name for backup storage | S3 upload step |
| `SLACK_WEBHOOK` | Webhook URL for Slack notifications | Notification step |

All these secrets must be added to the `production` environment in GitHub to ensure the workflow has access to them.

### Using Secrets in GitHub Actions

When creating GitHub Actions workflows:

1. Reference secrets using the syntax: `${{ secrets.SECRET_NAME }}`
2. Ensure workflows specify the correct environment: `environment: production`
3. Pass secrets to steps using environment variables or with parameters

### In Vercel

1. Go to your Vercel project settings
2. Navigate to Settings → Environment Variables
3. Add the required environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SENTRY_DSN`
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