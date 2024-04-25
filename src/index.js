import dotenv from "dotenv";
import express from "express";
import { ConnectDB } from "./db/index.js";
import { DB_NAME } from "./constants.js";
import mongoose from "mongoose";
const port = process.env.PORT || 3000;
const app = express();

dotenv.config({
  path: "./env",
});
ConnectDB();
/*
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_API}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR", error);
      throw error;
    });
    app.listen(port, function () {
      console.log("Server is running on port " + port);
    });
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
})();
*/
