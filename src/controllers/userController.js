import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { validationResult } from "express-validator";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from '../config/cloudinary.js';


export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(
            new Apiresponse(200, user, "Profile fetched successfully"));
});


export const logout = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    await User.findByIdAndUpdate(userId,
        { isActive: false }
    );

    return res.status(200).json(
        new Apiresponse(
            200,
            {},
            "Logout successful"
        )
    );
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");

    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found");
    }

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                users,
                "All users fetched successfully"
            )
        );
});


export const editUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, title, role, profileImgURL } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map((err) => err.msg));
    }

    const updateUser = await User.findByIdAndUpdate(
        id,
        {
            fullName,
            title,
            role,
        },
        { new: true }
    )

    if (!updateUser) {
        throw new ApiError(404, 'User not found')
    }

    res.status(200).json(
        new Apiresponse(200, updateUser, "User edit succeccfully")
    )

})

export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    await User.findByIdAndDelete(id)

    return res.status(200).json(
        new Apiresponse(200, user, "User delete successfull")
    )
})

export const sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    const message = `Your OTP is: ${otp}.\n It will expire in 5 minutes.\n Do not share your OTP`;

    await sendEmail(email, "Your Verification OTP", message);

    return res
        .status(200)
        .json(new Apiresponse(200, {}, `OTP sent to your email ${email}`));
});


export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.otp || !user.otpExpires) {
        throw new ApiError(400, "OTP not requested");
    }

    if (user.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.otpExpires < Date.now()) {
        throw new ApiError(400, "OTP expired");
    }

    // OTP verified -> clear fields
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json(
        new Apiresponse(200, {}, "OTP verified successfully")
    );
});

export const uploadProfile = asyncHandler(async (req, res) => {

    console.log(req.file);
    const { id } = req.params;
    const user = await User.findById(id);

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }
    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64Data, {
        folder: "user_profiles",
    });
    user.profileImgURL = result.secure_url
    await user.save()

    return res.status(200).json(
        new Apiresponse(200, { imageUrl: result.secure_url }, "Image uploaded successfully")
    )

}) 