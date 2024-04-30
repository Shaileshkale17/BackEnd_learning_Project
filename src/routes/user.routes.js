import { Router } from "express";
import {
  ChangeCurrentPassword,
  DeleteAccount,
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
// * register routes
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

// * Login routes
router.route("/login").post(loginUser);

// * Logout routes
router.route("/logout").post(verifyJWT, logoutUser);

// * Refresh Token routes
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

//* Change Password routes
router.route("/change-password").post(verifyJWT, ChangeCurrentPassword);

//* Change user routes
router.route("/current-user").get(verifyJWT, getCurrentUser);

//* Update user  details routes
router.route("/update-account").patch(verifyJWT, UpdateAccountDetails);

//* Update user avatar routes
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), UpdateUserAvatar);

//* cover image  update routes
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), UpdateUserCover);

//* channel Profile routes
router
  .route("/channel-profile/:username")
  .get(verifyJWT, getUserChannelProfile);

//* channel History routes
router.route("/history").get(verifyJWT, getwhatchHistory);

//* delete account routes
router.route("/delete-account/:id").delete(DeleteAccount);

export default router;
