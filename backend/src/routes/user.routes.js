import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = Router();

router.use(protectRoute);

router.get("/profile/:username", getUserProfile);
// router.get("/suggested", getSuggestedUsers);
router.post("/follow/:id", followUnfollowUser);
router.post("/update", updateUser);

export default router;