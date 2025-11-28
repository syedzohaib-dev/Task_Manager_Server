import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    desc: { type: String, default: "" },
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
    taskTitle: {
        type: String,
        required: true,
        trim: true,
    },

    assignTaskTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ],

    taskStage: {
        type: String,
        enum: ["todo", "inProgress", "completed"],
        default: "todo",
    },

    taskData: {
        type: String,
        required: true,
    },

    priorityLevel: {
        type: String,
        enum: ["high", "medium", "normal"],
        default: "normal",
    },

    assetsFile: {
        type: String, // file URL
        default: null,
    },

    taskDesc: {
        type: String,
        required: true,
    },

    tag: {
        type: String,
        default: "",
    },

    comments: [commentSchema],

    isActive: {
        type: Boolean,
        default: true,
    },
    isTrashed: {
        type: Boolean,
        default: false
    },
    activity: [
        {
            status: String,
            message: String,
            createdAt: Date,
            createdBy: mongoose.Schema.Types.ObjectId
        }
    ]

}, { timestamps: true });

export const Task = mongoose.model("Task", taskSchema);
