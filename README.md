# Deen Quest — GitHub Pages Ready

This package is arranged so **index.html is at the repository root**.

## Upload to GitHub
1. Create/open your GitHub repository.
2. Upload **all files inside this folder** (not the outer ZIP folder itself).
3. Make sure the repository root contains:
   - `index.html`
   - `css/`
   - `js/`
   - `assets/`
   - `.nojekyll`
4. GitHub → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
5. Wait for GitHub Pages to deploy.

All website assets use relative paths such as `assets/logo.svg`, `assets/images/...`, `css/style.css`, and `js/...`, so they work on a project URL such as:
`https://USERNAME.github.io/REPOSITORY/`

No external image/CDN is required for the site's logo/background visuals.
