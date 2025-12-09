import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    assignTaskTo: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
    ],
    message: {
        type: String,
        default: ""
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date, default: Date.now
    }
});

export const Notification = mongoose.model("Notification", NotificationSchema);
