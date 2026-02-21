# GitHub Pages Setup Instructions

## Enable GitHub Pages

To allow the GitHub Pages deployment workflow to succeed, you need to enable GitHub Pages in the repository settings:

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click on **Pages**
4. Under **Source**, select **GitHub Actions** from the dropdown
5. Click **Save**

After enabling GitHub Pages with GitHub Actions as the source, the workflow will be able to deploy successfully.

## What the Pages Workflow Does

The pages workflow (`.github/workflows/pages.yml`) will:
- Build a static site from the `docs` folder
- Generate an `index.html` if one doesn't exist
- Deploy the site to GitHub Pages

Once enabled, your site will be available at:
`https://zedanazad43.github.io/stp/`

## Manual Alternative

If you prefer not to use GitHub Actions for Pages, you can:
1. Go to Settings > Pages
2. Choose **Deploy from a branch** instead
3. Select the `main` branch and `/docs` folder (or root)
4. Your documentation will be published from that location
