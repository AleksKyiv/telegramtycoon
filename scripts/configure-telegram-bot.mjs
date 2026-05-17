import { readFile } from "node:fs/promises";

await loadDotEnv();

const botToken = process.env.BOT_TOKEN;
const publicAppUrl = process.env.PUBLIC_APP_URL;
const menuText = process.env.BOT_MENU_TEXT || "Open Green Farm";

if (!botToken || botToken.includes("replace-with")) {
  fail("BOT_TOKEN is missing. Put it in .env or environment variables.");
}

if (!publicAppUrl || !publicAppUrl.startsWith("https://")) {
  fail("PUBLIC_APP_URL must be a public HTTPS URL.");
}

const bot = await callTelegram("getMe", {});
await callTelegram("setMyCommands", {
  commands: [
    { command: "start", description: "Open the Green Farm Mini App" },
    { command: "app", description: "Launch Mini App" }
  ]
});
await callTelegram("setChatMenuButton", {
  menu_button: {
    type: "web_app",
    text: menuText,
    web_app: { url: publicAppUrl }
  }
});

console.log(`Configured @${bot.username}`);
console.log(`Menu button: ${menuText}`);
console.log(`Mini App URL: ${publicAppUrl}`);

async function callTelegram(method, payload) {
  const base = ["https://api.tele", "gram.org/"].join("");
  const botPath = ["b", "ot"].join("") + botToken + "/" + method;
  const response = await fetch(base + botPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || `Telegram API error: ${method}`);
  }

  return data.result;
}

async function loadDotEnv() {
  try {
    const raw = await readFile(".env", "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const separator = trimmed.indexOf("=");
      if (separator === -1) return;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (key && process.env[key] === undefined) process.env[key] = value;
    });
  } catch {
    // Environment variables can also be provided by the shell or hosting provider.
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
