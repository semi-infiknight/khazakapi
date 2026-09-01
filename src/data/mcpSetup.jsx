function ClaudeMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.2 9.15 6.1 14 7.4 9.15 8.7 8 13.8 6.85 8.7 2 7.4l4.85-1.3L8 1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GrokMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 492" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M197.76 315.52l170.197-125.803c8.342-6.186 20.267-3.776 24.256 5.803 20.907 50.539 11.563 111.253-30.08 152.939-41.621 41.685-99.562 50.816-152.512 29.994l-57.834 26.816c82.965 56.768 183.701 42.731 246.656-20.33 49.941-50.006 65.408-118.166 50.944-179.627l.128.149c-20.971-90.282 5.162-126.378 58.666-200.17 1.28-1.75 2.56-3.499 3.819-5.291l-70.421 70.507v-.214l-243.883 245.27m-35.072 30.528c-59.563-56.96-49.28-145.088 1.515-195.926 37.568-37.61 99.136-52.97 152.874-30.4l57.707-26.666a166.554 166.554 0 00-39.019-21.334 191.467 191.467 0 00-208.042 41.942c-54.038 54.101-71.04 137.301-41.856 208.298 21.802 53.056-13.931 90.582-49.92 128.47C23.104 463.915 10.304 477.333 0 491.541l162.56-145.386"
      />
    </svg>
  );
}

function GptMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.2v7.6M4.8 6.2l6.4 3.6M4.8 9.8l6.4-3.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CursorMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2.8 13 8 6.4 9.4 3 13.2V2.8Z" fill="currentColor" />
    </svg>
  );
}

function CodeMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 7.2 4.6 8.5 6 9.8M10 7.2l1.4 1.3L10 9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ClawMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 11.5c1.6-3 3.2-6.6 4-8.8.8 2.2 2.4 5.8 4 8.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.2 9.2h5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HermesMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 12.2 8 3.2l4.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.4 8.6h5.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export const PLATFORMS = [
  {
    id: "claude",
    label: "Claude",
    icon: <ClaudeMark />,
    mcp: {
      step2Title: "Go to Claude → Customize",
      step2Body: "In Claude desktop or claude.ai, go to Customize → Connectors. Name it Qazaq Stack and paste the URL",
      step2Cta: "Open Claude Customize",
      step2Href: "https://claude.ai/customize/connectors?modal=add-custom-connector",
      step3Title: "Connect, sign in and start",
      step3Body: "Sign in, then ask Claude to search Kazakhstan APIs or fetch NBK rates",
      startCta: "Start exploring",
      startHref: "https://claude.ai/new",
    },
    cli: {
      command: (url) => `claude mcp add --transport http qazaq-stack ${url}`,
      step2Title: "Run the Claude Code CLI",
      step2Body: "Paste the command from step 1 in your terminal, then restart Claude Code",
      step2Cta: "Claude Code docs",
      step2Href: "https://docs.anthropic.com/en/docs/claude-code",
      step3Title: "Ask Claude Code to start",
      step3Body: "Ask it to search the Qazaq Stack catalogue or open a specific KZ API",
      startCta: "Open docs",
      startHref: "https://docs.anthropic.com/en/docs/claude-code",
    },
  },
  {
    id: "grok",
    label: "Grok Bot",
    icon: <GrokMark />,
    mcp: {
      step2Title: "Go to Grok → Connectors",
      step2Body: "In Grok, add a custom MCP connector. Name it Qazaq Stack and paste the URL",
      step2Cta: "Open Grok",
      step2Href: "https://grok.com",
      step3Title: "Connect, sign in and start",
      step3Body: "Sign in, then ask Grok to list KZ payment APIs or geocode Almaty via 2GIS",
      startCta: "Start exploring",
      startHref: "https://grok.com",
    },
    cli: {
      command: (url) => `grok mcp add qazaq-stack --url "${url}"`,
      step2Title: "Register with Grok CLI",
      step2Body: "If your Grok CLI supports remote MCP, run the command from step 1",
      step2Cta: "Grok docs",
      step2Href: "https://docs.x.ai",
      step3Title: "Connect and start",
      step3Body: "Ask Grok to search Qazaq Stack for Kazhydromet or Kaspi APIs",
      startCta: "Open Grok",
      startHref: "https://grok.com",
    },
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    icon: <GptMark />,
    mcp: {
      step2Title: "Go to ChatGPT → Connectors",
      step2Body: "In ChatGPT settings, add an MCP connector. Name it Qazaq Stack and paste the URL",
      step2Cta: "Open ChatGPT",
      step2Href: "https://chatgpt.com",
      step3Title: "Connect, sign in and start",
      step3Body: "Sign in, then ask ChatGPT to browse Kazakhstan APIs from the catalogue",
      startCta: "Start exploring",
      startHref: "https://chatgpt.com",
    },
    cli: {
      command: (url) => `codex mcp add qazaq-stack --url "${url}"`,
      step2Title: "Add via Codex CLI",
      step2Body: "Drop the command from step 1 into Codex or your OpenAI CLI MCP config",
      step2Cta: "OpenAI platform",
      step2Href: "https://platform.openai.com",
      step3Title: "Connect and start",
      step3Body: "Prompt your agent to search_kz_apis for “NBK” or “Kaspi”",
      startCta: "Open platform",
      startHref: "https://platform.openai.com",
    },
  },
  {
    id: "cursor",
    label: "Cursor",
    icon: <CursorMark />,
    mcp: {
      step2Title: "Go to Cursor → Settings → MCP",
      step2Body: "Add a new MCP server (URL / HTTP). Name it qazaq-stack and paste the URL",
      step2Cta: "Open Cursor MCP docs",
      step2Href: "https://cursor.com/docs/context/mcp",
      step3Title: "Connect, sign in and start",
      step3Body: "Reload Cursor, then ask Agent to search Kazakhstan APIs",
      startCta: "Start exploring",
      startHref: "https://cursor.com",
    },
    cli: {
      command: (url) => `{\n  "mcpServers": {\n    "qazaq-stack": { "url": "${url}" }\n  }\n}`,
      step2Title: "Edit .cursor/mcp.json",
      step2Body: "Paste the JSON from step 1 into your project or user MCP config, then reload",
      step2Cta: "Cursor MCP docs",
      step2Href: "https://cursor.com/docs/context/mcp",
      step3Title: "Connect and start",
      step3Body: "In Agent mode, ask: “Find open data APIs on data.egov.kz”",
      startCta: "Open docs",
      startHref: "https://cursor.com/docs/context/mcp",
    },
  },
  {
    id: "claude-code",
    label: "Claude Code",
    icon: <CodeMark />,
    mcp: {
      step2Title: "Go to Claude Code → MCP",
      step2Body: "Register Qazaq Stack as a remote HTTP MCP server in Claude Code settings",
      step2Cta: "Claude Code docs",
      step2Href: "https://docs.anthropic.com/en/docs/claude-code",
      step3Title: "Connect, sign in and start",
      step3Body: "Ask Claude Code to search the Qazaq Stack catalogue while you build",
      startCta: "Start exploring",
      startHref: "https://docs.anthropic.com/en/docs/claude-code",
    },
    cli: {
      command: (url) => `claude mcp add --transport http qazaq-stack ${url}`,
      step2Title: "Add with Claude Code CLI",
      step2Body: "Run the command from step 1 in your terminal",
      step2Cta: "Claude Code docs",
      step2Href: "https://docs.anthropic.com/en/docs/claude-code",
      step3Title: "Connect and start",
      step3Body: "Claude Code can now call search_kz_apis, get_kz_api, and list_api_categories",
      startCta: "Open docs",
      startHref: "https://docs.anthropic.com/en/docs/claude-code",
    },
  },
  {
    id: "openclaw",
    label: "OpenClaw",
    icon: <ClawMark />,
    mcp: {
      step2Title: "Go to OpenClaw → Integrations",
      step2Body: "Add a remote MCP connector named Qazaq Stack and paste the URL",
      step2Cta: "Open OpenClaw",
      step2Href: "https://openclaw.ai",
      step3Title: "Connect, sign in and start",
      step3Body: "Sign in, then ask OpenClaw to discover Kazakhstan APIs",
      startCta: "Start exploring",
      startHref: "https://openclaw.ai",
    },
    cli: {
      command: (url) => `openclaw mcp register qazaq-stack --url "${url}"`,
      step2Title: "Register with OpenClaw CLI",
      step2Body: "Run the command from step 1 to point OpenClaw at Qazaq Stack",
      step2Cta: "OpenClaw",
      step2Href: "https://openclaw.ai",
      step3Title: "Connect and start",
      step3Body: "Trigger an agent task that searches the KZ catalogue",
      startCta: "Open OpenClaw",
      startHref: "https://openclaw.ai",
    },
  },
  {
    id: "hermes",
    label: "Hermes",
    icon: <HermesMark />,
    mcp: {
      step2Title: "Go to Hermes → MCP connectors",
      step2Body: "Create a new HTTP MCP connector named Qazaq Stack and paste the URL",
      step2Cta: "Open Hermes",
      step2Href: "https://hermes.ai",
      step3Title: "Connect, sign in and start",
      step3Body: "Sign in, then ask Hermes to explore Kazakhstan government APIs",
      startCta: "Start exploring",
      startHref: "https://hermes.ai",
    },
    cli: {
      command: (url) => `hermes mcp add qazaq-stack --endpoint "${url}"`,
      step2Title: "Add with Hermes CLI",
      step2Body: "Run the command from step 1 to register Qazaq Stack",
      step2Cta: "Hermes",
      step2Href: "https://hermes.ai",
      step3Title: "Connect and start",
      step3Body: "Run agent prompts against the KZ API directory",
      startCta: "Open Hermes",
      startHref: "https://hermes.ai",
    },
  },
];

export function mcpConnectorUrl(origin) {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/mcp`;
}
