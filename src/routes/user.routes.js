import { Router } from "express";
import {
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

export default router;
