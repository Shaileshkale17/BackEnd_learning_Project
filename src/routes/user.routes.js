import { Router } from "express";
import {
  loginUser,
  logoutUser,
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

router.route("/login").post(verifyJWT, logoutUser);

export default router;
