
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ec5bb77b-9cb5-410a-a485-c7fd0ccfd48d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ec5bb77b-9cb5-410a-a485-c7fd0ccfd48d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

**Manual Deployment with Lovable**
Simply open [Lovable](https://lovable.dev/projects/ec5bb77b-9cb5-410a-a485-c7fd0ccfd48d) and click on Share -> Publish.

**Automated Deployment with GitHub Actions to Netlify**
This project includes a GitHub Actions workflow that automatically deploys to Netlify when you push to the main branch.

To set up automated Netlify deployments:

1. Create a Netlify account at [netlify.com](https://netlify.com) if you don't have one.
2. Create a new site in Netlify from your Git repository.
3. In your Netlify site settings, navigate to "Site settings" > "Build & deploy" > "Environment variables".
4. Take note of your Netlify Site ID (found in "Site settings" > "General" > "Site details" > "Site ID").
5. Generate a Netlify personal access token at "User settings" > "Applications" > "Personal access tokens".
6. Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token.
   - `NETLIFY_SITE_ID`: The ID of your Netlify site.
7. Once set up, every push to the main branch will trigger a deployment to Netlify.

For manual deployments, you can use the "Deploy manually" option in the GitHub Actions tab of your repository.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

**For Netlify deployments**:
1. Go to your Netlify site dashboard
2. Navigate to "Site settings" > "Domain management" > "Custom domains"
3. Add your domain and follow the instructions to set up DNS records

