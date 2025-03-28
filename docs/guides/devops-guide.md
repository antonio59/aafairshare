# DevOps Guide

This guide provides a comprehensive overview of the DevOps practices and infrastructure for our application.

## Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Environment Management](#environment-management)
4. [Monitoring and Alerting](#monitoring-and-alerting)
5. [Database Management](#database-management)
6. [Security Practices](#security-practices)
7. [Incident Response](#incident-response)

## Infrastructure Overview

Our application uses the following infrastructure:

### Frontend

- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Runtime**: Node.js 20.x

### Backend

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **APIs**: Supabase Edge Functions

### DevOps Tools

- **CI/CD**: GitHub Actions
- **Version Control**: Git/GitHub
- **Secret Management**: GitHub Secrets

## CI/CD Pipeline

We use GitHub Actions for continuous integration and deployment.

### Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Triggered on push to main/develop or manual dispatch
   - Uses unified test configuration from `config/test/base.config.ts`
   - Runs unit tests, integration tests, and e2e tests
   - Generates consolidated security reports
   - Deploys to the appropriate environment



### Deployment Process

1. **Feature Development**:
   - Develop in feature branches
   - Create PR to develop branch
   - Automated tests run on PR

2. **Staging Deployment**:
   - Merge PR to develop branch
   - Automatic deployment to staging environment
   - End-to-end tests run against staging

3. **Production Deployment**:
   - Create PR from develop to main
   - Review and approve PR
   - Merge to main triggers production deployment

### Manual Deployment

For manual deployments:

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Environment Management

We maintain separate environments for development, staging, and production.

### Environment Configuration

- **Development**: Local development environment using `.env.development`
- **Staging**: Pre-production environment for testing
- **Production**: Live environment for end users

### Environment Variables

Environment variables are managed through:

1. **Local Development**: `.env.local` file (not committed to repository)
2. **CI/CD Pipeline**: GitHub Secrets and Environment variables
3. **Production**: Vercel Environment variables

See [Environment Configuration Management](./environment-config.md) for details.

## Monitoring and Alerting

### Error Tracking

We use custom error boundaries and logging for error tracking:

- Client-side error boundaries for React components
- Server-side error logging
- Component-level error handling

Implementation details:
- Error boundaries are defined in `src/components/error-boundary.tsx`
- Critical components are wrapped with error boundaries
- Browser console errors are logged in development

### Alerting Channels

- **Critical Issues**: Slack alerts to `#prod-alerts` channel
- **Deployment Notifications**: Slack alerts to `#deployments` channel
- **Daily Summaries**: Email reports to engineering team

## Database Management

### Schema Migrations

Database schema changes are managed through Supabase migrations:

1. Create migration files in `supabase/migrations/`
2. Test migrations in local development
3. Apply migrations in staging before production

## Security Practices

### Secret Management

- Sensitive information is stored in GitHub Secrets
- API keys are environment-specific
- Service accounts use least-privilege permissions

### Access Control

- GitHub repository access is limited to team members
- Production deployments require approval
- Infrastructure access is role-based

### Security Scanning

- Automated dependency scanning with `npm audit`
- Scheduled security scans with Snyk
- Consolidated security reporting in `security-report.html`
- Automated SARIF report generation for GitHub Security tab
- Manual security reviews before major releases

## Incident Response

### Incident Management Process

1. **Detection**: Identify the incident through monitoring alerts
2. **Response**: Assemble incident response team
3. **Mitigation**: Implement immediate fixes to resolve the issue
4. **Recovery**: Restore normal operations
5. **Post-mortem**: Analyze root cause and implement preventive measures

### Rollback Procedures

In case of critical issues:

```bash
# Rollback to previous production deployment
npm run deploy:rollback
```

### Emergency Contacts

- **Technical Lead**: tech-lead@yourdomain.com
- **DevOps Engineer**: devops@yourdomain.com
- **CTO**: cto@yourdomain.com

## Documentation Updates

This guide should be reviewed and updated:

- After significant infrastructure changes
- Quarterly for general maintenance
- When onboarding new team members with DevOps responsibilities

Last updated: March 2024