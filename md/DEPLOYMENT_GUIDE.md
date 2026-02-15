# Deployment Guide for Stampcoin Platform

This guide explains how to use the deployment workflows for the Stampcoin Platform project.

## Overview

The project includes several GitHub Actions workflows that handle different aspects of deployment:

1. **deploy.yml** - Main deployment workflow for website and application
2. **self-hosted-ci.yml** - Continuous Integration with self-hosted runner
3. **build-and-push2.yml** - Docker image building and pushing
4. **documentation.yml** - Documentation testing and building
5. **release.yml** - Release management and deployment
6. **monitoring.yml** - Scheduled monitoring and maintenance tasks

## Workflows

### 1. Main Deployment (deploy.yml)

This workflow handles both website and application deployment.

**Triggers:**
- Push to `main` branch
- Manual dispatch

**Jobs:**
- `deploy-website`: Deploys the website to GitHub Pages
- `deploy-app`: Builds and deploys the application as a Docker container
- `validate`: Runs tests and validation
- `notify`: Sends deployment notifications

**Usage:**
The workflow runs automatically on push to `main`. You can also trigger it manually from the Actions tab.

### 2. Continuous Integration (self-hosted-ci.yml)

This workflow runs validation and integration tests.

**Triggers:**
- Push to `main` branch
- Pull request to `main` branch
- Manual dispatch

**Jobs:**
- `validate`: Runs security scans, tests, linting, and Docker validation
- `integration-test`: Tests the running application

**Usage:**
Runs automatically on push/PR. Can be triggered manually for validation.

### 3. Docker Build and Push (build-and-push2.yml)

This workflow builds and pushes Docker images to GitHub Container Registry.

**Triggers:**
- Push to `main` branch
- Pull request to `main` branch
- Manual dispatch

**Jobs:**
- `build-and-push`: Builds and pushes multi-architecture Docker images
- `create-release`: Creates GitHub releases

**Usage:**
Runs automatically on push to `main`. Can be triggered manually for specific builds.

### 4. Documentation (documentation.yml)

This workflow tests, builds, and validates documentation.

**Triggers:**
- Push to `main` branch
- Pull request to `main` branch
- Manual dispatch

**Jobs:**
- `test-docs`: Tests documentation links
- `build-docs`: Builds documentation
- `upload-docs`: Uploads documentation as artifact
- `create-docs-status`: Creates status for documentation

**Usage:**
Runs automatically on push/PR. Can be triggered manually for documentation builds.

### 5. Release Management (release.yml)

This workflow handles version management and releases.

**Triggers:**
- Push with version tags (v*)
- Manual dispatch with release type selection

**Jobs:**
- `determine-version`: Determines version bump type
- `create-release`: Creates GitHub releases
- `publish-docker`: Publishes Docker images
- `deploy`: Deploys to production

**Usage:**
- Automatic: Tag your commits with version numbers (e.g., v1.0.0)
- Manual: Select release type (patch, minor, major)

### 6. Monitoring (monitoring.yml)

This workflow runs scheduled monitoring and maintenance tasks.

**Triggers:**
- Scheduled: Daily at 2 AM UTC
- Manual dispatch

**Jobs:**
- `health-check`: Checks application health
- `security-scan`: Runs security scans
- `update-dependencies`: Updates project dependencies
- `cleanup`: Cleans up system resources
- `generate-report`: Generates monitoring report

**Usage:**
Runs automatically daily. Can be triggered manually for on-demand checks.

## Setup Instructions

### 1. Configure Secrets

Add these secrets to your repository:

- `GITHUB_TOKEN`: Automatically provided by GitHub
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password
- Optional: `SLACK_WEBHOOK` for Slack notifications
- Optional: `CLOUD_API_TOKEN` for cloud deployment

### 2. Self-Hosted Runner Setup

1. Go to your repository's Settings > Actions > Runners
2. Click "New runner"
3. Follow the instructions to set up a self-hosted runner
4. Ensure the runner has Docker installed and configured

### 3. Environment Setup

Make sure your self-hosted runner has:
- Node.js 18+
- Docker
- npm
- Git

## Manual Triggers

All workflows can be triggered manually:

1. Go to the Actions tab in your repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Configure any parameters if applicable

## Troubleshooting

### Common Issues

1. **Docker build fails**
   - Check Docker is installed on the runner
   - Verify Dockerfile is correct
   - Check build arguments

2. **Deployment fails**
   - Verify GitHub Pages settings
   - Check permissions
   - Verify artifact path

3. **Tests fail**
   - Check dependencies are installed
   - Verify test environment
   - Review test output logs

### Debugging Tips

- Enable verbose logging in workflow steps
- Use `echo` statements for debugging
- Check the runner's environment variables
- Review workflow run logs in the Actions tab

## Best Practices

1. **Regular Maintenance**
   - Run the monitoring workflow regularly
   - Keep dependencies updated
   - Monitor system resources

2. **Security**
   - Use secrets for sensitive data
   - Regular security scans
   - Keep dependencies updated

3. **Documentation**
   - Keep documentation updated
   - Test documentation regularly
   - Document changes in releases

## Support

For issues or questions:
- Check the workflow logs in the Actions tab
- Create an issue in the repository
- Contact the development team
