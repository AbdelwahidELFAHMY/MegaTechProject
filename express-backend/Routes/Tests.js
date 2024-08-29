import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import {
  getTests,
  getTestById,
  getTitles,
  addTest,
  deleteTest,
  updateTest,
  addQuestion,
} from "../Controllers/test.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get("/tests", getTests);
router.get("/tests/:id", getTestById);
router.get("/getTests", getTitles);
router.delete("/deleteTest/:id", deleteTest);
router.post("/addTest", upload.single("image"), addTest);
router.put('/updateTest/:id',upload.single('image') , updateTest)
router.post('/addQuestion', addQuestion)

export default router;
