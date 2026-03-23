---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name:
description:
---

# My Agent

Describe what your agent does here.{
  "mcpServers": {
    "cloudflare": {
      "type": "sse",
      "url": "https://docs.mcp.cloudflare.com/sse",
      "tools": ["*"]
    },
    "stripe": {
      "type": "http",
      "url": "https://mcp.stripe.com",
      "tools": ["*"]
    },
    "linear": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"],
      "tools": ["*"]
    },
    "notion": {
      "type": "local",
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "OPENAPI_MCP_HEADERS={\"Authorization\": \"Bearer $NOTION_API_KEY\", \"Notion-Version\": \"2022-06-28\"}",
        "mcp/notion"
      ],
      "env": {
        "NOTION_API_KEY": "$COPILOT_MCP_NOTION_API_KEY"
      },
      "tools": ["*"]
    },
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com",
      "tools": ["*"]
    },
    "google_workspace": {
      "type": "local",
      "command": "uvx",
      "args": ["workspace-mcp"],
      "env": {
        "GOOGLE_OAUTH_CLIENT_ID": "$COPILOT_MCP_GOOGLE_OAUTH_CLIENT_ID",
        "GOOGLE_OAUTH_CLIENT_SECRET": "$COPILOT_MCP_GOOGLE_OAUTH_CLIENT_SECRET"
      },
      "tools": ["*"]
    }
  }
}
