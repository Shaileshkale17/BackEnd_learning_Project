import { Router } from "express";
import {
  ChangeCurrentPassword,
  UpdateAccountDetails,
  UpdateUserAvatar,
  UpdateUserCover,
  getCurrentUser,
  getUserChannelProfile,
  getwhatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../contrallers/user.contraller.js";
import { upload } from "../middlewares/multer.niddlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
// router's setup function router
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/Refresh-Token").post(verifyJWT, refreshAccessToken);
router.route("/change-password").post(verifyJWT, ChangeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, UpdateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), UpdateUserAvatar);

router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("cover-image"), UpdateUserCover);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getwhatchHistory);

export default router;
