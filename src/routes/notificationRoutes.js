import express from "express";
import {
    createNotification,
    getNotifications
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createnotification", protect, createNotification);
router.get("/getnotifications", protect, getNotifications);

export default router;