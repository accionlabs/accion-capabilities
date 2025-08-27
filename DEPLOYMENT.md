# GitHub Pages Deployment Guide

## Manual Deployment Steps

### 1. Build the Application
```bash
npm run build:gh-pages
```
This will build the React app and output it to the `docs` folder.

### 2. Commit and Push
```bash
git add docs/
git commit -m "Build for GitHub Pages deployment"
git push origin main
```

### 3. Configure GitHub Pages
1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/docs" folder
5. Click Save

### 4. Access Your Site
Your site will be available at:
```
https://accionlabs.github.io/accion-capabilities/
```

## Updating the Site

Whenever you need to update the deployed site:

1. Make your changes to the source code
2. Run `npm run build:gh-pages`
3. Commit and push the changes to the `docs` folder
4. GitHub Pages will automatically update within a few minutes

## Important Notes

- The `homepage` field in `package.json` is set to `https://accionlabs.github.io/accion-capabilities`
- The build script outputs to the `docs` folder instead of the default `build` folder
- A 404.html file is created as a copy of index.html to handle client-side routing
- All assets are served with the `/accion-capabilities/` base path

## Troubleshooting

If the site doesn't load properly:
1. Check that GitHub Pages is enabled in repository settings
2. Verify the `homepage` field in package.json matches your repository name
3. Ensure the `docs` folder contains the built files
4. Wait a few minutes for GitHub Pages to deploy the changes