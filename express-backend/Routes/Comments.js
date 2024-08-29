import express from "express";
import {
  countComments,
  getComments,
  addComment,
  signalComment,
  countReportedComments,
  getAllComments,
  deleteComment,
} from "../Controllers/comment.js";

const router = express.Router();

router.get("/comments/:id_test", getComments);
router.get("/comments/:id_test/count", countComments);
router.post("/add-comment", addComment);
router.post("/comments/:id_comment/signal", signalComment);
router.get("/reported_comments", countReportedComments);
router.get("/comments", getAllComments);
router.delete("/comments/delete/:id", deleteComment);

export default router;
