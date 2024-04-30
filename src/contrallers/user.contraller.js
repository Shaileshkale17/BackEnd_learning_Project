import { response } from "express";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asycHandler.js";
import { uploadincloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Refersh Token

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// register User

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;
  /*first type check is Empty
  if (fullname === "") {
    throw new ApiError(400,"full name required");
  }*/

  /** 2nd type check to Empty */
  if (
    [fullname, email, password, username].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "all fields must be required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatar = await uploadincloudinary(avatarLocalPath);
  const coverImage = await uploadincloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "somrthing went wrong ehile regstering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user regstered successfully"));
});

// login User

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPassworldValid = await user.isPasswordCorrect(password);

  if (!isPassworldValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
    user._id
  );

  //* 2nd time call server
  //* if you have ignoring 2nd time call server will using User method assigned

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// logout User

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// refresh Access Token

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRedreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRedreshToken) {
    throw new ApiError(401, "unauthenticated request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRedreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invlid refresh token ");
    }

    if (incomingRedreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refrsh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, NewRefreshToken } =
      await generateAccessAndRefereshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", NewRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: NewRefreshToken },
          "AccessToken is required"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh");
  }
});

// Change Current Password

const ChangeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findOne(req.user?._id);
  const isPassworldCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPassworldCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Update Account Details

const UpdateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!(fullname || email)) {
    throw new ApiError(400, "All fields are required");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
// Update User Avatar
const UpdateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const avatar = await uploadincloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "avatar Image updated successfully"));
});

// UpdateUserCover

const UpdateUserCover = asyncHandler(async (req, res) => {
  const CoverLocalPath = req.file?.path;

  if (!CoverLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const coverImage = await uploadincloudinary(CoverLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
        $project: {
          fullname: 1,
          username: 1,
          subscribersCount: 1,
          channelSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    },
  ]);
  console.log("channel", channel);

  if (!channel.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getwhatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "Video",
        localField: "whatchHistory",
        foreignField: "_id",
        as: "whatchHistory",
        pipeline: [
          {
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  fullname: 1,
                  username: 1,
                  avatar: 1,
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].whatchHistory,
        "watch history fetched successfully"
      )
    );
});

const DeleteAccount = asyncHandler(async (req, res) => {
  // user is not allowed to delete accounts
  // db.deleteAccount = true
  // response from send uaer account
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Invalid user id");
  }
  await User.findByIdAndDelete(id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(204)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(204, {}, "User deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  ChangeCurrentPassword,
  getCurrentUser,
  UpdateAccountDetails,
  UpdateUserAvatar,
  UpdateUserCover,
  getUserChannelProfile,
  getwhatchHistory,
  DeleteAccount,
};
