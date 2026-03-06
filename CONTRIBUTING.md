# 🤝 Contributing to the MCP Server Registry

Thank you for your interest in contributing to this project's MCP Server Registry.
This document outlines how to contribute MCP server entries.

## 📦 Types of MCP Servers

There are two types of MCP servers you can add to the registry:

### 🏠 Local Servers (Containerized)
Local servers run in Docker containers on your machine. They:
- Require a Dockerfile in the source repository
- Are built and hosted as Docker images
- Run locally with full container isolation
- Can benefit from Docker-built images with enhanced security features (signatures, provenance, SBOMs, automatic updates)

### 🌐 Remote Servers (Hosted)
Remote servers are hosted externally and accessed via HTTP(S). They:
- Don't require a Dockerfile (already deployed somewhere)
- Use `streamable-http` or `sse` transport protocols
- Often require OAuth authentication
- Have dynamic tool discovery

## Prerequisites

- Go v1.24+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Task](https://taskfile.dev/)

## 🔄 Pull request process overview

- Make sure that the license of your MCP Server allows people to consume it. (MIT or Apache 2 are great, GPL is not).
- Fork the repository to your own GitHub account and clone it locally.
- Repository includes a `servers` folder where you should add a new folder with a `server.yaml` inside.
- Repository includes a `cmd` folder with Go code to automate some of the steps.
- Open a PR by ensuring the title and its description reflect the content of the PR.
- Ensure that CI passes; if it fails, fix the failures.
- Every pull request requires a review before merging.
- Once approved, all of your commits will be squashed into a single commit with your PR title.

---

## 🏠 Adding a Local MCP Server

### 1️⃣ Fork this repository

Fork the repository to your own GitHub account and clone it locally.

### 2️⃣ Add your entry locally

#### 🚀 Generate your server configuration using `task wizard`

```
task wizard
```

Using the wizard is the easiest way to create your `server.yaml`. You first need to provide a valid GitHub repo with a Dockerfile, which the wizard will analyze to populate the server default values (you can overwrite them directly in the wizard if needed).

The wizard allows you to add environment variables, secrets and volumes.

#### 🚀 Alternatively: Generate your server configuration using `task create`

You can use the creation command to automate the creation of the files. Let's assume we have a new MCP Server to access a database. The server's GitHub repo is at: `https://github.com/myorg/my-orgdb-mcp`

```
task create -- --category database https://github.com/myorg/my-orgdb-mcp -e API_TOKEN=test
```

This will build an image using the Dockerfile at the root of the repository, run it while verifying the MCP server is able to list tools, and then create the necessary files. It will create a directory under `servers` as follows: `./servers/my-orgdb-mcp` with a `server.yaml` file:

```yaml
name: my-orgdb-mcp
image: mcp/my-orgdb-mcp
type: server
meta:
  category: database
  tags:
    - database
about:
  title: My OrgDB MCP (TODO)
  description: TODO (only to provide a better description than the upstream project)
  icon: https://avatars.githubusercontent.com/u/182288589?s=200&v=4
source:
  project: https://github.com/myorg/my-orgdb-mcp
  commit: 0123456789abcdef0123456789abcdef01234567
config:
  description: Configure the connection to TODO
  secrets:
    - name: my-orgdb-mcp.api_token
      env: API_TOKEN
      example: <API_TOKEN>
```

Remember to specify all the env vars you want to use in your server:

```
task create -- --category database https://github.com/myorg/my-orgdb-mcp -e API_TOKEN=test -e MY_ORG=my-org
```

Here is an example of a full `config` block with both secrets and env vars:

```yaml
config:
  description: Configure the connection to AWS
  secrets:
    - name: tigris.aws_secret_access_key
      env: AWS_SECRET_ACCESS_KEY
      example: YOUR_SECRET_ACCESS_KEY_HERE
  env:
    - name: AWS_ACCESS_KEY_ID
      example: YOUR_ACCESS_KEY_HERE
      value: '{{tigris.aws_access_key_id}}'
    - name: AWS_ENDPOINT_URL_S3
      example: https://fly.storage.tigris.dev
      value: '{{tigris.aws_endpoint_url_s3}}'
  parameters:
    type: object
    properties:
      aws_access_key_id:
        type: string
    required:
      - aws_access_key_id
```

If you want to provide a specific Docker image built by your organisation instead of having it built for you, use the `--image` flag:

```
task create -- --category database --image myorg/my-mcp https://github.com/myorg/my-orgdb-mcp -e API_TOKEN=test
```

### 3️⃣ Run & Test your MCP Server locally

After creating your server file with `task create`, you will be given instructions for running it locally:

```
task build -- --tools my-orgdb-mcp  # Not needed if providing your own image
task catalog -- my-orgdb-mcp
docker mcp catalog import $PWD/catalogs/my-orgdb-mcp/catalog.yaml
```

Once done testing, restore the original catalog:

```
docker mcp catalog reset
```

### Avoiding `build --tools` failures

If your MCP server needs to be configured before listing tools, you can provide a `tools.json` file and the build process will not try to run the server and list the tools.

Example `tools.json`:

```json
[
  {
    "name": "tools_name",
    "description": "description of what your tool does",
    "arguments": [
      {
        "name": "name_of_the_argument",
        "type": "string",
        "desc": ""
      }
    ]
  }
]
```

When this file is found next to your `server.yaml`, the `task build -- --tools your-server-name` command lists the tools by reading the file instead of running the server.

### 4️⃣ Wait for review and approval

Upon approval your entry will be processed and made available in the MCP catalog.

---

## 🌐 Adding a Remote MCP Server

Remote MCP servers are already hosted externally and don't require Docker image building. They communicate via HTTP(S) protocols.

### Prerequisites for Remote Servers

- A publicly accessible MCP server endpoint (e.g., `https://mcp.example.com/mcp`)
- Knowledge of the transport protocol (`streamable-http` or `sse`)
- A documentation URL for your server
- OAuth configuration details (if authentication is required)

### 1️⃣ Fork this repository

Fork the repository to your own GitHub account and clone it locally.

### 2️⃣ Create your remote server entry using `task remote-wizard`

```bash
task remote-wizard
```

The wizard will guide you through:
1. **Basic Information**: Server name and category
2. **Server Details**: Title, description, icon URL, and documentation URL
3. **Remote Configuration**: Transport type (`streamable-http` or `sse`) and server URL
4. **OAuth Configuration**: Simple yes/no question

If OAuth is enabled, the wizard automatically generates:
- **Provider**: Uses your server name (e.g., `linear`)
- **Secret**: `{server-name}.personal_access_token` (e.g., `linear.personal_access_token`)
- **Environment Variable**: `{SERVER_NAME}_PERSONAL_ACCESS_TOKEN` (e.g., `LINEAR_PERSONAL_ACCESS_TOKEN`)

This will create a directory under `servers/` with three files:
- `server.yaml` — Server configuration
- `tools.json` — Empty array (for dynamic tool discovery)
- `readme.md` — Documentation link

### 3️⃣ Example remote server structure

Your remote server directory should look like this:

```
servers/my-remote-server/
├── server.yaml      # Server configuration
├── tools.json       # Always [] for remote servers
└── readme.md        # Documentation link (required)
```

Example `server.yaml` for a remote server **with OAuth**:

```yaml
name: linear
type: remote
dynamic:
  tools: true
meta:
  category: productivity
  tags:
    - productivity
    - project-management
    - remote
about:
  title: Linear
  description: Track issues and plan sprints
  icon: https://www.google.com/s2/favicons?domain=linear.app&sz=64
remote:
  transport_type: streamable-http
  url: https://mcp.linear.app/mcp
oauth:
  - provider: linear
    secret: linear.personal_access_token
    env: LINEAR_PERSONAL_ACCESS_TOKEN
```

Example `server.yaml` for a remote server **without OAuth**:

```yaml
name: cloudflare-docs
type: remote
meta:
  category: documentation
  tags:
    - documentation
    - cloudflare
    - remote
about:
  title: Cloudflare Docs
  description: Access the latest documentation on Cloudflare products
  icon: https://www.cloudflare.com/favicon.ico
remote:
  transport_type: sse
  url: https://docs.mcp.cloudflare.com/sse
```

**Note:** Remote servers without OAuth don't need the `oauth` field or `dynamic.tools` field in their configuration.

### 4️⃣ Test your remote server locally

```bash
task catalog -- my-remote-server
docker mcp catalog import $PWD/catalogs/my-remote-server/catalog.yaml
docker mcp server enable my-remote-server
```

For OAuth-enabled servers:

```bash
docker mcp oauth authorize my-remote-server
```

When done testing:

```bash
docker mcp catalog reset
```

### 5️⃣ Open a pull request

Create a pull request with your remote server files. Make sure to:
- Include all required files (`server.yaml`, `tools.json`, and `readme.md`)
- Verify that your server URL is publicly accessible
- Test OAuth configuration if applicable
- Ensure the documentation URL in `readme.md` is valid

## 📜 Code of Conduct

This project follows a Code of Conduct. Please review it in `CODE_OF_CONDUCT.md`.

## ❓ Questions

If you have questions, please create an issue in the repository.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
