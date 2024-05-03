import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asycHandler.js";
import { ApiError } from "../utils/AppError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  //todo : create tweet
  try {
    const { owner, content } = req.body;
    if (!(owner && content)) {
      throw new ApiError(406, "id or content is required");
    }

    const Tweets = await Tweet.create({ content, owner });
    const createTweet = await Tweet.findById(Tweets._id);
    if (!createTweet) {
      throw new ApiError(500, "Tweet not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createTweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
// get All tweets
const getAllTweet = asyncHandler(async (req, res) => {
  //todo : get All tweet
  try {
    const tweetAll = await Tweet.find({});
    if (!tweetAll || tweetAll.length === 0) {
      throw new ApiError(500, "Tweets is not available");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweetAll, "User Tweet returned successfully"));
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});

// find by User Tweet
const getUserTweet = asyncHandler(async (req, res) => {
  //todo : get user tweet
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError(404, "owered user id not found");
    }
    const tweetByUser = await Tweet.find({ owner: userId });
    if (!tweetByUser || tweetByUser.length === 0) {
      throw new ApiError(500, "Tweets is not available");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, tweetByUser, "User Tweet returned successfully")
      );
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});

const UpdateTweet = asyncHandler(async (req, res) => {
  // todo: Update  tweet

  try {
    const { tweetId } = req.params;
    const { content } = req.query;

    if (!(content && tweetId)) {
      throw new ApiError(404, "Invalid content");
    }

    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json(new ApiResponse(200, tweet, "updated successfully"));
  } catch (error) {
    throw new ApiError(404, "update tweet failed" + error);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  // todo: Delete  tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(200, "Invalid tweet id provided ");
  }

  const deleteTweets = await Tweet.findByIdAndDelete(tweetId);

  if (!deleteTweets) {
    throw new ApiError(404, "Tweet is all ready deleted");
  }

  res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweet, UpdateTweet, deleteTweet, getAllTweet };
