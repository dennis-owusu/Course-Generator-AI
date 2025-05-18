# GitHub AI Integration for Course Generator

## Overview

This document explains the integration of GitHub AI (GPT-4.1) into the Course Generator application. The integration uses the Azure SDK approach with ModelClient from @azure-rest/ai-inference to communicate with the GitHub AI API.

## Implementation Details

### Dependencies

The following dependencies are required for the GitHub AI integration:

```json
{
  "@azure-rest/ai-inference": "^1.0.0-beta.6",
  "@azure/core-auth": "^1.9.0"
}
```

### Configuration

The integration requires the following environment variable:

```
GPT40_API_KEY=your_github_ai_token
```

This token should be a valid GitHub Personal Access Token with appropriate permissions to access the GitHub AI API.

### Usage

The integration is implemented in the `api/utils/githubAI.js` file. The main function `generateAIResponse` takes a prompt as input and returns the AI-generated response.

```javascript
import { generateAIResponse } from '../utils/githubAI.js';

// Example usage
const prompt = "Create a lesson about JavaScript promises";
const response = await generateAIResponse(prompt);
```

### How It Works

1. The function initializes a ModelClient with the GitHub AI endpoint and token
2. It sends a request to the `/chat/completions` endpoint with the system instructions and user prompt
3. The response is processed and returned as a string
4. Comprehensive error handling and logging are implemented

### Benefits

- More accurate and unique AI-generated content
- Improved error handling and logging
- Better integration with the Azure SDK ecosystem
- Simplified authentication using AzureKeyCredential

## Troubleshooting

If you encounter issues with the GitHub AI integration, check the following:

1. Ensure the `GPT40_API_KEY` environment variable is set correctly
2. Verify that the token has the necessary permissions
3. Check the server logs for detailed error messages
4. Ensure the dependencies are installed correctly

## Future Improvements

- Add support for streaming responses
- Implement caching to reduce API calls
- Add support for more advanced prompting techniques
- Implement rate limiting and retry logic