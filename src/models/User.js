import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
            required: true
        },
        profileImgURL: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: false,
            required: true
        },
        otp: {
            type: String,
            default: null
        },
        otpExpires: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
