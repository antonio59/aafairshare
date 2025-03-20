# Security Policy and Dependency Management

## Overview
This document outlines our comprehensive security measures for protecting user data and ensuring secure operations in our expense sharing application.

## Security Measures

### 1. Input Validation and Sanitization
- **Location**: `src/lib/validation.js`
- **Implementation**:
  - Zod schema validation for all form inputs
  - Financial data sanitization
  - Type checking and constraints
  - Maximum value limits
  
```javascript
// Example validation schemas
amountSchema: positive numbers, max 1,000,000
dateSchema: ISO format validation
categorySchema: length limits, required fields
```

### 2. CSRF Protection
- **Location**: `src/lib/csrf.js`
- **Implementation**:
  - UUID v4 token generation
  - Token validation per request
  - Automatic token refresh
  - Integration with Supabase client
  
```javascript
// Headers added automatically to mutating requests
X-CSRF-Token: UUID v4 token
```

### 3. Content Security Policy
- **Location**: `vercel.json`
- **Implementation**:
```ini
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ccwcbnfnvkmwubkuvzns.supabase.co
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
connect-src 'self' https://ccwcbnfnvkmwubkuvzns.supabase.co https://api.exchangerate-api.com
frame-ancestors 'none'
```

### 4. Financial Data Security
- **Location**: `src/components/NewExpenseModal.jsx`
- **Features**:
  - Amount sanitization
  - Decimal precision handling
  - Currency validation
  - Input masking

### 5. Additional Security Headers
```ini
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 1; mode=block
```

## Security Headers

- **Location**: `vercel.json`
- **Purpose**: Define security headers for all routes
- **Implementation**: Headers are automatically applied by Vercel Edge

## Automated Security Checks

### Daily Security Scans
- **Schedule**: Runs daily at midnight (UTC)
- **Trigger**: Automatic on push to main and pull requests
- **Location**: `.github/workflows/security.yml`
- **Reports**: Consolidated HTML report in `security-report.html`

### Security Testing Configuration
- **Location**: `config/test/base.config.ts`
- **Features**:
  - Unified test configuration for security scans
  - Shared timeouts and retry settings
  - Environment-specific configurations
  - Comprehensive security test coverage

### Dependency Updates (Dependabot)
- **Schedule**: Weekly checks
- **Location**: `.github/dependabot.yml`
- **Scope**: NPM dependencies
- **PR Limit**: 10 open PRs maximum

### Automated PR Management
- **Location**: `.github/workflows/dependency-review.yml`
- **Features**:
  - Automatic labeling of PRs
  - Auto-approval of safe dev dependency updates
  - Auto-merge for non-breaking changes
  - Dependency vulnerability scanning
  - Test suite execution with unified configuration

## Data Validation Rules

### Amount Validation
```javascript
- Positive numbers only
- Maximum value: 1,000,000
- Two decimal place precision
- Sanitization of input
- Currency code validation
```

### Date Validation
```javascript
- ISO format required
- Future date restrictions
- Valid date checking
- Timezone handling
```

### Text Input Validation
```javascript
- Category: 1-50 characters
- Location: 0-100 characters
- Notes: 0-500 characters
- XSS prevention
```

## Error Handling and Logging

### Client-Side Errors
- Validation feedback
- Form error display
- Network error handling
- Security error logging

### Server-Side Validation
- Request validation
- CSRF verification
- Data integrity checks
- Error logging and monitoring

## Best Practices

### 1. Form Security
- All forms implement CSRF protection
- Input validation on both client and server
- Sanitization of all user inputs
- Error messages don't expose sensitive info

### 2. API Security
- Authentication required for all endpoints
- Rate limiting implemented
- Request size limitations
- Valid CSRF token required for mutations

### 3. Data Security
- Financial data sanitization
- Secure storage practices
- Minimal data exposure
- Regular security audits

## Emergency Procedures

### Critical Vulnerabilities
1. Immediate notification via GitHub
2. Create hotfix branch
3. Apply security patch
4. Emergency deploy process

### Rollback Process
1. Identify last secure version
2. Revert to previous dependency version
3. Deploy rollback
4. Document incident

## Monitoring and Maintenance

### Regular Tasks
1. Review security logs daily
2. Monitor failed validation attempts
3. Check for suspicious patterns
4. Update security dependencies

### Security Updates
1. High priority for security patches
2. Immediate review of security PRs
3. Regular dependency updates
4. Security header reviews

## Contact

For security concerns, please contact:
- Security Team: [Add Contact]
- Repository Maintainers: [Add Contact]

## Implementation Checklist

- [x] Input Validation (Zod)
- [x] CSRF Protection
- [x] Content Security Policy
- [x] Financial Data Validation
- [x] Security Headers
- [x] Automated Security Checks
- [x] Dependency Management
- [x] Error Handling
- [x] Logging System
- [x] Data Sanitization

## NPM Security Configuration
Location: `.npmrc`
```ini
save-exact=true         # Use exact versions
audit-level=moderate    # Check moderate and high severity
engine-strict=true      # Enforce Node.js version
resolution-mode=highest # Use highest available versions
```

## Available Security Commands
```bash
# Run security audit
npm run security:audit

# Fix vulnerabilities
npm run security:fix

# Update dependencies safely
npm run security:update
```

## PR Review Process

### Automated PRs
1. Dependabot creates PRs for:
   - Security updates (high priority)
   - Dependency updates (weekly)
   - Each PR includes changelog and compatibility info

### Review Guidelines
1. **Security Updates**
   - Review urgency based on severity
   - Check changelog for breaking changes
   - Verify CI/CD pipeline passes
   - Test locally if significant changes

2. **Regular Updates**
   - Group similar updates when possible
   - Review test coverage
   - Check for deprecated features

### Merge Strategy
1. **High Severity Security Updates**
   - Review and merge ASAP
   - Deploy immediately after testing

2. **Regular Updates**
   - Batch similar updates
   - Schedule merges during low-traffic periods
   - Deploy with regular release cycle

## Monitoring Tools

### Snyk Integration
- **Setup**: `npx snyk auth`
- **Token**: Required in GitHub Secrets as `SNYK_TOKEN`
- **Checks**: 
  - Vulnerability scanning
  - License compliance
  - Dependency analysis

### NPM Audit
- Regular automated checks
- Part of CI/CD pipeline
- Blocks builds on high severity issues