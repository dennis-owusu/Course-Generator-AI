# Deployment Guide for Course Generator AI

## Overview

This document provides instructions for deploying the Course Generator AI application. The application consists of a React frontend and a Node.js backend.

## Frontend Deployment

### API Configuration

The frontend uses a central API configuration file (`src/lib/api-config.js`) to manage API URLs. This file automatically detects the environment:

- In development: Uses `http://localhost:3000` as the base URL
- In production: Uses relative URLs that will be handled by the same domain

### Environment Variables

For production deployment, you may need to set the following environment variables:

```
NODE_ENV=production
```

### Deployment Steps

1. Build the frontend:
   ```
   cd client
   npm run build
   ```

2. Deploy the built files to your hosting service (Render, Vercel, Netlify, etc.)

## Backend Deployment

### Environment Variables

Ensure the following environment variables are set in your production environment:

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `GPT40_API_KEY`: API key for AI content generation
- `YOUTUBE_API_KEY`: API key for YouTube video search

### CORS Configuration

If you're deploying the frontend and backend to different domains, make sure to update the CORS configuration in the backend to allow requests from your frontend domain.

### Deployment Steps

1. Deploy the backend code to your hosting service
2. Set up the required environment variables
3. Start the server

## Troubleshooting

### Network Errors

If you see `ERR_NETWORK` or `ERR_CONNECTION_REFUSED` errors in the browser console:

1. Check that the backend server is running
2. Verify that the API configuration is correctly set up
3. Ensure CORS is properly configured if frontend and backend are on different domains

### API Key Issues

If features like course generation or YouTube video recommendations aren't working:

1. Check that all required API keys are set in the backend environment
2. Verify API key validity and quotas

## Monitoring

Monitor your application logs for any errors related to API connections, database operations, or external service integrations.