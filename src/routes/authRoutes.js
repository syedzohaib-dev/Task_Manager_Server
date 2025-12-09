import { body } from "express-validator";
import express from "express";
import {
    login,
    signup
} from "../controllers/authController.js";

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


export default router;