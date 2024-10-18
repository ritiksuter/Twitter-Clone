import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotification, deleteNotifications, getNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.use(protectRoute);

router.get("/", getNotifications);
router.delete("/", deleteNotifications);
router.delete("/", deleteNotification);

export default router;