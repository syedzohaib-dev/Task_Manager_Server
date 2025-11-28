import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Apiresponse } from "../../utils/apiResponse.js";
import { validationResult } from "express-validator";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { sendEmail } from "../../utils/sendEmail.js";

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

    // user ka id token middleware se milta hai
    const userId = req.user._id;

    // isActive ko false kar do
    await User.findByIdAndUpdate(userId, {
        isActive: false
    });

    // Optional: cookie remove karna ho to
    // res.clearCookie("token");

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
            profileImgURL
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
    upload.single("image"), async (req, res) => {
        if (!req.file) {
            throw new ApiError(400, "No file uploaded");
        }
        const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64Data, {
            folder: "user_profiles",
        });

        return res.status(200).json(
            new Apiresponse(200, { imageUrl: result.secure_url }, "Image uploaded successfully")
        )
    }
})