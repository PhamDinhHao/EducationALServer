import express from "express";
import * as commentController from "../../controllers/comment.controller";
    
const router = express.Router();

router.get("/lessons/:lessonId/comments", commentController.getComments);
router.post("/lessons/:lessonId/comments", commentController.postComment);

export default router;
