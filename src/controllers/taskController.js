import { validationResult } from "express-validator";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/apiError.js";
import { Apiresponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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

    const newTask = await Task.create({
        taskTitle,
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
    copy.taskData = `${oldTask.taskData} (copy)`

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
        createdBy: req.user._id
    })
    await task.save();
    return res.status(200).json(
        new Apiresponse(200, task, "Activity added")
    )
})

// get ke controller
export const getTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    return res.status(200).json(
        new Apiresponse(200, task, "Task fetch successfull")
    )

})

export const getAllTask = asyncHandler(async (req, res) => {
    const task = await Task.find()
    if (!task) {
        throw new ApiError(404, "Tasks not found")
    }
    return res.status(200).json(
        new Apiresponse(200, task, "All tasks fetch successfull")
    )
})

