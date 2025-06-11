# Google Search MCP Server

A Model Context Protocol (MCP) server that provides Google search functionality with intelligent result summarization. This server allows AI assistants to search Google and get organized, summarized results.

## Features

- **Google Search Integration**: Uses Google Custom Search JSON API for reliable search results
- **Two Search Tools**:
  - `google_search`: Returns raw search results in JSON format
  - `google_search_and_summarize`: Returns a comprehensive markdown summary of search results
- **Smart Summarization**: Organizes results by domain, provides key findings, and includes source links
- **Comprehensive Error Handling**: Handles API errors, rate limits, and authentication issues
- **Detailed Logging**: Console logging for debugging and monitoring

## Prerequisites

### 1. Google Custom Search API Setup

You need to set up Google Custom Search API credentials:

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Custom Search API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Custom Search JSON API"
   - Click on it and enable the API

3. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key (keep it secure!)

4. **Create Custom Search Engine**:
   - Go to [Google Custom Search Engine](https://cse.google.com/cse/)
   - Click "Add" to create a new search engine
   - Enter `google.com` as the site to search
   - Click "Create"
   - Copy the Search Engine ID from the settings

### 2. Environment Variables

Set these environment variables:
```bash
export GOOGLE_API_KEY="your_google_api_key_here"
export GOOGLE_SEARCH_ENGINE_ID="your_search_engine_id_here"
```

## Installation

1. **Clone/Download the project**:
   ```bash
   cd google-search-mcp
   npm install
   npm run build
   ```

2. **Test the server** (optional):
   ```bash
   # Set environment variables first
   export GOOGLE_API_KEY="your_api_key"
   export GOOGLE_SEARCH_ENGINE_ID="your_engine_id"
   
   # Test the server
   echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node build/index.js
   ```

## MCP Configuration

Add this server to your MCP settings (typically in Claude Desktop or other MCP clients):

### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-search": {
      "command": "node",
      "args": ["/path/to/google-search-mcp/build/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your_google_api_key_here",
        "GOOGLE_SEARCH_ENGINE_ID": "your_search_engine_id_here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### For Other MCP Clients

Use the same configuration pattern, adjusting the path to match your installation location.

## Available Tools

### 1. `google_search`

Returns raw search results in JSON format.

**Parameters**:
- `query` (required): The search query string
- `numResults` (optional): Number of results to return (1-10, default: 10)

**Example Usage**:
```json
{
  "name": "google_search",
  "arguments": {
    "query": "artificial intelligence trends 2024",
    "numResults": 5
  }
}
```

### 2. `google_search_and_summarize`

Returns a comprehensive markdown summary of search results.

**Parameters**:
- `query` (required): The search query string
- `numResults` (optional): Number of results to analyze (1-10, default: 10)

**Example Usage**:
```json
{
  "name": "google_search_and_summarize",
  "arguments": {
    "query": "climate change renewable energy solutions",
    "numResults": 8
  }
}
```

## Output Formats

### Raw Search Results (`google_search`)

```json
{
  "query": "your search query",
  "totalResults": 5,
  "results": [
    {
      "title": "Page Title",
      "url": "https://example.com/page",
      "snippet": "Brief description of the page content...",
      "domain": "example.com"
    }
  ]
}
```

### Summarized Results (`google_search_and_summarize`)

```markdown
# Search Results Summary for "your query"

Found 5 relevant results:

## Key Findings:
1. **First Result Title**
   Brief description from the search snippet
   Source: example.com

2. **Second Result Title**
   Another description
   Source: another-site.com

## Sources:
1. [First Result Title](https://example.com/page1)
2. [Second Result Title](https://another-site.com/page2)

## Domain Distribution:
- example.com: 2 results
- another-site.com: 1 result
```

## Error Handling

The server handles various error conditions:

- **Missing API credentials**: Clear error message about required environment variables
- **API authentication errors**: Specific guidance about checking API key and search engine ID
- **Rate limiting**: Informative message about API quota limits
- **Network timeouts**: 10-second timeout with appropriate error messages
- **Invalid queries**: Validation of empty or invalid search queries

## Rate Limits

Google Custom Search JSON API has the following limits:
- **Free tier**: 100 queries per day
- **Paid tier**: Up to 10,000 queries per day
- **Per request**: Maximum 10 results per search

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**:
   - Ensure `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set
   - Check that variable names are spelled correctly

2. **"Google API authentication failed"**:
   - Verify your API key is correct
   - Ensure Custom Search JSON API is enabled in your Google Cloud project
   - Check that your search engine ID is correct

3. **"Rate limit exceeded"**:
   - You've hit the daily quota limit
   - Wait for the quota to reset or upgrade to a paid plan

4. **"No search results found"**:
   - Try different search terms
   - Check if your custom search engine is configured to search the entire web

### Debugging

Enable detailed logging by checking the console output when running the server. All operations are logged with prefixes like `[Setup]`, `[API]`, `[Error]`, etc.

## Development

### Project Structure

```
google-search-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript output
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Available Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run watch`: Watch for changes and rebuild automatically
- `npm run inspector`: Run the MCP inspector for debugging

### Contributing

1. Make changes to `src/index.ts`
2. Test with `npm run build`
3. Update documentation as needed
4. Test with actual MCP client integration

## License

This project is private and for personal/internal use.
