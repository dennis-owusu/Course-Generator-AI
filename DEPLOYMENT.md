# Deployment Guide for Course Generator AI

## Deployment Issues Fixed

The following issues were addressed to ensure successful deployment:

1. **Infinite Build Loop**: Fixed recursive build script in package.json that was causing an infinite loop during deployment.

2. **Static File Serving**: Added configuration to serve the React frontend from the Express backend in production.

3. **Cross-Platform Compatibility**: Updated build scripts to work on both Windows and Unix-based systems.

## Deployment Steps

### Prerequisites

- Node.js and npm installed
- MongoDB database
- GitHub API token (for GPT-4o API)
- YouTube Data API key

### Environment Variables

Ensure the following environment variables are set in your deployment platform:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GPT40_API_KEY=your_github_gpt4o_api_key
YOUTUBE_API_KEY=your_youtube_api_key
NODE_ENV=production
```

### Deployment Process

1. Push your code to your repository

2. Set up a new Web Service on Render
   - Connect your repository
   - Select the Node.js environment
   - Set the build command to: `npm run build`
   - Set the start command to: `npm start`
   - Add the required environment variables

3. Deploy the application

## Build Process

The build process now follows these steps:

1. Installs server dependencies
2. Builds the React client application
3. Copies the client build files to the public directory
4. Serves the static files in production mode

## Troubleshooting

If you encounter deployment issues:

1. Check the deployment logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure MongoDB connection is accessible from your deployment platform
4. Check that API keys are valid and have the necessary permissions