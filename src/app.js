import express from "express";
import dotenv from "dotenv";
import {
  initializeTables,
} from "./db/db-initialization.js";
import CombinationController from "./modules/combination/combination.controller.js";
import { validateEnvVariables } from "./env.js";
dotenv.config();

const app = express();
app.use(express.json());
app.post("/generate", CombinationController.generateCombination);

const startServer = async () => {
  try {
    validateEnvVariables();
    await initializeTables();
    app.listen(process.env.PORT || 3000);
  } catch (error) {
    console.error("startServer", error);
    process.exit(1);
  }
};

startServer();
