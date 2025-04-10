# AAFairShare - Remix Version

A modern expense sharing application built with Remix, Firebase, and Tailwind CSS.

## Features

- User authentication with Firebase
- Expense tracking and management
- Settlement calculations
- Analytics and reporting
- Recurring expenses
- Dark mode support
- Responsive design for mobile and desktop

## Tech Stack

- [Remix](https://remix.run/) - Full-stack web framework
- [Firebase](https://firebase.google.com/) - Authentication and database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Development

Run the dev server:

```shellscript
npm run dev
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

## Deployment

### Staging Environment

There are two ways to deploy to the staging environment:

1. **Manual Deployment**:

   ```sh
   npm run deploy:staging
   ```

   This will build the app and deploy it to a Firebase Hosting preview channel named "staging".
   The staging URL will be provided in the command output.

2. **GitHub Actions**:

   Push to the `staging` branch or manually trigger the "Deploy to Firebase Hosting (Staging)" workflow in GitHub Actions.

   The staging URL will be provided in the GitHub Actions output and will look something like:
   `https://aafairshare-37271--staging-<hash>.web.app`

### Production Deployment

To deploy to production:

```sh
npm run deploy
```

This will deploy to your main Firebase Hosting URL: `https://aafairshare.online`

Alternatively, you can use the GitHub Actions workflow by pushing to the `main` branch.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
