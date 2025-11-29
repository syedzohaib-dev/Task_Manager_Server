import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'


export const signup = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map((err) => err.msg));
    }

    const { fullName, title, email, password, role, profileImgURL } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        title,
        email,
        password: hashedPassword,
        role: role || "user",
        profileImgURL,
    });

    return res.status(201).json(
        new Apiresponse(
            201,
            user,
            "User created successfully"
        )
    );
});


export const login = asyncHandler(async (req, res) => {
    // Validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map((err) => err.msg));
    }

    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    await User.findByIdAndUpdate(user._id, { isActive: true })

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return res.status(200).json(
        new Apiresponse(
            200,
            { user, token, },
            "Login successful"
        )
    );
});