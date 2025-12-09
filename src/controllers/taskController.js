import { validationResult } from "express-validator";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cloudinary from '../config/cloudinary.js';


export const addTask = asyncHandler(async (req, res) => {
    const {
        taskTitle,
        assignTaskTo,
        taskStage,
        taskData,
        priorityLevel,
        assetsFile,
        taskDesc,
        tag,
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map((err) => err.msg));
    }

    const formattedAssignedUsers = assignTaskTo?.map(id => ({
        userId: id
    })) || [];
    const newTask = await Task.create({
        taskTitle,
        // assignTaskTo,
        assignTaskTo,
        taskStage,
        taskData,
        priorityLevel,
        assetsFile,
        taskDesc,
        tag,
    });

    return res.status(201).json(
        new Apiresponse(201, newTask, "Task created successfully")
    );
});

export const editTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        taskTitle,
        assignTaskTo,
        taskStage,
        taskData,
        priorityLevel,
        taskDesc,
        tag,
        comment
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map((err) => err.msg));
    }

    // find & update
    const updatedTask = await Task.findByIdAndUpdate(
        id,
        {
            taskTitle,
            assignTaskTo,
            taskStage,
            taskData,
            priorityLevel,
            taskDesc,
            tag,
            comment
        },
        { new: true }
    );

    if (!updatedTask) {
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: updatedTask
    });
});

export const addCommentToTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, desc } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map((err) => err.msg));
    }

    const task = await Task.findById(id);

    if (!task) {
        return res.status(404).json(
            new Apiresponse(404, 'Task not found')
        )
    }

    task.comments.push({
        name,
        desc,
        createdAt: new Date()
    })

    await task.save()

    console.log(task)

    return res.status(200).json(
        new Apiresponse(200, task, "Comment added")
    )

})

export const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json(
        new Apiresponse(200, task, "Task delete permanently")
    )

})

export const moveToTrash = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    task.isTrashed = true;
    await task.save();

    return res.status(200).json(
        new Apiresponse(200, task, "Task move to trash")
    )

});

export const restoreTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    task.isTrashed = false;
    await task.save();

    return res.status(200).json(
        new Apiresponse(
            200,
            task,
            "Task restored from trash"
        )
    );
});

export const duplicateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const oldTask = await Task.findById(taskId);

    if (!oldTask) {
        throw new ApiError(404, 'Task not fount')
    }

    let copy = oldTask.toObject();
    copy.taskTitle = `${oldTask.taskTitle} (copy)`

    delete copy._id;
    delete copy.createdAt;
    delete copy.updatedAt;

    const newTask = await Task.create(copy);

    return res.status(200).json(
        new Apiresponse(200, newTask, "Task duplicate successfull")
    )

})

export const addActivity = asyncHandler(async (req, res) => {
    const taskId = req.params.id
    const { status, message } = req.body;

    const task = await Task.findById(taskId)

    if (!task) {
        throw new ApiError(404, 'Task not found')
    }
    task.activity.unshift({
        status,
        message,
        createdAt: new Date(),
        createdBy: req.user.id
    })
    await task.save();
    return res.status(200).json(
        new Apiresponse(200, task, "Activity added")
    )
})

export const addSubTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { taskTitle, taskDate, tag } = req.body;

    const task = await Task.findById(taskId)
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    task.subTasks = task.subTasks || [];

    task.subTasks.unshift({
        taskTitle,
        taskDate,
        tag,
        isCompleted: false,
        createdAt: new Date(),
        createdBy: req.user.id
    });


    await task.save();
    console.log(task)
    return res.status(200).json(
        new Apiresponse(200, task, "Subtask added Successfully")
    );
});

export const updateTaskStatus = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { taskStage } = req.body;
    const allowed = ["ToDo", "InProcess", "Completed"];

    if (!allowed.includes(taskStage)) {
        return res.status(400).json(
            new Apiresponse(400, {}, 'Invalid status'));
    }

    const task = await Task.findByIdAndUpdate(
        id,
        { taskStage },
        { new: true }
    );



    if (!task) {
        return res.status(404).json(
            new Apiresponse(404, {}, 'Task not found')
        );
    }

    return res.status(200).json(
        new Apiresponse(200, task, "Task status update")
    );

});


// get ke controller
export const getTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id)
        .populate("activity.createdBy", "fullName email profileImgURL")
        .populate("subTasks.createdBy", "fullName email profileImgURL")
        .populate("assignTaskTo.userId", "fullName title profileImgURL email")

    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    return res.status(200).json(
        new Apiresponse(200, task, "Task fetch successfull")
    )

})

export const getAllTask = asyncHandler(async (req, res) => {
    const task = await Task.find()
        .populate("activity.createdBy", "fullName email profileImgURL")
        .populate("subTasks.createdBy", "fullName email profileImgURL")
        .populate("assignTaskTo.userId", "fullName title profileImgURL email")
        .sort({ createdAt: -1 });

    if (!task) {
        throw new ApiError(404, "Tasks not found")
    }
    return res.status(200).json(
        new Apiresponse(200, task, "All tasks fetch successfull")
    )
})

export const getAssignedTasks = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const tasks = await Task.find({
        assignTaskTo: {
            $elemMatch: { userId: userId }
        }
    })
        .populate("assignTaskTo.userId", "fullName email profileImgURL title")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        tasks
    });
});

export const getTaskStats = asyncHandler(async (req, res) => {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ taskStage: "Completed" });
    const inProcessTasks = await Task.countDocuments({ taskStage: "InProcess" });
    const todoTasks = await Task.countDocuments({ taskStage: "ToDo" });

    const lastMonthChange = "0%";

    res.status(200).json({
        totalTasks: {
            count: totalTasks,
            change: lastMonthChange,
            title: "Last Month",
        },
        completedTasks: {
            count: completedTasks,
            change: lastMonthChange,
            title: "Last Month",
        },
        inProcessTasks: {
            count: inProcessTasks,
            change: lastMonthChange,
            title: "Last Month",
        },
        todoTasks: {
            count: todoTasks,
            change: lastMonthChange,
            title: "Last Month",
        },
    });
});


// upload Task

export const uploadAssets = asyncHandler(async (req, res) => {

    console.log(req.file);

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }
    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64Data, {
        folder: "task_assets",
    });

    const assetsURL = result.secure_url

    return res.status(200).json(
        new Apiresponse(200, assetsURL, "Image uploaded successfully")
    )

})



