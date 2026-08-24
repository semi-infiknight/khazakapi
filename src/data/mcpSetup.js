export const MCP_TOOLS = [
  { name: "search_kz_apis", description: "Search the Kazakhstan API catalogue" },
  { name: "get_kz_api", description: "Get one API entry by id" },
  { name: "list_api_categories", description: "List categories with counts" },
];

export const PLATFORMS = [
  {
    id: "claude",
    label: "Claude",
    mcp: {
      step2Title: "Go to Claude → Customize",
      step2Body: "In Claude desktop or claude.ai, open Customize → Connectors. Name it Khazak API and paste the URL.",
      step2Action: { label: "Open Claude Customize", href: "https://claude.ai/settings/connectors" },
      step3Body: "Connect the server, then ask Claude to search Kazakhstan APIs or fetch NBK rates.",
      cta: { label: "Start exploring", href: "https://claude.ai/new" },
    },
    cli: {
      step2Title: "Add via Claude desktop config",
      step2Body: "Paste this block into your Claude desktop MCP config (Settings → Developer → Edit config).",
      step2Snippet: (url) => `{\n  "mcpServers": {\n    "khazak-api": {\n      "url": "${url}"\n    }\n  }\n}`,
      step3Body: "Restart Claude desktop, then ask it to search KZ APIs or pull data.egov datasets.",
      cta: { label: "Open Claude", href: "https://claude.ai/download" },
    },
  },
  {
    id: "grok",
    label: "Grok Bot",
    mcp: {
      step2Title: "Add a custom MCP connector",
      step2Body: "In Grok settings, add a remote MCP connector named Khazak API and paste the URL.",
      step2Action: { label: "Open Grok", href: "https://grok.com" },
      step3Body: "Once connected, ask Grok to list KZ payment APIs or geocode an Almaty address via 2GIS.",
      cta: { label: "Start exploring", href: "https://grok.com" },
    },
    cli: {
      step2Title: "Use Grok CLI with HTTP MCP",
      step2Body: "If your Grok CLI supports remote MCP, register the Khazak server URL.",
      step2Snippet: (url) => `grok mcp add khazak-api --url "${url}"`,
      step3Body: "Run a prompt like: “Search Khazak for Kazhydromet weather APIs.”",
      cta: { label: "Grok docs", href: "https://docs.x.ai" },
    },
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    mcp: {
      step2Title: "Go to ChatGPT → Settings → Connectors",
      step2Body: "Enable MCP connectors (where available), name it Khazak API, and paste the URL.",
      step2Action: { label: "Open ChatGPT", href: "https://chatgpt.com" },
      step3Body: "Ask ChatGPT to browse the KZ catalogue or explain how to call a specific provider API.",
      cta: { label: "Start exploring", href: "https://chatgpt.com" },
    },
    cli: {
      step2Title: "Codex / CLI MCP config",
      step2Body: "Add the remote MCP URL to your OpenAI Codex or compatible CLI MCP configuration.",
      step2Snippet: (url) => `{\n  "servers": {\n    "khazak-api": { "url": "${url}" }\n  }\n}`,
      step3Body: "Prompt your CLI agent to search_kz_apis for “NBK” or “Kaspi”.",
      cta: { label: "OpenAI platform", href: "https://platform.openai.com" },
    },
  },
  {
    id: "cursor",
    label: "Cursor",
    mcp: {
      step2Title: "Cursor → Settings → MCP",
      step2Body: "Add a new MCP server with type URL/HTTP. Name it khazak-api and paste the connector URL.",
      step2Action: { label: "Open Cursor MCP docs", href: "https://cursor.com/docs/context/mcp" },
      step3Body: "In Agent or Chat, ask Cursor to search Kazakhstan APIs or open a specific catalogue entry.",
      cta: { label: "Open Cursor", href: "https://cursor.com" },
    },
    cli: {
      step2Title: "Edit .cursor/mcp.json",
      step2Body: "Add this to your project or global Cursor MCP config, then reload the window.",
      step2Snippet: (url) => `{\n  "mcpServers": {\n    "khazak-api": {\n      "url": "${url}"\n    }\n  }\n}`,
      step3Body: "Use Agent mode and ask: “Find open data APIs on data.egov.kz about population.”",
      cta: { label: "Cursor MCP docs", href: "https://cursor.com/docs/context/mcp" },
    },
  },
  {
    id: "claude-code",
    label: "Claude Code",
    mcp: {
      step2Title: "Claude Code → MCP settings",
      step2Body: "Register Khazak API as a remote HTTP MCP server in Claude Code connector settings.",
      step2Action: { label: "Claude Code docs", href: "https://docs.anthropic.com/en/docs/claude-code" },
      step3Body: "Ask Claude Code to search the catalogue while you build an integration.",
      cta: { label: "Get Claude Code", href: "https://docs.anthropic.com/en/docs/claude-code" },
    },
    cli: {
      step2Title: "Add with Claude Code CLI",
      step2Body: "Run this in your terminal to register the remote MCP server.",
      step2Snippet: (url) => `claude mcp add --transport http khazak-api ${url}`,
      step3Body: "Claude Code can now call search_kz_apis, get_kz_api, and list_api_categories.",
      cta: { label: "Claude Code docs", href: "https://docs.anthropic.com/en/docs/claude-code" },
    },
  },
  {
    id: "openclaw",
    label: "OpenClaw",
    mcp: {
      step2Title: "OpenClaw → Integrations",
      step2Body: "Add a remote MCP connector named Khazak API and paste the URL in integration settings.",
      step2Action: { label: "OpenClaw", href: "https://openclaw.ai" },
      step3Body: "Use OpenClaw agents to discover and wire Kazakhstan APIs into your workflow.",
      cta: { label: "Start exploring", href: "https://openclaw.ai" },
    },
    cli: {
      step2Title: "OpenClaw CLI config",
      step2Body: "Point OpenClaw at the Khazak remote MCP endpoint.",
      step2Snippet: (url) => `openclaw mcp register khazak-api --url "${url}"`,
      step3Body: "Trigger an agent task that searches the KZ catalogue.",
      cta: { label: "OpenClaw", href: "https://openclaw.ai" },
    },
  },
  {
    id: "hermes",
    label: "Hermes",
    mcp: {
      step2Title: "Hermes → MCP connectors",
      step2Body: "Create a new HTTP MCP connector named Khazak API and paste the URL.",
      step2Action: { label: "Hermes", href: "https://hermes.ai" },
      step3Body: "Ask Hermes to explore Kazakhstan government and commercial APIs from the catalogue.",
      cta: { label: "Start exploring", href: "https://hermes.ai" },
    },
    cli: {
      step2Title: "Hermes CLI MCP",
      step2Body: "Register the Khazak server in your Hermes CLI configuration.",
      step2Snippet: (url) => `hermes mcp add khazak-api --endpoint "${url}"`,
      step3Body: "Run agent prompts against the KZ API directory.",
      cta: { label: "Hermes", href: "https://hermes.ai" },
    },
  },
];

export function mcpConnectorUrl(origin) {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/mcp`;
}
