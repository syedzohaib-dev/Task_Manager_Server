import multer from "multer";

const storage = multer.memoryStorage(); // stores file in buffer

const upload = multer({ storage });

export default upload;
