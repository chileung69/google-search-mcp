# Google API Setup Guide

This guide will walk you through setting up Google Custom Search API credentials step by step.

## Step 1: Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. **Option A**: Create a new project
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Google Search MCP")
   - Click "Create"
4. **Option B**: Use an existing project
   - Click "Select a project" dropdown
   - Choose an existing project

## Step 2: Enable the Custom Search JSON API

1. In the Google Cloud Console, make sure your project is selected
2. Navigate to **"APIs & Services"** > **"Library"** (or use [this direct link](https://console.cloud.google.com/apis/library))
3. In the search box, type: `Custom Search JSON API`
4. Click on "Custom Search JSON API" from the results
5. Click the **"Enable"** button
6. Wait for the API to be enabled (this may take a moment)

## Step 3: Create an API Key

1. Go to **"APIs & Services"** > **"Credentials"** (or use [this direct link](https://console.cloud.google.com/apis/credentials))
2. Click **"+ Create Credentials"** at the top
3. Select **"API key"** from the dropdown
4. Your API key will be generated and displayed
5. **IMPORTANT**: Copy this API key immediately and store it securely
6. **Optional but recommended**: Click "Restrict Key" to:
   - Add application restrictions (if you know where you'll use it)
   - Restrict to "Custom Search JSON API" only for security

## Step 4: Create a Custom Search Engine

1. Go to [Google Custom Search Engine](https://cse.google.com/cse/)
2. Sign in with the same Google account
3. Click **"Add"** or **"Get Started"**
4. Fill in the form:
   - **Search engine name**: Give it a descriptive name (e.g., "Web Search for MCP")
   - **What to search**: Enter `*.google.com` or `google.com` 
   - **Language**: Select your preferred language
5. Click **"Create"**
6. You'll see a success page with your search engine created

## Step 5: Get Your Search Engine ID

1. After creating the search engine, click **"Control Panel"** or **"Customize"**
2. In the left sidebar, click **"Setup"** or **"Basics"**
3. You'll see **"Search engine ID"** - copy this value
4. **Important**: To search the entire web (not just specific sites):
   - Go to "Setup" > "Sites to search"
   - Remove any specific sites if present
   - Turn ON "Search the entire web but emphasize included sites"
   - Or add `*` as a site to search everything

## Step 6: Test Your Credentials

You can test your setup with this simple curl command:

```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=test"
```

Replace:
- `YOUR_API_KEY` with your actual API key
- `YOUR_SEARCH_ENGINE_ID` with your actual search engine ID

If successful, you'll get a JSON response with search results.

## Step 7: Set Environment Variables

Once you have both credentials, set them as environment variables:

### On macOS/Linux:
```bash
export GOOGLE_API_KEY="your_actual_api_key_here"
export GOOGLE_SEARCH_ENGINE_ID="your_actual_search_engine_id_here"
```

### On Windows (Command Prompt):
```cmd
set GOOGLE_API_KEY=your_actual_api_key_here
set GOOGLE_SEARCH_ENGINE_ID=your_actual_search_engine_id_here
```

### On Windows (PowerShell):
```powershell
$env:GOOGLE_API_KEY="your_actual_api_key_here"
$env:GOOGLE_SEARCH_ENGINE_ID="your_actual_search_engine_id_here"
```

## Troubleshooting

### Common Issues:

1. **"API key not valid"**:
   - Make sure you copied the entire API key
   - Check that the Custom Search JSON API is enabled
   - Verify you're using the correct project

2. **"Invalid search engine ID"**:
   - Double-check the search engine ID from the control panel
   - Make sure you're looking at the right search engine

3. **"User rate limit exceeded"**:
   - You're making too many requests
   - Wait a moment and try again
   - Check your API quotas in Google Cloud Console

4. **No search results or errors**:
   - Make sure your search engine is set to search the entire web
   - Check that you don't have restricted sites

### Rate Limits:

- **Free tier**: 100 search queries per day
- **Paid tier**: Up to 10,000 queries per day (requires billing account)

## Security Notes

- Keep your API key secure and never commit it to version control
- Consider using API key restrictions in Google Cloud Console
- Monitor your API usage in the Google Cloud Console
- If you suspect your key is compromised, regenerate it immediately

## Next Steps

After completing this setup:

1. Test the credentials using the curl command above
2. Set the environment variables in your terminal
3. Test the MCP server with: `npm run build && node build/index.js`
4. Add the server to your MCP configuration file

Need help with any of these steps? Check the main README.md for additional troubleshooting information.
