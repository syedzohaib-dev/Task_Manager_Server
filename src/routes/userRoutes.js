import { body } from "express-validator";
import {
    deleteUser,
    editUser,
    getAllUsers,
    getUser,
    logout,
    sendOTP,
    uploadProfile,
    verifyOTP
} from "../controllers/userController.js";

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = express.Router();



router.get('/getuser', protect, getUser);

router.get('/getallusers', protect, getAllUsers);

router.post(
    "/sendotp",
    [
        body("email").isEmail().withMessage('Please enter a valid email address')
    ],
    sendOTP);
router.post("/verifyotp", verifyOTP);

router.put("/edituser/:id",
    [
        body("fullName").notEmpty().withMessage("Full name is required"),
        body("title").notEmpty().withMessage("Title is required"),
        body("role").optional().isIn(["admin", "user"]).withMessage("Role must be admin or user")
    ],
    protect, editUser);

router.delete("/deleteuser/:id", protect, deleteUser);

router.post("/uploadprofile/:id", protect, upload.single("image"), uploadProfile);

router.post("/logout", protect, logout);

export default router;
