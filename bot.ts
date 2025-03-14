import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import { createExcelSheet } from "./sheet";
import dotenv from "dotenv";
dotenv.config();
const token = process.env.BALE_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN is not set");
  process.exit(1);
}
const bot = new TelegramBot(token, {
  polling: true,
  baseApiUrl: "https://tapi.bale.ai",
});

// Store user states
interface UserState {
  waitingForName: boolean;
  name?: string;
}

const userStates: Record<number, UserState> = {};

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Reset user state
  userStates[chatId] = {
    waitingForName: true,
  };

  bot.sendMessage(
    chatId,
    "Welcome to the file generator bot! Please enter your name:"
  );
});

// Handle regular messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands
  if (text?.startsWith("/")) {
    return;
  }

  // Initialize state if needed
  if (!userStates[chatId]) {
    userStates[chatId] = {
      waitingForName: false,
    };
  }

  // Handle name input
  if (userStates[chatId].waitingForName && text) {
    userStates[chatId].name = text;
    userStates[chatId].waitingForName = false;

    bot.sendMessage(chatId, `Thank you, ${text}! Generating your file...`);

    try {
      // Generate a custom file with the user's name
      const fileName = `${text.replace(/\s+/g, "_")}_file.xlsx`;
      const filePath = path.join(__dirname, fileName);

      // Create sample data with the user's name
      const sampleData = [
        {
          name: text,
          created_date: new Date().toISOString(),
          type: "User File",
        },
        {
          name: "Sample Data 1",
          created_date: new Date().toISOString(),
          type: "Example",
        },
        {
          name: "Sample Data 2",
          created_date: new Date().toISOString(),
          type: "Example",
        },
      ];

      // Create the Excel file
      await createExcelSheet(sampleData, filePath);

      // Send the file
      await bot.sendDocument(chatId, filePath, {
        caption: `Here's your file, ${text}!`,
      });

      // Clean up the file after sending
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting temporary file:", err);
      });

      // Reset the conversation
      bot.sendMessage(chatId, "You can start again with the /start command.");
    } catch (error) {
      console.error("Error generating file:", error);
      bot.sendMessage(
        chatId,
        "Sorry, there was an error generating your file. Please try again."
      );
    }
  } else {
    // If we receive a message but aren't waiting for a name
    bot.sendMessage(chatId, "Please use the /start command to begin.");
  }
});

// Error handling
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

console.log("Bot is running...");
