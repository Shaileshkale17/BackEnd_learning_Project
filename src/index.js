import dotenv from "dotenv";
import { ConnectDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

const port = process.env.PORT || 3000;

ConnectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Connecting to ${port}`);
    });
    app.on("error", (error) => {
      console.log("ERROR", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection error: " + err);
  });

/**
   * (async () => {
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
