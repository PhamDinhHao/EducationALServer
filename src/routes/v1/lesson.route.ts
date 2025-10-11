import express from "express";
import validate from "@/middlewares/validate";
import lessonValidation from "@/validations/lesson.validation";
import lessonController from "@/controllers/lesson.controller";
import upload from "@/middlewares/upload";

const router = express.Router();

router.post(
  "/generate",
  upload.single("file"),
  (req, res, next) => {
    if (req.body.periods) req.body.periods = Number(req.body.periods);
    next();
  },
  validate({ body: lessonValidation.generateLesson }),
  lessonController.generateLesson
);

export default router;
