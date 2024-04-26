import { Router } from "express";
import { registerUser } from "../contrallers/user.contraller.js";
import { upload } from "../middlewares/multer.niddlewares.js";

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

export default router;
