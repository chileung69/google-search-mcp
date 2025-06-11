# Installing Google Search MCP Server in Cline

## Quick Installation for Cline

Your Google Search MCP server is ready to install in Cline! Follow these steps:

### Step 1: Locate Cline MCP Settings

In VS Code with Cline:
1. Open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Cline: Open MCP Settings" and select it
3. This will open your Cline MCP configuration file

### Step 2: Add the Google Search MCP Server

Add this configuration to your Cline MCP settings:

```json
{
  "mcpServers": {
    "google-search": {
      "command": "node",
      "args": ["/Users/admin/Development/Web/test_vs_ai/MCP/web-search/google-search-mcp/build/index.js"],
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

### Step 3: Restart Cline

1. Save the MCP configuration file
2. Restart VS Code or reload the Cline extension
3. Cline will automatically load the Google Search MCP server

### Step 4: Verify Installation

Once Cline restarts, you should see the Google Search tools available:
- `google_search` - Returns raw JSON search results
- `google_search_and_summarize` - Returns intelligent markdown summaries

### Step 5: Test the Installation

Ask Cline to use the search tools:
- "Search for latest AI developments using google_search_and_summarize"
- "Find information about Python best practices using google_search"

## Alternative: Environment Variable Setup

If you prefer to set environment variables separately:

### Option A: System Environment Variables
```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export GOOGLE_API_KEY="your_google_api_key_here"
export GOOGLE_SEARCH_ENGINE_ID="your_search_engine_id_here"
```

Then use this simpler Cline config:
```json
{
  "mcpServers": {
    "google-search": {
      "command": "node",
      "args": ["/Users/admin/Development/Web/test_vs_ai/MCP/web-search/google-search-mcp/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Option B: VS Code Settings
1. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "terminal integrated env"
3. Add the environment variables to your terminal environment

## Troubleshooting

### If Cline doesn't see the tools:
1. Check that the file path is correct in the configuration
2. Ensure Node.js is installed and accessible
3. Verify the build directory exists: `/Users/admin/Development/Web/test_vs_ai/MCP/web-search/google-search-mcp/build/index.js`
4. Check Cline's output panel for any error messages

### If searches return 0 results:
- Follow the steps in `FIX_SEARCH_RESULTS.md` to configure your Custom Search Engine for web-wide searching

## Features Available in Cline

Once installed, Cline can:
- 🔍 **Search Google** and get structured results
- 📝 **Summarize search results** with intelligent analysis
- 🌐 **Access real-time web information** 
- 📊 **Organize results** by domain and relevance
- 🔗 **Provide source links** for all information

## Example Usage in Cline

```
User: "Search for the latest developments in quantum computing and summarize the key findings"

Cline: *Uses google_search_and_summarize tool*
# Search Results Summary for "latest developments quantum computing"

Found 10 relevant results:

## Key Findings:
1. **IBM Advances Quantum Error Correction**
   IBM researchers have made significant progress in quantum error correction...
   Source: ibm.com

2. **Google's Quantum Supremacy Update**
   Google's quantum computer achieved new computational milestones...
   Source: google.com

[... continued summary with sources ...]
```

Your Google Search MCP server is now ready for Cline! 🚀
