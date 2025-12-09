import express from "express";
import {
    addActivity,
    addCommentToTask,
    addSubTask,
    addTask,
    deleteTask,
    duplicateTask,
    editTask,
    getAllTask,
    getAssignedTasks,
    getTask,
    getTaskStats,
    moveToTrash,
    restoreTask,
    updateTaskStatus,
    uploadAssets
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { body } from "express-validator";
import upload from "../middleware/multerMiddleware.js";


const router = express.Router();

router.post("/addtask", protect,
    [
        body("taskTitle").notEmpty().withMessage("Task title is required"),
        // body("assignTaskTo").isArray({ min: 1 }).withMessage("AssignTaskTo must contain at least one user"),
        body("taskStage").optional().isIn(["ToDo", "InProgress", "Completed"]).withMessage("Task stage invalid"),
        body("taskData").notEmpty().withMessage("Task data is required"),
        body("priorityLevel").optional().isIn(["High", "Medium", "Normal"]).withMessage("Priority level invalid"),
        body("taskDesc").notEmpty().withMessage("Task description is required"),
    ]
    , addTask);

router.put("/edittask/:id",
    [
        body("taskTitle").notEmpty().withMessage("Task title is required"),
        // body("assignTaskTo").isArray({ min: 1 }).withMessage("AssignTaskTo must contain at least one user"),
        body("taskStage").optional().isIn(["ToDo", "InProgress", "Completed"]).withMessage("Task stage invalid"),
        body("taskData").notEmpty().withMessage("Task data is required"),
        body("priorityLevel").optional().isIn(["High", "Medium", "Normal"]).withMessage("Priority level invalid"),
        body("taskDesc").notEmpty().withMessage("Task description is required"),
        body("tag").optional().isString().withMessage("Tag must be a string"),
    ]
    , editTask);

router.post(
    "/addcomment/:id",
    [
        body("name").notEmpty().withMessage("Comment name required"),
        body("desc").notEmpty().withMessage("Comment description required"),
    ],
    addCommentToTask
);

router.post("/addsubtask/:id",
    protect,
    [
        body("taskTitle").notEmpty().withMessage("Task title is required"),
        body("date").notEmpty().withMessage("Date is required"),
        body("tag").notEmpty().withMessage("Tag is required"),
    ],
    addSubTask);


router.put("/movetotrash/:id", protect, moveToTrash);
router.put("/restoretrash/:id", protect, restoreTask);
router.delete("/deletetask/:id", protect, deleteTask);
router.post("/duplicatetask/:id", protect, duplicateTask);
router.post("/addactivity/:id", protect, addActivity);
router.put("/status/:id", protect, updateTaskStatus);

// get ke routes 
router.get("/gettask/:id", protect, getTask);
router.get("/all", protect, getAllTask);
router.get("/mytasks", protect, getAssignedTasks);
router.get("/getstats", getTaskStats);

// Upload ke routes
router.post("/uploadassets", upload.single("image"), uploadAssets);


export default router;
