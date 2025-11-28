import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'Task_Manager',
            appName: 'taskmanager'
        });

        console.log(`MongoDB Connected: ${connect.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
