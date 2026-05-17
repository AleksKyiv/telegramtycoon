# Telegram Bot Test

Goal: open this prototype inside Telegram and verify that the app sees the Telegram user.

## What Works In This Step

- Telegram Mini App opens from a bot menu button.
- Frontend detects `Telegram.WebApp`.
- Game shows connection status:
  - `Browser preview` outside Telegram;
  - `Telegram connected` inside Telegram;
  - user name / username / id when Telegram provides it.

This step does not include real Stars payments yet.

## Requirements

- A Telegram bot from BotFather.
- A public HTTPS URL for this frontend.
- `BOT_TOKEN` stored locally in `.env`, not in chat and not in GitHub.

## Public HTTPS URL Options

Fastest first test:

- GitHub Pages: good enough for opening the static Mini App and reading Telegram user data.

Better next technical step:

- Render or Railway: needed when we add backend, database, webhooks, and Stars.

## BotFather Steps

1. Open `@BotFather`.
2. Create or select your bot.
3. Use BotFather's Mini App / Web App settings and set the public HTTPS URL.
4. Keep the bot token private.

## Local Configuration File

Create `.env` from `.env.example`:

```text
BOT_TOKEN=your-real-bot-token
PUBLIC_APP_URL=https://your-public-https-url.example
BOT_MENU_TEXT=Open Green Farm
```

## Configure Bot Menu Button

After `.env` is ready:

```powershell
npm run telegram:menu
```

The script calls Telegram Bot API:

- `getMe`
- `setMyCommands`
- `setChatMenuButton`

## Test Checklist

1. Open your bot in Telegram.
2. Tap the menu button.
3. Mini App opens.
4. The status strip in the game changes from `Browser preview` to `Telegram connected`.
5. The second line shows your Telegram name, username, or id.

## Next Step After This Test

Add backend validation:

- frontend sends `Telegram.WebApp.initData` to backend;
- backend validates the signature using `BOT_TOKEN`;
- player progress is saved by Telegram user id.
