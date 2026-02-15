# GitHub Workflows for Stampcoin Platform

This document explains the GitHub Actions workflows that have been set up for the Stampcoin Platform project.

## Overview

We have implemented a comprehensive set of GitHub Actions workflows to automate the build, test, deployment, and monitoring of the Stampcoin Platform. These workflows work together to provide a complete CI/CD pipeline.

## Workflows

### 1. Main Deployment Workflow (`deploy.yml`)

This is the primary workflow that handles both the website and application deployment.

**Features:**
- Deploys the website to GitHub Pages
- Builds and deploys the application as a Docker container
- Runs tests and validation
- Sends deployment notifications

**Usage:**
- Automatically triggers on push to the `main` branch
- Can be manually triggered from the Actions tab

### 2. Continuous Integration (`self-hosted-ci.yml`)

This workflow runs comprehensive validation and integration tests using a self-hosted runner.

**Features:**
- Security scanning
- Code linting
- Running tests
- Docker image validation
- Integration testing

**Usage:**
- Automatically triggers on push to `main` or pull requests
- Can be manually triggered for validation

### 3. Docker Build and Push (`build-and-push2.yml`)

This workflow builds and pushes Docker images to the GitHub Container Registry.

**Features:**
- Multi-architecture builds (AMD64 and ARM64)
- Automatic tagging based on branch and commit
- Image testing
- Release creation

**Usage:**
- Automatically triggers on push to `main`
- Can be manually triggered for specific builds

### 4. Documentation Workflow (`documentation.yml`)

This workflow handles documentation testing, building, and validation.

**Features:**
- Documentation link checking
- HTML validation
- Artifact upload
- Status reporting

**Usage:**
- Automatically triggers on push to `main` or pull requests
- Can be manually triggered for documentation builds

### 5. Release Management (`release.yml`)

This workflow handles version management and releases.

**Features:**
- Automatic version bumping
- Release creation
- Docker image publishing
- Production deployment

**Usage:**
- Automatic: Tag commits with version numbers (e.g., v1.0.0)
- Manual: Select release type (patch, minor, major)

### 6. Monitoring Workflow (`monitoring.yml`)

This workflow runs scheduled monitoring and maintenance tasks.

**Features:**
- Health checks
- Security scans
- Dependency updates
- System cleanup
- Report generation

**Usage:**
- Scheduled: Daily at 2 AM UTC
- Manual: On-demand checks

## Setup Requirements

### Repository Secrets

Configure these secrets in your repository:

- `GITHUB_TOKEN`: Automatically provided by GitHub
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password
- Optional: `SLACK_WEBHOOK` for notifications
- Optional: `CLOUD_API_TOKEN` for cloud deployment

### Self-Hosted Runner

1. Go to Settings > Actions > Runners in your repository
2. Click "New runner"
3. Follow the setup instructions
4. Ensure Docker is installed on the runner

### System Requirements for Runner

- Node.js 18+
- Docker
- npm
- Git

## Manual Workflow Execution

All workflows can be triggered manually:

1. Navigate to the Actions tab in your repository
2. Select the desired workflow
3. Click "Run workflow"
4. Configure any parameters if applicable

## Troubleshooting

### Common Issues and Solutions

1. **Docker Build Failures**
   - Verify Docker is installed and running on the runner
   - Check the Dockerfile syntax
   - Ensure build arguments are correct

2. **Deployment Failures**
   - Check GitHub Pages settings in repository settings
   - Verify workflow permissions
   - Confirm artifact paths are correct

3. **Test Failures**
   - Ensure all dependencies are installed
   - Check the test environment
   - Review test output logs for specific errors

### Debugging Tips

- Enable verbose logging in workflow steps
- Use `echo` statements for debugging information
- Check environment variables available to the runner
- Review workflow run logs in the Actions tab

## Best Practices

1. **Regular Maintenance**
   - Run monitoring workflows regularly
   - Keep dependencies updated
   - Monitor system resources

2. **Security**
   - Use secrets for sensitive information
   - Perform regular security scans
   - Keep dependencies updated

3. **Documentation**
   - Keep documentation current
   - Test documentation regularly
   - Document changes in releases

## Contributing

When contributing to the project:

1. Ensure your changes pass all CI checks
2. Update documentation if needed
3. Test your changes thoroughly
4. Follow the established patterns in the workflows

## Support

For issues or questions:
- Check the workflow logs in the Actions tab
- Create an issue in the repository
- Contact the development team
