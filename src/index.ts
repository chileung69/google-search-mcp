#!/usr/bin/env node

/**
 * Google Search MCP Server
 * Provides Google search functionality with result summarization capabilities.
 * Uses Google Custom Search JSON API for reliable search results.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

console.error('[Setup] Initializing Google Search MCP Server...');

// Interface for Google Custom Search API response
interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

/**
 * Search Google using Custom Search JSON API
 */
async function searchGoogle(query: string, numResults: number = 10): Promise<GoogleSearchResult[]> {
  console.error(`[API] Searching Google for: "${query}"`);
  
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error('Missing required environment variables: GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID must be set');
  }

  try {
    const response = await axios.get<GoogleSearchResponse>('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        num: Math.min(numResults, 10), // Google API allows max 10 results per request
      },
      timeout: 10000, // 10 second timeout
    });

    console.error(`[API] Search completed. Found ${response.data.items?.length || 0} results`);
    return response.data.items || [];
  } catch (error) {
    console.error('[Error] Google search failed:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Google API authentication failed. Please check your API key and search engine ID.');
      } else if (error.response?.status === 429) {
        throw new Error('Google API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Google API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
    }
    throw new Error(`Search request failed: ${error}`);
  }
}

/**
 * Summarize search results into a coherent summary
 */
function summarizeResults(results: GoogleSearchResult[], query: string): string {
  if (results.length === 0) {
    return `No search results found for query: "${query}"`;
  }

  console.error(`[Summary] Summarizing ${results.length} search results`);

  // Create a comprehensive summary
  let summary = `# Search Results Summary for "${query}"\n\n`;
  summary += `Found ${results.length} relevant results:\n\n`;

  // Group results by domain for better organization
  const domainGroups: { [domain: string]: GoogleSearchResult[] } = {};
  results.forEach(result => {
    const domain = result.displayLink || new URL(result.link).hostname;
    if (!domainGroups[domain]) {
      domainGroups[domain] = [];
    }
    domainGroups[domain].push(result);
  });

  // Create summary with key insights
  summary += "## Key Findings:\n";
  results.slice(0, 5).forEach((result, index) => {
    summary += `${index + 1}. **${result.title}**\n`;
    summary += `   ${result.snippet}\n`;
    summary += `   Source: ${result.displayLink || new URL(result.link).hostname}\n\n`;
  });

  // Add sources section
  summary += "## Sources:\n";
  results.forEach((result, index) => {
    summary += `${index + 1}. [${result.title}](${result.link})\n`;
  });

  // Add domain analysis
  if (Object.keys(domainGroups).length > 1) {
    summary += "\n## Domain Distribution:\n";
    Object.entries(domainGroups).forEach(([domain, domainResults]) => {
      summary += `- ${domain}: ${domainResults.length} result${domainResults.length > 1 ? 's' : ''}\n`;
    });
  }

  return summary;
}

/**
 * Create an MCP server with Google search and summarization capabilities
 */
const server = new Server(
  {
    name: "Google Search MCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "google_search",
        description: "Search Google and return raw search results",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to execute on Google"
            },
            numResults: {
              type: "number",
              description: "Number of search results to return (1-10, default: 10)",
              minimum: 1,
              maximum: 10
            }
          },
          required: ["query"]
        }
      },
      {
        name: "google_search_and_summarize",
        description: "Search Google and return a comprehensive summary of the results",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to execute on Google"
            },
            numResults: {
              type: "number",
              description: "Number of search results to analyze for summary (1-10, default: 10)",
              minimum: 1,
              maximum: 10
            }
          },
          required: ["query"]
        }
      }
    ]
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "google_search": {
      const query = String(args?.query || '');
      const numResults = Number(args?.numResults || 10);

      if (!query.trim()) {
        throw new Error("Search query cannot be empty");
      }

      console.error(`[Tool] Executing google_search for: "${query}"`);

      try {
        const results = await searchGoogle(query, numResults);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              query,
              totalResults: results.length,
              results: results.map(result => ({
                title: result.title,
                url: result.link,
                snippet: result.snippet,
                domain: result.displayLink || new URL(result.link).hostname
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        console.error('[Error] google_search failed:', error);
        throw error;
      }
    }

    case "google_search_and_summarize": {
      const query = String(args?.query || '');
      const numResults = Number(args?.numResults || 10);

      if (!query.trim()) {
        throw new Error("Search query cannot be empty");
      }

      console.error(`[Tool] Executing google_search_and_summarize for: "${query}"`);

      try {
        const results = await searchGoogle(query, numResults);
        const summary = summarizeResults(results, query);
        
        return {
          content: [{
            type: "text",
            text: summary
          }]
        };
      } catch (error) {
        console.error('[Error] google_search_and_summarize failed:', error);
        throw error;
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Setup] Google Search MCP Server is running and ready to accept requests');
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
