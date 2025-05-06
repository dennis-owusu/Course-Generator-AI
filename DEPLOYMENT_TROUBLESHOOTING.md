# Course Generator AI - Deployment Troubleshooting Guide

## Common Issues

### Course Creation Fails

If you're experiencing issues with course creation after deployment, it's likely due to missing or invalid API keys in your environment. The application requires two API keys to function optimally:

1. **GPT40_API_KEY**: Used for AI-generated lesson content
2. **YOUTUBE_API_KEY**: Used for finding relevant YouTube videos for lessons

## How to Fix

### Setting Up Environment Variables

Make sure your deployment environment has the following environment variables properly configured:

```
GPT40_API_KEY=your_github_ai_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### How to Obtain API Keys

#### GitHub AI (GPT-4o) API Key

1. Visit the GitHub AI platform or contact your administrator for access
2. Generate an API key with permissions for the GPT-4o model
3. Add this key to your environment variables as `GPT40_API_KEY`

#### YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create API credentials (API Key)
5. Add this key to your environment variables as `YOUTUBE_API_KEY`

## Verifying Your Setup

### Testing API Keys

After setting up your environment variables, you can verify they're working by:

1. Restarting your application server
2. Attempting to create a new course
3. Checking server logs for any API-related warnings or errors

### Fallback Behavior

Even without API keys, the application will still function with limited capabilities:

- Without GPT40_API_KEY: The app will use built-in content generation instead of AI-generated content
- Without YOUTUBE_API_KEY: The app will skip YouTube video recommendations

## Deployment Platform-Specific Instructions

### Heroku

Set environment variables through the Heroku dashboard:
1. Go to your app's settings
2. Click "Reveal Config Vars"
3. Add your API keys as config variables

### Vercel

Set environment variables through the Vercel dashboard:
1. Go to your project settings
2. Navigate to the Environment Variables section
3. Add your API keys

### Railway

Set environment variables through the Railway dashboard:
1. Go to your project
2. Navigate to the Variables tab
3. Add your API keys

## Still Having Issues?

If you've set up the environment variables correctly but are still experiencing problems:

1. Check your application logs for specific error messages
2. Verify your API keys are valid and have the necessary permissions
3. Ensure your deployment platform can access external APIs (some platforms restrict outbound connections)
4. Check if your API quotas have been exceeded

For further assistance, please contact the application administrator.