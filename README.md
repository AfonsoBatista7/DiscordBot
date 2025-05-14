# 🤖 DiscordBot

A Discord bot designed to manage a Minecraft server and facilitate seamless communication between Discord users and in-game players.

## 📌 Features

- **Minecraft Server Management**: Execute server commands directly from Discord.
- **Chat Integration**: Relay messages between Discord channels and the Minecraft server chat.
- **Event Handling**: Respond to specific events occurring within the Minecraft server.
- **Custom Commands**: Extend functionality with user-defined commands.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your system.
- A Discord bot token. You can obtain one by creating a new application on the [Discord Developer Portal](https://discord.com/developers/applications).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AfonsoBatista7/DiscordBot.git
   cd DiscordBot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the bot:

   Create a `.env` file in the root directory and add your Discord bot token:

   ```env
   DISCORD_TOKEN=your-bot-token-here
   ```

4. Run the bot:

   - On Windows:

     ```bash
     run.bat
     ```

   - On Unix/Linux:

     ```bash
     ./run.sh
     ```

## ⚙️ Configuration

Ensure that your `.env` file contains the necessary environment variables:

```
DISCORD_TOKEN=your-bot-token-here
```

You can also configure additional settings as needed for your Minecraft server integration.

## 📂 Project Structure

- `commands/`: Contains command definitions that the bot can execute.
- `events/`: Handles Discord events such as messages, reactions, etc.
- `handlers/`: Manages the registration of commands and events.
- `models/`: Defines data models used within the bot.
- `images/`: Stores image assets used by the bot.
- `main.js`: The main entry point of the bot.

## 🛠️ Usage

Once the bot is running, it will listen for commands in your Discord server. Ensure that the bot has the necessary permissions to read and send messages in the channels you intend to use.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## 📬 Contact

- Discord: [0xrage](https://www.discordapp.com/users/0xrage)

- Email: [afonsobatista13@gmail.com](mailto://afonsobatista13@gmail.com)

- GitHub: [https://github.com/AfonsoBatista7/MineStats](https://github.com/AfonsoBatista7/MineStats)

---

Made with ❤️ for Minecraft server admins and their communities.

*Developed by [Afonso Batista](https://github.com/AfonsoBatista7)*