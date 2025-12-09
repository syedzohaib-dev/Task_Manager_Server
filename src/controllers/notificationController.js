import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/Notification.js";
import { Task } from '../models/Task.js'
import { Apiresponse } from '../utils/apiResponse.js'

export const createNotification = asyncHandler(async (req, res) => {
    const { assignTaskTo, taskId } = req.body;

    if (!assignTaskTo || !Array.isArray(assignTaskTo) || assignTaskTo.length === 0) {
        return res.status(400).json({ message: "assignTaskTo array missing or empty" });
    }

    if (!taskId) {
        return res.status(400).json({ message: "taskId missing" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    const notifications = [];

    for (let user of assignTaskTo) {
        if (!user.userId) continue;
        const notify = await Notification.create({
            userId: user.userId,
            message: `You have been assigned a new task: ${task.taskTitle}`,
            taskId: task._id
        });
        notifications.push(notify);
    }

    res.status(201).json(
        new Apiresponse(200, notifications, 'Notification create')
    );
});


export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 });

    res.status(200).json(
        new Apiresponse(200, notifications, 'Notifications fetched successfully')
    );
});