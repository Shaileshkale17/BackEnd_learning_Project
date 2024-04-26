import { Router } from "express";
import { registerUser } from "../contrallers/user.contraller.js";

const router = Router();
// router's setup function router
router.route("/register").post(registerUser);

export default router;
