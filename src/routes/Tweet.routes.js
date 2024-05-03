import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  UpdateTweet,
  createTweet,
  deleteTweet,
  getAllTweet,
  getUserTweet,
} from "../contrallers/Tweet.contrallers.js";

const router = Router();

// router.use(verifyJWT);

router.route("/").post(verifyJWT, createTweet);
router.route("/getAll").get(verifyJWT, getAllTweet);
router.route("/user/:userId").get(verifyJWT, getUserTweet);
router.route("/:tweetId").patch(verifyJWT, UpdateTweet);
router.route("/:tweetId").delete(verifyJWT, deleteTweet);

export default router;
