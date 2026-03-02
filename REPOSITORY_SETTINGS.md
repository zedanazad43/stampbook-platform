# Repository Settings Guide

This document provides recommended settings and configurations for the Stampcoin Platform repository to ensure secure and efficient collaboration.

## Table of Contents
- [General Settings](#general-settings)
- [Branch Protection Rules](#branch-protection-rules)
- [Webhook & Integration Settings](#webhook--integration-settings)
- [GitHub Actions Settings](#github-actions-settings)
- [Security Settings](#security-settings)

---

## General Settings

### Repository Visibility
- **Current**: Public repository
- **Recommendation**: Keep public for open-source collaboration

### Features
Enable the following features in Settings  General:
-  **Issues** - For bug tracking and feature requests
-  **Projects** - For project management
-  **Wiki** - For extended documentation
-  **Discussions** - For community engagement
-  **Sponsorships** - For funding support (optional)

### Merge Options
Configure in Settings  General  Pull Requests:
-  **Allow merge commits** - Traditional merge strategy
-  **Allow squash merging** - Clean history (recommended for feature branches)
-  **Allow rebase merging** - Linear history
-  **Automatically delete head branches** - Keeps repository clean

---

## Branch Protection Rules

### Main Branch Protection

Configure in Settings  Branches  Add rule for `main`:

#### Required Settings
1. **Require a pull request before merging**
   -  Enable this option
   - Require approvals: `1` (minimum)
   -  Dismiss stale pull request approvals when new commits are pushed
   -  Require review from Code Owners (if CODEOWNERS file exists)

2. **Require status checks to pass before merging**
   -  Enable this option
   -  Require branches to be up to date before merging
   - Required status checks:
     - `build-and-push / build-and-push` (Docker build)
     - `deploy / deploy` (Deployment check)
     - `build / build` (Pages build)

3. **Require conversation resolution before merging**
   -  Enable to ensure all PR comments are addressed

4. **Require signed commits** (Optional but recommended)
   -  Enable for enhanced security

5. **Require linear history** (Optional)
   -  Enable if you want to prevent merge commits on main

6. **Include administrators**
   -  Apply rules to administrators as well

#### Additional Protection
-  **Allow force pushes**:  Disabled
-  **Allow deletions**:  Disabled

### Development Branch Protection

If you create a `develop` or `staging` branch:
- Same rules as main but with slightly relaxed requirements
- Require approvals: `1` (can be same as main)
- Allow force pushes:  Disabled

---

## Webhook & Integration Settings

### GitHub Actions
- **Location**: Settings  Actions  General
- **Actions permissions**: 
  -  Allow all actions and reusable workflows
  - Or:  Allow [organization]/*, and select non-[organization], actions and reusable workflows
- **Workflow permissions**:
  -  Read and write permissions
  -  Allow GitHub Actions to create and approve pull requests (if needed for automation)

### GitHub Pages
- **Location**: Settings  Pages
- **Source**: GitHub Actions
- **Custom domain**: (Optional) Configure if you have one
- **Enforce HTTPS**:  Enabled

---

## GitHub Actions Settings

### Workflow Permissions
Configure in Settings  Actions  General  Workflow permissions:

```yaml
permissions:
  contents: read      # Read repository contents
  packages: write     # Push to GitHub Container Registry
  pages: write        # Deploy to GitHub Pages
  id-token: write     # For GitHub Pages deployment
```

### Secrets Configuration

Required secrets for workflows (Settings  Secrets and variables  Actions):

1. **GITHUB_TOKEN** (automatically provided)
   - Used for authentication in workflows
   - No manual setup needed

2. **Additional secrets** (if needed):
   - `DOCKER_USERNAME` - For Docker Hub (if not using GHCR)
   - `DOCKER_PASSWORD` - For Docker Hub
   - `DEPLOY_KEY` - For external deployments

### Environment Variables

Set repository variables in Settings  Secrets and variables  Actions  Variables:
- `NODE_VERSION`: `18`
- `DOCKER_REGISTRY`: `ghcr.io`

---

## Security Settings

### Dependency Graph
- **Location**: Settings  Code security and analysis
-  **Dependency graph**: Enabled
-  **Dependabot alerts**: Enabled
-  **Dependabot security updates**: Enabled

### Code Scanning
-  **CodeQL analysis**: Enabled (see `.github/workflows/codeql.yml`)
-  **Secret scanning**: Enabled
-  **Push protection**: Enabled (prevents committing secrets)

### Private Vulnerability Reporting
-  Enable to allow security researchers to privately report vulnerabilities

---

## Recommended Additional Configurations

### 1. Create CODEOWNERS File

Create `.github/CODEOWNERS`:
```
# Default owners for everything
* @zedanazad43

# Workflow files
/.github/workflows/ @zedanazad43

# Documentation
*.md @zedanazad43
/docs/ @zedanazad43

# Docker configurations
Dockerfile @zedanazad43
```

### 2. Create Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:
```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

### 3. Create Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`

---

## Push Configuration Best Practices

### For Contributors

1. **Never force push to protected branches**
   ```bash
   # This will fail on main branch (protected)
   git push --force origin main
   ```

2. **Always create feature branches**
   ```bash
   git checkout -b feature/your-feature-name
   git push origin feature/your-feature-name
   ```

3. **Keep commits clean and descriptive**
   ```bash
   git commit -m "feat: Add user authentication module"
   git commit -m "fix: Resolve Docker build issue"
   git commit -m "docs: Update API documentation"
   ```

4. **Sync with main before creating PR**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git rebase main
   ```

### For Repository Owners

1. **Review PR settings regularly**
2. **Update branch protection rules as team grows**
3. **Monitor Actions usage and costs**
4. **Review security alerts weekly**
5. **Keep dependencies updated**

---

## Verification Steps

After configuring these settings:

1.  Try to push directly to main (should be blocked)
2.  Create a test PR and verify status checks run
3.  Verify workflows trigger on push events
4.  Check that GitHub Pages deploys successfully
5.  Verify Docker image builds and pushes to registry

---

## Current Workflow Triggers

All workflows are configured to trigger on push to `main`:

```yaml
on:
  push:
    branches:
      - main
```

This means:
-  Changes must go through PR process
-  No direct pushes to main (with branch protection)
-  Automated deployments on merge

---

## Support and Questions

For questions about repository settings:
- Open an issue in the repository
- Check the [CONTRIBUTING.md](CONTRIBUTING.md) guide
- Review [GitHub's documentation](https://docs.github.com)

---

*Last updated: February 6, 2026*
