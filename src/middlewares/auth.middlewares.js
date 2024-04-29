import { User } from "../models/User.model.js";
import { ApiError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asycHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const tocken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.reqlace("Bearer ", "");

    if (!tocken) {
      throw new ApiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(tocken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // NEXT_VIDEO: discuss about frontend
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token ");
  }
});
