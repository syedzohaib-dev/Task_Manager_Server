import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/connectDB.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from './src/routes/authRoutes.js'
import taskRoutes from './src/routes/taskRoutes.js'

const app = express();

dotenv.config();
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
connectDB()

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/task", taskRoutes);
// app.use("/api/v1/quotation", quotationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
