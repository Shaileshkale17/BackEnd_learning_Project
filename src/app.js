import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes imported

import userRouter from "./routes/user.routes.js";
import TweetRouter from "./routes/Tweet.routes.js";

// routes declarations

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweet", TweetRouter);

export { app };
