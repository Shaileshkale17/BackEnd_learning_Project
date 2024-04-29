import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asycHandler.js";
import { uploadincloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// Refersh Token

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    console.log({ accessToken, refreshToken });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;
  console.log(`register ${fullname} ${email} ${password} ${username} `);
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
        ApiResponse(
          200,
          { accessToken, refreshToken: NewRefreshToken },
          "AccessToken is required"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
