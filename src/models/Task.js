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
            _id: false,
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        }
    ],

    taskStage: {
        type: String,
        enum: ["ToDo", "InProgress", "Completed"],
        default: "ToDo",
    },

    taskData: {
        type: String,
        required: true,
    },

    priorityLevel: {
        type: String,
        enum: ["High", "Medium", "Normal"],
        default: "Normal",
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
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    subTasks: [
        {
            taskTitle: String,
            date: String,
            tag: String,
            isCompleted: {
                type: Boolean,
                default: false
            },
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            createdAt: Date
        }
    ]

}, { timestamps: true });

export const Task = mongoose.model("Task", taskSchema);