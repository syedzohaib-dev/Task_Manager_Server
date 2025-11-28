import { body } from "express-validator";
import { deleteUser, editUser, getAllUsers, getUser, login, logout, sendOTP, signup, uploadProfile, verifyOTP } from "../controllers/user/userController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/signup",
    [
        body("fullName").notEmpty().withMessage("Full name is required"),
        body("title").notEmpty().withMessage("Title is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be 8 characters long"),
        body("role").optional().isIn(["admin", "user"]).withMessage("Role must be admin or user")
    ],
    signup
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Please enter a valid email address"),
        body("password").notEmpty().withMessage("Password is required")
    ],
    login
);

router.get('/getuser', protect, getUser)
router.get('/getallusers', protect, getAllUsers)
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
    protect, editUser)

router.delete("/deleteuser/:id", protect, deleteUser)
router.delete("/uploadprofile", protect, uploadProfile)

router.post("/logout", protect, logout)

export default router;
